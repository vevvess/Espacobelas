// Teste da lógica de status automático
console.log('🧪 Testando lógica de status automático...');

// Simular agendamentos de teste
const agendamentosTeste = [
  {
    id: '1',
    data_hora: new Date(Date.now() - 10 * 60 * 1000), // 10 minutos atrás
    status: 'agendado',
    servicos: [{ servico: { duracao_minutos: 60 } }]
  },
  {
    id: '2', 
    data_hora: new Date(Date.now() + 5 * 60 * 1000), // 5 minutos no futuro
    status: 'agendado',
    servicos: [{ servico: { duracao_minutos: 30 } }]
  },
  {
    id: '3',
    data_hora: new Date(Date.now() - 70 * 60 * 1000), // 70 minutos atrás (deveria estar aguardando pagamento)
    status: 'em_andamento',
    servicos: [{ servico: { duracao_minutos: 60 } }]
  }
];

// Função de teste (cópia da lógica)
const calcularDuracaoTotal = (agendamento) => {
  let duracaoTotal = 0;
  if (agendamento.servicos && agendamento.servicos.length > 0) {
    agendamento.servicos.forEach((servico) => {
      if (servico.servico?.duracao_minutos) {
        duracaoTotal += servico.servico.duracao_minutos;
      }
    });
  }
  return duracaoTotal > 0 ? duracaoTotal : 60;
};

const getStatusAutomatico = (agendamento) => {
  const agora = new Date();
  const dataHoraInicio = new Date(agendamento.data_hora);

  if (agendamento.status === "concluido" || agendamento.status === "cancelado") {
    return agendamento.status;
  }

  if (agendamento.status === "aguardando_confirmacao" || 
      agendamento.status === "aguardando_confirmacao_pagamento" ||
      agendamento.status === "aguardando_pagamento") {
    return agendamento.status;
  }

  const duracaoMinutos = calcularDuracaoTotal(agendamento);
  const dataHoraFim = new Date(dataHoraInicio.getTime() + duracaoMinutos * 60 * 1000);

  if (agora < dataHoraInicio) {
    return ["agendado", "confirmado"].includes(agendamento.status) 
      ? agendamento.status 
      : "agendado";
  } else if (agora >= dataHoraInicio && agora <= dataHoraFim) {
    return "em_andamento";
  } else {
    return agendamento.status === "em_andamento" 
      ? "aguardando_pagamento" 
      : agendamento.status;
  }
};

// Testar cada agendamento
console.log('📊 Resultados do teste:');
agendamentosTeste.forEach(agendamento => {
  const statusOriginal = agendamento.status;
  const statusAutomatico = getStatusAutomatico(agendamento);
  const dataHora = new Date(agendamento.data_hora);
  const duracao = calcularDuracaoTotal(agendamento);
  
  console.log(`\n🔍 Agendamento ${agendamento.id}:`);
  console.log(`   📅 Data/Hora: ${dataHora.toLocaleString()}`);
  console.log(`   ⏱️ Duração: ${duracao} minutos`);
  console.log(`   📊 Status Original: ${statusOriginal}`);
  console.log(`   🔄 Status Automático: ${statusAutomatico}`);
  console.log(`   ${statusOriginal !== statusAutomatico ? '✅ Mudou automaticamente!' : '➡️ Manteve status'}`);
});

console.log('\n✅ Teste de lógica concluído!');
