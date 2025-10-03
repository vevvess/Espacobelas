import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useAgendamentosRealTimeOptimized } from "./useAgendamentosRealTimeOptimized";
import { toast } from "@/hooks/use-toast";
import {
  listMovimentosManuais,
  createAtendimentoManual,
  createDespesaManual,
  deleteAtendimentoManual,
  deleteDespesaManual,
} from "@/services/caixaDbService";

interface MovimentoCaixa {
  id: string;
  tipo: "entrada" | "saida";
  descricao: string;
  valor: number;
  categoria: string;
  formaPagamento?: string;
  data: Date;
  observacoes: string;
  agendamentoId?: string;
  clienteNome?: string;
  profissional?: string;
}

interface AtendimentoDia {
  id: string;
  clienteNome: string;
  profissional: string;
  servicos: string[];
  horario: string;
  valor: number;
  formaPagamento: string;
  status: "pago" | "pendente";
  observacoes: string;
}

export function useCaixa(selectedDate?: Date) {
  const { user } = useAuth();
  const { agendamentos, formatCurrency, loading: agLoading } =
    useAgendamentosRealTimeOptimized();

  const [movimentos, setMovimentos] = useState<MovimentoCaixa[]>([]);
  const [atendimentos, setAtendimentos] = useState<AtendimentoDia[]>([]);
  const [processing, setProcessing] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saldoInicial, setSaldoInicial] = useState<number>(0);

  // Converter agendamentos em movimentos de caixa e atendimentos
  useEffect(() => {
    // Enquanto os agendamentos base ainda estão carregando, manter estado em processamento
    if (agLoading) {
      setProcessing(true);
      return;
    }

    // Quando terminar de carregar e não houver agendamentos, garantir estado consistente, sem "piscar"
    if (!agendamentos.length) {
      setAtendimentos([]);
      setMovimentos([]);
      setError(null);
      setProcessing(false);
      setInitialized(true);
      return;
    }

    const processAgendamentos = async () => {
      try {
        setProcessing(true);
        setError(null);

        // Converter agendamentos concluídos em atendimentos do dia selecionado
        const base = selectedDate || new Date();
        const inicioDia = new Date(
          base.getFullYear(),
          base.getMonth(),
          base.getDate(),
          0,
          0,
          0,
          0
        );
        const fimDia = new Date(
          base.getFullYear(),
          base.getMonth(),
          base.getDate(),
          23,
          59,
          59,
          999
        );

        const agendamentosDia = agendamentos.filter((agendamento) => {
          const dataAgendamento = new Date(agendamento.data_hora);
          return dataAgendamento >= inicioDia && dataAgendamento <= fimDia;
        });

        const atendimentosHoje: AtendimentoDia[] = agendamentosDia
          .filter((agendamento) => {
            if (agendamento.status !== "concluido") return false;
            return true;
          })
          .map((agendamento) => {
            const servicos =
              agendamento.servicos?.map((s) => s.servico?.nome || "Serviço") || [];
            const profissional =
              agendamento.servicos?.[0]?.funcionario?.nome || "Profissional";

            let valorTotal = 0;
            if (agendamento.servicos?.length > 0) {
              valorTotal = agendamento.servicos.reduce((total, s) => {
                const preco = Number(s.preco) || 0;
                return total + preco;
              }, 0);
            } else if (agendamento.valor) {
              valorTotal = Number(agendamento.valor) || 0;
            }

            const formaPagamento =
              agendamento.pagamentos?.[0]?.forma_pagamento || "dinheiro";

            const status =
              formaPagamento === "debito_mensal" ? "pendente" : "pago";

            return {
              id: agendamento.id,
              clienteNome: agendamento.cliente?.nome || "Cliente",
              profissional,
              servicos,
              horario: new Date(agendamento.data_hora).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              valor: valorTotal,
              formaPagamento,
              status: status as "pago" | "pendente",
              observacoes: agendamento.observacoes || "",
            };
          });

        setAtendimentos(atendimentosHoje);

        // Converter agendamentos concluídos em movimentos de entrada
        const movimentosFromAgendamentos: MovimentoCaixa[] = await Promise.all(
          agendamentosDia
            .filter((agendamento) => agendamento.status === "concluido")
            .map(async (agendamento) => {
              try {
                const { sql } = await import("@/lib/neon");
                const existsRes = await sql`
                  SELECT to_regclass('public.debitos_mensais') as reg
                `;
                const tableExists = Array.isArray(existsRes) && existsRes[0]?.reg;
                if (tableExists) {
                  const debitoMensal = await sql`
                    SELECT id FROM debitos_mensais
                    WHERE agendamento_id = ${agendamento.id}
                    LIMIT 1
                  `;
                  if (debitoMensal.length > 0) {
                    return null;
                  }
                }
              } catch (error) {
                console.warn(
                  "Aviso: não foi possível verificar débito mensal. Prosseguindo."
                );
              }

              const servicos =
                agendamento.servicos?.map((s) => s.servico?.nome || "Serviço") || [];

              let valorTotal = 0;
              if (agendamento.servicos?.length > 0) {
                valorTotal = agendamento.servicos.reduce((total, s) => {
                  const preco = Number(s.preco) || 0;
                  return total + preco;
                }, 0);
              } else if (agendamento.valor) {
                valorTotal = Number(agendamento.valor) || 0;
              }

              const profissional =
                agendamento.servicos?.[0]?.funcionario?.nome || "Profissional";
              const formaPagamento =
                agendamento.pagamentos?.[0]?.forma_pagamento || "dinheiro";

              return {
                id: `agendamento_${agendamento.id}`,
                tipo: "entrada" as const,
                descricao: `Atendimento: ${servicos.join(", ")}`,
                valor: valorTotal,
                categoria: "Atendimento",
                formaPagamento,
                data: new Date(agendamento.data_hora),
                observacoes: agendamento.observacoes || "",
                agendamentoId: agendamento.id,
                clienteNome: agendamento.cliente?.nome || "Cliente",
                profissional,
              };
            })
        )
          .then((movimentos) => (movimentos.filter((m) => m !== null) as MovimentoCaixa[]))
          .then((movimentos) =>
            movimentos.filter((movimento) => {
              return !isNaN(movimento.valor) && movimento.valor >= 0;
            })
          );

        // Carregar movimentos manuais do banco para o dia selecionado
        let manualMovs: MovimentoCaixa[] = [];
        try {
          if (user?.id) {
            const ymd = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(base.getDate()).padStart(2, "0")}`;
            const { atendimentos: atts, despesas: deps } = await listMovimentosManuais(user.id, ymd);

            const attsMovs: MovimentoCaixa[] = (atts || []).map((a) => {
              // servicos é JSON: tentar extrair string amigável
              let servicosStr = "";
              try {
                const arr = Array.isArray(a.servicos) ? a.servicos : JSON.parse(a.servicos || "[]");
                servicosStr = (arr || []).map((s: any) => s?.nome).filter(Boolean).join(" + ");
              } catch {
                servicosStr = "";
              }
              const prof = (() => {
                try {
                  const arr = Array.isArray(a.servicos) ? a.servicos : JSON.parse(a.servicos || "[]");
                  return arr?.[0]?.profissional || "";
                } catch {
                  return "";
                }
              })();

              return {
                id: `manual_db_att_${a.id}`,
                tipo: "entrada" as const,
                descricao: "Atendimento manual",
                valor: Number(a.valor) || 0,
                categoria: "Atendimento",
                formaPagamento: (a.pagamento || undefined) as any,
                data: new Date(a.created_at || base),
                observacoes: servicosStr,
                clienteNome: a.cliente || undefined,
                profissional: prof || undefined,
              };
            });

            const depMovs: MovimentoCaixa[] = (deps || []).map((d) => ({
              id: `manual_db_dep_${d.id}`,
              tipo: "saida",
              descricao: d.descricao || "Despesa",
              valor: Number(d.valor) || 0,
              categoria: "Despesas",
              data: new Date(d.created_at || base),
              observacoes: d.origem === "caixa" ? "Retirada do caixa" : "Outro",
            }));

            manualMovs = [...attsMovs, ...depMovs];
          }
        } catch (e) {
          console.warn("Falha ao carregar movimentos manuais do banco:", e);
        }

        // Combinar e ordenar por data/hora
        const allMovs = [...movimentosFromAgendamentos, ...manualMovs].sort(
          (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
        );

        setMovimentos(allMovs);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        toast({
          title: "Erro ao carregar dados do caixa",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setProcessing(false);
        setInitialized(true);
      }
    };

    processAgendamentos();
  }, [agendamentos, agLoading, selectedDate]);

  // Adicionar movimento manual
  const adicionarMovimentoManual = async (movimento: Omit<MovimentoCaixa, "id">) => {
    const valor = Number(movimento.valor) || 0;
    if (valor <= 0 || isNaN(valor)) {
      toast({
        title: "Erro",
        description: "Valor inválido para movimentação.",
        variant: "destructive",
      });
      throw new Error("Valor inválido");
    }

    let novoMovimento: MovimentoCaixa;

    // Persistência em banco (caixa_*), com fallback para estado local se falhar
    try {
      if (!user?.id) throw new Error("Usuário não autenticado");
      const base = selectedDate || new Date();
      const ymd = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(base.getDate()).padStart(2, "0")}`;

      if (movimento.tipo === "entrada" && movimento.categoria === "Atendimento") {
        const row = await createAtendimentoManual(user.id, ymd, {
          cliente: movimento.clienteNome,
          pagamento: movimento.formaPagamento,
          valor,
          servicos: [
            {
              nome: movimento.observacoes || "",
              valor,
              profissional: movimento.profissional || "",
            },
          ],
        });

        novoMovimento = {
          ...movimento,
          id: `manual_db_att_${row.id}`,
          data: new Date(row.created_at || base),
        };
      } else if (movimento.tipo === "saida") {
        const row = await createDespesaManual(user.id, ymd, {
          descricao: movimento.descricao,
          valor,
          origem: "caixa",
        });
        novoMovimento = {
          ...movimento,
          id: `manual_db_dep_${row.id}`,
          data: new Date(row.created_at || base),
        };
      } else {
        // Outras categorias de entrada: armazenar como atendimento manual genérico por enquanto
        const row = await createAtendimentoManual(user.id, ymd, {
          cliente: movimento.clienteNome,
          pagamento: movimento.formaPagamento,
          valor,
          servicos: [{ nome: movimento.observacoes || movimento.descricao || "", valor }],
        });
        novoMovimento = {
          ...movimento,
          id: `manual_db_att_${row.id}`,
          data: new Date(row.created_at || base),
        };
      }
    } catch (e) {
      console.warn("Falha ao persistir no banco; mantendo apenas em memória:", e);
      novoMovimento = {
        ...movimento,
        valor,
        id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    }

    setMovimentos((prev) => [novoMovimento!, ...prev]);

    toast({
      title: "Movimento adicionado",
      description: `${movimento.tipo === "entrada" ? "Entrada" : "Saída"} de ${formatCurrency(
        valor
      )} registrada.`,
    });

    return novoMovimento!;
  };

  const editarMovimentacao = async (
    movimentoId: string,
    dadosAtualizados: {
      descricao: string;
      valor: number;
      categoria: string;
      formaPagamento?: string;
      data: Date;
      observacoes: string;
    }
  ) => {
    try {
      setMovimentos((prev) =>
        prev.map((movimento) =>
          movimento.id === movimentoId
            ? {
                ...movimento,
                descricao: dadosAtualizados.descricao,
                valor: dadosAtualizados.valor,
                categoria: dadosAtualizados.categoria,
                formaPagamento: dadosAtualizados.formaPagamento,
                data: dadosAtualizados.data,
                observacoes: dadosAtualizados.observacoes,
              }
            : movimento
        )
      );

      const movimento = movimentos.find((m) => m.id === movimentoId);
      if (movimento?.agendamentoId) {
        toast({
          title: "Atenção",
          description:
            "Movimentação atualizada. Para aplicar mudanças no agendamento original, edite o agendamento diretamente na Agenda.",
          variant: "default",
        });
      }

      toast({
        title: "Movimentação atualizada",
        description: `${movimento?.tipo === "entrada" ? "Entrada" : "Saída"} de ${formatCurrency(
          dadosAtualizados.valor
        )} foi atualizada.`,
      });

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao atualizar movimentação";
      toast({
        title: "Erro ao atualizar",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const removerMovimento = async (id: string) => {
    // Remoção em banco quando aplicável
    try {
      if (id.startsWith("manual_db_att_") && user?.id) {
        const dbId = id.replace("manual_db_att_", "");
        await deleteAtendimentoManual(user.id, dbId);
      } else if (id.startsWith("manual_db_dep_") && user?.id) {
        const dbId = id.replace("manual_db_dep_", "");
        await deleteDespesaManual(user.id, dbId);
      }
    } catch (e) {
      console.warn("Não foi possível remover do banco; removendo localmente:", e);
    }

    if (id.startsWith("manual_") || id.startsWith("manual_db_")) {
      setMovimentos((prev) => prev.filter((m) => m.id !== id));
      toast({
        title: "Movimento removido",
        description: "Movimento removido com sucesso.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Não é possível remover movimentos de agendamentos.",
        variant: "destructive",
      });
    }
  };

  const calcularTotais = (dataInicio?: Date, dataFim?: Date) => {
    let movimentosFiltrados = movimentos;

    if (dataInicio && dataFim) {
      movimentosFiltrados = movimentos.filter((m) => {
        const dataMovimento = new Date(m.data);
        return dataMovimento >= dataInicio && dataMovimento <= dataFim;
      });
    }

    const entradas = movimentosFiltrados
      .filter((m) => m.tipo === "entrada")
      .reduce((total, m) => total + m.valor, 0);

    const saidas = movimentosFiltrados
      .filter((m) => m.tipo === "saida")
      .reduce((total, m) => total + m.valor, 0);

    return {
      entradas,
      saidas,
      saldo: entradas - saidas,
      totalMovimentos: movimentosFiltrados.length,
    };
  };

  const getMovimentosPorPeriodo = (dataInicio: Date, dataFim: Date) => {
    return movimentos
      .filter((movimento) => {
        const dataMovimento = new Date(movimento.data);
        return dataMovimento >= dataInicio && dataMovimento <= dataFim;
      })
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  };

  const totalEntradas = movimentos
    .filter((m) => m.tipo === "entrada")
    .reduce((total, m) => {
      const valor = Number(m.valor) || 0;
      if (isNaN(valor)) {
        console.warn("Valor NaN encontrado em entrada:", m);
        return total;
      }
      return total + valor;
    }, 0);

  const totalSaidas = movimentos
    .filter((m) => m.tipo === "saida")
    .reduce((total, m) => {
      const valor = Number(m.valor) || 0;
      if (isNaN(valor)) {
        console.warn("Valor NaN encontrado em saída:", m);
        return total;
      }
      return total + valor;
    }, 0);

  const saldoFinal = (Number(saldoInicial) || 0) + totalEntradas - totalSaidas;

  if (isNaN(totalEntradas) || isNaN(totalSaidas)) {
    console.error("Valores NaN detectados:", {
      totalEntradas,
      totalSaidas,
      saldoInicial,
      movimentos: movimentos.map((m) => ({ id: m.id, valor: m.valor, tipo: m.tipo })),
    });
  }

  // Resumo diário para uma data
  const getResumoDiario = (data: Date) => {
    const y = data.getFullYear();
    const m = data.getMonth();
    const d = data.getDate();

    const isSameDay = (dt: Date) =>
      dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;

    const movimentosDia = movimentos.filter((m) => isSameDay(new Date(m.data)));

    const entradasDinheiro = movimentosDia
      .filter((m) => m.tipo === "entrada" && m.formaPagamento === "dinheiro")
      .reduce((sum, m) => sum + (Number(m.valor) || 0), 0);

    const entradasPix = movimentosDia
      .filter((m) => m.tipo === "entrada" && m.formaPagamento === "pix")
      .reduce((sum, m) => sum + (Number(m.valor) || 0), 0);

    const entradasCartao = movimentosDia
      .filter(
        (m) =>
          m.tipo === "entrada" &&
          (m.formaPagamento === "cartao_debito" || m.formaPagamento === "cartao_credito")
      )
      .reduce((sum, m) => sum + (Number(m.valor) || 0), 0);

    const despesas = movimentosDia
      .filter((m) => m.tipo === "saida")
      .reduce((sum, m) => sum + (Number(m.valor) || 0), 0);

    // Débitos não pagos vindos de atendimentos do dia
    const debitos = atendimentos
      .filter((a) => isSameDay(new Date(baseDateForString(a.horario, data))))
      .filter((a) => a.status === "pendente")
      .reduce((sum, a) => sum + (Number(a.valor) || 0), 0);

    const totalEntradas = entradasDinheiro + entradasPix + entradasCartao;
    const dinheiroCalculado = entradasDinheiro - despesas;

    return {
      totalEntradas,
      entradasPix,
      entradasCartao,
      entradasDinheiro,
      debitos,
      despesas,
      dinheiroCalculado,
    };
  };

  // Utilitário: construir Date usando horário string do atendimento em uma data base
  const baseDateForString = (timeStr: string, base: Date) => {
    // timeStr esperado: "HH:MM" no locale pt-BR
    const match = timeStr.match(/(\d{2}):(\d{2})/);
    const dt = new Date(base);
    if (match) {
      dt.setHours(parseInt(match[1], 10), parseInt(match[2], 10), 0, 0);
    }
    return dt;
  };

  const reload = () => {
    // Dados recarregam automaticamente via useEffect quando agendamentos mudam
  };

  return {
    movimentos,
    atendimentos,
    loading: (agLoading || processing) && !initialized,
    error,
    saldoInicial,
    totalEntradas,
    totalSaidas,
    saldoFinal,
    adicionarMovimentoManual,
    editarMovimentacao,
    removerMovimento,
    setSaldoInicial,
    formatCurrency,
    calcularTotais,
    getMovimentosPorPeriodo,
    getResumoDiario,
    reload,
  };
}
