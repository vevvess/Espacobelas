import React, { useState, useEffect } from "react";
import {
  FiClock,
  FiUser,
  FiDollarSign,
  FiEdit,
  FiTrash2,
  FiEye,
} from "react-icons/fi";
import {
  getCorOffline,
  getColorVariants,
} from "@/services/funcionarioColorsOffline";

interface Agendamento {
  id: string;
  data_hora: Date;
  status: string;
  cliente: { nome: string };
  servicos: Array<{
    servico: { nome: string };
    preco: number;
    funcionario?: { nome: string };
  }>;
  valor_total: number;
}

interface WeekViewProps {
  agendamentos: Agendamento[];
  currentDate: Date;
  onEditAgendamento: (agendamento: Agendamento) => void;
  onRemoveAgendamento: (id: string) => void;
  onVisualizarAgendamento: (agendamento: Agendamento) => void;
  formatTime: (date: Date) => string;
  formatCurrency: (value: number) => string;
  canEdit: boolean;
}

export function WeekView({
  agendamentos,
  currentDate,
  onEditAgendamento,
  onRemoveAgendamento,
  onVisualizarAgendamento,
  formatTime,
  formatCurrency,
  canEdit,
}: WeekViewProps) {
  // Get start of week (Sunday)
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  const dayNames = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];

  const getAgendamentosForDay = (day: Date) => {
    return agendamentos.filter((agendamento) => {
      const agendamentoDate = new Date(agendamento.data_hora);
      return (
        agendamentoDate.toDateString() === day.toDateString() &&
        agendamento.status !== "cancelado"
      );
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "em_andamento":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "aguardando_confirmacao":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "concluido":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 animate-fade-in">
      {weekDays.map((day, index) => {
        const dayAgendamentos = getAgendamentosForDay(day);
        const isCurrentDay = isToday(day);

        return (
          <div
            key={day.toISOString()}
            className={`
              bella-card p-4 min-h-[300px]
              ${isCurrentDay ? "ring-2 ring-bella-500 bg-bella-50" : ""}
            `}
          >
            {/* Day Header */}
            <div className="mb-4 text-center">
              <div
                className={`
                  text-sm font-medium mb-1
                  ${isCurrentDay ? "text-bella-600" : "text-bella-500"}
                `}
              >
                {dayNames[index]}
              </div>
              <div
                className={`
                  text-lg font-bold
                  ${isCurrentDay ? "text-bella-800" : "text-bella-700"}
                `}
              >
                {day.getDate()}
              </div>
              {dayAgendamentos.length > 0 && (
                <div className="text-xs text-bella-500 mt-1">
                  {dayAgendamentos.length} agendamento(s)
                </div>
              )}
            </div>

            {/* Agendamentos */}
            <div className="space-y-2">
              {dayAgendamentos.length === 0 ? (
                <div className="text-center text-bella-400 text-sm py-8">
                  Nenhum agendamento
                </div>
              ) : (
                dayAgendamentos
                  .sort((a, b) => a.data_hora.getTime() - b.data_hora.getTime())
                  .map((agendamento) => {
                    // Coletar funcionários únicos do agendamento
                    const funcionarios = new Set<string>();
                    if (agendamento.funcionario_id) {
                      funcionarios.add(agendamento.funcionario_id);
                    }
                    agendamento.servicos?.forEach((servico) => {
                      if (servico.funcionario_id) {
                        funcionarios.add(servico.funcionario_id);
                      }
                    });

                    // Gerar cores para os funcionários usando sistema offline
                    const funcionariosCores = Array.from(funcionarios).map(
                      (id) => getCorOffline(id),
                    );

                    // Estilo do card baseado nos funcionários
                    const cardStyle =
                      funcionariosCores.length > 0
                        ? {
                            background:
                              funcionariosCores.length === 1
                                ? `${funcionariosCores[0]}15`
                                : `linear-gradient(135deg, ${funcionariosCores.map((cor) => `${cor}20`).join(", ")})`,
                            borderColor: funcionariosCores[0] + "40",
                            borderLeftColor: funcionariosCores[0],
                            borderLeftWidth: "3px",
                          }
                        : {};

                    return (
                      <div
                        key={agendamento.id}
                        className={`
                          p-3 rounded-lg border text-xs space-y-2
                          hover:shadow-md transition-shadow cursor-pointer
                        `}
                        style={cardStyle}
                        onClick={() => onVisualizarAgendamento(agendamento)}
                      >
                        {/* Time */}
                        <div className="flex items-center space-x-1">
                          <FiClock className="w-3 h-3" />
                          <span className="font-medium">
                            {formatTime(agendamento.data_hora)}
                          </span>
                        </div>

                        {/* Client */}
                        <div className="flex items-center space-x-1">
                          <FiUser className="w-3 h-3" />
                          <span className="truncate">
                            {agendamento.cliente.nome}
                          </span>
                        </div>

                        {/* Services */}
                        <div className="space-y-1">
                          {agendamento.servicos
                            .slice(0, 2)
                            .map((servico, idx) => (
                              <div
                                key={idx}
                                className="text-xs text-opacity-80"
                              >
                                • {servico.servico.nome}
                              </div>
                            ))}
                          {agendamento.servicos.length > 2 && (
                            <div className="text-xs text-opacity-60">
                              +{agendamento.servicos.length - 2} mais...
                            </div>
                          )}
                        </div>

                        {/* Value */}
                        <div className="flex items-center space-x-1">
                          <FiDollarSign className="w-3 h-3" />
                          <span className="font-medium">
                            {formatCurrency(agendamento.valor_total)}
                          </span>
                        </div>

                        {/* Actions */}
                        {canEdit && (
                          <div
                            className="flex justify-end space-x-1 pt-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => onEditAgendamento(agendamento)}
                              className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                              title="Editar"
                            >
                              <FiEdit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() =>
                                onRemoveAgendamento(agendamento.id)
                              }
                              className="p-1 hover:bg-white hover:bg-opacity-50 rounded text-red-600"
                              title="Excluir"
                            >
                              <FiTrash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
