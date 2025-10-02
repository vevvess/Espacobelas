import React, { useState, useEffect } from 'react';
import { FiWifi, FiWifiOff, FiRefreshCw, FiDatabase, FiAlertTriangle } from 'react-icons/fi';

interface ConnectivityStatus {
  isOnline: boolean;
  neonConnection: boolean;
  lastCheck: number;
  stats: any;
}

export const ConnectivityMonitor: React.FC = () => {
  const [status, setStatus] = useState<ConnectivityStatus>({
    isOnline: navigator.onLine,
    neonConnection: false,
    lastCheck: Date.now(),
    stats: null
  });

  const [isChecking, setIsChecking] = useState(false);

  const checkConnectivity = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    console.log('🔍 Verificando conectividade...');

    try {
      // Verificar conectividade de rede básica
      const networkOnline = navigator.onLine;
      
      // Verificar conectividade Neon
      let neonConnection = false;
      let neonStats = null;
      
      if (typeof window !== 'undefined' && (window as any).testNeonConnection) {
        try {
          const result = await (window as any).testNeonConnection();
          neonConnection = result.success;
          
          if ((window as any).getNeonStats) {
            neonStats = (window as any).getNeonStats();
          }
        } catch (error) {
          console.error('Erro ao testar Neon:', error);
        }
      }

      setStatus({
        isOnline: networkOnline,
        neonConnection,
        lastCheck: Date.now(),
        stats: neonStats
      });

      console.log('📊 Status de conectividade:', {
        network: networkOnline,
        neon: neonConnection,
        stats: neonStats
      });

    } catch (error) {
      console.error('Erro ao verificar conectividade:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Verificar periodicamente
  useEffect(() => {
    checkConnectivity();
    
    const interval = setInterval(checkConnectivity, 15000); // A cada 15 segundos
    
    // Listener para mudanças de rede
    const handleOnline = () => {
      console.log('🌐 Rede online detectada');
      setTimeout(checkConnectivity, 1000);
    };
    
    const handleOffline = () => {
      console.log('🌐 Rede offline detectada');
      setStatus(prev => ({ ...prev, isOnline: false, neonConnection: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusColor = () => {
    if (!status.isOnline) return 'bg-red-500';
    if (!status.neonConnection) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!status.isOnline) return 'Sem rede';
    if (!status.neonConnection) return 'BD offline';
    return 'Online';
  };

  const resetConnection = async () => {
    if (typeof window !== 'undefined' && (window as any).resetNeonConnection) {
      console.log('🔄 Resetando conexão Neon...');
      setIsChecking(true);
      try {
        await (window as any).resetNeonConnection();
        console.log('✅ Reset concluído');
        setTimeout(checkConnectivity, 1000);
      } catch (error) {
        console.error('❌ Erro no reset:', error);
      } finally {
        setIsChecking(false);
      }
    }
  };

  const timeSinceCheck = Math.floor((Date.now() - status.lastCheck) / 1000);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px] z-50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
        <button
          onClick={checkConnectivity}
          disabled={isChecking}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Verificar conectividade"
        >
          <FiRefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-1 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <FiWifi className="w-3 h-3" />
            Rede:
          </span>
          <span className={status.isOnline ? 'text-green-600' : 'text-red-600'}>
            {status.isOnline ? 'OK' : 'Offline'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <FiDatabase className="w-3 h-3" />
            Neon:
          </span>
          <span className={status.neonConnection ? 'text-green-600' : 'text-red-600'}>
            {status.neonConnection ? 'OK' : 'Offline'}
          </span>
        </div>

        {status.stats && (
          <div className="flex items-center justify-between">
            <span>Clientes:</span>
            <span>{status.stats.workingClients}/{status.stats.totalClients}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span>Última check:</span>
          <span>{timeSinceCheck}s atrás</span>
        </div>
      </div>

      {!status.neonConnection && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <button
            onClick={resetConnection}
            disabled={isChecking}
            className="w-full px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            {isChecking ? 'Resetando...' : 'Reset Conexão'}
          </button>
        </div>
      )}
    </div>
  );
};

// Versão compacta para produção
export const ConnectivityIndicator: React.FC = () => {
  const [status, setStatus] = useState({
    isOnline: navigator.onLine,
    neonConnection: false
  });

  useEffect(() => {
    const checkStatus = async () => {
      let neonConnection = false;
      if (typeof window !== 'undefined' && (window as any).testNeonConnection) {
        try {
          const result = await (window as any).testNeonConnection();
          neonConnection = result.success;
        } catch {
          neonConnection = false;
        }
      }
      
      setStatus({
        isOnline: navigator.onLine,
        neonConnection
      });
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // A cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const getColor = () => {
    if (!status.isOnline) return 'text-red-500';
    if (!status.neonConnection) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="flex items-center gap-1">
      <FiDatabase className={`w-4 h-4 ${getColor()}`} />
      <span className={`text-xs ${getColor()}`}>
        {!status.isOnline ? 'Offline' : !status.neonConnection ? 'Reconectando' : 'Online'}
      </span>
    </div>
  );
};
