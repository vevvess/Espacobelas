import { neon } from "@neondatabase/serverless";

// Configuração robusta para conectividade Neon
class NeonRobustConnection {
  private static instance: NeonRobustConnection;
  private clients: Array<{ client: any; config: string; isWorking: boolean }> = [];
  private activeClient: any = null;
  private lastSuccessfulConnection = 0;
  private connectionTimeout = 8000; // 8 segundos (mais rápido)
  private retryCount = 0;
  private maxRetries = 3; // Reduzir para 3 tentativas

  // URLs alternativas para fallback
  private connectionStrings = [
    import.meta.env.VITE_DATABASE_URL,
    "postgresql://neondb_owner:npg_XiMhD30dyHsj@ep-winter-term-a8165fiy-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
    "postgresql://neondb_owner:npg_XiMhD30dyHsj@ep-winter-term-a8165fiy.eastus2.azure.neon.tech/neondb?sslmode=require",
    "postgresql://neondb_owner:npg_XiMhD30dyHsj@ep-winter-term-a8165fiy-pooler.eastus2.azure.neon.tech/neondb?ssl=true",
    "postgresql://neondb_owner:npg_XiMhD30dyHsj@ep-winter-term-a8165fiy.eastus2.azure.neon.tech/neondb?ssl=true"
  ].filter(Boolean);

  constructor() {
    console.log('🔧 Inicializando sistema robusto de conectividade Neon');
    this.initializeClients();
  }

  static getInstance(): NeonRobustConnection {
    if (!NeonRobustConnection.instance) {
      NeonRobustConnection.instance = new NeonRobustConnection();
    }
    return NeonRobustConnection.instance;
  }

  private initializeClients() {
    console.log(`🔗 Configurando ${this.connectionStrings.length} strings de conexão`);
    
    for (const [index, connectionString] of this.connectionStrings.entries()) {
      // Configurações progressivamente mais agressivas
      const configs = [
        {
          name: `basic_${index}`,
          options: {
            fetchConnectionCache: false,
            fullResults: false,
            arrayMode: false,
          }
        },
        {
          name: `cached_${index}`,
          options: {
            fetchConnectionCache: true,
            fullResults: false,
            arrayMode: false,
          }
        },
        {
          name: `custom_fetch_${index}`,
          options: {
            fetchConnectionCache: false,
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
                  'Cache-Control': 'no-cache',
                  'Connection': 'keep-alive',
                  'Accept': 'application/json, text/plain, */*',
                  'User-Agent': 'NeonClient/2.0'
                },
                mode: 'cors',
                credentials: 'omit'
              }).finally(() => clearTimeout(timeoutId));
            }
          }
        }
      ];

      for (const config of configs) {
        try {
          const client = neon(connectionString, config.options);
          this.clients.push({
            client,
            config: config.name,
            isWorking: false
          });
          console.log(`✅ Cliente ${config.name} criado`);
        } catch (error) {
          console.warn(`❌ Erro ao criar cliente ${config.name}:`, error?.message);
        }
      }
    }
    
    console.log(`📊 Total de ${this.clients.length} clientes criados`);
  }

  private async testClient(clientInfo: any): Promise<boolean> {
    try {
      const startTime = Date.now();
      console.log(`🧪 Testando cliente ${clientInfo.config}...`);
      
      // Teste mais simples possível
      const result = await Promise.race([
        clientInfo.client`SELECT 1 as test`,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), 8000)
        )
      ]);
      
      const responseTime = Date.now() - startTime;
      
      if (result && result.length > 0 && result[0].test === 1) {
        console.log(`✅ Cliente ${clientInfo.config} funcionando (${responseTime}ms)`);
        clientInfo.isWorking = true;
        this.lastSuccessfulConnection = Date.now();
        return true;
      }
      
      console.warn(`⚠️ Cliente ${clientInfo.config} resposta inválida:`, result);
      return false;
      
    } catch (error) {
      console.warn(`❌ Cliente ${clientInfo.config} falhou:`, error?.message);
      clientInfo.isWorking = false;
      return false;
    }
  }

  private async findWorkingClient(): Promise<any> {
    console.log('🔍 Procurando cliente funcional...');
    
    // Se já temos um cliente ativo e foi usado recentemente, usar ele
    if (this.activeClient && (Date.now() - this.lastSuccessfulConnection) < 60000) {
      console.log('♻️ Usando cliente ativo existente');
      return this.activeClient;
    }

    // Testar clientes em paralelo para velocidade
    const testPromises = this.clients.map(async (clientInfo) => {
      const isWorking = await this.testClient(clientInfo);
      return { clientInfo, isWorking };
    });

    try {
      const results = await Promise.allSettled(testPromises);
      
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.isWorking) {
          this.activeClient = result.value.clientInfo.client;
          console.log(`🎯 Cliente ativo selecionado: ${result.value.clientInfo.config}`);
          return this.activeClient;
        }
      }
    } catch (error) {
      console.error('❌ Erro durante teste de clientes:', error);
    }

    console.error('❌ Nenhum cliente funcional encontrado');
    return null;
  }

  async executeQuery<T = any>(strings: TemplateStringsArray, ...values: any[]): Promise<T> {
    const query = strings[0]?.substring(0, 50) + '...';
    console.log(`🔄 Executando query: ${query}`);

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Encontrar cliente funcional
        const client = await this.findWorkingClient();
        
        if (!client) {
          throw new Error(`Nenhum cliente de banco disponível (tentativa ${attempt}/${this.maxRetries})`);
        }

        // Executar query com timeout
        const startTime = Date.now();
        const result = await Promise.race([
          client(strings, ...values),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), this.connectionTimeout)
          )
        ]);

        const responseTime = Date.now() - startTime;
        console.log(`✅ Query executada com sucesso (${responseTime}ms, tentativa ${attempt})`);
        
        this.retryCount = 0; // Reset contador em caso de sucesso
        return result as T;

      } catch (error) {
        const errorMessage = error?.message || 'Erro desconhecido';
        console.error(`❌ Query falhou (tentativa ${attempt}/${this.maxRetries}):`, errorMessage);

        // Se erro de rede, invalidar cliente ativo
        if (errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch') || errorMessage.includes('network')) {
          console.log('🔄 Erro de rede detectado - invalidando cliente ativo');
          this.activeClient = null;
        }

        // Se é a última tentativa, falhar
        if (attempt === this.maxRetries) {
          this.retryCount++;
          throw new Error(`Falha crítica após ${this.maxRetries} tentativas: ${errorMessage}`);
        }

        // Delay progressivo entre tentativas
        const delay = Math.min(1000 * attempt, 5000);
        console.log(`⏱️ Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Falha inesperada no loop de retry');
  }

  // Teste de conectividade espec��fico
  async healthCheck(): Promise<{ success: boolean; details?: any; error?: string }> {
    try {
      console.log('🏥 Executando health check...');
      
      const startTime = Date.now();
      const result = await this.executeQuery`SELECT 1 as health, NOW() as timestamp, version() as pg_version`;
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        details: {
          ...result[0],
          responseTime: `${responseTime}ms`,
          activeClients: this.clients.filter(c => c.isWorking).length,
          totalClients: this.clients.length,
          retryCount: this.retryCount
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Health check falhou',
        details: {
          retryCount: this.retryCount,
          totalClients: this.clients.length,
          workingClients: this.clients.filter(c => c.isWorking).length
        }
      };
    }
  }

  // Reset completo do sistema
  async reset(): Promise<void> {
    console.log('🔄 Executando reset completo do sistema...');
    
    this.activeClient = null;
    this.lastSuccessfulConnection = 0;
    this.retryCount = 0;
    
    // Marcar todos os clientes como não testados
    this.clients.forEach(client => {
      client.isWorking = false;
    });
    
    console.log('✅ Reset completo executado');
  }

  // Estatísticas do sistema
  getStats() {
    return {
      totalClients: this.clients.length,
      workingClients: this.clients.filter(c => c.isWorking).length,
      hasActiveClient: !!this.activeClient,
      lastSuccessfulConnection: this.lastSuccessfulConnection,
      retryCount: this.retryCount,
      timeSinceLastSuccess: Date.now() - this.lastSuccessfulConnection
    };
  }
}

// Instância singleton
const neonConnection = NeonRobustConnection.getInstance();

// Função principal para uso
export const sqlRobust = async <T = any>(strings: TemplateStringsArray, ...values: any[]): Promise<T> => {
  return neonConnection.executeQuery<T>(strings, ...values);
};

// Função de teste
export const testNeonConnection = async () => {
  return neonConnection.healthCheck();
};

// Reset do sistema
export const resetNeonConnection = async () => {
  return neonConnection.reset();
};

// Estatísticas
export const getNeonStats = () => {
  return neonConnection.getStats();
};

// Disponibilizar globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).testNeonConnection = testNeonConnection;
  (window as any).resetNeonConnection = resetNeonConnection;
  (window as any).getNeonStats = getNeonStats;
  (window as any).sqlRobust = sqlRobust;
  
  console.log('🔧 Neon Robust Connection Commands:');
  console.log('  - window.testNeonConnection()');
  console.log('  - window.resetNeonConnection()');
  console.log('  - window.getNeonStats()');
  console.log('  - window.sqlRobust');
}
