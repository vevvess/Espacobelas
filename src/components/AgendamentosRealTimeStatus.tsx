import React from "react";
import { FiWifi, FiWifiOff, FiRefreshCw, FiClock } from "react-icons/fi";

interface AgendamentosRealTimeStatusProps {
  isActive: boolean;
  lastUpdateTime?: string;
  onForceRefresh?: () => void;
}

export function AgendamentosRealTimeStatus({
  isActive,
  lastUpdateTime,
  onForceRefresh,
}: AgendamentosRealTimeStatusProps) {
  const formatLastUpdate = () => {
    if (!lastUpdateTime) return "Nunca";

    const now = new Date();
    const updateTime = new Date(lastUpdateTime);
    const diffInMinutes = Math.floor(
      (now.getTime() - updateTime.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Agora";
    if (diffInMinutes === 1) return "1 min atrás";
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return "1 hora atrás";
    if (diffInHours < 24) return `${diffInHours} horas atrás`;

    return updateTime.toLocaleDateString("pt-BR");
  };

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <div className="flex items-center gap-1">
        {isActive ? (
          <FiWifi className="w-3 h-3 text-green-500" />
        ) : (
          <FiWifiOff className="w-3 h-3 text-red-500" />
        )}
        <span>{isActive ? "Tempo real ativo" : "Offline"}</span>
      </div>

      <div className="flex items-center gap-1">
        <FiClock className="w-3 h-3" />
        <span>Atualizado: {formatLastUpdate()}</span>
      </div>

      {onForceRefresh && (
        <button
          onClick={onForceRefresh}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          title="Forçar atualização"
        >
          <FiRefreshCw className="w-3 h-3" />
          <span>Atualizar</span>
        </button>
      )}
    </div>
  );
}
