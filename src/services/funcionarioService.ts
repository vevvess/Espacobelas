import { sql } from "@/lib/neon";

/**
 * Sistema simplificado: usuários = funcionários
 * Usa a tabela users_simple existente como base para funcionários
 */

// Cache para funcionários
const funcionarioCache = new Map<
  string,
  { data: Funcionario | null; timestamp: number }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Cache para todos os funcionários
let allFuncionariosCache: { data: Funcionario[]; timestamp: number } | null =
  null;

export interface Funcionario {
  id: string;
  nome: string;
  username: string;
  is_admin: boolean;
  ativo: boolean;
}

/**
 * Busca todos os usuários ativos para usar como funcionários
 */
export async function getFuncionarios(): Promise<Funcionario[]> {
  // Verificar cache
  const now = Date.now();
  if (
    allFuncionariosCache &&
    now - allFuncionariosCache.timestamp < CACHE_DURATION
  ) {
    return allFuncionariosCache.data;
  }

  try {
    const result = await sql`
      SELECT id, nome, username, is_admin, ativo
      FROM users_simple
      WHERE ativo = true
      ORDER BY nome ASC
    `;

    const funcionarios = result.map((row: any) => ({
      id: row.id,
      nome: row.nome,
      username: row.username,
      is_admin: row.is_admin,
      ativo: row.ativo,
    }));

    // Atualizar cache
    allFuncionariosCache = { data: funcionarios, timestamp: now };

    // Também popular o cache individual
    funcionarios.forEach((funcionario) => {
      funcionarioCache.set(funcionario.id, {
        data: funcionario,
        timestamp: now,
      });
    });

    return funcionarios;
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error);

    // Em caso de erro, retornar dados do cache se disponíveis
    if (allFuncionariosCache) {
      console.log("Usando cache de funcionários devido a erro");
      return allFuncionariosCache.data;
    }

    return [];
  }
}

/**
 * Busca um funcionário específico por ID
 */
export async function getFuncionarioById(
  funcionarioId: string,
): Promise<Funcionario | null> {
  if (!funcionarioId) return null;

  // Verificar cache individual primeiro
  const now = Date.now();
  const cached = funcionarioCache.get(funcionarioId);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Verificar se está no cache de todos os funcionários
  if (
    allFuncionariosCache &&
    now - allFuncionariosCache.timestamp < CACHE_DURATION
  ) {
    const funcionarioFromAll = allFuncionariosCache.data.find(
      (f) => f.id === funcionarioId,
    );
    if (funcionarioFromAll) {
      // Atualizar cache individual
      funcionarioCache.set(funcionarioId, {
        data: funcionarioFromAll,
        timestamp: now,
      });
      return funcionarioFromAll;
    }
  }

  try {
    const result = await sql`
      SELECT id, nome, username, is_admin, ativo
      FROM users_simple
      WHERE id = ${funcionarioId} AND ativo = true
    `;

    if (result.length === 0) {
      // Cache resultado null para evitar chamadas desnecessárias
      funcionarioCache.set(funcionarioId, { data: null, timestamp: now });
      return null;
    }

    const row = result[0];
    const funcionario = {
      id: row.id,
      nome: row.nome,
      username: row.username,
      is_admin: row.is_admin,
      ativo: row.ativo,
    };

    // Atualizar cache
    funcionarioCache.set(funcionarioId, { data: funcionario, timestamp: now });

    return funcionario;
  } catch (error) {
    console.error("Erro ao buscar funcionário:", funcionarioId, error?.message);

    // Em caso de erro, verificar se temos dados no cache (mesmo expirado)
    const cached = funcionarioCache.get(funcionarioId);
    if (cached) {
      console.log("Usando cache expirado para funcionário:", funcionarioId);
      return cached.data;
    }

    // Cache null para evitar tentativas repetidas por um tempo
    funcionarioCache.set(funcionarioId, { data: null, timestamp: now });
    return null;
  }
}

/**
 * Busca múltiplos funcionários de uma vez (mais eficiente que chamadas individuais)
 */
export async function getFuncionariosByIds(
  funcionarioIds: string[],
): Promise<Funcionario[]> {
  if (!funcionarioIds || funcionarioIds.length === 0) return [];

  const uniqueIds = [...new Set(funcionarioIds.filter(Boolean))];
  const now = Date.now();
  const results: Funcionario[] = [];
  const idsToFetch: string[] = [];

  // Verificar cache primeiro
  for (const id of uniqueIds) {
    const cached = funcionarioCache.get(id);
    if (cached && now - cached.timestamp < CACHE_DURATION && cached.data) {
      results.push(cached.data);
    } else {
      idsToFetch.push(id);
    }
  }

  // Buscar apenas os IDs que não estão no cache
  if (idsToFetch.length > 0) {
    try {
      const result = await sql`
        SELECT id, nome, username, is_admin, ativo
        FROM users_simple
        WHERE id = ANY(${idsToFetch}) AND ativo = true
      `;

      const funcionarios = result.map((row: any) => ({
        id: row.id,
        nome: row.nome,
        username: row.username,
        is_admin: row.is_admin,
        ativo: row.ativo,
      }));

      // Atualizar cache e adicionar aos resultados
      funcionarios.forEach((funcionario) => {
        funcionarioCache.set(funcionario.id, {
          data: funcionario,
          timestamp: now,
        });
        results.push(funcionario);
      });

      // Marcar IDs não encontrados como null no cache
      const foundIds = funcionarios.map((f) => f.id);
      idsToFetch.forEach((id) => {
        if (!foundIds.includes(id)) {
          funcionarioCache.set(id, { data: null, timestamp: now });
        }
      });
    } catch (error) {
      console.error("Erro ao buscar múltiplos funcionários:", error);

      // Em caso de erro, tentar usar cache expirado
      for (const id of idsToFetch) {
        const cached = funcionarioCache.get(id);
        if (cached && cached.data) {
          results.push(cached.data);
        }
      }
    }
  }

  return results;
}

/**
 * Salva o funcionário usando campo de observações com uma tag especial
 * Formato: observações normais + [FUNC:id_do_funcionario]
 */
export function addFuncionarioToObservacoes(
  observacoes: string = "",
  funcionarioId: string,
): string {
  // Remove qualquer tag de funcionário existente
  const observacoesSemFuncionario =
    removeFuncionarioFromObservacoes(observacoes);

  // Adiciona a nova tag de funcionário
  return `${observacoesSemFuncionario} [FUNC:${funcionarioId}]`;
}

/**
 * Remove funcionário das observações
 */
export function removeFuncionarioFromObservacoes(
  observacoes: string = "",
): string {
  return observacoes.replace(/\s*\[FUNC:[^\]]+\]/g, "").trim();
}

/**
 * Extrai o ID do funcionário das observações
 */
export function extractFuncionarioFromObservacoes(
  observacoes: string = "",
): string | null {
  const match = observacoes.match(/\[FUNC:([^\]]+)\]/);
  return match ? match[1] : null;
}

/**
 * Extrai dados dos serviços das observações (formato JSON)
 */
export function extractServicosFromObservacoes(
  observacoes: string = "",
): any[] {
  try {
    // Procurar por JSON que contém array de serviços
    const jsonMatch = observacoes.match(/\{[^}]*"servicos"[^}]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return data.servicos || [];
    }
    return [];
  } catch (error) {
    console.warn("Erro ao extrair serviços das observações:", error);
    return [];
  }
}

/**
 * Extrai as observações do usuário (sem tags de sistema)
 */
export function extractUserObservacoes(observacoes: string = ""): string {
  return observacoes
    .replace(/\s*\[FUNC:[^\]]+\]/g, "") // Remove tag de funcionário
    .replace(/\s*\{[^}]*"servicos"[^}]*\}/g, "") // Remove JSON de serviços
    .trim();
}
