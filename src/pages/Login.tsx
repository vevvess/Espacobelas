import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/SimpleAuthContext";
import { FiMail, FiLock, FiEye, FiEyeOff, FiHeart } from "react-icons/fi";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user, signIn, error, clearError } = useAuth();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      await signIn(email.trim(), password);
    } catch (error) {
      // Error is handled in the context
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bella-50 via-white to-bella-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-bella-500 to-bella-400 rounded-2xl mb-4 bella-shadow">
            <FiHeart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-bella-800 mb-2">
            Espaço Bella's
          </h1>
          <p className="text-bella-600">Sistema de Gestão do Salão</p>
        </div>

        {/* Demo Mode Notice */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6 animate-fade-in">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <div>
              <p className="text-green-800 font-medium text-sm">
                Modo Demonstração Ativo
              </p>
              <p className="text-green-600 text-xs">
                Sistema funcionando localmente sem Firebase (perfeito para
                testes!)
              </p>
            </div>
          </div>
        </div>
        {/* Login Form */}
        <div className="bella-card animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-bella-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bella-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent transition-all duration-200 bg-white"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-bella-700 mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bella-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent transition-all duration-200 bg-white"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-bella-400 hover:text-bella-600 transition-colors"
                >
                  {showPassword ? (
                    <FiEyeOff className="w-5 h-5" />
                  ) : (
                    <FiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-fade-in">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full bg-gradient-to-r from-bella-500 to-bella-400 text-white font-semibold py-3 px-4 rounded-lg hover:from-bella-600 hover:to-bella-500 focus:ring-2 focus:ring-bella-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bella-shadow"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Entrando...</span>
                </div>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-bella-100">
            <div className="text-center space-y-3">
              <p className="text-sm text-bella-600">
                Credenciais de demonstração disponíveis:
              </p>
              <div className="bg-bella-50 p-3 rounded-lg text-xs space-y-2">
                <div>
                  <p>
                    <strong>👑 Administrador:</strong>
                  </p>
                  <p>admin@espacobellas.com / 123456</p>
                </div>
                <div>
                  <p>
                    <strong>💅 Profissional:</strong>
                  </p>
                  <p>ana@espacobellas.com / 123456</p>
                </div>
                <div>
                  <p>
                    <strong>📋 Recepcionista:</strong>
                  </p>
                  <p>julia@espacobellas.com / 123456</p>
                </div>
              </div>
              <p className="text-sm text-bella-600">
                Problemas para acessar?{" "}
                <button className="text-bella-500 hover:text-bella-600 font-medium transition-colors">
                  Entre em contato
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-bella-500">
          <p>© 2024 Espaço Bella's. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
