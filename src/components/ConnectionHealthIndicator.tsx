import React from 'react';
import { FiWifi, FiWifiOff, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { useConnectionMonitor } from '@/lib/connectionMonitor';
import { useNetworkStatus } from '@/lib/networkDetection';

export function ConnectionHealthIndicator() {
  const connectionHealth = useConnectionMonitor();
  const { isOnline } = useNetworkStatus();

  const getStatusIcon = () => {
    if (!isOnline) {
      return <FiWifiOff className="w-4 h-4" />;
    }

    switch (connectionHealth.status) {
      case 'good':
        return <FiCheckCircle className="w-4 h-4" />;
      case 'poor':
        return <FiWifi className="w-4 h-4" />;
      case 'critical':
        return <FiAlertTriangle className="w-4 h-4" />;
      default:
        return <FiWifi className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    if (!isOnline) {
      return 'text-gray-500 bg-gray-100';
    }

    switch (connectionHealth.status) {
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'poor':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = () => {
    if (!isOnline) {
      return 'Offline';
    }

    switch (connectionHealth.status) {
      case 'good':
        return 'Estável';
      case 'poor':
        return 'Instável';
      case 'critical':
        return 'Crítico';
      default:
        return 'Verificando...';
    }
  };

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      {connectionHealth.recentFailures > 0 && (
        <span className="text-xs opacity-75">
          ({connectionHealth.recentFailures} erros)
        </span>
      )}
    </div>
  );
}

export function ConnectionHealthTooltip() {
  const connectionHealth = useConnectionMonitor();
  const { isOnline } = useNetworkStatus();

  if (!isOnline) {
    return (
      <div className="bg-white border rounded-lg p-4 shadow-lg max-w-sm">
        <h4 className="font-semibold text-red-600 mb-2">Sem conexão de rede</h4>
        <p className="text-sm text-gray-600">
          Verifique sua conexão com a internet. O aplicativo está usando dados salvos localmente.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4 shadow-lg max-w-sm">
      <h4 className="font-semibold text-gray-800 mb-2">Status da Conexão</h4>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Status:</span>
          <span className={`font-medium ${
            connectionHealth.status === 'good' ? 'text-green-600' :
            connectionHealth.status === 'poor' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {connectionHealth.status === 'good' ? 'Estável' :
             connectionHealth.status === 'poor' ? 'Instável' : 'Crítico'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Taxa de falha:</span>
          <span>{Math.round(connectionHealth.failureRate * 100)}%</span>
        </div>
        
        <div className="flex justify-between">
          <span>Erros recentes:</span>
          <span>{connectionHealth.recentFailures}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t">
        <p className="text-xs text-gray-600">
          {connectionHealth.recommendation}
        </p>
      </div>
    </div>
  );
}
