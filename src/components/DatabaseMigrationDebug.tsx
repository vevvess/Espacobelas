import React, { useState } from "react";
import {
  FiDatabase,
  FiPlay,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiRefreshCw,
} from "react-icons/fi";
import {
  runMigrations,
  addFuncionarioIdColumn,
} from "@/services/databaseMigration";

export const DatabaseMigrationDebug: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRunMigrations = async () => {
    setRunning(true);
    setResult(null);

    try {
      console.log("Executando migrações...");
      await runMigrations();

      setResult({
        success: true,
        message: "Migrações executadas com sucesso!",
      });
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        details: error,
      });
    } finally {
      setRunning(false);
    }
  };

  const handleAddFuncionarioColumn = async () => {
    setRunning(true);
    setResult(null);

    try {
      console.log("Adicionando coluna funcionario_id...");
      const success = await addFuncionarioIdColumn();

      setResult({
        success,
        message: success
          ? "Coluna funcionario_id adicionada/verificada com sucesso!"
          : "Falha ao adicionar coluna funcionario_id",
      });
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        details: error,
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
          <FiDatabase className="w-5 h-5" />
          <span>Migração do Banco</span>
        </h3>
      </div>

      <div className="space-y-3 mb-4">
        <button
          onClick={handleAddFuncionarioColumn}
          disabled={running}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          <FiPlay className={`w-4 h-4 ${running ? "animate-pulse" : ""}`} />
          <span>
            {running ? "Executando..." : "Adicionar Coluna funcionario_id"}
          </span>
        </button>

        <button
          onClick={handleRunMigrations}
          disabled={running}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          <FiRefreshCw className={`w-4 h-4 ${running ? "animate-spin" : ""}`} />
          <span>
            {running ? "Executando..." : "Executar Todas as Migrações"}
          </span>
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
              {result.success ? "Sucesso!" : "Falha"}
            </span>
          </div>

          <p
            className={`text-sm ${result.success ? "text-green-700" : "text-red-700"}`}
          >
            {result.message}
          </p>

          {result.error && (
            <div className="text-red-700 text-sm mt-2">
              <strong>Erro:</strong> {result.error}
            </div>
          )}

          {result.details && (
            <div className="text-sm text-gray-600 mt-2">
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
          <span>Execute as migrações para corrigir problemas de schema.</span>
        </div>
        <p className="text-xs">
          Isso adicionará as colunas necessárias para o funcionamento correto do
          sistema de funcionários.
        </p>
      </div>
    </div>
  );
};
