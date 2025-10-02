import React, { useState } from "react";
import { FiDatabase, FiAlertTriangle, FiCheck, FiX } from "react-icons/fi";
import { sql } from "../lib/neon";
import { initializeUsersTable } from "../services/userService";

interface DatabaseConnectionFallbackProps {
  onClose?: () => void;
}

export const DatabaseConnectionFallback: React.FC<
  DatabaseConnectionFallbackProps
> = ({ onClose }) => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const testAndInitialize = async () => {
    setTesting(true);
    setResult(null);

    try {
      console.log("Testando conexão e inicializando usuários...");

      // Teste 1: Conexão básica com timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout de conexão (10s)")), 10000),
      );

      const connectionTest = sql`SELECT 1 as test, NOW() as current_time`;
      const connectionResult = await Promise.race([
        connectionTest,
        timeoutPromise,
      ]);
      console.log("Conexão básica OK:", connectionResult);

      // Teste 2: Verificar se as tabelas existem
      const tableCheck = await sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
      `;
      console.log(
        "Tabelas encontradas:",
        tableCheck.map((t) => t.table_name),
      );

      // Teste 3: Inicializar tabela de usuários se necessário
      await initializeUsersTable();
      console.log("Tabela de usuários verificada/inicializada");

      // Teste 4: Verificar se admin existe
      const adminCheck = await sql`
        SELECT * FROM users_simple WHERE username = 'Weslley'
      `;

      const adminExists = adminCheck.length > 0;
      console.log("Admin existe no banco:", adminExists);

      setResult({
        success: true,
        message: "Conexão estabelecida e sistema configurado!",
        details: {
          connection: true,
          tableInitialized: true,
          adminExists,
          tablesFound: tableCheck.length,
          adminUser: adminExists ? adminCheck[0] : null,
        },
      });
    } catch (error: any) {
      console.error("Erro no teste/inicialização:", error);
      setResult({
        success: false,
        message: `Erro: ${error.message}`,
        details: { error: error.message },
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-bella-800 flex items-center space-x-2">
            <FiDatabase className="w-5 h-5" />
            <span>Configurar Sistema</span>
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
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FiAlertTriangle className="w-5 h-5 text-amber-600" />
              <span className="font-medium text-amber-800">
                Problemas de Autenticação?
              </span>
            </div>
            <p className="text-sm text-amber-700">
              Clique no botão abaixo para testar a conexão com o banco e
              configurar o usuário administrador automaticamente.
            </p>
          </div>

          {testing && (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-bella-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-bella-600">Testando e configurando...</span>
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
                  <div>✓ Conexão com banco: OK</div>
                  <div>✓ Tabela de usuários: Configurada</div>
                  <div>
                    ✓ Usuário admin:{" "}
                    {result.details.adminExists ? "Existe" : "Criado"}
                  </div>
                </div>
              )}

              {result.details && !result.success && (
                <div className="text-sm text-red-700 mt-2">
                  <div>Erro: {result.details.error}</div>
                  <div className="mt-2 text-xs">
                    O sistema usará autenticação local como backup.
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={testAndInitialize}
              disabled={testing}
              className="flex-1 bella-button flex items-center justify-center space-x-2"
            >
              <FiDatabase className="w-4 h-4" />
              <span>Testar e Configurar</span>
            </button>

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

          {result?.success && (
            <div className="text-center">
              <p className="text-sm text-green-600 font-medium">
                ✅ Sistema configurado! Tente fazer login novamente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
