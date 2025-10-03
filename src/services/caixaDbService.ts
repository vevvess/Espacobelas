import { sql } from "@/lib/neon";

export type YMD = string; // "YYYY-MM-DD"

export type AtendimentoManualDB = {
  id: string;
  user_simple_id: string;
  data: YMD;
  cliente: string | null;
  pagamento: string | null;
  valor: number;
  servicos: any | null; // jsonb: [{nome, valor, profissional}]
  created_at: string;
  updated_at: string;
};

export type DespesaManualDB = {
  id: string;
  user_simple_id: string;
  data: YMD;
  descricao: string | null;
  origem: "caixa" | "outro" | null;
  valor: number;
  created_at: string;
  updated_at: string;
};

const TABLES_SQL = {
  caixa_dias: `
    CREATE TABLE IF NOT EXISTS caixa_dias (
      id TEXT PRIMARY KEY,
      user_simple_id TEXT NOT NULL,
      data DATE NOT NULL,
      dinheiro_informado NUMERIC NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      UNIQUE(user_simple_id, data)
    );
  `,
  caixa_atendimentos: `
    CREATE TABLE IF NOT EXISTS caixa_atendimentos (
      id TEXT PRIMARY KEY,
      user_simple_id TEXT NOT NULL,
      data DATE NOT NULL,
      cliente TEXT,
      pagamento TEXT,
      valor NUMERIC NOT NULL DEFAULT 0,
      servicos JSONB,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
  `,
  caixa_despesas: `
    CREATE TABLE IF NOT EXISTS caixa_despesas (
      id TEXT PRIMARY KEY,
      user_simple_id TEXT NOT NULL,
      data DATE NOT NULL,
      descricao TEXT,
      origem TEXT,
      valor NUMERIC NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
  `,
};

let ensured = false;
export async function ensureCaixaSchema() {
  if (ensured) return;
  try {
    await sql`${TABLES_SQL.caixa_dias}`;
    await sql`${TABLES_SQL.caixa_atendimentos}`;
    await sql`${TABLES_SQL.caixa_despesas}`;
  } catch (e) {
    // Algumas instalações de Neon não aceitam múltiplos statements com template literal,
    // então tentamos individualmente como strings.
    await sql`CREATE TABLE IF NOT EXISTS caixa_dias (
      id TEXT PRIMARY KEY,
      user_simple_id TEXT NOT NULL,
      data DATE NOT NULL,
      dinheiro_informado NUMERIC NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      UNIQUE(user_simple_id, data)
    )`;
    await sql`CREATE TABLE IF NOT EXISTS caixa_atendimentos (
      id TEXT PRIMARY KEY,
      user_simple_id TEXT NOT NULL,
      data DATE NOT NULL,
      cliente TEXT,
      pagamento TEXT,
      valor NUMERIC NOT NULL DEFAULT 0,
      servicos JSONB,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    )`;
    await sql`CREATE TABLE IF NOT EXISTS caixa_despesas (
      id TEXT PRIMARY KEY,
      user_simple_id TEXT NOT NULL,
      data DATE NOT NULL,
      descricao TEXT,
      origem TEXT,
      valor NUMERIC NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    )`;
  }
  ensured = true;
}

const nowIso = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export async function getDinheiroInformado(userId: string, ymd: YMD): Promise<number> {
  await ensureCaixaSchema();
  const res = await sql`SELECT dinheiro_informado FROM caixa_dias WHERE user_simple_id = ${userId} AND data = ${ymd} LIMIT 1`;
  const v = res?.[0]?.dinheiro_informado;
  return v ? Number(v) : 0;
}

export async function setDinheiroInformado(userId: string, ymd: YMD, valor: number): Promise<void> {
  await ensureCaixaSchema();
  const id = makeId("dia");
  const created = nowIso();
  const updated = created;
  // UPSERT por par (user, data)
  await sql`
    INSERT INTO caixa_dias (id, user_simple_id, data, dinheiro_informado, created_at, updated_at)
    VALUES (${id}, ${userId}, ${ymd}, ${valor}, ${created}, ${updated})
    ON CONFLICT (user_simple_id, data)
    DO UPDATE SET dinheiro_informado = ${valor}, updated_at = ${updated}
  `;
}

export async function createAtendimentoManual(userId: string, ymd: YMD, payload: {
  cliente?: string;
  pagamento?: string;
  valor: number;
  servicos?: Array<{ nome?: string; valor?: number; profissional?: string }>;
}): Promise<AtendimentoManualDB> {
  await ensureCaixaSchema();
  const id = makeId("att");
  const created = nowIso();
  const updated = created;
  const servicosJson = payload.servicos ? JSON.stringify(payload.servicos) : null;

  const result = await sql`
    INSERT INTO caixa_atendimentos (id, user_simple_id, data, cliente, pagamento, valor, servicos, created_at, updated_at)
    VALUES (${id}, ${userId}, ${ymd}, ${payload.cliente || null}, ${payload.pagamento || null}, ${payload.valor || 0}, ${servicosJson}, ${created}, ${updated})
    RETURNING *
  `;
  return result[0] as AtendimentoManualDB;
}

export async function deleteAtendimentoManual(userId: string, id: string): Promise<void> {
  await ensureCaixaSchema();
  await sql`DELETE FROM caixa_atendimentos WHERE id = ${id} AND user_simple_id = ${userId}`;
}

export async function createDespesaManual(userId: string, ymd: YMD, payload: {
  descricao: string;
  valor: number;
  origem?: "caixa" | "outro";
}): Promise<DespesaManualDB> {
  await ensureCaixaSchema();
  const id = makeId("dep");
  const created = nowIso();
  const updated = created;

  const result = await sql`
    INSERT INTO caixa_despesas (id, user_simple_id, data, descricao, origem, valor, created_at, updated_at)
    VALUES (${id}, ${userId}, ${ymd}, ${payload.descricao || null}, ${payload.origem || "caixa"}, ${payload.valor || 0}, ${created}, ${updated})
    RETURNING *
  `;
  return result[0] as DespesaManualDB;
}

export async function deleteDespesaManual(userId: string, id: string): Promise<void> {
  await ensureCaixaSchema();
  await sql`DELETE FROM caixa_despesas WHERE id = ${id} AND user_simple_id = ${userId}`;
}

export async function listMovimentosManuais(userId: string, ymd: YMD): Promise<{
  atendimentos: AtendimentoManualDB[];
  despesas: DespesaManualDB[];
}> {
  await ensureCaixaSchema();
  const atts = await sql`SELECT * FROM caixa_atendimentos WHERE user_simple_id = ${userId} AND data = ${ymd} ORDER BY created_at DESC`;
  const deps = await sql`SELECT * FROM caixa_despesas WHERE user_simple_id = ${userId} AND data = ${ymd} ORDER BY created_at DESC`;
  return { atendimentos: atts as any, despesas: deps as any };
}