import React, { useState, useEffect, useMemo } from "react";
import {
  FiClock,
  FiUser,
  FiDollarSign,
  FiEdit,
  FiTrash2,
  FiEye,
  FiUsers,
  FiCheck,
} from "react-icons/fi";
import {
  getCorOffline,
  getColorVariants,
} from "@/services/funcionarioColorsOffline";
import { updateAgendamento } from "@/services/database";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { Confetti, SimpleConfetti } from "@/components/Confetti";
import { completionFeedback, transitionFeedback, settleFeedback, initializeAudio, prefersReducedMotion } from "@/utils/feedbackUtils";

interface Servico {
  id: string;
  servico: { nome: string; duracao_minutos?: number };
  preco: number;
  funcionario?: { id: string; nome: string };
  funcionario_id?: string;
}

interface Agendamento {
  id: string;
  data_hora: Date;
  status: string;
  cliente: { nome: string; telefone?: string };
  servicos: Servico[];
  funcionario?: { id: string; nome: string };
  funcionario_id?: string;
  valor_total: number;
  observacoes_usuario?: string;
  duracao_estimada?: number; // em minutos
}

interface AgendamentoCardWithProgressProps {
  agendamento: Agendamento;
  onEdit?: (agendamento: Agendamento) => void;
  onDelete?: (id: string) => void;
  onView?: (agendamento: Agendamento) => void;
  onConcluir?: (agendamento: Agendamento) => void;
  onIniciar?: (agendamento: Agendamento) => void;
  onEditConcluido?: (agendamento: Agendamento) => void;
  formatDateTime: (date: Date) => string;
  formatCurrency: (value: number) => string;
  canEdit?: boolean;
  isStaff?: boolean;
  canViewValues?: boolean;
}

export function AgendamentoCardWithProgress({
  agendamento,
  onEdit,
  onDelete,
  onView,
  onConcluir,
  onIniciar,
  onEditConcluido,
  formatDateTime,
  formatCurrency,
  canEdit = true,
  isStaff = false,
  canViewValues = true,
}: AgendamentoCardWithProgressProps) {
  const { user } = useAuth();
  const [funcionariosCores, setFuncionariosCores] = useState<
    Record<string, string>
  >({});
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Estados avançados da animação
  const [animationPhase, setAnimationPhase] = useState<'none' | 'finalStage' | 'burst' | 'celebration' | 'morphing' | 'settling'>('none');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [showGoldenRing, setShowGoldenRing] = useState(false);
  const [cardScale, setCardScale] = useState(1);
  const [isMoving, setIsMoving] = useState(false);

  // Detectar preferências do usuário
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Função para estimar duração de serviço baseado no nome
  const estimarDuracaoServico = (nomeServico: string): number => {
    const nome = nomeServico.toLowerCase();

    // Durações estimadas baseadas em tipos comuns de serviços
    if (nome.includes('cutilação') || nome.includes('cuticula')) {
      if (nome.includes('pé') && nome.includes('mão')) return 60; // Pé + Mão
      if (nome.includes('pé')) return 30;
      if (nome.includes('mão')) return 30;
      return 45; // Cutilação geral
    }

    if (nome.includes('escova')) {
      if (nome.includes('progressiva') || nome.includes('definitiva')) return 180; // 3h
      if (nome.includes('modeladora') || nome.includes('lisa')) return 90; // 1.5h
      return 60; // Escova básica
    }

    if (nome.includes('corte')) return 30;
    if (nome.includes('pintura') || nome.includes('coloração')) return 120;
    if (nome.includes('luzes') || nome.includes('mechas')) return 150;
    if (nome.includes('relaxamento') || nome.includes('alisamento')) return 120;
    if (nome.includes('hidratação') || nome.includes('tratamento')) return 45;
    if (nome.includes('design') && nome.includes('sobrancelha')) return 20;
    if (nome.includes('manicure') || nome.includes('pedicure')) return 45;
    if (nome.includes('unha')) return 60;
    if (nome.includes('depilação')) return 30;
    if (nome.includes('massagem')) return 60;
    if (nome.includes('limpeza') && nome.includes('pele')) return 60;

    // Duração padrão para serviços não reconhecidos
    return 45;
  };

  // Calcular duração real baseada na soma de todos os serviços
  const duracaoEstimada = useMemo(() => {
    console.group(`⏱️ CALCULANDO DURAÇÃO - Agendamento ${agendamento.id}`);

    // Se há duração estimada manual, usar essa
    if (agendamento.duracao_estimada) {
      console.log(`📋 Usando duração manual: ${agendamento.duracao_estimada} minutos`);
      console.groupEnd();
      return agendamento.duracao_estimada;
    }

    // Calcular duração real somando todos os serviços
    if (agendamento.servicos && Array.isArray(agendamento.servicos) && agendamento.servicos.length > 0) {
      console.log(`📋 Agendamento tem ${agendamento.servicos.length} serviços`);
      let servicosComProblema = 0;
      const duracaoTotal = agendamento.servicos.reduce((total, servicoAgendamento, index) => {
        console.log(`\n📝 Serviço ${index + 1}/${agendamento.servicos.length}:`);
        // Validar se o objeto de serviço existe
        if (!servicoAgendamento?.servico) {
          console.warn(`❌ Serviço sem dados completos:`, servicoAgendamento);
          servicosComProblema++;
          return total;
        }

        // Tentar obter duração do objeto servico relacionado
        const duracaoServico = servicoAgendamento.servico.duracao_minutos;
        const nomeServico = servicoAgendamento.servico.nome || 'Serviço sem nome';

        console.log(`   Nome: "${nomeServico}"`);
        console.log(`   Duração no DB: ${duracaoServico}`);
        console.log(`   Objeto completo:`, servicoAgendamento.servico);

        if (duracaoServico && duracaoServico > 0) {
          console.log(`✅ Duração válida: ${duracaoServico} minutos`);
          return total + duracaoServico;
        }

        // Se chegou aqui, há um problema real nos dados - aplicar correção automática
        const duracaoEstimada = estimarDuracaoServico(nomeServico);
        console.warn(`⚠️ Serviço "${nomeServico}" sem duração definida - usando estimativa: ${duracaoEstimada}min`, JSON.stringify({
          servico: servicoAgendamento.servico,
          servicoCompleto: servicoAgendamento,
          agendamentoId: agendamento.id,
          duracaoEstimada
        }, null, 2));
        servicosComProblema++;
        return total + duracaoEstimada; // Usar duração estimada ao invés de 0
      }, 0);

      // Log de resumo
      if (servicosComProblema > 0) {
        console.warn(`⚠️ ${servicosComProblema} de ${agendamento.servicos.length} serviços com dados incompletos`);
      }

      // Se temos durações reais, usar elas; se não, tentar estimar baseado nos nomes
      let resultado = duracaoTotal;

      if (duracaoTotal === 0 && servicosComProblema === agendamento.servicos.length) {
        // Todos os serviços têm problema - tentar estimar com base nos nomes
        console.log(`⚠️ Todos os serviços sem duração - tentando estimativa global...`);
        resultado = agendamento.servicos.reduce((total, servicoAgendamento) => {
          const nomeServico = servicoAgendamento.servico?.nome || 'Serviço sem nome';
          const estimativa = estimarDuracaoServico(nomeServico);
          console.log(`   "${nomeServico}" → ${estimativa} min (estimado)`);
          return total + estimativa;
        }, 0);

        if (resultado === 0) {
          resultado = 60; // Fallback mais realista que 30min
        }
      } else if (duracaoTotal === 0) {
        resultado = 60; // Fallback mais realista para casos extremos
      }

      console.log(`\n🎯 RESULTADO FINAL:`);
      console.log(`   Total calculado: ${duracaoTotal} minutos`);
      console.log(`   Serviços válidos: ${agendamento.servicos.length - servicosComProblema}/${agendamento.servicos.length}`);
      console.log(`   Usando duração: ${resultado} minutos ${duracaoTotal > 0 ? '✅ (REAL)' : resultado > 60 ? '🔍 (ESTIMADO)' : '🚨 (FALLBACK)'}`);
      console.groupEnd();

      return resultado;
    }

    // Fallback final: problema sério nos dados - usar duração estimada se disponível
    console.error(`❌ ERRO CRÍTICO: Agendamento ${agendamento.id} sem serviços definidos!`, JSON.stringify({
      agendamentoId: agendamento.id,
      servicosArray: agendamento.servicos,
      temServicos: Array.isArray(agendamento.servicos),
      quantidadeServicos: agendamento.servicos?.length || 0
    }, null, 2));

    // Se não há serviços mas há duração estimada manual, usá-la
    if (agendamento.duracao_estimada && agendamento.duracao_estimada > 0) {
      console.log(`🔄 Usando duração estimada manual: ${agendamento.duracao_estimada} minutos`);
      console.groupEnd();
      return agendamento.duracao_estimada;
    }

    // Fallback de emergência final
    console.log(`🚨 USANDO FALLBACK DE EMERGÊNCIA: 30 minutos`);
    console.groupEnd();
    return 30;
  }, [agendamento.duracao_estimada, agendamento.servicos]);

  // Tornar função de estimativa disponível globalmente para debug
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).estimarDuracaoServico = estimarDuracaoServico;
      (window as any).testarDuracaoAgendamento = (agendamentoId: string) => {
        if (agendamento.id === agendamentoId) {
          console.group(`🔍 TESTE DURAÇÃO - Agendamento ${agendamentoId}`);
          console.log('Agendamento completo:', agendamento);
          console.log('Serviços:', agendamento.servicos);
          console.log('Duração calculada:', duracaoEstimada);
          console.groupEnd();
          return {
            agendamento,
            servicos: agendamento.servicos,
            duracaoCalculada: duracaoEstimada
          };
        }
      };
    }
  }, [agendamento, duracaoEstimada]);

  // Validar e garantir que data_hora é um Date válido
  const safeDataHora = useMemo(() => {
    if (!agendamento.data_hora) {
      console.warn("Agendamento sem data_hora:", agendamento.id);
      return new Date();
    }

    if (agendamento.data_hora instanceof Date) {
      if (isNaN(agendamento.data_hora.getTime())) {
        console.warn(
          "Data inválida no agendamento:",
          agendamento.id,
          agendamento.data_hora,
        );
        return new Date();
      }
      return agendamento.data_hora;
    }

    const converted = new Date(agendamento.data_hora);
    if (isNaN(converted.getTime())) {
      console.warn(
        "Falha ao converter data no agendamento:",
        agendamento.id,
        agendamento.data_hora,
      );
      return new Date();
    }

    return converted;
  }, [agendamento.data_hora, agendamento.id]);

  // Coletar todos os funcionários únicos do agendamento
  const funcionarios = useMemo(() => {
    const funcionariosSet = new Set<string>();

    if (agendamento.funcionario_id) {
      funcionariosSet.add(agendamento.funcionario_id);
    }

    agendamento.servicos?.forEach((servico) => {
      if (servico.funcionario_id) {
        funcionariosSet.add(servico.funcionario_id);
      }
      if (servico.funcionario?.id) {
        funcionariosSet.add(servico.funcionario.id);
      }
    });

    return Array.from(funcionariosSet);
  }, [agendamento]);

  // Gerar cores para os funcionários usando sistema offline
  useEffect(() => {
    const cores: Record<string, string> = {};
    funcionarios.forEach((funcionarioId) => {
      cores[funcionarioId] = getCorOffline(funcionarioId);
    });
    setFuncionariosCores(cores);
  }, [funcionarios]);

  // Detectar dispositivo e preferências de movimento
  useEffect(() => {
    // Detectar mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Detectar preferência por movimento reduzido
    setReducedMotion(prefersReducedMotion());

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Inicializar áudio no primeiro clique/toque
  useEffect(() => {
    const handleFirstInteraction = () => {
      initializeAudio();
      // Remove listeners after first interaction
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // Sistema de progresso para agendamentos em andamento
  useEffect(() => {
    const __DEV__ = import.meta.env.MODE !== 'production';
    if (agendamento.status !== "em_andamento") {
      setProgress(0);
      setIsCompleted(false);
      setShowCompletionMessage(false);
      setIsTransitioning(false);

      // Reset advanced animation states
      setAnimationPhase('none');
      setShowConfetti(false);
      setShowFlash(false);
      setShowGoldenRing(false);
      setCardScale(1);
      setIsMoving(false);
      return;
    }

    const agora = new Date();
    const inicio = new Date(safeDataHora);
    const fim = new Date(inicio.getTime() + duracaoEstimada * 60000); // duração em ms

    const updateProgress = () => {
      const agora = new Date();
      const tempoDecorrido = agora.getTime() - inicio.getTime();
      const tempoTotal = fim.getTime() - inicio.getTime();
      const progressoAtual = Math.min(Math.max(tempoDecorrido / tempoTotal * 100, 0), 100);

      if (__DEV__) {
        console.log(`📈 Progresso do agendamento ${agendamento.id}:`, {
          inicio: inicio.toLocaleTimeString(),
          agora: agora.toLocaleTimeString(),
          fim: fim.toLocaleTimeString(),
          duracaoTotal: duracaoEstimada + ' min',
          tempoDecorridoMin: Math.round(tempoDecorrido / 60000),
          progressoAtual: Math.round(progressoAtual) + '%'
        });
      }

      setProgress(progressoAtual);

      // FASE 1: Preenchimento final (95%+) - Ring dourado e pulso
      if (progressoAtual >= 95 && progressoAtual < 100 && animationPhase === 'none') {
        if (__DEV__) console.log('🎯 FASE 1: Iniciando animações finais');
        setAnimationPhase('finalStage');
        setShowGoldenRing(true);
        setCardScale(1.02);
      }

      // FASE 2: Momento da conclusão (100%)
      if (progressoAtual >= 100 && !isCompleted) {
        if (__DEV__) console.log('🚀 FASE 2: Conclusão atingida!');
        setIsCompleted(true);
        setAnimationPhase('burst');

        // Feedback sensorial
        completionFeedback({ volume: 0.2 });

        // Flash dourado
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 300);

        // Confetti
        setTimeout(() => setShowConfetti(true), 300);

        // FASE 3: Celebração (timing ajustado para mobile)
        setTimeout(() => {
          if (__DEV__) console.log('🌟 FASE 3: Iniciando celebração');
          setAnimationPhase('celebration');
          setShowCompletionMessage(true);
        }, reducedMotion ? 500 : (isMobile ? 800 : 1000));

        // FASE 4: Transição morfing (timing reduzido para mobile)
        const morphingDelay = reducedMotion ? 1000 : (isMobile ? 2500 : 3500);
        setTimeout(() => {
          if (__DEV__) console.log('🔄 FASE 4: Iniciando transição');
          setAnimationPhase('morphing');
          setShowCompletionMessage(false);
          setCardScale(0.85);
          setIsMoving(true);

          // Feedback de transição (apenas se não for movimento reduzido)
          if (!reducedMotion) {
            transitionFeedback({ volume: 0.15 });
          }

          // Mudar status após início da animação (timing reduzido para mobile)
          const statusChangeDelay = reducedMotion ? 300 : (isMobile ? 500 : 700);
          setTimeout(async () => {
            setIsTransitioning(true);
            try {
              if (user?.id) {
                await updateAgendamento(agendamento.id, user.id, {
                  status: "aguardando_confirmacao"
                });
              }
            } catch (error) {
              console.error("Erro ao atualizar status do agendamento:", error);
            } finally {
              setIsTransitioning(false);
            }
          }, statusChangeDelay);
        }, morphingDelay);
      }
    };

    // Atualizar imediatamente
    updateProgress();

    // Atualizar a cada 30 segundos
    const interval = setInterval(updateProgress, 30000);

    return () => clearInterval(interval);
  }, [agendamento.status, safeDataHora, duracaoEstimada, isCompleted, agendamento.id]);

  // Gerar gradiente baseado nos funcionários para status em andamento
  const getCardStyle = () => {
    const baseStyle = {
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box" as const,
      position: "relative" as const,
      overflow: "hidden" as const,
    };

    if (agendamento.status === "em_andamento") {
      // Cor de fundo amarela para em andamento
      const backgroundColor = isCompleted ? "#fef3c7" : "#fef3c7"; // yellow-100
      
      return {
        ...baseStyle,
        backgroundColor,
        borderColor: "#f59e0b", // yellow-500
        borderWidth: "2px",
        borderStyle: "solid",
      };
    }

    // Para outros status, usar cor do funcionário
    if (funcionarios.length === 0) {
      return {
        ...baseStyle,
        backgroundColor: "#f8fafc",
        borderColor: "#e2e8f0",
      };
    }

    if (funcionarios.length === 1) {
      const cor = funcionariosCores[funcionarios[0]];
      const variants = getColorVariants(cor);
      return {
        ...baseStyle,
        backgroundColor: variants.light,
        borderTopColor: variants.border,
        borderRightColor: variants.border,
        borderBottomColor: variants.border,
        borderLeftColor: cor,
        borderLeftWidth: "4px",
      };
    }

    // Múltiplos funcionários - criar gradiente
    const cores = funcionarios
      .map((id) => funcionariosCores[id])
      .filter(Boolean);
    if (cores.length > 0) {
      const gradiente = `linear-gradient(135deg, ${cores
        .map((cor, index) => `${cor}${index === 0 ? "30" : "20"}`)
        .join(", ")})`;

      return {
        ...baseStyle,
        background: gradiente,
        borderTopColor: cores[0] + "60",
        borderRightColor: cores[0] + "60",
        borderBottomColor: cores[0] + "60",
        borderLeftColor: cores[0],
        borderLeftWidth: "4px",
      };
    }

    return baseStyle;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado":
        return "bg-blue-100 text-blue-800";
      case "confirmado":
        return "bg-green-100 text-green-800";
      case "em_andamento":
        return "bg-yellow-100 text-yellow-800";
      case "aguardando_confirmacao":
        return "bg-orange-100 text-orange-800";
      case "concluido":
        return "bg-purple-100 text-purple-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "agendado":
        return "Agendado";
      case "confirmado":
        return "Confirmado";
      case "em_andamento":
        return "Em Andamento";
      case "aguardando_confirmacao":
        return "Aguardando Confirmação";
      case "concluido":
        return "Concluído";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

  // Estilos dinâmicos baseados na fase da animação
  const getCardTransform = () => {
    if (animationPhase === 'finalStage') return `scale(${cardScale})`;
    if (animationPhase === 'morphing') return `scale(${cardScale}) translateY(-4px)`;
    if (isTransitioning) return "scale(0.95)";
    return "scale(1)";
  };

  const getCardClasses = () => {
    let classes = "p-4 rounded-lg border transition-all duration-500 hover:shadow-md w-full";

    if (animationPhase === 'finalStage') {
      classes += " animate-pulse";
    }

    if (animationPhase === 'burst') {
      classes += " shadow-2xl";
    }

    if (animationPhase === 'celebration') {
      classes += " shadow-xl";
    }

    if (animationPhase === 'morphing') {
      classes += " transition-all duration-700 ease-in-out";
    }

    if (agendamento.status === "concluido") {
      classes += " opacity-90";
    } else {
      classes += " hover:bg-opacity-50";
    }

    if (agendamento.status === "em_andamento") {
      if (animationPhase === 'finalStage') {
        classes += " ring-4 ring-yellow-300 ring-opacity-60";
      } else if (showGoldenRing) {
        classes += " ring-2 ring-yellow-400 shadow-lg";
      } else {
        classes += " ring-2 ring-yellow-300 shadow-lg";
      }
    }

    return classes;
  };

  return (
    <div className="w-full">
      <div
        className={getCardClasses()}
        style={{
          ...getCardStyle(),
          transform: getCardTransform(),
          transformOrigin: 'center',
        }}
      >
        {/* Flash dourado para momento da conclusão */}
        {showFlash && (
          <div className="absolute inset-0 bg-gradient-radial from-yellow-400 via-yellow-300 to-transparent opacity-70 rounded-lg z-10 animate-ping" />
        )}

        {/* Confetti particles - simplified for mobile and reduced motion */}
        {reducedMotion ? (
          <SimpleConfetti
            isActive={showConfetti}
            onComplete={() => setShowConfetti(false)}
          />
        ) : (
          <Confetti
            isActive={showConfetti}
            duration={isMobile ? 1000 : 1500}
            particleCount={isMobile ? 15 : 25}
            onComplete={() => setShowConfetti(false)}
          />
        )}

        {/* Barra de progresso para agendamentos em andamento */}
        {agendamento.status === "em_andamento" && (
          <div className="absolute inset-0 overflow-hidden rounded-lg z-10 pointer-events-none">
            <div
              className={`h-full transition-all duration-1000 ease-out ${
                animationPhase === 'finalStage'
                  ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-green-400 opacity-40'
                  : 'bg-gradient-to-r from-green-400 to-green-500 opacity-30'
              }`}
              style={{
                width: `${progress}%`,
                transformOrigin: "left",
              }}
            />
          </div>
        )}

        {/* Mensagem de celebração elaborada */}
        {showCompletionMessage && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg z-15">
            {/* Background radiante */}
            <div className="absolute inset-0 bg-gradient-radial from-green-500 via-green-600 to-green-700 opacity-95 rounded-lg animate-pulse" />

            {/* Conteúdo da celebração */}
            <div className="relative text-center text-white z-20">
              {/* Ícone de check com animaç��o bounce elaborada */}
              <div className="relative mb-3">
                <FiCheck className="w-16 h-16 mx-auto animate-bounce drop-shadow-lg"
                       style={{
                         animationDuration: '0.6s',
                         filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                       }} />
                {/* Ring de glow ao redor do check */}
                <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping" />
              </div>

              {/* Título principal com slide-up */}
              <div className="mb-2 overflow-hidden">
                <p className="text-xl font-bold animate-slideUp"
                   style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                  Atendimento finalizado
                </p>
              </div>

              {/* Subtitle com typewriter effect */}
              <div className="overflow-hidden">
                <p className="text-sm opacity-90 animate-slideUp"
                   style={{ animationDelay: '0.8s', animationFillMode: 'both' }}>
                  Aguardando confirmação de pagamento...
                </p>
              </div>

              {/* Valor total se disponível */}
              {canViewValues && (
                <div className="mt-3 overflow-hidden">
                  <p className="text-lg font-semibold animate-slideUp"
                     style={{ animationDelay: '1.2s', animationFillMode: 'both' }}>
                    {formatCurrency(agendamento.valor_total)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Non-blocking processing indicator */}
        {isTransitioning && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full pointer-events-none z-10">
            <div className="flex items-center space-x-1">
              <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
              <span>Salvando...</span>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between relative z-20">
          <div className="flex items-start space-x-4 flex-1">
            {/* Avatar do Cliente */}
            <div className="w-12 h-12 bg-gradient-to-r from-bella-400 to-bella-300 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-sm">
                {agendamento.cliente?.nome?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>

            <div className="flex-1">
              {/* Header do Card */}
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-semibold text-bella-800 text-lg">
                  {agendamento.cliente?.nome || "Cliente não informado"}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}
                >
                  {getStatusText(agendamento.status)}
                </span>
              </div>

              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-bella-600 mb-3">
                <div className="flex items-center space-x-2">
                  <FiClock className="w-4 h-4" />
                  <span>{formatDateTime(safeDataHora)}</span>
                </div>
                {agendamento.cliente?.telefone && (
                  <div className="flex items-center space-x-2">
                    <FiUser className="w-4 h-4" />
                    <span>{agendamento.cliente.telefone}</span>
                  </div>
                )}
              </div>

              {/* Serviços e Funcionários */}
              <div className="mb-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Coluna 1: Serviços */}
                  <div>
                    <p className="text-sm font-semibold text-bella-700 mb-2 flex items-center">
                      <FiUser className="w-4 h-4 mr-1" />
                      Serviços:
                    </p>
                    <div className="space-y-1">
                      {agendamento.servicos && Array.isArray(agendamento.servicos) ? (
                        agendamento.servicos.map((servico, index) => {
                          const funcionarioCor = servico?.funcionario_id
                            ? funcionariosCores[servico.funcionario_id]
                            : null;

                          return (
                            <div
                              key={index}
                              className="px-3 py-2 rounded-md text-sm font-medium border"
                              style={{
                                backgroundColor: funcionarioCor
                                  ? `${funcionarioCor}15`
                                  : "#f1f5f9",
                                borderColor: funcionarioCor
                                  ? `${funcionarioCor}40`
                                  : "#e2e8f0",
                                color: "#1e293b",
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span>{servico?.servico?.nome || "Serviço"}</span>
                                {canViewValues && (
                                  <span className="text-green-700 font-semibold">
                                    {formatCurrency(servico?.preco || 0)}
                                  </span>
                                )}
                              </div>
                              {servico?.funcionario && (
                                <div className="text-xs text-bella-600 mt-1 flex items-center gap-1">
                                  <FiUser className="w-3 h-3" /> {servico.funcionario.nome}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-3 py-2 rounded-md text-sm font-medium border bg-gray-100 text-gray-600">
                          Nenhum serviço encontrado
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Coluna 2: Funcionários */}
                  <div>
                    <p className="text-sm font-semibold text-bella-700 mb-2 flex items-center">
                      <FiUsers className="w-4 h-4 mr-1" />
                      Funcionários:
                    </p>
                    {funcionarios.length > 0 ? (
                      <div className="space-y-1">
                        {funcionarios.map((funcionarioId) => {
                          let funcionario = null;

                          funcionario = agendamento.servicos?.find(
                            (s) => s.funcionario_id === funcionarioId,
                          )?.funcionario;

                          if (!funcionario) {
                            funcionario = agendamento.servicos?.find(
                              (s) => s.funcionario?.id === funcionarioId,
                            )?.funcionario;
                          }

                          if (
                            !funcionario &&
                            agendamento.funcionario?.id === funcionarioId
                          ) {
                            funcionario = agendamento.funcionario;
                          }

                          const cor = funcionariosCores[funcionarioId];

                          return (
                            <div
                              key={funcionarioId}
                              className="px-3 py-2 rounded-md text-sm font-medium border"
                              style={{
                                backgroundColor: cor ? `${cor}20` : "#f1f5f9",
                                borderColor: cor ? `${cor}60` : "#e2e8f0",
                                color: "#1e293b",
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                  style={{ backgroundColor: cor }}
                                >
                                  {funcionario?.nome?.charAt(0).toUpperCase() ||
                                    "?"}
                                </div>
                                <span>
                                  {funcionario?.nome || "Funcionário"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-md text-sm italic">
                        Não especificado
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Observações */}
              {agendamento.observacoes_usuario && (
                <div className="mb-3">
                  <p className="text-sm font-semibold text-bella-700 mb-1">
                    Observações:
                  </p>
                  <p className="text-sm text-bella-600 bg-white bg-opacity-70 px-3 py-2 rounded border">
                    {(() => {
                      const observacoes = agendamento.observacoes_usuario;
                      if (!observacoes) return "Sem observações específicas";

                      const hadCode = observacoes.includes('[SERVICOS:') || observacoes.includes('[FUNC:') || observacoes.includes('{"');
                      const cleaned = observacoes
                        .replace(/\[FUNC:[^\]]+\]/g, "")
                        .replace(/\[SERVICOS:.+?\]/g, "")
                        .replace(/\{[^}]*\}/g, "")
                        .replace(/\[[^\]]*\]/g, "")
                        .trim();

                      if (hadCode && process.env.NODE_ENV === 'development') {
                        console.warn('🧹 Código JSON removido das observações (Progress):', agendamento.id);
                      }

                      return cleaned || "Sem observações específicas";
                    })()}
                  </p>
                </div>
              )}

              {/* Valor Total */}
              {canViewValues && (
                <div className="bg-white bg-opacity-70 rounded-lg p-3 border">
                  <div className="flex items-center justify-between">
                    <span className="text-bella-600 font-medium">
                      Valor Total:
                    </span>
                    <span className="text-xl font-semibold text-green-600">
                      {formatCurrency(agendamento.valor_total)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col space-y-2 ml-4">
            <button
              onClick={() => onView?.(agendamento)}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              title="Ver detalhes"
            >
              <FiEye className="w-4 h-4" />
            </button>

            {canEdit && (
              <>
                {agendamento.status === "concluido" ? (
                  <button
                    onClick={() => onEditConcluido?.(agendamento)}
                    className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                    title="Editar concluído"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onEdit?.(agendamento)}
                      className="p-2 text-bella-600 hover:bg-bella-200 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>

                    {agendamento.status === "agendado" && (
                      <button
                        onClick={() => onIniciar?.(agendamento)}
                        className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                        title="Iniciar serviço"
                      >
                        <FiClock className="w-4 h-4" />
                      </button>
                    )}

                    {(agendamento.status === "agendado" || agendamento.status === "em_andamento" || isCompleted) && (
                      <button
                        onClick={() => onConcluir?.(agendamento)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Concluir"
                      >
                        <FiDollarSign className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => onDelete?.(agendamento.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
