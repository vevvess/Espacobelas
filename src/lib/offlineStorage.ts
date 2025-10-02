// Sistema de armazenamento offline para fallbacks
class OfflineStorage {
  private readonly prefix = 'bella_offline_';
  
  // Salvar dados no cache local
  save(key: string, data: any, ttl: number = 24 * 60 * 60 * 1000): void {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
      console.log(`💾 Dados salvos offline: ${key}`);
    } catch (error) {
      console.warn('Erro ao salvar dados offline:', error);
    }
  }

  // Recuperar dados do cache local
  get(key: string): any | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      const now = Date.now();
      
      // Verificar se não expirou
      if (now - parsed.timestamp > parsed.ttl) {
        this.remove(key);
        return null;
      }

      console.log(`📁 Dados recuperados do cache offline: ${key}`);
      return parsed.data;
    } catch (error) {
      console.warn('Erro ao recuperar dados offline:', error);
      return null;
    }
  }

  // Remover item do cache
  remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn('Erro ao remover dados offline:', error);
    }
  }

  // Limpar cache expirado
  cleanup(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
      keys.forEach(fullKey => {
        const key = fullKey.replace(this.prefix, '');
        this.get(key); // Isso vai remover automaticamente se expirado
      });
    } catch (error) {
      console.warn('Erro ao limpar cache offline:', error);
    }
  }

  // Obter estatísticas do cache
  getStats(): { totalKeys: number; totalSize: number } {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
      const totalSize = keys.reduce((size, key) => {
        return size + (localStorage.getItem(key)?.length || 0);
      }, 0);
      
      return {
        totalKeys: keys.length,
        totalSize
      };
    } catch (error) {
      return { totalKeys: 0, totalSize: 0 };
    }
  }

  // Gerar dados fictícios para modo offline
  generateOfflineDefaults(userId: string) {
    const defaults = {
      dashboard: {
        agendamentosHoje: 0,
        receitaMes: 0,
        totalClientes: this.get(`clientes_${userId}`)?.length || 0,
        proximosAgendamentos: []
      },
      agendamentos: [],
      clientes: [],
      funcionarios: [
        {
          id: userId,
          nome: 'Usuário',
          username: 'usuario',
          is_admin: true
        }
      ]
    };

    // Salvar defaults se não existirem
    if (!this.get(`dashboard_${userId}`)) {
      this.save(`dashboard_${userId}`, defaults.dashboard);
    }
    if (!this.get(`agendamentos_${userId}`)) {
      this.save(`agendamentos_${userId}`, defaults.agendamentos);
    }
    if (!this.get(`clientes_${userId}`)) {
      this.save(`clientes_${userId}`, defaults.clientes);
    }
    if (!this.get(`funcionarios_${userId}`)) {
      this.save(`funcionarios_${userId}`, defaults.funcionarios);
    }

    return defaults;
  }
}

export const offlineStorage = new OfflineStorage();

// Hook para monitorar status offline
export function useOfflineStorage() {
  const save = (key: string, data: any, ttl?: number) => {
    offlineStorage.save(key, data, ttl);
  };

  const get = (key: string) => {
    return offlineStorage.get(key);
  };

  const getStats = () => {
    return offlineStorage.getStats();
  };

  return {
    save,
    get,
    getStats,
    generateDefaults: offlineStorage.generateOfflineDefaults
  };
}
