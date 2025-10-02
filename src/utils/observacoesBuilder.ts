/**
 * Utilitário para construir observações com dados técnicos
 * Evita problemas de formatação JSON
 */

import {
  addFuncionarioToObservacoes,
  extractFuncionarioFromObservacoes,
} from "@/services/funcionarioService";

// Função para estimar duração de serviço baseado no nome
const estimarDuracaoServico = (nomeServico: string): number => {
  const nome = nomeServico.toLowerCase();

  if (nome.includes('cutilação') || nome.includes('cuticula')) {
    if (nome.includes('pé') && nome.includes('mão')) return 60;
    return 30;
  }

  if (nome.includes('escova')) return 60;
  if (nome.includes('corte')) return 30;
  if (nome.includes('pintura') || nome.includes('coloração')) return 120;
  if (nome.includes('manicure') || nome.includes('pedicure')) return 45;

  return 60; // Duração padrão
};

export interface ServicoData {
  servico_id: string;
  funcionario_id?: string;
  preco: number;
  nome?: string;
  duracao_minutos?: number;
}

export interface ObservacoesData {
  servicos: ServicoData[];
  observacoes_usuario: string;
}

/**
 * Constrói observações com dados dos serviços de forma segura
 */
export function buildObservacoesWithServicos(
  observacoesUsuario: string,
  servicos: ServicoData[],
  funcionarioPrincipal?: string,
): string {
  try {
    // Criar estrutura de dados limpa
    const servicosData: ObservacoesData = {
      servicos: servicos.map((servico) => ({
        servico_id: servico.servico_id,
        funcionario_id: servico.funcionario_id || "",
        preco: Number(servico.preco) || 0,
        nome: servico.nome || "",
        duracao_minutos: servico.duracao_minutos || estimarDuracaoServico(servico.nome || ""),
      })),
      observacoes_usuario: observacoesUsuario.trim(),
    };

    // Converter para JSON de forma segura
    const jsonData = JSON.stringify(servicosData);

    // Construir observações
    let observacoesFinal = observacoesUsuario.trim();

    // Adicionar dados dos serviços
    observacoesFinal += `[SERVICOS:${jsonData}]`;

    // Adicionar funcionário principal se especificado
    if (funcionarioPrincipal) {
      observacoesFinal = addFuncionarioToObservacoes(
        observacoesFinal,
        funcionarioPrincipal,
      );
    }

    return observacoesFinal;
  } catch (error) {
    console.error("Erro ao construir observações:", error);
    // Fallback para observações simples
    return observacoesUsuario.trim();
  }
}

/**
 * Extrai observações do usuário de forma segura
 */
export function extractObservacoesUsuario(observacoes: string): string {
  if (!observacoes || typeof observacoes !== "string") {
    return "";
  }

  try {
    // Tentar extrair do JSON primeiro
    const match = observacoes.match(/\[SERVICOS:(.+?)\]/);
    if (match) {
      let jsonData = match[1];

      // Tentar corrigir JSON comum com problemas
      jsonData = jsonData
        .replace(/,\s*}]/g, "}]") // Remover vírgula antes de }]
        .replace(/,\s*}/g, "}") // Remover vírgula antes de }
        .replace(/"\s*}/g, '"}') // Corrigir aspas quebradas
        .replace(/"\s*]/g, '"]'); // Corrigir aspas em arrays

      const data = JSON.parse(jsonData) as ObservacoesData;
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

/**
 * Extrai dados dos serviços de forma segura
 */
export function extractServicosData(observacoes: string): ServicoData[] {
  if (!observacoes || typeof observacoes !== "string") {
    return [];
  }

  try {
    const match = observacoes.match(/\[SERVICOS:(.+?)\]/);
    if (match) {
      let jsonData = match[1];

      // Tentar corrigir JSON comum com problemas
      jsonData = jsonData
        .replace(/,\s*}]/g, "}]") // Remover vírgula antes de }]
        .replace(/,\s*}/g, "}") // Remover vírgula antes de }
        .replace(/"\s*}/g, '"}') // Corrigir aspas quebradas
        .replace(/"\s*]/g, '"]'); // Corrigir aspas em arrays

      const data = JSON.parse(jsonData) as ObservacoesData;
      return Array.isArray(data.servicos) ? data.servicos : [];
    }
    return [];
  } catch (error) {
    console.warn("JSON de serviços corrompido, tentando fallback:", error);

    // Fallback: tentar extrair informações básicas mesmo com JSON quebrado
    try {
      // Tentar encontrar padrões de serviços no texto
      const servicoMatches = observacoes.match(/"servico_id":\s*"([^"]*)"/g);
      const funcionarioMatches = observacoes.match(
        /"funcionario_id":\s*"([^"]*)"/g,
      );
      const precoMatches = observacoes.match(/"preco":\s*(\d+(?:\.\d+)?)/g);
      const nomeMatches = observacoes.match(/"nome":\s*"([^"]*)"/g);
      const duracaoMatches = observacoes.match(/"duracao_minutos":\s*(\d+)/g);

      if (servicoMatches) {
        const servicos: ServicoData[] = [];
        servicoMatches.forEach((match, index) => {
          const servicoId = match.match(/"servico_id":\s*"([^"]*)"/)?.[1];
          const funcionarioId = funcionarioMatches?.[index]?.match(
            /"funcionario_id":\s*"([^"]*)"/,
          )?.[1];
          const preco = precoMatches?.[index]?.match(/(\d+(?:\.\d+)?)/)?.[1];
          const nome = nomeMatches?.[index]?.match(/"nome":\s*"([^"]*)"/)?.[1];
          const duracaoMinutos = duracaoMatches?.[index]?.match(/(\d+)/)?.[1];

          if (servicoId) {
            servicos.push({
              servico_id: servicoId,
              funcionario_id: funcionarioId || "",
              preco: Number(preco) || 0,
              nome: nome || "Serviço",
              duracao_minutos: duracaoMinutos ? Number(duracaoMinutos) : undefined,
            });
          }
        });

        if (servicos.length > 0) {
          console.log(
            "✅ Recuperados",
            servicos.length,
            "serviços do JSON corrompido",
          );
          return servicos;
        }
      }
    } catch (fallbackError) {
      console.warn("Fallback de extração falhou:", fallbackError);
    }

    return [];
  }
}

/**
 * Extrai todos os funcionários únicos de um agendamento
 */
export function extractFuncionariosFromAgendamento(
  observacoes: string,
): string[] {
  const funcionarios = new Set<string>();

  // Extrair funcionário principal das observações
  const funcionarioPrincipal = extractFuncionarioFromObservacoes(observacoes);
  if (funcionarioPrincipal) {
    funcionarios.add(funcionarioPrincipal);
  }

  // Extrair funcionários dos serviços
  const servicosData = extractServicosData(observacoes);
  servicosData.forEach((servico) => {
    if (servico.funcionario_id) {
      funcionarios.add(servico.funcionario_id);
    }
  });

  return Array.from(funcionarios);
}

/**
 * Valida se observações contêm dados válidos
 */
export function validateObservacoes(observacoes: string): {
  valid: boolean;
  error?: string;
} {
  try {
    const match = observacoes.match(/\[SERVICOS:(.+?)\]/);
    if (match) {
      const data = JSON.parse(match[1]);

      // Validar estrutura básica
      if (!data.servicos || !Array.isArray(data.servicos)) {
        return { valid: false, error: "Estrutura de serviços inválida" };
      }

      // Validar se observacoes_usuario existe
      if (typeof data.observacoes_usuario !== "string") {
        return { valid: false, error: "observacoes_usuario deve ser string" };
      }
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `JSON inválido: ${error instanceof Error ? error.message : error}`,
    };
  }
}
