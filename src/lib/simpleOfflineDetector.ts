/**
 * Detector simples de modo offline
 * Baseado apenas em estado local, sem chamadas externas
 */

// Estado global da aplicação
let isInOfflineMode = false;
let lastDatabaseError: string | null = null;
let errorCount = 0;

const MAX_ERRORS_BEFORE_OFFLINE = 3;

/**
 * Registrar erro de banco de dados
 */
export function registerDatabaseError(error: string): void {
  lastDatabaseError = error;
  errorCount++;
  
  // Se muitos erros consecutivos, marcar como offline
  if (errorCount >= MAX_ERRORS_BEFORE_OFFLINE) {
    isInOfflineMode = true;
    console.warn(`⚠️ Marcado como offline após ${errorCount} erros`);
  }
  
  console.log(`📊 Erro DB registrado (${errorCount}/${MAX_ERRORS_BEFORE_OFFLINE}): ${error}`);
}

/**
 * Registrar sucesso de operação
 */
export function registerDatabaseSuccess(): void {
  if (errorCount > 0) {
    console.log('✅ Operação DB bem-sucedida - resetando contador');
  }
  
  errorCount = 0;
  isInOfflineMode = false;
  lastDatabaseError = null;
}

/**
 * Verificar se estamos em modo offline
 */
export function isOffline(): boolean {
  return !navigator.onLine || isInOfflineMode;
}

/**
 * Obter status detalhado
 */
export function getOfflineStatus(): {
  offline: boolean;
  reason: string;
  errorCount: number;
  lastError?: string;
} {
  if (!navigator.onLine) {
    return {
      offline: true,
      reason: 'Sem conexão com internet',
      errorCount: 0
    };
  }
  
  if (isInOfflineMode) {
    return {
      offline: true,
      reason: 'Problemas de conectividade com banco de dados',
      errorCount,
      lastError: lastDatabaseError || undefined
    };
  }
  
  return {
    offline: false,
    reason: 'Conectado',
    errorCount
  };
}

/**
 * Forçar reset do modo offline
 */
export function resetOfflineMode(): void {
  isInOfflineMode = false;
  errorCount = 0;
  lastDatabaseError = null;
  console.log('🔄 Modo offline resetado manualmente');
}

/**
 * Verificar se erro é relacionado a conectividade
 */
export function isConnectivityError(error: any): boolean {
  if (!error) return false;
  
  const errorStr = error.toString().toLowerCase();
  
  return (
    errorStr.includes('failed to fetch') ||
    errorStr.includes('network error') ||
    errorStr.includes('connection') ||
    errorStr.includes('timeout') ||
    errorStr.includes('abort') ||
    errorStr.includes('cors')
  );
}

// Tornar disponível globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).offlineDetector = {
    registerError: registerDatabaseError,
    registerSuccess: registerDatabaseSuccess,
    isOffline,
    getStatus: getOfflineStatus,
    reset: resetOfflineMode,
    isConnectivityError
  };
  
  console.log('🔧 Offline detector tools available at window.offlineDetector');
}
