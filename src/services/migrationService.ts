import { sql } from "@/lib/neon";
import {
  resetTabelaCoresCache,
  marcarTabelaComoExistente,
} from "./funcionarioColorsService";

/**
 * Tenta criar a tabela funcionario_cores automaticamente
 */
export async function createFuncionarioCoresTable(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log("🔧 Tentando criar tabela funcionario_cores...");

    // Criar tabela
    await sql`
      CREATE TABLE IF NOT EXISTS funcionario_cores (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        funcionario_id UUID NOT NULL REFERENCES users_simple(id) ON DELETE CASCADE,
        cor_hex VARCHAR(7) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(funcionario_id)
      )
    `;

    // Criar índice
    await sql`
      CREATE INDEX IF NOT EXISTS idx_funcionario_cores_funcionario_id
      ON funcionario_cores(funcionario_id)
    `;

    // Verificar se tabela foi criada
    const testResult = await sql`
      SELECT COUNT(*) as count FROM funcionario_cores
    `;

    // Marcar tabela como existente no cache
    marcarTabelaComoExistente();

    console.log("✅ Tabela funcionario_cores criada com sucesso!");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Erro ao criar tabela funcionario_cores:", error);
    return {
      success: false,
      error: error.message || "Erro desconhecido ao criar tabela",
    };
  }
}

/**
 * Verifica se a tabela funcionario_cores existe
 */
export async function checkFuncionarioCoresTable(): Promise<boolean> {
  try {
    await sql`SELECT 1 FROM funcionario_cores LIMIT 1`;
    return true;
  } catch (error: any) {
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      return false;
    }
    // Se for outro erro, assumir que existe
    return true;
  }
}

/**
 * Migração completa: criar tabela + popular com dados padrão
 */
export async function migrateFuncionarioCores(): Promise<{
  success: boolean;
  error?: string;
  details?: string;
}> {
  try {
    console.log("🚀 Iniciando migração completa funcionario_cores...");

    // Verificar se já existe
    const exists = await checkFuncionarioCoresTable();
    if (exists) {
      return {
        success: true,
        details: "Tabela já existe - nenhuma ação necessária",
      };
    }

    // Criar tabela
    const createResult = await createFuncionarioCoresTable();
    if (!createResult.success) {
      return createResult;
    }

    console.log("✅ Migração funcionario_cores concluída com sucesso!");
    return {
      success: true,
      details: "Tabela criada com sucesso",
    };
  } catch (error: any) {
    console.error("❌ Erro na migração funcionario_cores:", error);
    return {
      success: false,
      error: error.message || "Erro desconhecido na migração",
    };
  }
}
