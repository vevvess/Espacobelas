import React, { useState, useEffect } from 'react';
import { FiWifiOff, FiWifi, FiAlertTriangle } from 'react-icons/fi';

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className = '' }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dbStatus, setDbStatus] = useState<'online' | 'offline' | 'unknown'>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Verificar status do banco de dados
  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        // Verificar se tem função de emergência disponível
        if (typeof (window as any).emergencyDB?.checkStatus === 'function') {
          try {
            const status = await (window as any).emergencyDB.checkStatus();
            setDbStatus(status.status === 'online' ? 'online' : 'offline');
          } catch (statusError) {
            console.warn('Erro ao verificar status do DB:', statusError);
            setDbStatus('offline');
          }
        } else {
          // Se não tem função disponível, assumir offline
          setDbStatus('offline');
        }
      } catch (error) {
        console.error('Erro geral no check de DB:', error);
        setDbStatus('offline');
      }
    };

    // Delay inicial para evitar erro no mount
    setTimeout(checkDbStatus, 1000);

    const interval = setInterval(() => {
      checkDbStatus().catch((error) => {
        console.warn('Erro no check periódico:', error);
        setDbStatus('offline');
      });
    }, 30000); // Check a cada 30s

    return () => clearInterval(interval);
  }, []);

  if (isOnline && dbStatus === 'online') {
    return null; // Não mostrar nada quando tudo está ok
  }

  const getIcon = () => {
    if (!isOnline) return <FiWifiOff className="w-4 h-4" />;
    if (dbStatus === 'offline') return <FiAlertTriangle className="w-4 h-4" />;
    return <FiWifi className="w-4 h-4" />;
  };

  const getMessage = () => {
    if (!isOnline) return 'Sem conexão com internet';
    if (dbStatus === 'offline') return 'Banco de dados indisponível - usando dados offline';
    return 'Verificando conexão...';
  };

  const getColors = () => {
    if (!isOnline) return 'bg-red-100 text-red-800 border-red-200';
    if (dbStatus === 'offline') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm ${getColors()} ${className}`}>
      {getIcon()}
      <span>{getMessage()}</span>
      
      {dbStatus === 'offline' && (
        <button
          onClick={() => window.location.reload()}
          className="ml-2 px-2 py-1 bg-yellow-200 hover:bg-yellow-300 rounded text-xs transition-colors"
        >
          Reconectar
        </button>
      )}
    </div>
  );
}
