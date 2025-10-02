import React, { useState } from "react";
import { FiRefreshCw, FiCheck, FiX, FiEye, FiDownload } from "react-icons/fi";
import { syncClientesFromNotion, testSyncClientesFromNotion } from "@/services/notionClienteSync";
import { toast } from "@/hooks/use-toast";
import NotionSyncInstructions from "./NotionSyncInstructions";

export default function NotionClienteSync() {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [syncResults, setSyncResults] = useState<any>(null);
  const [showTestDetails, setShowTestDetails] = useState(false);

  const handleTestSync = async () => {
    setLoading(true);
    try {
      console.log("Testando sincronização...");
      const results = await testSyncClientesFromNotion();
      setTestResults(results);
      
      toast({
        title: "Teste concluído",
        description: `${results.matches.length} clientes encontrados, ${results.wouldUpdate.length} seriam atualizados`,
      });
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!confirm("Tem certeza que deseja sincronizar os dados dos clientes do Notion? Esta ação irá atualizar telefones e datas de nascimento.")) {
      return;
    }

    setLoading(true);
    try {
      console.log("Iniciando sincronização...");
      const results = await syncClientesFromNotion();
      setSyncResults(results);
      
      if (results.success) {
        toast({
          title: "Sincronização concluída",
          description: `${results.updated} clientes foram atualizados com sucesso`,
        });
      } else {
        toast({
          title: "Sincronização com erros",
          description: `${results.updated} clientes atualizados, mas houveram ${results.errors.length} erros`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bella-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-bella-800">
              Sincronização com Notion
            </h3>
            <p className="text-sm text-bella-600">
              Atualize telefones e datas de nascimento dos clientes usando dados do Notion
            </p>
          </div>
        </div>

        <NotionSyncInstructions />

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleTestSync}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
          >
            {loading ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiEye className="w-4 h-4" />}
            <span>Testar Sincronização</span>
          </button>

          <button
            onClick={handleSync}
            disabled={loading || !testResults}
            className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
          >
            {loading ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiDownload className="w-4 h-4" />}
            <span>Executar Sincronização</span>
          </button>
        </div>

        {/* Resultados do Teste */}
        {testResults && (
          <div className="border border-bella-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-bella-800">Resultados do Teste</h4>
              <button
                onClick={() => setShowTestDetails(!showTestDetails)}
                className="text-sm text-bella-600 hover:text-bella-800"
              >
                {showTestDetails ? "Ocultar" : "Ver"} Detalhes
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <FiCheck className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Encontrados</p>
                    <p className="text-sm text-green-600">{testResults.matches.length} clientes</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <FiRefreshCw className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-800">Serão Atualizados</p>
                    <p className="text-sm text-blue-600">{testResults.wouldUpdate.length} clientes</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <FiX className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-yellow-800">Não Encontrados</p>
                    <p className="text-sm text-yellow-600">{testResults.notFound.length} clientes</p>
                  </div>
                </div>
              </div>
            </div>

            {showTestDetails && (
              <div className="space-y-4">
                {/* Clientes que serão atualizados */}
                {testResults.wouldUpdate.length > 0 && (
                  <div>
                    <h5 className="font-medium text-bella-800 mb-2">Clientes que serão atualizados:</h5>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {testResults.wouldUpdate.map((cliente: any, index: number) => (
                        <div key={index} className="bg-blue-50 p-2 rounded text-sm">
                          <strong>{cliente.nome}</strong>
                          <ul className="ml-4 mt-1">
                            {cliente.updates.telefone && (
                              <li>• Telefone: {cliente.updates.telefone}</li>
                            )}
                            {cliente.updates.data_nascimento && (
                              <li>• Data nascimento: {new Date(cliente.updates.data_nascimento).toLocaleDateString('pt-BR')}</li>
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clientes não encontrados */}
                {testResults.notFound.length > 0 && (
                  <div>
                    <h5 className="font-medium text-bella-800 mb-2">Clientes do Notion não encontrados no app:</h5>
                    <div className="bg-yellow-50 p-2 rounded text-sm max-h-32 overflow-y-auto">
                      {testResults.notFound.join(", ")}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Resultados da Sincronização */}
        {syncResults && (
          <div className="border border-bella-200 rounded-lg p-4">
            <h4 className="font-semibold text-bella-800 mb-3">Resultados da Sincronização</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <FiCheck className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Atualizados</p>
                    <p className="text-sm text-green-600">{syncResults.updated} clientes</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <FiX className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-800">Erros</p>
                    <p className="text-sm text-red-600">{syncResults.errors.length} erros</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes dos updates */}
            {syncResults.details.length > 0 && (
              <div>
                <h5 className="font-medium text-bella-800 mb-2">Detalhes:</h5>
                <div className="space-y-1 max-h-40 overflow-y-auto text-sm">
                  {syncResults.details.map((detail: any, index: number) => (
                    <div key={index} className={`p-2 rounded ${
                      detail.status === 'updated' ? 'bg-green-50' :
                      detail.status === 'not_found' ? 'bg-yellow-50' : 'bg-gray-50'
                    }`}>
                      <strong>{detail.nome}</strong>
                      {detail.status === 'updated' && detail.updates && (
                        <span className="ml-2 text-green-600">
                          {Object.keys(detail.updates).join(', ')} atualizado(s)
                        </span>
                      )}
                      {detail.status === 'not_found' && (
                        <span className="ml-2 text-yellow-600">não encontrado</span>
                      )}
                      {detail.status === 'no_update_needed' && (
                        <span className="ml-2 text-gray-600">já atualizado</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Erros */}
            {syncResults.errors.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-red-800 mb-2">Erros:</h5>
                <div className="bg-red-50 p-2 rounded text-sm">
                  {syncResults.errors.map((error: string, index: number) => (
                    <div key={index} className="text-red-700">{error}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
