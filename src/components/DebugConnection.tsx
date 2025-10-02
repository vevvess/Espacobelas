import React, { useState, useEffect } from 'react';
import { FiActivity, FiDatabase, FiUser, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '@/contexts/SimpleAuthContext';

// Importar as funções de teste para garantir que estejam disponíveis
import '@/lib/directSQL';

export const DebugConnection: React.FC = () => {
  const { user } = useAuth();
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [userTest, setUserTest] = useState<any>(null);
  const [agendamentosTest, setAgendamentosTest] = useState<any>(null);

  const runTests = async () => {
    try {
      console.log('🔍 Executando testes de conectividade...');

      // Teste 1: Conexão robusta
      console.log('🔍 Teste 1: Conexão robusta Neon');
      if (typeof window !== 'undefined' && (window as any).testNeonConnection) {
        try {
          const connResult = await (window as any).testNeonConnection();
          setConnectionTest(connResult);
          console.log('Resultado conexão robusta:', connResult);
        } catch (err) {
          setConnectionTest({ success: false, error: err?.message || 'Erro na conexão robusta' });
          console.error('Erro no teste de conexão robusta:', err);
        }
      } else {
        setConnectionTest({ success: false, error: 'Sistema de conexão robusta não disponível' });
      }

      // Teste 2: Verificar usuário
      console.log('🔍 Teste 2: Usuário atual');
      setUserTest({
        user: user,
        hasId: !!user?.id,
        isAdmin: user?.is_admin || false,
        username: user?.username || 'N/A'
      });
      console.log('Usuário:', user);

      // Teste 3: Teste SQL robusto para agendamentos
      if (user?.id && typeof window !== 'undefined' && (window as any).sqlRobust) {
        console.log('🔍 Teste 3: Query robusta de agendamentos');
        try {
          // Primeiro testar se a tabela existe
          const tableCheck = await (window as any).sqlRobust`
            SELECT table_name FROM information_schema.tables
            WHERE table_name = 'agendamentos' AND table_schema = 'public'
          `;

          if (tableCheck.length > 0) {
            const agendamentos = await (window as any).sqlRobust`
              SELECT COUNT(*) as total FROM agendamentos
              WHERE user_simple_id = ${user.id}
            `;
            setAgendamentosTest({
              success: true,
              total: agendamentos[0]?.total || 0,
              tableExists: true
            });
            console.log('Agendamentos encontrados (robusto):', agendamentos[0]?.total);
          } else {
            setAgendamentosTest({
              success: false,
              error: 'Tabela agendamentos não encontrada',
              tableExists: false
            });
          }
        } catch (err) {
          setAgendamentosTest({
            success: false,
            error: err?.message || 'Erro na query robusta',
            details: err?.stack ? err.stack.split('\n')[0] : 'Sem detalhes'
          });
          console.error('Erro query agendamentos robusta:', err);
        }
      } else {
        setAgendamentosTest({
          success: false,
          error: user?.id ? 'Sistema SQL robusto não disponível' : 'Aguardando usuário'
        });
      }
    } catch (error) {
      console.error('Erro geral nos testes:', error);
      setConnectionTest({ success: false, error: 'Erro geral: ' + (error?.message || 'Desconhecido') });
    }
  };

  useEffect(() => {
    runTests();
  }, [user?.id]);

  if (!window.location.hostname.includes('localhost')) {
    return null; // Só mostrar em desenvolvimento
  }

  return (
    <div className="fixed top-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm max-w-sm z-50">
      <div className="flex items-center gap-2 mb-3">
        <FiActivity className="w-4 h-4 text-blue-500" />
        <h3 className="font-semibold">Debug de Conexão</h3>
        <button 
          onClick={runTests}
          className="ml-auto p-1 hover:bg-gray-100 rounded"
          title="Executar testes novamente"
        >
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Teste de Conexão */}
        <div className="p-2 bg-gray-50 rounded">
          <div className="flex items-center gap-2">
            <FiDatabase className="w-4 h-4" />
            <span className="font-medium">Conexão DB</span>
          </div>
          {connectionTest ? (
            <div className={`text-xs mt-1 ${connectionTest.success ? 'text-green-600' : 'text-red-600'}`}>
              {connectionTest.success ? '✅ OK' : `❌ ${connectionTest.error}`}
            </div>
          ) : (
            <div className="text-xs mt-1 text-gray-500">Testando...</div>
          )}
        </div>

        {/* Teste de Usuário */}
        <div className="p-2 bg-gray-50 rounded">
          <div className="flex items-center gap-2">
            <FiUser className="w-4 h-4" />
            <span className="font-medium">Autenticação</span>
          </div>
          {userTest ? (
            <div className="text-xs mt-1">
              <div className={userTest.hasId ? 'text-green-600' : 'text-red-600'}>
                {userTest.hasId ? '✅ Usuário autenticado' : '❌ Sem usuário'}
              </div>
              {userTest.user && (
                <div className="text-gray-600">
                  ID: {userTest.user.id?.substring(0, 8)}...
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs mt-1 text-gray-500">Verificando...</div>
          )}
        </div>

        {/* Teste de Agendamentos */}
        <div className="p-2 bg-gray-50 rounded">
          <div className="flex items-center gap-2">
            <FiActivity className="w-4 h-4" />
            <span className="font-medium">Agendamentos</span>
          </div>
          {agendamentosTest ? (
            <div className="text-xs mt-1">
              <div className={agendamentosTest.success ? 'text-green-600' : 'text-red-600'}>
                {agendamentosTest.success
                  ? `✅ ${agendamentosTest.total} encontrados`
                  : `❌ ${agendamentosTest.error}`
                }
              </div>
              {agendamentosTest.tableExists === false && (
                <div className="text-amber-600">⚠️ Tabela não existe</div>
              )}
              {agendamentosTest.details && (
                <div className="text-gray-500 text-xs mt-1">
                  {agendamentosTest.details}
                </div>
              )}
            </div>
          ) : user?.id ? (
            <div className="text-xs mt-1 text-gray-500">Testando...</div>
          ) : (
            <div className="text-xs mt-1 text-gray-400">Aguardando usuário</div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex gap-2 mb-2">
          <button
            onClick={runTests}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Testar Novamente
          </button>
          <button
            onClick={async () => {
              if (typeof window !== 'undefined' && (window as any).getNeonStats) {
                console.log('🔍 Estatísticas do sistema robusto...');
                const stats = (window as any).getNeonStats();
                console.log('📊 Stats Neon:', stats);
              }
              if (typeof window !== 'undefined' && (window as any).resetNeonConnection) {
                console.log('🔄 Resetando conexão robusta...');
                await (window as any).resetNeonConnection();
                console.log('✅ Reset concluído');
              }
            }}
            className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Reset Robusto
          </button>
        </div>

        <div className="text-xs text-gray-600">
          <div>Console commands:</div>
          <div className="font-mono bg-gray-100 p-1 rounded mt-1 text-xs">
            window.testNeonConnection()<br/>
            window.getNeonStats()<br/>
            window.resetNeonConnection()
          </div>
        </div>
      </div>
    </div>
  );
};
