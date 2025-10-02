import React, { useState } from "react";
import { FiMonitor, FiX } from "react-icons/fi";

interface AgendamentosDebugMonitorSafeProps {
  agendamentos: any[];
  lastSyncTime?: Date;
  loading: boolean;
  error?: string | null;
}

export function AgendamentosDebugMonitorSafe({
  agendamentos,
  lastSyncTime,
  loading,
  error,
}: AgendamentosDebugMonitorSafeProps) {
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
        title="Debug Monitor"
      >
        <FiMonitor className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">Debug Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <strong>Agendamentos:</strong> {agendamentos.length}
        </div>
        <div>
          <strong>Loading:</strong> {loading ? "✅" : "❌"}
        </div>
        <div>
          <strong>Error:</strong> {error ? "⚠️" : "✅"}
        </div>
        <div>
          <strong>Last Sync:</strong>{" "}
          {lastSyncTime ? lastSyncTime.toLocaleTimeString() : "Never"}
        </div>
        <div>
          <strong>Status:</strong> {loading ? "Carregando..." : "Pronto"}
        </div>
        {error && (
          <div className="text-red-600 text-xs mt-2 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
