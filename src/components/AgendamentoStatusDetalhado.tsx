import React from "react";
import { FiClock, FiCheckCircle, FiPlay } from "react-icons/fi";

interface Agendamento {
  id: string;
  data_hora: Date;
  status: string;
  servicos?: Array<{
    servico: { nome: string; duracao_minutos?: number };
  }>;
  servico?: { nome: string; duracao_minutos?: number };
}

interface AgendamentoStatusDetalhadoProps {
  agendamento: Agendamento;
}

export function AgendamentoStatusDetalhado({
  agendamento,
}: AgendamentoStatusDetalhadoProps) {
  // Calcular duração total
  const calcularDuracaoTotal = () => {
    let duracaoTotal = 0;

    if (agendamento.servicos && agendamento.servicos.length > 0) {
      agendamento.servicos.forEach((servico) => {
        if (servico.servico?.duracao_minutos) {
          duracaoTotal += servico.servico.duracao_minutos;
        }
      });
    } else if (agendamento.servico?.duracao_minutos) {
      duracaoTotal = agendamento.servico.duracao_minutos;
    }

    return duracaoTotal > 0 ? duracaoTotal : 60;
  };

  const agora = new Date();
  const dataHoraInicio = new Date(agendamento.data_hora);
  const duracaoMinutos = calcularDuracaoTotal();
  const dataHoraFim = new Date(
    dataHoraInicio.getTime() + duracaoMinutos * 60 * 1000,
  );

  const tempoParaIniciar = Math.ceil(
    (dataHoraInicio.getTime() - agora.getTime()) / (60 * 1000),
  );
  const tempoParaFinalizar = Math.ceil(
    (dataHoraFim.getTime() - agora.getTime()) / (60 * 1000),
  );

  const getStatusIcon = () => {
    if (agendamento.status === "concluido") {
      return <FiCheckCircle className="w-4 h-4 text-green-600" />;
    } else if (agendamento.status === "em_andamento") {
      return <FiPlay className="w-4 h-4 text-yellow-600" />;
    } else {
      return <FiClock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTempoInfo = () => {
    if (agendamento.status === "concluido") {
      return "Finalizado";
    } else if (agora >= dataHoraInicio && agora <= dataHoraFim) {
      return `Finaliza em ${tempoParaFinalizar}min`;
    } else if (agora < dataHoraInicio) {
      return `Inicia em ${tempoParaIniciar}min`;
    } else {
      return "Deveria estar finalizado";
    }
  };

  return (
    <div className="bg-white p-2 rounded border text-xs">
      <div className="flex items-center space-x-2 mb-1">
        {getStatusIcon()}
        <span className="font-medium">{getTempoInfo()}</span>
      </div>
      <div className="text-gray-600">
        <div>Duração: {duracaoMinutos}min</div>
        <div>
          {dataHoraInicio.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          -{" "}
          {dataHoraFim.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
