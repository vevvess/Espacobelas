import { sql } from "@/lib/neon";

async function tableExists(tableName: string): Promise<boolean> {
  try {
    const res = await sql`SELECT to_regclass('public.' || ${tableName}) as reg`;
    return Array.isArray(res) && !!(res as any)[0]?.reg;
  } catch {
    return false;
  }
}

export interface DebitoMensal {
  id: string;
  cliente_id: string;
  agendamento_id: string;
  data_servico: Date;
  servico_nome: string;
  profissional_nome?: string;
  valor: number;
  pago: boolean;
  mes_referencia: string; // YYYY-MM
  created_at: Date;
}

export interface PagamentoMensal {
  id: string;
  cliente_id: string;
  mes_referencia: string;
  valor_pago: number;
  data_pagamento: Date;
  observacoes?: string;
  created_at: Date;
}

export interface ClienteMensalDetalhes {
  cliente: any;
  debitos: DebitoMensal[];
  pagamentos: PagamentoMensal[];
  total_debito: number;
  total_pago: number;
  saldo_devedor: number;
}

// ========== GESTÃO DE DÉBITOS MENSAIS ==========

export async function criarDebitoMensal(
  agendamentoId: string,
  clienteId: string,
  dataServico: Date,
  servicoNome: string,
  profissionalNome: string | undefined,
  valor: number,
): Promise<DebitoMensal> {
  const mesReferencia = `${dataServico.getFullYear()}-${String(dataServico.getMonth() + 1).padStart(2, "0")}`;

  if (!(await tableExists('debitos_mensais'))) {
    throw new Error('Tabela debitos_mensais não encontrada. Configure Clientes Mensais antes de registrar débitos.');
  }

  const result = await sql`
    INSERT INTO debitos_mensais (
      cliente_id, agendamento_id, data_servico, servico_nome, 
      profissional_nome, valor, mes_referencia
    ) VALUES (
      ${clienteId}, ${agendamentoId}, ${dataServico.toISOString()}, 
      ${servicoNome}, ${profissionalNome}, ${valor}, ${mesReferencia}
    ) RETURNING *
  `;

  return {
    id: result[0].id,
    cliente_id: result[0].cliente_id,
    agendamento_id: result[0].agendamento_id,
    data_servico: new Date(result[0].data_servico),
    servico_nome: result[0].servico_nome,
    profissional_nome: result[0].profissional_nome,
    valor: parseFloat(result[0].valor),
    pago: result[0].pago,
    mes_referencia: result[0].mes_referencia,
    created_at: new Date(result[0].created_at),
  };
}

export async function getDebitosPorCliente(
  clienteId: string,
  mesReferencia?: string,
): Promise<DebitoMensal[]> {
  if (!(await tableExists('debitos_mensais'))) return [];
  let query;

  if (mesReferencia) {
    query = await sql`
      SELECT * FROM debitos_mensais 
      WHERE cliente_id = ${clienteId} AND mes_referencia = ${mesReferencia}
      ORDER BY data_servico DESC
    `;
  } else {
    query = await sql`
      SELECT * FROM debitos_mensais 
      WHERE cliente_id = ${clienteId}
      ORDER BY data_servico DESC
    `;
  }

  return query.map((row: any) => ({
    id: row.id,
    cliente_id: row.cliente_id,
    agendamento_id: row.agendamento_id,
    data_servico: new Date(row.data_servico),
    servico_nome: row.servico_nome,
    profissional_nome: row.profissional_nome,
    valor: parseFloat(row.valor),
    pago: row.pago,
    mes_referencia: row.mes_referencia,
    created_at: new Date(row.created_at),
  }));
}

export async function getPagamentosPorCliente(
  clienteId: string,
  mesReferencia?: string,
): Promise<PagamentoMensal[]> {
  if (!(await tableExists('pagamentos_mensais'))) return [];
  let query;

  if (mesReferencia) {
    query = await sql`
      SELECT * FROM pagamentos_mensais 
      WHERE cliente_id = ${clienteId} AND mes_referencia = ${mesReferencia}
      ORDER BY data_pagamento DESC
    `;
  } else {
    query = await sql`
      SELECT * FROM pagamentos_mensais 
      WHERE cliente_id = ${clienteId}
      ORDER BY data_pagamento DESC
    `;
  }

  return query.map((row: any) => ({
    id: row.id,
    cliente_id: row.cliente_id,
    mes_referencia: row.mes_referencia,
    valor_pago: parseFloat(row.valor_pago),
    data_pagamento: new Date(row.data_pagamento),
    observacoes: row.observacoes,
    created_at: new Date(row.created_at),
  }));
}

export async function registrarPagamentoMensal(
  clienteId: string,
  mesReferencia: string,
  valorPago: number,
  observacoes?: string,
): Promise<PagamentoMensal> {
  if (!(await tableExists('pagamentos_mensais'))) {
    throw new Error('Tabela pagamentos_mensais não encontrada. Configure Clientes Mensais antes de registrar pagamentos.');
  }
  const result = await sql`
    INSERT INTO pagamentos_mensais (
      cliente_id, mes_referencia, valor_pago, observacoes
    ) VALUES (
      ${clienteId}, ${mesReferencia}, ${valorPago}, ${observacoes}
    ) RETURNING *
  `;

  return {
    id: result[0].id,
    cliente_id: result[0].cliente_id,
    mes_referencia: result[0].mes_referencia,
    valor_pago: parseFloat(result[0].valor_pago),
    data_pagamento: new Date(result[0].data_pagamento),
    observacoes: result[0].observacoes,
    created_at: new Date(result[0].created_at),
  };
}

export async function getClientesMensais(userId: string) {
  const result = await sql`
    SELECT * FROM clientes 
    WHERE user_simple_id = ${userId} AND tipo_cliente = 'mensal'
    ORDER BY nome
  `;

  return result;
}

export async function atualizarTipoCliente(
  clienteId: string,
  userId: string,
  tipoCliente: "normal" | "mensal",
): Promise<void> {
  await sql`
    UPDATE clientes 
    SET tipo_cliente = ${tipoCliente}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${clienteId} AND user_simple_id = ${userId}
  `;
}

export async function getDetalhesClienteMensal(
  clienteId: string,
  userId: string,
  mesReferencia?: string,
): Promise<ClienteMensalDetalhes> {
  // Buscar dados do cliente
  const clienteQuery = await sql`
    SELECT * FROM clientes 
    WHERE id = ${clienteId} AND user_simple_id = ${userId}
  `;

  const cliente = clienteQuery[0];
  if (!cliente) {
    throw new Error("Cliente não encontrado");
  }

  // Buscar débitos e pagamentos
  const debitos = await getDebitosPorCliente(clienteId, mesReferencia);
  const pagamentos = await getPagamentosPorCliente(clienteId, mesReferencia);

  // Calcular totais
  const totalDebito = debitos.reduce((sum, d) => sum + d.valor, 0);
  const totalPago = pagamentos.reduce((sum, p) => sum + p.valor_pago, 0);
  const saldoDevedor = totalDebito - totalPago;

  return {
    cliente,
    debitos,
    pagamentos,
    total_debito: totalDebito,
    total_pago: totalPago,
    saldo_devedor: Math.max(0, saldoDevedor), // Não pode ser negativo
  };
}

export async function getResumoClientesMensais(
  userId: string,
  mesReferencia?: string,
) {
  const clientesMensais = await getClientesMensais(userId);

  const resumos = await Promise.all(
    clientesMensais.map(async (cliente) => {
      const detalhes = await getDetalhesClienteMensal(
        cliente.id,
        userId,
        mesReferencia,
      );
      return {
        cliente: cliente,
        total_debito: detalhes.total_debito,
        total_pago: detalhes.total_pago,
        saldo_devedor: detalhes.saldo_devedor,
        qtd_servicos: detalhes.debitos.length,
      };
    }),
  );

  return resumos;
}
