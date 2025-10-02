import React, { useState, useEffect } from "react";
import {
  FiDroplet,
  FiSave,
  FiRotateCcw,
  FiX,
  FiLoader,
  FiUser,
  FiCheck,
} from "react-icons/fi";
import {
  CORES_FUNCIONARIO,
  getAllCoresOffline,
  getCorOffline,
  salvarCorOffline,
  generateColorFromId,
  getColorVariants,
  isLightColor,
} from "@/services/funcionarioColorsOffline";
import { setFuncionarioCor } from "@/services/funcionarioColorsService";
import { getFuncionarios } from "@/services/funcionarioService";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { toast } from "@/hooks/use-toast";
import { migrateFuncionarioCores } from "@/services/migrationService";

interface Funcionario {
  id: string;
  nome: string;
  username: string;
  is_admin: boolean;
  ativo: boolean;
}

interface FuncionarioCoresConfigProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FuncionarioCoresConfig({
  isOpen,
  onClose,
}: FuncionarioCoresConfigProps) {
  const { user } = useAuth();
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [coresPersonalizadas, setCoresPersonalizadas] = useState<
    Record<string, string>
  >({});
  const [coresAtuais, setCoresAtuais] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [funcionarioEditando, setFuncionarioEditando] = useState<string | null>(
    null,
  );
  const [tabelaExiste, setTabelaExiste] = useState<boolean | null>(null);
  const [executandoMigracao, setExecutandoMigracao] = useState(false);

  // Carregar dados quando modal abre
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar funcionários
      const funcionariosData = await getFuncionarios();
      setFuncionarios(funcionariosData);

      // Carregar cores offline (sempre funciona)
      const coresOffline = getAllCoresOffline();
      setCoresPersonalizadas(coresOffline);

      // Assumir que tabela não existe por padrão (modo offline)
      setTabelaExiste(false);

      // Gerar cores atuais (offline ou padrão)
      const coresCalculadas: Record<string, string> = {};
      for (const funcionario of funcionariosData) {
        coresCalculadas[funcionario.id] = getCorOffline(funcionario.id);
      }
      setCoresAtuais(coresCalculadas);

      console.log("✅ Dados carregados em modo offline");
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setTabelaExiste(false);
      toast({
        title: "Aviso",
        description: "Carregando em modo offline - funcionalidade limitada",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCorChange = (funcionarioId: string, novaCor: string) => {
    setCoresAtuais({
      ...coresAtuais,
      [funcionarioId]: novaCor,
    });
  };

  const handleSalvarCor = async (funcionarioId: string) => {
    if (!user?.id) return;

    try {
      setSaving(true);
      const novaCor = coresAtuais[funcionarioId];

      // Sempre salvar offline primeiro (garantido que funciona)
      const resultadoOffline = salvarCorOffline(
        funcionarioId,
        novaCor,
        user.id,
      );

      if (resultadoOffline.success) {
        // Atualizar estado local
        setCoresPersonalizadas({
          ...coresPersonalizadas,
          [funcionarioId]: novaCor,
        });

        setFuncionarioEditando(null);

        // Tentar salvar online também (se tabela existir)
        if (tabelaExiste) {
          try {
            const resultadoOnline = await setFuncionarioCor(
              funcionarioId,
              novaCor,
              user.id,
            );
            if (resultadoOnline.success) {
              toast({
                title: "✅ Cor salva no banco e localmente! 🎨",
                description:
                  "A cor será aplicada imediatamente nos agendamentos",
              });
            } else {
              toast({
                title: "💾 Cor salva localmente! 🎨",
                description:
                  "Funcionará normalmente. Execute migração para persistir no banco.",
              });
            }
          } catch (onlineError) {
            console.log(
              "Falha ao salvar online, mantendo offline:",
              onlineError,
            );
            toast({
              title: "💾 Cor salva localmente! 🎨",
              description:
                "Funcionará normalmente. Execute migração para persistir no banco.",
            });
          }
        } else {
          toast({
            title: "💾 Cor salva localmente! 🎨",
            description:
              "Funcionará normalmente. Execute migração para persistir no banco.",
          });
        }
      } else {
        toast({
          title: "❌ Erro ao salvar cor",
          description: resultadoOffline.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao salvar cor:", error);
      toast({
        title: "Erro inesperado",
        description: "Verifique o console para mais detalhes",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetarCor = (funcionarioId: string) => {
    const corPadrao = generateColorFromId(funcionarioId);
    setCoresAtuais({
      ...coresAtuais,
      [funcionarioId]: corPadrao,
    });
  };

  const resetarTodasCores = () => {
    const novasCores: Record<string, string> = {};
    funcionarios.forEach((funcionario) => {
      novasCores[funcionario.id] = generateColorFromId(funcionario.id);
    });
    setCoresAtuais(novasCores);
  };

  const handleExecutarMigracao = async () => {
    if (!user?.is_admin) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem executar migrações",
        variant: "destructive",
      });
      return;
    }

    try {
      setExecutandoMigracao(true);

      toast({
        title: "Executando migração...",
        description: "Criando tabela no banco de dados",
      });

      const resultado = await migrateFuncionarioCores();

      if (resultado.success) {
        setTabelaExiste(true);
        toast({
          title: "✅ Migração executada com sucesso!",
          description: resultado.details || "Tabela criada no banco de dados",
        });

        // Recarregar dados
        await loadData();
      } else {
        toast({
          title: "❌ Erro na migração",
          description: resultado.error || "Erro desconhecido",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao executar migração:", error);
      toast({
        title: "Erro inesperado",
        description: "Verifique o console para mais detalhes",
        variant: "destructive",
      });
    } finally {
      setExecutandoMigracao(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FiDroplet className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">
              Configurar Cores dos Funcionários
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="w-8 h-8 text-purple-600 animate-spin" />
              <span className="ml-3 text-gray-600">
                Carregando funcionários...
              </span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Aviso de Migração */}
              {tabelaExiste === false && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-800 mb-2">
                        Migração do Banco de Dados Necessária
                      </h3>
                      <p className="text-sm text-red-700 mb-3">
                        A tabela{" "}
                        <code className="bg-red-100 px-1 rounded">
                          funcionario_cores
                        </code>{" "}
                        não foi encontrada no banco de dados. As cores
                        funcionarão apenas no modo padrão até que a migração
                        seja executada.
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-xs text-red-600">
                          <strong>Como corrigir:</strong> Execute o arquivo{" "}
                          <code>migration_funcionario_cores.sql</code> no seu
                          banco Neon.
                        </div>
                        <button
                          onClick={handleExecutarMigracao}
                          disabled={executandoMigracao}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-1"
                        >
                          {executandoMigracao ? (
                            <>
                              <FiLoader className="w-3 h-3 animate-spin" />
                              <span>Executando...</span>
                            </>
                          ) : (
                            <span>🔧 Tentar Migração Automática</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Instruções */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">
                  Como funciona:
                </h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>
                    • Cada funcionário tem uma cor única para identificação
                  </li>
                  <li>
                    • As cores aparecem nos agendamentos para fácil visualização
                  </li>
                  <li>• Clique em uma cor para escolher uma personalizada</li>
                  <li>• Use "Resetar" para voltar à cor padrão do sistema</li>
                </ul>
              </div>

              {/* Cores Pré-definidas */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Cores Disponíveis:
                </h3>
                <div className="grid grid-cols-8 md:grid-cols-16 gap-2">
                  {CORES_FUNCIONARIO.map((cor, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-lg border-2 border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: cor }}
                      title={cor}
                      onClick={() => {
                        if (funcionarioEditando) {
                          handleCorChange(funcionarioEditando, cor);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Lista de Funcionários */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">
                    Configurar Cores dos Funcionários:
                  </h3>
                  <button
                    onClick={resetarTodasCores}
                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                  >
                    <FiRotateCcw className="w-4 h-4" />
                    <span>Resetar Todas</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {funcionarios.map((funcionario) => {
                    const corAtual = coresAtuais[funcionario.id];
                    const corPersonalizada =
                      coresPersonalizadas[funcionario.id];
                    const isEditando = funcionarioEditando === funcionario.id;
                    const variants = getColorVariants(corAtual);

                    return (
                      <div
                        key={funcionario.id}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        style={{
                          backgroundColor: variants.light,
                          borderColor: variants.border,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {/* Avatar com cor */}
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold border-2"
                              style={{
                                backgroundColor: corAtual,
                                borderColor: variants.border,
                                color: isLightColor(corAtual) ? "#000" : "#fff",
                              }}
                            >
                              {funcionario.nome.charAt(0).toUpperCase()}
                            </div>

                            {/* Info do funcionário */}
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-800">
                                  {funcionario.nome}
                                </span>
                                {funcionario.is_admin && (
                                  <FiUser className="w-4 h-4 text-purple-600" />
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                @{funcionario.username}
                              </div>
                              {corPersonalizada && (
                                <div className="text-xs text-green-600 flex items-center space-x-1">
                                  <FiCheck className="w-3 h-3" />
                                  <span>Cor personalizada</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Controles */}
                          <div className="flex items-center space-x-2">
                            {isEditando ? (
                              <>
                                <input
                                  type="color"
                                  value={corAtual}
                                  onChange={(e) =>
                                    handleCorChange(
                                      funcionario.id,
                                      e.target.value,
                                    )
                                  }
                                  className="w-8 h-8 rounded border cursor-pointer"
                                />
                                <button
                                  onClick={() =>
                                    handleSalvarCor(funcionario.id)
                                  }
                                  disabled={saving}
                                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                  title="Salvar"
                                >
                                  {saving ? (
                                    <FiLoader className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <FiSave className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => setFuncionarioEditando(null)}
                                  className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                  title="Cancelar"
                                >
                                  <FiX className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <div
                                  className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                                  style={{ backgroundColor: corAtual }}
                                  onClick={() =>
                                    setFuncionarioEditando(funcionario.id)
                                  }
                                  title="Clique para editar cor"
                                />
                                <button
                                  onClick={() =>
                                    handleResetarCor(funcionario.id)
                                  }
                                  className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                  title="Resetar para cor padrão"
                                >
                                  <FiRotateCcw className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              As cores serão aplicadas imediatamente aos agendamentos
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Concluído
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
