/**
 * Adaptador para converter dados entre sistemas de agendamento antigo e novo
 *
 * Sistema Antigo: agendamentos com um servico
 * Sistema Novo: agendamentos com múltiplos servicos
 */

// Funções auxiliares simplificadas para evitar dependências problemáticas
function extractFuncionarioFromObservacoesFallback(
  observacoes: string = "",
): string | null {
  const match = observacoes.match(/\[FUNC:([^\]]+)\]/);
  return match ? match[1] : null;
}

function extractUserObservacoesFallback(observacoes: string = ""): string {
  if (!observacoes || typeof observacoes !== "string") {
    return "";
  }

  try {
    // Tentar extrair do JSON primeiro (lógica robusta do observacoesBuilder)
    const match = observacoes.match(/\[SERVICOS:(.+?)\]/);
    if (match) {
      let jsonData = match[1];

      // Tentar corrigir JSON comum com problemas
      jsonData = jsonData
        .replace(/,\s*}]/g, "}]") // Remover vírgula antes de }]
        .replace(/,\s*}/g, "}") // Remover vírgula antes de }
        .replace(/"\s*}/g, '"}') // Corrigir aspas quebradas
        .replace(/"\s*]/g, '"]'); // Corrigir aspas em arrays

      const data = JSON.parse(jsonData);
      return data.observacoes_usuario || "";
    }

    // Fallback: remover tags técnicas
    return observacoes
      .replace(/\[FUNC:[^\]]+\]/g, "")
      .replace(/\[SERVICOS:.+?\]/g, "")
      .trim();
  } catch (error) {
    console.warn("JSON corrompido detectado, usando fallback:", error);

    // Fallback agressivo: extrair texto que não seja JSON
    try {
      // Tentar extrair apenas a parte de observações_usuario do JSON quebrado
      const observMatch = observacoes.match(
        /"observacoes_usuario":\s*"([^"]*)"/,
      );
      if (observMatch) {
        return observMatch[1] || "";
      }
    } catch (extractError) {
      console.warn("Falha no fallback de extração:", extractError);
    }

    // Último fallback: limpar tudo que pareça tag técnica
    return observacoes
      .replace(/\[FUNC:[^\]]+\]/g, "")
      .replace(/\[SERVICOS:.+?\]/g, "")
      .replace(/\{[^}]*\}/g, "") // Remover objetos JSON quebrados
      .replace(/\[[^\]]*\]/g, "") // Remover arrays quebrados
      .trim();
  }
}

// Tipos para compatibilidade
export interface AgendamentoLegacy {
  id: string;
  user_simple_id: string;
  cliente_id: string;
  servico_id: string;
  funcionario_id?: string | null;
  data_hora: Date;
  status: string;
  observacoes?: string;
  valor?: number;
  valor_total?: number;
  created_at: Date;
  updated_at: Date;
  cliente: {
    nome: string;
    telefone?: string;
    tipo_cliente?: string;
  };
  servico: {
    nome: string;
    preco: number;
    duracao_minutos?: number;
  };
  funcionario?: {
    id: string;
    nome: string;
    username?: string;
  } | null;
}

export interface AgendamentoModerno {
  id: string;
  user_simple_id: string;
  cliente_id: string;
  data_hora: Date;
  status: string;
  observacoes_usuario?: string;
  valor_total: number;
  created_at: Date;
  updated_at: Date;
  cliente: {
    nome: string;
    telefone?: string;
    tipo_cliente?: string;
  };
  servicos: Array<{
    id: string;
    servico: {
      nome: string;
      duracao_minutos?: number;
    };
    preco: number;
    funcionario_id?: string;
    funcionario?: {
      id: string;
      nome: string;
      username?: string;
    };
  }>;
  funcionario_id?: string;
  funcionario?: {
    id: string;
    nome: string;
    username?: string;
  } | null;
}

/**
 * Converte agendamento do formato legado para o formato moderno
 */
export async function adaptLegacyToModern(
  agendamentoLegacy: AgendamentoLegacy,
): Promise<AgendamentoModerno> {
  // Extrair funcionário das observações
  const funcionarioIdFromObs = extractFuncionarioFromObservacoesFallback(
    agendamentoLegacy.observacoes || "",
  );

  const funcionarioId =
    funcionarioIdFromObs || agendamentoLegacy.funcionario_id;

  // Não criar nome placeholder para evitar flicker; manter apenas o ID
  const funcionarioBasicoId = funcionarioId || null;

  // Criar serviço único no formato de array
  const servicos = [
    {
      id: agendamentoLegacy.servico_id || "servico-unico",
      servico: {
        nome: agendamentoLegacy.servico?.nome || "Serviço",
        duracao_minutos: agendamentoLegacy.servico?.duracao_minutos || 60,
      },
      preco: Number(
        agendamentoLegacy.servico?.preco || agendamentoLegacy.valor || 0,
      ),
      funcionario_id: funcionarioBasicoId || undefined,
      // Não definir objeto funcionario aqui para evitar nomes placeholders
    },
  ];

  // Extrair observações do usuário (sem tags de sistema)
  const observacoesUsuario = extractUserObservacoesFallback(
    agendamentoLegacy.observacoes || "",
  );

  // Debug das observações
  if (process.env.NODE_ENV === "development" && agendamentoLegacy.observacoes) {
    console.log(`🔍 Observações processadas para ${agendamentoLegacy.id}:`, {
      original: agendamentoLegacy.observacoes.substring(0, 100) + "...",
      processado: observacoesUsuario.substring(0, 100) + "...",
      temCodigo:
        agendamentoLegacy.observacoes.includes("[SERVICOS:") ||
        agendamentoLegacy.observacoes.includes('{"'),
    });
  }

  return {
    id: agendamentoLegacy.id,
    user_simple_id: agendamentoLegacy.user_simple_id,
    cliente_id: agendamentoLegacy.cliente_id,
    data_hora:
      agendamentoLegacy.data_hora instanceof Date
        ? agendamentoLegacy.data_hora
        : new Date(agendamentoLegacy.data_hora),
    status: agendamentoLegacy.status,
    observacoes_usuario: observacoesUsuario || undefined,
    valor_total: Number(
      agendamentoLegacy.valor_total || agendamentoLegacy.valor || 0,
    ),
    created_at:
      agendamentoLegacy.created_at instanceof Date
        ? agendamentoLegacy.created_at
        : new Date(agendamentoLegacy.created_at),
    updated_at:
      agendamentoLegacy.updated_at instanceof Date
        ? agendamentoLegacy.updated_at
        : new Date(agendamentoLegacy.updated_at),
    cliente: agendamentoLegacy.cliente,
    servicos,
    funcionario_id: funcionarioBasicoId || undefined,
    // Não definir objeto funcionario para evitar placeholder; será enriquecido depois
    funcionario: null,
  };
}

/**
 * Converte múltiplos agendamentos do formato legado para o moderno
 */
export async function adaptMultipleLegacyToModern(
  agendamentosLegacy: AgendamentoLegacy[],
): Promise<AgendamentoModerno[]> {
  if (import.meta.env.DEV) {
    console.log(
      `🔄 Adaptando ${agendamentosLegacy.length} agendamentos do formato legado para moderno...`,
    );
  }

  const agendamentosModernos: AgendamentoModerno[] = [];
  const BATCH_SIZE = 10; // Processar em lotes de 10

  for (let i = 0; i < agendamentosLegacy.length; i += BATCH_SIZE) {
    const batch = agendamentosLegacy.slice(i, i + BATCH_SIZE);
    if (import.meta.env.DEV) {
      console.log(
        `📦 Processando lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(agendamentosLegacy.length / BATCH_SIZE)}`,
      );
    }

    for (const agendamento of batch) {
      try {
        const agendamentoModerno = await adaptLegacyToModern(agendamento);
        agendamentosModernos.push(agendamentoModerno);
      } catch (error) {
        console.error(
          `❌ Erro ao adaptar agendamento ${agendamento?.id}:`,
          error,
        );

        // Tentar criar versão mínima funcional
        try {
          const agendamentoMinimo = createMinimalModernAgendamento(agendamento);
          agendamentosModernos.push(agendamentoMinimo);
          console.log(
            `🔧 Criada versão mínima para agendamento ${agendamento?.id}`,
          );
        } catch (minimalError) {
          console.error(
            `💥 Falha total ao adaptar agendamento ${agendamento?.id}:`,
            minimalError,
          );
          // Pular este agendamento
        }
      }
    }

    // Pequena pausa entre lotes para não sobrecarregar
    if (i + BATCH_SIZE < agendamentosLegacy.length) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  if (import.meta.env.DEV) {
    console.log(
      `✅ Adaptação concluída: ${agendamentosModernos.length} agendamentos convertidos de ${agendamentosLegacy.length} originais`,
    );
  }
  return agendamentosModernos;
}

/**
 * Cria uma versão mínima funcional de um agendamento moderno
 */
function createMinimalModernAgendamento(
  agendamentoLegacy: any,
): AgendamentoModerno {
  return {
    id: agendamentoLegacy?.id || `erro_${Date.now()}`,
    user_simple_id: agendamentoLegacy?.user_simple_id || "",
    cliente_id: agendamentoLegacy?.cliente_id || "",
    data_hora: agendamentoLegacy?.data_hora || new Date(),
    status: agendamentoLegacy?.status || "agendado",
    observacoes_usuario: agendamentoLegacy?.observacoes || "",
    valor_total:
      agendamentoLegacy?.valor_total || agendamentoLegacy?.valor || 0,
    created_at: agendamentoLegacy?.created_at || new Date(),
    updated_at: agendamentoLegacy?.updated_at || new Date(),
    cliente: {
      nome: agendamentoLegacy?.cliente?.nome || "Cliente não informado",
      telefone: agendamentoLegacy?.cliente?.telefone || "",
      tipo_cliente: agendamentoLegacy?.cliente?.tipo_cliente || "normal",
    },
    servicos: [
      {
        id: agendamentoLegacy?.servico_id || "servico-desconhecido",
        servico: {
          nome: agendamentoLegacy?.servico?.nome || "Serviço não especificado",
          duracao_minutos: agendamentoLegacy?.servico?.duracao_minutos || 60,
        },
        preco:
          agendamentoLegacy?.servico?.preco || agendamentoLegacy?.valor || 0,
      },
    ],
  };
}

/**
 * Verificar se um agendamento está no formato legado
 */
export function isLegacyFormat(
  agendamento: any,
): agendamento is AgendamentoLegacy {
  return (
    agendamento &&
    typeof agendamento.servico === "object" &&
    !Array.isArray(agendamento.servicos)
  );
}

/**
 * Verificar se um agendamento está no formato moderno
 */
export function isModernFormat(
  agendamento: any,
): agendamento is AgendamentoModerno {
  return (
    agendamento && Array.isArray(agendamento.servicos) && !agendamento.servico
  );
}

/**
 * Adaptar agendamento automaticamente baseado no formato
 */
export async function autoAdaptAgendamento(
  agendamento: any,
): Promise<AgendamentoModerno> {
  if (isModernFormat(agendamento)) {
    return agendamento;
  }

  if (isLegacyFormat(agendamento)) {
    return await adaptLegacyToModern(agendamento);
  }

  throw new Error("Formato de agendamento não reconhecido");
}

/**
 * Debug: Log da estrutura do agendamento
 */
export function debugAgendamento(
  agendamento: any,
  label: string = "Agendamento",
) {
  console.group(`🔍 ${label} Debug`);
  console.log("ID:", agendamento?.id);
  console.log("Tem servico (legado):", !!agendamento?.servico);
  console.log("Tem servicos (moderno):", !!agendamento?.servicos);
  console.log("Status:", agendamento?.status);
  console.log("Cliente:", agendamento?.cliente?.nome);

  if (agendamento?.servico) {
    console.log("Serviço (legado):", agendamento.servico);
  }

  if (agendamento?.servicos) {
    console.log("Serviços (moderno):", agendamento.servicos);
  }

  console.log("Funcionario_id:", agendamento?.funcionario_id);
  console.log("Observações:", agendamento?.observacoes);
  console.groupEnd();
}
