import React from "react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

interface AuthErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class AuthErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  AuthErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    console.error("AuthErrorBoundary caught error:", error);
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("AuthErrorBoundary error details:", {
      error,
      errorInfo,
      stack: error.stack,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-bella-100 via-white to-bella-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <FiAlertTriangle className="w-8 h-8 text-red-500" />
              </div>

              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Erro de Inicialização
              </h1>

              <p className="text-gray-600 mb-6">
                Houve um problema ao carregar o sistema de autenticação. Isso
                pode ser um problema temporário.
              </p>

              <div className="space-y-3">
                <button
                  onClick={this.handleReload}
                  className="w-full bg-gradient-to-r from-bella-500 to-bella-400 text-white font-medium py-3 px-4 rounded-lg hover:from-bella-600 hover:to-bella-500 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  <span>Recarregar Página</span>
                </button>
              </div>

              {this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                    Detalhes técnicos
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                    {this.state.error.message}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;
