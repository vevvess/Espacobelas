import React, { useState, useEffect } from "react";
import { FiWifi, FiWifiOff, FiAlertCircle, FiRefreshCw, FiDownload } from "react-icons/fi";
import { testConnection } from "@/lib/neon";
import { connectionRecovery } from "@/utils/connectionRecovery";
import { networkDetector } from "@/lib/networkDetection";
import { offlineStorage } from "@/lib/offlineStorage";

interface ConnectionStatusProps {
  className?: string;
}

export default function DatabaseConnectionStatus({ className = "" }: ConnectionStatusProps) {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'testing' | 'offline'>('testing');
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [retryCount, setRetryCount] = useState(0);
  const [isNetworkOnline, setIsNetworkOnline] = useState(networkDetector.getStatus());
  const [offlineStats, setOfflineStats] = useState(offlineStorage.getStats());

  const checkConnection = async () => {
    setStatus('testing');
    try {
      const result = await testConnection();
      if (result.success) {
        setStatus('connected');
        setRetryCount(0);
      } else {
        setStatus('disconnected');
        setRetryCount(prev => prev + 1);
      }
    } catch (error) {
      setStatus('disconnected');
      setRetryCount(prev => prev + 1);
      console.error("Connection check failed:", error);
    }
    setLastCheck(new Date());
  };

  useEffect(() => {
    // Verificar status inicial
    if (!networkDetector.getStatus()) {
      setStatus('offline');
    } else {
      checkConnection();
    }

    // Monitorar mudanças de rede
    const handleNetworkChange = (online: boolean) => {
      setIsNetworkOnline(online);
      if (!online) {
        setStatus('offline');
      } else {
        checkConnection();
      }
    };

    networkDetector.addListener(handleNetworkChange);

    // Verificar conexão a cada 30 segundos
    const interval = setInterval(() => {
      if (networkDetector.getStatus()) {
        checkConnection();
      }
      setOfflineStats(offlineStorage.getStats());
    }, 30000);

    return () => {
      clearInterval(interval);
      networkDetector.removeListener(handleNetworkChange);
    };
  }, []);

  const handleRetry = async () => {
    setStatus('testing');
    const recovered = await connectionRecovery.attemptRecovery();
    if (recovered) {
      setStatus('connected');
      setRetryCount(0);
    } else {
      setStatus('disconnected');
      setRetryCount(prev => prev + 1);
    }
    setLastCheck(new Date());
  };

  if (status === 'connected') {
    return null; // Não mostrar nada quando conectado
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg border ${
        status === 'disconnected' 
          ? 'bg-red-50 border-red-200 text-red-800'
          : 'bg-yellow-50 border-yellow-200 text-yellow-800'
      }`}>
        {status === 'testing' ? (
          <FiRefreshCw className="w-4 h-4 animate-spin" />
        ) : status === 'disconnected' ? (
          <FiWifiOff className="w-4 h-4" />
        ) : (
          <FiAlertCircle className="w-4 h-4" />
        )}
        
        <div className="text-sm">
          <div className="font-medium">
            {status === 'testing' && 'Verificando conexão...'}
            {status === 'disconnected' && 'Conexão instável'}
          </div>
          <div className="text-xs opacity-75">
            {status === 'disconnected' && (
              <>
                Tentativas: {retryCount} | 
                <button 
                  onClick={handleRetry}
                  className="ml-1 underline hover:no-underline"
                >
                  Tentar novamente
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
