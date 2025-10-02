/**
 * Sistema de cores offline-first para funcionários
 * Funciona 100% com localStorage, sem depender do banco
 */

import {
  CORES_FUNCIONARIO,
  generateColorFromId,
  getColorVariants,
  isLightColor,
} from "./funcionarioColorsService";
import {
  saveFuncionarioCorLocal,
  getFuncionarioCoresLocal,
  getFuncionarioCorLocal,
  clearFuncionarioCoresLocal,
} from "./funcionarioColorsLocalStorage";

/**
 * Busca todas as cores (100% offline)
 */
export function getAllCoresOffline(): Record<string, string> {
  try {
    const coresLocais = getFuncionarioCoresLocal();
    const cores: Record<string, string> = {};

    Object.values(coresLocais).forEach((cor) => {
      cores[cor.funcionario_id] = cor.cor_hex;
    });

    console.log(`💾 [Offline] ${Object.keys(cores).length} cores carregadas`);
    return cores;
  } catch (error) {
    console.error("Erro ao carregar cores offline:", error);
    return {};
  }
}

/**
 * Busca cor de um funcionário (100% offline)
 */
export function getCorOffline(funcionarioId: string): string {
  try {
    // Tentar buscar no localStorage
    const corLocal = getFuncionarioCorLocal(funcionarioId);
    if (corLocal) {
      return corLocal;
    }

    // Gerar cor baseada no ID
    return generateColorFromId(funcionarioId);
  } catch (error) {
    console.error("Erro ao buscar cor offline:", error);
    return generateColorFromId(funcionarioId);
  }
}

/**
 * Salva cor de um funcionário (100% offline)
 */
export function salvarCorOffline(
  funcionarioId: string,
  corHex: string,
  userId: string,
): { success: boolean; message: string } {
  try {
    const sucesso = saveFuncionarioCorLocal(funcionarioId, corHex);

    if (sucesso) {
      return {
        success: true,
        message: `Cor ${corHex} salva localmente! 🎨`,
      };
    } else {
      return {
        success: false,
        message: "Erro ao salvar cor no navegador",
      };
    }
  } catch (error) {
    console.error("Erro ao salvar cor offline:", error);
    return {
      success: false,
      message: "Erro inesperado ao salvar cor",
    };
  }
}

/**
 * Remove cor de um funcionário (100% offline)
 */
export function removerCorOffline(funcionarioId: string): boolean {
  try {
    const coresAtuais = getFuncionarioCoresLocal();
    delete coresAtuais[funcionarioId];

    localStorage.setItem(
      "funcionario_cores_local",
      JSON.stringify(coresAtuais),
    );
    console.log(`💾 [Offline] Cor removida para funcionário ${funcionarioId}`);
    return true;
  } catch (error) {
    console.error("Erro ao remover cor offline:", error);
    return false;
  }
}

/**
 * Limpa todas as cores (100% offline)
 */
export function limparTodasCoresOffline(): boolean {
  try {
    clearFuncionarioCoresLocal();
    console.log("💾 [Offline] Todas as cores foram removidas");
    return true;
  } catch (error) {
    console.error("Erro ao limpar cores offline:", error);
    return false;
  }
}

/**
 * Exporta cores para migração futura
 */
export function exportarCoresParaMigracao(): {
  cores: Record<string, string>;
  count: number;
  timestamp: string;
} {
  try {
    const cores = getAllCoresOffline();

    return {
      cores,
      count: Object.keys(cores).length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Erro ao exportar cores:", error);
    return {
      cores: {},
      count: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

// Re-exportar funções úteis
export {
  CORES_FUNCIONARIO,
  generateColorFromId,
  getColorVariants,
  isLightColor,
};
