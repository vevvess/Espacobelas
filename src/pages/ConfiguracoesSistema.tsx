import React, { useState } from "react";
import {
  FiSettings,
  FiDatabase,
  FiKey,
  FiShield,
  FiUsers,
  FiInfo,
  FiCheck,
  FiAlertTriangle,
  FiCopy,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { useAuth } from "../contexts/SimpleAuthContext";
import { DatabaseConnectionTest } from "../components/DatabaseConnectionTest";
import { DatabaseVerification } from "../components/DatabaseVerification";
import { getAllUsers } from "../services/userService";

export default function ConfiguracoesSistema() {
  const { user } = useAuth();
  const [showDatabaseTest, setShowDatabaseTest] = useState(false);
  const [showDatabaseVerification, setShowDatabaseVerification] =
    useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Verificar se é admin
  if (!user?.is_admin) {
    return (
      <div className="bella-card text-center py-8">
        <FiShield className="w-12 h-12 text-bella-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-bella-800 mb-2">
          Acesso Restrito
        </h2>
        <p className="text-bella-600">
          Apenas administradores podem acessar as configurações do sistema.
        </p>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Aqui você pode adicionar um toast de sucesso
  };

  const loadUsuarios = async () => {
    setLoadingUsers(true);
    try {
      const usuariosList = await getAllUsers();
      setUsuarios(usuariosList);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const credenciaisAdmin = {
    usuario: "Weslley",
    senha: "1808741",
    role: "Administrador",
    funcionalidades: [
      "Acesso completo ao sistema",
      "Gerenciar usuários",
      "Configurar comissões",
      "Visualizar todos os relatórios",
      "Editar agendamentos",
      "Gerenciar clientes e serviços",
    ],
  };

  const informacoesSistema = {
    versao: "1.0.0",
    ambiente: import.meta.env.MODE,
    banco: "Neon PostgreSQL",
    hospedagem: "Vercel/Netlify",
    framework: "React + Vite",
    autenticacao: "Sistema Simples",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bella-800 flex items-center space-x-2">
            <FiSettings className="w-6 h-6" />
            <span>Configurações do Sistema</span>
          </h1>
          <p className="text-bella-600">
            Gerencie configurações, credenciais e testes do sistema
          </p>
        </div>
      </div>

      {/* Informações do Sistema */}
      <div className="bella-card">
        <h3 className="text-lg font-semibold text-bella-800 mb-4 flex items-center space-x-2">
          <FiInfo className="w-5 h-5" />
          <span>Informações do Sistema</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(informacoesSistema).map(([key, value]) => (
            <div
              key={key}
              className="p-3 bg-bella-50 rounded-lg border border-bella-200"
            >
              <div className="text-sm font-medium text-bella-700 capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </div>
              <div className="text-bella-900 font-semibold">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Credenciais de Acesso */}
      <div className="bella-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-bella-800 flex items-center space-x-2">
            <FiKey className="w-5 h-5" />
            <span>Credenciais de Acesso</span>
          </h3>
          <button
            onClick={() => setShowCredentials(!showCredentials)}
            className="flex items-center space-x-2 px-3 py-2 text-sm border border-bella-300 text-bella-700 rounded-lg hover:bg-bella-50 transition-colors"
          >
            {showCredentials ? (
              <FiEyeOff className="w-4 h-4" />
            ) : (
              <FiEye className="w-4 h-4" />
            )}
            <span>{showCredentials ? "Ocultar" : "Mostrar"}</span>
          </button>
        </div>

        {showCredentials && (
          <div className="space-y-4">
            {/* Admin Credentials */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <FiShield className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-800">
                  Credenciais de Administrador
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Usuário
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 p-2 bg-white rounded border text-green-800 font-mono">
                      {credenciaisAdmin.usuario}
                    </code>
                    <button
                      onClick={() => copyToClipboard(credenciaisAdmin.usuario)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
                      title="Copiar"
                    >
                      <FiCopy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Senha
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 p-2 bg-white rounded border text-green-800 font-mono">
                      {credenciaisAdmin.senha}
                    </code>
                    <button
                      onClick={() => copyToClipboard(credenciaisAdmin.senha)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
                      title="Copiar"
                    >
                      <FiCopy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium text-green-700 mb-2">
                  Funcionalidades
                </label>
                <ul className="text-sm text-green-700 space-y-1">
                  {credenciaisAdmin.funcionalidades.map((func, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <FiCheck className="w-3 h-3 text-green-600" />
                      <span>{func}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Test Users */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FiUsers className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">
                    Usuários Cadastrados
                  </h4>
                </div>
                <button
                  onClick={loadUsuarios}
                  disabled={loadingUsers}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loadingUsers ? "Carregando..." : "Atualizar Lista"}
                </button>
              </div>
              {usuarios.length > 0 ? (
                <div className="space-y-2">
                  {usuarios.map((usuario: any) => (
                    <div
                      key={usuario.id}
                      className="flex items-center justify-between p-2 bg-white rounded border"
                    >
                      <div>
                        <span className="font-medium text-blue-800">
                          {usuario.nome}
                        </span>
                        <span className="text-sm text-blue-600 ml-2">
                          (@{usuario.username})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {usuario.is_admin && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                            Admin
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            usuario.ativo
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {usuario.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-blue-600">
                  Clique em "Atualizar Lista" para ver os usuários cadastrados
                </p>
              )}
            </div>

            {/* Warning */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <FiAlertTriangle className="w-5 h-5 text-amber-600" />
                <div>
                  <h4 className="font-semibold text-amber-800">
                    Importante - Segurança
                  </h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Estas credenciais são para teste e desenvolvimento. Em
                    produção, altere as senhas padrão e remova esta seção ou
                    proteja adequadamente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Testes do Sistema */}
      <div className="bella-card">
        <h3 className="text-lg font-semibold text-bella-800 mb-4 flex items-center space-x-2">
          <FiDatabase className="w-5 h-5" />
          <span>Testes do Sistema</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setShowDatabaseTest(true)}
            className="p-4 border border-bella-300 rounded-lg hover:bg-bella-50 transition-colors text-left"
          >
            <div className="flex items-center space-x-3 mb-2">
              <FiDatabase className="w-5 h-5 text-bella-600" />
              <h4 className="font-medium text-bella-800">
                Teste de Conexão Rápido
              </h4>
            </div>
            <p className="text-sm text-bella-600">
              Verifica conexão básica com o banco de dados Neon
            </p>
          </button>

          <button
            onClick={() => setShowDatabaseVerification(true)}
            className="p-4 border border-bella-300 rounded-lg hover:bg-bella-50 transition-colors text-left"
          >
            <div className="flex items-center space-x-3 mb-2">
              <FiCheck className="w-5 h-5 text-bella-600" />
              <h4 className="font-medium text-bella-800">
                Verificação Completa
              </h4>
            </div>
            <p className="text-sm text-bella-600">
              Verifica estrutura completa, tabelas e dados do sistema
            </p>
          </button>
        </div>
      </div>

      {/* Configurações de Deploy */}
      <div className="bella-card">
        <h3 className="text-lg font-semibold text-bella-800 mb-4">
          Configurações de Deploy
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-bella-50 rounded">
            <div>
              <span className="font-medium text-bella-800">
                String de Conexão Neon
              </span>
              <p className="text-sm text-bella-600">
                Configurada via variável de ambiente VITE_DATABASE_URL
              </p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded">
              {import.meta.env.VITE_DATABASE_URL ? "Configurada" : "Pendente"}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-bella-50 rounded">
            <div>
              <span className="font-medium text-bella-800">Ambiente</span>
              <p className="text-sm text-bella-600">
                Ambiente atual de execução
              </p>
            </div>
            <span
              className={`px-3 py-1 text-sm rounded ${
                import.meta.env.MODE === "production"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {import.meta.env.MODE}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-bella-50 rounded">
            <div>
              <span className="font-medium text-bella-800">HTTPS</span>
              <p className="text-sm text-bella-600">
                Conexão segura habilitada
              </p>
            </div>
            <span
              className={`px-3 py-1 text-sm rounded ${
                window.location.protocol === "https:"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {window.location.protocol === "https:" ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bella-card">
        <h3 className="text-lg font-semibold text-bella-800 mb-4">
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => (window.location.href = "/usuarios")}
            className="bella-button flex items-center justify-center space-x-2"
          >
            <FiUsers className="w-4 h-4" />
            <span>Gerenciar Usuários</span>
          </button>

          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-bella-300 text-bella-700 rounded-lg hover:bg-bella-50 transition-colors flex items-center justify-center space-x-2"
          >
            <FiSettings className="w-4 h-4" />
            <span>Recarregar Sistema</span>
          </button>

          <button
            onClick={() =>
              window.open(
                "https://github.com/seu-usuario/bellas-salon-management",
                "_blank",
              )
            }
            className="px-4 py-2 border border-bella-300 text-bella-700 rounded-lg hover:bg-bella-50 transition-colors flex items-center justify-center space-x-2"
          >
            <FiInfo className="w-4 h-4" />
            <span>Documentação</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {showDatabaseTest && (
        <DatabaseConnectionTest onClose={() => setShowDatabaseTest(false)} />
      )}

      {showDatabaseVerification && (
        <DatabaseVerification
          onClose={() => setShowDatabaseVerification(false)}
        />
      )}
    </div>
  );
}
