import React from "react";
import {
  FiWifi,
  FiWifiOff,
  FiDatabase,
  FiAlertTriangle,
  FiRefreshCw,
  FiClock,
} from "react-icons/fi";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { getCircuitBreakerStatus } from "../lib/neon";

export const NetworkStatusIndicator: React.FC = () => {
  const {
    isOnline,
    isDatabaseConnected,
    error,
    lastChecked,
    checkDatabaseConnection,
  } = useNetworkStatus();

  const circuitStatus = getCircuitBreakerStatus();

  // Não mostrar se tudo está funcionando e circuit breaker está ok
  if (isOnline && isDatabaseConnected && !circuitStatus.isOpen) {
    return null;
  }

  const getStatusIcon = () => {
    if (!isOnline) return <FiWifiOff className="w-4 h-4" />;
    if (!isDatabaseConnected) return <FiDatabase className="w-4 h-4" />;
    return <FiAlertTriangle className="w-4 h-4" />;
  };

  const getStatusColor = () => {
    if (!isOnline) return "bg-red-500";
    if (!isDatabaseConnected) return "bg-orange-500";
    return "bg-yellow-500";
  };

  const getStatusText = () => {
    if (!isOnline) return "Sem internet";
    if (circuitStatus.isOpen) {
      const timeToReset = circuitStatus.timeToReset
        ? Math.ceil(circuitStatus.timeToReset / 1000)
        : 0;
      return `Aguardando reconexão (${timeToReset}s)`;
    }
    if (!isDatabaseConnected) return "Problema na conexão";
    return "Conexão instável";
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${getStatusColor()} text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2`}
    >
      {getStatusIcon()}
      <span className="text-sm font-medium">{getStatusText()}</span>
      {!isOnline || !isDatabaseConnected ? (
        <button
          onClick={checkDatabaseConnection}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          title="Tentar reconectar"
        >
          <FiRefreshCw className="w-3 h-3" />
        </button>
      ) : null}
      {lastChecked && (
        <span className="text-xs opacity-75">
          {lastChecked.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};
