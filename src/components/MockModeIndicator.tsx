import React, { useState, useEffect } from 'react';
import { FiInfo, FiX } from 'react-icons/fi';
import { MockFallbackService } from '@/lib/mockFallback';

export function MockModeIndicator() {
  const [isMockActive, setIsMockActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verificar status do mock imediatamente e depois a cada 2 segundos
    const checkMockStatus = () => {
      const mockActive = MockFallbackService.isActivated();
      setIsMockActive(mockActive);

      if (mockActive && !isVisible) {
        setIsVisible(true);
        console.log('📋 Modo mock detectado - mostrando notificação');
      }
    };

    // Verificar imediatamente
    checkMockStatus();

    const interval = setInterval(checkMockStatus, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isMockActive || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded-lg shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FiInfo className="h-5 w-5 text-orange-400" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium">
              Modo Demonstração Ativo
            </h3>
            <div className="mt-2 text-sm">
              <p>
                Problema de conectividade detectado. Usando dados de exemplo para manter o aplicativo funcionando.
              </p>
            </div>
            <div className="mt-3">
              <div className="flex">
                <button
                  onClick={() => {
                    MockFallbackService.deactivate();
                    setIsVisible(false);
                    window.location.reload();
                  }}
                  className="bg-orange-200 text-orange-800 px-3 py-1 rounded text-xs hover:bg-orange-300 transition-colors mr-2"
                >
                  Tentar Reconectar
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-orange-600 hover:text-orange-800 transition-colors"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
