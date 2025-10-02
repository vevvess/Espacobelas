/**
 * Sistema de fallback para cores de funcionários usando localStorage
 * Usado quando a tabela funcionario_cores não existe
 */

const STORAGE_KEY = "funcionario_cores_local";

export interface FuncionarioCorLocal {
  funcionario_id: string;
  cor_hex: string;
  created_at: string;
}

/**
 * Salva cores no localStorage como fallback
 */
export function saveFuncionarioCorLocal(
  funcionarioId: string,
  corHex: string,
): boolean {
  try {
    const cores = getFuncionarioCoresLocal();
    cores[funcionarioId] = {
      funcionario_id: funcionarioId,
      cor_hex: corHex,
      created_at: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(cores));
    console.log(
      `💾 Cor ${corHex} salva localmente para funcionário ${funcionarioId}`,
    );
    return true;
  } catch (error) {
    console.error("Erro ao salvar cor no localStorage:", error);
    return false;
  }
}

/**
 * Busca todas as cores do localStorage
 */
export function getFuncionarioCoresLocal(): Record<
  string,
  FuncionarioCorLocal
> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {};
    }

    const cores = JSON.parse(stored);
    console.log(
      `💾 ${Object.keys(cores).length} cores carregadas do localStorage`,
    );
    return cores;
  } catch (error) {
    console.error("Erro ao carregar cores do localStorage:", error);
    return {};
  }
}

/**
 * Busca cor específica do localStorage
 */
export function getFuncionarioCorLocal(funcionarioId: string): string | null {
  try {
    const cores = getFuncionarioCoresLocal();
    return cores[funcionarioId]?.cor_hex || null;
  } catch (error) {
    console.error("Erro ao buscar cor no localStorage:", error);
    return null;
  }
}

/**
 * Remove cor do localStorage
 */
export function removeFuncionarioCorLocal(funcionarioId: string): boolean {
  try {
    const cores = getFuncionarioCoresLocal();
    delete cores[funcionarioId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cores));
    console.log(`💾 Cor removida localmente para funcionário ${funcionarioId}`);
    return true;
  } catch (error) {
    console.error("Erro ao remover cor no localStorage:", error);
    return false;
  }
}

/**
 * Limpa todas as cores do localStorage
 */
export function clearFuncionarioCoresLocal(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("💾 Todas as cores locais foram removidas");
    return true;
  } catch (error) {
    console.error("Erro ao limpar cores no localStorage:", error);
    return false;
  }
}

/**
 * Migra cores do localStorage para o banco de dados
 */
export function getCoresParaMigracao(): Record<string, string> {
  try {
    const cores = getFuncionarioCoresLocal();
    const coresSimples: Record<string, string> = {};

    Object.values(cores).forEach((cor) => {
      coresSimples[cor.funcionario_id] = cor.cor_hex;
    });

    return coresSimples;
  } catch (error) {
    console.error("Erro ao preparar cores para migração:", error);
    return {};
  }
}
