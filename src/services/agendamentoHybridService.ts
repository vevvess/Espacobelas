/**
 * Serviço de Agendamentos Híbrido
 * Usa PostgreSQL remoto quando disponível, IndexedDB local como fallback
 */

import { sql, getSystemStatus, executeLocalOperation } from '@/lib/hybridDatabase';

// Tipos
interface AgendamentoHybrid {
  id: string;
  user_simple_id: string;
  cliente_id: string;
  servico_id: string;
  funcionario_id?: string;
  data_hora: string;
  status: string;
  observacoes?: string;
  valor?: number;
  created_at: string;
  updated_at: string;
  cliente?: {
    nome: string;
    telefone?: string;
  };
  servico?: {
    nome: string;
    preco: number;
    duracao_minutos?: number;
  };
}

// Adicionar timestamps
function addTimestamps(data: any, isUpdate = false): any {
  const now = new Date().toISOString();
  
  if (isUpdate) {
    return {
      ...data,
      updated_at: now,
    };
  } else {
    return {
      ...data,
      created_at: now,
      updated_at: now,
    };
  }
}

// Gerar UUID
function generateUUID(): string {
  return crypto.randomUUID();
}

// Buscar agendamentos
export async function getAgendamentos(
  userId: string,
  dataInicio?: Date,
  dataFim?: Date
): Promise<AgendamentoHybrid[]> {
  const status = getSystemStatus();
  console.log(`📋 Buscando agendamentos (modo: ${status.mode})`);

  try {
    if (status.remoteAvailable) {
      // Usar banco remoto
      if (dataInicio && dataFim) {
        return await sql`
          SELECT a.*,
                 c.nome as cliente_nome, c.telefone as cliente_telefone,
                 s.nome as servico_nome, s.preco as servico_preco, s.duracao_minutos
          FROM agendamentos a
          JOIN clientes c ON a.cliente_id = c.id
          JOIN servicos s ON a.servico_id = s.id
          WHERE a.user_simple_id = ${userId}
            AND a.data_hora BETWEEN ${dataInicio.toISOString()} AND ${dataFim.toISOString()}
          ORDER BY a.data_hora
        `;
      } else {
        return await sql`
          SELECT a.*,
                 c.nome as cliente_nome, c.telefone as cliente_telefone,
                 s.nome as servico_nome, s.preco as servico_preco, s.duracao_minutos
          FROM agendamentos a
          JOIN clientes c ON a.cliente_id = c.id
          JOIN servicos s ON a.servico_id = s.id
          WHERE a.user_simple_id = ${userId}
          ORDER BY a.data_hora
        `;
      }
    } else {
      // Usar banco local (IndexedDB)
      const agendamentos = await executeLocalOperation('agendamentos', 'getAll');
      
      // Filtrar por usuário
      const userAgendamentos = agendamentos.filter((a: any) => a.user_simple_id === userId);
      
      // Filtrar por data se especificado
      if (dataInicio && dataFim) {
        const start = dataInicio.getTime();
        const end = dataFim.getTime();
        
        return userAgendamentos.filter((a: any) => {
          const agendamentoTime = new Date(a.data_hora).getTime();
          return agendamentoTime >= start && agendamentoTime <= end;
        });
      }
      
      return userAgendamentos.sort((a: any, b: any) => 
        new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime()
      );
    }
  } catch (error) {
    console.error('❌ Erro ao buscar agendamentos:', error);
    
    // Fallback para dados locais em caso de erro
    try {
      const localAgendamentos = await executeLocalOperation('agendamentos', 'getAll');
      return localAgendamentos.filter((a: any) => a.user_simple_id === userId);
    } catch (localError) {
      console.error('❌ Erro também no banco local:', localError);
      return [];
    }
  }
}

// Criar agendamento
export async function createAgendamento(
  userId: string,
  agendamentoData: {
    cliente_id: string;
    servico_id: string;
    data_hora: Date;
    observacoes?: string;
    valor?: number;
    funcionario_id?: string;
  }
): Promise<AgendamentoHybrid> {
  const status = getSystemStatus();
  console.log(`➕ Criando agendamento (modo: ${status.mode})`);

  const data = addTimestamps({
    id: generateUUID(),
    user_simple_id: userId,
    status: "agendado",
    ...agendamentoData,
    data_hora: agendamentoData.data_hora.toISOString(),
  });

  try {
    if (status.remoteAvailable) {
      // Usar banco remoto
      const result = await sql`
        INSERT INTO agendamentos (
          id, user_simple_id, cliente_id, servico_id, funcionario_id,
          data_hora, status, observacoes, valor, created_at, updated_at
        ) VALUES (
          ${data.id}, ${data.user_simple_id}, ${data.cliente_id}, ${data.servico_id}, ${data.funcionario_id},
          ${data.data_hora}, ${data.status}, ${data.observacoes}, ${data.valor}, ${data.created_at}, ${data.updated_at}
        ) RETURNING *
      `;
      
      return result[0] as AgendamentoHybrid;
    } else {
      // Usar banco local
      await executeLocalOperation('agendamentos', 'add', data);
      return data as AgendamentoHybrid;
    }
  } catch (error) {
    console.error('❌ Erro ao criar agendamento:', error);
    
    // Fallback para local em caso de erro
    await executeLocalOperation('agendamentos', 'add', data);
    return data as AgendamentoHybrid;
  }
}

// Atualizar agendamento
export async function updateAgendamento(
  agendamentoId: string,
  userId: string,
  updates: Partial<{
    status: string;
    data_hora: Date;
    observacoes: string;
    valor: number;
    funcionario_id: string;
  }>
): Promise<AgendamentoHybrid> {
  const status = getSystemStatus();
  console.log(`✏️ Atualizando agendamento (modo: ${status.mode})`);

  const data = addTimestamps({
    ...updates,
    data_hora: updates.data_hora ? updates.data_hora.toISOString() : undefined,
  }, true);

  try {
    if (status.remoteAvailable) {
      // Usar banco remoto
      const result = await sql`
        UPDATE agendamentos
        SET status = COALESCE(${data.status}, status),
            data_hora = COALESCE(${data.data_hora}, data_hora),
            observacoes = COALESCE(${data.observacoes}, observacoes),
            valor = COALESCE(${data.valor}, valor),
            funcionario_id = COALESCE(${data.funcionario_id}, funcionario_id),
            updated_at = ${data.updated_at}
        WHERE id = ${agendamentoId} AND user_simple_id = ${userId}
        RETURNING *
      `;
      
      return result[0] as AgendamentoHybrid;
    } else {
      // Usar banco local
      const agendamento = await executeLocalOperation('agendamentos', 'get', agendamentoId);
      
      if (!agendamento || agendamento.user_simple_id !== userId) {
        throw new Error('Agendamento não encontrado ou sem permissão');
      }
      
      const updatedAgendamento = { ...agendamento, ...data };
      await executeLocalOperation('agendamentos', 'put', updatedAgendamento);
      
      return updatedAgendamento as AgendamentoHybrid;
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar agendamento:', error);
    throw error;
  }
}

// Deletar agendamento
export async function deleteAgendamento(
  agendamentoId: string,
  userId: string
): Promise<boolean> {
  const status = getSystemStatus();
  console.log(`🗑️ Deletando agendamento (modo: ${status.mode})`);

  try {
    if (status.remoteAvailable) {
      // Usar banco remoto
      await sql`
        DELETE FROM agendamentos 
        WHERE id = ${agendamentoId} AND user_simple_id = ${userId}
      `;
      
      return true;
    } else {
      // Usar banco local
      const agendamento = await executeLocalOperation('agendamentos', 'get', agendamentoId);
      
      if (!agendamento || agendamento.user_simple_id !== userId) {
        throw new Error('Agendamento não encontrado ou sem permissão');
      }
      
      await executeLocalOperation('agendamentos', 'delete', agendamentoId);
      return true;
    }
  } catch (error) {
    console.error('❌ Erro ao deletar agendamento:', error);
    return false;
  }
}

// Buscar agendamentos por data específica
export async function getAgendamentosByDate(
  userId: string,
  date: Date
): Promise<AgendamentoHybrid[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return getAgendamentos(userId, startOfDay, endOfDay);
}

// Obter estatísticas
export async function getAgendamentosStats(userId: string) {
  const status = getSystemStatus();
  const hoje = new Date();
  
  try {
    const agendamentosHoje = await getAgendamentosByDate(userId, hoje);
    
    return {
      agendamentosHoje: agendamentosHoje.length,
      mode: status.mode,
      remoteAvailable: status.remoteAvailable,
      lastUpdate: new Date().toLocaleString()
    };
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    return {
      agendamentosHoje: 0,
      mode: status.mode,
      remoteAvailable: false,
      lastUpdate: new Date().toLocaleString()
    };
  }
}

// Debug: Mostrar status do sistema
export function debugSystemStatus() {
  const status = getSystemStatus();
  console.log('🔍 Status do Sistema Híbrido:', status);
  
  if (typeof window !== 'undefined') {
    (window as any).hybridDBStatus = status;
    console.log('💡 Debug: Use window.hybridDBStatus para ver o status');
  }
  
  return status;
}

// Tornar funções disponíveis globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).debugHybridDB = debugSystemStatus;
  (window as any).getAgendamentosHybrid = (userId: string) => getAgendamentos(userId);
  console.log('🔧 Debug: Use window.debugHybridDB() e window.getAgendamentosHybrid(userId)');
}
