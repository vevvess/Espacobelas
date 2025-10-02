import { alwaysOnlineConnector } from './alwaysOnlineConnector';

// Sistema de atualizações em tempo real
class RealTimeUpdater {
  private activePollers = new Map<string, NodeJS.Timeout>();
  private subscriptions = new Map<string, Set<(data: any) => void>>();
  private lastData = new Map<string, any>();
  private pollingIntervals = new Map<string, number>();

  // Configurações padrão para diferentes tipos de dados
  private defaultIntervals = {
    agendamentos: 5000,    // 5 segundos - crítico para múltiplos usuários
    clientes: 30000,       // 30 segundos - menos frequente
    servicos: 30000,       // 30 segundos - menos frequente
    transacoes: 10000,     // 10 segundos - importante para caixa
    dashboard: 15000       // 15 segundos - overview geral
  };

  // Subscribir para updates de um tipo específico
  subscribe<T = any>(
    type: string,
    callback: (data: T) => void,
    queryFn: () => Promise<T>,
    userId: string,
    customInterval?: number
  ): () => void {
    const key = `${type}_${userId}`;
    
    console.log(`📡 Iniciando polling em tempo real para ${type} (usuário: ${userId})`);

    // Adicionar callback à lista de subscribers
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    this.subscriptions.get(key)!.add(callback);

    // Configurar intervalo
    const interval = customInterval || this.defaultIntervals[type as keyof typeof this.defaultIntervals] || 10000;
    this.pollingIntervals.set(key, interval);

    // Iniciar polling se não existe
    if (!this.activePollers.has(key)) {
      this.startPolling(key, queryFn);
    }

    // Executar query inicial imediatamente
    this.executeQuery(key, queryFn);

    // Retornar função de cleanup
    return () => {
      this.unsubscribe(key, callback);
    };
  }

  private unsubscribe(key: string, callback: Function) {
    const subscribers = this.subscriptions.get(key);
    if (subscribers) {
      subscribers.delete(callback);
      
      // Se não há mais subscribers, parar polling
      if (subscribers.size === 0) {
        this.stopPolling(key);
      }
    }
  }

  private startPolling(key: string, queryFn: () => Promise<any>) {
    const interval = this.pollingIntervals.get(key) || 10000;
    
    console.log(`⏰ Iniciando polling para ${key} a cada ${interval}ms`);

    const pollerId = setInterval(async () => {
      await this.executeQuery(key, queryFn);
    }, interval);

    this.activePollers.set(key, pollerId);
  }

  private stopPolling(key: string) {
    const pollerId = this.activePollers.get(key);
    if (pollerId) {
      clearInterval(pollerId);
      this.activePollers.delete(key);
      console.log(`⏹️ Polling parado para ${key}`);
    }

    // Limpar dados armazenados
    this.lastData.delete(key);
    this.subscriptions.delete(key);
    this.pollingIntervals.delete(key);
  }

  private async executeQuery(key: string, queryFn: () => Promise<any>) {
    try {
      const newData = await queryFn();
      const lastData = this.lastData.get(key);

      // Verificar se houve mudanças (comparação simples por JSON)
      const newDataStr = JSON.stringify(newData);
      const lastDataStr = JSON.stringify(lastData);

      if (newDataStr !== lastDataStr) {
        console.log(`🔄 Dados atualizados para ${key} - notificando ${this.subscriptions.get(key)?.size || 0} subscribers`);
        
        // Atualizar dados armazenados
        this.lastData.set(key, newData);

        // Notificar todos os subscribers
        const subscribers = this.subscriptions.get(key);
        if (subscribers) {
          subscribers.forEach(callback => {
            try {
              callback(newData);
            } catch (error) {
              console.error(`Erro ao notificar subscriber de ${key}:`, error);
            }
          });
        }
      }
    } catch (error) {
      console.error(`❌ Erro no polling de ${key}:`, error?.message);
      
      // Em caso de erro, notificar subscribers com erro
      const subscribers = this.subscriptions.get(key);
      if (subscribers) {
        subscribers.forEach(callback => {
          try {
            callback({ error: error?.message || 'Erro desconhecido' });
          } catch (notifyError) {
            console.error(`Erro ao notificar erro para ${key}:`, notifyError);
          }
        });
      }
    }
  }

  // Forçar update imediato
  async forceUpdate(type: string, userId: string) {
    const key = `${type}_${userId}`;
    console.log(`🔄 Forçando update para ${key}...`);
    
    // Se existe polling ativo, executar query imediatamente
    const subscribers = this.subscriptions.get(key);
    if (subscribers && subscribers.size > 0) {
      // Encontrar query function (não armazenamos ela, então precisamos re-executar)
      console.log(`⚠️ Para forçar update, re-inscreva-se ou use refreshData()`);
    }
  }

  // Método para atualizar dados específicos
  async refreshData<T>(
    type: string,
    userId: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const key = `${type}_${userId}`;
    console.log(`🔄 Atualizando dados para ${key}...`);
    
    const newData = await queryFn();
    
    // Atualizar cache local
    this.lastData.set(key, newData);
    
    // Notificar subscribers se existirem
    const subscribers = this.subscriptions.get(key);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(newData);
        } catch (error) {
          console.error(`Erro ao notificar subscriber de ${key}:`, error);
        }
      });
    }
    
    return newData;
  }

  // Obter status do polling
  getPollingStatus() {
    return {
      activePollers: Array.from(this.activePollers.keys()),
      subscriptions: Array.from(this.subscriptions.entries()).map(([key, subs]) => ({
        key,
        subscriberCount: subs.size,
        interval: this.pollingIntervals.get(key),
        hasData: this.lastData.has(key)
      }))
    };
  }

  // Parar todo o polling
  stopAllPolling() {
    console.log('🛑 Parando todo o polling em tempo real...');
    
    this.activePollers.forEach((pollerId, key) => {
      clearInterval(pollerId);
      console.log(`⏹️ Polling parado para ${key}`);
    });

    this.activePollers.clear();
    this.subscriptions.clear();
    this.lastData.clear();
    this.pollingIntervals.clear();
  }

  // Ajustar intervalo de polling
  setPollingInterval(type: string, userId: string, interval: number) {
    const key = `${type}_${userId}`;
    
    console.log(`⏰ Ajustando intervalo de ${key} para ${interval}ms`);
    
    this.pollingIntervals.set(key, interval);
    
    // Se polling está ativo, reiniciar com novo intervalo
    if (this.activePollers.has(key)) {
      const pollerId = this.activePollers.get(key);
      if (pollerId) {
        clearInterval(pollerId);
        // Precisaríamos re-iniciar, mas não temos a queryFn armazenada
        console.log(`⚠️ Reinicie a subscription para aplicar novo intervalo`);
      }
    }
  }
}

// Instância global
export const realTimeUpdater = new RealTimeUpdater();

import { useState, useEffect, useCallback } from 'react';

// Hook para React
export const useRealTimeData = <T = any>(
  type: string,
  queryFn: () => Promise<T>,
  userId: string,
  options: {
    interval?: number;
    enabled?: boolean;
  } = {}
): {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
} => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const newData = await realTimeUpdater.refreshData(type, userId, queryFn);
      setData(newData);
    } catch (err) {
      setError(err?.message || 'Erro ao atualizar dados');
    } finally {
      setIsLoading(false);
    }
  }, [type, userId, queryFn]);

  useEffect(() => {
    if (!options.enabled) return;

    setIsLoading(true);
    
    const unsubscribe = realTimeUpdater.subscribe(
      type,
      (newData: T | { error: string }) => {
        if ('error' in newData) {
          setError(newData.error);
          setIsLoading(false);
        } else {
          setData(newData);
          setError(null);
          setIsLoading(false);
        }
      },
      queryFn,
      userId,
      options.interval
    );

    return unsubscribe;
  }, [type, userId, queryFn, options.enabled, options.interval]);

  return {
    data,
    error,
    isLoading,
    refresh
  };
};

// Disponibilizar globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).realTimeUpdater = realTimeUpdater;
  
  console.log('📡 Real Time Updater Commands:');
  console.log('  - window.realTimeUpdater.getPollingStatus()');
  console.log('  - window.realTimeUpdater.stopAllPolling()');
}
