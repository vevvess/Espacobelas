import { sql } from "@/lib/neon";
import { extractFuncionarioFromObservacoes } from "./funcionarioService";

/**
 * Versão melhorada do getAgendamentos que considera funcionário atribuído
 */
function parseDBDateTimeToLocal(value: any): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  try {
    const s = String(value).replace(" ", "T");
    const m = s.match(
      /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/,
    );
    if (m) {
      const [_, yy, MM, dd, hh, mm, ss] = m;
      return new Date(
        Number(yy),
        Number(MM) - 1,
        Number(dd),
        Number(hh),
        Number(mm),
        ss ? Number(ss) : 0,
      );
    }
    // Fallback: se vier com Z/UTC, usar campos como local ignorando o Z
    if (s.endsWith("Z")) {
      const dt = new Date(s);
      return new Date(
        dt.getFullYear(),
        dt.getMonth(),
        dt.getDate(),
        dt.getHours(),
        dt.getMinutes(),
        dt.getSeconds(),
      );
    }
    return new Date(s);
  } catch {
    return new Date(value);
  }
}

export async function getAgendamentosWithFuncionario(
  userId: string,
  dataInicio?: Date,
  dataFim?: Date,
) {
  try {
    console.log("🔄 Buscando agendamentos...", { userId, dataInicio, dataFim });

    // Verificar se é admin
    let userResult;
    let isAdmin = false;

    try {
      userResult = await sql`
        SELECT is_admin FROM users_simple WHERE id = ${userId}
      `;
      isAdmin = userResult[0]?.is_admin || false;
    } catch (userError) {
      console.warn(
        "⚠️ Erro ao verificar admin, assumindo não-admin:",
        userError,
      );
      // Continuar como não-admin em caso de erro
    }

    let result;

    if (isAdmin) {
      // ADMIN: Ver todos os agendamentos
      if (dataInicio && dataFim) {
        result = await sql`
          SELECT a.*,
                 c.nome as cliente_nome, c.telefone as cliente_telefone, c.tipo_cliente,
                 s.nome as servico_nome, s.preco as servico_preco, s.duracao_minutos,
                 u.nome as criado_por_nome, u.username as criado_por_username
          FROM agendamentos a
          LEFT JOIN clientes c ON a.cliente_id = c.id
          LEFT JOIN servicos s ON a.servico_id = s.id
          LEFT JOIN users_simple u ON a.user_simple_id = u.id
          WHERE a.data_hora BETWEEN ${dataInicio.toISOString()} AND ${dataFim.toISOString()}
          ORDER BY a.data_hora
        `;
      } else {
        result = await sql`
          SELECT a.*,
                 c.nome as cliente_nome, c.telefone as cliente_telefone, c.tipo_cliente,
                 s.nome as servico_nome, s.preco as servico_preco, s.duracao_minutos,
                 u.nome as criado_por_nome, u.username as criado_por_username
          FROM agendamentos a
          LEFT JOIN clientes c ON a.cliente_id = c.id
          LEFT JOIN servicos s ON a.servico_id = s.id
          LEFT JOIN users_simple u ON a.user_simple_id = u.id
          ORDER BY a.data_hora
        `;
      }
    } else {
      // FUNCIONÁRIO: Ver agendamentos que criou + agendamentos onde foi atribuído
      if (dataInicio && dataFim) {
        result = await sql`
          SELECT a.*,
                 c.nome as cliente_nome, c.telefone as cliente_telefone, c.tipo_cliente,
                 s.nome as servico_nome, s.preco as servico_preco, s.duracao_minutos,
                 u.nome as criado_por_nome, u.username as criado_por_username
          FROM agendamentos a
          LEFT JOIN clientes c ON a.cliente_id = c.id
          LEFT JOIN servicos s ON a.servico_id = s.id
          LEFT JOIN users_simple u ON a.user_simple_id = u.id
          WHERE a.data_hora BETWEEN ${dataInicio.toISOString()} AND ${dataFim.toISOString()}
          ORDER BY a.data_hora
        `;
      } else {
        result = await sql`
          SELECT a.*,
                 c.nome as cliente_nome, c.telefone as cliente_telefone, c.tipo_cliente,
                 s.nome as servico_nome, s.preco as servico_preco, s.duracao_minutos,
                 u.nome as criado_por_nome, u.username as criado_por_username
          FROM agendamentos a
          LEFT JOIN clientes c ON a.cliente_id = c.id
          LEFT JOIN servicos s ON a.servico_id = s.id
          LEFT JOIN users_simple u ON a.user_simple_id = u.id
          ORDER BY a.data_hora
        `;
      }
    }

    // Processar agendamentos e filtrar para funcionários
    const agendamentosProcessados = result.map((row: any) => {
      const funcionarioId = extractFuncionarioFromObservacoes(
        row.observacoes || "",
      );

      return {
        id: row.id,
        user_simple_id: row.user_simple_id,
        cliente_id: row.cliente_id,
        servico_id: row.servico_id,
        funcionario_id: funcionarioId,
        data_hora: parseDBDateTimeToLocal(row.data_hora),
        status: row.status,
        observacoes: row.observacoes,
        valor: row.valor,
        created_at: parseDBDateTimeToLocal(row.created_at),
        updated_at: parseDBDateTimeToLocal(row.updated_at),
        cliente: {
          nome: row.cliente_nome,
          telefone: row.cliente_telefone,
          tipo_cliente: row.tipo_cliente,
        },
        servico: {
          nome: row.servico_nome,
          preco: row.servico_preco,
          duracao_minutos: row.duracao_minutos,
        },
        funcionario: null, // Será preenchido depois
      };
    });

    // Se for funcionário, filtrar apenas agendamentos relevantes
    if (!isAdmin) {
      const filtrados = agendamentosProcessados.filter((agendamento) => {
        const foiCriadoPorEle = agendamento.user_simple_id === userId;
        const foiAtribuidoAEle = agendamento.funcionario_id === userId;
        return foiCriadoPorEle || foiAtribuidoAEle;
      });

      console.log(
        `✅ Retornando ${filtrados.length} agendamentos filtrados para funcionário`,
      );
      return filtrados;
    }

    console.log(
      `✅ Retornando ${agendamentosProcessados.length} agendamentos para admin`,
    );
    return agendamentosProcessados;
  } catch (error) {
    console.error("❌ Erro ao buscar agendamentos (Neon):", error);
    throw error;
  }
}
