import React from 'react';

// Detecção de conectividade de rede
class NetworkDetector {
  private isOnline = navigator.onLine;
  private listeners: Array<(online: boolean) => void> = [];
  
  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners(true);
      console.log('🟢 Conexão de rede detectada');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
      console.log('🔴 Conexão de rede perdida');
    });
  }

  private notifyListeners(online: boolean) {
    this.listeners.forEach(listener => listener(online));
  }

  addListener(callback: (online: boolean) => void) {
    this.listeners.push(callback);
  }

  removeListener(callback: (online: boolean) => void) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  getStatus() {
    return this.isOnline;
  }

  // Testa conectividade real fazendo uma requisição
  async testRealConnectivity(): Promise<boolean> {
    if (!this.isOnline) return false;

    try {
      // Endpoints mais simples e confiáveis com timeout mais curto
      const endpoints = [
        'https://www.google.com/favicon.ico',
        'https://cloudflare.com/favicon.ico',
        'https://cdn.jsdelivr.net/gh/twbs/icons/favicon.ico'
      ];

      // Tentar apenas um endpoint com timeout muito curto
      const endpoint = endpoints[0];
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          try {
            controller.abort();
          } catch (abortErr) {
            // Ignore abort errors during timeout
          }
        }, 2000);

        const response = await fetch(endpoint, {
          method: 'HEAD',
          signal: controller.signal,
          cache: 'no-cache',
          mode: 'no-cors'
        });

        clearTimeout(timeoutId);

        console.log(`✅ Conectividade confirmada via ${endpoint}`);
        return true;
      } catch (endpointError) {
        // Handle different error types gracefully
        if (endpointError?.name === 'AbortError') {
          console.warn(`⏱️ Teste de conectividade timeout em ${endpoint}`);
          return false;
        } else if (endpointError?.message?.includes('Failed to fetch')) {
          console.warn(`🚫 Conectividade falhou em ${endpoint}: Sem internet`);
          return false;
        } else {
          console.warn(`⚠️ Teste de conectividade erro em ${endpoint}:`, endpointError?.message || 'Erro desconhecido');
        }

        // Para outros erros, assumir que há conectividade (pode ser problema de CORS)
        return true;
      }
    } catch (error) {
      console.warn('Teste de conectividade real falhou:', error);
      // Em caso de erro geral, assumir que há conectividade
      return true;
    }
  }
}

export const networkDetector = new NetworkDetector();

// Hook para usar detecção de rede
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(networkDetector.getStatus());

  React.useEffect(() => {
    const handleNetworkChange = (online: boolean) => {
      setIsOnline(online);
    };

    networkDetector.addListener(handleNetworkChange);

    return () => {
      networkDetector.removeListener(handleNetworkChange);
    };
  }, []);

  return {
    isOnline,
    testConnectivity: networkDetector.testRealConnectivity
  };
}
