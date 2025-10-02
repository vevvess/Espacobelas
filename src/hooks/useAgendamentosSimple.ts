import { useState, useEffect, useCallback } from "react";
const __DEV__ = import.meta.env.MODE !== "production";
const log = (...args: any[]) => {
  if (__DEV__) console.log(...args);
};
import { useAuth } from "@/contexts/SimpleAuthContext";
import { toast } from "@/hooks/use-toast";
import { getAgendamentosWithFuncionario } from "@/services/agendamentoServiceImproved";
import {
  createAgendamento as createAgendamentoDB,
  updateAgendamento as updateAgendamentoDB,
  deleteAgendamento as deleteAgendamentoDB,
} from "@/services/database";
import {
  adaptMultipleLegacyToModern,
  debugAgendamento,
  type AgendamentoModerno,
} from "@/lib/agendamentoAdapter";
import { dataCache } from "@/lib/dataCache";

// Função para calcular duração total dos serviços
const calcularDuracaoTotal = (agendamento: AgendamentoModerno): number => {
  let duracaoTotal = 0;

  if (agendamento.servicos && agendamento.servicos.length > 0) {
    agendamento.servicos.forEach((servico) => {
      if (servico.servico?.duracao_minutos) {
        duracaoTotal += servico.servico.duracao_minutos;
      }
    });
  }

  return duracaoTotal > 0 ? duracaoTotal : 60; // Padrão 60 minutos
};

// Função para determinar status automático baseado no horário
const getStatusAutomatico = (agendamento: AgendamentoModerno): string => {
  const agora = new Date();
  const dataHoraInicio = new Date(agendamento.data_hora);

  // Se já está concluído ou cancelado, manter status
  if (
    agendamento.status === "concluido" ||
    agendamento.status === "cancelado"
  ) {
    return agendamento.status;
  }

  // Se já está aguardando confirmação/pagamento, manter até admin confirmar
  if (
    agendamento.status === "aguardando_confirmacao" ||
    agendamento.status === "aguardando_confirmacao_pagamento" ||
    agendamento.status === "aguardando_pagamento"
  ) {
    return agendamento.status;
  }

  // Calcular duração total e horário de fim
  const duracaoMinutos = calcularDuracaoTotal(agendamento);
  const dataHoraFim = new Date(
    dataHoraInicio.getTime() + duracaoMinutos * 60 * 1000,
  );

  // Lógica de status automático:
  // Antes do horário = manter status original
  // No horário até fim = "em_andamento"
  // Após o fim = "aguardando_confirmacao_pagamento"

  if (agora < dataHoraInicio) {
    // Antes do horário - manter status original se for agendado/confirmado
    return ["agendado", "confirmado"].includes(agendamento.status)
      ? agendamento.status
      : "agendado";
  } else if (agora >= dataHoraInicio && agora <= dataHoraFim) {
    // Durante o horário - em andamento
    return "em_andamento";
  } else {
    // Após o horário - mover para aguardando confirmação de pagamento
    return "aguardando_confirmacao_pagamento";
  }
};

export function useAgendamentosSimple(dataInicio?: Date, dataFim?: Date) {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState<AgendamentoModerno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    AgendamentoModerno[]
  >([]);
  const [isOnline, setIsOnline] = useState(true);
  const [lastDateRange, setLastDateRange] = useState<string>("");
  const [isChangingDate, setIsChangingDate] = useState(false);
  const [agendamentosCache, setAgendamentosCache] = useState<
    Map<string, AgendamentoModerno[]>
  >(new Map());
  const [loadingCache, setLoadingCache] = useState<Set<string>>(new Set());
  const [usingCachedData, setUsingCachedData] = useState(false);

  // Função para carregar agendamentos
  const loadAgendamentos = useCallback(
    async (isDateChange = false) => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      // Gerar key para cache baseado no range de datas
      const currentDateRange = `${dataInicio?.toISOString() || "none"}-${dataFim?.toISOString() || "none"}`;
      const sharedCacheKey = `agendamentos:${user.id}:${currentDateRange}`;

      // Verificar se já temos dados em cache (interno e compartilhado)
      const cachedData = agendamentosCache.get(currentDateRange);
      const sharedCached = dataCache.get<AgendamentoModerno[]>(sharedCacheKey);

      // Se é mudança de data, detectar e otimizar
      let usedInstant = false;
      if (isDateChange || currentDateRange !== lastDateRange) {
        setIsChangingDate(true);
        setLastDateRange(currentDateRange);
        log("📅 Mudança de data detectada:", currentDateRange);

        // Se tem cache, usar imediatamente para resposta instantânea
        const instant =
          cachedData && cachedData.length > 0 ? cachedData : sharedCached;
        if (instant && instant.length > 0) {
          log("⚡ Usando dados do cache para resposta instantânea");
          setAgendamentos(instant);
          setIsChangingDate(false);
          setLoading(false);
          setUsingCachedData(true);
          usedInstant = true;
          // Continuar carregando em background para refresh
        } else {
          setUsingCachedData(false);
        }
      }

      // Se já está carregando esta data range, evitar duplicação
      if (loadingCache.has(currentDateRange)) {
        log("🔄 Já carregando esta data range, evitando duplicação");
        return;
      }

      try {
        setError(null);

        // Marcar como carregando no cache
        setLoadingCache((prev) => new Set(prev).add(currentDateRange));

        // Apenas mostrar loading se não há dados ou é primeira carga (sem cache)
        if (
          (agendamentos.length === 0 || isDateChange) &&
          !cachedData &&
          !sharedCached
        ) {
          setLoading(true);
        }

        log("🔄 Carregando agendamentos (sempre online)...", {
          userId: user.id,
          dataInicio,
          dataFim,
          isDateChange,
          dateRange: currentDateRange,
        });

        const dadosOnline = await getAgendamentosWithFuncionario(
          user.id,
          dataInicio,
          dataFim,
        );

        log("📋 Dados recebidos (sempre online):", dadosOnline.length);

        // Adaptar dados para formato moderno
        const dadosModernos = await adaptMultipleLegacyToModern(dadosOnline);

        log("✅ Agendamentos adaptados:", dadosModernos.length);

        // Aplicar status automático baseado no horário
        const agendamentosComStatusAutomatico = dadosModernos.map(
          (agendamento) => {
            const statusOriginal = agendamento.status;
            const statusAutomatico = getStatusAutomatico(agendamento);

            // Se o status mudou, atualizar no banco automaticamente
            if (statusOriginal !== statusAutomatico) {
              const agora = new Date();
              const dataHora = new Date(agendamento.data_hora);
              const duracaoMinutos = calcularDuracaoTotal(agendamento);

              log(
                `🔄 Status automático: ${agendamento.id} ${statusOriginal} → ${statusAutomatico}`,
              );
              log(`   📅 Agora: ${agora.toLocaleTimeString()}`);
              log(`   ⏰ Agendamento: ${dataHora.toLocaleTimeString()}`);
              log(`   ⏱️ Duração: ${duracaoMinutos} minutos`);

              // Atualizar no banco de forma assíncrona (sem bloquear)
              updateAgendamentoDB(agendamento.id, user.id, {
                status: statusAutomatico,
              }).catch((error) => {
                console.warn("⚠️ Erro ao atualizar status automático:", error);
              });
            }

            return {
              ...agendamento,
              status: statusAutomatico,
            };
          },
        );

        // Exibir imediatamente antes do enriquecimento para sensação de rapidez
        // Evitar regressão visual se já mostramos dados em cache (com nomes reais)
        if (!usedInstant) {
          setAgendamentos(agendamentosComStatusAutomatico);
          setLoading(false);
        } else {
          // Já tínhamos dados na tela; apenas atualizar cache compartilhado
          setLoading(false);
        }
        dataCache.set(
          sharedCacheKey,
          agendamentosComStatusAutomatico,
          2 * 60 * 1000,
        );

        // Enriquecer com nomes reais dos funcionários em background
        let agendamentosEnriquecidos = agendamentosComStatusAutomatico;
        try {
          const { getFuncionariosByIds } = await import(
            "@/services/funcionarioService"
          );
          const ids = new Set<string>();
          agendamentosComStatusAutomatico.forEach((a) => {
            if (a.funcionario_id) ids.add(a.funcionario_id);
            a.servicos?.forEach((s) => {
              if (s.funcionario_id) ids.add(s.funcionario_id);
            });
          });
          const idList = Array.from(ids);
          if (idList.length > 0) {
            const funcionarios = await getFuncionariosByIds(idList);
            const map = new Map(funcionarios.map((f) => [f.id, f]));
            agendamentosEnriquecidos = agendamentosComStatusAutomatico.map(
              (a) => ({
                ...a,
                funcionario:
                  a.funcionario_id && map.get(a.funcionario_id)
                    ? {
                        id: a.funcionario_id,
                        nome: map.get(a.funcionario_id)!.nome,
                        username: map.get(a.funcionario_id)!.username,
                      }
                    : a.funcionario || null,
                servicos:
                  a.servicos?.map((s) => ({
                    ...s,
                    funcionario:
                      s.funcionario_id && map.get(s.funcionario_id)
                        ? {
                            id: s.funcionario_id,
                            nome: map.get(s.funcionario_id)!.nome,
                            username: map.get(s.funcionario_id)!.username,
                          }
                        : s.funcionario,
                  })) || a.servicos,
              }),
            );
          }
        } catch (e) {
          log("⚠️ Falha ao enriquecer funcionários, mantendo placeholders");
        }

        // Debug do primeiro agendamento adaptado se existir
        if (agendamentosEnriquecidos.length > 0) {
          if (__DEV__)
            debugAgendamento(
              agendamentosEnriquecidos[0],
              "Primeiro agendamento (com status automático)",
            );
        }

        // Atualizar estado e caches com enriquecidos
        setAgendamentos(agendamentosEnriquecidos);
        dataCache.set(sharedCacheKey, agendamentosEnriquecidos, 2 * 60 * 1000);

        // Salvar no cache interno para próximas consultas
        setAgendamentosCache((prev) => {
          const newCache = new Map(prev);
          newCache.set(currentDateRange, agendamentosEnriquecidos);
          if (newCache.size > 10) {
            const firstKey = newCache.keys().next().value;
            newCache.delete(firstKey);
          }
          return newCache;
        });

        // Sinalizar que terminou a mudança de data
        if (isChangingDate) {
          setIsChangingDate(false);
        }

        // Pré-carregar datas próximas em background
        setTimeout(() => {
          preloadNearbyDates();
        }, 100);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao carregar agendamentos";

        // Log detalhado do erro
        console.error("❌ Erro ao carregar agendamentos:", {
          error: errorMessage,
          type: err?.constructor?.name || typeof err,
          stack: err?.stack?.split("\n")[0] || "No stack",
          userId: user?.id,
          dataInicio: dataInicio?.toISOString(),
          dataFim: dataFim?.toISOString(),
          navigatorOnline: navigator.onLine,
          timestamp: new Date().toISOString(),
        });

        // Determinar tipo de erro para mensagem mais clara
        let userFriendlyMessage = errorMessage;

        if (
          errorMessage.includes("Failed to fetch") ||
          errorMessage.includes("fetch")
        ) {
          userFriendlyMessage =
            "Problema de conectividade. Verifique sua internet e tente novamente.";
        } else if (errorMessage.includes("timeout")) {
          userFriendlyMessage = "Conexão muito lenta. Tentando novamente...";
        } else if (errorMessage.includes("Usuário não encontrado")) {
          userFriendlyMessage = "Erro de autenticação. Faça login novamente.";
        }

        setError(userFriendlyMessage);
      } finally {
        setLoading(false);
        setIsChangingDate(false);

        // Remover do cache de loading
        setLoadingCache((prev) => {
          const newSet = new Set(prev);
          newSet.delete(currentDateRange);
          return newSet;
        });
      }
    },
    [
      user?.id,
      dataInicio,
      dataFim,
      lastDateRange,
      agendamentosCache,
      loadingCache,
      agendamentos.length,
    ],
  );

  // Função para pré-carregar datas próximas (dia anterior e próximo)
  const preloadNearbyDates = useCallback(async () => {
    if (!user?.id || !dataInicio || !dataFim) return;

    const dayInMs = 24 * 60 * 60 * 1000;

    // Calcular datas próximas
    const previousStart = new Date(dataInicio.getTime() - dayInMs);
    const previousEnd = new Date(dataFim.getTime() - dayInMs);
    const nextStart = new Date(dataInicio.getTime() + dayInMs);
    const nextEnd = new Date(dataFim.getTime() + dayInMs);

    const previousDateRange = `${previousStart.toISOString()}-${previousEnd.toISOString()}`;
    const nextDateRange = `${nextStart.toISOString()}-${nextEnd.toISOString()}`;

    // Pré-carregar apenas se não estão em cache e não estão sendo carregadas
    const rangesToPreload = [
      { range: previousDateRange, start: previousStart, end: previousEnd },
      { range: nextDateRange, start: nextStart, end: nextEnd },
    ].filter(
      ({ range }) => !agendamentosCache.has(range) && !loadingCache.has(range),
    );

    for (const { range, start, end } of rangesToPreload) {
      try {
        log("🔮 Pré-carregando data:", range);
        setLoadingCache((prev) => new Set(prev).add(range));

        const dadosOnline = await getAgendamentosWithFuncionario(
          user.id,
          start,
          end,
        );
        const dadosModernos = await adaptMultipleLegacyToModern(dadosOnline);

        // Aplicar status automático
        const agendamentosComStatusAutomatico = dadosModernos.map(
          (agendamento) => ({
            ...agendamento,
            status: getStatusAutomatico(agendamento),
          }),
        );

        // Enriquecer funcionários também no preload
        let enriched = agendamentosComStatusAutomatico;
        try {
          const { getFuncionariosByIds } = await import(
            "@/services/funcionarioService"
          );
          const ids = new Set<string>();
          agendamentosComStatusAutomatico.forEach((a) => {
            if (a.funcionario_id) ids.add(a.funcionario_id);
            a.servicos?.forEach((s) => {
              if (s.funcionario_id) ids.add(s.funcionario_id);
            });
          });
          const idList = Array.from(ids);
          if (idList.length > 0) {
            const funcionarios = await getFuncionariosByIds(idList);
            const map = new Map(funcionarios.map((f) => [f.id, f]));
            enriched = agendamentosComStatusAutomatico.map((a) => ({
              ...a,
              funcionario:
                a.funcionario_id && map.get(a.funcionario_id)
                  ? {
                      id: a.funcionario_id,
                      nome: map.get(a.funcionario_id)!.nome,
                      username: map.get(a.funcionario_id)!.username,
                    }
                  : a.funcionario || null,
              servicos:
                a.servicos?.map((s) => ({
                  ...s,
                  funcionario:
                    s.funcionario_id && map.get(s.funcionario_id)
                      ? {
                          id: s.funcionario_id,
                          nome: map.get(s.funcionario_id)!.nome,
                          username: map.get(s.funcionario_id)!.username,
                        }
                      : s.funcionario,
                })) || a.servicos,
            }));
          }
        } catch {}

        // Salvar no cache interno e compartilhado
        setAgendamentosCache((prev) => {
          const newCache = new Map(prev);
          newCache.set(range, enriched);
          return newCache;
        });
        const sharedKey = `agendamentos:${user.id}:${range}`;
        dataCache.set(sharedKey, enriched, 2 * 60 * 1000);

        log(`✅ Pré-carregamento concluído: ${enriched.length} agendamentos`);
      } catch (error) {
        console.warn("⚠️ Erro no pré-carregamento:", error);
      } finally {
        setLoadingCache((prev) => {
          const newSet = new Set(prev);
          newSet.delete(range);
          return newSet;
        });
      }
    }
  }, [user?.id, dataInicio, dataFim, agendamentosCache, loadingCache]);

  // Monitorar conectividade, visibilidade e eventos globais de agendamento
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      log("🟢 Conectividade restaurada - recarregando dados");
      loadAgendamentos(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      log("🔴 Conectividade perdida - modo offline");
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        log("👀 Aba visível - reconciliação e recarrega dados");
        loadAgendamentos(false);
      }
    };

    let refreshTimer: number | undefined;
    const handleAgendamentoChanged = () => {
      if (refreshTimer) window.clearTimeout(refreshTimer);
      // Debounce 2s para consolidar múltiplos eventos
      refreshTimer = window.setTimeout(() => {
        log("🔔 Evento de agendamento detectado - atualizando lista");
        loadAgendamentos(false);
      }, 2000);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener(
      "agendamento-changed",
      handleAgendamentoChanged as any,
    );

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener(
        "agendamento-changed",
        handleAgendamentoChanged as any,
      );
      if (refreshTimer) window.clearTimeout(refreshTimer);
    };
  }, [loadAgendamentos]);

  // Carregar dados inicialmente e quando o range de datas mudar (sem polling)
  useEffect(() => {
    if (!user?.id) return;
    loadAgendamentos(true);
  }, [user?.id, loadAgendamentos, dataInicio?.getTime(), dataFim?.getTime()]);

  // Atualização de status automático dirigida por eventos/horários (com reconciliação leve)
  useEffect(() => {
    const lastWriteRef = new Map<string, number>();
    const timers = new Map<string, number>();

    const clearAll = () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
    };

    const applyStatusIfNeeded = (a: AgendamentoModerno) => {
      const novo = getStatusAutomatico(a);
      if (novo !== a.status) {
        const now = Date.now();
        const last = lastWriteRef.get(a.id) || 0;
        const canWrite = now - last > 10 * 60 * 1000;
        if (user?.id && canWrite) {
          lastWriteRef.set(a.id, now);
          updateAgendamentoDB(a.id, user.id, { status: novo }).catch((err) => {
            console.warn("⚠️ Falha ao salvar status automático:", err);
          });
        }
        return { ...a, status: novo } as AgendamentoModerno;
      }
      return a;
    };

    const scheduleFor = (agendamento: AgendamentoModerno) => {
      const agora = new Date();
      const inicio = new Date(agendamento.data_hora);
      const duracao = calcularDuracaoTotal(agendamento);
      const fim = new Date(inicio.getTime() + duracao * 60 * 1000);

      let nextTick: Date | null = null;
      if (agora < inicio)
        nextTick = inicio; // disparar no início
      else if (agora >= inicio && agora < fim)
        nextTick = fim; // disparar no fim
      else nextTick = null; // passado, nada a fazer

      // Limpar timer anterior
      const existing = timers.get(agendamento.id);
      if (existing) window.clearTimeout(existing);

      if (!nextTick) return;
      const delay = Math.max(0, nextTick.getTime() - agora.getTime());

      const handleTick = () => {
        setAgendamentos((prev) => {
          let changed = false;
          const updated = prev.map((a) => {
            if (a.id !== agendamento.id) return a;
            const applied = applyStatusIfNeeded(a);
            if (applied !== a) changed = true;
            return applied;
          });
          // Reagendar próximo tick (do início para fim, por exemplo)
          const alvo = updated.find((x) => x.id === agendamento.id)!;
          scheduleFor(alvo);
          return changed ? updated : prev;
        });
      };

      const timeoutId = window.setTimeout(handleTick, delay);
      timers.set(agendamento.id, timeoutId);
    };

    // Agendar apenas para itens próximos para evitar muitos timers
    const now = Date.now();
    const AHEAD_LIMIT = 24 * 60 * 60 * 1000; // 24h
    const REAR_LIMIT = 24 * 60 * 60 * 1000; // 24h passadas
    const relevantes = agendamentos
      .filter((a) => {
        const inicio = new Date(a.data_hora).getTime();
        const fim = inicio + calcularDuracaoTotal(a) * 60 * 1000;
        return inicio - now <= AHEAD_LIMIT && fim >= now - REAR_LIMIT;
      })
      .slice(0, 100);

    relevantes.forEach(scheduleFor);

    // Reconciliação leve a cada 60s para recuperar ticks perdidos (ex.: aba em background)
    const reconcileInterval = window.setInterval(() => {
      setAgendamentos((prev) => prev.map(applyStatusIfNeeded));
    }, 60_000);

    return () => {
      clearAll();
      window.clearInterval(reconcileInterval);
    };
  }, [agendamentos, user?.id]);

  // Criar agendamento com update otimista
  const createAgendamento = useCallback(
    async (agendamentoData: any) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      // Normalizar dados vindos do Modal (suporta múltiplos serviços)
      const hasServicosArray =
        Array.isArray(agendamentoData?.servicos) &&
        agendamentoData.servicos.length > 0;
      const primaryServicoId = hasServicosArray
        ? agendamentoData.servicos[0].servico_id
        : agendamentoData.servico_id;
      const valorTotal = hasServicosArray
        ? agendamentoData.servicos.reduce(
            (sum: number, s: any) => sum + (Number(s.preco) || 0),
            0,
          )
        : Number(agendamentoData.valor) || 0;
      const funcionarioPrincipal = hasServicosArray
        ? agendamentoData.servicos.find((s: any) => s.funcionario_id)
            ?.funcionario_id || ""
        : agendamentoData.funcionario_id || "";

      // Construir observações com dados dos serviços e tag de funcionário
      let observacoesFinal = agendamentoData.observacoes || "";
      try {
        const { buildObservacoesWithServicos } = await import(
          "@/utils/observacoesBuilder"
        );
        if (hasServicosArray) {
          observacoesFinal = buildObservacoesWithServicos(
            agendamentoData.observacoes || "",
            agendamentoData.servicos,
            funcionarioPrincipal,
          );
        } else if (funcionarioPrincipal) {
          const { addFuncionarioToObservacoes } = await import(
            "@/services/funcionarioService"
          );
          observacoesFinal = addFuncionarioToObservacoes(
            observacoesFinal,
            funcionarioPrincipal,
          );
        }
      } catch (e) {
        // Se utilitários falharem, seguir com observações simples
        log(
          "⚠️ Falha ao montar observações enriquecidas, usando texto simples",
        );
      }

      try {
        log("📝 Criando agendamento (normalizado)...", {
          ...agendamentoData,
          servico_id: primaryServicoId,
          valor: valorTotal,
        });

        // Update otimista em formato moderno
        const tempId = `temp_${Date.now()}`;
        const optimisticAgendamento: AgendamentoModerno = {
          id: tempId,
          user_simple_id: user.id,
          cliente_id: agendamentoData.cliente_id,
          data_hora: agendamentoData.data_hora,
          status: agendamentoData.status || "agendado",
          observacoes_usuario: agendamentoData.observacoes,
          valor_total: valorTotal,
          created_at: new Date(),
          updated_at: new Date(),
          cliente: {
            nome: "Carregando...",
            telefone: "",
            tipo_cliente: "normal",
          },
          servicos: hasServicosArray
            ? agendamentoData.servicos.map((s: any) => ({
                id: s.servico_id,
                servico: {
                  nome: s.nome || "Serviço",
                  duracao_minutos: s.duracao_minutos || 60,
                },
                preco: Number(s.preco) || 0,
                funcionario_id: s.funcionario_id || undefined,
              }))
            : [
                {
                  id: primaryServicoId,
                  servico: { nome: "Serviço", duracao_minutos: 60 },
                  preco: valorTotal,
                  funcionario_id: funcionarioPrincipal || undefined,
                },
              ],
        };

        setOptimisticUpdates((prev) => [...prev, optimisticAgendamento]);

        // Criar no banco usando formato legado compatível
        const payload = {
          cliente_id: agendamentoData.cliente_id,
          servico_id: primaryServicoId,
          data_hora: agendamentoData.data_hora,
          observacoes: observacoesFinal,
          valor: valorTotal,
        };

        const novoAgendamento = await createAgendamentoDB(user.id, payload);

        // Remover update otimista e recarregar dados
        setOptimisticUpdates((prev) => prev.filter((a) => a.id !== tempId));
        await loadAgendamentos();

        log("✅ Agendamento criado:", novoAgendamento.id);

        toast({
          title: "Sucesso",
          description: "Agendamento criado com sucesso",
        });

        return novoAgendamento;
      } catch (error) {
        // Remover update otimista
        setOptimisticUpdates((prev) => prev.filter((a) => a.id !== tempId));

        const errorMessage =
          error instanceof Error ? error.message : "Erro ao criar agendamento";
        console.error("❌ Erro ao criar agendamento:", errorMessage);

        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });

        throw error;
      }
    },
    [user?.id, loadAgendamentos],
  );

  // Atualizar agendamento
  const updateAgendamento = useCallback(
    async (agendamentoId: string, updates: any) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      // Normalizar possíveis dados de serviços/funcionário vindos do Modal
      let normalized = { ...updates };
      const hasServicosArray =
        Array.isArray(updates?.servicos) && updates.servicos.length > 0;

      if (hasServicosArray) {
        const primaryServicoId = updates.servicos[0].servico_id;
        const valorTotal = updates.servicos.reduce(
          (sum: number, s: any) => sum + (Number(s.preco) || 0),
          0,
        );
        const funcionarioPrincipal =
          updates.servicos.find((s: any) => s.funcionario_id)?.funcionario_id ||
          updates.funcionario_id;

        try {
          const { buildObservacoesWithServicos } = await import(
            "@/utils/observacoesBuilder"
          );
          normalized.observacoes = buildObservacoesWithServicos(
            updates.observacoes || "",
            updates.servicos,
            funcionarioPrincipal,
          );
        } catch {
          // fallback: manter observações como estão
        }

        normalized.servico_id = primaryServicoId;
        if (valorTotal && !normalized.valor) normalized.valor = valorTotal;

        // Remover campo não suportado no backend
        delete normalized.servicos;
      } else if (updates.funcionario_id && !updates.observacoes) {
        // Se só veio funcionário, adicionar tag às observações existentes vazias
        try {
          const { addFuncionarioToObservacoes } = await import(
            "@/services/funcionarioService"
          );
          normalized.observacoes = addFuncionarioToObservacoes(
            "",
            updates.funcionario_id,
          );
        } catch {}
      }

      try {
        log("📝 Atualizando agendamento...", agendamentoId, normalized);

        await updateAgendamentoDB(agendamentoId, user.id, normalized);
        await loadAgendamentos(); // Recarregar dados

        log("✅ Agendamento atualizado:", agendamentoId);

        toast({
          title: "Sucesso",
          description: "Agendamento atualizado com sucesso",
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erro ao atualizar agendamento";
        console.error("❌ Erro ao atualizar agendamento:", errorMessage);

        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });

        throw error;
      }
    },
    [user?.id, loadAgendamentos],
  );

  // Deletar agendamento
  const deleteAgendamento = useCallback(
    async (agendamentoId: string) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      try {
        log("🗑️ Deletando agendamento...", agendamentoId);

        await deleteAgendamentoDB(agendamentoId, user.id);
        await loadAgendamentos(); // Recarregar dados

        log("✅ Agendamento deletado:", agendamentoId);

        toast({
          title: "Sucesso",
          description: "Agendamento removido com sucesso",
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erro ao remover agendamento";
        console.error("❌ Erro ao remover agendamento:", errorMessage);

        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });

        throw error;
      }
    },
    [user?.id, loadAgendamentos],
  );

  // Combinar dados reais com updates otimistas
  const finalAgendamentos = [...agendamentos, ...optimisticUpdates];

  return {
    agendamentos: finalAgendamentos,
    loading,
    error,
    createAgendamento,
    updateAgendamento,
    deleteAgendamento,
    refresh: () => loadAgendamentos(false),
    isRealTime: true,
    isChangingDate,
    hasCachedData: usingCachedData,
  };
}

// Prefetch de agendamentos para acelerar navegação (ex.: chamado pelo Layout)
export async function prefetchAgendamentos(
  userId: string,
  start?: Date,
  end?: Date,
) {
  if (!userId) return;
  const rangeKey = `${start?.toISOString() || "none"}-${end?.toISOString() || "none"}`;
  const sharedKey = `agendamentos:${userId}:${rangeKey}`;
  const existing = dataCache.get<AgendamentoModerno[]>(sharedKey);
  if (existing && existing.length > 0) return; // já em cache

  try {
    const dadosOnline = await getAgendamentosWithFuncionario(
      userId,
      start,
      end,
    );
    const dadosModernos = await adaptMultipleLegacyToModern(dadosOnline);
    const base = dadosModernos.map((a) => ({
      ...a,
      status: getStatusAutomatico(a),
    }));
    dataCache.set(sharedKey, base, 2 * 60 * 1000);

    // Enriquecer funcionários em background (não bloqueante)
    (async () => {
      try {
        const { getFuncionariosByIds } = await import(
          "@/services/funcionarioService"
        );
        const ids = new Set<string>();
        base.forEach((a) => {
          if (a.funcionario_id) ids.add(a.funcionario_id);
          a.servicos?.forEach(
            (s) => s.funcionario_id && ids.add(s.funcionario_id),
          );
        });
        const idList = Array.from(ids);
        if (idList.length === 0) return;
        const funcionarios = await getFuncionariosByIds(idList);
        const map = new Map(funcionarios.map((f) => [f.id, f]));
        const enriched = base.map((a) => ({
          ...a,
          funcionario:
            a.funcionario_id && map.get(a.funcionario_id)
              ? {
                  id: a.funcionario_id,
                  nome: map.get(a.funcionario_id)!.nome,
                  username: map.get(a.funcionario_id)!.username,
                }
              : a.funcionario || null,
          servicos:
            a.servicos?.map((s) => ({
              ...s,
              funcionario:
                s.funcionario_id && map.get(s.funcionario_id)
                  ? {
                      id: s.funcionario_id,
                      nome: map.get(s.funcionario_id)!.nome,
                      username: map.get(s.funcionario_id)!.username,
                    }
                  : s.funcionario,
            })) || a.servicos,
        }));
        dataCache.set(sharedKey, enriched, 2 * 60 * 1000);
      } catch {}
    })();
  } catch (e) {
    if (__DEV__)
      console.warn("Prefetch agendamentos falhou:", (e as any)?.message || e);
  }
}
