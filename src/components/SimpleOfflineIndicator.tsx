import React, { useState, useEffect } from 'react';
import { FiWifiOff, FiWifi, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { getOfflineStatus, resetOfflineMode } from '@/lib/simpleOfflineDetector';

interface SimpleOfflineIndicatorProps {
  className?: string;
}

export function SimpleOfflineIndicator({ className = '' }: SimpleOfflineIndicatorProps) {
  const [status, setStatus] = useState(getOfflineStatus());

  useEffect(() => {
    const updateStatus = () => {
      setStatus(getOfflineStatus());
    };

    // Verificar status a cada 5 segundos
    const interval = setInterval(updateStatus, 5000);

    // Escutar eventos de conectividade do navegador
    const handleOnline = () => {
      console.log('🌐 Navegador voltou online');
      setTimeout(updateStatus, 1000); // Delay para dar tempo de reconectar
    };
    
    const handleOffline = () => {
      console.log('🌐 Navegador ficou offline');
      updateStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Não mostrar nada se estiver tudo ok
  if (!status.offline) {
    return null;
  }

  const getIcon = () => {
    if (!navigator.onLine) return <FiWifiOff className="w-4 h-4" />;
    if (status.errorCount > 0) return <FiAlertTriangle className="w-4 h-4" />;
    return <FiWifi className="w-4 h-4" />;
  };

  const getColors = () => {
    if (!navigator.onLine) return 'bg-red-100 text-red-800 border-red-200';
    if (status.errorCount > 0) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const handleReconnect = () => {
    console.log('🔄 Tentando reconectar...');
    resetOfflineMode();
    setStatus(getOfflineStatus());
    
    // Recarregar página após pequeno delay
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm ${getColors()} ${className}`}>
      {getIcon()}
      <span className="flex-1">{status.reason}</span>
      
      {status.errorCount > 0 && (
        <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
          {status.errorCount} erros
        </span>
      )}
      
      <button
        onClick={handleReconnect}
        className="flex items-center space-x-1 px-2 py-1 bg-white bg-opacity-20 hover:bg-opacity-40 rounded text-xs transition-all"
        title="Tentar reconectar"
      >
        <FiRefreshCw className="w-3 h-3" />
        <span>Reconectar</span>
      </button>
    </div>
  );
}
