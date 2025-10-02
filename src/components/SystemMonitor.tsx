import React, { useState, useEffect } from 'react';
import { FiActivity, FiDatabase, FiWifi, FiClock, FiRefreshCw } from 'react-icons/fi';
import { useConnectionStatus } from '@/lib/alwaysOnlineConnector';

interface SystemMonitorProps {
  showDetails?: boolean;
  className?: string;
}

export const SystemMonitor: React.FC<SystemMonitorProps> = ({
  showDetails = true,
  className = ""
}) => {
  const [realTimeStatus, setRealTimeStatus] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  
  const connectionStatus = useConnectionStatus();

  useEffect(() => {
    const updateStats = () => {
      // Verificar se os objetos globais existem
      if (typeof window !== 'undefined') {
        try {
          const rtUpdater = (window as any).realTimeUpdater;
          const smartCache = (window as any).smartCache;
          
          if (rtUpdater) {
            setRealTimeStatus(rtUpdater.getPollingStatus());
          }
          
          if (smartCache) {
            setCacheStats(smartCache.getStats());
          }
        } catch (error) {
          console.warn('Erro ao obter stats do sistema:', error);
        }
      }
    };

    // Atualizar imediatamente
    updateStats();

    // Atualizar a cada 5 segundos
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, []);

  const getConnectionColor = () => {
    if (connectionStatus.isConnected) return 'text-green-500';
    if (connectionStatus.retryAttempts > 0) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatLastPing = () => {
    const seconds = Math.floor(connectionStatus.timeSinceLastPing / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <FiActivity className={`w-4 h-4 ${getConnectionColor()}`} />
        <span className={`text-sm ${getConnectionColor()}`}>
          {connectionStatus.isConnected ? 'Online' : 'Reconnecting'}
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <FiActivity className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-gray-800">Status do Sistema</h3>
      </div>

      {/* Conectividade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <FiDatabase className={`w-5 h-5 ${getConnectionColor()}`} />
          <div>
            <div className="text-sm font-medium">Banco de Dados</div>
            <div className={`text-xs ${getConnectionColor()}`}>
              {connectionStatus.isConnected ? 'Conectado' : 'Reconectando'}
            </div>
            {connectionStatus.retryAttempts > 0 && (
              <div className="text-xs text-yellow-600">
                Tentativa {connectionStatus.retryAttempts}/3
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <FiClock className="w-5 h-5 text-blue-500" />
          <div>
            <div className="text-sm font-medium">Último Ping</div>
            <div className="text-xs text-gray-600">
              {formatLastPing()} atrás
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <FiRefreshCw className="w-5 h-5 text-green-500" />
          <div>
            <div className="text-sm font-medium">Queries Pendentes</div>
            <div className="text-xs text-gray-600">
              {connectionStatus.pendingQueries}
            </div>
          </div>
        </div>
      </div>

      {/* Tempo Real */}
      {realTimeStatus && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-2">Polling em Tempo Real</h4>
          <div className="space-y-2">
            {realTimeStatus.subscriptions?.map((sub: any, index: number) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{sub.key}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {sub.subscriberCount} listeners
                  </span>
                  <span className="text-xs text-blue-600">
                    {sub.interval ? `${sub.interval / 1000}s` : 'N/A'}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    sub.hasData ? 'bg-green-400' : 'bg-gray-300'
                  }`} />
                </div>
              </div>
            ))}
            {(!realTimeStatus.subscriptions || realTimeStatus.subscriptions.length === 0) && (
              <div className="text-sm text-gray-500 italic">
                Nenhum polling ativo
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cache */}
      {cacheStats && (
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Cache Inteligente</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Entradas Ativas:</span>
              <span className="ml-2 font-medium">{cacheStats.activeEntries}</span>
            </div>
            <div>
              <span className="text-gray-600">Tamanho:</span>
              <span className="ml-2 font-medium">{cacheStats.approximateSize}</span>
            </div>
            <div>
              <span className="text-gray-600">Dependências:</span>
              <span className="ml-2 font-medium">{cacheStats.dependencies}</span>
            </div>
            <div>
              <span className="text-gray-600">Regras:</span>
              <span className="ml-2 font-medium">{cacheStats.invalidationRules}</span>
            </div>
          </div>
        </div>
      )}

      {/* Ações de Debug */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={connectionStatus.forceHealthCheck}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={connectionStatus.retryAttempts > 0}
          >
            Testar Conexão
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).realTimeUpdater) {
                console.log('Status do Polling:', (window as any).realTimeUpdater.getPollingStatus());
              }
            }}
            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
          >
            Log Polling
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).smartCache) {
                console.log('Stats do Cache:', (window as any).smartCache.getStats());
              }
            }}
            className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Log Cache
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente compacto para header
export const SystemStatusIndicator: React.FC = () => {
  const { isConnected, retryAttempts, pendingQueries } = useConnectionStatus();
  
  const getStatusColor = () => {
    if (isConnected && pendingQueries === 0) return 'bg-green-400';
    if (isConnected && pendingQueries > 0) return 'bg-yellow-400';
    if (retryAttempts > 0) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const getStatusText = () => {
    if (isConnected && pendingQueries === 0) return 'Sistema Online';
    if (isConnected && pendingQueries > 0) return `${pendingQueries} pendentes`;
    if (retryAttempts > 0) return 'Reconectando...';
    return 'Sistema Offline';
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className="text-xs text-gray-600">{getStatusText()}</span>
    </div>
  );
};
