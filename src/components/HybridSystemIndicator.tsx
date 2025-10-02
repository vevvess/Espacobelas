/**
 * Indicador Visual do Sistema Híbrido
 * Mostra se está usando PostgreSQL remoto ou IndexedDB local
 */

import React from 'react';
import { FiCloud, FiHardDrive, FiWifi, FiWifiOff, FiDatabase, FiSettings } from 'react-icons/fi';

interface HybridSystemIndicatorProps {
  systemStatus?: {
    mode: 'prisma' | 'local' | 'initializing';
    prismaAvailable: boolean;
    localReady: boolean;
    quotaError: boolean;
    lastCheck: string;
  };
  className?: string;
}

export function HybridSystemIndicator({ systemStatus, className = '' }: HybridSystemIndicatorProps) {
  if (!systemStatus) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 ${className}`}>
        <FiSettings className="w-4 h-4 animate-spin" />
        <span className="text-sm">Inicializando...</span>
      </div>
    );
  }

  const { mode, prismaAvailable, localReady, quotaError } = systemStatus;

  // Determinar estilo e ícone baseado no modo
  const getStatusStyle = () => {
    switch (mode) {
      case 'prisma':
        return {
          icon: FiCloud,
          color: quotaError ? 'text-orange-600' : 'text-green-600',
          bg: quotaError ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200',
          text: 'Prisma PostgreSQL',
          subtitle: quotaError ? 'Quota atingida - usando local' : 'Conectado com Prisma'
        };
      case 'local':
        return {
          icon: FiHardDrive,
          color: 'text-blue-600',
          bg: 'bg-blue-50 border-blue-200',
          text: 'IndexedDB Local',
          subtitle: 'Dados salvos localmente'
        };
      case 'initializing':
        return {
          icon: FiSettings,
          color: 'text-purple-600',
          bg: 'bg-purple-50 border-purple-200',
          text: 'Sistema Híbrido Prisma',
          subtitle: 'Inicializando conexões...'
        };
      default:
        return {
          icon: FiSettings,
          color: 'text-gray-600',
          bg: 'bg-gray-50 border-gray-200',
          text: 'Sistema em configuração',
          subtitle: 'Aguarde...'
        };
    }
  };

  const status = getStatusStyle();
  const StatusIcon = status.icon;

  return (
    <div className={`${status.bg} border rounded-lg p-3 ${className}`}>
      <div className="flex items-center space-x-3">
        {/* Ícone principal */}
        <div className={`${status.color}`}>
          <StatusIcon className="w-5 h-5" />
        </div>

        {/* Status text */}
        <div className="flex-1 min-w-0">
          <div className={`font-medium text-sm ${status.color}`}>
            {status.text}
          </div>
          <div className="text-xs text-gray-500">
            {status.subtitle}
          </div>
        </div>

        {/* Indicadores de conectividade */}
        <div className="flex items-center space-x-1">
          {/* Prisma */}
          <div className="flex items-center">
            {prismaAvailable && !quotaError ? (
              <FiWifi className="w-4 h-4 text-green-500" title="Prisma conectado" />
            ) : quotaError ? (
              <FiWifiOff className="w-4 h-4 text-orange-500" title="Quota atingida" />
            ) : (
              <FiWifiOff className="w-4 h-4 text-red-400" title="Prisma indisponível" />
            )}
          </div>

          {/* Local */}
          <div className="flex items-center">
            {localReady ? (
              <FiHardDrive className="w-4 h-4 text-blue-500" title="IndexedDB pronto" />
            ) : (
              <FiHardDrive className="w-4 h-4 text-gray-400" title="IndexedDB não inicializado" />
            )}
          </div>
        </div>
      </div>

      {/* Informações adicionais em modo expandido */}
      {mode === 'local' && (
        <div className="mt-2 pt-2 border-t border-blue-200">
          <div className="text-xs text-blue-600">
            💾 Dados mantidos offline localmente
          </div>
          <div className="text-xs text-gray-500">
            Será sincronizado quando Prisma voltar
          </div>
        </div>
      )}

      {mode === 'prisma' && !quotaError && (
        <div className="mt-2 pt-2 border-t border-green-200">
          <div className="text-xs text-green-600">
            ⚡ Sincronizado com Prisma em tempo real
          </div>
        </div>
      )}

      {quotaError && (
        <div className="mt-2 pt-2 border-t border-orange-200">
          <div className="text-xs text-orange-600">
            ⚠️ Quota atingida - usando IndexedDB local
          </div>
          <div className="text-xs text-gray-500">
            Dados salvos localmente até quota resetar
          </div>
        </div>
      )}
    </div>
  );
}

// Componente compacto para a barra de status
export function HybridSystemBadge({ systemStatus, className = '' }: HybridSystemIndicatorProps) {
  if (!systemStatus) {
    return (
      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs ${className}`}>
        <FiSettings className="w-3 h-3 animate-spin" />
        <span>Inicializando</span>
      </div>
    );
  }

  const { mode, prismaAvailable, quotaError } = systemStatus;

  const getBadgeStyle = () => {
    switch (mode) {
      case 'prisma':
        return {
          icon: FiCloud,
          style: quotaError ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700',
          text: quotaError ? 'Quota' : 'Prisma'
        };
      case 'local':
        return {
          icon: FiHardDrive,
          style: 'bg-blue-100 text-blue-700',
          text: 'Local'
        };
      case 'initializing':
        return {
          icon: FiDatabase,
          style: 'bg-purple-100 text-purple-700',
          text: 'Init'
        };
      default:
        return {
          icon: FiSettings,
          style: 'bg-gray-100 text-gray-600',
          text: 'Config'
        };
    }
  };

  const badge = getBadgeStyle();
  const BadgeIcon = badge.icon;

  return (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${badge.style} ${className}`}>
      <BadgeIcon className="w-3 h-3" />
      <span>{badge.text}</span>
      {mode === 'local' && (
        <FiWifiOff className="w-3 h-3 opacity-60" title="Offline" />
      )}
      {mode === 'prisma' && prismaAvailable && !quotaError && (
        <FiWifi className="w-3 h-3 opacity-60" title="Prisma Online" />
      )}
      {quotaError && (
        <FiWifiOff className="w-3 h-3 opacity-60" title="Quota Atingida" />
      )}
    </div>
  );
}

export default HybridSystemIndicator;
