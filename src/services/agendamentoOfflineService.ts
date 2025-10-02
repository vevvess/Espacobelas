/**
 * Sistema de agendamentos offline-first
 * Funciona 100% do tempo sem depender de conectividade externa
 */

// Dados mockados para desenvolvimento/teste
const mockAgendamentos = [
  {
    id: "mock-1",
    user_simple_id: "user-1",
    cliente_id: "cliente-1",
    servico_id: "servico-1",
    funcionario_id: null,
    data_hora: new Date(Date.now() + 1000 * 60 * 60), // 1 hora no futuro
    status: "agendado",
    observacoes: "Agendamento de teste",
    valor: 50.00,
    created_at: new Date(),
    updated_at: new Date(),
    cliente: {
      nome: "Cliente Teste",
      telefone: "(11) 99999-9999",
      tipo_cliente: "normal"
    },
    servico: {
      nome: "Corte de Cabelo",
      preco: 50.00,
      duracao_minutos: 60
    },
    funcionario: null
  },
  {
    id: "mock-2",
    user_simple_id: "user-1",
    cliente_id: "cliente-2",
    servico_id: "servico-2",
    funcionario_id: null,
    data_hora: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 horas no futuro
    status: "confirmado",
    observacoes: "Cliente regular",
    valor: 80.00,
    created_at: new Date(),
    updated_at: new Date(),
    cliente: {
      nome: "Maria Silva",
      telefone: "(11) 88888-8888",
      tipo_cliente: "mensal"
    },
    servico: {
      nome: "Escova + Corte",
      preco: 80.00,
      duracao_minutos: 90
    },
    funcionario: null
  },
  {
    id: "mock-3",
    user_simple_id: "user-1",
    cliente_id: "cliente-3",
    servico_id: "servico-3",
    funcionario_id: null,
    data_hora: new Date(Date.now() - 1000 * 60 * 60), // 1 hora no passado
    status: "concluido",
    observacoes: "Serviço concluído com sucesso",
    valor: 120.00,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2),
    updated_at: new Date(Date.now() - 1000 * 60 * 60),
    cliente: {
      nome: "João Santos",
      telefone: "(11) 77777-7777",
      tipo_cliente: "normal"
    },
    servico: {
      nome: "Pintura + Corte",
      preco: 120.00,
      duracao_minutos: 120
    },
    funcionario: null
  }
];

// Armazenamento local
let localAgendamentos = [...mockAgendamentos];
let nextId = mockAgendamentos.length + 1;

// Simular delay de rede para realismo
const simulateNetworkDelay = (min = 100, max = 500) => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Buscar agendamentos offline
export async function getAgendamentosOffline(
  userId: string,
  dataInicio?: Date,
  dataFim?: Date
): Promise<any[]> {
  console.log('📦 Buscando agendamentos offline...', { userId, dataInicio, dataFim });
  
  await simulateNetworkDelay();
  
  let agendamentos = localAgendamentos.filter(a => a.user_simple_id === userId);
  
  // Filtrar por data se especificado
  if (dataInicio && dataFim) {
    agendamentos = agendamentos.filter(a => {
      const dataAgendamento = new Date(a.data_hora);
      return dataAgendamento >= dataInicio && dataAgendamento <= dataFim;
    });
  }
  
  console.log(`✅ ${agendamentos.length} agendamentos offline encontrados`);
  return agendamentos;
}

// Criar agendamento offline
export async function createAgendamentoOffline(
  userId: string,
  agendamentoData: {
    cliente_id: string;
    servico_id: string;
    data_hora: Date;
    observacoes?: string;
    valor?: number;
  }
): Promise<any> {
  console.log('📝 Criando agendamento offline...', agendamentoData);
  
  await simulateNetworkDelay();
  
  const novoAgendamento = {
    id: `offline-${nextId++}`,
    user_simple_id: userId,
    funcionario_id: null,
    status: "agendado",
    created_at: new Date(),
    updated_at: new Date(),
    ...agendamentoData,
    cliente: {
      nome: "Cliente Novo",
      telefone: "(11) 00000-0000",
      tipo_cliente: "normal"
    },
    servico: {
      nome: "Serviço Genérico",
      preco: agendamentoData.valor || 50.00,
      duracao_minutos: 60
    },
    funcionario: null
  };
  
  localAgendamentos.push(novoAgendamento);
  
  console.log('✅ Agendamento offline criado:', novoAgendamento.id);
  return novoAgendamento;
}

// Atualizar agendamento offline
export async function updateAgendamentoOffline(
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
  console.log('📝 Atualizando agendamento offline...', { agendamentoId, updates });
  
  await simulateNetworkDelay();
  
  const index = localAgendamentos.findIndex(a => a.id === agendamentoId && a.user_simple_id === userId);
  
  if (index === -1) {
    throw new Error("Agendamento não encontrado");
  }
  
  localAgendamentos[index] = {
    ...localAgendamentos[index],
    ...updates,
    updated_at: new Date()
  };
  
  console.log('✅ Agendamento offline atualizado:', agendamentoId);
  return localAgendamentos[index];
}

// Deletar agendamento offline
export async function deleteAgendamentoOffline(
  agendamentoId: string,
  userId: string
): Promise<boolean> {
  console.log('🗑️ Deletando agendamento offline...', agendamentoId);
  
  await simulateNetworkDelay();
  
  const index = localAgendamentos.findIndex(a => a.id === agendamentoId && a.user_simple_id === userId);
  
  if (index === -1) {
    throw new Error("Agendamento não encontrado");
  }
  
  localAgendamentos.splice(index, 1);
  
  console.log('✅ Agendamento offline deletado:', agendamentoId);
  return true;
}

// Health check offline (sempre funciona)
export async function healthCheckOffline(): Promise<{
  success: boolean;
  details?: any;
  error?: string;
}> {
  await simulateNetworkDelay(50, 100);
  
  return {
    success: true,
    details: {
      mode: 'offline',
      agendamentos_count: localAgendamentos.length,
      timestamp: new Date().toISOString(),
      status: 'Sistema offline funcionando perfeitamente'
    }
  };
}

// Estatísticas offline
export async function getOfflineStats(): Promise<any> {
  await simulateNetworkDelay(50, 100);
  
  const now = new Date();
  const hoje = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const amanha = new Date(hoje.getTime() + 24 * 60 * 60 * 1000);
  
  const agendamentosHoje = localAgendamentos.filter(a => {
    const dataAgendamento = new Date(a.data_hora);
    return dataAgendamento >= hoje && dataAgendamento < amanha;
  });
  
  const agendamentosConcluidos = localAgendamentos.filter(a => a.status === 'concluido');
  
  return {
    total_agendamentos: localAgendamentos.length,
    agendamentos_hoje: agendamentosHoje.length,
    agendamentos_concluidos: agendamentosConcluidos.length,
    agendamentos_pendentes: localAgendamentos.length - agendamentosConcluidos.length,
    receita_total: localAgendamentos.reduce((sum, a) => sum + (a.valor || 0), 0),
    ultima_atualizacao: new Date().toISOString(),
    modo: 'offline'
  };
}

// Resetar dados para estado inicial
export function resetOfflineData(): void {
  localAgendamentos = [...mockAgendamentos];
  nextId = mockAgendamentos.length + 1;
  console.log('🔄 Dados offline resetados para estado inicial');
}

// Disponibilizar globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).agendamentoOfflineService = {
    getAgendamentos: getAgendamentosOffline,
    createAgendamento: createAgendamentoOffline,
    updateAgendamento: updateAgendamentoOffline,
    deleteAgendamento: deleteAgendamentoOffline,
    healthCheck: healthCheckOffline,
    getStats: getOfflineStats,
    resetData: resetOfflineData,
    viewData: () => localAgendamentos
  };
  
  console.log('🔧 Offline Service Commands:');
  console.log('  - window.agendamentoOfflineService.getStats()');
  console.log('  - window.agendamentoOfflineService.viewData()');
  console.log('  - window.agendamentoOfflineService.resetData()');
}
