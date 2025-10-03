import React, { useState, useEffect } from "react";
import {
  FiClock,
  FiUser,
  FiDollarSign,
  FiEdit,
  FiTrash2,
  FiEye,
  FiUsers,
} from "react-icons/fi";
import {
  getCorOffline,
  getColorVariants,
  isLightColor,
} from "@/services/funcionarioColorsOffline";

interface Servico {
  id: string;
  servico: { nome: string };
  preco: number;
  funcionario?: { id: string; nome: string };
  funcionario_id?: string;
}

interface Agendamento {
  id: string;
  data_hora: Date;
  status: string;
  cliente: { nome: string; telefone?: string };
  servicos: Servico[];
  funcionario?: { id: string; nome: string };
  funcionario_id?: string;
  valor_total: number;
  observacoes_usuario?: string;
}

interface AgendamentoCardProps {
  agendamento: Agendamento;
  onEdit?: (agendamento: Agendamento) => void;
  onDelete?: (id: string) => void;
  onView?: (agendamento: Agendamento) => void;
  onConcluir?: (agendamento: Agendamento) => void;
  onIniciar?: (agendamento: Agendamento) => void;
  onEditConcluido?: (agendamento: Agendamento) => void;
  formatDateTime: (date: Date) => string;
  formatCurrency: (value: number) => string;
  canEdit?: boolean;
  isStaff?: boolean;
  canViewValues?: boolean;
}

export function AgendamentoCard({
  agendamento,
  onEdit,
  onDelete,
  onView,
  onConcluir,
  onIniciar,
  onEditConcluido,
  formatDateTime,
  formatCurrency,
  canEdit = true,
  isStaff = false,
  canViewValues = true,
}: AgendamentoCardProps) {
  const [funcionariosCores, setFuncionariosCores] = useState<
    Record<string, string>
  >({});

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

  // Coletar todos os funcionários únicos do agendamento
  const funcionarios = React.useMemo(() => {
    const funcionariosSet = new Set<string>();

    // Funcionário principal
    if (agendamento.funcionario_id) {
      funcionariosSet.add(agendamento.funcionario_id);
    }

    // Funcionários dos serviços
    agendamento.servicos?.forEach((servico) => {
      if (servico.funcionario_id) {
        funcionariosSet.add(servico.funcionario_id);
      }
      // Também tentar funcionário do objeto funcionario
      if (servico.funcionario?.id) {
        funcionariosSet.add(servico.funcionario.id);
      }
    });

    return Array.from(funcionariosSet);
  }, [agendamento]);

  // Gerar cores para os funcionários usando sistema offline
  useEffect(() => {
    const cores: Record<string, string> = {};
    funcionarios.forEach((funcionarioId) => {
      cores[funcionarioId] = getCorOffline(funcionarioId);
    });
    setFuncionariosCores(cores);
  }, [funcionarios]);

  // Gerar gradiente baseado nos funcionários
  const getCardStyle = () => {
    const baseStyle = {
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box" as const,
    };

    if (funcionarios.length === 0) {
      return {
        ...baseStyle,
        backgroundColor: "#f8fafc",
        borderColor: "#e2e8f0",
      };
    }

    if (funcionarios.length === 1) {
      const cor = funcionariosCores[funcionarios[0]];
      const variants = getColorVariants(cor);
      return {
        ...baseStyle,
        backgroundColor: variants.light,
        borderTopColor: variants.border,
        borderRightColor: variants.border,
        borderBottomColor: variants.border,
        borderLeftColor: cor,
        borderLeftWidth: "4px",
      };
    }

    // Múltiplos funcionários - criar gradiente
    const cores = funcionarios
      .map((id) => funcionariosCores[id])
      .filter(Boolean);
    if (cores.length > 0) {
      const gradiente = `linear-gradient(135deg, ${cores
        .map((cor, index) => `${cor}${index === 0 ? "30" : "20"}`)
        .join(", ")})`;

      return {
        ...baseStyle,
        background: gradiente,
        borderTopColor: cores[0] + "60",
        borderRightColor: cores[0] + "60",
        borderBottomColor: cores[0] + "60",
        borderLeftColor: cores[0],
        borderLeftWidth: "4px",
      };
    }

    return baseStyle;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado":
        return "bg-blue-100 text-blue-800";
      case "confirmado":
        return "bg-green-100 text-green-800";
      case "em_andamento":
        return "bg-yellow-100 text-yellow-800";
      case "aguardando_confirmacao":
        return "bg-orange-100 text-orange-800";
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
      case "em_andamento":
        return "Em Andamento";
      case "aguardando_confirmacao":
        return "Aguardando Confirmação";
      case "concluido":
        return "Concluído";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <div className="w-full">
      <div
        className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-md w-full ${
          agendamento.status === "concluido"
            ? "opacity-90"
            : "hover:bg-opacity-50"
        } ${
          agendamento.status === "em_andamento"
            ? "ring-2 ring-yellow-200 bg-yellow-50"
            : ""
        }`}
        style={getCardStyle()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* Avatar do Cliente */}
            <div className="w-12 h-12 bg-gradient-to-r from-bella-400 to-bella-300 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-sm">
                {agendamento.cliente?.nome?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>

            <div className="flex-1">
              {/* Header do Card */}
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-semibold text-bella-800 text-lg">
                  {agendamento.cliente?.nome || "Cliente não informado"}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}
                >
                  {getStatusText(agendamento.status)}
                </span>
              </div>

              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-bella-600 mb-3">
                <div className="flex items-center space-x-2">
                  <FiClock className="w-4 h-4" />
                  <span>{formatDateTime(safeDataHora)}</span>
                </div>
                {agendamento.cliente?.telefone && canViewValues && (
                  <div className="flex items-center space-x-2">
                    <FiUser className="w-4 h-4" />
                    <span>{agendamento.cliente.telefone}</span>
                  </div>
                )}
              </div>

              {/* Serviços e Funcionários */}
              <div className="mb-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Coluna 1: Serviços */}
                  <div>
                    <p className="text-sm font-semibold text-bella-700 mb-2 flex items-center">
                      <FiUser className="w-4 h-4 mr-1" />
                      Serviços:
                    </p>
                    <div className="space-y-1">
                      {agendamento.servicos && Array.isArray(agendamento.servicos) ? (
                        agendamento.servicos.map((servico, index) => {
                          const funcionarioCor = servico?.funcionario_id
                            ? funcionariosCores[servico.funcionario_id]
                            : null;

                          return (
                            <div
                              key={index}
                              className="px-3 py-2 rounded-md text-sm font-medium border"
                              style={{
                                backgroundColor: funcionarioCor
                                  ? `${funcionarioCor}15`
                                  : "#f1f5f9",
                                borderColor: funcionarioCor
                                  ? `${funcionarioCor}40`
                                  : "#e2e8f0",
                                color: "#1e293b",
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span>{servico?.servico?.nome || "Serviço"}</span>
                                {canViewValues && (
                                  <span className="text-green-700 font-semibold">
                                    {formatCurrency(servico?.preco || 0)}
                                  </span>
                                )}
                              </div>
                              {servico?.funcionario && (
                               <<div className="text-xs text-bella-600 mt-1 flex items-center gap-1">
                                 <nFiUser className="w-3 h-3" /> {servico.funcionario.nome}
                              </                   )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-3 py-2 rounded-md text-sm font-medium border bg-gray-100 text-gray-600">
                          Nenhum serviço encontrado
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Coluna 2: Funcionários */}
                  <div>
                    <p className="text-sm font-semibold text-bella-700 mb-2 flex items-center">
                      <FiUsers className="w-4 h-4 mr-1" />
                      Funcionários:
                    </p>
                    {funcionarios.length > 0 ? (
                      <div className="space-y-1">
                        {funcionarios.map((funcionarioId) => {
                          // Procurar funcionário em várias fontes
                          let funcionario = null;

                          // 1. Procurar nos serviços por funcionario_id
                          funcionario = agendamento.servicos?.find(
                            (s) => s.funcionario_id === funcionarioId,
                          )?.funcionario;

                          // 2. Se não encontrou, procurar nos serviços por funcionario.id
                          if (!funcionario) {
                            funcionario = agendamento.servicos?.find(
                              (s) => s.funcionario?.id === funcionarioId,
                            )?.funcionario;
                          }

                          // 3. Se ainda não encontrou, usar funcionário principal do agendamento
                          if (
                            !funcionario &&
                            agendamento.funcionario?.id === funcionarioId
                          ) {
                            funcionario = agendamento.funcionario;
                          }

                          const cor = funcionariosCores[funcionarioId];

                          return (
                            <div
                              key={funcionarioId}
                              className="px-3 py-2 rounded-md text-sm font-medium border"
                              style={{
                                backgroundColor: cor ? `${cor}20` : "#f1f5f9",
                                borderColor: cor ? `${cor}60` : "#e2e8f0",
                                color: "#1e293b",
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                  style={{ backgroundColor: cor }}
                                >
                                  {funcionario?.nome?.charAt(0).toUpperCase() ||
                                    "?"}
                                </div>
                                <span>
                                  {funcionario?.nome || "Funcionário"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-md text-sm italic">
                        Não especificado
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Observações */}
              {agendamento.observacoes_usuario && (
                <div className="mb-3">
                  <p className="text-sm font-semibold text-bella-700 mb-1">
                    Observações:
                  </p>
                  <p className="text-sm text-bella-600 bg-white bg-opacity-70 px-3 py-2 rounded border">
                    {(() => {
                      const { cleaned, hadCode } = (() => {
                        const observacoes = agendamento.observacoes_usuario;
                        if (!observacoes) return { cleaned: "", hadCode: false };

                        const hadCode = observacoes.includes('[SERVICOS:') || observacoes.includes('[FUNC:') || observacoes.includes('{"');
                        const cleaned = observacoes
                          .replace(/\[FUNC:[^\]]+\]/g, "")
                          .replace(/\[SERVICOS:.+?\]/g, "")
                          .replace(/\{[^}]*\}/g, "")
                          .replace(/\[[^\]]*\]/g, "")
                          .trim();

                        return { cleaned, hadCode };
                      })();

                      if (hadCode && process.env.NODE_ENV === 'development') {
                        console.warn('🧹 Código JSON removido das observações:', agendamento.id);
                      }

                      return cleaned || "Sem observações específicas";
                    })()}
                  </p>
                </div>
              )}

              {/* Valor Total */}
              {canViewValues && (
                <div className="bg-white bg-opacity-70 rounded-lg p-3 border">
                  <div className="flex items-center justify-between">
                    <span className="text-bella-600 font-medium">
                      Valor Total:
                    </span>
                    <span className="text-xl font-semibold text-green-600">
                      {formatCurrency(agendamento.valor_total)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col space-y-2 ml-4">
            <button
              onClick={() => onView?.(agendamento)}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              title="Ver detalhes"
            >
              <FiEye className="w-4 h-4" />
            </button>

            {canEdit && (
              <>
                {agendamento.status === "concluido" ? (
                  <button
                    onClick={() => onEditConcluido?.(agendamento)}
                    className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                    title="Editar concluído"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onEdit?.(agendamento)}
                      className="p-2 text-bella-600 hover:bg-bella-200 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>

                    {agendamento.status === "agendado" && (
                      <>
                        <button
                          onClick={() => onIniciar?.(agendamento)}
                          className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                          title="Iniciar serviço"
                        >
                          <FiClock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onConcluir?.(agendamento)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Concluir"
                        >
                          <FiDollarSign className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => onDelete?.(agendamento.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
