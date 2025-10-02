import React, { useState, useEffect } from "react";
import { FiDatabase, FiCheck, FiX, FiLoader } from "react-icons/fi";
import { sql } from "../lib/neon";

interface ConnectionTestProps {
  onClose?: () => void;
}

export const DatabaseConnectionTest: React.FC<ConnectionTestProps> = ({
  onClose,
}) => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);

    try {
      console.log("Testando conexão com o banco Neon...");

      // Teste 1: Conexão básica
      const basicTest = await sql`SELECT 1 as test`;
      console.log("Teste básico:", basicTest);

      // Teste 2: Verificar se a tabela users_simple existe
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users_simple'
        ) as table_exists;
      `;
      console.log("Verificação da tabela:", tableCheck);

      // Teste 3: Contar usuários existentes
      let userCount = 0;
      if (tableCheck[0]?.table_exists) {
        const countResult =
          await sql`SELECT COUNT(*) as count FROM users_simple`;
        userCount = parseInt(countResult[0]?.count || "0");
      }

      setResult({
        success: true,
        message: "Conexão com o banco Neon estabelecida com sucesso!",
        details: {
          basicConnection: true,
          tableExists: tableCheck[0]?.table_exists,
          userCount,
        },
      });
    } catch (error: any) {
      console.error("Erro ao testar conexão:", error);
      setResult({
        success: false,
        message: `Erro na conexão: ${error.message}`,
        details: { error: error.message },
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-bella-800 flex items-center space-x-2">
            <FiDatabase className="w-5 h-5" />
            <span>Teste de Conexão</span>
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-bella-600 hover:bg-bella-100 rounded-lg"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          {testing && (
            <div className="flex items-center justify-center py-8">
              <FiLoader className="w-8 h-8 text-bella-400 animate-spin" />
              <span className="ml-2 text-bella-600">
                Testando conexão com o banco...
              </span>
            </div>
          )}

          {result && (
            <div
              className={`p-4 rounded-lg ${
                result.success
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {result.success ? (
                  <FiCheck className="w-5 h-5 text-green-600" />
                ) : (
                  <FiX className="w-5 h-5 text-red-600" />
                )}
                <span
                  className={`font-medium ${
                    result.success ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {result.message}
                </span>
              </div>

              {result.details && result.success && (
                <div className="text-sm text-green-700 space-y-1">
                  <div>✓ Conexão básica: OK</div>
                  <div>
                    ✓ Tabela users_simple:{" "}
                    {result.details.tableExists ? "Existe" : "Não encontrada"}
                  </div>
                  <div>✓ Usuários cadastrados: {result.details.userCount}</div>
                </div>
              )}

              {result.details && !result.success && (
                <div className="text-sm text-red-700 mt-2">
                  <div>Erro: {result.details.error}</div>
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-3">
            {!testing && (
              <button
                onClick={testConnection}
                className="flex-1 bella-button flex items-center justify-center space-x-2"
              >
                <FiDatabase className="w-4 h-4" />
                <span>Testar Novamente</span>
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-bella-300 text-bella-700 rounded-lg hover:bg-bella-50 transition-colors"
                disabled={testing}
              >
                Fechar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
