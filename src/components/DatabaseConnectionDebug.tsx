import React, { useState } from "react";
import {
  FiDatabase,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiAlertTriangle,
} from "react-icons/fi";
import { testConnection } from "@/lib/neon";

export const DatabaseConnectionDebug: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);

    try {
      const testResult = await testConnection();
      setResult(testResult);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        details: error,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
          <FiDatabase className="w-5 h-5" />
          <span>Teste de Conexão</span>
        </h3>
        <button
          onClick={handleTest}
          disabled={testing}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          <FiRefreshCw className={`w-4 h-4 ${testing ? "animate-spin" : ""}`} />
          <span>{testing ? "Testando..." : "Testar"}</span>
        </button>
      </div>

      {result && (
        <div
          className={`p-4 rounded-lg ${result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
        >
          <div className="flex items-center space-x-2 mb-2">
            {result.success ? (
              <FiCheck className="w-5 h-5 text-green-600" />
            ) : (
              <FiX className="w-5 h-5 text-red-600" />
            )}
            <span
              className={`font-medium ${result.success ? "text-green-800" : "text-red-800"}`}
            >
              {result.success ? "Conexão bem-sucedida!" : "Falha na conexão"}
            </span>
          </div>

          {result.error && (
            <div className="text-red-700 text-sm mb-2">
              <strong>Erro:</strong> {result.error}
            </div>
          )}

          {result.details && (
            <div className="text-sm text-gray-600">
              <strong>Detalhes:</strong>
              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2 mb-1">
          <FiAlertTriangle className="w-4 h-4 text-yellow-500" />
          <span>Este teste verifica a conectividade com o banco de dados.</span>
        </div>
        <p className="text-xs">
          Se o teste falhar, verifique sua conexão com a internet e as
          configurações do banco.
        </p>
      </div>
    </div>
  );
};
