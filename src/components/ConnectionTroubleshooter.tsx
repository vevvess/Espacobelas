import React, { useState, useEffect } from 'react';
import { FiWifi, FiWifiOff, FiRefreshCw, FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi';
import { testConnectivity, getNetworkStatus } from '@/utils/networkUtils';
import { connectionMonitor } from '@/lib/connectionMonitor';

interface ConnectionTroubleshooterProps {
  onRetry?: () => void;
  onClose?: () => void;
  className?: string;
}

export function ConnectionTroubleshooter({ 
  onRetry, 
  onClose,
  className = '' 
}: ConnectionTroubleshooterProps) {
  const [isTestingConnectivity, setIsTestingConnectivity] = useState(false);
  const [connectivityTest, setConnectivityTest] = useState<boolean | null>(null);
  const [networkStatus, setNetworkStatus] = useState(() => getNetworkStatus());
  const [connectionHealth, setConnectionHealth] = useState(() => connectionMonitor.getConnectionHealth());

  const runConnectivityTest = async () => {
    setIsTestingConnectivity(true);
    try {
      const hasConnectivity = await testConnectivity();
      setConnectivityTest(hasConnectivity);
    } catch (error) {
      setConnectivityTest(false);
    } finally {
      setIsTestingConnectivity(false);
    }
  };

  const refreshData = () => {
    setNetworkStatus(getNetworkStatus());
    setConnectionHealth(connectionMonitor.getConnectionHealth());
  };

  useEffect(() => {
    // Update network status and connection health
    refreshData();
    
    // Run initial connectivity test
    runConnectivityTest();

    // Listen for network changes
    const handleNetworkChange = () => {
      refreshData();
      runConnectivityTest();
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, []);

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <FiRefreshCw className="animate-spin" />;
    return status ? <FiCheck className="text-green-600" /> : <FiX className="text-red-600" />;
  };

  const getStatusText = (status: boolean | null) => {
    if (status === null) return 'Testando...';
    return status ? 'OK' : 'Falhou';
  };

  const getRecommendations = () => {
    const recommendations = [];

    if (!networkStatus.isOnline) {
      recommendations.push('🔌 Verifique se você está conectado à internet');
    }

    if (connectivityTest === false) {
      recommendations.push('🌐 Teste acessar outros sites para verificar sua conexão');
      recommendations.push('📶 Tente trocar de rede Wi-Fi ou usar dados móveis');
    }

    if (connectionHealth.status === 'critical') {
      recommendations.push('⏳ O servidor pode estar temporariamente indisponível');
      recommendations.push('🔄 Aguarde alguns minutos e tente novamente');
    }

    if (networkStatus.effectiveType && ['slow-2g', '2g'].includes(networkStatus.effectiveType)) {
      recommendations.push('🐌 Sua conexão está lenta - considere usar uma rede mais rápida');
    }

    if (recommendations.length === 0) {
      recommendations.push('🔧 Tente recarregar a página ou feche e abra o navegador');
      recommendations.push('🕒 Se o problema persistir, tente novamente em alguns minutos');
    }

    return recommendations;
  };

  return (
    <div className={`bg-white border border-red-200 rounded-lg p-6 shadow-lg ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <FiAlertTriangle className="w-6 h-6 text-red-600" />
        <h3 className="text-lg font-semibold text-red-800">
          Problema de Conectividade Detectado
        </h3>
      </div>

      <div className="space-y-4">
        {/* Status da Rede */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">Status da Conexão</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Status Online:</span>
              <div className="flex items-center space-x-2">
                {networkStatus.isOnline ? (
                  <FiWifi className="text-green-600" />
                ) : (
                  <FiWifiOff className="text-red-600" />
                )}
                <span className={networkStatus.isOnline ? 'text-green-600' : 'text-red-600'}>
                  {networkStatus.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>Tipo de Rede:</span>
              <span className="capitalize">{networkStatus.type}</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Velocidade:</span>
              <span className="capitalize">{networkStatus.effectiveType}</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Teste de Conectividade:</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(connectivityTest)}
                <span>{getStatusText(connectivityTest)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Saúde da Conexão */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">Saúde da Conexão</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <span className={`capitalize ${
                connectionHealth.status === 'good' ? 'text-green-600' :
                connectionHealth.status === 'poor' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {connectionHealth.status === 'good' ? 'Bom' :
                 connectionHealth.status === 'poor' ? 'Instável' : 'Crítico'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Taxa de Falhas:</span>
              <span>{Math.round(connectionHealth.failureRate * 100)}%</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Falhas Recentes:</span>
              <span>{connectionHealth.recentFailures}</span>
            </div>
          </div>

          <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
            <p className="text-sm text-blue-800">{connectionHealth.recommendation}</p>
          </div>
        </div>

        {/* Recomendações */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-3">Recomendações</h4>
          <ul className="space-y-2 text-sm text-yellow-700">
            {getRecommendations().map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="flex-shrink-0 mt-0.5">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={runConnectivityTest}
            disabled={isTestingConnectivity}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiRefreshCw className={`w-4 h-4 ${isTestingConnectivity ? 'animate-spin' : ''}`} />
            <span>Testar Conexão</span>
          </button>

          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Tentar Novamente</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook to detect when troubleshooter should be shown
export function useConnectionTroubleshooterTrigger() {
  const [shouldShow, setShouldShow] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    const handleConnectionError = () => {
      setErrorCount(prev => {
        const newCount = prev + 1;
        // Show troubleshooter after 3 consecutive fetch errors
        if (newCount >= 3) {
          setShouldShow(true);
        }
        return newCount;
      });
    };

    const handleConnectionSuccess = () => {
      setErrorCount(0);
      setShouldShow(false);
    };

    // Listen to connection monitor events
    const unsubscribe = connectionMonitor.addListener((event) => {
      if (event.type === 'fetch_error') {
        handleConnectionError();
      } else if (event.type === 'success') {
        handleConnectionSuccess();
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  return {
    shouldShow,
    errorCount,
    dismiss: () => setShouldShow(false),
    reset: () => {
      setErrorCount(0);
      setShouldShow(false);
    }
  };
}
