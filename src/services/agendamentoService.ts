import { sql } from "@/lib/neon";
import { toLocalISOString } from "@/lib/dateUtils";

// Função para adicionar timestamps
function addTimestamps(data: any, isUpdate = false): any {
  const now = new Date().toISOString();

  if (isUpdate) {
    return {
      ...data,
      updated_at: now,
    };
  } else {
    return {
      ...data,
      created_at: now,
      updated_at: now,
    };
  }
}

// Tipos básicos para compatibilidade
interface Agendamento {
  id: string;
  user_simple_id: string;
  cliente_id: string;
  servico_id: string;
  funcionario_id?: string;
  data_hora: Date;
  status: string;
  observacoes?: string;
  valor?: number;
  created_at: Date;
  updated_at: Date;
}

interface AgendamentoServico {
  id: string;
  agendamento_id: string;
  servico_id: string;
  funcionario_id?: string;
  preco: number;
  created_at: Date;
}

interface AgendamentoPagamento {
  id: string;
  agendamento_id: string;
  forma_pagamento: string;
  valor: number;
  observacoes?: string;
  created_at: Date;
}

// ========== AGENDAMENTO SERVICES EXPANDIDOS ==========

export async function getAgendamentos(
  userId: string,
  dataInicio?: Date,
  dataFim?: Date,
): Promise<Agendamento[]> {
  let agendamentos;

  // Primeiro, verificar se o usuário é admin ou staff
  const userInfo = await sql`
    SELECT id, username, is_admin FROM users_simple WHERE id = ${userId}
  `;

  const isAdmin = userInfo[0]?.is_admin || false;
  console.log("getAgendamentos - usuário:", userInfo[0], "isAdmin:", isAdmin);

  if (isAdmin) {
    // ADMIN: Ver todos os agendamentos
    if (dataInicio && dataFim) {
      agendamentos = await sql`
        SELECT a.*, c.nome as cliente_nome, c.telefone as cliente_telefone, c.tipo_cliente,
               u.nome as criado_por_nome, u.username as criado_por_username
        FROM agendamentos a
        JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN users_simple u ON a.user_simple_id = u.id
        WHERE a.data_hora BETWEEN ${dataInicio.toISOString()} AND ${dataFim.toISOString()}
        ORDER BY a.data_hora
      `;
    } else {
      agendamentos = await sql`
        SELECT a.*, c.nome as cliente_nome, c.telefone as cliente_telefone, c.tipo_cliente,
               u.nome as criado_por_nome, u.username as criado_por_username
        FROM agendamentos a
        JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN users_simple u ON a.user_simple_id = u.id
        ORDER BY a.data_hora
      `;
    }
  } else {
    // STAFF: Ver apenas agendamentos criados por ele
    // Usando apenas o schema atual (sem agendamento_servicos)
    if (dataInicio && dataFim) {
      agendamentos = await sql`
        SELECT a.*, c.nome as cliente_nome, c.telefone as cliente_telefone, c.tipo_cliente,
               u.nome as criado_por_nome, u.username as criado_por_username
        FROM agendamentos a
        JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN users_simple u ON a.user_simple_id = u.id
        WHERE a.user_simple_id = ${userId}
          AND a.data_hora BETWEEN ${dataInicio.toISOString()} AND ${dataFim.toISOString()}
        ORDER BY a.data_hora
      `;
    } else {
      agendamentos = await sql`
        SELECT a.*, c.nome as cliente_nome, c.telefone as cliente_telefone, c.tipo_cliente,
               u.nome as criado_por_nome, u.username as criado_por_username
        FROM agendamentos a
        JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN users_simple u ON a.user_simple_id = u.id
        WHERE a.user_simple_id = ${userId}
        ORDER BY a.data_hora
      `;
    }
  }

  // Buscar serviços e pagamentos para cada agendamento
  const agendamentosCompletos = await Promise.all(
    agendamentos.map(async (agendamento: any) => {
      const servicos = await getAgendamentoServicos(agendamento.id);
      const pagamentos = await getAgendamentoPagamentos(agendamento.id);

      return {
        id: agendamento.id,
        user_simple_id: agendamento.user_simple_id,
        cliente_id: agendamento.cliente_id,
        data_hora: new Date(agendamento.data_hora),
        status: agendamento.status,
        observacoes: agendamento.observacoes,
        valor_total: agendamento.valor_total,
        created_at: new Date(agendamento.created_at),
        updated_at: new Date(agendamento.updated_at),
        cliente: {
          nome: agendamento.cliente_nome,
          telefone: agendamento.cliente_telefone,
          tipo_cliente: agendamento.tipo_cliente,
        },
        servicos,
        pagamentos,
      };
    }),
  );

  return agendamentosCompletos;
}

export async function getAgendamentoServicos(
  agendamentoId: string,
): Promise<AgendamentoServico[]> {
  const result = await sql`
    SELECT ast.*, s.nome as servico_nome, s.duracao_minutos,
           u.nome as funcionario_nome, u.username as funcionario_username
    FROM agendamento_servicos ast
    JOIN servicos s ON ast.servico_id = s.id
    LEFT JOIN users_simple u ON ast.funcionario_id = u.id
    WHERE ast.agendamento_id = ${agendamentoId}
    ORDER BY ast.created_at
  `;

  return result.map((row: any) => ({
    id: row.id,
    agendamento_id: row.agendamento_id,
    servico_id: row.servico_id,
    funcionario_id: row.funcionario_id,
    preco: row.preco,
    created_at: new Date(row.created_at),
    servico: {
      nome: row.servico_nome,
      duracao_minutos: row.duracao_minutos,
    },
    funcionario: row.funcionario_id
      ? {
          id: row.funcionario_id,
          nome: row.funcionario_nome,
          username: row.funcionario_username,
        }
      : undefined,
  }));
}

export async function getAgendamentoPagamentos(
  agendamentoId: string,
): Promise<AgendamentoPagamento[]> {
  const result = await sql`
    SELECT * FROM agendamento_pagamentos
    WHERE agendamento_id = ${agendamentoId}
    ORDER BY created_at
  `;

  return result.map((row: any) => ({
    id: row.id,
    agendamento_id: row.agendamento_id,
    forma_pagamento: row.forma_pagamento,
    valor: row.valor,
    observacoes: row.observacoes,
    created_at: new Date(row.created_at),
  }));
}

export async function createAgendamentoCompleto(
  userId: string,
  agendamentoData: {
    cliente_id: string;
    data_hora: Date;
    status?: string;
    observacoes?: string;
    servicos: Array<{
      servico_id: string;
      funcionario_id?: string;
      preco: number;
    }>;
    pagamentos?: Array<{
      forma_pagamento: string;
      valor: number;
      observacoes?: string;
    }>;
  },
): Promise<Agendamento> {
  const valorTotal = agendamentoData.servicos.reduce(
    (sum, servico) => sum + servico.preco,
    0,
  );

  // Criar agendamento principal
  const data = addTimestamps({
    user_simple_id: userId,
    cliente_id: agendamentoData.cliente_id,
    data_hora: agendamentoData.data_hora.toISOString(),
    status: agendamentoData.status || "agendado",
    observacoes: agendamentoData.observacoes,
    valor_total: valorTotal,
  });

  const agendamentoResult = await sql`
    INSERT INTO agendamentos (user_simple_id, cliente_id, data_hora, status, observacoes, valor_total, created_at, updated_at)
    VALUES (${data.user_simple_id}, ${data.cliente_id}, ${data.data_hora}, ${data.status}, ${data.observacoes}, ${data.valor_total}, ${data.created_at}, ${data.updated_at})
    RETURNING *
  `;

  const agendamentoId = agendamentoResult[0].id;

  // Criar serviços do agendamento
  for (const servico of agendamentoData.servicos) {
    await sql`
      INSERT INTO agendamento_servicos (agendamento_id, servico_id, funcionario_id, preco)
      VALUES (${agendamentoId}, ${servico.servico_id}, ${servico.funcionario_id}, ${servico.preco})
    `;
  }

  // Criar pagamentos do agendamento (apenas se fornecidos)
  if (agendamentoData.pagamentos && agendamentoData.pagamentos.length > 0) {
    for (const pagamento of agendamentoData.pagamentos) {
      await sql`
        INSERT INTO agendamento_pagamentos (agendamento_id, forma_pagamento, valor, observacoes)
        VALUES (${agendamentoId}, ${pagamento.forma_pagamento}, ${pagamento.valor}, ${pagamento.observacoes})
      `;
    }
  }

  // Retornar agendamento completo
  const agendamentosCompletos = await getAgendamentos(userId);
  return (
    agendamentosCompletos.find((a) => a.id === agendamentoId) ||
    agendamentoResult[0]
  );
}

export async function updateAgendamentoCompleto(
  agendamentoId: string,
  userId: string,
  agendamentoData: {
    data_hora?: Date;
    status?: string;
    observacoes?: string;
    servicos?: Array<{
      id?: string; // Para edição
      servico_id: string;
      funcionario_id?: string;
      preco: number;
    }>;
    pagamentos?: Array<{
      id?: string; // Para edição
      forma_pagamento: string;
      valor: number;
      observacoes?: string;
    }>;
  },
): Promise<Agendamento> {
  // Atualizar agendamento principal
  const updates = addTimestamps(
    {
      data_hora: agendamentoData.data_hora?.toISOString(),
      status: agendamentoData.status,
      observacoes: agendamentoData.observacoes,
    },
    true,
  );

  if (agendamentoData.servicos) {
    const valorTotal = agendamentoData.servicos.reduce(
      (sum, servico) => sum + servico.preco,
      0,
    );
    updates.valor_total = valorTotal;
  }

  await sql`
    UPDATE agendamentos
    SET data_hora = COALESCE(${updates.data_hora}, data_hora),
        status = COALESCE(${updates.status}, status),
        observacoes = COALESCE(${updates.observacoes}, observacoes),
        valor_total = COALESCE(${updates.valor_total}, valor_total),
        updated_at = ${updates.updated_at}
    WHERE id = ${agendamentoId} AND user_simple_id = ${userId}
  `;

  // Atualizar serviços se fornecidos
  if (agendamentoData.servicos) {
    // Remover serviços existentes
    await sql`DELETE FROM agendamento_servicos WHERE agendamento_id = ${agendamentoId}`;

    // Adicionar novos serviços
    for (const servico of agendamentoData.servicos) {
      await sql`
        INSERT INTO agendamento_servicos (agendamento_id, servico_id, funcionario_id, preco)
        VALUES (${agendamentoId}, ${servico.servico_id}, ${servico.funcionario_id}, ${servico.preco})
      `;
    }
  }

  // Atualizar pagamentos se fornecidos
  if (agendamentoData.pagamentos) {
    // Remover pagamentos existentes
    await sql`DELETE FROM agendamento_pagamentos WHERE agendamento_id = ${agendamentoId}`;

    // Adicionar novos pagamentos
    for (const pagamento of agendamentoData.pagamentos) {
      await sql`
        INSERT INTO agendamento_pagamentos (agendamento_id, forma_pagamento, valor, observacoes)
        VALUES (${agendamentoId}, ${pagamento.forma_pagamento}, ${pagamento.valor}, ${pagamento.observacoes})
      `;
    }
  }

  // Retornar agendamento atualizado
  const agendamentosCompletos = await getAgendamentos(userId);
  return agendamentosCompletos.find((a) => a.id === agendamentoId)!;
}

export async function deleteAgendamento(
  agendamentoId: string,
  userId: string,
): Promise<boolean> {
  // As tabelas relacionadas são deletadas automaticamente devido ao CASCADE
  await sql`DELETE FROM agendamentos WHERE id = ${agendamentoId} AND user_simple_id = ${userId}`;
  return true;
}

// ========== FUNCIONÁRIOS SERVICES ==========

export async function getFuncionarios(userId: string) {
  const result = await sql`
    SELECT id, nome, username, is_admin
    FROM users_simple
    WHERE ativo = true
    ORDER BY nome
  `;

  return result.map((row: any) => ({
    id: row.id,
    nome: row.nome,
    username: row.username,
    is_admin: row.is_admin,
  }));
}

// ========== FORMAS DE PAGAMENTO ==========

export const FORMAS_PAGAMENTO = [
  { id: "dinheiro", nome: "Dinheiro", icon: "💵" },
  { id: "pix", nome: "PIX", icon: "📱" },
  { id: "cartao_debito", nome: "Cartão de Débito", icon: "💳" },
  { id: "cartao_credito", nome: "Cartão de Crédito", icon: "💳" },
  { id: "conta_corrente", nome: "Deixar na Conta", icon: "📋" },
  { id: "debito_mensal", nome: "Débito Mensal", icon: "📅", mensal: true },
] as const;
