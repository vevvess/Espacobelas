import React, { useState } from "react";
import { FiDatabase, FiCheck, FiX, FiRefreshCw } from "react-icons/fi";
import { testConnection, getCircuitBreakerStatus } from "../lib/neon";

export const DatabaseHealthCheck: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<{
    success: boolean;
    error?: string;
    timestamp: Date;
  } | null>(null);

  const performHealthCheck = async () => {
    setIsChecking(true);
    try {
      const result = await testConnection();
      setLastCheck({
        success: result.success,
        error: result.error,
        timestamp: new Date(),
      });
    } catch (error: any) {
      setLastCheck({
        success: false,
        error: error.message || "Erro na verificação",
        timestamp: new Date(),
      });
    } finally {
      setIsChecking(false);
    }
  };

  const circuitStatus = getCircuitBreakerStatus();

  return (
    <div className="border border-bella-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FiDatabase className="w-5 h-5 text-bella-600" />
          <h3 className="font-medium text-bella-800">Status do Banco</h3>
        </div>
        <button
          onClick={performHealthCheck}
          disabled={isChecking}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-bella-100 hover:bg-bella-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <FiRefreshCw
            className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`}
          />
          <span>{isChecking ? "Testando..." : "Testar"}</span>
        </button>
      </div>

      {/* Circuit Breaker Status */}
      <div className="mb-3">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-bella-600">Circuit Breaker:</span>
          {circuitStatus.isOpen ? (
            <span className="text-red-600 flex items-center space-x-1">
              <FiX className="w-4 h-4" />
              <span>Aberto ({circuitStatus.failureCount} falhas)</span>
            </span>
          ) : (
            <span className="text-green-600 flex items-center space-x-1">
              <FiCheck className="w-4 h-4" />
              <span>Fechado</span>
            </span>
          )}
        </div>
        {circuitStatus.isOpen && circuitStatus.timeToReset && (
          <div className="text-xs text-bella-500 mt-1">
            Reset em {Math.ceil(circuitStatus.timeToReset / 1000)}s
          </div>
        )}
      </div>

      {/* Last Check Result */}
      {lastCheck && (
        <div className="border-t border-bella-100 pt-3">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-bella-600">Último teste:</span>
            {lastCheck.success ? (
              <span className="text-green-600 flex items-center space-x-1">
                <FiCheck className="w-4 h-4" />
                <span>Sucesso</span>
              </span>
            ) : (
              <span className="text-red-600 flex items-center space-x-1">
                <FiX className="w-4 h-4" />
                <span>Falha</span>
              </span>
            )}
          </div>
          <div className="text-xs text-bella-500 mt-1">
            {lastCheck.timestamp.toLocaleTimeString()}
          </div>
          {lastCheck.error && (
            <div className="text-xs text-red-600 mt-1 bg-red-50 p-2 rounded">
              {lastCheck.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
