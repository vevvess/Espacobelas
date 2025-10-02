import React, { useState } from "react";
import {
  FiDatabase,
  FiCheck,
  FiX,
  FiLoader,
  FiAlertTriangle,
} from "react-icons/fi";
import { sql } from "../lib/neon";

interface DatabaseVerificationProps {
  onClose?: () => void;
}

interface TableInfo {
  name: string;
  exists: boolean;
  required: boolean;
  description: string;
}

export const DatabaseVerification: React.FC<DatabaseVerificationProps> = ({
  onClose,
}) => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    connection: boolean;
    tables: TableInfo[];
    userCount: number;
    clientCount: number;
    serviceCount: number;
    appointmentCount: number;
    error?: string;
  } | null>(null);

  const requiredTables = [
    {
      name: "users_simple",
      required: true,
      description: "Tabela de usuários (autenticação)",
    },
    {
      name: "clientes",
      required: true,
      description: "Cadastro de clientes",
    },
    {
      name: "servicos",
      required: true,
      description: "Catálogo de serviços",
    },
    {
      name: "agendamentos",
      required: true,
      description: "Agendamentos principais",
    },
    {
      name: "agendamento_servicos",
      required: false,
      description: "Serviços por agendamento (sistema avançado)",
    },
    {
      name: "agendamento_pagamentos",
      required: false,
      description: "Pagamentos por agendamento (sistema avançado)",
    },
    {
      name: "transacoes",
      required: false,
      description: "Controle financeiro",
    },
  ];

  const verifyDatabase = async () => {
    setTesting(true);
    setResults(null);

    try {
      console.log("Verificando base de dados completa...");

      // Teste 1: Conexão básica
      await sql`SELECT 1 as test`;

      // Teste 2: Verificar existência de todas as tabelas
      const tableChecks = await Promise.all(
        requiredTables.map(async (table) => {
          try {
            const result = await sql`
              SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = ${table.name}
              ) as exists;
            `;
            return {
              ...table,
              exists: result[0]?.exists || false,
            };
          } catch (error) {
            return {
              ...table,
              exists: false,
            };
          }
        }),
      );

      // Teste 3: Contar registros nas tabelas principais
      let userCount = 0;
      let clientCount = 0;
      let serviceCount = 0;
      let appointmentCount = 0;

      try {
        if (tableChecks.find((t) => t.name === "users_simple")?.exists) {
          const userResult =
            await sql`SELECT COUNT(*) as count FROM users_simple`;
          userCount = parseInt(userResult[0]?.count || "0");
        }

        if (tableChecks.find((t) => t.name === "clientes")?.exists) {
          const clientResult =
            await sql`SELECT COUNT(*) as count FROM clientes`;
          clientCount = parseInt(clientResult[0]?.count || "0");
        }

        if (tableChecks.find((t) => t.name === "servicos")?.exists) {
          const serviceResult =
            await sql`SELECT COUNT(*) as count FROM servicos WHERE ativo = true`;
          serviceCount = parseInt(serviceResult[0]?.count || "0");
        }

        if (tableChecks.find((t) => t.name === "agendamentos")?.exists) {
          const appointmentResult =
            await sql`SELECT COUNT(*) as count FROM agendamentos`;
          appointmentCount = parseInt(appointmentResult[0]?.count || "0");
        }
      } catch (countError) {
        console.warn("Erro ao contar registros:", countError);
      }

      setResults({
        connection: true,
        tables: tableChecks,
        userCount,
        clientCount,
        serviceCount,
        appointmentCount,
      });
    } catch (error: any) {
      console.error("Erro na verificação:", error);
      setResults({
        connection: false,
        tables: [],
        userCount: 0,
        clientCount: 0,
        serviceCount: 0,
        appointmentCount: 0,
        error: error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  const createMissingTables = async () => {
    if (!results) return;

    setTesting(true);
    try {
      const missingTables = results.tables.filter(
        (table) => table.required && !table.exists,
      );

      for (const table of missingTables) {
        if (table.name === "users_simple") {
          await sql`
            CREATE TABLE IF NOT EXISTS users_simple (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              username VARCHAR(50) UNIQUE NOT NULL,
              password_hash VARCHAR(255) NOT NULL,
              nome VARCHAR(255) NOT NULL,
              is_admin BOOLEAN DEFAULT FALSE,
              ativo BOOLEAN DEFAULT TRUE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              created_by UUID REFERENCES users_simple(id)
            )
          `;
        }

        if (table.name === "clientes") {
          await sql`
            CREATE TABLE IF NOT EXISTS clientes (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_simple_id UUID REFERENCES users_simple(id) ON DELETE CASCADE,
              nome VARCHAR(255) NOT NULL,
              telefone VARCHAR(20),
              email VARCHAR(255),
              data_nascimento DATE,
              endereco TEXT,
              observacoes TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `;
        }

        if (table.name === "servicos") {
          await sql`
            CREATE TABLE IF NOT EXISTS servicos (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_simple_id UUID REFERENCES users_simple(id) ON DELETE CASCADE,
              nome VARCHAR(255) NOT NULL,
              descricao TEXT,
              preco DECIMAL(10,2) NOT NULL,
              duracao_minutos INTEGER DEFAULT 60,
              ativo BOOLEAN DEFAULT TRUE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `;
        }

        if (table.name === "agendamentos") {
          await sql`
            CREATE TABLE IF NOT EXISTS agendamentos (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_simple_id UUID REFERENCES users_simple(id) ON DELETE CASCADE,
              cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
              data_hora TIMESTAMP NOT NULL,
              status VARCHAR(50) DEFAULT 'agendado',
              observacoes TEXT,
              valor_total DECIMAL(10,2),
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `;
        }
      }

      // Verificar novamente
      await verifyDatabase();
    } catch (error: any) {
      console.error("Erro ao criar tabelas:", error);
      setResults((prev) => (prev ? { ...prev, error: error.message } : null));
    } finally {
      setTesting(false);
    }
  };

  React.useEffect(() => {
    verifyDatabase();
  }, []);

  const missingRequiredTables =
    results?.tables.filter((table) => table.required && !table.exists).length ||
    0;

  const allRequiredTablesExist = missingRequiredTables === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-bella-800 flex items-center space-x-2">
            <FiDatabase className="w-5 h-5" />
            <span>Verificação Completa do Banco</span>
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

        <div className="space-y-6">
          {testing && (
            <div className="flex items-center justify-center py-8">
              <FiLoader className="w-8 h-8 text-bella-400 animate-spin" />
              <span className="ml-2 text-bella-600">
                Verificando estrutura do banco...
              </span>
            </div>
          )}

          {results && (
            <>
              {/* Status de Conexão */}
              <div
                className={`p-4 rounded-lg ${
                  results.connection
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {results.connection ? (
                    <FiCheck className="w-5 h-5 text-green-600" />
                  ) : (
                    <FiX className="w-5 h-5 text-red-600" />
                  )}
                  <span
                    className={`font-medium ${
                      results.connection ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {results.connection
                      ? "Conexão com Neon estabelecida"
                      : "Falha na conexão"}
                  </span>
                </div>
                {results.error && (
                  <p className="text-sm text-red-700">Erro: {results.error}</p>
                )}
              </div>

              {/* Status das Tabelas */}
              <div>
                <h3 className="text-lg font-semibold text-bella-800 mb-4">
                  Estrutura das Tabelas
                </h3>

                {!allRequiredTablesExist && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiAlertTriangle className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">
                        {missingRequiredTables} tabela(s) obrigatória(s) em
                        falta
                      </span>
                    </div>
                    <button
                      onClick={createMissingTables}
                      disabled={testing}
                      className="bella-button text-sm"
                    >
                      Criar Tabelas Faltantes
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.tables.map((table) => (
                    <div
                      key={table.name}
                      className={`p-4 rounded-lg border ${
                        table.exists
                          ? "bg-green-50 border-green-200"
                          : table.required
                            ? "bg-red-50 border-red-200"
                            : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        {table.exists ? (
                          <FiCheck className="w-4 h-4 text-green-600" />
                        ) : (
                          <FiX className="w-4 h-4 text-red-600" />
                        )}
                        <span
                          className={`font-medium ${
                            table.exists
                              ? "text-green-800"
                              : table.required
                                ? "text-red-800"
                                : "text-gray-800"
                          }`}
                        >
                          {table.name}
                          {table.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${
                          table.exists
                            ? "text-green-700"
                            : table.required
                              ? "text-red-700"
                              : "text-gray-700"
                        }`}
                      >
                        {table.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estatísticas de Dados */}
              <div>
                <h3 className="text-lg font-semibold text-bella-800 mb-4">
                  Dados Armazenados
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-bella-50 p-4 rounded-lg border border-bella-200">
                    <div className="text-2xl font-bold text-bella-700">
                      {results.userCount}
                    </div>
                    <div className="text-sm text-bella-600">Usuários</div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-700">
                      {results.clientCount}
                    </div>
                    <div className="text-sm text-blue-600">Clientes</div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-700">
                      {results.serviceCount}
                    </div>
                    <div className="text-sm text-green-600">Serviços</div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-700">
                      {results.appointmentCount}
                    </div>
                    <div className="text-sm text-purple-600">Agendamentos</div>
                  </div>
                </div>
              </div>

              {/* Status Final */}
              <div
                className={`p-4 rounded-lg ${
                  allRequiredTablesExist && results.connection
                    ? "bg-green-50 border border-green-200"
                    : "bg-yellow-50 border border-yellow-200"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {allRequiredTablesExist && results.connection ? (
                    <>
                      <FiCheck className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">
                        ✅ Sistema integrado com banco Neon - Todos os dados são
                        persistidos
                      </span>
                    </>
                  ) : (
                    <>
                      <FiAlertTriangle className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">
                        ⚠️ Configuração incompleta - Algumas funcionalidades
                        podem não funcionar
                      </span>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Botões */}
          <div className="flex space-x-3">
            {!testing && (
              <button
                onClick={verifyDatabase}
                className="flex-1 bella-button flex items-center justify-center space-x-2"
              >
                <FiDatabase className="w-4 h-4" />
                <span>Verificar Novamente</span>
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
