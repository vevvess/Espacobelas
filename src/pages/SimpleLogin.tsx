import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/SimpleAuthContext";
import { DatabaseConnectionFallback } from "../components/DatabaseConnectionFallback";
import {
  FiUser,
  FiLock,
  FiEye,
  FiEyeOff,
  FiLogIn,
  FiHeart,
  FiSettings,
} from "react-icons/fi";

export default function SimpleLogin() {
  const navigate = useNavigate();
  const { user, signIn, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatabaseConfig, setShowDatabaseConfig] = useState(false);

  // Limpar localStorage antigo ao carregar a página
  useEffect(() => {
    const clearOldData = () => {
      const keysToRemove = [
        "clientes",
        "servicos",
        "agendamentos",
        "transacoes",
      ];
      keysToRemove.forEach((key) => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`Removido dados antigos: ${key}`);
        }
      });
    };

    clearOldData();
  }, []);

  // Redirecionar se já estiver logado baseado no role
  if (user && !loading) {
    const redirectTo = user.is_admin ? "/dashboard" : "/agenda";
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      const loggedUser = await signIn(
        formData.username.trim(),
        formData.password,
      );
      console.log("Login realizado com sucesso, redirecionando...");

      // Usar o usuário retornado ou tentar novamente do contexto
      const userToCheck = loggedUser || user;
      if (userToCheck) {
        const redirectTo = userToCheck.is_admin ? "/dashboard" : "/agenda";
        console.log(
          "Redirecionando para:",
          redirectTo,
          "usuário:",
          userToCheck,
        );
        navigate(redirectTo, { replace: true });
      } else {
        // Se não conseguiu obter o usuário, forçar recarga da página
        console.log("Usuário não obtido, redirecionando para root");
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Erro no login:", err);
      // O erro já é tratado no contexto
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bella-100 via-white to-bella-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-bella-500 to-bella-400 rounded-full mb-4">
            <FiHeart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-bella-800 mb-2">
            Espaço Bella's
          </h1>
          <p className="text-bella-600">Sistema de Gestão de Salão</p>
        </div>

        {/* Formulário de Login */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-bella-700 mb-2">
                Usuário
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bella-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent transition-colors"
                  placeholder="Digite seu usuário"
                  required
                  disabled={isLoading || loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-bella-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bella-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full pl-10 pr-10 py-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent transition-colors"
                  placeholder="Digite sua senha"
                  required
                  disabled={isLoading || loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-bella-400 hover:text-bella-600 transition-colors"
                  disabled={isLoading || loading}
                >
                  {showPassword ? (
                    <FiEyeOff className="w-5 h-5" />
                  ) : (
                    <FiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Exibir erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-red-400 mr-2" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                  {error.includes("incorretos") && (
                    <button
                      onClick={() => setShowDatabaseConfig(true)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                    >
                      Configurar Sistema
                    </button>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || loading}
              className="w-full bg-gradient-to-r from-bella-500 to-bella-400 text-white font-medium py-3 px-4 rounded-lg hover:from-bella-600 hover:to-bella-500 focus:outline-none focus:ring-2 focus:ring-bella-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading || loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <FiLogIn className="w-4 h-4" />
                  <span>Entrar</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-bella-500">
            © 2024 Espaço Bella's. Sistema integrado com Neon Database.
          </p>
          <p className="text-xs text-bella-400 mt-1">
            Credenciais de teste e configurações disponíveis no painel
            administrativo
          </p>

          {/* Botão de configuração do sistema (para debugging) */}
          <button
            onClick={() => setShowDatabaseConfig(true)}
            className="mt-2 text-xs text-bella-400 hover:text-bella-600 flex items-center justify-center space-x-1 mx-auto transition-colors"
          >
            <FiSettings className="w-3 h-3" />
            <span>Problemas de login? Configurar sistema</span>
          </button>
        </div>
      </div>

      {/* Modal de configuração do banco */}
      {showDatabaseConfig && (
        <DatabaseConnectionFallback
          onClose={() => setShowDatabaseConfig(false)}
        />
      )}
    </div>
  );
}
