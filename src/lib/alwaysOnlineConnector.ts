import { neon, neonConfig, Pool } from "@neondatabase/serverless";
import { useState, useEffect } from 'react';
import { networkDetector } from './networkDetection';

// Sistema de conectividade sempre online sem fallbacks offline
// Forçar WebSocket seguro no navegador para evitar CORS/proxies
neonConfig.useSecureWebSocket = true;
neonConfig.forceWebSocket = true;
// Usar o WebSocket nativo do navegador (com guarda para ambientes sem DOM)
if (typeof WebSocket !== 'undefined') {
  neonConfig.webSocketConstructor = WebSocket;
}
class AlwaysOnlineConnector {
  private isConnected = false;
  private retryAttempts = 0;
  private maxRetries = 5;
  private baseRetryDelay = 1000; // 1 segundo
  private connectionListeners: Array<(connected: boolean) => void> = [];
  private cooldownUntil: number = 0;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private lastSuccessfulPing = Date.now();
  private pendingQueries = new Map<string, { resolve: Function; reject: Function; query: Function }>();
  private preferPool = false;
  private wsPool: Pool | null = null;

  private DATABASE_URL = 
    import.meta.env.VITE_DATABASE_URL ||
    "postgresql://neondb_owner:npg_XiMhD30dyHsj@ep-winter-term-a8165fiy-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";

  private primaryClient = neon(this.DATABASE_URL, {
    fetchConnectionCache: true,
    fullResults: false,
    arrayMode: false
  });

  private emergencyClient = neon(this.DATABASE_URL, {
    fetchConnectionCache: false,
    fullResults: false,
    arrayMode: false
  });

  constructor() {
    // Detect fetch monkey-patching (e.g., analytics) and prefer WS pool if detected
    try {
      const isBrowser = typeof window !== 'undefined';
      const fetchStr = isBrowser && typeof window.fetch === 'function' ? String(window.fetch) : '';
      // If not native code, likely patched; prefer Pool (pure WS path)
      this.preferPool = isBrowser && fetchStr && !fetchStr.includes('[native code]');
    } catch {}

    this.initializeClient();
    this.initializeConnection();
    this.startHealthCheck();
  }

  private async initializeConnection() {
    if (import.meta.env.MODE !== 'production') console.log('🔄 Inicializando conectividade sempre online...');
    await this.performConnectionTest();
  }

  private async performConnectionTest(): Promise<boolean> {
    try {
      const startTime = Date.now();
      const result = await Promise.race([
        this.poolQuery(`SELECT 1 as health_check, NOW() as server_time`) as any,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ]);

      const responseTime = Date.now() - startTime;
      if (import.meta.env.MODE !== 'production') console.log(`✅ Conectividade confirmada em ${responseTime}ms`);
      
      this.isConnected = true;
      this.retryAttempts = 0;
      this.lastSuccessfulPing = Date.now();
      this.notifyConnectionChange(true);
      
      // Processar queries pendentes
      this.processPendingQueries();
      
      return true;
    } catch (error) {
      if (import.meta.env.MODE !== 'production') console.warn(`❌ Teste de conectividade falhou:`, error?.message);
      this.isConnected = false;
      this.notifyConnectionChange(false);
      
      // Tentar reconexão automática
      this.scheduleReconnection();
      return false;
    }
  }

  private scheduleReconnection() {
    // Se estiver offline, aguardar voltar a ficar online antes de novas tentativas
    if (!networkDetector.getStatus()) {
      if (import.meta.env.MODE !== 'production') console.warn('🔴 Sem conex��o de rede - pausando reconexões até voltar online');
      setTimeout(() => this.performConnectionTest(), 10000);
      return;
    }

    // Respeitar cooldown para evitar loop agressivo de reconexão
    if (Date.now() < this.cooldownUntil) {
      const remaining = this.cooldownUntil - Date.now();
      if (import.meta.env.MODE !== 'production') console.log(`⏳ Em cooldown de reconexão por ${Math.ceil(remaining / 1000)}s`);
      setTimeout(() => this.performConnectionTest(), remaining);
      return;
    }

    if (this.retryAttempts >= this.maxRetries) {
      const cooldownMs = 20000;
      const secs = Math.ceil(cooldownMs / 1000);
      if (import.meta.env.MODE !== 'production') console.warn(`⏳ Limite de tentativas de reconexão atingido. Aguardando ${secs}s antes de tentar novamente...`);
      // Evitar reconexão agressiva em loop quando a rede está instável
      this.cooldownUntil = Date.now() + cooldownMs;
      this.retryAttempts = 0;
      setTimeout(() => this.performConnectionTest(), 20000);
      return;
    }

    this.retryAttempts++;
    const delay = this.baseRetryDelay * Math.pow(2, this.retryAttempts - 1); // Exponential backoff

    if (import.meta.env.MODE !== 'production') console.log(`⏱️ Agendando reconexão em ${delay}ms (tentativa ${this.retryAttempts}/${this.maxRetries})`);

    setTimeout(() => {
      if (import.meta.env.MODE !== 'production') console.log(`🔄 Tentativa de reconexão ${this.retryAttempts}...`);
      this.performConnectionTest();
    }, delay);
  }

  private async forceReconnection() {
    if (import.meta.env.MODE !== 'production') console.log('🚨 Executando reconexão forçada...');
    
    try {
      // Reset completo
      this.retryAttempts = 0;
      
      // Tentar com cliente emergencial
      if (import.meta.env.MODE !== 'production') console.log('🔄 Testando cliente emergencial...');
      const result = await Promise.race([
        this.emergencyClient`SELECT 1 as emergency_test, NOW() as server_time`,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Emergency timeout')), 3000)
        )
      ]);
      
      if (import.meta.env.MODE !== 'production') console.log('✅ Cliente emergencial funcionando, recriando cliente principal...');
      
      // Recriar cliente principal
      this.primaryClient = neon(this.DATABASE_URL, {
        fetchConnectionCache: true,
        fullResults: false,
        arrayMode: false
      });
      
      // Testar cliente principal renovado
      await this.performConnectionTest();
      
    } catch (error) {
      console.error('❌ Reconexão forçada falhou:', error?.message);
      
      // Último recurso: agendar nova tentativa
      setTimeout(() => {
        if (import.meta.env.MODE !== 'production') console.log('🔄 Última tentativa de reconexão...');
        this.forceReconnection();
      }, 5000);
    }
  }

  private startHealthCheck() {
    // Verificar conectividade a cada 60 segundos
    this.healthCheckInterval = setInterval(async () => {
      const timeSinceLastPing = Date.now() - this.lastSuccessfulPing;

      // Se está offline ou em cooldown, não testar
      if (!networkDetector.getStatus() || Date.now() < this.cooldownUntil) {
        return;
      }

      // Se mais de 2 minutos sem sucesso, forçar teste
      if (timeSinceLastPing > 120000) {
        if (import.meta.env.MODE !== 'production') console.log('⚠️ Muito tempo sem confirmação de conectividade, testando...');
        await this.performConnectionTest();
      }
    }, 60000);
  }

  private notifyConnectionChange(connected: boolean) {
    this.connectionListeners.forEach(listener => {
      try {
        listener(connected);
      } catch (error) {
        console.error('Erro ao notificar mudança de conectividade:', error);
      }
    });
  }

  private processPendingQueries() {
    if (!this.isConnected) return;
    
    if (import.meta.env.MODE !== 'production') console.log(`🔄 Processando ${this.pendingQueries.size} queries pendentes...`);
    
    for (const [queryId, { resolve, reject, query }] of this.pendingQueries) {
      query()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this.pendingQueries.delete(queryId);
        });
    }
  }

  private initializeClient() {
    this.primaryClient = neon(this.DATABASE_URL, {
      fetchConnectionCache: true,
      fullResults: false,
      arrayMode: false
    });
    this.emergencyClient = neon(this.DATABASE_URL, {
      fetchConnectionCache: false,
      fullResults: false,
      arrayMode: false
    });
    // Inicializar Pool único para reutilização via WebSocket
    if (!this.wsPool) {
      this.wsPool = new Pool({ connectionString: this.DATABASE_URL });
    }
  }

  // Fallback via WebSocket Pool para evitar fetch interceptors
  private async poolSql<T = any>(strings: TemplateStringsArray, ...values: any[]): Promise<T> {
    return this.poolQuery<T>(this.buildQueryText(strings, values), values);
  }

  private buildQueryText(strings: TemplateStringsArray, values: any[]): string {
    let text = strings[0] || '';
    for (let i = 0; i < values.length; i++) {
      text += `$${i + 1}${strings[i + 1] || ''}`;
    }
    return text;
  }

  private async poolQuery<T = any>(queryText: string, values: any[] = []): Promise<T> {
    if (!this.wsPool) {
      this.wsPool = new Pool({ connectionString: this.DATABASE_URL });
    }
    const res = await this.wsPool.query(queryText, values);
    return (res.rows as any) as T;
  }

  // Método principal para executar queries
  async executeQuery<T = any>(
    queryFn: () => Promise<T>,
    queryDescription = 'Database query'
  ): Promise<T> {
    // Se conectado, executar imediatamente
    if (this.isConnected) {
      try {
        let timeoutMs = 25000;
        let result: any;
        try {
          result = await Promise.race([
            queryFn(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), timeoutMs))
          ]);
        } catch (e: any) {
          const msg = (e && e.message) || '';
          if (msg.toLowerCase().includes('timeout')) {
            if (import.meta.env.MODE !== 'production') console.warn(`⏱️ Timeout na query. Tentando novamente com timeout estendido...`);
            timeoutMs += 10000;
            result = await Promise.race([
              queryFn(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), timeoutMs))
            ]);
          } else {
            throw e;
          }
        }
        this.lastSuccessfulPing = Date.now();
        return result as T;
      } catch (error) {
        let errorMsg = '';
        if (error instanceof Error) errorMsg = error.message;
        else if (typeof error === 'string') errorMsg = error;
        else if (error && typeof (error as any).message === 'string') errorMsg = (error as any).message;
        else if (error && (error as any).isTrusted) errorMsg = 'browser event (isTrusted)';
        if (import.meta.env.MODE !== 'production') console.error(`❌ Query falhou: ${queryDescription}`, errorMsg);

        // Handle body stream errors specifically
        if (errorMsg.includes('body stream already read') || errorMsg.includes('stream')) {
          if (import.meta.env.MODE !== 'production') console.error('🚨 Body stream error detectado - forçando reset de conexão');
          this.isConnected = false;
          this.notifyConnectionChange(false);
          this.initializeClient();
          setTimeout(() => {
            if (import.meta.env.MODE !== 'production') console.log('🔄 Tentando reconexão após reset de stream...');
            this.performConnectionTest();
          }, 5000);
        } else {
          this.isConnected = false;
          this.notifyConnectionChange(false);
          this.scheduleReconnection();
        }

        throw new Error(errorMsg || 'Falha na execução da query');
      }
    }

    // Se não conectado e sem internet, falhar rápido
    if (!networkDetector.getStatus()) {
      this.scheduleReconnection();
      throw new Error('Sem conexão de rede - Failed to fetch');
    }

    // Se não conectado mas há rede, tentar executar imediatamente com timeout curto
    try {
      let timeoutMs = 18000;
      let result: any;
      try {
        result = await Promise.race([
          queryFn(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), timeoutMs))
        ]);
      } catch (e: any) {
        const msg = (e && e.message) || '';
        if (msg.toLowerCase().includes('timeout')) {
          if (import.meta.env.MODE !== 'production') console.warn(`⏱️ Timeout (desconectado). Tentando novamente com timeout estendido...`);
          timeoutMs += 10000;
          result = await Promise.race([
            queryFn(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), timeoutMs))
          ]);
        } else {
          throw e;
        }
      }
      this.lastSuccessfulPing = Date.now();
      return result as T;
    } catch (error) {
      let errorMsg = '';
      if (error instanceof Error) errorMsg = error.message;
      else if (typeof error === 'string') errorMsg = error;
      else if (error && typeof (error as any).message === 'string') errorMsg = (error as any).message;
      else if (error && (error as any).isTrusted) errorMsg = 'browser event (isTrusted)';
      if (import.meta.env.MODE !== 'production') console.warn(`⚠️ Execução imediata falhou (desconectado): ${queryDescription}`, errorMsg);
      this.scheduleReconnection();
      throw new Error(errorMsg || 'Falha na execução (desconectado)');
    }
  }

  // Método público para executar queries SQL
  async sql<T = any>(strings: TemplateStringsArray, ...values: any[]): Promise<T> {
    return this.executeQuery(
      async () => {
        // Forçar exclusivamente Pool (WebSocket) para evitar qualquer uso de fetch
        return await this.poolSql<T>(strings, ...values);
      },
      `SQL: ${strings[0]?.substring(0, 50)}...`
    );
  }

  // Listeners para mudanças de conectividade
  onConnectionChange(listener: (connected: boolean) => void) {
    this.connectionListeners.push(listener);
    
    // Chamar imediatamente com estado atual
    listener(this.isConnected);
    
    return () => {
      const index = this.connectionListeners.indexOf(listener);
      if (index > -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }

  // Status da conectividade
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      retryAttempts: this.retryAttempts,
      lastSuccessfulPing: this.lastSuccessfulPing,
      pendingQueries: this.pendingQueries.size,
      timeSinceLastPing: Date.now() - this.lastSuccessfulPing
    };
  }

  // Forçar teste de conectividade
  async forceHealthCheck(): Promise<boolean> {
    console.log('🔄 Teste de conectividade forçado...');
    return this.performConnectionTest();
  }

  // Cleanup
  destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    this.connectionListeners.length = 0;

    // Rejeitar todas as queries pendentes
    for (const [queryId, { reject }] of this.pendingQueries) {
      reject(new Error('Connector destroyed'));
    }
    this.pendingQueries.clear();

    // Encerrar pool compartilhado
    if (this.wsPool) {
      try { this.wsPool.end(); } catch {}
      this.wsPool = null;
    }
  }
}

// Instância global
export const alwaysOnlineConnector = new AlwaysOnlineConnector();

// Hook para React components
export const useConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState(alwaysOnlineConnector.getConnectionStatus());

  useEffect(() => {
    const updateStatus = () => setStatus(alwaysOnlineConnector.getConnectionStatus());
    const unsubscribe = alwaysOnlineConnector.onConnectionChange((connected) => {
      setIsConnected(connected);
      updateStatus();
    });

    // Update inicial
    updateStatus();

    return unsubscribe;
  }, []);

  return {
    isConnected,
    ...status,
    forceHealthCheck: () => alwaysOnlineConnector.forceHealthCheck()
  };
};

// Função helper para queries
export const sqlAlwaysOnline = async <T = any>(strings: TemplateStringsArray, ...values: any[]): Promise<T> => {
  return alwaysOnlineConnector.sql<T>(strings, ...values);
};

// Disponibilizar globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).alwaysOnlineConnector = alwaysOnlineConnector;
  
  console.log('���� Always Online Connector Commands:');
  console.log('  - window.alwaysOnlineConnector.getConnectionStatus()');
  console.log('  - window.alwaysOnlineConnector.forceHealthCheck()');
}
