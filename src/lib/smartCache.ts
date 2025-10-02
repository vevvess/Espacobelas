// Sistema de cache inteligente com invalidação automática
class SmartCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private dependencies = new Map<string, Set<string>>(); // Mapeamento de dependências
  private invalidationRules = new Map<string, string[]>(); // Regras de invalidação

  // TTL padrão por tipo de dados (em milissegundos)
  private defaultTTL = {
    agendamentos: 30000,      // 30 segundos - dados críticos
    clientes: 300000,         // 5 minutos - menos volátil
    servicos: 300000,         // 5 minutos - menos volátil
    transacoes: 60000,        // 1 minuto - importante para caixa
    dashboard: 60000,         // 1 minuto - overview
    usuarios: 600000,         // 10 minutos - raramente muda
    default: 120000           // 2 minutos - padrão
  };

  constructor() {
    this.setupInvalidationRules();
    this.startCleanupInterval();
  }

  private setupInvalidationRules() {
    // Quando agendamentos mudam, invalidar dashboard e estatísticas
    this.invalidationRules.set('agendamentos', ['dashboard', 'stats', 'calendario']);
    
    // Quando clientes mudam, invalidar agendamentos (por joins)
    this.invalidationRules.set('clientes', ['agendamentos', 'dashboard']);
    
    // Quando serviços mudam, invalidar agendamentos
    this.invalidationRules.set('servicos', ['agendamentos', 'dashboard']);
    
    // Quando transações mudam, invalidar dashboard e caixa
    this.invalidationRules.set('transacoes', ['dashboard', 'caixa', 'stats']);
  }

  // Obter dados do cache
  get<T = any>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    // Verificar se expirou
    if (Date.now() - cached.timestamp > cached.ttl) {
      console.log(`🗑️ Cache expirado para ${key}`);
      this.cache.delete(key);
      this.removeDependencies(key);
      return null;
    }

    console.log(`💾 Cache hit para ${key}`);
    return cached.data;
  }

  // Armazenar dados no cache
  set<T = any>(
    key: string, 
    data: T, 
    options: { 
      ttl?: number; 
      type?: keyof typeof this.defaultTTL;
      dependencies?: string[];
    } = {}
  ): void {
    const ttl = options.ttl || this.defaultTTL[options.type || 'default'];
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Configurar dependências se fornecidas
    if (options.dependencies) {
      for (const dep of options.dependencies) {
        if (!this.dependencies.has(dep)) {
          this.dependencies.set(dep, new Set());
        }
        this.dependencies.get(dep)!.add(key);
      }
    }

    console.log(`💾 Cache armazenado para ${key} (TTL: ${ttl}ms)`);
  }

  // Invalidar cache específico
  invalidate(key: string): void {
    console.log(`🗑️ Invalidando cache: ${key}`);
    
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Invalidar caches dependentes
    const dependents = this.dependencies.get(key);
    if (dependents) {
      for (const dependent of dependents) {
        this.cache.delete(dependent);
        console.log(`🗑️ Invalidando cache dependente: ${dependent}`);
      }
    }

    this.removeDependencies(key);

    // Aplicar regras de invalidação
    const rules = this.invalidationRules.get(key);
    if (rules) {
      for (const ruleKey of rules) {
        this.invalidateByPattern(ruleKey);
      }
    }
  }

  // Invalidar por padrão (ex: todos os caches que começam com "agendamentos_")
  private invalidateByPattern(pattern: string): void {
    const keysToDelete: string[] = [];
    
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
      console.log(`🗑️ Invalidando por padrão: ${key}`);
    }
  }

  // Remover dependências de uma key
  private removeDependencies(key: string): void {
    for (const [depKey, depSet] of this.dependencies) {
      depSet.delete(key);
      if (depSet.size === 0) {
        this.dependencies.delete(depKey);
      }
    }
  }

  // Executar query com cache automático
  async getOrFetch<T = any>(
    key: string,
    fetchFn: () => Promise<T>,
    options: {
      ttl?: number;
      type?: keyof typeof this.defaultTTL;
      dependencies?: string[];
      forceRefresh?: boolean;
    } = {}
  ): Promise<T> {
    // Se forceRefresh, pular cache
    if (options.forceRefresh) {
      console.log(`🔄 Força refresh para ${key}`);
      const data = await fetchFn();
      this.set(key, data, options);
      return data;
    }

    // Tentar buscar do cache primeiro
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - buscar dados
    console.log(`📡 Cache miss para ${key} - buscando dados...`);
    
    try {
      const data = await fetchFn();
      this.set(key, data, options);
      return data;
    } catch (error) {
      console.error(`❌ Erro ao buscar dados para ${key}:`, error);
      throw error;
    }
  }

  // Invalidar múltiplas chaves relacionadas
  invalidateRelated(type: string, userId?: string): void {
    const patterns = [];
    
    if (userId) {
      patterns.push(`${type}_${userId}`);
    } else {
      patterns.push(type);
    }

    for (const pattern of patterns) {
      this.invalidate(pattern);
    }
  }

  // Limpeza periódica de cache expirado
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Limpar a cada 1 minuto
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, cached] of this.cache) {
      if (now - cached.timestamp > cached.ttl) {
        keysToDelete.push(key);
      }
    }

    if (keysToDelete.length > 0) {
      console.log(`🧹 Limpando ${keysToDelete.length} entradas de cache expiradas`);
      
      for (const key of keysToDelete) {
        this.cache.delete(key);
        this.removeDependencies(key);
      }
    }
  }

  // Estatísticas do cache
  getStats() {
    const now = Date.now();
    let activeEntries = 0;
    let expiredEntries = 0;
    let totalSize = 0;

    for (const [key, cached] of this.cache) {
      if (now - cached.timestamp <= cached.ttl) {
        activeEntries++;
      } else {
        expiredEntries++;
      }
      
      try {
        totalSize += JSON.stringify(cached.data).length;
      } catch {
        totalSize += 1000; // Estimativa para objetos não serializáveis
      }
    }

    return {
      activeEntries,
      expiredEntries,
      totalEntries: this.cache.size,
      dependencies: this.dependencies.size,
      approximateSize: `${Math.round(totalSize / 1024)}KB`,
      invalidationRules: this.invalidationRules.size
    };
  }

  // Limpar todo o cache
  clear(): void {
    console.log('🗑️ Limpando todo o cache');
    this.cache.clear();
    this.dependencies.clear();
  }

  // Obter todas as chaves do cache
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Pré-carregar dados importantes
  async preload(userId: string): Promise<void> {
    console.log(`🚀 Pré-carregando dados para usuário ${userId}...`);
    
    try {
      // Importar serviços de forma dinâmica para evitar dependências circulares
      const { getAgendamentosWithFuncionario } = await import('@/services/agendamentoServiceImproved');
      const { getClientes, getServicos } = await import('@/services/database');
      
      // Pré-carregar agendamentos de hoje
      const hoje = new Date();
      const inicioHoje = new Date(hoje.setHours(0, 0, 0, 0));
      const fimHoje = new Date(hoje.setHours(23, 59, 59, 999));
      
      await this.getOrFetch(
        `agendamentos_${userId}_hoje`,
        () => getAgendamentosWithFuncionario(userId, inicioHoje, fimHoje),
        { type: 'agendamentos' }
      );

      // Pré-carregar clientes e serviços
      await Promise.all([
        this.getOrFetch(
          `clientes_${userId}`,
          () => getClientes(userId),
          { type: 'clientes' }
        ),
        this.getOrFetch(
          `servicos_${userId}`,
          () => getServicos(userId),
          { type: 'servicos' }
        )
      ]);

      console.log(`✅ Pré-carregamento concluído para usuário ${userId}`);
    } catch (error) {
      console.error('❌ Erro no pré-carregamento:', error);
    }
  }
}

// Instância global
export const smartCache = new SmartCache();

// Wrapper para queries com cache automático
export const withCache = <T = any>(
  key: string,
  queryFn: () => Promise<T>,
  options: {
    ttl?: number;
    type?: 'agendamentos' | 'clientes' | 'servicos' | 'transacoes' | 'dashboard' | 'usuarios';
    dependencies?: string[];
    forceRefresh?: boolean;
  } = {}
): Promise<T> => {
  return smartCache.getOrFetch(key, queryFn, options);
};

// Helper para invalidar dados relacionados a operações CRUD
export const invalidateAfterOperation = (
  operation: 'create' | 'update' | 'delete',
  type: 'agendamentos' | 'clientes' | 'servicos' | 'transacoes',
  userId: string
): void => {
  console.log(`🔄 Invalidando cache após ${operation} em ${type}`);
  
  // Invalidar dados específicos do usuário
  smartCache.invalidateRelated(type, userId);
  
  // Se for agendamento, invalidar também dados agregados
  if (type === 'agendamentos') {
    smartCache.invalidate(`dashboard_${userId}`);
    smartCache.invalidate(`stats_${userId}`);
  }
};

// Disponibilizar globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).smartCache = smartCache;
  
  console.log('💾 Smart Cache Commands:');
  console.log('  - window.smartCache.getStats()');
  console.log('  - window.smartCache.clear()');
  console.log('  - window.smartCache.getKeys()');
}
