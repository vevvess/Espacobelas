import { sql } from "@/lib/neon";

export type UUID = string;
export type YMD = string; // YYYY-MM-DD

export type Unidade = "un" | "pct" | "ml" | "g" | "l" | "kg";

export interface Categoria {
  id: UUID;
  user_simple_id: string;
  nome: string;
  created_at: string;
  updated_at: string;
}

export interface LocalArmazenamento {
  id: UUID;
  user_simple_id: string;
  nome: string;
  created_at: string;
  updated_at: string;
}

export interface Produto {
  id: UUID;
  user_simple_id: string;
  nome: string;
  codigo_barras?: string | null;
  unidade: Unidade;
  fator_pacote: number; // usado quando unidade = pct
  fracionavel: boolean;
  categoria_id?: string | null;
  local_id?: string | null;
  validade?: string | null; // date (YYYY-MM-DD)
  alerta_validade_dias: number; // ex: 7
  alerta_estoque_qtd: number; // ex: 1
  foto?: string | null; // data url ou url
  ativo: boolean;
  created_at: string;
  updated_at: string;

  // Campos derivados (não persistidos)
  categoria_nome?: string;
  local_nome?: string;
  saldo_atual?: number;
}

export interface Movimento {
  id: UUID;
  user_simple_id: string;
  produto_id: string;
  tipo: "entrada" | "saida" | "ajuste";
  quantidade: number; // pode ser negativo em ajuste
  unidade: Unidade;
  motivo?: "compra" | "consumo" | "perda" | "validade" | "ajuste" | string;
  observacao?: string | null;
  created_at: string;
  created_by?: string | null;
  // joined
  produto_nome?: string;
  categoria_nome?: string;
}

const nowIso = () => new Date().toISOString();
const makeId = (p: string) =>
  `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

let schemaEnsured = false;

export async function ensureEstoqueSchema() {
  if (schemaEnsured) return;
  // Tabelas
  await sql`CREATE TABLE IF NOT EXISTS estoque_categorias (
    id TEXT PRIMARY KEY,
    user_simple_id TEXT NOT NULL,
    nome TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
  )`;
  await sql`CREATE TABLE IF NOT EXISTS estoque_locais (
    id TEXT PRIMARY KEY,
    user_simple_id TEXT NOT NULL,
    nome TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
  )`;
  await sql`CREATE TABLE IF NOT EXISTS estoque_produtos (
    id TEXT PRIMARY KEY,
    user_simple_id TEXT NOT NULL,
    nome TEXT NOT NULL,
    codigo_barras TEXT,
    unidade TEXT NOT NULL,
    fator_pacote NUMERIC NOT NULL DEFAULT 1,
    fracionavel BOOLEAN NOT NULL DEFAULT false,
    categoria_id TEXT,
    local_id TEXT,
    validade DATE,
    alerta_validade_dias INTEGER NOT NULL DEFAULT 7,
    alerta_estoque_qtd NUMERIC NOT NULL DEFAULT 1,
    foto TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
  )`;

  await sql`CREATE TABLE IF NOT EXISTS estoque_movimentos (
    id TEXT PRIMARY KEY,
    user_simple_id TEXT NOT NULL,
    produto_id TEXT NOT NULL,
    tipo TEXT NOT NULL,
    quantidade NUMERIC NOT NULL,
    unidade TEXT NOT NULL,
    motivo TEXT,
    observacao TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    created_by TEXT
  )`;

  // Índices
  await sql`CREATE INDEX IF NOT EXISTS idx_estoque_produtos_user ON estoque_produtos(user_simple_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_estoque_produtos_nome ON estoque_produtos USING GIN (to_tsvector('portuguese', nome))`;
  await sql`CREATE INDEX IF NOT EXISTS idx_estoque_produtos_cod ON estoque_produtos(codigo_barras)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_estoque_mov_user_prod ON estoque_movimentos(user_simple_id, produto_id)`;

  schemaEnsured = true;
}

export async function upsertCategoria(userId: string, nome: string): Promise<Categoria> {
  await ensureEstoqueSchema();
  const id = makeId("cat");
  const now = nowIso();
  const r = await sql`
    INSERT INTO estoque_categorias (id, user_simple_id, nome, created_at, updated_at)
    VALUES (${id}, ${userId}, ${nome}, ${now}, ${now})
    RETURNING *
  `;
  return r[0] as Categoria;
}

export async function updateCategoria(userId: string, id: string, nome: string): Promise<Categoria> {
  await ensureEstoqueSchema();
  const now = nowIso();
  const r = await sql`
    UPDATE estoque_categorias SET nome = ${nome}, updated_at = ${now}
    WHERE id = ${id} AND user_simple_id = ${userId}
    RETURNING *
  `;
  return r[0] as Categoria;
}

export async function deleteCategoria(userId: string, id: string): Promise<void> {
  await ensureEstoqueSchema();
  await sql`DELETE FROM estoque_categorias WHERE id = ${id} AND user_simple_id = ${userId}`;
}

export async function listCategorias(userId: string): Promise<Categoria[]> {
  await ensureEstoqueSchema();
  const r = await sql`SELECT * FROM estoque_categorias WHERE user_simple_id = ${userId} ORDER BY nome`;
  return r as Categoria[];
}

export async function upsertLocal(userId: string, nome: string): Promise<LocalArmazenamento> {
  await ensureEstoqueSchema();
  const id = makeId("loc");
  const now = nowIso();
  const r = await sql`
    INSERT INTO estoque_locais (id, user_simple_id, nome, created_at, updated_at)
    VALUES (${id}, ${userId}, ${nome}, ${now}, ${now})
    RETURNING *
  `;
  return r[0] as LocalArmazenamento;
}

export async function updateLocal(userId: string, id: string, nome: string): Promise<LocalArmazenamento> {
  await ensureEstoqueSchema();
  const now = nowIso();
  const r = await sql`
    UPDATE estoque_locais SET nome = ${nome}, updated_at = ${now}
    WHERE id = ${id} AND user_simple_id = ${userId}
    RETURNING *
  `;
  return r[0] as LocalArmazenamento;
}

export async function deleteLocal(userId: string, id: string): Promise<void> {
  await ensureEstoqueSchema();
  await sql`DELETE FROM estoque_locais WHERE id = ${id} AND user_simple_id = ${userId}`;
}

export async function createProduto(userId: string, data: Partial<Produto>): Promise<Produto> {
  await ensureEstoqueSchema();
  const id = makeId("prod");
  const now = nowIso();
  const r = await sql`
    INSERT INTO estoque_produtos
      (id, user_simple_id, nome, codigo_barras, unidade, fator_pacote, fracionavel, categoria_id, local_id, validade, alerta_validade_dias, alerta_estoque_qtd, foto, ativo, created_at, updated_at)
    VALUES
      (${id}, ${userId}, ${data.nome || ""}, ${data.codigo_barras || null}, ${data.unidade || "un"}, ${Number(data.fator_pacote || 1)}, ${!!data.fracionavel}, ${data.categoria_id || null}, ${data.local_id || null}, ${data.validade || null}, ${Number(data.alerta_validade_dias ?? 7)}, ${Number(data.alerta_estoque_qtd ?? 1)}, ${data.foto || null}, ${data.ativo ?? true}, ${now}, ${now})
    RETURNING *
  `;
  return r[0] as Produto;
}

export async function updateProduto(userId: string, id: string, data: Partial<Produto>): Promise<Produto> {
  await ensureEstoqueSchema();
  const now = nowIso();
  const r = await sql`
    UPDATE estoque_produtos
    SET
      nome = COALESCE(${data.nome}, nome),
      codigo_barras = COALESCE(${data.codigo_barras}, codigo_barras),
      unidade = COALESCE(${data.unidade as any}, unidade),
      fator_pacote = COALESCE(${data.fator_pacote as any}, fator_pacote),
      fracionavel = COALESCE(${data.fracionavel as any}, fracionavel),
      categoria_id = COALESCE(${data.categoria_id as any}, categoria_id),
      local_id = COALESCE(${data.local_id as any}, local_id),
      validade = COALESCE(${data.validade as any}, validade),
      alerta_validade_dias = COALESCE(${data.alerta_validade_dias as any}, alerta_validade_dias),
      alerta_estoque_qtd = COALESCE(${data.alerta_estoque_qtd as any}, alerta_estoque_qtd),
      foto = COALESCE(${data.foto as any}, foto),
      ativo = COALESCE(${data.ativo as any}, ativo),
      updated_at = ${now}
    WHERE id = ${id} AND user_simple_id = ${userId}
    RETURNING *
  `;
  return r[0] as Produto;
}

export async function recordMovimento(userId: string, data: {
  produto_id: string;
  tipo: "entrada" | "saida" | "ajuste";
  quantidade: number;
  unidade: Unidade;
  motivo?: string;
  observacao?: string;
  created_by?: string;
}): Promise<Movimento> {
  await ensureEstoqueSchema();
  const id = makeId("mov");
  const now = nowIso();
  const r = await sql`
    INSERT INTO estoque_movimentos (id, user_simple_id, produto_id, tipo, quantidade, unidade, motivo, observacao, created_at, created_by)
    VALUES (${id}, ${userId}, ${data.produto_id}, ${data.tipo}, ${data.quantidade}, ${data.unidade}, ${data.motivo || null}, ${data.observacao || null}, ${now}, ${data.created_by || null})
    RETURNING *
  `;
  return r[0] as Movimento;
}

export async function updateMovimento(userId: string, id: string, data: Partial<Pick<Movimento, "tipo" | "quantidade" | "unidade" | "motivo" | "observacao">>): Promise<Movimento> {
  await ensureEstoqueSchema();
  const r = await sql`
    UPDATE estoque_movimentos
    SET
      tipo = COALESCE(${data.tipo as any}, tipo),
      quantidade = COALESCE(${data.quantidade as any}, quantidade),
      unidade = COALESCE(${data.unidade as any}, unidade),
      motivo = COALESCE(${data.motivo as any}, motivo),
      observacao = COALESCE(${data.observacao as any}, observacao)
    WHERE id = ${id} AND user_simple_id = ${userId}
    RETURNING *
  `;
  return r[0] as Movimento;
}

export async function deleteMovimento(userId: string, id: string): Promise<void> {
  await ensureEstoqueSchema();
  await sql`DELETE FROM estoque_movimentos WHERE id = ${id} AND user_simple_id = ${userId}`;
}

export async function listProdutos(userId: string, q?: string, categoriaId?: string, localId?: string): Promise<Produto[]> {
  await ensureEstoqueSchema();

  // Buscar produtos
  let base = await sql`
    SELECT p.*, c.nome as categoria_nome, l.nome as local_nome
    FROM estoque_produtos p
    LEFT JOIN estoque_categorias c ON c.id = p.categoria_id
    LEFT JOIN estoque_locais l ON l.id = p.local_id
    WHERE p.user_simple_id = ${userId} AND p.ativo = true
    ORDER BY p.nome
  `;

  // Filtro client side (portuguese tsvector precisa operador, evitando complexidade)
  let rows = base as Produto[];
  if (q && q.trim().length > 0) {
    const ql = q.trim().toLowerCase();
    rows = rows.filter(
      (r) =>
        r.nome?.toLowerCase().includes(ql) ||
        (r.codigo_barras || "").toLowerCase().includes(ql) ||
        (r.categoria_nome || "").toLowerCase().includes(ql)
    );
  }
  if (categoriaId) rows = rows.filter((r) => r.categoria_id === categoriaId);
  if (localId) rows = rows.filter((r) => r.local_id === localId);

  // Saldo atual (sum movimentos) para todos de uma vez
  const ids = rows.map((r) => r.id);
  if (ids.length > 0) {
    const agg = await sql`
      SELECT produto_id, SUM(
        CASE WHEN tipo='entrada' THEN quantidade
             WHEN tipo='ajuste' THEN quantidade
             ELSE -quantidade END
      ) as saldo
      FROM estoque_movimentos
      WHERE user_simple_id = ${userId} AND produto_id = ANY(${ids})
      GROUP BY produto_id
    `;
    const map = new Map<string, number>();
    (agg || []).forEach((a: any) => map.set(String(a.produto_id), Number(a.saldo) || 0));
    rows = rows.map((r) => ({ ...r, saldo_atual: map.get(r.id) ?? 0 }));
  } else {
    rows = rows.map((r) => ({ ...r, saldo_atual: 0 }));
  }

  return rows;
}

export async function listMovimentos(userId: string, opts: { inicio?: Date; fim?: Date; produtoId?: string; tipo?: string } = {}): Promise<Movimento[]> {
  await ensureEstoqueSchema();

  const inicio = opts.inicio ? opts.inicio.toISOString() : new Date(Date.now() - 7 * 86400000).toISOString();
  const fim = opts.fim ? opts.fim.toISOString() : new Date().toISOString();

  const r = await sql`
    SELECT m.*, p.nome as produto_nome, c.nome as categoria_nome
    FROM estoque_movimentos m
    JOIN estoque_produtos p ON p.id = m.produto_id
    LEFT JOIN estoque_categorias c ON c.id = p.categoria_id
    WHERE m.user_simple_id = ${userId}
      AND m.created_at BETWEEN ${inicio} AND ${fim}
      ${opts.produtoId ? sql`AND m.produto_id = ${opts.produtoId}` : sql``}
      ${opts.tipo ? sql`AND m.tipo = ${opts.tipo}` : sql``}
    ORDER BY m.created_at DESC
  `;
  return r as Movimento[];
}

export function computeAlerts(p: Produto): { baixo?: boolean; validadeAtencao?: boolean; validadeCritico?: boolean; diasParaVencer?: number | null } {
  const alerts: { baixo?: boolean; validadeAtencao?: boolean; validadeCritico?: boolean; diasParaVencer?: number | null } = {
    diasParaVencer: null,
  };
  const saldo = Number(p.saldo_atual || 0);
  if (!isNaN(saldo) && saldo <= Number(p.alerta_estoque_qtd || 0)) alerts.baixo = true;

  if (p.validade) {
    try {
      const today = new Date();
      const v = new Date(p.validade);
      const diff = Math.floor((v.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86400000);
      alerts.diasParaVencer = diff;
      if (diff < 0) alerts.validadeCritico = true;
      else if (diff <= Number(p.alerta_validade_dias || 7)) alerts.validadeAtencao = true;
    } catch {}
  }

  return alerts;
}

// Export simples em CSV
export function exportProdutosCSV(produtos: Produto[]) {
  const header = [
    "Nome",
    "Código de Barras",
    "Categoria",
    "Local",
    "Unidade",
    "Fator Pacote",
    "Fracionável",
    "Validade",
    "Alerta Validade (dias)",
    "Alerta Estoque (qtd)",
    "Saldo Atual",
  ];
  const rows = produtos.map((p) => [
    escapeCSV(p.nome || ""),
    escapeCSV(p.codigo_barras || ""),
    escapeCSV(p.categoria_nome || ""),
    escapeCSV(p.local_nome || ""),
    p.unidade || "un",
    String(p.fator_pacote || 1),
    p.fracionavel ? "Sim" : "Não",
    p.validade || "",
    String(p.alerta_validade_dias ?? 7),
    String(p.alerta_estoque_qtd ?? 1),
    String(p.saldo_atual ?? 0),
  ]);

  const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `estoque_produtos_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportMovimentosCSV(movs: Movimento[]) {
  const header = ["Data/Hora", "Produto", "Categoria", "Tipo", "Quantidade", "Unidade", "Motivo", "Observação"];
  const rows = movs.map((m) => [
    new Date(m.created_at).toLocaleString("pt-BR"),
    escapeCSV(m.produto_nome || ""),
    escapeCSV(m.categoria_nome || ""),
    m.tipo,
    String(m.quantidade),
    m.unidade,
    m.motivo || "",
    escapeCSV(m.observacao || ""),
  ]);
  const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `estoque_movimentos_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// XLSX helpers (dinâmico via CDN)
async function loadXLSX(): Promise<any> {
  const w = window as any;
  if (w.XLSX) return w.XLSX;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Falha ao carregar XLSX"));
    document.head.appendChild(s);
  });
  return (window as any).XLSX;
}

export async function exportProdutosXLSX(produtos: Produto[]) {
  const XLSX = await loadXLSX();
  const data = produtos.map((p) => ({
    Nome: p.nome || "",
    "Código de Barras": p.codigo_barras || "",
    Categoria: p.categoria_nome || "",
    Local: p.local_nome || "",
    Unidade: p.unidade,
    "Fator Pacote": Number(p.fator_pacote || 1),
    Fracionável: p.fracionavel ? "Sim" : "Não",
    Validade: p.validade || "",
    "Alerta Validade (dias)": Number(p.alerta_validade_dias ?? 7),
    "Alerta Estoque (qtd)": Number(p.alerta_estoque_qtd ?? 1),
    "Saldo Atual": Number(p.saldo_atual ?? 0),
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Produtos");
  XLSX.writeFile(wb, `estoque_produtos_${new Date().toISOString().slice(0,10)}.xlsx`);
}

export async function exportMovimentosXLSX(movs: Movimento[]) {
  const XLSX = await loadXLSX();
  const data = movs.map((m) => ({
    "Data/Hora": new Date(m.created_at).toLocaleString("pt-BR"),
    Produto: m.produto_nome || "",
    Categoria: m.categoria_nome || "",
    Tipo: m.tipo,
    Quantidade: Number(m.quantidade),
    Unidade: m.unidade,
    Motivo: m.motivo || "",
    Observação: m.observacao || "",
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Movimentos");
  XLSX.writeFile(wb, `estoque_movimentos_${new Date().toISOString().slice(0,10)}.xlsx`);
}

function escapeCSV(s: string) {
  const needs = /[;"\n]/.test(s);
  return needs ? `"${s.replace(/"/g, '""')}"` : s;
}