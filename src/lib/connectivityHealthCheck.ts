/**
 * Sistema de verificação de saúde da conectividade
 * Detecta problemas de rede precocemente
 */

let lastHealthCheck = 0;
let isHealthy = true;
let consecutiveFailures = 0;

const HEALTH_CHECK_INTERVAL = 30000; // 30 segundos
const MAX_CONSECUTIVE_FAILURES = 3;

/**
 * Verifica se a conexão está saudável
 */
export async function performHealthCheck(): Promise<{
  healthy: boolean;
  responseTime?: number;
  error?: string;
}> {
  const now = Date.now();
  
  // Evitar checks muito frequentes
  if (now - lastHealthCheck < 5000) {
    return { healthy: isHealthy };
  }
  
  lastHealthCheck = now;
  
  try {
    const startTime = Date.now();
    
    // Teste simples de conectividade
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      // Testar com endpoint público rápido
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        consecutiveFailures = 0;
        isHealthy = true;
        console.log(`✅ Health check OK (${responseTime}ms)`);
        return { healthy: true, responseTime };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } finally {
      clearTimeout(timeoutId);
    }
    
  } catch (error) {
    consecutiveFailures++;
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    console.warn(`⚠️ Health check falhou (${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES}):`, errorMessage);
    
    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      isHealthy = false;
      console.error('❌ Conectividade marcada como não saudável');
    }
    
    return { 
      healthy: isHealthy, 
      error: errorMessage 
    };
  }
}

/**
 * Verifica se devemos tentar conexão com banco
 */
export function shouldAttemptDatabaseConnection(): boolean {
  // Se a conectividade básica está ruim, não tentar banco
  if (!isHealthy) {
    console.log('🚫 Pulando tentativa de banco - conectividade não saudável');
    return false;
  }
  
  return true;
}

/**
 * Inicia monitoramento contínuo de saúde
 */
export function startHealthMonitoring(): void {
  console.log('🎯 Iniciando monitoramento de saúde da conectividade');
  
  // Health check inicial
  performHealthCheck();
  
  // Health checks periódicos
  const interval = setInterval(() => {
    performHealthCheck().catch(error => {
      console.error('Erro no health check periódico:', error);
    });
  }, HEALTH_CHECK_INTERVAL);
  
  // Limpar em caso de unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      clearInterval(interval);
    });
  }
}

/**
 * Força reset do status de saúde
 */
export function resetHealthStatus(): void {
  consecutiveFailures = 0;
  isHealthy = true;
  lastHealthCheck = 0;
  console.log('🔄 Status de saúde resetado');
}

/**
 * Obter status atual
 */
export function getCurrentHealthStatus(): {
  healthy: boolean;
  consecutiveFailures: number;
  lastCheck: number;
} {
  return {
    healthy: isHealthy,
    consecutiveFailures,
    lastCheck: lastHealthCheck
  };
}

// Auto-iniciar se estiver no browser
if (typeof window !== 'undefined') {
  startHealthMonitoring();
  
  // Tornar disponível globalmente para debug
  (window as any).connectivityHealth = {
    check: performHealthCheck,
    reset: resetHealthStatus,
    status: getCurrentHealthStatus,
    shouldAttempt: shouldAttemptDatabaseConnection
  };
  
  console.log('🔧 Connectivity health tools available at window.connectivityHealth');
}
