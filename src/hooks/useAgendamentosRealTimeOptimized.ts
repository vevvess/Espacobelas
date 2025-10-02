import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { autoRetryService } from "@/lib/autoRetry";
import { useServicos } from "@/hooks/useServicos";
import {
  createAgendamento,
  updateAgendamento,
  deleteAgendamento,
  getAgendamentos,
} from "@/services/database";
import {
  getFuncionarios,
  getFuncionarioById,
  getFuncionariosByIds,
  extractFuncionarioFromObservacoes,
  extractServicosFromObservacoes,
  extractUserObservacoes,
} from "@/services/funcionarioService";
import {
  buildObservacoesWithServicos,
  extractObservacoesUsuario,
  extractServicosData,
  extractFuncionariosFromAgendamento,
} from "@/utils/observacoesBuilder";
import { Agendamento } from "@/lib/neon";
import { toast } from "@/hooks/use-toast";
import { getCorOffline } from "@/services/funcionarioColorsOffline";
import { executeWithRetry } from "@/utils/connectionRecovery";
import { emergencyOfflineMode } from "@/utils/emergencyOfflineMode";

export function useAgendamentosRealTimeOptimized(
  dataInicio?: Date,
  dataFim?: Date,
) {
  const { user } = useAuth();
  const { servicos } = useServicos(); // Para buscar durações reais dos serviços
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [funcionarios, setFuncionarios] = useState<
    Array<{
      id: string;
      nome: string;
      username: string;
      is_admin: boolean;
      cor?: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Cache para evitar requests desnecessários
  const cacheRef = useRef<{
    lastHash: string;
    lastData: Agendamento[];
    lastUpdate: number;
  }>({
    lastHash: "",
    lastData: [],
    lastUpdate: 0,
  });

  // Refs para controle de polling
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingActiveRef = useRef(false);
  const operationInProgressRef = useRef(false);
  const errorCountRef = useRef(0);
  const lastOperationTime = useRef(0);

  // Verifica se é funcionário (não admin)
  const isStaff = user && !user.is_admin;

  // Função para buscar duração real do serviço quando não está nas observações
  const getRealServiceDuration = useCallback((servicoId: string): number | undefined => {
    const servico = servicos.find(s => s.id === servicoId);
    return servico?.duracao_minutos;
  }, [servicos]);

  // Inicializar auto-retry service
  useEffect(() => {
    autoRetryService.start();
    return () => autoRetryService.stop();
  }, []);

  // Função para gerar hash simples dos agendamentos para comparação
  const generateHash = useCallback((agendamentos: any[]) => {
    return agendamentos
      .map((a) => `${a.id}-${a.status}-${a.updated_at}`)
      .sort()
      .join("|");
  }, []);

  // Função para calcular duração total do agendamento baseado nos serviços
  const calcularDuracaoTotal = useCallback((agendamento: any) => {
    let duracaoTotal = 0;

    // Se tem múltiplos serviços na estrutura moderna
    if (agendamento.servicos && agendamento.servicos.length > 0) {
      agendamento.servicos.forEach((servico: any) => {
        if (servico.servico?.duracao_minutos) {
          duracaoTotal += servico.servico.duracao_minutos;
        }
      });
    }
    // Se tem serviço único na estrutura legacy
    else if (agendamento.servico?.duracao_minutos) {
      duracaoTotal = agendamento.servico.duracao_minutos;
    }

    // Se não conseguiu calcular, usar duração padrão de 60 minutos
    return duracaoTotal > 0 ? duracaoTotal : 60;
  }, []);

  // Função para determinar status automático baseado na duração exata dos serviços
  const getStatusAutomatico = useCallback(
    (agendamento: any) => {
      const agora = new Date();

      // Validar data_hora antes de criar Date
      if (!agendamento.data_hora) {
        console.warn("Agendamento sem data_hora:", agendamento.id);
        return agendamento.status || "agendado";
      }

      const dataHoraInicio = new Date(agendamento.data_hora);

      // Verificar se a data é válida
      if (isNaN(dataHoraInicio.getTime())) {
        console.warn(
          "Data inválida no agendamento:",
          agendamento.id,
          agendamento.data_hora,
        );
        return agendamento.status || "agendado";
      }

      // Se já est�� concluído ou cancelado, manter status
      if (
        agendamento.status === "concluido" ||
        agendamento.status === "cancelado"
      ) {
        return agendamento.status;
      }

      // Se já está aguardando confirmação, manter até admin confirmar
      if (agendamento.status === "aguardando_confirmacao") {
        return agendamento.status;
      }

      // Calcular duração total baseada nos serviços
      const duracaoMinutos = calcularDuracaoTotal(agendamento);
      const dataHoraFim = new Date(
        dataHoraInicio.getTime() + duracaoMinutos * 60 * 1000,
      );

      // Lógica exata:
      // Antes do horário = manter status original
      // No horário até fim = "em_andamento"
      // Após o fim = "aguardando_pagamento" (para admin confirmar)

      if (agora < dataHoraInicio) {
        return agendamento.status; // Manter status original se ainda não chegou a hora
      } else if (agora >= dataHoraInicio && agora <= dataHoraFim) {
        return "em_andamento";
      } else {
        // Após o horário de fim: ir para aguardando confirmação se estava em andamento
        return agendamento.status === "em_andamento"
          ? "aguardando_confirmacao"
          : agendamento.status;
      }
    },
    [calcularDuracaoTotal],
  );

  // Cache de funcionários para evitar múltiplas chamadas
  const funcionariosCache = useRef<Record<string, any>>({});
  const funcionariosRequestCache = useRef<Record<string, Promise<any>>>({});
  const funcionariosCircuitBreakerRef = useRef({ failures: 0, lastFailure: 0 });
  const agendamentosCircuitBreakerRef = useRef({ failures: 0, lastFailure: 0 });

  // Função segura para buscar funcionário
  const getFuncionarioSafe = useCallback(async (funcionarioId: string) => {
    if (!funcionarioId) return null;

    // Verificar cache primeiro
    if (funcionariosCache.current[funcionarioId]) {
      return funcionariosCache.current[funcionarioId];
    }

    // Verificar se já há uma requisição em andamento para este funcionário
    if (funcionariosRequestCache.current[funcionarioId]) {
      return funcionariosRequestCache.current[funcionarioId];
    }

    // Criar nova requisição e cachear a Promise
    const requestPromise = (async () => {
      // Verificar circuit breaker
      const now = Date.now();
      const timeSinceLastFailure =
        now - funcionariosCircuitBreakerRef.current.lastFailure;
      const shouldSkipFetch =
        funcionariosCircuitBreakerRef.current.failures >= 3 &&
        timeSinceLastFailure < 60000;

      if (shouldSkipFetch) {
        console.log(
          `Circuit breaker ativo - usando fallback para funcionário ${funcionarioId}`,
        );
        const fallback = {
          id: funcionarioId,
          nome: `Funcionário ${funcionarioId.slice(-4)}`,
        };
        funcionariosCache.current[funcionarioId] = fallback;
        delete funcionariosRequestCache.current[funcionarioId];
        return fallback;
      }

      try {
        const funcionario = await getFuncionarioById(funcionarioId);
        if (funcionario) {
          funcionariosCache.current[funcionarioId] = funcionario;
          delete funcionariosRequestCache.current[funcionarioId];
          return funcionario;
        }
      } catch (error) {
        console.warn(`Erro ao buscar funcionário ${funcionarioId}:`, error);
        // Incrementar contador de falhas no circuit breaker
        funcionariosCircuitBreakerRef.current.failures++;
        funcionariosCircuitBreakerRef.current.lastFailure = now;
      }

      // Fallback: retornar objeto simples
      const fallback = {
        id: funcionarioId,
        nome: `Funcionário ${funcionarioId.slice(-4)}`,
      };
      funcionariosCache.current[funcionarioId] = fallback;
      delete funcionariosRequestCache.current[funcionarioId];
      return fallback;
    })();

    funcionariosRequestCache.current[funcionarioId] = requestPromise;
    return requestPromise;
  }, []);

  // Função para processar agendamentos vindos do banco
  const processAgendamentos = useCallback(
    async (rawAgendamentos: any[]) => {
      if (!user?.id) return [];

      // Primeiro passo: coletar todos os IDs de funcionários únicos
      const allFuncionarioIds = new Set<string>();

      rawAgendamentos.forEach((agendamento: any) => {
        const funcionarioId = extractFuncionarioFromObservacoes(
          agendamento.observacoes || "",
        );
        if (funcionarioId) allFuncionarioIds.add(funcionarioId);

        const servicosDataArray = extractServicosData(
          agendamento.observacoes || "",
        );

        servicosDataArray?.forEach((servicoData: any) => {
          if (servicoData.funcionario_id) {
            allFuncionarioIds.add(servicoData.funcionario_id);
          }
        });
      });

      // Segundo passo: buscar todos os funcionários em batch
      const funcionariosBatch = await getFuncionariosByIds([
        ...allFuncionarioIds,
      ]);
      const funcionariosMap = new Map();
      funcionariosBatch.forEach((f) => funcionariosMap.set(f.id, f));

      // Terceiro passo: processar agendamentos usando os dados em cache
      const processedAgendamentos = await Promise.all(
        rawAgendamentos.map(async (agendamento: any) => {
          // Extrair funcionário das observações
          const funcionarioId = extractFuncionarioFromObservacoes(
            agendamento.observacoes || "",
          );

          // Extrair dados dos serviços das observações
          const servicosDataArray = extractServicosData(
            agendamento.observacoes || "",
          );

          // Obter funcionário do mapa (já buscado em batch)
          let funcionario = null;
          if (funcionarioId) {
            funcionario = funcionariosMap.get(funcionarioId) || null;
          }

          // Processar serviços
          let servicos = [];
          if (servicosDataArray && servicosDataArray.length > 0) {
            servicos = await Promise.all(
              servicosDataArray.map(async (servicoData: any, index: number) => {
                let funcionarioServico = null;
                const funcionarioIdServico =
                  servicoData.funcionario_id || funcionarioId;

                // Buscar funcionário real do banco
                if (funcionarioIdServico) {
                  funcionarioServico =
                    await getFuncionarioSafe(funcionarioIdServico);
                }

                return {
                  id: `${agendamento.id}-service-${index}`,
                  agendamento_id: agendamento.id,
                  servico_id: servicoData.servico_id,
                  funcionario_id: funcionarioIdServico || null,
                  preco: Number(servicoData.preco) || 0,
                  created_at: agendamento.created_at,
                  servico: {
                    nome: servicoData.nome || "Serviço",
                    duracao_minutos: servicoData.duracao_minutos || getRealServiceDuration(servicoData.servico_id)
                  },
                  funcionario: funcionarioServico,
                };
              }),
            );
          } else if (agendamento.servico) {
            servicos = [
              {
                id: `${agendamento.id}-service`,
                agendamento_id: agendamento.id,
                servico_id: agendamento.servico_id,
                funcionario_id: funcionarioId,
                preco: agendamento.valor || 0,
                created_at: agendamento.created_at,
                servico: agendamento.servico,
                funcionario: funcionario,
              },
            ];
          }

          const statusAutomatico = getStatusAutomatico(agendamento);

          // Validar e converter data_hora
          let dataHoraValida = agendamento.data_hora;
          if (
            agendamento.data_hora &&
            typeof agendamento.data_hora === "string"
          ) {
            const dataConvertida = new Date(agendamento.data_hora);
            if (isNaN(dataConvertida.getTime())) {
              console.warn(
                "Data inválida detectada no agendamento:",
                agendamento.id,
                agendamento.data_hora,
              );
              dataHoraValida = new Date(); // Usar data atual como fallback
            } else {
              dataHoraValida = dataConvertida;
            }
          } else if (!(agendamento.data_hora instanceof Date)) {
            dataHoraValida = new Date(); // Fallback para data atual
          }

          return {
            ...agendamento,
            data_hora: dataHoraValida, // Garantir que data_hora é sempre um Date válido
            status: statusAutomatico, // Aplicar status automático
            valor_total: agendamento.valor || 0,
            funcionario_id: funcionarioId,
            funcionario: funcionario,
            servicos: servicos,
            pagamentos: [],
            cliente: {
              ...agendamento.cliente,
              tipo_cliente: agendamento.cliente?.tipo_cliente || "normal",
            },
            observacoes_usuario: extractObservacoesUsuario(
              agendamento.observacoes || "",
            ),
          };
        }),
      );

      // Filtrar para funcionários se necessário (mas não para funcionários com acesso total)
      if (isStaff && user?.id && !user?.can_edit_all) {
        return processedAgendamentos.filter((agendamento) => {
          if (agendamento.user_simple_id === user.id) return true;
          if (agendamento.funcionario_id === user.id) return true;

          const temServicoAtribuido = agendamento.servicos?.some(
            (servico) =>
              servico.funcionario_id === user.id ||
              servico.funcionario?.id === user.id,
          );

          return temServicoAtribuido;
        });
      }

      return processedAgendamentos;
    },
    [
      user?.id,
      user?.can_edit_all,
      isStaff,
      getStatusAutomatico,
      calcularDuracaoTotal,
      getRealServiceDuration,
    ],
  );

  // Função principal para sincronização com o banco
  const syncWithDatabase = useCallback(
    async (showNotifications = false) => {
      if (!user?.id || operationInProgressRef.current) return;

      // Verificar circuit breaker para agendamentos
      const now = Date.now();
      const timeSinceLastFailure =
        now - agendamentosCircuitBreakerRef.current.lastFailure;
      const shouldSkipFetch =
        agendamentosCircuitBreakerRef.current.failures >= 3 &&
        timeSinceLastFailure < 120000; // Skip por 2 minutos

      if (shouldSkipFetch) {
        console.log("Circuit breaker ativo - usando cache de agendamentos");
        // Usar cache diretamente
        try {
          const cachedData = localStorage.getItem(
            `agendamentos_cache_${user.id}`,
          );
          if (cachedData) {
            const {
              data: cachedAgendamentos,
              timestamp,
              hash,
            } = JSON.parse(cachedData);
            const cacheAge = Date.now() - timestamp;
            const maxCacheAge = 2 * 60 * 60 * 1000; // 2 horas quando em modo offline

            if (cacheAge < maxCacheAge && cachedAgendamentos.length > 0) {
              cacheRef.current = {
                lastHash: hash,
                lastData: cachedAgendamentos,
                lastUpdate: timestamp,
              };
              setAgendamentos(cachedAgendamentos);
              setError("Modo offline - circuit breaker ativo");

              // Notificar sobre modo offline apenas uma vez
              if (
                showNotifications &&
                !sessionStorage.getItem("circuit_breaker_notified")
              ) {
                toast({
                  title: "Modo offline",
                  description:
                    "Usando dados em cache devido a problemas de conectividade.",
                  variant: "destructive",
                  duration: 5000,
                });
                sessionStorage.setItem("circuit_breaker_notified", "true");
              }
              return;
            }
          }
        } catch (cacheErr) {
          console.warn(
            "Erro ao carregar cache durante circuit breaker:",
            cacheErr,
          );
        }
        setError(
          "Problemas de conectividade - dados podem estar desatualizados",
        );
        return;
      }

      try {
        // Use connection recovery for better Failed to fetch handling
        const rawData = await executeWithRetry(
          () => getAgendamentos(user.id, dataInicio, dataFim),
          'fetch agendamentos'
        );
        const newHash = generateHash(rawData);

        // Reset circuit breaker em caso de sucesso
        agendamentosCircuitBreakerRef.current = { failures: 0, lastFailure: 0 };

        // Limpar notificação de circuit breaker
        if (sessionStorage.getItem("circuit_breaker_notified")) {
          sessionStorage.removeItem("circuit_breaker_notified");
          if (showNotifications) {
            toast({
              title: "Conexão restaurada",
              description: "Sistema funcionando normalmente.",
              duration: 3000,
            });
          }
        }

        // Verificar se houve mudanças
        if (newHash === cacheRef.current.lastHash) {
          return; // Nenhuma mudança
        }

        const processedData = await processAgendamentos(rawData);

        // Detectar tipo de mudan��a
        const oldCount = cacheRef.current.lastData.length;
        const newCount = processedData.length;

        if (showNotifications && oldCount > 0) {
          if (newCount > oldCount) {
            toast({
              title: "Novo agendamento",
              description: "Um novo agendamento foi criado.",
              duration: 3000,
            });
          } else if (newCount < oldCount) {
            toast({
              title: "Agendamento removido",
              description: "Um agendamento foi removido.",
              duration: 3000,
            });
          } else if (newHash !== cacheRef.current.lastHash) {
            toast({
              title: "Agendamento atualizado",
              description: "Um agendamento foi modificado.",
              duration: 3000,
            });
          }
        }

        // Atualizar cache e estado
        cacheRef.current = {
          lastHash: newHash,
          lastData: processedData,
          lastUpdate: Date.now(),
        };

        setAgendamentos(processedData);
        setLastSyncTime(new Date());
        setError(null);
        errorCountRef.current = 0; // Reset error count on success

        // Salvar dados no cache local com timestamp
        try {
          const cacheData = {
            data: processedData,
            hash: newHash,
            timestamp: Date.now(),
          };
          localStorage.setItem(
            `agendamentos_cache_${user.id}`,
            JSON.stringify(cacheData),
          );
        } catch (cacheErr) {
          console.warn("Erro ao salvar cache de agendamentos:", cacheErr);
        }
      } catch (err) {
        console.error("Erro na sincronização:", err);
        errorCountRef.current += 1;

        // Incrementar circuit breaker
        agendamentosCircuitBreakerRef.current.failures++;
        agendamentosCircuitBreakerRef.current.lastFailure = now;

        // Definir mensagem de erro mais descritiva
        let errorMessage = "Erro ao carregar agendamentos.";
        if (err instanceof Error) {
          if (err.message.includes("Failed to fetch")) {
            errorMessage = "Problema de conectividade. Verifique sua internet.";
          } else if (err.message.includes("temporariamente indisponível")) {
            errorMessage =
              "Sistema em modo de proteção. Aguarde alguns segundos.";
          } else if (err.message.includes("Timeout")) {
            errorMessage = "Conexão muito lenta. Tentando novamente...";
          } else if (err.message.includes("Tentativa em")) {
            errorMessage = err.message; // Usar mensagem do circuit breaker diretamente
          }
        }

        // Verificar se devemos usar cache como fallback
        const shouldUseCacheFallback =
          errorCountRef.current >= 2 ||
          (err instanceof Error && (err.message.includes("Failed to fetch") || err.message.includes("Network conditions poor")));

        if (shouldUseCacheFallback) {
          try {
            const cachedData = localStorage.getItem(
              `agendamentos_cache_${user.id}`,
            );
            if (cachedData) {
              const {
                data: cachedAgendamentos,
                timestamp,
                hash,
              } = JSON.parse(cachedData);

              // Usar cache se não é muito antigo (máximo 1 hora)
              const cacheAge = Date.now() - timestamp;
              const maxCacheAge = 60 * 60 * 1000; // 1 hora

              if (cacheAge < maxCacheAge && cachedAgendamentos.length > 0) {
                console.log(
                  "Usando cache de agendamentos devido a erro de rede",
                );

                // Atualizar cache ref para evitar loops
                cacheRef.current = {
                  lastHash: hash,
                  lastData: cachedAgendamentos,
                  lastUpdate: timestamp,
                };

                setAgendamentos(cachedAgendamentos);
                setError("Modo offline - usando dados em cache");

                if (showNotifications) {
                  toast({
                    title: "Modo offline",
                    description:
                      "Exibindo dados em cache devido a problemas de conectividade.",
                    duration: 5000,
                  });
                }

                return; // Sair da função após usar cache
              }
            }
          } catch (cacheErr) {
            console.warn("Erro ao carregar cache de agendamentos:", cacheErr);
          }
        }

        // Se não conseguiu usar cache, definir erro
        setError(errorMessage);

        if (showNotifications && errorCountRef.current > 3) {
          toast({
            title: "Problemas de conectividade",
            description:
              "Múltiplas tentativas falharam. Verifique sua conexão.",
            variant: "destructive",
            duration: 8000,
          });
        }
      }
    },
    [user?.id, dataInicio, dataFim, generateHash, processAgendamentos],
  );

  // Carregamento inicial
  const loadInitialData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Tentar carregar do cache primeiro para melhor UX
      try {
        const cachedData = localStorage.getItem(
          `agendamentos_cache_${user.id}`,
        );
        if (cachedData) {
          const { data: cachedAgendamentos, timestamp } =
            JSON.parse(cachedData);
          const cacheAge = Date.now() - timestamp;

          // Se cache é recente (menos de 10 minutos), usar para carregamento imediato
          if (cacheAge < 10 * 60 * 1000 && cachedAgendamentos.length > 0) {
            setAgendamentos(cachedAgendamentos);
            setLoading(false);
            console.log("Agendamentos carregados do cache inicialmente");
          }
        }
      } catch (err) {
        console.warn("Erro ao carregar cache inicial de agendamentos:", err);
      }

      // Carregar agendamentos do banco em background
      await syncWithDatabase(false);

      // Tentar carregar funcionários com circuit breaker
      let funcionariosData = [];
      const now = Date.now();
      const timeSinceLastFailure =
        now - funcionariosCircuitBreakerRef.current.lastFailure;
      const shouldSkipFetch =
        funcionariosCircuitBreakerRef.current.failures >= 3 &&
        timeSinceLastFailure < 60000; // Skip por 1 minuto após 3 falhas

      if (shouldSkipFetch) {
        console.log("Circuit breaker ativo - usando cache de funcionários");
        // Carregar direto do cache
        try {
          const cached = localStorage.getItem("funcionarios_cache");
          if (cached) {
            funcionariosData = JSON.parse(cached);
          }
        } catch (cacheErr) {
          console.warn("Erro ao carregar cache:", cacheErr);
          funcionariosData = [];
        }
      } else {
        try {
          funcionariosData = await getFuncionarios();
          // Reset circuit breaker on success
          funcionariosCircuitBreakerRef.current = {
            failures: 0,
            lastFailure: 0,
          };
        } catch (err) {
          console.warn("Erro ao carregar funcionários, usando cache:", err);

          // Mensagem específica para tipo de erro
          let funcionariosErrorMsg = "Erro ao carregar lista de funcionários.";
          if (err instanceof Error) {
            if (err.message.includes("Failed to fetch")) {
              funcionariosErrorMsg =
                "Problema de conectividade ao carregar funcionários.";
            } else if (err.message.includes("temporarily unavailable")) {
              funcionariosErrorMsg = "Sistema temporariamente indisponível.";
            }
          }

          // Incrementar contador de falhas
          funcionariosCircuitBreakerRef.current.failures++;
          funcionariosCircuitBreakerRef.current.lastFailure = now;

          // Tentar carregar do cache
          try {
            const cached = localStorage.getItem("funcionarios_cache");
            if (cached) {
              funcionariosData = JSON.parse(cached);
            }
          } catch (cacheErr) {
            console.warn("Erro ao carregar cache:", cacheErr);
            funcionariosData = []; // Array vazio como fallback
          }
        }
      }

      // Adicionar cores aos funcionários
      const funcionariosComCores = funcionariosData.map(funcionario => ({
        ...funcionario,
        cor: getCorOffline(funcionario.id)
      }));

      setFuncionarios(funcionariosComCores);

      // Preencher cache em memória dos funcionários
      funcionariosData.forEach((funcionario: any) => {
        funcionariosCache.current[funcionario.id] = funcionario;
      });

      // Cache dos funcionários no localStorage
      try {
        localStorage.setItem(
          "funcionarios_cache",
          JSON.stringify(funcionariosData),
        );
      } catch (err) {
        console.warn("Erro ao salvar cache:", err);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar dados";
      setError(errorMessage);

      // Tentar carregar do cache
      try {
        const cached = localStorage.getItem("funcionarios_cache");
        if (cached) {
          const cachedFuncionarios = JSON.parse(cached);
          setFuncionarios(cachedFuncionarios);
          // Popular cache em memória também
          cachedFuncionarios.forEach((funcionario: any) => {
            funcionariosCache.current[funcionario.id] = funcionario;
          });
        }
      } catch (cacheErr) {
        console.warn("Erro ao carregar cache:", cacheErr);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, syncWithDatabase]);

  // Setup do polling inteligente
  const setupPolling = useCallback(() => {
    if (!user?.id || !isPollingActiveRef.current) return;

    // Limpar polling anterior
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    // Polling inteligente: considera circuit breaker e erros
    const getPollingInterval = () => {
      const errorCount = errorCountRef.current;
      const circuitBreakerActive =
        agendamentosCircuitBreakerRef.current.failures >= 3;

      if (circuitBreakerActive) return 60000; // 1 minuto se circuit breaker ativo
      if (errorCount > 10) return 30000; // 30 segundos se muitos erros
      if (errorCount > 5) return 15000; // 15 segundos se alguns erros
      return 5000; // 5 segundos normal
    };

    const polling = () => {
      if (isPollingActiveRef.current && !operationInProgressRef.current) {
        // Adicionar delay extra após operações para garantir que concluam
        const timeSinceLastOperation = Date.now() - (lastOperationTime.current || 0);
        if (timeSinceLastOperation < 2000) {
          console.log('⏱️ Pulando sync - operação recente detectada');
        } else {
          syncWithDatabase(true);
        }
      }

      // Reagendar com intervalo dinâmico
      if (isPollingActiveRef.current) {
        pollingRef.current = setTimeout(polling, getPollingInterval());
      }
    };

    // Iniciar polling
    pollingRef.current = setTimeout(polling, getPollingInterval());
  }, [user?.id, syncWithDatabase]);

  // Controle de visibilidade da aba
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPollingActiveRef.current = false;
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      } else {
        isPollingActiveRef.current = true;
        setupPolling();
        // Sync imediato quando volta para a aba
        if (user?.id) {
          syncWithDatabase(true);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [setupPolling, syncWithDatabase, user?.id]);

  // Inicialização
  useEffect(() => {
    if (user?.id) {
      loadInitialData().then(() => {
        isPollingActiveRef.current = true;
        setupPolling();
      });
    }

    return () => {
      isPollingActiveRef.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [user?.id, dataInicio, dataFim, loadInitialData, setupPolling]);

  // CRUD FUNCTIONS COM OPTIMISTIC UPDATES

  // Função para adicionar agendamento
  const addAgendamento = useCallback(
    async (agendamentoData: {
      cliente_id: string;
      data_hora: Date;
      observacoes?: string;
      servicos: Array<{
        servico_id: string;
        funcionario_id?: string;
        preco: number;
      }>;
    }) => {
      if (!user?.id || (isStaff && !user?.can_edit_all)) {
        throw new Error("Acesso negado");
      }

      operationInProgressRef.current = true;

      try {
        const valorTotal = agendamentoData.servicos.reduce(
          (sum, s) => sum + (Number(s.preco) || 0),
          0,
        );

        const primeiroServico = agendamentoData.servicos[0];
        const observacoesFinal = buildObservacoesWithServicos(
          agendamentoData.observacoes || "",
          agendamentoData.servicos,
          primeiroServico.funcionario_id,
        );

        // Optimistic update: adicionar temporariamente à lista
        const tempId = `temp_${Date.now()}`;
        const optimisticAgendamento = {
          id: tempId,
          user_simple_id: user.id,
          cliente_id: agendamentoData.cliente_id,
          servico_id: primeiroServico.servico_id,
          data_hora: agendamentoData.data_hora,
          status: "agendado",
          observacoes: observacoesFinal,
          valor: valorTotal,
          valor_total: valorTotal,
          created_at: new Date(),
          updated_at: new Date(),
          cliente: {
            nome: "Carregando...",
            telefone: "",
            tipo_cliente: "normal",
          },
          servico: { nome: "Carregando..." },
          funcionario: null,
          funcionario_id: primeiroServico.funcionario_id,
          servicos: [],
          pagamentos: [],
          observacoes_usuario: agendamentoData.observacoes || "",
        };

        // Adicionar otimisticamente
        setAgendamentos((prev) => [
          ...prev,
          optimisticAgendamento as Agendamento,
        ]);

        // Criar no banco
        const novoAgendamento = await createAgendamento(user.id, {
          cliente_id: agendamentoData.cliente_id,
          servico_id: primeiroServico.servico_id,
          data_hora: agendamentoData.data_hora,
          observacoes: observacoesFinal,
          valor: valorTotal,
        });

        // Sync com banco para pegar dados completos
        await syncWithDatabase(false);

        toast({
          title: "Agendamento criado",
          description: `Agendamento criado com sucesso. Valor: R$ ${valorTotal.toFixed(2)}`,
        });

        return novoAgendamento;
      } catch (err) {
        // Remover item otimístico em caso de erro
        setAgendamentos((prev) =>
          prev.filter((a) => !a.id.startsWith("temp_")),
        );

        const errorMessage =
          err instanceof Error ? err.message : "Erro ao criar agendamento";
        toast({
          title: "Erro ao criar agendamento",
          description: errorMessage,
          variant: "destructive",
        });
        throw err;
      } finally {
        operationInProgressRef.current = false;
      }
    },
    [user?.id, isStaff, syncWithDatabase],
  );

  // Fun��ão para editar agendamento
  const editAgendamento = useCallback(
    async (
      agendamentoId: string,
      agendamentoData: {
        data_hora?: Date;
        status?: string;
        observacoes?: string;
        servicos?: Array<{
          id?: string;
          servico_id: string;
          funcionario_id?: string;
          preco: number;
        }>;
      },
    ) => {
      if (!user?.id || (isStaff && !user?.can_edit_all)) {
        throw new Error("Acesso negado");
      }

      operationInProgressRef.current = true;

      try {
        // Optimistic update
        setAgendamentos((prev) =>
          prev.map((agendamento) =>
            agendamento.id === agendamentoId
              ? {
                  ...agendamento,
                  ...agendamentoData,
                  updated_at: new Date(),
                }
              : agendamento,
          ),
        );

        const valorTotal = agendamentoData.servicos
          ? agendamentoData.servicos.reduce(
              (sum, s) => sum + (Number(s.preco) || 0),
              0,
            )
          : undefined;

        const primeiroServico = agendamentoData.servicos?.[0];
        const updateData: any = {
          data_hora: agendamentoData.data_hora,
          status: agendamentoData.status,
        };

        if (agendamentoData.servicos && agendamentoData.servicos.length > 0) {
          updateData.valor = valorTotal;
          updateData.servico_id = primeiroServico.servico_id;
          updateData.observacoes = buildObservacoesWithServicos(
            agendamentoData.observacoes || "",
            agendamentoData.servicos,
            primeiroServico.funcionario_id,
          );
        } else {
          updateData.observacoes = agendamentoData.observacoes;
        }

        await updateAgendamento(agendamentoId, user.id, updateData);

        // Sync com banco para dados completos
        await syncWithDatabase(false);

        toast({
          title: "Agendamento atualizado",
          description: "Agendamento foi atualizado com sucesso.",
        });
      } catch (err) {
        // Reverter optimistic update em caso de erro
        await syncWithDatabase(false);

        const errorMessage =
          err instanceof Error ? err.message : "Erro ao atualizar agendamento";
        toast({
          title: "Erro ao atualizar agendamento",
          description: errorMessage,
          variant: "destructive",
        });
        throw err;
      } finally {
        operationInProgressRef.current = false;
      }
    },
    [user?.id, isStaff, syncWithDatabase],
  );

  // Função para remover agendamento
  const removeAgendamento = useCallback(
    async (agendamentoId: string) => {
      if (!user?.id || (isStaff && !user?.can_edit_all)) {
        throw new Error("Acesso negado");
      }

      operationInProgressRef.current = true;
      lastOperationTime.current = Date.now();

      // Pausar polling temporariamente durante delete
      const wasPollingActive = isPollingActiveRef.current;
      if (wasPollingActive) {
        isPollingActiveRef.current = false;
        if (pollingRef.current) {
          clearTimeout(pollingRef.current);
          pollingRef.current = null;
        }
        console.log('⏸️ Polling pausado para operação de delete');
      }

      try {
        console.log(`🗑️ Deletando agendamento ${agendamentoId}...`);

        // Primeiro executar delete no banco
        await deleteAgendamento(agendamentoId, user.id);

        // Após sucesso, remover da lista local
        setAgendamentos((prev) =>
          prev.filter((agendamento) => agendamento.id !== agendamentoId),
        );

        // Limpar qualquer cache relacionado
        try {
          localStorage.removeItem(`agendamentos_cache_${user.id}`);
          console.log('🧹 Cache de agendamentos limpo após delete');
        } catch (cacheErr) {
          console.warn('Erro ao limpar cache:', cacheErr);
        }

        // Aguardar um pouco e sincronizar para garantir consist��ncia
        setTimeout(() => {
          if (user?.id) {
            console.log('🔄 Sincronizando após delete para garantir consistência');
            syncWithDatabase(false);
          }
        }, 1500);

        toast({
          title: "Agendamento removido",
          description: "Agendamento foi removido com sucesso.",
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao remover agendamento";

        console.error("Erro ao deletar agendamento:", err);

        // Forçar sync para garantir estado consistente
        await syncWithDatabase(false);

        toast({
          title: "Erro ao remover agendamento",
          description: errorMessage,
          variant: "destructive",
        });
        throw err;
      } finally {
        operationInProgressRef.current = false;

        // Retomar polling se estava ativo
        if (wasPollingActive) {
          setTimeout(() => {
            isPollingActiveRef.current = true;
            setupPolling();
            console.log('▶️ Polling retomado após operação de delete');
          }, 2000); // Aguardar 2 segundos antes de retomar
        }
      }
    },
    [user?.id, isStaff, syncWithDatabase],
  );

  // Função para forçar refresh manual
  const forceRefresh = useCallback(async () => {
    await syncWithDatabase(false);
  }, [syncWithDatabase]);

  // Funções de busca e filtro (sem mudanças)
  const getAgendamentosPorData = useCallback(
    (data: Date) => {
      const dataStr = data.toDateString();
      return agendamentos.filter(
        (agendamento) => agendamento.data_hora.toDateString() === dataStr,
      );
    },
    [agendamentos],
  );

  const getAgendamentosHoje = useCallback(() => {
    return getAgendamentosPorData(new Date());
  }, [getAgendamentosPorData]);

  const getProximosAgendamentos = useCallback(
    (limite = 5) => {
      const agora = new Date();
      return agendamentos
        .filter((agendamento) => agendamento.data_hora > agora)
        .sort((a, b) => a.data_hora.getTime() - b.data_hora.getTime())
        .slice(0, limite);
    },
    [agendamentos],
  );

  const getAgendamentosPorStatus = useCallback(
    (status: string) => {
      return agendamentos.filter(
        (agendamento) => agendamento.status === status,
      );
    },
    [agendamentos],
  );

  // Funções de formatação
  const formatDateTime = useCallback((data: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(data);
  }, []);

  const formatTime = useCallback((data: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(data);
  }, []);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }, []);

  return {
    // Estado
    agendamentos,
    funcionarios,
    loading,
    error,
    isStaff,
    canEdit: !isStaff || user?.can_edit_all || false,
    lastSyncTime,

    // CRUD Operations
    addAgendamento,
    editAgendamento,
    removeAgendamento,

    // Funções de busca
    getAgendamentosPorData,
    getAgendamentosHoje,
    getProximosAgendamentos,
    getAgendamentosPorStatus,

    // Formatação
    formatDateTime,
    formatTime,
    formatCurrency,

    // Controle
    forceRefresh,
    reload: forceRefresh,
  };
}
