// Sistema de fallback com dados mock quando tudo falha
import { Cliente, Agendamento, Servico, Transacao } from './neon';

// Dados mock básicos para fallback
const mockClientes: Cliente[] = [
  {
    id: 'mock-cliente-1',
    user_simple_id: 'current-user',
    nome: 'Maria Silva',
    telefone: '(11) 99999-9999',
    email: 'maria@email.com',
    data_nascimento: new Date('1985-05-15'),
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'mock-cliente-2', 
    user_simple_id: 'current-user',
    nome: 'João Santos',
    telefone: '(11) 88888-8888',
    email: 'joao@email.com',
    data_nascimento: new Date('1990-03-20'),
    created_at: new Date(),
    updated_at: new Date(),
  }
];

const mockServicos: Servico[] = [
  {
    id: 'mock-servico-1',
    user_simple_id: 'current-user',
    nome: 'Corte de Cabelo',
    descricao: 'Corte moderno',
    preco: 45.00,
    duracao_minutos: 30,
    ativo: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'mock-servico-2',
    user_simple_id: 'current-user',
    nome: 'Escova',
    descricao: 'Escova modeladora',
    preco: 25.00,
    duracao_minutos: 20,
    ativo: true,
    created_at: new Date(),
    updated_at: new Date(),
  }
];

const mockAgendamentos: Agendamento[] = [
  {
    id: 'mock-agendamento-1',
    user_simple_id: 'current-user',
    cliente_id: 'mock-cliente-1',
    data_hora: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas no futuro
    status: 'confirmado',
    observacoes: 'Cliente preferencial',
    valor_total: 45.00,
    created_at: new Date(),
    updated_at: new Date(),
    cliente: mockClientes[0],
    servicos: [{
      id: 'mock-agendamento-servico-1',
      agendamento_id: 'mock-agendamento-1',
      servico_id: 'mock-servico-1',
      preco: 45.00,
      created_at: new Date(),
      servico: mockServicos[0]
    }]
  }
];

export class MockFallbackService {
  private static isActive = false;
  
  static activate() {
    this.isActive = true;
    console.warn('🔄 Modo mock ativado - usando dados de demonstração');
  }
  
  static deactivate() {
    this.isActive = false;
    console.log('✅ Modo mock desativado');
  }
  
  static isActivated() {
    return this.isActive;
  }
  
  static async mockQuery(query: string): Promise<any[]> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 300));
    
    const lowerQuery = query.toLowerCase();
    
    // Simular diferentes tipos de queries
    if (lowerQuery.includes('agendamentos') || lowerQuery.includes('agenda')) {
      if (lowerQuery.includes('count')) {
        return [{ count: mockAgendamentos.length.toString() }];
      }
      return mockAgendamentos;
    }
    
    if (lowerQuery.includes('clientes') || lowerQuery.includes('cliente')) {
      if (lowerQuery.includes('count')) {
        return [{ count: mockClientes.length.toString() }];
      }
      return mockClientes;
    }
    
    if (lowerQuery.includes('servicos') || lowerQuery.includes('servico')) {
      return mockServicos;
    }
    
    if (lowerQuery.includes('transacoes') || lowerQuery.includes('receita')) {
      return [{
        total_receita: '270.00',
        total_transacoes: '3'
      }];
    }
    
    if (lowerQuery.includes('dashboard') || lowerQuery.includes('stats')) {
      return [{
        agendamentos_hoje: mockAgendamentos.length,
        receita_mes: 1250.00,
        total_clientes: mockClientes.length,
        proximos_agendamentos: mockAgendamentos.slice(0, 3)
      }];
    }
    
    // Query genérica - retornar dados básicos
    return [{
      id: 'mock-result',
      message: 'Dados de demonstração - modo offline',
      timestamp: new Date().toISOString()
    }];
  }
  
  static generateNotification() {
    return {
      type: 'warning' as const,
      title: 'Modo Demonstração',
      message: 'Conectividade instável - usando dados de exemplo. Funcionalidades limitadas.',
      duration: 5000
    };
  }
}

// Função helper para verificar se devemos usar mock
export function shouldUseMockFallback(): boolean {
  return MockFallbackService.isActivated();
}

// Wrapper para queries que podem usar mock
export async function queryWithMockFallback<T>(
  sqlFunction: () => Promise<T>,
  mockQuery?: string
): Promise<T> {
  if (MockFallbackService.isActivated() && mockQuery) {
    console.log('📋 Usando dados mock para:', mockQuery);
    return MockFallbackService.mockQuery(mockQuery) as Promise<T>;
  }
  
  return sqlFunction();
}
