import React, { useState, useEffect } from "react";

interface AgendamentoTest {
  id: string;
  data_hora: Date;
  status: string;
  cliente: { nome: string };
  servicos?: Array<{
    servico: { nome: string; duracao_minutos: number };
  }>;
  servico?: { nome: string; duracao_minutos: number };
}

// Calcular duração total do agendamento
const calcularDuracaoTotal = (agendamento: AgendamentoTest) => {
  let duracaoTotal = 0;

  // Se tem múltiplos serviços
  if (agendamento.servicos && agendamento.servicos.length > 0) {
    agendamento.servicos.forEach((servico) => {
      if (servico.servico?.duracao_minutos) {
        duracaoTotal += servico.servico.duracao_minutos;
      }
    });
  }
  // Se tem serviço único
  else if (agendamento.servico?.duracao_minutos) {
    duracaoTotal = agendamento.servico.duracao_minutos;
  }

  return duracaoTotal > 0 ? duracaoTotal : 60;
};

// Simular a nova lógica baseada na duração exata dos serviços
const getStatusAutomatico = (agendamento: AgendamentoTest) => {
  const agora = new Date();
  const dataHoraInicio = new Date(agendamento.data_hora);

  // Se já está concluído ou cancelado, manter status
  if (
    agendamento.status === "concluido" ||
    agendamento.status === "cancelado"
  ) {
    return agendamento.status;
  }

  // Se já está aguardando confirmação, manter até admin confirmar
  if (agendamento.status === "aguardando_confirmacao") {
    return agendamento.status;
  }

  // Calcular duração total baseada nos serviços
  const duracaoMinutos = calcularDuracaoTotal(agendamento);
  const dataHoraFim = new Date(
    dataHoraInicio.getTime() + duracaoMinutos * 60 * 1000,
  );

  // Lógica exata:
  // Antes do horário = status original
  // No horário até fim = "em_andamento"
  // Após o fim = "aguardando_pagamento" (para admin confirmar)

  if (agora < dataHoraInicio) {
    return agendamento.status; // Manter status original se ainda não chegou a hora
  } else if (agora >= dataHoraInicio && agora <= dataHoraFim) {
    return "em_andamento";
  } else {
    // Após o horário de fim: ir para aguardando confirmação se estava em andamento
    return agendamento.status === "em_andamento"
      ? "aguardando_confirmacao"
      : agendamento.status;
  }
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

export function StatusAutomaticoTest() {
  const [agora, setAgora] = useState(new Date());

  // Atualizar hora atual a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setAgora(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Criar agendamentos de teste com serviços e durações
  const agendamentosTest: AgendamentoTest[] = [
    {
      id: "1",
      data_hora: new Date(Date.now() - 10 * 60 * 1000), // 10 minutos atrás
      status: "agendado",
      cliente: { nome: "Cliente 1 - Cutilação (60min)" },
      servico: { nome: "Cutilação Pé+Mão", duracao_minutos: 60 },
    },
    {
      id: "2",
      data_hora: new Date(Date.now() + 5 * 60 * 1000), // 5 minutos no futuro
      status: "agendado",
      cliente: { nome: "Cliente 2 - Escova (40min)" },
      servico: { nome: "Escova", duracao_minutos: 40 },
    },
    {
      id: "3",
      data_hora: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
      status: "agendado",
      cliente: { nome: "Cliente 3 - Múltiplos serviços" },
      servicos: [
        { servico: { nome: "Cutilação Pé+Mão", duracao_minutos: 60 } },
        { servico: { nome: "Escova", duracao_minutos: 40 } },
      ],
    },
    {
      id: "4",
      data_hora: new Date(Date.now() - 70 * 60 * 1000), // 70 minutos atrás
      status: "em_andamento",
      cliente: { nome: "Cliente 4 - Deveria finalizar" },
      servico: { nome: "Cutilação P��+Mão", duracao_minutos: 60 },
    },
    {
      id: "5",
      data_hora: new Date(Date.now() - 10 * 60 * 1000), // 10 minutos atrás
      status: "em_andamento",
      cliente: { nome: "TESTE - Progressão Real (15min restantes)" },
      servicos: [
        { servico: { nome: "Manicure", duracao_minutos: 45 } },
        { servico: { nome: "Pedicure", duracao_minutos: 60 } },
        { servico: { nome: "Esmaltação", duracao_minutos: 20 } },
      ],
    },
  ];

  return (
    <div className="bella-card">
      <h3 className="text-lg font-semibold text-bella-800 mb-4">
        Teste de Status Automático
      </h3>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Hora atual:</strong> {agora.toLocaleTimeString("pt-BR")}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          <strong>Nova Lógica:</strong> Exatamente no horário → "em_andamento" →
          auto-finaliza na duração do serviço
        </p>
        <p className="text-xs text-blue-600">
          Ex: 09:00 + Cutilação(60min) + Escova(40min) = finaliza às 10:40
        </p>
      </div>

      <div className="space-y-3">
        {agendamentosTest.map((agendamento) => {
          const statusOriginal = agendamento.status;
          const statusAutomatico = getStatusAutomatico(agendamento);
          const statusColor = getStatusColor(statusAutomatico);
          const duracaoTotal = calcularDuracaoTotal(agendamento);
          const horaFim = new Date(
            agendamento.data_hora.getTime() + duracaoTotal * 60 * 1000,
          );

          return (
            <div
              key={agendamento.id}
              className="border border-gray-200 rounded p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">
                    {agendamento.cliente.nome}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Início:</strong>{" "}
                    {agendamento.data_hora.toLocaleTimeString("pt-BR")}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Duração:</strong> {duracaoTotal} minutos
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Fim:</strong> {horaFim.toLocaleTimeString("pt-BR")}
                  </p>
                  <p className="text-xs text-gray-500">
                    Status original: {statusOriginal}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
                  >
                    {statusAutomatico}
                  </span>
                  {statusOriginal !== statusAutomatico && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Atualizado automaticamente
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
