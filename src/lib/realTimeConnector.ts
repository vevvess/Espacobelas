import { neon } from "@neondatabase/serverless";
import { neon } from '@neondatabase/serverless';
import { useState, useEffect } from 'react';

/**
 * Sistema de conectividade em tempo real - Sempre Online
 * Elimina erros de "failed to fetch" com reconexão automática
 */
class RealTimeConnector {
  private static instance: RealTimeConnector;
  private client: any = null;
  private isConnected = false;
  private connectionListeners: Array<(connected: boolean) => void> = [];
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private pendingOperations = new Map<string, { resolve: Function; reject: Function; operation: Function }>();
  private lastSuccessfulOperation = Date.now();
  private operationInProgress = false; // Prevenir operações simultâneas
  private currentUrlIndex = 0;
  private retryCount = 0;
  private maxRetries = 3;

  // URLs alternativas para conectividade robusta
  private readonly DATABASE_URLS = [
    import.meta.env.VITE_DATABASE_URL,
    "postgresql://neondb_owner:npg_XiMhD30dyHsj@ep-winter-term-a8165fiy-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
    "postgresql://neondb_owner:npg_XiMhD30dyHsj@ep-winter-term-a8165fiy.eastus2.azure.neon.tech/neondb?sslmode=require",
    "postgresql://neondb_owner:npg_XiMhD30dyHsj@ep-winter-term-a8165fiy-pooler.eastus2.azure.neon.tech/neondb?ssl=true"
  ].filter(Boolean);

  constructor() {
    this.initializeClient();
    this.startHealthMonitoring();
  }

  static getInstance(): RealTimeConnector {
    if (!RealTimeConnector.instance) {
      RealTimeConnector.instance = new RealTimeConnector();
    }
    return RealTimeConnector.instance;
  }

  private initializeClient() {
    const currentUrl = this.DATABASE_URLS[this.currentUrlIndex];
    console.log(`🚀 Inicializando cliente em tempo real (URL ${this.currentUrlIndex + 1}/${this.DATABASE_URLS.length})...`);

    try {
      // Configuração robusta com timeout customizado
      this.client = neon(currentUrl, {
        fetchConnectionCache: false, // Desabilitar cache para evitar stream conflicts
        fullResults: false,
        arrayMode: false,
        fetch: (url: string, options: any) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

          return fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
              ...options.headers,
              'Connection': 'keep-alive',
              'Accept': 'application/json',
            },
            mode: 'cors',
            credentials: 'omit'
          }).finally(() => clearTimeout(timeoutId));
        }
      });

      this.performHealthCheck();
    } catch (error) {
      console.error(`❌ Erro ao criar cliente com URL ${this.currentUrlIndex + 1}:`, error);
      this.tryNextUrl();
    }
  }

  private tryNextUrl() {
    this.currentUrlIndex = (this.currentUrlIndex + 1) % this.DATABASE_URLS.length;
    console.log(`🔄 Tentando próxima URL (${this.currentUrlIndex + 1}/${this.DATABASE_URLS.length})...`);

    setTimeout(() => {
      this.initializeClient();
    }, 1000); // Delay de 1s entre tentativas
  }

  private async performHealthCheck(): Promise<boolean> {
    try {
      // Prevenir health checks simultâneos
      if (this.operationInProgress) {
        console.log('⏳ Health check em andamento, aguardando...');
        return this.isConnected;
      }

      this.operationInProgress = true;
      const startTime = Date.now();

      // Health check mais simples e robusto
      const result = await Promise.race([
        this.client`SELECT 1 as health`,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), 10000)
        )
      ]);

      const responseTime = Date.now() - startTime;

      if (result && result.length > 0 && result[0].health === 1) {
        console.log(`✅ Conectividade confirmada (${responseTime}ms) - URL ${this.currentUrlIndex + 1}`);
        this.isConnected = true;
        this.lastSuccessfulOperation = Date.now();
        this.notifyConnectionChange(true);
        this.processPendingOperations();
        return true;
      }
    } catch (error) {
      const errorStr = error?.message?.toLowerCase() || '';
      console.warn(`❌ Health check falhou (URL ${this.currentUrlIndex + 1}):`, error?.message);

      // Estratégias de recovery baseadas no erro
      if (errorStr.includes('failed to fetch') || errorStr.includes('network')) {
        console.log('🔄 Erro de rede - tentando próxima URL...');
        this.tryNextUrl();
        return false; // Não agendar reconexão, tryNextUrl já fará isso

      } else if (errorStr.includes('body stream already read') || errorStr.includes('stream')) {
        console.log('🔄 Erro de stream - recriando cliente...');
        this.initializeClient();
        return false;

      } else if (errorStr.includes('timeout') || errorStr.includes('abort')) {
        console.log('🔄 Timeout/abort - tentando reconexão...');
        // Continuar para agendamento normal de reconexão
      }
    } finally {
      this.operationInProgress = false;
    }

    this.isConnected = false;
    this.notifyConnectionChange(false);
    this.scheduleReconnection();
    return false;
  }

  private scheduleReconnection() {
    const timeSinceLastSuccess = Date.now() - this.lastSuccessfulOperation;
    const reconnectionDelay = Math.min(5000 + timeSinceLastSuccess / 10, 30000); // Max 30s
    
    console.log(`⏱️ Agendando reconexão em ${reconnectionDelay}ms`);
    
    setTimeout(() => {
      console.log('🔄 Tentando reconexão...');
      this.performHealthCheck();
    }, reconnectionDelay);
  }

  private startHealthMonitoring() {
    // Monitorar conectividade a cada 15 segundos
    this.healthCheckInterval = setInterval(() => {
      const timeSinceLastSuccess = Date.now() - this.lastSuccessfulOperation;
      
      // Se mais de 30 segundos sem sucesso, forçar verificação
      if (timeSinceLastSuccess > 30000) {
        console.log('⚠️ Verificação de conectividade forçada...');
        this.performHealthCheck();
      }
    }, 15000);
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

  private processPendingOperations() {
    if (!this.isConnected || this.pendingOperations.size === 0) return;
    
    console.log(`🔄 Processando ${this.pendingOperations.size} operações pendentes...`);
    
    const operations = Array.from(this.pendingOperations.entries());
    this.pendingOperations.clear();
    
    for (const [operationId, { resolve, reject, operation }] of operations) {
      operation()
        .then((result: any) => {
          this.lastSuccessfulOperation = Date.now();
          resolve(result);
        })
        .catch((error: any) => {
          console.error(`❌ Operação ${operationId} falhou:`, error?.message);
          reject(error);
        });
    }
  }

  async execute<T = any>(
    operation: () => Promise<T>,
    operationDescription = 'Database operation'
  ): Promise<T> {
    // Retry loop com múltiplas estratégias
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Prevenir operações simultâneas
        if (this.operationInProgress) {
          console.log(`⏳ Operação em andamento, aguardando: ${operationDescription}`);
          await new Promise(resolve => setTimeout(resolve, 200));
          continue;
        }

        this.operationInProgress = true;

        // Se não conectado, tentar reconectar primeiro
        if (!this.isConnected) {
          console.log(`🔄 Tentando conectar antes da operação (tentativa ${attempt}/${this.maxRetries})...`);
          await this.performHealthCheck();

          if (!this.isConnected) {
            throw new Error('Sem conectividade disponível');
          }
        }

        const result = await operation();
        this.lastSuccessfulOperation = Date.now();
        this.retryCount = 0;

        console.log(`✅ ${operationDescription} executada com sucesso (tentativa ${attempt})`);
        return result;

      } catch (error) {
        const errorStr = error?.message?.toLowerCase() || '';
        console.error(`❌ ${operationDescription} falhou (tentativa ${attempt}/${this.maxRetries}):`, error?.message);

        // Estratégias baseadas no tipo de erro
        if (errorStr.includes('failed to fetch') || errorStr.includes('network') || errorStr.includes('timeout')) {
          console.log('🔄 Erro de rede - tentando URL alternativa...');
          this.isConnected = false;
          this.notifyConnectionChange(false);
          this.tryNextUrl();

        } else if (errorStr.includes('body stream already read') || errorStr.includes('stream')) {
          console.log('🔄 Erro de stream - recriando cliente...');
          this.initializeClient();
          this.isConnected = false;
          this.notifyConnectionChange(false);

        } else if (errorStr.includes('abort')) {
          console.log('🔄 Operação abortada - tentando novamente...');
          this.isConnected = false;
          this.notifyConnectionChange(false);
        }

        // Se última tentativa, falhar
        if (attempt === this.maxRetries) {
          this.retryCount++;
          throw new Error(`Falha após ${this.maxRetries} tentativas: ${error?.message}`);
        }

        // Delay progressivo entre tentativas
        const delay = Math.min(1000 * attempt, 5000);
        console.log(`⏱️ Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));

      } finally {
        this.operationInProgress = false;
      }
    }

    throw new Error('Falha inesperada no loop de retry');
  }

  // Método principal para SQL
  async sql<T = any>(strings: TemplateStringsArray, ...values: any[]): Promise<T> {
    const queryPreview = strings[0]?.substring(0, 50) + '...';
    
    return this.execute(
      () => this.client(strings, ...values),
      `SQL: ${queryPreview}`
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
  getStatus() {
    return {
      isConnected: this.isConnected,
      lastSuccessfulOperation: this.lastSuccessfulOperation,
      pendingOperations: this.pendingOperations.size,
      timeSinceLastSuccess: Date.now() - this.lastSuccessfulOperation
    };
  }

  // Forçar reconexão
  async forceReconnection(): Promise<boolean> {
    console.log('🔄 Reconexão forçada...');
    this.isConnected = false;
    return this.performHealthCheck();
  }

  // Cleanup
  destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    this.connectionListeners.length = 0;
    
    // Rejeitar todas as operações pendentes
    for (const [operationId, { reject }] of this.pendingOperations) {
      reject(new Error('Connector destroyed'));
    }
    this.pendingOperations.clear();
  }
}

// Instância global - protegida contra múltiplas criações
let globalConnector: RealTimeConnector | null = null;

export const realTimeConnector = (() => {
  if (!globalConnector) {
    console.log('🔧 Criando instância única do RealTimeConnector...');
    globalConnector = RealTimeConnector.getInstance();
  }
  return globalConnector;
})();

// Hook para React
export const useRealTimeConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState(realTimeConnector.getStatus());

  useEffect(() => {
    const updateStatus = () => setStatus(realTimeConnector.getStatus());
    
    const unsubscribe = realTimeConnector.onConnectionChange((connected) => {
      setIsConnected(connected);
      updateStatus();
    });

    // Update inicial e intervalo para status
    updateStatus();
    const statusInterval = setInterval(updateStatus, 5000);

    return () => {
      unsubscribe();
      clearInterval(statusInterval);
    };
  }, []);

  return {
    isConnected,
    ...status,
    forceReconnection: () => realTimeConnector.forceReconnection()
  };
};

// Função SQL principal para uso global
export const sqlRealTime = async <T = any>(strings: TemplateStringsArray, ...values: any[]): Promise<T> => {
  return realTimeConnector.sql<T>(strings, ...values);
};

// Debug global
if (typeof window !== 'undefined') {
  (window as any).realTimeConnector = realTimeConnector;
  
  console.log('🔧 Real-Time Connector Commands:');
  console.log('  - window.realTimeConnector.getStatus()');
  console.log('  - window.realTimeConnector.forceReconnection()');
}
