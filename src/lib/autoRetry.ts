// Sistema de auto-retry em background para manter conectividade
import React from 'react';
import { sql } from './neon';

class AutoRetryService {
  private retryInterval: NodeJS.Timeout | null = null;
  private isRetrying = false;
  private lastSuccessTime = Date.now();
  private failureCount = 0;
  private maxFailures = 10;
  private baseRetryInterval = 30000; // 30 segundos

  start() {
    if (this.retryInterval) return;
    
    console.log('🔄 Auto-retry service iniciado');
    this.retryInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.baseRetryInterval);
  }

  stop() {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
      console.log('⏹️ Auto-retry service parado');
    }
  }

  private async performHealthCheck() {
    if (this.isRetrying) return;
    
    this.isRetrying = true;
    
    try {
      // Test de conectividade simples
      await sql`SELECT 1 as health_check`;
      
      // Sucesso - resetar contadores
      if (this.failureCount > 0) {
        console.log('✅ Conectividade restaurada pelo auto-retry');
        this.failureCount = 0;
        this.lastSuccessTime = Date.now();
        
        // Notificar sucesso para outros componentes
        window.dispatchEvent(new CustomEvent('connectivity-restored'));
      }
    } catch (error) {
      this.failureCount++;
      console.warn(`🔄 Auto-retry falhou (${this.failureCount}/${this.maxFailures}):`, error.message);
      
      // Se excedeu max failures, pausar por mais tempo
      if (this.failureCount >= this.maxFailures) {
        console.warn('⚠️ Muitas falhas consecutivas - pausando auto-retry por 2 minutos');
        this.stop();
        setTimeout(() => {
          this.failureCount = 0;
          this.start();
        }, 120000); // 2 minutos
      }
    } finally {
      this.isRetrying = false;
    }
  }

  getStatus() {
    return {
      isActive: !!this.retryInterval,
      isRetrying: this.isRetrying,
      failureCount: this.failureCount,
      lastSuccessTime: this.lastSuccessTime,
      timeSinceLastSuccess: Date.now() - this.lastSuccessTime
    };
  }
}

export const autoRetryService = new AutoRetryService();

// Hook para usar o status do auto-retry
export function useAutoRetryStatus() {
  const [status, setStatus] = React.useState(autoRetryService.getStatus());

  React.useEffect(() => {
    const updateStatus = () => {
      setStatus(autoRetryService.getStatus());
    };

    // Atualizar status periodicamente
    const interval = setInterval(updateStatus, 5000);

    // Listener para restauração de conectividade
    const handleConnectivityRestored = () => {
      updateStatus();
    };

    window.addEventListener('connectivity-restored', handleConnectivityRestored);

    return () => {
      clearInterval(interval);
      window.removeEventListener('connectivity-restored', handleConnectivityRestored);
    };
  }, []);

  return status;
}
