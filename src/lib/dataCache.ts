// Sistema de cache para dados críticos durante falhas de conectividade
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milliseconds
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutos

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Limpar entradas expiradas
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Obter estatísticas do cache
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries
    };
  }
}

export const dataCache = new DataCache();

// Auto-limpeza a cada 10 minutos
setInterval(() => {
  dataCache.cleanup();
}, 10 * 60 * 1000);

// Wrapper para queries com cache automático
export async function withCache<T>(
  key: string, 
  queryFn: () => Promise<T>, 
  ttl?: number
): Promise<T> {
  // Tentar obter do cache primeiro
  const cached = dataCache.get<T>(key);
  if (cached !== null) {
    console.log(`📦 Cache hit para ${key}`);
    return cached;
  }

  try {
    // Executar query
    const result = await queryFn();
    
    // Salvar no cache
    dataCache.set(key, result, ttl);
    console.log(`💾 Dados salvos no cache: ${key}`);
    
    return result;
  } catch (error) {
    console.error(`❌ Falha na query para ${key}:`, error);
    
    // Se temos dados expirados no cache, usar como fallback
    const expiredData = dataCache.get<T>(key + '_expired');
    if (expiredData !== null) {
      console.warn(`🔄 Usando dados expirados como fallback para ${key}`);
      return expiredData;
    }
    
    throw error;
  }
}
