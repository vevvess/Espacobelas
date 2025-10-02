import React from "react";
import { FiX, FiUser, FiClock, FiDollarSign, FiUsers } from "react-icons/fi";
import {
  extractObservacoesUsuario,
  extractServicosData,
} from "@/utils/observacoesBuilder";
import { getCorOffline } from "@/services/funcionarioColorsOffline";

interface ModalVisualizarAgendamentoProps {
  isOpen: boolean;
  onClose: () => void;
  agendamento: any;
  formatDateTime: (date: Date) => string;
  formatCurrency: (value: number) => string;
}

export function ModalVisualizarAgendamento({
  isOpen,
  onClose,
  agendamento,
  formatDateTime,
  formatCurrency,
}: ModalVisualizarAgendamentoProps) {
  if (!isOpen || !agendamento) return null;

  // Extrair dados limpos
  const observacoesUsuario = extractObservacoesUsuario(
    agendamento.observacoes || "",
  );
  const servicosData = extractServicosData(agendamento.observacoes || "");

  // Status formatting
  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado":
        return "bg-blue-100 text-blue-800";
      case "confirmado":
        return "bg-green-100 text-green-800";
      case "concluido":
        return "bg-purple-100 text-purple-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "agendado":
        return "Agendado";
      case "confirmado":
        return "Confirmado";
      case "concluido":
        return "Concluído";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

  // Coletar funcionários únicos
  const funcionarios = new Set<string>();
  agendamento.servicos?.forEach((servico: any) => {
    if (servico.funcionario_id) {
      funcionarios.add(servico.funcionario_id);
    }
    if (servico.funcionario?.id) {
      funcionarios.add(servico.funcionario.id);
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-bella-800">
            Detalhes do Agendamento
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-bella-600 hover:bg-bella-100 rounded-lg"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FiUser className="w-5 h-5 text-bella-600" />
                <div>
                  <p className="text-sm font-medium text-bella-700">Cliente</p>
                  <p className="text-lg font-semibold">
                    {agendamento.cliente?.nome || "Cliente não informado"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FiClock className="w-5 h-5 text-bella-600" />
                <div>
                  <p className="text-sm font-medium text-bella-700">
                    Data e Hora
                  </p>
                  <p className="text-lg font-semibold">
                    {formatDateTime(agendamento.data_hora)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(agendamento.status)}`}
                  >
                    {getStatusText(agendamento.status)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FiDollarSign className="w-5 h-5 text-bella-600" />
                <div>
                  <p className="text-sm font-medium text-bella-700">
                    Valor Total
                  </p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(agendamento.valor_total || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Serviços */}
          <div>
            <h3 className="text-lg font-semibold text-bella-800 mb-3 flex items-center space-x-2">
              <FiUser className="w-5 h-5" />
              <span>Serviços</span>
            </h3>

            <div className="space-y-3">
              {agendamento.servicos && agendamento.servicos.length > 0 ? (
                agendamento.servicos.map((servico: any, index: number) => {
                  const funcionarioCor = servico.funcionario_id
                    ? getCorOffline(servico.funcionario_id)
                    : null;

                  return (
                    <div
                      key={index}
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: funcionarioCor
                          ? `${funcionarioCor}10`
                          : "#f8fafc",
                        borderColor: funcionarioCor
                          ? `${funcionarioCor}40`
                          : "#e2e8f0",
                        borderLeftColor: funcionarioCor || "#e2e8f0",
                        borderLeftWidth: "4px",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-bella-800">
                            {servico.servico?.nome || "Serviço"}
                          </h4>
                          {servico.funcionario && (
                            <p className="text-sm text-bella-600 mt-1">
                              👤 {servico.funcionario.nome}
                            </p>
                          )}
                        </div>
                        <span className="text-lg font-semibold text-green-600">
                          {formatCurrency(servico.preco || 0)}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-bella-500 italic">
                  Nenhum serviço informado
                </p>
              )}
            </div>
          </div>

          {/* Funcionários */}
          {funcionarios.size > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-bella-800 mb-3 flex items-center space-x-2">
                <FiUsers className="w-5 h-5" />
                <span>Funcionários</span>
              </h3>

              <div className="flex flex-wrap gap-2">
                {Array.from(funcionarios).map((funcionarioId) => {
                  const funcionario = agendamento.servicos?.find(
                    (s: any) =>
                      s.funcionario_id === funcionarioId ||
                      s.funcionario?.id === funcionarioId,
                  )?.funcionario;

                  const cor = getCorOffline(funcionarioId);

                  return (
                    <div
                      key={funcionarioId}
                      className="px-4 py-2 rounded-full border text-sm font-medium"
                      style={{
                        backgroundColor: cor ? `${cor}20` : "#f1f5f9",
                        borderColor: cor ? `${cor}60` : "#e2e8f0",
                        color: "#1e293b",
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: cor }}
                        >
                          {funcionario?.nome?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span>{funcionario?.nome || "Funcionário"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Observações do Usuário */}
          {observacoesUsuario && (
            <div>
              <h3 className="text-lg font-semibold text-bella-800 mb-3">
                Observações
              </h3>
              <div className="bg-bella-50 rounded-lg p-4 border border-bella-200">
                <p className="text-bella-700 whitespace-pre-wrap">
                  {observacoesUsuario}
                </p>
              </div>
            </div>
          )}

          {/* Informações do Cliente */}
          {agendamento.cliente?.telefone && (
            <div>
              <h3 className="text-lg font-semibold text-bella-800 mb-3">
                Contato do Cliente
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700">
                  📞 {agendamento.cliente.telefone}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Botão de Fechar */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-bella-500 text-white rounded-lg hover:bg-bella-600 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
