import { realTimeConnector } from "@/lib/realTimeConnector";
import { addTimestamps } from "@/lib/neon";
import { toLocalISOString } from "@/lib/dateUtils";

/**
 * Serviço de agendamentos sempre online - sem fallbacks offline
 * Focado em operações em tempo real para múltiplos usuários
 */

// Função otimizada para buscar agendamentos em tempo real
export async function getAgendamentosRealTime(
  userId: string,
  dataInicio?: Date,
  dataFim?: Date
): Promise<any[]> {
  console.log('📋 Buscando agendamentos em tempo real...', { userId, dataInicio, dataFim });

  try {
    let query;
    const baseSelect = `
      SELECT a.*,
             c.nome as cliente_nome, c.telefone as cliente_telefone, c.tipo_cliente,
             s.nome as servico_nome, s.preco as servico_preco, s.duracao_minutos,
             u.nome as criado_por_nome, u.username as criado_por_username
      FROM agendamentos a
      JOIN clientes c ON a.cliente_id = c.id
      JOIN servicos s ON a.servico_id = s.id
      LEFT JOIN users_simple u ON a.user_simple_id = u.id
    `;

    // Verificar permissões do usuário
    const userPermissions = await realTimeConnector.sql`
      SELECT id, username, is_admin, false::boolean as can_edit_all FROM users_simple WHERE id = ${userId}
    `;

    const isAdmin = userPermissions[0]?.is_admin || false;
    const canEditAll = userPermissions[0]?.can_edit_all || false;
    const hasFullAccess = isAdmin || canEditAll;

    if (hasFullAccess) {
      // Admin: ver todos os agendamentos
      if (dataInicio && dataFim) {
        query = realTimeConnector.sql`
          SELECT a.*,
                 c.nome as cliente_nome, c.telefone as cliente_telefone, c.tipo_cliente,
                 s.nome as servico_nome, s.preco as servico_preco, s.duracao_minutos,
                 u.nome as criado_por_nome, u.username as criado_por_username
          FROM agendamentos a
          JOIN clientes c ON a.cliente_id = c.id
          JOIN servicos s ON a.servico_id = s.id
          LEFT JOIN users_simple u ON a.user_simple_id = u.id
          WHERE a.data_hora BETWEEN ${dataInicio.toISOString()} AND ${dataFim.toISOString()}
          ORDER BY a.data_hora ASC
        `;
      } else {
        query = realTimeConnector.sql`
          SELECT a.*,
                 c.nome as cliente_nome, c.telefone as cliente_telefone, c.tipo_cliente,
                 s.nome as servico_nome, s.preco as servico_preco, s.duracao_minutos,
                 u.nome as criado_por_nome, u.username as criado_por_username
          FROM agendamentos a
          JOIN clientes c ON a.cliente_id = c.id
          JOIN servicos s ON a.servico_id = s.id
          LEFT JOIN users_simple u ON a.user_simple_id = u.id
          ORDER BY a.data_hora ASC
        `;
      }
    } else {
      // Staff: ver apenas seus agendamentos e atribuições
      if (dataInicio && dataFim) {
        query = realTimeConnector.sql`
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
          ORDER BY a.data_hora ASC
        `;
      } else {
        query = realTimeConnector.sql`
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
          ORDER BY a.data_hora ASC
        `;
      }
    }

    const result = await query;
    
    console.log(`✅ ${result.length} agendamentos carregados em tempo real`);
    
    return result.map((row: any) => ({
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
      funcionario: null, // Temporariamente null até migração
    }));

  } catch (error) {
    console.error('❌ Erro ao buscar agendamentos em tempo real:', error);

    // Fallback para sistema antigo se RealTime falhar completamente
    const errorStr = error?.message?.toLowerCase() || '';
    if (errorStr.includes('failed to fetch') || errorStr.includes('network')) {
      console.log('🔄 Tentando fallback para sistema legado...');

      try {
        const { getAgendamentosWithFuncionario } = await import('@/services/agendamentoServiceImproved');
        const fallbackData = await getAgendamentosWithFuncionario(userId, dataInicio, dataFim);
        console.log('✅ Fallback bem-sucedido, retornando dados legados');
        return fallbackData;
      } catch (fallbackError) {
        console.error('❌ Fallback também falhou:', fallbackError);
      }
    }

    throw new Error(`Falha na busca em tempo real: ${error?.message || 'Erro desconhecido'}`);
  }
}

// Criar agendamento em tempo real
export async function createAgendamentoRealTime(
  userId: string,
  agendamentoData: {
    cliente_id: string;
    servico_id: string;
    data_hora: Date;
    observacoes?: string;
    valor?: number;
  }
): Promise<any> {
  console.log('📝 Criando agendamento em tempo real...', agendamentoData);

  try {
    const data = addTimestamps({
      user_simple_id: userId,
      status: "agendado",
      ...agendamentoData,
      data_hora: toLocalISOString(agendamentoData.data_hora),
    });

    const result = await realTimeConnector.sql`
      INSERT INTO agendamentos (user_simple_id, cliente_id, servico_id, data_hora, status, observacoes, valor, created_at, updated_at)
      VALUES (${data.user_simple_id}, ${data.cliente_id}, ${data.servico_id}, ${data.data_hora}, ${data.status}, ${data.observacoes}, ${data.valor}, ${data.created_at}, ${data.updated_at})
      RETURNING *
    `;

    console.log('✅ Agendamento criado em tempo real:', result[0].id);
    return result[0];

  } catch (error) {
    console.error('❌ Erro ao criar agendamento em tempo real:', error);
    throw new Error(`Falha na criação: ${error?.message || 'Erro desconhecido'}`);
  }
}

// Atualizar agendamento em tempo real
export async function updateAgendamentoRealTime(
  agendamentoId: string,
  userId: string,
  agendamentoData: Partial<{
    status: string;
    data_hora: Date;
    observacoes: string;
    valor: number;
    funcionario_id?: string;
    servico_id?: string;
  }>
): Promise<any> {
  console.log('📝 Atualizando agendamento em tempo real...', { agendamentoId, updates: agendamentoData });

  try {
    // Verificar permissões
    const userPermissions = await realTimeConnector.sql`
      SELECT id, username, is_admin, false::boolean as can_edit_all FROM users_simple WHERE id = ${userId}
    `;

    const isAdmin = userPermissions[0]?.is_admin || false;
    const canEditAll = userPermissions[0]?.can_edit_all || false;
    const hasFullAccess = isAdmin || canEditAll;

    // Verificar agendamento existente
    const existingAgendamento = await realTimeConnector.sql`
      SELECT id, user_simple_id, status, observacoes
      FROM agendamentos
      WHERE id = ${agendamentoId}
    `;

    if (existingAgendamento.length === 0) {
      throw new Error("Agendamento não encontrado");
    }

    const agendamento = existingAgendamento[0];
    const isCreator = agendamento.user_simple_id === userId;

    // Verificar funcionário atribuído
    const isAssignedFuncionario = agendamento.observacoes &&
      (agendamento.observacoes.includes(`[FUNC:${userId}]`) ||
       agendamento.observacoes.includes(`"funcionario_id":"${userId}"`));

    // Verificar permissão
    if (!hasFullAccess && !isCreator && !isAssignedFuncionario) {
      throw new Error("Permissão negada para atualizar este agendamento");
    }

    // Preparar dados
    const data = addTimestamps(
      {
        ...agendamentoData,
        data_hora: agendamentoData.data_hora
          ? toLocalISOString(agendamentoData.data_hora)
          : undefined,
      },
      true,
    );

    // Atualizar
    const result = await realTimeConnector.sql`
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
      throw new Error("Falha ao atualizar agendamento");
    }

    console.log('✅ Agendamento atualizado em tempo real:', agendamentoId);
    return result[0];

  } catch (error) {
    console.error('❌ Erro ao atualizar agendamento em tempo real:', error);
    throw new Error(`Falha na atualização: ${error?.message || 'Erro desconhecido'}`);
  }
}

// Deletar agendamento em tempo real
export async function deleteAgendamentoRealTime(
  agendamentoId: string,
  userId: string
): Promise<boolean> {
  console.log('🗑️ Deletando agendamento em tempo real...', agendamentoId);

  try {
    // Verificar permissões
    const userPermissions = await realTimeConnector.sql`
      SELECT id, username, is_admin, false::boolean as can_edit_all FROM users_simple WHERE id = ${userId}
    `;

    const isAdmin = userPermissions[0]?.is_admin || false;
    const canEditAll = userPermissions[0]?.can_edit_all || false;
    const hasFullAccess = isAdmin || canEditAll;

    // Verificar agendamento
    const existingAgendamento = await realTimeConnector.sql`
      SELECT id, user_simple_id, status
      FROM agendamentos
      WHERE id = ${agendamentoId}
    `;

    if (existingAgendamento.length === 0) {
      throw new Error("Agendamento não encontrado");
    }

    // Verificar permissão
    if (!hasFullAccess && existingAgendamento[0].user_simple_id !== userId) {
      throw new Error("Permissão negada");
    }

    // Deletar
    await realTimeConnector.sql`
      DELETE FROM agendamentos
      WHERE id = ${agendamentoId}
    `;

    console.log('✅ Agendamento deletado em tempo real:', agendamentoId);
    return true;

  } catch (error) {
    console.error('❌ Erro ao deletar agendamento em tempo real:', error);
    throw new Error(`Falha na exclusão: ${error?.message || 'Erro desconhecido'}`);
  }
}

// Health check do sistema em tempo real
export async function healthCheckRealTime(): Promise<{
  success: boolean;
  details?: any;
  error?: string;
}> {
  try {
    const startTime = Date.now();
    const result = await realTimeConnector.sql`
      SELECT 
        1 as health,
        NOW() as timestamp,
        COUNT(*) as total_agendamentos
      FROM agendamentos
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `;
    
    const responseTime = Date.now() - startTime;
    
    return {
      success: true,
      details: {
        ...result[0],
        responseTime: `${responseTime}ms`,
        systemStatus: 'real-time-active'
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error?.message || 'Health check falhou'
    };
  }
}

// Estatísticas de performance
export async function getPerformanceStats(): Promise<any> {
  try {
    const stats = await realTimeConnector.sql`
      SELECT 
        COUNT(*) as total_agendamentos,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as agendamentos_ultima_hora,
        COUNT(CASE WHEN updated_at > NOW() - INTERVAL '1 hour' THEN 1 END) as atualizacoes_ultima_hora,
        MAX(updated_at) as ultima_atividade
      FROM agendamentos
    `;
    
    return {
      ...stats[0],
      connector_status: realTimeConnector.getStatus(),
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    return {
      error: error?.message || 'Erro ao obter estatísticas',
      connector_status: realTimeConnector.getStatus()
    };
  }
}

// Disponibilizar globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).agendamentoRealTimeService = {
    healthCheck: healthCheckRealTime,
    getStats: getPerformanceStats,
    getAgendamentos: getAgendamentosRealTime
  };
  
  console.log('🔧 Real-Time Agendamento Service Commands:');
  console.log('  - window.agendamentoRealTimeService.healthCheck()');
  console.log('  - window.agendamentoRealTimeService.getStats()');
}
