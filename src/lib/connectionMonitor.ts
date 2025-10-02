// Sistema de monitoramento e alertas para problemas de conectividade
import React from 'react';
import { safeTestConnectivity } from '@/utils/connectivityCircuitBreaker';

interface ConnectionEvent {
  timestamp: number;
  type: 'success' | 'failure' | 'timeout' | 'fetch_error';
  details: string;
  attempt?: number;
}

class ConnectionMonitor {
  private events: ConnectionEvent[] = [];
  private maxEvents = 100;
  private listeners: Array<(event: ConnectionEvent) => void> = [];
  private lastEventTime = 0;
  private minEventInterval = 1000; // Minimum 1 second between similar events

  addEvent(type: ConnectionEvent['type'], details: string, attempt?: number) {
    const now = Date.now();

    // Rate limiting: skip if same type of event happened too recently
    if (type === 'fetch_error' && now - this.lastEventTime < this.minEventInterval) {
      return; // Skip this event
    }

    this.lastEventTime = now;
    const event: ConnectionEvent = {
      timestamp: Date.now(),
      type,
      details,
      attempt
    };

    this.events.push(event);
    
    // Manter apenas os últimos N eventos
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Notificar listeners
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Erro em listener do ConnectionMonitor:', error);
      }
    });

    // Log especial para fetch errors
    if (type === 'fetch_error') {
      console.error(`🔴 [ConnectionMonitor] Failed to fetch (tentativa ${attempt || '?'}): ${details}`);
      this.analyzePattern();
    }
  }

  addListener(callback: (event: ConnectionEvent) => void) {
    this.listeners.push(callback);
  }

  removeListener(callback: (event: ConnectionEvent) => void) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  getRecentEvents(minutes: number = 5): ConnectionEvent[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.events.filter(event => event.timestamp > cutoff);
  }

  getFailureRate(minutes: number = 5): number {
    const recentEvents = this.getRecentEvents(minutes);
    if (recentEvents.length === 0) return 0;

    const failures = recentEvents.filter(e => 
      e.type === 'failure' || e.type === 'timeout' || e.type === 'fetch_error'
    ).length;

    return failures / recentEvents.length;
  }

  private analyzePattern() {
    const recentFailures = this.getRecentEvents(2).filter(e => e.type === 'fetch_error');
    
    // Se temos 3+ fetch errors em 2 minutos, algo está errado
    if (recentFailures.length >= 3) {
      console.warn('🚨 Padrão de Failed to fetch detectado - possível problema de conectividade');
      
      // Testar conectividade real com proteção contra cascata de erros
      safeTestConnectivity()
        .then(hasConnectivity => {
          if (!hasConnectivity) {
            console.error('💥 Conectividade perdida - recomenda-se modo offline');
          } else {
            console.warn('🔄 Conectividade OK - possível problema no servidor Neon');
          }
        })
        .catch(testError => {
          // Não deixar que erros de teste causem mais problemas
          console.warn('⚠️ Erro no teste de conectividade (ignorado):', testError?.message || 'Erro desconhecido');
        });
    }
  }

  getConnectionHealth(): {
    status: 'good' | 'poor' | 'critical';
    failureRate: number;
    recentFailures: number;
    recommendation: string;
  } {
    const failureRate = this.getFailureRate(5);
    const recentFailures = this.getRecentEvents(2).filter(e => 
      e.type === 'failure' || e.type === 'fetch_error'
    ).length;

    let status: 'good' | 'poor' | 'critical';
    let recommendation: string;

    if (failureRate === 0 && recentFailures === 0) {
      status = 'good';
      recommendation = 'Conectividade estável';
    } else if (failureRate < 0.3 && recentFailures < 3) {
      status = 'poor';
      recommendation = 'Conectividade instável - usando cache quando possível';
    } else {
      status = 'critical';
      recommendation = 'Conectividade crítica - considerar modo offline';
    }

    return {
      status,
      failureRate,
      recentFailures,
      recommendation
    };
  }

  clear() {
    this.events = [];
  }
}

export const connectionMonitor = new ConnectionMonitor();

// Hook para monitorar status de conexão
export function useConnectionMonitor() {
  const [health, setHealth] = React.useState(connectionMonitor.getConnectionHealth());

  React.useEffect(() => {
    const updateHealth = () => {
      setHealth(connectionMonitor.getConnectionHealth());
    };

    const listener = (event: ConnectionEvent) => {
      // Atualizar health quando houver eventos críticos
      if (event.type === 'failure' || event.type === 'fetch_error') {
        setTimeout(updateHealth, 100);
      }
    };

    connectionMonitor.addListener(listener);

    // Atualizar periodicamente
    const interval = setInterval(updateHealth, 30000);

    return () => {
      connectionMonitor.removeListener(listener);
      clearInterval(interval);
    };
  }, []);

  return health;
}
