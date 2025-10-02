import { Agendamento } from './neon';

// Funções utilitárias para agendamentos
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

export const formatCurrency = (value: number | string | undefined | null): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (numValue === undefined || numValue === null || isNaN(numValue)) {
    return 'R$ 0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
};

export const getAgendamentosHoje = (agendamentos: Agendamento[]): Agendamento[] => {
  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
  
  return agendamentos.filter(agendamento => {
    const dataAgendamento = new Date(agendamento.data_hora);
    return dataAgendamento >= inicioHoje && dataAgendamento <= fimHoje;
  });
};

// Lista de funcionários padrão (pode ser expandida com dados do banco)
export const getFuncionarios = () => [
  { id: '1', nome: 'Funcionário 1', username: 'func1' },
  { id: '2', nome: 'Funcionário 2', username: 'func2' },
  { id: '3', nome: 'Funcionário 3', username: 'func3' }
];

// Calcular status de um agendamento
export const getAgendamentoStatus = (agendamento: Agendamento) => {
  const agora = new Date();
  const dataAgendamento = new Date(agendamento.data_hora);
  
  if (agendamento.status === 'concluido') {
    return 'concluido';
  }
  
  if (agendamento.status === 'cancelado') {
    return 'cancelado';
  }
  
  if (dataAgendamento < agora) {
    return 'em_andamento';
  }
  
  return 'agendado';
};

// Calcular duração estimada de um serviço
export const estimarDuracaoServico = (nomeServico: string): number => {
  const nome = nomeServico.toLowerCase();
  
  if (nome.includes('cutilação') || nome.includes('cuticula')) {
    if (nome.includes('pé') && nome.includes('mão')) return 60;
    return 30;
  }
  
  if (nome.includes('escova')) return 60;
  if (nome.includes('corte')) return 30;
  if (nome.includes('pintura') || nome.includes('coloração')) return 120;
  if (nome.includes('manicure') || nome.includes('pedicure')) return 45;
  
  return 60; // Duração padrão
};

// Validar dados de agendamento
export const validarAgendamento = (agendamentoData: {
  cliente_id?: string;
  servico_id?: string;
  data_hora?: Date;
  valor?: number;
}) => {
  const erros: string[] = [];
  
  if (!agendamentoData.cliente_id) {
    erros.push('Cliente é obrigatório');
  }
  
  if (!agendamentoData.servico_id) {
    erros.push('Serviço é obrigatório');
  }
  
  if (!agendamentoData.data_hora) {
    erros.push('Data e hora são obrigatórias');
  } else {
    // Verificar se a data não é no passado
    const agora = new Date();
    if (agendamentoData.data_hora < agora) {
      erros.push('Data e hora não podem ser no passado');
    }
  }
  
  if (agendamentoData.valor !== undefined && agendamentoData.valor < 0) {
    erros.push('Valor não pode ser negativo');
  }
  
  return erros;
};

// Calcular tempo restante para um agendamento
export const calcularTempoRestante = (dataAgendamento: Date): {
  tempoRestante: string;
  percentualCompleto: number;
} => {
  const agora = new Date();
  const dataInicio = new Date(dataAgendamento);
  
  // Se já passou, retornar 100%
  if (agora >= dataInicio) {
    return { tempoRestante: 'Iniciado', percentualCompleto: 100 };
  }
  
  const diferencaMs = dataInicio.getTime() - agora.getTime();
  const diferencaMinutos = Math.floor(diferencaMs / (1000 * 60));
  const diferencaHoras = Math.floor(diferencaMinutos / 60);
  const diferencaDias = Math.floor(diferencaHoras / 24);
  
  let tempoRestante: string;
  
  if (diferencaDias > 0) {
    tempoRestante = `${diferencaDias} dia${diferencaDias > 1 ? 's' : ''}`;
  } else if (diferencaHoras > 0) {
    tempoRestante = `${diferencaHoras}h ${diferencaMinutos % 60}min`;
  } else {
    tempoRestante = `${diferencaMinutos}min`;
  }
  
  // Calcular percentual (máximo 24h = 100%)
  const maxMs = 24 * 60 * 60 * 1000; // 24 horas
  const percentualCompleto = Math.max(0, Math.min(100, 
    ((maxMs - diferencaMs) / maxMs) * 100
  ));
  
  return { tempoRestante, percentualCompleto };
};

// Gerar cores para funcionários
export const getFuncionarioCor = (funcionarioId: string): string => {
  const cores = [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#06B6D4', // cyan-500
    '#84CC16', // lime-500
    '#F97316', // orange-500
  ];
  
  const index = parseInt(funcionarioId) % cores.length;
  return cores[index];
};

// Filtrar agendamentos por critérios
export const filtrarAgendamentos = (
  agendamentos: Agendamento[],
  filtros: {
    status?: string;
    cliente?: string;
    funcionario?: string;
    dataInicio?: Date;
    dataFim?: Date;
  }
): Agendamento[] => {
  return agendamentos.filter(agendamento => {
    // Filtro por status
    if (filtros.status && agendamento.status !== filtros.status) {
      return false;
    }
    
    // Filtro por cliente
    if (filtros.cliente) {
      const nomeCliente = agendamento.cliente?.nome?.toLowerCase() || '';
      if (!nomeCliente.includes(filtros.cliente.toLowerCase())) {
        return false;
      }
    }
    
    // Filtro por data
    if (filtros.dataInicio || filtros.dataFim) {
      const dataAgendamento = new Date(agendamento.data_hora);
      
      if (filtros.dataInicio && dataAgendamento < filtros.dataInicio) {
        return false;
      }
      
      if (filtros.dataFim && dataAgendamento > filtros.dataFim) {
        return false;
      }
    }
    
    return true;
  });
};
