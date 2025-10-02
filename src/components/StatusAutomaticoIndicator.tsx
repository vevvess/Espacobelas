import React, { useState, useEffect } from 'react';
import { FiClock, FiRefreshCw, FiCheck, FiWifiOff, FiAlertTriangle } from 'react-icons/fi';

interface StatusAutomaticoIndicatorProps {
  agendamentos: any[];
  error?: string | null;
  loading?: boolean;
  isChangingDate?: boolean;
  hasCachedData?: boolean;
}

export const StatusAutomaticoIndicator: React.FC<StatusAutomaticoIndicatorProps> = ({ agendamentos, error, loading, isChangingDate, hasCachedData }) => {
  const [agendamentosComStatusAutomatico, setAgendamentosComStatusAutomatico] = useState(0);
  const [connectivityIssue, setConnectivityIssue] = useState(false);

  // Calcular quantos agendamentos deveriam ter status automático
  useEffect(() => {
    const agendamentosQueDeveriamEstarEmAndamento = agendamentos.filter(agendamento => {
      const dataHora = new Date(agendamento.data_hora);
      const agora = new Date();
      
      // Se é passado e não está concluído, deveria estar em andamento
      return dataHora <= agora && 
             !['concluido', 'cancelado', 'aguardando_confirmacao', 'aguardando_pagamento'].includes(agendamento.status) &&
             agendamento.status === 'em_andamento';
    });
    
    setAgendamentosComStatusAutomatico(agendamentosQueDeveriamEstarEmAndamento.length);
  }, [agendamentos]);

  const agendamentosHoje = agendamentos.filter(agendamento => {
    const dataAgendamento = new Date(agendamento.data_hora);
    const hoje = new Date();
    return dataAgendamento.toDateString() === hoje.toDateString();
  });

  const agendamentosEmAndamento = agendamentos.filter(agendamento =>
    agendamento.status === 'em_andamento'
  );

  // Detectar problemas de conectividade
  useEffect(() => {
    const hasConnectivityIssue = error && (
      error.includes('Failed to fetch') ||
      error.includes('fetch') ||
      error.includes('conectividade') ||
      error.includes('internet')
    );
    setConnectivityIssue(Boolean(hasConnectivityIssue));
  }, [error]);

  // Se há problemas de conectividade, mostrar alerta
  if (connectivityIssue) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <FiWifiOff className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Problema de Conectividade</span>
            </div>

            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-red-600">Offline</span>
            </div>
          </div>

          <div className="text-xs text-red-600">Reconectando…</div>
        </div>

        <div className="mt-2 text-xs text-red-600">
          ⚠️ {error} • Tentando reconectar automaticamente...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <FiClock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Status Automático</span>
          </div>
          
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isChangingDate ? 'bg-orange-500' : 'bg-green-500'}`}></div>
            <span className="text-xs text-blue-600">Tempo real por eventos</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <FiRefreshCw className="w-3 h-3 text-blue-500" />
            <span className="text-blue-700">
              {agendamentosEmAndamento.length} em andamento
            </span>
          </div>

          {hasCachedData && (
            <div className="flex items-center gap-1">
              <FiCheck className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600">Cache</span>
            </div>
          )}

          <div className="text-xs text-blue-600">Eventos do sistema</div>
        </div>
      </div>

      <div className="mt-2 text-xs text-blue-600">
        📋 {agendamentosHoje.length} agendamentos hoje • Atualiza apenas quando algo muda
      </div>
    </div>
  );
};
