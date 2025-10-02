/**
 * Sistema Sempre Online - Tempo Real para Múltiplos Usuários
 * Prioriza conectividade sempre ativa e sincronização instantânea
 */

import { neon } from "@neondatabase/serverless";

// Configuração otimizada para sempre online
const ALWAYS_ONLINE_CONFIG = {
  // URLs de produção com diferentes regiões para alta disponibilidade
  urls: [
    "postgresql://neondb_owner:npg_XiMhD30dyHsj@ep-winter-term-a8165fiy-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
    "postgresql://neondb_owner:npg_XiMhD30dyHsj@ep-winter-term-a8165fiy.eastus2.azure.neon.tech/neondb?sslmode=require",
    import.meta.env.VITE_DATABASE_URL
  ].filter(Boolean),
  
  // Configuração agressiva para tempo real
  pollIntervalMs: 2000,          // 2 segundos para tempo real
  retryAttempts: 8,              // Mais tentativas
  retryDelayMs: 500,             // Delay menor para resposta rápida
  connectionTimeoutMs: 10000,    // Timeout menor
  healthCheckIntervalMs: 5000,   // Health check mais frequente
  maxConcurrentOps: 10,          // Operações simultâneas
  
  // Priorizar sempre online
  fallbackToOffline: false,      // NUNCA usar offline
  forceOnlineMode: true,         // Forçar modo online
  aggressiveRetry: true          // Retry agressivo
};

// Estado global do sistema sempre online
let systemState = {
  isOnline: false,
  currentUrlIndex: 0,
  healthyUrls: new Set<number>(),
  failedUrls: new Set<number>(),
  lastSuccessfulOp: 0,
  consecutiveFailures: 0,
  activeConnections: 0,
  totalOperations: 0,
  successfulOperations: 0
};

// Pool de clientes otimizados
const createProductionClient = (url: string, index: number) => {
  return neon(url, {
    fetchConnectionCache: true,  // Cache para performance
    fullResults: false,
    arrayMode: false,
    fetch: (url: string, options: any) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.warn(`⏰ Timeout na URL ${index + 1} após ${ALWAYS_ONLINE_CONFIG.connectionTimeoutMs}ms`);
      }, ALWAYS_ONLINE_CONFIG.connectionTimeoutMs);

      systemState.activeConnections++;

      return fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          'Accept': 'application/json',
          'User-Agent': `AlwaysOnline/1.0 Client-${index}`,
          'X-Request-ID': `req_${Date.now()}_${Math.random()}`,
          'Priority': 'high'  // Prioridade alta para requests
        },
        mode: 'cors',
        credentials: 'omit',
        keepalive: true,
        priority: 'high' as any  // Experimental: prioridade alta
      }).catch(fetchError => {
        // Log detalhado de erros de fetch
        console.error(`🔍 Fetch error na URL ${index + 1}:`, {
          url: url.substring(0, 50) + '...',
          error: fetchError?.message || 'Unknown fetch error',
          type: fetchError?.name || 'Unknown type',
          stack: fetchError?.stack?.split('\n')[0] || 'No stack'
        });

        // Re-throw para que seja tratado pela camada superior
        throw new Error(`Failed to fetch from URL ${index + 1}: ${fetchError?.message || 'Unknown error'}`);
      }).finally(() => {
        clearTimeout(timeoutId);
        systemState.activeConnections--;
      });
    }
  });
};

const clients = ALWAYS_ONLINE_CONFIG.urls.map(createProductionClient);

// Listeners para mudanças de conectividade
const connectivityListeners: Array<(online: boolean) => void> = [];

// Sistema de saúde proativa dos URLs
async function checkUrlHealth(urlIndex: number): Promise<boolean> {
  try {
    const startTime = Date.now();
    await Promise.race([
      clients[urlIndex]`SELECT 1 as health_check`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), 3000)
      )
    ]);
    
    const responseTime = Date.now() - startTime;
    systemState.healthyUrls.add(urlIndex);
    systemState.failedUrls.delete(urlIndex);
    
    console.log(`✅ URL ${urlIndex + 1} saudável (${responseTime}ms)`);
    return true;
    
  } catch (error) {
    systemState.healthyUrls.delete(urlIndex);
    systemState.failedUrls.add(urlIndex);
    
    console.warn(`❌ URL ${urlIndex + 1} com problemas:`, error?.message);
    return false;
  }
}

// Encontrar melhor URL disponível
async function findBestHealthyUrl(): Promise<number> {
  // Se URL atual está saudável, usar ela
  if (systemState.healthyUrls.has(systemState.currentUrlIndex)) {
    return systemState.currentUrlIndex;
  }
  
  // Tentar URLs saudáveis primeiro
  const healthyUrls = Array.from(systemState.healthyUrls);
  if (healthyUrls.length > 0) {
    const bestUrl = healthyUrls[0];
    systemState.currentUrlIndex = bestUrl;
    return bestUrl;
  }
  
  // Se nenhuma URL saudável, testar todas em paralelo
  console.log('🔍 Testando todas as URLs para encontrar a melhor...');
  
  const healthPromises = clients.map((_, index) => 
    checkUrlHealth(index).then(healthy => ({ index, healthy }))
  );
  
  try {
    const results = await Promise.allSettled(healthPromises);
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.healthy) {
        systemState.currentUrlIndex = result.value.index;
        return result.value.index;
      }
    }
  } catch (error) {
    console.error('❌ Erro ao testar URLs:', error);
  }
  
  // Último recurso: usar primeira URL
  systemState.currentUrlIndex = 0;
  return 0;
}

// Execução robusta com múltiplas estratégias
async function executeAlwaysOnline<T>(
  operation: (client: any) => Promise<T>,
  operationName: string = 'Database Operation'
): Promise<T> {
  systemState.totalOperations++;
  const operationId = `${operationName}_${Date.now()}`;
  
  let lastError: any;
  let attemptCount = 0;
  
  console.log(`🚀 Iniciando operação sempre online: ${operationName}`);

  // Verificação básica de conectividade
  if (!navigator.onLine) {
    console.warn('🌐 Navigator reporta offline, mas continuando tentativas...');
  }

  // Verificar se há URLs válidas
  if (clients.length === 0) {
    throw new Error('Nenhuma URL de banco de dados configurada');
  }

  while (attemptCount < ALWAYS_ONLINE_CONFIG.retryAttempts) {
    attemptCount++;
    
    try {
      // Encontrar melhor URL
      const bestUrlIndex = await findBestHealthyUrl();
      const client = clients[bestUrlIndex];
      
      console.log(`📡 Operação ${operationName} - Tentativa ${attemptCount} - URL ${bestUrlIndex + 1}`);
      
      // Verificar se o cliente existe e é válido
      if (!client) {
        throw new Error(`Cliente inválido para URL ${bestUrlIndex + 1}`);
      }

      // Executar operação com timeout e tratamento robusto
      const result = await Promise.race([
        (async () => {
          try {
            return await operation(client);
          } catch (opError) {
            // Log detalhado do erro da operação
            console.error(`🔍 Erro detalhado na operação:`, {
              operationName,
              attemptCount,
              urlIndex: bestUrlIndex + 1,
              error: opError?.message || 'Unknown error',
              stack: opError?.stack?.split('\n')[0] || 'No stack'
            });
            throw opError;
          }
        })(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Operation timeout')), ALWAYS_ONLINE_CONFIG.connectionTimeoutMs)
        )
      ]);
      
      // Sucesso!
      systemState.isOnline = true;
      systemState.lastSuccessfulOp = Date.now();
      systemState.consecutiveFailures = 0;
      systemState.successfulOperations++;
      
      // Notificar listeners sobre conectividade
      notifyConnectivityChange(true);
      
      console.log(`✅ ${operationName} bem-sucedida na tentativa ${attemptCount}`);
      return result;
      
    } catch (error) {
      lastError = error;
      const errorMsg = error?.message?.toLowerCase() || '';
      
      console.warn(`❌ ${operationName} falhou (tentativa ${attemptCount}):`, errorMsg);
      
      // Estratégias específicas de recovery
      if (errorMsg.includes('failed to fetch') || errorMsg.includes('network') || errorMsg.includes('fetch')) {
        // Problema de rede - marcar URL como não saudável
        systemState.healthyUrls.delete(systemState.currentUrlIndex);
        systemState.failedUrls.add(systemState.currentUrlIndex);

        console.error(`🚨 Failed to fetch detectado na URL ${systemState.currentUrlIndex + 1}:`, {
          url: ALWAYS_ONLINE_CONFIG.urls[systemState.currentUrlIndex],
          error: error?.message,
          attemptCount,
          totalFailures: systemState.consecutiveFailures + 1
        });

        // Tentar próxima URL imediatamente
        const nextUrlIndex = (systemState.currentUrlIndex + 1) % clients.length;
        systemState.currentUrlIndex = nextUrlIndex;
        console.log(`🔄 Mudando para URL ${nextUrlIndex + 1} devido a erro de rede`);

        // Se todos falharam, aguardar um pouco antes de tentar novamente
        if (systemState.failedUrls.size === clients.length) {
          console.warn('⚠️ Todas as URLs falharam, aguardando antes de tentar novamente...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          // Reset URLs para tentar novamente
          systemState.failedUrls.clear();
        }

      } else if (errorMsg.includes('timeout') || errorMsg.includes('abort')) {
        // Timeout - aguardar menos tempo
        const delay = ALWAYS_ONLINE_CONFIG.retryDelayMs * Math.min(attemptCount, 3);
        console.log(`⏱️ Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
      } else if (errorMsg.includes('stream') || errorMsg.includes('body')) {
        // Erro de stream - recriar cliente
        console.log('🔄 Recriando cliente devido a erro de stream...');
        clients[systemState.currentUrlIndex] = createProductionClient(
          ALWAYS_ONLINE_CONFIG.urls[systemState.currentUrlIndex], 
          systemState.currentUrlIndex
        );
        
      }
      
      systemState.consecutiveFailures++;
    }
  }
  
  // Se chegou aqui, todas as tentativas falharam
  systemState.isOnline = false;
  notifyConnectivityChange(false);

  console.error(`💥 ${operationName} falhou após ${ALWAYS_ONLINE_CONFIG.retryAttempts} tentativas`);
  console.error('🔍 Diagnóstico final:', {
    operationName,
    totalAttempts: attemptCount,
    lastError: lastError?.message,
    healthyUrls: Array.from(systemState.healthyUrls),
    failedUrls: Array.from(systemState.failedUrls),
    currentUrlIndex: systemState.currentUrlIndex,
    navigatorOnline: navigator.onLine
  });

  // Tentar criar um cliente básico como último recurso
  if (ALWAYS_ONLINE_CONFIG.urls.length > 0) {
    try {
      console.log('🆘 Tentando cliente básico como último recurso...');
      const basicClient = neon(ALWAYS_ONLINE_CONFIG.urls[0], {
        fetchConnectionCache: false,
        fullResults: false,
        arrayMode: false
      });

      const result = await basicClient`SELECT 1 as emergency_test`;
      console.log('✅ Cliente básico funcionou!');

      // Se o teste funcionou, tentar a operação original
      const finalResult = await operation(basicClient);
      systemState.isOnline = true;
      systemState.successfulOperations++;
      notifyConnectivityChange(true);

      console.log(`🆘✅ ${operationName} bem-sucedida com cliente básico`);
      return finalResult;

    } catch (emergencyError) {
      console.error('🆘❌ Cliente básico também falhou:', emergencyError?.message);
    }
  }

  throw new Error(`Sistema temporariamente indisponível: ${lastError?.message || 'Erro desconhecido'}. Verifique sua conexão com a internet.`);
}

// SQL sempre online
export async function sqlAlwaysOnline<T = any>(
  strings: TemplateStringsArray, 
  ...values: any[]
): Promise<T> {
  const query = strings[0]?.substring(0, 100) + '...';
  
  return executeAlwaysOnline(
    (client) => client(strings, ...values),
    `SQL: ${query}`
  );
}

// Agendamentos sempre online
export async function getAgendamentosAlwaysOnline(
  userId: string,
  dataInicio?: Date,
  dataFim?: Date
): Promise<any[]> {
  console.log('📋 Buscando agendamentos (sempre online)...', { userId, dataInicio, dataFim });

  try {
    // Verificar permissões
    const userPermissions = await sqlAlwaysOnline`
      SELECT id, username, is_admin, false::boolean as can_edit_all FROM users_simple WHERE id = ${userId}
    `;

    if (!userPermissions || userPermissions.length === 0) {
      throw new Error(`Usuário ${userId} não encontrado`);
    }

    const isAdmin = userPermissions[0]?.is_admin || false;
    const canEditAll = userPermissions[0]?.can_edit_all || false;
    const hasFullAccess = isAdmin || canEditAll;

    let result;
  
  if (hasFullAccess) {
    if (dataInicio && dataFim) {
      result = await sqlAlwaysOnline`
        SELECT a.*,
               c.nome as cliente_nome, c.telefone as cliente_telefone, c.tipo_cliente,
               s.nome as servico_nome, s.preco as servico_preco, s.duracao_minutos,
               u.nome as criado_por_nome, u.username as criado_por_username
        FROM agendamentos a
        JOIN clientes c ON a.cliente_id = c.id
        JOIN servicos s ON a.servico_id = s.id
        LEFT JOIN users_simple u ON a.user_simple_id = u.id
        WHERE a.data_hora BETWEEN ${dataInicio.toISOString()} AND ${dataFim.toISOString()}
        ORDER BY a.data_hora ASC, a.created_at DESC
      `;
    } else {
      result = await sqlAlwaysOnline`
        SELECT a.*,
               c.nome as cliente_nome, c.telefone as cliente_telefone, c.tipo_cliente,
               s.nome as servico_nome, s.preco as servico_preco, s.duracao_minutos,
               u.nome as criado_por_nome, u.username as criado_por_username
        FROM agendamentos a
        JOIN clientes c ON a.cliente_id = c.id
        JOIN servicos s ON a.servico_id = s.id
        LEFT JOIN users_simple u ON a.user_simple_id = u.id
        ORDER BY a.data_hora ASC, a.created_at DESC
      `;
    }
  } else {
    if (dataInicio && dataFim) {
      result = await sqlAlwaysOnline`
        SELECT a.*,
               c.nome as cliente_nome, c.telefone as cliente_telefone, c.tipo_cliente,
               s.nome as servico_nome, s.preco as servico_preco, s.duracao_minutos,
               u.nome as criado_por_nome, u.username as criado_por_username
        FROM agendamentos a
        JOIN clientes c ON a.cliente_id = c.id
        JOIN servicos s ON a.servico_id = s.id
        LEFT JOIN users_simple u ON a.user_simple_id = u.id
        WHERE (a.user_simple_id = ${userId}
               OR a.observacoes LIKE ${`%[FUNC:${userId}]%`}
               OR a.observacoes LIKE ${`%"funcionario_id":"${userId}"%`})
          AND a.data_hora BETWEEN ${dataInicio.toISOString()} AND ${dataFim.toISOString()}
        ORDER BY a.data_hora ASC, a.created_at DESC
      `;
    } else {
      result = await sqlAlwaysOnline`
        SELECT a.*,
               c.nome as cliente_nome, c.telefone as cliente_telefone, c.tipo_cliente,
               s.nome as servico_nome, s.preco as servico_preco, s.duracao_minutos,
               u.nome as criado_por_nome, u.username as criado_por_username
        FROM agendamentos a
        JOIN clientes c ON a.cliente_id = c.id
        JOIN servicos s ON a.servico_id = s.id
        LEFT JOIN users_simple u ON a.user_simple_id = u.id
        WHERE a.user_simple_id = ${userId}
               OR a.observacoes LIKE ${`%[FUNC:${userId}]%`}
               OR a.observacoes LIKE ${`%"funcionario_id":"${userId}"%`}
        ORDER BY a.data_hora ASC, a.created_at DESC
      `;
    }
  }

  const agendamentos = result.map((row: any) => ({
    id: row.id,
    user_simple_id: row.user_simple_id,
    cliente_id: row.cliente_id,
    servico_id: row.servico_id,
    funcionario_id: row.funcionario_id || null,
    data_hora: new Date(row.data_hora),
    status: row.status,
    observacoes: row.observacoes,
    valor: row.valor,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
    cliente: {
      nome: row.cliente_nome,
      telefone: row.cliente_telefone,
      tipo_cliente: row.tipo_cliente,
    },
    servico: {
      nome: row.servico_nome,
      preco: row.servico_preco,
      duracao_minutos: row.duracao_minutos,
    },
    funcionario: null,
  }));

    console.log(`✅ ${agendamentos.length} agendamentos carregados (sempre online)`);
    return agendamentos;

  } catch (error) {
    console.error('❌ Erro ao buscar agendamentos (sempre online):', {
      userId,
      dataInicio: dataInicio?.toISOString(),
      dataFim: dataFim?.toISOString(),
      error: error?.message || 'Erro desconhecido',
      stack: error?.stack?.split('\n')[0] || 'No stack'
    });

    // Re-throw com mensagem mais clara
    throw new Error(`Erro ao carregar agendamentos: ${error?.message || 'Verifique sua conexão'}`);
  }
}

// Criar agendamento sempre online
export async function createAgendamentoAlwaysOnline(
  userId: string,
  agendamentoData: {
    cliente_id: string;
    servico_id: string;
    data_hora: Date;
    observacoes?: string;
    valor?: number;
  }
): Promise<any> {
  console.log('📝 Criando agendamento (sempre online)...', agendamentoData);
  
  const data = {
    user_simple_id: userId,
    status: "agendado" as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...agendamentoData,
    data_hora: agendamentoData.data_hora.toISOString(),
  };

  const result = await sqlAlwaysOnline`
    INSERT INTO agendamentos (user_simple_id, cliente_id, servico_id, data_hora, status, observacoes, valor, created_at, updated_at)
    VALUES (${data.user_simple_id}, ${data.cliente_id}, ${data.servico_id}, ${data.data_hora}, ${data.status}, ${data.observacoes}, ${data.valor}, ${data.created_at}, ${data.updated_at})
    RETURNING *
  `;

  console.log('✅ Agendamento criado (sempre online):', result[0].id);
  return result[0];
}

// Atualizar agendamento sempre online
export async function updateAgendamentoAlwaysOnline(
  agendamentoId: string,
  userId: string,
  updates: Partial<{
    status: string;
    data_hora: Date;
    observacoes: string;
    valor: number;
    funcionario_id?: string;
    servico_id?: string;
  }>
): Promise<any> {
  console.log('📝 Atualizando agendamento (sempre online)...', { agendamentoId, updates });
  
  const data = {
    ...updates,
    data_hora: updates.data_hora ? updates.data_hora.toISOString() : undefined,
    updated_at: new Date().toISOString(),
  };

  const result = await sqlAlwaysOnline`
    UPDATE agendamentos
    SET status = COALESCE(${data.status}, status),
        data_hora = COALESCE(${data.data_hora}, data_hora),
        observacoes = COALESCE(${data.observacoes}, observacoes),
        valor = COALESCE(${data.valor}, valor),
        servico_id = COALESCE(${data.servico_id}, servico_id),
        updated_at = ${data.updated_at}
    WHERE id = ${agendamentoId}
    RETURNING *
  `;

  if (result.length === 0) {
    throw new Error("Agendamento não encontrado");
  }

  console.log('✅ Agendamento atualizado (sempre online):', agendamentoId);
  return result[0];
}

// Deletar agendamento sempre online
export async function deleteAgendamentoAlwaysOnline(
  agendamentoId: string,
  userId: string
): Promise<boolean> {
  console.log('🗑️ Deletando agendamento (sempre online)...', agendamentoId);

  await sqlAlwaysOnline`
    DELETE FROM agendamentos
    WHERE id = ${agendamentoId}
  `;

  console.log('✅ Agendamento deletado (sempre online):', agendamentoId);
  return true;
}

// Sistema de notificação de conectividade
function notifyConnectivityChange(online: boolean): void {
  if (systemState.isOnline !== online) {
    console.log(`📡 Conectividade mudou: ${online ? 'ONLINE' : 'OFFLINE'}`);
    connectivityListeners.forEach(listener => {
      try {
        listener(online);
      } catch (error) {
        console.error('Erro ao notificar listener:', error);
      }
    });
  }
}

// Adicionar listener de conectividade
export function onConnectivityChange(listener: (online: boolean) => void): () => void {
  connectivityListeners.push(listener);
  
  // Chamar imediatamente
  listener(systemState.isOnline);
  
  return () => {
    const index = connectivityListeners.indexOf(listener);
    if (index > -1) {
      connectivityListeners.splice(index, 1);
    }
  };
}

// Health check contínuo
async function continuousHealthCheck(): Promise<void> {
  try {
    const healthChecks = clients.map((_, index) => checkUrlHealth(index));
    await Promise.allSettled(healthChecks);
    
    // Log estado das URLs
    console.log(`📊 URLs saudáveis: ${Array.from(systemState.healthyUrls).map(i => i + 1).join(', ')}`);
    console.log(`📊 URLs com problemas: ${Array.from(systemState.failedUrls).map(i => i + 1).join(', ')}`);
    
  } catch (error) {
    console.warn('Erro no health check contínuo:', error);
  }
}

// Iniciar sistema de health check
setInterval(continuousHealthCheck, ALWAYS_ONLINE_CONFIG.healthCheckIntervalMs);

// Status do sistema
export function getAlwaysOnlineStatus() {
  return {
    ...systemState,
    healthyUrlsCount: systemState.healthyUrls.size,
    failedUrlsCount: systemState.failedUrls.size,
    totalUrls: clients.length,
    successRate: systemState.totalOperations > 0 
      ? (systemState.successfulOperations / systemState.totalOperations * 100).toFixed(2) 
      : '0.00',
    currentUrl: systemState.currentUrlIndex + 1,
    timeSinceLastSuccess: Date.now() - systemState.lastSuccessfulOp,
    config: ALWAYS_ONLINE_CONFIG
  };
}

// Debug global
if (typeof window !== 'undefined') {
  (window as any).alwaysOnlineService = {
    getStatus: getAlwaysOnlineStatus,
    testConnection: () => executeAlwaysOnline(
      (client) => client`SELECT 1 as test, NOW() as timestamp`, 
      'Connection Test'
    ),
    checkAllUrls: continuousHealthCheck,
    resetStats: () => {
      systemState.totalOperations = 0;
      systemState.successfulOperations = 0;
      systemState.consecutiveFailures = 0;
    }
  };
  
  console.log('🔧 Always Online Service Commands:');
  console.log('  - window.alwaysOnlineService.getStatus()');
  console.log('  - window.alwaysOnlineService.testConnection()');
  console.log('  - window.alwaysOnlineService.checkAllUrls()');
}

// Inicializar sistema
continuousHealthCheck();
