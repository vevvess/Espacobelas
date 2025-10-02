import React, { useState, useEffect } from 'react';
import { FiWifiOff, FiRefreshCw, FiX } from 'react-icons/fi';
import { emergencyOfflineMode } from '@/utils/emergencyOfflineMode';

export function OfflineModeIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const unsubscribe = emergencyOfflineMode.addListener((offline) => {
      setIsOffline(offline);
      if (offline) {
        setIsDismissed(false); // Reset dismissal when going offline
      }
    });

    // Check initial state
    setIsOffline(emergencyOfflineMode.getStatus().isOfflineMode);

    return unsubscribe;
  }, []);

  const handleRetry = () => {
    emergencyOfflineMode.reset();
    window.location.reload();
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (!isOffline || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-red-600 text-white rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <div className="flex items-start space-x-3">
        <FiWifiOff className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-sm">Modo Offline Ativo</h4>
          <p className="text-xs mt-1 opacity-90">
            Problemas de conectividade detectados. Algumas funcionalidades podem estar limitadas.
          </p>
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleRetry}
              className="flex items-center space-x-1 px-2 py-1 bg-red-700 rounded text-xs hover:bg-red-800 transition-colors"
            >
              <FiRefreshCw className="w-3 h-3" />
              <span>Tentar Novamente</span>
            </button>
            <button
              onClick={handleDismiss}
              className="px-2 py-1 bg-red-700 rounded text-xs hover:bg-red-800 transition-colors"
            >
              Dispensar
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white hover:text-red-200 transition-colors"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Hook to use offline status in components
export function useOfflineStatus() {
  const [status, setStatus] = useState(() => emergencyOfflineMode.getStatus());

  useEffect(() => {
    const unsubscribe = emergencyOfflineMode.addListener(() => {
      setStatus(emergencyOfflineMode.getStatus());
    });

    const interval = setInterval(() => {
      setStatus(emergencyOfflineMode.getStatus());
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return status;
}
