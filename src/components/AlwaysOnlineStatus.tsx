import React, { useState, useEffect } from 'react';
import { FiWifi, FiWifiOff, FiLoader, FiCheck, FiAlertTriangle } from 'react-icons/fi';

// Hook seguro para conectividade usando o sistema híbrido
const useConnectionStatus = () => {
  const [status, setStatus] = useState(() => {
    try {
      // Verificar se sistema híbrido está disponível
      if (typeof window !== 'undefined' && (window as any).hybridDBStatus) {
        const systemStatus = (window as any).hybridDBStatus;
        return {
          isConnected: systemStatus.remoteAvailable || false,
          retryAttempts: 0,
          lastSuccessfulPing: Date.now(),
          pendingQueries: 0,
          timeSinceLastPing: 0,
          forceHealthCheck: () => Promise.resolve(systemStatus.remoteAvailable || false)
        };
      }
    } catch (error) {
      console.warn('Erro ao acessar alwaysOnlineService:', error);
    }

    // Fallback padrão
    return {
      isConnected: navigator?.onLine || false,
      retryAttempts: 0,
      lastSuccessfulPing: Date.now(),
      pendingQueries: 0,
      timeSinceLastPing: 0,
      forceHealthCheck: () => Promise.resolve(false)
    };
  });

  useEffect(() => {
    const updateStatus = () => {
      try {
        if (typeof window !== 'undefined' && (window as any).alwaysOnlineService) {
          const serviceStatus = (window as any).alwaysOnlineService.getStatus();
          setStatus({
            isConnected: serviceStatus.isOnline || false,
            retryAttempts: serviceStatus.consecutiveFailures || 0,
            lastSuccessfulPing: serviceStatus.lastSuccessfulOp || Date.now(),
            pendingQueries: serviceStatus.activeConnections || 0,
            timeSinceLastPing: serviceStatus.timeSinceLastSuccess || 0,
            forceHealthCheck: () => (window as any).alwaysOnlineService?.testConnection() || Promise.resolve(false)
          });
        }
      } catch (error) {
        console.warn('Erro ao atualizar status:', error);
      }
    };

    // Atualizar a cada 2 segundos
    const interval = setInterval(updateStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  return status;
};

interface AlwaysOnlineStatusProps {
  showDetails?: boolean;
  className?: string;
}

export const AlwaysOnlineStatus: React.FC<AlwaysOnlineStatusProps> = ({
  showDetails = false,
  className = ""
}) => {
  const connectionStatus = useConnectionStatus();
  const {
    isConnected = false,
    retryAttempts = 0,
    lastSuccessfulPing = Date.now(),
    pendingQueries = 0,
    timeSinceLastPing = 0,
    forceHealthCheck = () => Promise.resolve(false)
  } = connectionStatus || {};

  const getStatusInfo = () => {
    if (isConnected) {
      const minutesAgo = Math.floor(timeSinceLastPing / 60000);
      return {
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        icon: FiCheck,
        status: 'Online',
        details: minutesAgo > 0 ? `Último ping: ${minutesAgo}min atrás` : 'Ativo agora'
      };
    }

    if (retryAttempts > 0) {
      return {
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        icon: FiLoader,
        status: 'Reconectando',
        details: `Tentativa ${retryAttempts}/3`
      };
    }

    return {
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      icon: FiWifiOff,
      status: 'Offline',
      details: 'Sem conexão'
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className={`p-2 rounded-lg ${statusInfo.bgColor} cursor-pointer hover:opacity-80 transition-opacity`}
        onClick={forceHealthCheck}
        title="Clique para testar conexão"
      >
        <StatusIcon 
          className={`w-4 h-4 ${statusInfo.color} ${retryAttempts > 0 ? 'animate-spin' : ''}`} 
        />
      </div>

      {showDetails && (
        <div className="flex flex-col text-sm">
          <span className={`font-medium ${statusInfo.color}`}>
            {statusInfo.status}
          </span>
          <span className="text-gray-500 text-xs">
            {statusInfo.details}
          </span>
          {pendingQueries > 0 && (
            <span className="text-amber-600 text-xs">
              {pendingQueries} queries pendentes
            </span>
          )}
        </div>
      )}

      {!showDetails && (
        <span className={`text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.status}
        </span>
      )}
    </div>
  );
};

// Componente compacto para header
export const AlwaysOnlineIndicator: React.FC = () => {
  const connectionStatus = useConnectionStatus();
  const { isConnected = false, retryAttempts = 0 } = connectionStatus || {};

  if (isConnected) {
    return (
      <div className="flex items-center gap-1 text-green-600">
        <FiWifi className="w-3 h-3" />
        <span className="text-xs font-medium">Online</span>
      </div>
    );
  }

  if (retryAttempts > 0) {
    return (
      <div className="flex items-center gap-1 text-yellow-600">
        <FiLoader className="w-3 h-3 animate-spin" />
        <span className="text-xs font-medium">Conectando</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-red-600">
      <FiWifiOff className="w-3 h-3" />
      <span className="text-xs font-medium">Offline</span>
    </div>
  );
};

// Componente para debug/admin
export const AlwaysOnlineDebug: React.FC = () => {
  const status = useConnectionStatus() || {
    isConnected: false,
    retryAttempts: 0,
    pendingQueries: 0,
    timeSinceLastPing: 0,
    forceHealthCheck: () => Promise.resolve(false)
  };

  if (!window.location.hostname.includes('localhost')) {
    return null; // Só mostrar em desenvolvimento
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs max-w-sm">
      <div className="font-medium text-gray-700 mb-2">Always Online Debug</div>
      <div className="space-y-1 text-gray-600">
        <div>Status: <span className={status.isConnected ? 'text-green-600' : 'text-red-600'}>
          {status.isConnected ? 'Connected' : 'Disconnected'}
        </span></div>
        <div>Tentativas: {status.retryAttempts}/3</div>
        <div>Queries pendentes: {status.pendingQueries}</div>
        <div>Último ping: {Math.floor(status.timeSinceLastPing / 1000)}s atrás</div>
        <button 
          className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          onClick={status.forceHealthCheck}
        >
          Testar Conexão
        </button>
      </div>
    </div>
  );
};
