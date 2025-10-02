import React, { useState } from "react";
import { FiUpload, FiEye, FiCheck, FiX, FiUser, FiRefreshCw, FiInfo } from "react-icons/fi";
import { importarClientesLista, previewImportacaoClientes } from "@/services/clienteImportService";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SimpleAuthContext";

export default function ClienteImportManager() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [previewResults, setPreviewResults] = useState<any>(null);
  const [importResults, setImportResults] = useState<any>(null);
  const [showPreviewDetails, setShowPreviewDetails] = useState(false);

  const handlePreview = async () => {
    setLoading(true);
    try {
      console.log("Gerando preview da importação...");
      const results = await previewImportacaoClientes();
      setPreviewResults(results);
      
      toast({
        title: "Preview gerado",
        description: `${results.novosClientes.length} novos, ${results.clientesParaAtualizar.length} para atualizar, ${results.clientesIgnorados.length} ignorados`,
      });
    } catch (error) {
      toast({
        title: "Erro no preview",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Tem certeza que deseja importar os clientes? Esta ação irá criar novos clientes e atualizar dados faltantes dos existentes.")) {
      return;
    }

    setLoading(true);
    try {
      console.log("Iniciando importação...");
      const results = await importarClientesLista(user.id);
      setImportResults(results);
      
      if (results.success) {
        toast({
          title: "Importação concluída",
          description: `${results.novosClientes} novos clientes, ${results.clientesAtualizados} atualizados`,
        });
      } else {
        toast({
          title: "Importação com erros",
          description: `${results.novosClientes + results.clientesAtualizados} processados, mas houveram ${results.errors.length} erros`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na importação",
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
              Importar Lista de Clientes
            </h3>
            <p className="text-sm text-bella-600">
              Importe a lista fornecida verificando duplicatas e completando informações
            </p>
          </div>
        </div>

        {/* Informações sobre a importação */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <FiInfo className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">
                Como funciona a importação
              </h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• <strong>Novos clientes:</strong> Serão criados se não existirem no app</p>
                <p>• <strong>Clientes existentes:</strong> Apenas informações faltantes serão adicionadas</p>
                <p>• <strong>Mesmo nome e sobrenome:</strong> Cliente será ignorado se já tiver dados completos</p>
                <p>• <strong>Total na lista:</strong> 148 clientes para processar</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handlePreview}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
          >
            {loading ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiEye className="w-4 h-4" />}
            <span>Preview Importação</span>
          </button>

          <button
            onClick={handleImport}
            disabled={loading || !previewResults}
            className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
          >
            {loading ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiUpload className="w-4 h-4" />}
            <span>Executar Importação</span>
          </button>
        </div>

        {/* Resultados do Preview */}
        {previewResults && (
          <div className="border border-bella-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-bella-800">Resultados do Preview</h4>
              <button
                onClick={() => setShowPreviewDetails(!showPreviewDetails)}
                className="text-sm text-bella-600 hover:text-bella-800"
              >
                {showPreviewDetails ? "Ocultar" : "Ver"} Detalhes
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <FiUser className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Novos Clientes</p>
                    <p className="text-sm text-green-600">{previewResults.novosClientes.length} clientes</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <FiRefreshCw className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-800">Para Atualizar</p>
                    <p className="text-sm text-blue-600">{previewResults.clientesParaAtualizar.length} clientes</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <FiX className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Ignorados</p>
                    <p className="text-sm text-gray-600">{previewResults.clientesIgnorados.length} clientes</p>
                  </div>
                </div>
              </div>
            </div>

            {showPreviewDetails && (
              <div className="space-y-4">
                {/* Novos clientes */}
                {previewResults.novosClientes.length > 0 && (
                  <div>
                    <h5 className="font-medium text-bella-800 mb-2">Novos clientes ({previewResults.novosClientes.length}):</h5>
                    <div className="bg-green-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                      {previewResults.novosClientes.slice(0, 20).map((cliente: any, index: number) => (
                        <div key={index} className="mb-1">
                          <strong>{cliente.nome}</strong>
                          {cliente.telefone && <span className="text-green-700"> - {cliente.telefone}</span>}
                          {cliente.aniversario && <span className="text-green-600"> - {cliente.aniversario}</span>}
                        </div>
                      ))}
                      {previewResults.novosClientes.length > 20 && (
                        <div className="text-green-600 font-medium mt-2">
                          ... e mais {previewResults.novosClientes.length - 20} clientes
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Clientes para atualizar */}
                {previewResults.clientesParaAtualizar.length > 0 && (
                  <div>
                    <h5 className="font-medium text-bella-800 mb-2">Clientes para atualizar ({previewResults.clientesParaAtualizar.length}):</h5>
                    <div className="bg-blue-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                      {previewResults.clientesParaAtualizar.slice(0, 15).map((cliente: any, index: number) => (
                        <div key={index} className="mb-2">
                          <strong>{cliente.nome}</strong>
                          <div className="ml-4 text-blue-700">
                            {cliente.updates.telefone && <div>• Adicionar telefone: {cliente.updates.telefone}</div>}
                            {cliente.updates.aniversario && <div>• Adicionar aniversário: {cliente.updates.aniversario}</div>}
                          </div>
                        </div>
                      ))}
                      {previewResults.clientesParaAtualizar.length > 15 && (
                        <div className="text-blue-600 font-medium mt-2">
                          ... e mais {previewResults.clientesParaAtualizar.length - 15} clientes
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Resultados da Importação */}
        {importResults && (
          <div className="border border-bella-200 rounded-lg p-4">
            <h4 className="font-semibold text-bella-800 mb-3">Resultados da Importação</h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <FiCheck className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Novos</p>
                    <p className="text-sm text-green-600">{importResults.novosClientes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <FiRefreshCw className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-800">Atualizados</p>
                    <p className="text-sm text-blue-600">{importResults.clientesAtualizados}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <FiX className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Ignorados</p>
                    <p className="text-sm text-gray-600">{importResults.clientesIgnorados}</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <FiX className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-800">Erros</p>
                    <p className="text-sm text-red-600">{importResults.errors.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Erros */}
            {importResults.errors.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-red-800 mb-2">Erros encontrados:</h5>
                <div className="bg-red-50 p-2 rounded text-sm max-h-32 overflow-y-auto">
                  {importResults.errors.map((error: string, index: number) => (
                    <div key={index} className="text-red-700 mb-1">{error}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Resumo dos detalhes */}
            {importResults.details.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-bella-800 mb-2">Resumo das ações:</h5>
                <div className="text-sm space-y-1 max-h-40 overflow-y-auto">
                  {importResults.details.slice(0, 10).map((detail: any, index: number) => (
                    <div key={index} className={`p-2 rounded ${
                      detail.acao === 'criado' ? 'bg-green-50' :
                      detail.acao === 'atualizado' ? 'bg-blue-50' : 'bg-gray-50'
                    }`}>
                      <strong>{detail.nome}</strong>
                      <span className={`ml-2 ${
                        detail.acao === 'criado' ? 'text-green-600' :
                        detail.acao === 'atualizado' ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {detail.acao}
                      </span>
                      {detail.updates && (
                        <span className="ml-2 text-xs">
                          ({Object.keys(detail.updates).join(', ')})
                        </span>
                      )}
                    </div>
                  ))}
                  {importResults.details.length > 10 && (
                    <div className="text-bella-600 font-medium">
                      ... e mais {importResults.details.length - 10} ações
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
