import React from "react";
import {
  FiClock,
  FiUser,
  FiDollarSign,
  FiCheckCircle,
  FiCreditCard,
  FiTrash2,
} from "react-icons/fi";

interface Agendamento {
  id: string;
  data_hora: Date;
  status: string;
  cliente: { nome: string; telefone?: string };
  servicos: Array<{
    servico: { nome: string };
    preco: number;
  }>;
  valor_total: number;
}

interface AgendamentoAguardandoPagamentoProps {
  agendamento: Agendamento;
  onConfirmarPagamento?: (agendamento: Agendamento) => void;
  onEditarAgendamento?: (agendamento: Agendamento) => void;
  onExcluirAgendamento?: (id: string) => void;
  formatDateTime: (date: Date) => string;
  formatCurrency: (value: number) => string;
  canEdit?: boolean;
  canViewValues?: boolean;
}

export function AgendamentoAguardandoPagamento({
  agendamento,
  onConfirmarPagamento,
  onEditarAgendamento,
  onExcluirAgendamento,
  formatDateTime,
  formatCurrency,
  canEdit = true,
  canViewValues = true,
}: AgendamentoAguardandoPagamentoProps) {
  // Validar e garantir que data_hora é um Date válido
  const safeDataHora = React.useMemo(() => {
    if (!agendamento.data_hora) {
      console.warn("Agendamento sem data_hora:", agendamento.id);
      return new Date(); // Fallback
    }

    if (agendamento.data_hora instanceof Date) {
      if (isNaN(agendamento.data_hora.getTime())) {
        console.warn(
          "Data inválida no agendamento:",
          agendamento.id,
          agendamento.data_hora,
        );
        return new Date(); // Fallback
      }
      return agendamento.data_hora;
    }

    // Se for string, tentar converter
    const converted = new Date(agendamento.data_hora);
    if (isNaN(converted.getTime())) {
      console.warn(
        "Falha ao converter data no agendamento:",
        agendamento.id,
        agendamento.data_hora,
      );
      return new Date(); // Fallback
    }

    return converted;
  }, [agendamento.data_hora, agendamento.id]);

  return (
    <div className="p-2 rounded-lg border border-orange-200 bg-orange-50 transition-all duration-300 hover:shadow-md w-full">
      {/* Layout responsivo: coluna em mobile, linha em desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Informações principais */}
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {/* Avatar do Cliente */}
          <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-orange-300 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-white font-semibold text-xs">
              {agendamento.cliente?.nome?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>

          {/* Informações principais */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <h4 className="font-medium text-orange-800 text-xs truncate">
                {agendamento.cliente?.nome || "Cliente não informado"}
              </h4>
              <span className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 self-start">
                {agendamento.status === "aguardando_confirmacao_pagamento"
                  ? "Confirmação Pendente"
                  : "Aguardando Confirmação"}
              </span>
            </div>

            {/* Informações em grid responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-xs text-orange-600 mt-2">
              <div className="flex items-center space-x-1">
                <FiClock className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{formatDateTime(safeDataHora)}</span>
              </div>

              {canViewValues && (
                <div className="flex items-center space-x-1">
                  <FiDollarSign className="w-3 h-3 flex-shrink-0" />
                  <span className="font-semibold text-green-700">
                    {formatCurrency(agendamento.valor_total)}
                  </span>
                </div>
              )}

              {agendamento.servicos?.length > 0 && (
                <div className="flex items-center space-x-1">
                  <FiUser className="w-3 h-3 flex-shrink-0" />
                  <span>
                    {agendamento.servicos.length} serviço
                    {agendamento.servicos.length > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ações */}
        {canEdit && (
          <div className="flex items-center justify-end sm:justify-start space-x-2 flex-shrink-0">
            <button
              onClick={() => onConfirmarPagamento?.(agendamento)}
              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors flex items-center space-x-1 whitespace-nowrap"
              title="Confirmar Pagamento"
            >
              <FiCreditCard className="w-3 h-3" />
              <span>Confirmar</span>
            </button>
            <button
              onClick={() => onExcluirAgendamento?.(agendamento.id)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Excluir agendamento"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
