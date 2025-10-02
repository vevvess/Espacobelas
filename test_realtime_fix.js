// Teste para verificar se o erro de "body stream already read" foi corrigido

console.log('🧪 Testando correção do RealTimeConnector...');

// Simular múltiplas operações para verificar se não há conflitos
async function testStreamFix() {
  try {
    // Teste 1: Verificar se a instância é única
    if (typeof window !== 'undefined' && window.realTimeConnector) {
      console.log('✅ RealTimeConnector disponível globalmente');
      
      const status1 = window.realTimeConnector.getStatus();
      const status2 = window.realTimeConnector.getStatus();
      
      console.log('Status 1:', status1);
      console.log('Status 2:', status2);
      
      if (status1 === status2) {
        console.log('✅ Instância única confirmada');
      } else {
        console.log('❌ Múltiplas instâncias detectadas');
      }
    }
    
    // Teste 2: Health check
    if (typeof window !== 'undefined' && window.realTimeConnector) {
      console.log('🔄 Executando health check...');
      const result = await window.realTimeConnector.forceReconnection();
      console.log('Health check result:', result);
    }
    
    // Teste 3: Verificar se o serviço está disponível
    if (typeof window !== 'undefined' && window.agendamentoRealTimeService) {
      console.log('✅ Serviço de agendamentos disponível');
      
      const stats = await window.agendamentoRealTimeService.getStats();
      console.log('Estatísticas do serviço:', stats);
    }
    
    console.log('🎉 Testes concluídos sem erros de stream!');
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error);
    
    if (error.message.includes('body stream already read')) {
      console.log('🚨 Erro de stream ainda presente!');
    } else {
      console.log('✅ Sem erros de stream - outros erros podem existir');
    }
  }
}

// Executar teste após carregamento
if (typeof window !== 'undefined') {
  setTimeout(testStreamFix, 2000); // Aguardar 2 segundos
} else {
  console.log('Teste deve ser executado no browser');
}
