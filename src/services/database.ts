import { sql } from "@/lib/neon";

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

// Tipos básicos
interface User {
  id: string;
  firebase_uid: string;
  email: string;
  name?: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

interface Cliente {
  id: string;
  user_id?: string;
  user_simple_id?: string;
  nome: string;
  telefone?: string;
  email?: string;
  data_nascimento?: Date;
  endereco?: string;
  observacoes?: string;
  tipo_cliente?: string;
  created_at: Date;
  updated_at: Date;
}

interface Servico {
  id: string;
  user_id?: string;
  user_simple_id?: string;
  nome: string;
  descricao?: string;
  preco: number;
  duracao_minutos?: number;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}

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

interface Transacao {
  id: string;
  user_simple_id: string;
  agendamento_id?: string;
  tipo: string;
  valor: number;
  descricao?: string;
  data_transacao: Date;
  created_at: Date;
}
import { toLocalISOString } from "@/lib/dateUtils";

// ========== USER SERVICES ==========

export async function createOrUpdateUser(userData: {
  firebase_uid: string;
  email: string;
  name?: string;
  role?: string;
}): Promise<User> {
  const data = addTimestamps({
    firebase_uid: userData.firebase_uid,
    email: userData.email,
    name: userData.name || null,
    role: userData.role || "user",
  });

  const result = await sql`
    INSERT INTO users (firebase_uid, email, name, role, created_at, updated_at)
    VALUES (${data.firebase_uid}, ${data.email}, ${data.name}, ${data.role}, ${data.created_at}, ${data.updated_at})
    ON CONFLICT (firebase_uid)
    DO UPDATE SET email = ${data.email}, name = ${data.name}, updated_at = ${data.updated_at}
    RETURNING *
  `;

  return result[0] as User;
}

export async function getUserByFirebaseUid(
  firebaseUid: string,
): Promise<User | null> {
  const result =
    await sql`SELECT * FROM users WHERE firebase_uid = ${firebaseUid}`;
  return (result[0] as User) || null;
}

// ========== CLIENTE SERVICES ==========

export async function getClientes(userId: string): Promise<Cliente[]> {
  // Verificar se é admin ou staff
  const userInfo = await sql`
    SELECT id, username, is_admin FROM users_simple WHERE id = ${userId}
  `;

  const isAdmin = userInfo[0]?.is_admin || false;

  if (isAdmin) {
    // ADMIN: Ver todos os clientes
    const result = await sql`
      SELECT c.*, u.nome as criado_por_nome, u.username as criado_por_username
      FROM clientes c
      LEFT JOIN users_simple u ON c.user_simple_id = u.id
      ORDER BY c.nome
    `;
    return result as Cliente[];
  } else {
    // STAFF: Ver todos os clientes (pois precisam agendar para qualquer cliente)
    // Mas não podem editar, apenas usar para agendamentos
    const result = await sql`
      SELECT c.*, u.nome as criado_por_nome, u.username as criado_por_username
      FROM clientes c
      LEFT JOIN users_simple u ON c.user_simple_id = u.id
      ORDER BY c.nome
    `;
    return result as Cliente[];
  }
}

export async function createCliente(
  userId: string,
  clienteData: Omit<
    Cliente,
    "id" | "user_id" | "user_simple_id" | "created_at" | "updated_at"
  > & { tipo_cliente?: "normal" | "mensal" },
): Promise<Cliente> {
  const data = addTimestamps({
    user_simple_id: userId,
    tipo_cliente: "normal", // default
    ...clienteData,
  });

  const result = await sql`
    INSERT INTO clientes (user_simple_id, nome, telefone, email, data_nascimento, endereco, observacoes, tipo_cliente, created_at, updated_at)
    VALUES (${data.user_simple_id}, ${data.nome}, ${data.telefone}, ${data.email}, ${data.data_nascimento}, ${data.endereco}, ${data.observacoes}, ${data.tipo_cliente}, ${data.created_at}, ${data.updated_at})
    RETURNING *
  `;

  return result[0] as Cliente;
}

export async function updateCliente(
  clienteId: string,
  userId: string,
  clienteData: Partial<
    Omit<
      Cliente,
      "id" | "user_id" | "user_simple_id" | "created_at" | "updated_at"
    >
  >,
): Promise<Cliente> {
  const data = addTimestamps(clienteData, true);

  const result = await sql`
    UPDATE clientes
    SET nome = COALESCE(${data.nome}, nome),
        telefone = COALESCE(${data.telefone}, telefone),
        email = COALESCE(${data.email}, email),
        data_nascimento = COALESCE(${data.data_nascimento}, data_nascimento),
        endereco = COALESCE(${data.endereco}, endereco),
        observacoes = COALESCE(${data.observacoes}, observacoes),
        tipo_cliente = COALESCE(${data.tipo_cliente}, tipo_cliente),
        updated_at = ${data.updated_at}
    WHERE id = ${clienteId} AND user_simple_id = ${userId}
    RETURNING *
  `;

  return result[0] as Cliente;
}

export async function deleteCliente(
  clienteId: string,
  userId: string,
): Promise<boolean> {
  await sql`DELETE FROM clientes WHERE id = ${clienteId} AND user_simple_id = ${userId}`;
  return true;
}

// ========== SERVICO SERVICES ==========

export async function getServicos(userId: string): Promise<Servico[]> {
  // Verificar se é admin ou staff
  const userInfo = await sql`
    SELECT id, username, is_admin FROM users_simple WHERE id = ${userId}
  `;

  const isAdmin = userInfo[0]?.is_admin || false;

  if (isAdmin) {
    // ADMIN: Ver todos os serviços
    const result = await sql`
      SELECT s.*, u.nome as criado_por_nome, u.username as criado_por_username
      FROM servicos s
      LEFT JOIN users_simple u ON s.user_simple_id = u.id
      WHERE s.ativo = true
      ORDER BY s.nome
    `;
    return result as Servico[];
  } else {
    // STAFF: Ver todos os serviços ativos (precisam acessar para criar agendamentos)
    // Mas não podem editar, apenas usar
    const result = await sql`
      SELECT s.*, u.nome as criado_por_nome, u.username as criado_por_username
      FROM servicos s
      LEFT JOIN users_simple u ON s.user_simple_id = u.id
      WHERE s.ativo = true
      ORDER BY s.nome
    `;
    return result as Servico[];
  }
}

export async function createServico(
  userId: string,
  servicoData: Omit<
    Servico,
    "id" | "user_id" | "user_simple_id" | "created_at" | "updated_at"
  >,
): Promise<Servico> {
  const data = addTimestamps({
    user_simple_id: userId,
    ativo: true,
    duracao_minutos: 60,
    ...servicoData,
  });

  const result = await sql`
    INSERT INTO servicos (user_simple_id, nome, descricao, preco, duracao_minutos, ativo, created_at, updated_at)
    VALUES (${data.user_simple_id}, ${data.nome}, ${data.descricao}, ${data.preco}, ${data.duracao_minutos}, ${data.ativo}, ${data.created_at}, ${data.updated_at})
    RETURNING *
  `;

  return result[0] as Servico;
}

// Função para corrigir serviços sem duração definida
export async function corrigirServicosSemDuracao(
  userId: string,
): Promise<number> {
  try {
    // Buscar serviços sem duração ou com duração 0/null
    const servicosSemDuracao = await sql`
      SELECT id, nome, duracao_minutos
      FROM servicos
      WHERE user_simple_id = ${userId}
      AND (duracao_minutos IS NULL OR duracao_minutos = 0)
      AND ativo = true
    `;

    if (servicosSemDuracao.length === 0) {
      console.log("✅ Todos os serviços têm duração definida");
      return 0;
    }

    console.log(
      `🔧 Corrigindo ${servicosSemDuracao.length} serviços sem duração...`,
    );

    // Função para estimar duração baseada no nome
    const estimarDuracao = (nome: string): number => {
      const nomeLC = nome.toLowerCase();
      if (nomeLC.includes("cutilação") || nomeLC.includes("cuticula")) {
        if (nomeLC.includes("pé") && nomeLC.includes("mão")) return 60;
        return 30;
      }
      if (nomeLC.includes("escova")) return 60;
      if (nomeLC.includes("corte")) return 30;
      if (nomeLC.includes("pintura") || nomeLC.includes("coloração"))
        return 120;
      if (nomeLC.includes("manicure") || nomeLC.includes("pedicure")) return 45;
      return 60; // Duração padrão
    };

    let corrigidos = 0;
    for (const servico of servicosSemDuracao) {
      const duracaoEstimada = estimarDuracao(servico.nome);

      await sql`
        UPDATE servicos
        SET duracao_minutos = ${duracaoEstimada}, updated_at = NOW()
        WHERE id = ${servico.id}
      `;

      console.log(
        `✅ Serviço "${servico.nome}" atualizado com duração: ${duracaoEstimada}min`,
      );
      corrigidos++;
    }

    return corrigidos;
  } catch (error) {
    console.error("❌ Erro ao corrigir serviços sem duração:", error);
    return 0;
  }
}

// Tornar função disponível globalmente para debug
if (typeof window !== "undefined") {
  (window as any).corrigirServicos = async (userId?: string) => {
    if (!userId) {
      console.log('❌ Uso: window.corrigirServicos("user_id")');
      return;
    }
    const corrigidos = await corrigirServicosSemDuracao(userId);
    console.log(`✅ ${corrigidos} serviços corrigidos`);
    return corrigidos;
  };
  console.log(
    '🔧 Debug: Use window.corrigirServicos("user_id") para corrigir serviços sem duraç��o',
  );
}

export async function updateServico(
  servicoId: string,
  userId: string,
  servicoData: Partial<
    Omit<
      Servico,
      "id" | "user_id" | "user_simple_id" | "created_at" | "updated_at"
    >
  >,
): Promise<Servico> {
  const data = addTimestamps(servicoData, true);

  const result = await sql`
    UPDATE servicos
    SET nome = COALESCE(${data.nome}, nome),
        descricao = COALESCE(${data.descricao}, descricao),
        preco = COALESCE(${data.preco}, preco),
        duracao_minutos = COALESCE(${data.duracao_minutos}, duracao_minutos),
        ativo = COALESCE(${data.ativo}, ativo),
        updated_at = ${data.updated_at}
    WHERE id = ${servicoId} AND user_simple_id = ${userId}
    RETURNING *
  `;

  return result[0] as Servico;
}

export async function deleteServico(
  servicoId: string,
  userId: string,
): Promise<boolean> {
  const now = new Date().toISOString();
  await sql`
    UPDATE servicos
    SET ativo = false, updated_at = ${now}
    WHERE id = ${servicoId} AND user_simple_id = ${userId}
  `;
  return true;
}

// ========== AGENDAMENTO SERVICES ==========

export async function getAgendamentos(
  userId: string,
  dataInicio?: Date,
  dataFim?: Date,
): Promise<Agendamento[]> {
  const cacheKey = `agendamentos_cache_raw_${userId}`;
  try {
    let result;

    // Verificar se o usuário é admin ou tem acesso total
    const userInfo = await sql`
      SELECT id, username, is_admin, can_edit_all FROM users_simple WHERE id = ${userId}
    `;

    const isAdmin = userInfo[0]?.is_admin || false;
    const canEditAll = userInfo[0]?.can_edit_all || false;
    const hasFullAccess = isAdmin || canEditAll;

    // Por segurança, usar queries sem funcionario_id até que a migração seja executada
    if (hasFullAccess) {
      // ADMIN: Ver todos os agendamentos
      if (dataInicio && dataFim) {
        result = await sql`
          SELECT a.*,
                 c.nome as cliente_nome, c.telefone as cliente_telefone, c.tipo_cliente,
                 s.nome as servico_nome, s.preco as servico_preco, s.duracao_minutos,
                 u.nome as criado_por_nome, u.username as criado_por_username
          FROM agendamentos a
          JOIN clientes c ON a.cliente_id = c.id
          JOIN servicos s ON a.servico_id = s.id
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
          JOIN clientes c ON a.cliente_id = c.id
          JOIN servicos s ON a.servico_id = s.id
          LEFT JOIN users_simple u ON a.user_simple_id = u.id
          ORDER BY a.data_hora
        `;
      }
    } else {
      // STAFF: Ver agendamentos onde ele é criador OU está atribuído como funcionário
      // Como os funcionários estão nas observações (formato atual), vamos buscar por FUNC tag nas observações
      if (dataInicio && dataFim) {
        result = await sql`
          SELECT a.*,
                 c.nome as cliente_nome, c.telefone as cliente_telefone, c.tipo_cliente,
                 s.nome as servico_nome, s.preco as servico_preco, s.duracao_minutos,
                 u.nome as criado_por_nome, u.username as criado_por_username
          FROM agendamentos a
          JOIN clientes c ON a.cliente_id = c.id
          JOIN servicos s ON a.servico_id = s.id
          LEFT JOIN users_simple u ON a.user_simple_id = u.id
          WHERE (a.user_simple_id = ${userId}
                 OR a.observacoes LIKE '%[FUNC:' || ${userId} || ']%'
                 OR a.observacoes LIKE '%"funcionario_id":"' || ${userId} || '"%')
            AND a.data_hora BETWEEN ${dataInicio.toISOString()} AND ${dataFim.toISOString()}
          ORDER BY a.data_hora
        `;
      } else {
        result = await sql`
          SELECT a.*,
                 c.nome as cliente_nome, c.telefone as cliente_telefone, c.tipo_cliente,
                 s.nome as servico_nome, s.preco as servico_preco, s.duracao_minutos,
                 u.nome as criado_por_nome, u.username as criado_por_username
          FROM agendamentos a
          JOIN clientes c ON a.cliente_id = c.id
          JOIN servicos s ON a.servico_id = s.id
          LEFT JOIN users_simple u ON a.user_simple_id = u.id
          WHERE a.user_simple_id = ${userId}
                 OR a.observacoes LIKE '%[FUNC:' || ${userId} || ']%'
                 OR a.observacoes LIKE '%"funcionario_id":"' || ${userId} || '"%'
          ORDER BY a.data_hora
        `;
      }
    }

    const mapped = result.map((row: any) => ({
      id: row.id,
      user_simple_id: row.user_simple_id,
      cliente_id: row.cliente_id,
      servico_id: row.servico_id,
      funcionario_id: row.funcionario_id || null,
      data_hora: new Date(row.data_hora),
      status: row.status,
      observacoes: row.observacoes,
      valor: row.valor,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
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
      funcionario: null,
    }));

    try {
      localStorage.setItem(cacheKey, JSON.stringify(mapped));
    } catch {}
    return mapped;
  } catch (err: any) {
    const msg = (err?.message || "").toString();
    if (
      typeof window !== "undefined" &&
      (msg.includes("Failed to fetch") ||
        msg.includes("fetch") ||
        msg.includes("temporariamente indisponível"))
    ) {
      try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    throw err;
  }
}

export async function createAgendamento(
  userId: string,
  agendamentoData: {
    cliente_id: string;
    servico_id: string;
    data_hora: Date;
    observacoes?: string;
    valor?: number;
  },
): Promise<Agendamento> {
  // Usar a data/hora preservando o timezone local
  const data = addTimestamps({
    user_simple_id: userId,
    status: "agendado",
    ...agendamentoData,
    data_hora: toLocalISOString(agendamentoData.data_hora),
  });

  const result = await sql`
    INSERT INTO agendamentos (user_simple_id, cliente_id, servico_id, data_hora, status, observacoes, valor, created_at, updated_at)
    VALUES (${data.user_simple_id}, ${data.cliente_id}, ${data.servico_id}, ${data.data_hora}, ${data.status}, ${data.observacoes}, ${data.valor}, ${data.created_at}, ${data.updated_at})
    RETURNING *
  `;

  const created = result[0] as Agendamento;
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("agendamento-changed", {
        detail: { action: "create", agendamento: created },
      }),
    );
  }
  return created;
}

export async function updateAgendamento(
  agendamentoId: string,
  userId: string,
  agendamentoData: Partial<{
    status: string;
    data_hora: Date;
    observacoes: string;
    valor: number;
    funcionario_id?: string;
    servico_id?: string;
  }>,
): Promise<Agendamento> {
  // Verificar permissões do usuário
  const userInfo = await sql`
    SELECT id, username, is_admin, can_edit_all FROM users_simple WHERE id = ${userId}
  `;

  const isAdmin = userInfo[0]?.is_admin || false;
  const canEditAll = userInfo[0]?.can_edit_all || false;
  const hasFullAccess = isAdmin || canEditAll;

  // Verificar se o agendamento existe e as permissões
  const existingAgendamento = await sql`
    SELECT id, user_simple_id, status, observacoes
    FROM agendamentos
    WHERE id = ${agendamentoId}
  `;

  if (existingAgendamento.length === 0) {
    throw new Error("Agendamento não encontrado");
  }

  const agendamento = existingAgendamento[0];
  const isCreator = agendamento.user_simple_id === userId;

  // Verificar se o funcionário está atribuído ao agendamento nas observações
  const isAssignedFuncionario =
    agendamento.observacoes &&
    (agendamento.observacoes.includes(`[FUNC:${userId}]`) ||
      agendamento.observacoes.includes(`"funcionario_id":"${userId}"`));

  // Verificar permissão: deve ser criador, admin, can_edit_all OU funcionário atribuído
  if (!hasFullAccess && !isCreator && !isAssignedFuncionario) {
    console.warn(
      `⚠️ Usuário ${userId} não tem permissão para atualizar agendamento ${agendamentoId}`,
    );
    console.log("Permissões:", {
      isAdmin,
      canEditAll,
      isCreator,
      isAssignedFuncionario,
    });
    throw new Error("Permissão negada para atualizar este agendamento");
  }

  // Usar a data/hora preservando o timezone local
  const data = addTimestamps(
    {
      ...agendamentoData,
      data_hora: agendamentoData.data_hora
        ? toLocalISOString(agendamentoData.data_hora)
        : undefined,
    },
    true,
  );

  console.log(
    `�� Atualizando agendamento ${agendamentoId} por usuário ${userId}`,
    {
      isAdmin,
      canEditAll,
      isCreator,
      isAssignedFuncionario,
      updates: data,
    },
  );

  // Atualizar agendamento (removendo restrição de user_simple_id)
  const result = await sql`
    UPDATE agendamentos
    SET status = COALESCE(${data.status}, status),
        data_hora = COALESCE(${data.data_hora}, data_hora),
        observacoes = COALESCE(${data.observacoes}, observacoes),
        valor = COALESCE(${data.valor}, valor),
        servico_id = COALESCE(${data.servico_id}, servico_id),
        updated_at = ${data.updated_at}
    WHERE id = ${agendamentoId}
    RETURNING *
  `;

  if (result.length === 0) {
    throw new Error("Falha ao atualizar agendamento");
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("agendamento-changed", {
        detail: { action: "update", agendamento: result[0] },
      }),
    );
  }

  if (agendamentoData.funcionario_id) {
    console.warn(
      "���️ Funcionário não salvo: coluna funcionario_id não existe. Execute a migração do banco de dados.",
    );
  }

  console.log(`✅ Agendamento ${agendamentoId} atualizado com sucesso`);
  return result[0] as Agendamento;
}

export async function deleteAgendamento(
  agendamentoId: string,
  userId: string,
): Promise<boolean> {
  console.log(
    `🗑️ Executando DELETE para agendamento ${agendamentoId} do usuário ${userId}`,
  );

  // Verificar permissões do usuário
  const userInfo = await sql`
    SELECT id, username, is_admin, can_edit_all FROM users_simple WHERE id = ${userId}
  `;

  const isAdmin = userInfo[0]?.is_admin || false;
  const canEditAll = userInfo[0]?.can_edit_all || false;
  const hasFullAccess = isAdmin || canEditAll;

  // Primeiro verificar se o agendamento existe
  const existingAgendamento = await sql`
    SELECT id, user_simple_id, status
    FROM agendamentos
    WHERE id = ${agendamentoId}
  `;

  if (existingAgendamento.length === 0) {
    console.warn(`⚠️ Agendamento ${agendamentoId} não encontrado`);
    throw new Error("Agendamento não encontrado");
  }

  // Verificar permissão: deve ser o criador OU ter acesso total (admin/can_edit_all)
  if (!hasFullAccess && existingAgendamento[0].user_simple_id !== userId) {
    console.warn(
      `⚠️ Usuário ${userId} não tem permissão para deletar agendamento ${agendamentoId}`,
    );
    throw new Error("Permissão negada");
  }

  // Executar delete
  const result = await sql`
    DELETE FROM agendamentos
    WHERE id = ${agendamentoId}
  `;

  console.log(`✅ Agendamento ${agendamentoId} deletado com sucesso`);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("agendamento-changed", {
        detail: { action: "delete", agendamentoId },
      }),
    );
  }
  return true;
}

// ========== TRANSACAO SERVICES ==========

export async function getTransacoes(
  userId: string,
  dataInicio?: Date,
  dataFim?: Date,
): Promise<Transacao[]> {
  let result;

  if (dataInicio && dataFim) {
    result = await sql`
      SELECT t.*,
             a.data_hora as agendamento_data,
             c.nome as cliente_nome,
             s.nome as servico_nome
      FROM transacoes t
      LEFT JOIN agendamentos a ON t.agendamento_id = a.id
      LEFT JOIN clientes c ON a.cliente_id = c.id
      LEFT JOIN servicos s ON a.servico_id = s.id
      WHERE t.user_simple_id = ${userId}
        AND t.data_transacao BETWEEN ${dataInicio.toISOString()} AND ${dataFim.toISOString()}
      ORDER BY t.data_transacao DESC
    `;
  } else {
    result = await sql`
      SELECT t.*,
             a.data_hora as agendamento_data,
             c.nome as cliente_nome,
             s.nome as servico_nome
      FROM transacoes t
      LEFT JOIN agendamentos a ON t.agendamento_id = a.id
      LEFT JOIN clientes c ON a.cliente_id = c.id
      LEFT JOIN servicos s ON a.servico_id = s.id
      WHERE t.user_simple_id = ${userId}
      ORDER BY t.data_transacao DESC
    `;
  }

  return result.map((row: any) => ({
    id: row.id,
    user_simple_id: row.user_simple_id,
    agendamento_id: row.agendamento_id,
    tipo: row.tipo,
    valor: row.valor,
    descricao: row.descricao,
    data_transacao: new Date(row.data_transacao),
    created_at: new Date(row.created_at),
    agendamento: row.agendamento_id
      ? {
          data_hora: new Date(row.agendamento_data),
          cliente: { nome: row.cliente_nome },
          servico: { nome: row.servico_nome },
        }
      : undefined,
  }));
}

export async function createTransacao(
  userId: string,
  transacaoData: {
    agendamento_id?: string;
    tipo: string;
    valor: number;
    descricao?: string;
  },
): Promise<Transacao> {
  const data = addTimestamps({
    user_simple_id: userId,
    data_transacao: new Date().toISOString(),
    ...transacaoData,
  });

  const result = await sql`
    INSERT INTO transacoes (user_simple_id, agendamento_id, tipo, valor, descricao, data_transacao, created_at)
    VALUES (${data.user_simple_id}, ${data.agendamento_id}, ${data.tipo}, ${data.valor}, ${data.descricao}, ${data.data_transacao}, ${data.created_at})
    RETURNING *
  `;

  return result[0] as Transacao;
}

// ========== DASHBOARD STATS ==========

export async function getDashboardStats(userId: string) {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  // Verificar se usuário é admin
  const userInfo = await sql`
    SELECT id, is_admin FROM users_simple WHERE id = ${userId}
  `;
  const isAdmin = userInfo[0]?.is_admin || false;

  // Agendamentos de hoje
  const agendamentosHoje = isAdmin
    ? await sql`
        SELECT COUNT(*) as total
        FROM agendamentos
        WHERE DATE(data_hora) = DATE(${hoje.toISOString()})
      `
    : await sql`
        SELECT COUNT(*) as total
        FROM agendamentos
        WHERE user_simple_id = ${userId}
          AND DATE(data_hora) = DATE(${hoje.toISOString()})
      `;

  // Receita do mês
  const receitaMes = isAdmin
    ? await sql`
        SELECT COALESCE(SUM(valor), 0) as total
        FROM transacoes
        WHERE tipo = 'receita'
          AND data_transacao BETWEEN ${inicioMes.toISOString()} AND ${fimMes.toISOString()}
      `
    : await sql`
        SELECT COALESCE(SUM(valor), 0) as total
        FROM transacoes
        WHERE user_simple_id = ${userId}
          AND tipo = 'receita'
          AND data_transacao BETWEEN ${inicioMes.toISOString()} AND ${fimMes.toISOString()}
      `;

  // Total de clientes
  const totalClientes = isAdmin
    ? await sql`
        SELECT COUNT(*) as total
        FROM clientes
      `
    : await sql`
        SELECT COUNT(*) as total
        FROM clientes
        WHERE user_simple_id = ${userId}
      `;

  // Próximos agendamentos
  const proximosAgendamentos = isAdmin
    ? await sql`
        SELECT a.*, c.nome as cliente_nome, s.nome as servico_nome
        FROM agendamentos a
        JOIN clientes c ON a.cliente_id = c.id
        JOIN servicos s ON a.servico_id = s.id
        WHERE a.data_hora > ${hoje.toISOString()}
        ORDER BY a.data_hora
        LIMIT 5
      `
    : await sql`
        SELECT a.*, c.nome as cliente_nome, s.nome as servico_nome
        FROM agendamentos a
        JOIN clientes c ON a.cliente_id = c.id
        JOIN servicos s ON a.servico_id = s.id
        WHERE a.user_simple_id = ${userId}
          AND a.data_hora > ${hoje.toISOString()}
        ORDER BY a.data_hora
        LIMIT 5
      `;

  return {
    agendamentosHoje: parseInt(agendamentosHoje[0]?.total || "0"),
    receitaMes: parseFloat(receitaMes[0]?.total || "0"),
    totalClientes: parseInt(totalClientes[0]?.total || "0"),
    proximosAgendamentos: proximosAgendamentos.map((row: any) => ({
      id: row.id,
      data_hora: new Date(row.data_hora),
      cliente_nome: row.cliente_nome,
      servico_nome: row.servico_nome,
    })),
  };
}
