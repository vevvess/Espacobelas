import React from "react";
import { FiClock, FiUser, FiDollarSign } from "react-icons/fi";

interface Agendamento {
  id: string;
  data_hora: Date;
  status: string;
  cliente: { nome: string };
  servicos: Array<{
    servico: { nome: string };
    preco: number;
  }>;
  valor_total: number;
}

interface MonthViewProps {
  agendamentos: Agendamento[];
  currentDate: Date;
  onVisualizarAgendamento: (agendamento: Agendamento) => void;
  onDayClick: (date: Date) => void;
  formatCurrency: (value: number) => string;
}

export function MonthView({
  agendamentos,
  currentDate,
  onVisualizarAgendamento,
  onDayClick,
  formatCurrency,
}: MonthViewProps) {
  // Get first day of month
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );

  // Get last day of month
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  );

  // Get first day of calendar (might be from previous month)
  const firstDayOfCalendar = new Date(firstDayOfMonth);
  firstDayOfCalendar.setDate(
    firstDayOfMonth.getDate() - firstDayOfMonth.getDay(),
  );

  // Generate calendar days (6 weeks = 42 days)
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = new Date(firstDayOfCalendar);
    day.setDate(firstDayOfCalendar.getDate() + i);
    return day;
  });

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const getAgendamentosForDay = (day: Date) => {
    return agendamentos.filter((agendamento) => {
      const agendamentoDate = new Date(agendamento.data_hora);
      return (
        agendamentoDate.toDateString() === day.toDateString() &&
        agendamento.status !== "cancelado"
      );
    });
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getTotalForDay = (dayAgendamentos: Agendamento[]) => {
    return dayAgendamentos
      .filter((a) => a.status === "concluido")
      .reduce((sum, a) => sum + a.valor_total, 0);
  };

  const getStatusCounts = (dayAgendamentos: Agendamento[]) => {
    return {
      agendado: dayAgendamentos.filter((a) => a.status === "agendado").length,
      concluido: dayAgendamentos.filter((a) => a.status === "concluido").length,
      em_andamento: dayAgendamentos.filter((a) => a.status === "em_andamento")
        .length,
      aguardando_confirmacao: dayAgendamentos.filter(
        (a) => a.status === "aguardando_confirmacao",
      ).length,
    };
  };

  return (
    <div className="bella-card animate-fade-in">
      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-0 border-b border-bella-200">
        {dayNames.map((dayName) => (
          <div
            key={dayName}
            className="p-3 text-center text-sm font-medium text-bella-600 bg-bella-50"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Body */}
      <div className="grid grid-cols-7 gap-0">
        {calendarDays.map((day, index) => {
          const dayAgendamentos = getAgendamentosForDay(day);
          const isCurrentMonthDay = isCurrentMonth(day);
          const isCurrentDay = isToday(day);
          const statusCounts = getStatusCounts(dayAgendamentos);
          const totalValue = getTotalForDay(dayAgendamentos);

          return (
            <div
              key={day.toISOString()}
              className={`
                min-h-[120px] p-2 border-r border-b border-bella-100 cursor-pointer
                hover:bg-bella-50 transition-colors
                ${!isCurrentMonthDay ? "bg-gray-50 text-gray-400" : ""}
                ${isCurrentDay ? "bg-blue-50 ring-1 ring-blue-200" : ""}
              `}
              onClick={() => onDayClick(day)}
            >
              {/* Day Number */}
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`
                    text-sm font-medium
                    ${
                      isCurrentDay
                        ? "bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"
                        : isCurrentMonthDay
                          ? "text-bella-800"
                          : "text-gray-400"
                    }
                  `}
                >
                  {day.getDate()}
                </span>

                {/* Total Count */}
                {dayAgendamentos.length > 0 && (
                  <span className="text-xs bg-bella-500 text-white px-1 rounded">
                    {dayAgendamentos.length}
                  </span>
                )}
              </div>

              {/* Agendamentos Summary */}
              {dayAgendamentos.length > 0 && (
                <div className="space-y-1">
                  {/* Status indicators */}
                  <div className="flex space-x-1">
                    {statusCounts.agendado > 0 && (
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full"
                        title={`${statusCounts.agendado} agendado(s)`}
                      />
                    )}
                    {statusCounts.em_andamento > 0 && (
                      <div
                        className="w-2 h-2 bg-yellow-500 rounded-full"
                        title={`${statusCounts.em_andamento} em andamento`}
                      />
                    )}
                    {statusCounts.aguardando_confirmacao > 0 && (
                      <div
                        className="w-2 h-2 bg-orange-500 rounded-full"
                        title={`${statusCounts.aguardando_confirmacao} aguardando confirmação`}
                      />
                    )}
                    {statusCounts.concluido > 0 && (
                      <div
                        className="w-2 h-2 bg-green-500 rounded-full"
                        title={`${statusCounts.concluido} concluído(s)`}
                      />
                    )}
                  </div>

                  {/* First few agendamentos */}
                  <div className="space-y-1">
                    {dayAgendamentos.slice(0, 2).map((agendamento) => (
                      <div
                        key={agendamento.id}
                        className="text-xs p-1 bg-white rounded border hover:bg-bella-50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onVisualizarAgendamento(agendamento);
                        }}
                      >
                        <div className="flex items-center space-x-1">
                          <FiClock className="w-3 h-3 text-bella-500" />
                          <span className="text-bella-600">
                            {agendamento.data_hora.toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="truncate text-bella-800">
                          {agendamento.cliente.nome}
                        </div>
                      </div>
                    ))}

                    {dayAgendamentos.length > 2 && (
                      <div className="text-xs text-bella-500 text-center">
                        +{dayAgendamentos.length - 2} mais
                      </div>
                    )}
                  </div>

                  {/* Total value for completed appointments */}
                  {totalValue > 0 && (
                    <div className="text-xs text-green-600 font-medium flex items-center space-x-1">
                      <FiDollarSign className="w-3 h-3" />
                      <span>{formatCurrency(totalValue)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Month Summary */}
      <div className="p-4 bg-bella-50 border-t border-bella-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-bella-500">Total de Agendamentos</div>
            <div className="text-lg font-semibold text-bella-800">
              {
                agendamentos.filter(
                  (a) =>
                    a.data_hora.getMonth() === currentDate.getMonth() &&
                    a.status !== "cancelado",
                ).length
              }
            </div>
          </div>
          <div className="text-center">
            <div className="text-bella-500">Agendamentos Concluídos</div>
            <div className="text-lg font-semibold text-green-600">
              {
                agendamentos.filter(
                  (a) =>
                    a.data_hora.getMonth() === currentDate.getMonth() &&
                    a.status === "concluido",
                ).length
              }
            </div>
          </div>
          <div className="text-center">
            <div className="text-bella-500">Receita do Mês</div>
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(
                agendamentos
                  .filter(
                    (a) =>
                      a.data_hora.getMonth() === currentDate.getMonth() &&
                      a.status === "concluido",
                  )
                  .reduce((sum, a) => sum + a.valor_total, 0),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
