import { neon } from "@neondatabase/serverless";

// Múltiplas URLs de conexão para fallback
const DATABASE_URLS = [
  import.meta.env.VITE_DATABASE_URL,
  "postgresql://neondb_owner:npg_XiMhD30dyHsj@ep-winter-term-a8165fiy-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
  "postgresql://neondb_owner:npg_XiMhD30dyHsj@ep-winter-term-a8165fiy.eastus2.azure.neon.tech/neondb?sslmode=require"
].filter(Boolean);

console.log('🔗 URLs de conexão disponíveis:', DATABASE_URLS.length);
console.log('🔗 URL principal:', DATABASE_URLS[0]?.replace(/:[^:@]*@/, ':***@'));

// Múltiplos clientes com diferentes configurações
const createClients = () => {
  const configs = [
    { fetchConnectionCache: false, fullResults: false, arrayMode: false },
    { fetchConnectionCache: true, fullResults: false, arrayMode: false },
    { fetchConnectionCache: false, fullResults: true, arrayMode: false }
  ];

  const clients: any[] = [];

  for (const url of DATABASE_URLS) {
    for (const config of configs) {
      try {
        clients.push({
          client: neon(url, {
            ...config,
            // Adicionar timeout customizado
            fetch: (url: string, options: any) => {
              return fetch(url, {
                ...options,
                signal: AbortSignal.timeout(10000), // 10s timeout
                headers: {
                  ...options.headers,
                  'User-Agent': 'Neon-Serverless-Client/1.0'
                }
              });
            }
          }),
          url: url.replace(/:[^:@]*@/, ':***@'),
          config
        });
      } catch (error) {
        console.warn('❌ Erro ao criar cliente:', error?.message);
      }
    }
  }

  return clients;
};

const clients = createClients();
console.log(`✅ ${clients.length} clientes criados`);

// Função para testar conectividade de um cliente específico
const testSingleClient = async (clientInfo: any) => {
  try {
    const startTime = Date.now();
    const result = await clientInfo.client`SELECT 1 as test, NOW() as current_time`;
    const responseTime = Date.now() - startTime;

    console.log(`✅ Cliente funcionando (${responseTime}ms):`, {
      url: clientInfo.url,
      config: clientInfo.config
    });

    return { success: true, client: clientInfo.client, responseTime, result: result[0] };
  } catch (error) {
    console.warn(`❌ Cliente falhou:`, {
      url: clientInfo.url,
      error: error?.message
    });
    return { success: false, error: error?.message };
  }
};

// Encontrar o melhor cliente disponível
let workingClient: any = null;
let isTestingClients = false;

const findWorkingClient = async () => {
  if (isTestingClients || workingClient) return workingClient;

  isTestingClients = true;
  console.log('🔍 Testando clientes disponíveis...');

  try {
    for (const clientInfo of clients) {
      const result = await testSingleClient(clientInfo);
      if (result.success) {
        workingClient = clientInfo.client;
        console.log('🎯 Cliente ativo encontrado!');
        return workingClient;
      }
    }

    console.error('❌ Nenhum cliente funcionando!');
    return null;
  } finally {
    isTestingClients = false;
  }
};

// Wrapper robusto com múltiplos clientes e retry
export const sqlDirect = async (strings: TemplateStringsArray, ...values: any[]) => {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 SQL direto (tentativa ${attempt}):`, strings[0]?.substring(0, 50) + '...');

      // Tentar usar cliente existente ou encontrar um novo
      let client = workingClient;
      if (!client) {
        client = await findWorkingClient();
      }

      if (!client) {
        throw new Error('Nenhum cliente de banco de dados disponível');
      }

      const startTime = Date.now();
      const result = await client(strings, ...values);
      const responseTime = Date.now() - startTime;

      console.log(`✅ SQL direto sucesso (tentativa ${attempt}, ${responseTime}ms):`, result?.length || 0, 'resultados');
      return result;

    } catch (error) {
      lastError = error;
      const errorMsg = error?.message || 'Erro desconhecido';
      console.error(`❌ SQL direto falha (tentativa ${attempt}):`, errorMsg);

      // Se erro de conectividade, resetar cliente e tentar outro
      if (errorMsg.includes('fetch') || errorMsg.includes('Failed to fetch') || errorMsg.includes('network')) {
        console.log('🔄 Erro de conectividade - resetando cliente...');
        workingClient = null;

        // Na próxima tentativa, tentar encontrar outro cliente
        if (attempt < maxRetries) {
          await findWorkingClient();
        }
      }

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * attempt, 5000); // Máximo 5s
        console.log(`⏱️ Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Se todas as tentativas falharam, tentar uma última vez com configuração básica
  console.log('🚨 Última tentativa com configuração de emergência...');
  try {
    const emergencyClient = neon(DATABASE_URLS[0], {
      fetchConnectionCache: false,
      fullResults: false,
      arrayMode: false
    });

    const result = await emergencyClient(strings, ...values);
    console.log('✅ Cliente de emergência funcionou!');
    workingClient = emergencyClient;
    return result;

  } catch (emergencyError) {
    console.error('❌ Cliente de emergência também falhou:', emergencyError?.message);
  }

  throw new Error(`Falha crítica na conexão após ${maxRetries} tentativas: ${lastError?.message}`);
};

// Função de teste abrangente
export const testDirectConnection = async () => {
  try {
    console.log('🔍 Iniciando teste de conectividade...');

    // Teste 1: Query básica
    const basicResult = await sqlDirect`SELECT 1 as test, NOW() as current_time`;
    console.log('✅ Teste básico funcionando:', basicResult[0]);

    // Teste 2: Verificar estrutura do banco
    const tablesResult = await sqlDirect`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      LIMIT 5
    `;
    console.log('✅ Tabelas encontradas:', tablesResult.map(t => t.table_name));

    return {
      success: true,
      data: basicResult[0],
      tables: tablesResult.map(t => t.table_name),
      message: 'Conectividade confirmada'
    };
  } catch (error) {
    console.error('❌ Teste de conectividade falhou:', error);
    return {
      success: false,
      error: error?.message,
      details: 'Problema na conectividade com o banco de dados'
    };
  }
};

// Função para diagnosticar problemas de rede
export const diagnoseDatabaseConnectivity = async () => {
  console.log('🔍 Executando diagnóstico completo...');

  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      hasEnvVar: !!import.meta.env.VITE_DATABASE_URL,
      urlCount: DATABASE_URLS.length,
      clientCount: clients.length
    },
    tests: {
      basic: null,
      allClients: []
    }
  };

  // Teste básico
  try {
    diagnostics.tests.basic = await testDirectConnection();
  } catch (error) {
    diagnostics.tests.basic = { success: false, error: error?.message };
  }

  // Teste de todos os clientes
  for (let i = 0; i < Math.min(clients.length, 5); i++) {
    const clientTest = await testSingleClient(clients[i]);
    diagnostics.tests.allClients.push({
      index: i,
      url: clients[i].url,
      config: clients[i].config,
      result: clientTest
    });
  }

  console.log('📋 Diagnóstico completo:', diagnostics);
  return diagnostics;
};

// Disponibilizar globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).testDirectConnection = testDirectConnection;
  (window as any).diagnoseDatabaseConnectivity = diagnoseDatabaseConnectivity;
  (window as any).sqlDirect = sqlDirect;
  (window as any).findWorkingClient = findWorkingClient;

  console.log('🔧 Comandos de debug disponíveis:');
  console.log('  - window.testDirectConnection()');
  console.log('  - window.diagnoseDatabaseConnectivity()');
  console.log('  - window.findWorkingClient()');
  console.log('  - window.sqlDirect');

  // Inicializar cliente automaticamente
  setTimeout(() => {
    console.log('🚀 Inicializando cliente automaticamente...');
    findWorkingClient().then(client => {
      if (client) {
        console.log('✅ Cliente inicializado com sucesso');
      } else {
        console.warn('⚠️ Nenhum cliente disponível na inicialização');
      }
    });
  }, 1000);
}
