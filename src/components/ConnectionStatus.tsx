import React from "react";
import {
  FiWifi,
  FiWifiOff,
  FiAlertTriangle,
  FiRefreshCw,
} from "react-icons/fi";

interface ConnectionStatusProps {
  error: string | null;
  onRetry?: () => void;
  className?: string;
}

export function ConnectionStatus({
  error,
  onRetry,
  className = "",
}: ConnectionStatusProps) {
  if (!error) {
    return null;
  }

  const isOffline =
    error.includes("Sem conexão") ||
    error.includes("Failed to fetch") ||
    error.includes("Timeout");

  return (
    <div
      className={`bella-card border-l-4 ${
        isOffline
          ? "border-l-orange-500 bg-orange-50"
          : "border-l-red-500 bg-red-50"
      } ${className}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {isOffline ? (
            <FiWifiOff className="w-5 h-5 text-orange-600" />
          ) : (
            <FiAlertTriangle className="w-5 h-5 text-red-600" />
          )}
        </div>

        <div className="flex-1">
          <h3
            className={`font-semibold ${
              isOffline ? "text-orange-800" : "text-red-800"
            }`}
          >
            {isOffline ? "⚠️ Modo Offline" : "❌ Erro de Conexão"}
          </h3>

          <p
            className={`text-sm mt-1 ${
              isOffline ? "text-orange-700" : "text-red-700"
            }`}
          >
            {isOffline
              ? "Sem conexão com o banco de dados. Algumas funcionalidades estão limitadas."
              : error}
          </p>

          {isOffline && (
            <div className="mt-2 text-xs text-orange-600">
              <div className="space-y-1">
                <div>
                  • Cores dos funcionários: ✅ Funcionando (localStorage)
                </div>
                <div>• Visualização: ⚠️ Dados limitados</div>
                <div>• Criação/Edição: ❌ Indisponível</div>
              </div>
            </div>
          )}
        </div>

        {onRetry && (
          <div className="flex-shrink-0">
            <button
              onClick={onRetry}
              className={`p-2 rounded-lg transition-colors ${
                isOffline
                  ? "text-orange-600 hover:bg-orange-100"
                  : "text-red-600 hover:bg-red-100"
              }`}
              title="Tentar reconectar"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Indicador de status visual */}
      <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-orange-200">
        <div className="flex items-center space-x-1">
          <div
            className={`w-2 h-2 rounded-full ${
              isOffline ? "bg-orange-500" : "bg-red-500"
            }`}
          />
          <span className="text-xs text-gray-600">
            Status: {isOffline ? "Offline" : "Erro"}
          </span>
        </div>

        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <FiWifi className="w-3 h-3" />
          <span>Tentando reconectar...</span>
        </div>
      </div>
    </div>
  );
}
