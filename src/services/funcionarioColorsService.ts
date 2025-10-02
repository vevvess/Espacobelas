import { sql } from "@/lib/neon";
import {
  saveFuncionarioCorLocal,
  getFuncionarioCoresLocal,
  getFuncionarioCorLocal,
} from "./funcionarioColorsLocalStorage";

export interface FuncionarioColor {
  funcionario_id: string;
  cor_hex: string;
  created_at: Date;
  updated_at: Date;
}

// Lista de cores padrão para funcionários
export const CORES_FUNCIONARIO = [
  "#3B82F6", // blue-500
  "#EF4444", // red-500
  "#10B981", // emerald-500
  "#F59E0B", // amber-500
  "#8B5CF6", // violet-500
  "#EC4899", // pink-500
  "#06B6D4", // cyan-500
  "#84CC16", // lime-500
  "#F97316", // orange-500
  "#6366F1", // indigo-500
  "#14B8A6", // teal-500
  "#A855F7", // purple-500
  "#DC2626", // red-600
  "#059669", // emerald-600
  "#D97706", // amber-600
  "#7C3AED", // violet-600
];

/**
 * Busca a cor de um funcionário
 */
export async function getFuncionarioCor(
  funcionarioId: string,
): Promise<string> {
  try {
    // Verificar cache primeiro - evitar SQL desnecessário
    if (primeiraVerificacaoFeita && tabelaCoresExiste === false) {
      // Sabemos que tabela não existe - usar localStorage direto
      const corLocal = getFuncionarioCorLocal(funcionarioId);
      if (corLocal) {
        return corLocal;
      }
      return generateColorFromId(funcionarioId);
    }

    // Verificar se tabela existe (apenas se não soubermos ainda)
    const existe = await verificarTabelaCores();

    if (!existe) {
      // Tentar buscar no localStorage
      const corLocal = getFuncionarioCorLocal(funcionarioId);
      if (corLocal) {
        return corLocal;
      }
      return generateColorFromId(funcionarioId);
    }

    // Tabela existe - buscar do banco
    const result = await sql`
      SELECT cor_hex FROM funcionario_cores
      WHERE funcionario_id = ${funcionarioId}
    `;

    if (result.length > 0) {
      return result[0].cor_hex;
    }

    // Se não encontrou no banco, tentar localStorage
    const corLocal = getFuncionarioCorLocal(funcionarioId);
    if (corLocal) {
      return corLocal;
    }

    // Gerar cor baseada no ID
    return generateColorFromId(funcionarioId);
  } catch (error: any) {
    console.error("Erro ao buscar cor do funcionário:", error);

    // Fallback para localStorage
    try {
      const corLocal = getFuncionarioCorLocal(funcionarioId);
      if (corLocal) {
        return corLocal;
      }
    } catch (localError) {
      console.error("Erro no fallback localStorage:", localError);
    }

    // Último fallback
    return generateColorFromId(funcionarioId);
  }
}

/**
 * Salva a cor de um funcionário
 */
export async function setFuncionarioCor(
  funcionarioId: string,
  corHex: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar se o usuário é admin
    const userResult = await sql`
      SELECT is_admin FROM users_simple WHERE id = ${userId}
    `;

    if (!userResult[0]?.is_admin) {
      const errorMsg =
        "Apenas administradores podem alterar cores dos funcionários";
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Verificar cache primeiro - evitar SQL desnecessário
    if (primeiraVerificacaoFeita && tabelaCoresExiste === false) {
      // Sabemos que tabela não existe - usar localStorage direto
      const sucesso = saveFuncionarioCorLocal(funcionarioId, corHex);

      if (sucesso) {
        console.log(`💾 Cor ${corHex} salva localmente (cache)`);
        return {
          success: true,
          error:
            "Cor salva localmente. Execute a migração para persistir no banco.",
        };
      } else {
        return {
          success: false,
          error: "Erro ao salvar cor localmente",
        };
      }
    }

    // Verificar se tabela existe (apenas se não soubermos ainda)
    const existe = await verificarTabelaCores();

    if (!existe) {
      // Usar localStorage como fallback
      const sucesso = saveFuncionarioCorLocal(funcionarioId, corHex);

      if (sucesso) {
        console.log(`💾 Cor ${corHex} salva localmente`);
        return {
          success: true,
          error:
            "Cor salva localmente. Execute a migração para persistir no banco.",
        };
      } else {
        return {
          success: false,
          error: "Erro ao salvar cor localmente",
        };
      }
    }

    // Inserir ou atualizar cor do funcionário
    await sql`
      INSERT INTO funcionario_cores (funcionario_id, cor_hex, created_at, updated_at)
      VALUES (${funcionarioId}, ${corHex}, NOW(), NOW())
      ON CONFLICT (funcionario_id)
      DO UPDATE SET cor_hex = ${corHex}, updated_at = NOW()
    `;

    console.log(
      `✅ Cor ${corHex} definida para funcionário ${funcionarioId} por admin ${userId}`,
    );
    return { success: true };
  } catch (error: any) {
    const errorMsg = `Erro ao salvar cor: ${error.message || error}`;
    console.error("❌ Erro detalhado ao salvar cor do funcionário:", error);
    return { success: false, error: errorMsg };
  }
}

// Cache para verificar se tabela existe
let tabelaCoresExiste: boolean | null = null;
let primeiraVerificacaoFeita = false;

/**
 * Reseta o cache da verificação de tabela
 */
export function resetTabelaCoresCache(): void {
  tabelaCoresExiste = null;
  primeiraVerificacaoFeita = false;
  console.log("🔄 Cache da tabela funcionario_cores resetado");
}

/**
 * Força que a tabela seja marcada como existente (após migração)
 */
export function marcarTabelaComoExistente(): void {
  tabelaCoresExiste = true;
  primeiraVerificacaoFeita = true;
  console.log("✅ Tabela funcionario_cores marcada como existente");
}

/**
 * Verifica se a tabela existe (com cache robusto)
 */
async function verificarTabelaCores(): Promise<boolean> {
  // Se já sabemos que não existe, não tentar novamente
  if (primeiraVerificacaoFeita && tabelaCoresExiste === false) {
    return false;
  }

  // Se já sabemos que existe, retornar true
  if (tabelaCoresExiste === true) {
    return true;
  }

  // Primeira verificação - tentar apenas uma vez
  if (!primeiraVerificacaoFeita) {
    try {
      console.log("�� Verificando se tabela funcionario_cores existe...");
      await sql`SELECT 1 FROM funcionario_cores LIMIT 1`;
      tabelaCoresExiste = true;
      primeiraVerificacaoFeita = true;
      console.log("�� Tabela funcionario_cores encontrada");
      return true;
    } catch (error: any) {
      primeiraVerificacaoFeita = true;
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        tabelaCoresExiste = false;
        console.log("❌ Tabela funcionario_cores não existe - usando fallback");
        return false;
      }
      // Para outros erros, assumir que existe
      tabelaCoresExiste = true;
      console.log("⚠️ Erro na verificação, assumindo que tabela existe");
      return true;
    }
  }

  // Se chegou aqui, retornar o valor do cache
  return tabelaCoresExiste === true;
}

/**
 * Busca todas as cores dos funcionários
 */
export async function getAllFuncionariosCores(): Promise<
  Record<string, string>
> {
  try {
    // Verificar cache primeiro - evitar SQL desnecessário
    if (primeiraVerificacaoFeita && tabelaCoresExiste === false) {
      // Sabemos que tabela não existe - usar localStorage direto
      const coresLocais = getFuncionarioCoresLocal();
      const cores: Record<string, string> = {};

      Object.values(coresLocais).forEach((cor) => {
        cores[cor.funcionario_id] = cor.cor_hex;
      });

      console.log(
        `💾 Cores carregadas do localStorage (cache): ${Object.keys(cores).length}`,
      );
      return cores;
    }

    // Verificar se tabela existe (apenas se não soubermos ainda)
    const existe = await verificarTabelaCores();

    if (!existe) {
      // Usar localStorage como fallback
      const coresLocais = getFuncionarioCoresLocal();
      const cores: Record<string, string> = {};

      Object.values(coresLocais).forEach((cor) => {
        cores[cor.funcionario_id] = cor.cor_hex;
      });

      console.log(
        `💾 Cores carregadas do localStorage: ${Object.keys(cores).length}`,
      );
      return cores;
    }

    // Tabela existe - buscar do banco
    const result = await sql`
      SELECT funcionario_id, cor_hex
      FROM funcionario_cores
    `;

    const cores: Record<string, string> = {};
    result.forEach((row: any) => {
      cores[row.funcionario_id] = row.cor_hex;
    });

    console.log(
      `📊 Cores carregadas do banco de dados: ${Object.keys(cores).length}`,
    );
    return cores;
  } catch (error: any) {
    console.error("❌ Erro ao buscar cores:", error);

    // Fallback para localStorage em caso de erro
    try {
      const coresLocais = getFuncionarioCoresLocal();
      const cores: Record<string, string> = {};

      Object.values(coresLocais).forEach((cor) => {
        cores[cor.funcionario_id] = cor.cor_hex;
      });

      console.log(
        `💾 Fallback localStorage: ${Object.keys(cores).length} cores`,
      );
      return cores;
    } catch (localError) {
      console.error("❌ Erro no fallback localStorage:", localError);
      return {};
    }
  }
}

/**
 * Gera cor baseada no ID do funcionário
 */
export function generateColorFromId(funcionarioId: string): string {
  const hash = funcionarioId.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const index = Math.abs(hash) % CORES_FUNCIONARIO.length;
  return CORES_FUNCIONARIO[index];
}

/**
 * Converte cor hex para versões claras para backgrounds
 */
export function getColorVariants(hexColor: string) {
  return {
    primary: hexColor,
    light: hexColor + "20", // 20% opacity
    medium: hexColor + "40", // 40% opacity
    border: hexColor + "60", // 60% opacity
  };
}

/**
 * Determina se a cor é clara ou escura para escolher cor do texto
 */
export function isLightColor(hexColor: string): boolean {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calcular luminosidade
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}
