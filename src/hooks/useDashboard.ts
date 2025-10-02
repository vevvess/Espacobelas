import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SimpleAuthContext";
import {
  getDashboardStats,
  getTransacoes,
  createTransacao,
} from "@/services/database";
import { Transacao } from "@/lib/neon";
import { toast } from "@/hooks/use-toast";
import { offlineStorage } from "@/lib/offlineStorage";
import { networkDetector } from "@/lib/networkDetection";
import { withCache } from "@/lib/dataCache";

interface DashboardStats {
  agendamentosHoje: number;
  receitaMes: number;
  totalClientes: number;
  proximosAgendamentos: Array<{
    id: string;
    data_hora: Date;
    cliente_nome: string;
    servico_nome: string;
  }>;
}

export function useDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega estatísticas do dashboard com fallback robusto
  const loadDashboardStats = async () => {
    if (!user?.id) return;

    // Se não temos rede, usar dados offline imediatamente
    if (!networkDetector.getStatus()) {
      console.log('🔴 Sem rede - carregando dados offline');
      const offlineData = offlineStorage.get(`dashboard_${user.id}`) ||
                          offlineStorage.generateOfflineDefaults(user.id).dashboard;
      setStats(offlineData);
      setLoading(false);
      toast({
        title: "Modo offline",
        description: "Sem conexão - usando dados salvos localmente.",
        variant: "default",
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dashboardData = await withCache(
        `dashboard_stats_${user.id}`,
        () => getDashboardStats(user.id),
        2 * 60 * 1000 // Cache por 2 minutos para dados do dashboard
      );
      setStats(dashboardData);

      // Salvar no sistema offline robusto
      offlineStorage.save(`dashboard_${user.id}`, dashboardData);

      // Manter compatibilidade com cache antigo
      try {
        localStorage.setItem(
          `dashboard_cache_${user.id}`,
          JSON.stringify(dashboardData),
        );
      } catch (cacheErr) {
        console.warn("Erro ao salvar cache do dashboard:", cacheErr);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";

      console.error("Dashboard loading error:", JSON.stringify({
        errorMessage: errorMessage,
        errorType: err?.constructor?.name || typeof err,
        userId: user.id,
        timestamp: new Date().toISOString()
      }, null, 2));

      // Tentar carregar do sistema offline primeiro
      let cacheLoaded = false;

      // Priorizar sistema offline robusto
      const offlineData = offlineStorage.get(`dashboard_${user.id}`);
      if (offlineData) {
        setStats(offlineData);
        cacheLoaded = true;
        console.log("📁 Dashboard carregado do sistema offline");
        setError(null);

        toast({
          title: "Modo offline",
          description: "Usando dados salvos devido a problema de conectividade.",
          variant: "default",
        });
        return;
      }

      // Fallback para cache antigo se offline system falhar
      try {
        const cached = localStorage.getItem(`dashboard_cache_${user.id}`);
        if (cached) {
          const statsCache = JSON.parse(cached);
          setStats(statsCache);
          cacheLoaded = true;
          console.log("Dashboard carregado do cache antigo devido a erro de conexão");
          setError(null);

          toast({
            title: "Modo offline",
            description: "Usando dados em cache devido a problema de conectividade.",
            variant: "default",
          });
          return;
        }
      } catch (cacheErr) {
        console.warn("Erro ao carregar cache do dashboard:", cacheErr);
      }

      // Se não conseguiu carregar do cache, gerar defaults offline
      if (!cacheLoaded) {
        const defaults = offlineStorage.generateOfflineDefaults(user.id);
        setStats(defaults.dashboard);

        setError(errorMessage);

        // Toast diferenciado baseado no tipo de erro
        if (errorMessage.includes("Failed to fetch") || errorMessage.includes("fetch")) {
          toast({
            title: "Problema de conectividade",
            description: "Não foi possível conectar ao banco de dados. Tente recarregar a página.",
            variant: "destructive",
          });
        } else if (errorMessage.includes("Timeout")) {
          toast({
            title: "Conexão lenta",
            description: "O banco está respondendo lentamente. Aguarde um momento.",
            variant: "default",
          });
        } else {
          toast({
            title: "Erro ao carregar dashboard",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Carrega transações do período
  const loadTransacoes = async (dataInicio?: Date, dataFim?: Date) => {
    if (!user?.id) return;

    try {
      const transacoesData = await getTransacoes(user.id, dataInicio, dataFim);
      setTransacoes(transacoesData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar transações";
      toast({
        title: "Erro ao carregar transações",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Adiciona uma nova transação
  const addTransacao = async (transacaoData: {
    agendamento_id?: string;
    tipo: "receita" | "despesa";
    valor: number;
    descricao?: string;
  }) => {
    if (!user?.id) return;

    try {
      const novaTransacao = await createTransacao(user.id, transacaoData);
      setTransacoes((prev) => [novaTransacao, ...prev]);

      // Atualiza as estatísticas
      await loadDashboardStats();

      toast({
        title: "Transação adicionada",
        description: `${transacaoData.tipo === "receita" ? "Receita" : "Despesa"} de ${formatCurrency(transacaoData.valor)} registrada.`,
      });

      return novaTransacao;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao adicionar transação";
      toast({
        title: "Erro ao adicionar transação",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Calcula totais do período
  const calcularTotais = (dataInicio?: Date, dataFim?: Date) => {
    let transacoesFiltradas = transacoes;

    if (dataInicio && dataFim) {
      transacoesFiltradas = transacoes.filter(
        (t) => t.data_transacao >= dataInicio && t.data_transacao <= dataFim,
      );
    }

    const receitas = transacoesFiltradas
      .filter((t) => t.tipo === "receita")
      .reduce((sum, t) => sum + t.valor, 0);

    const despesas = transacoesFiltradas
      .filter((t) => t.tipo === "despesa")
      .reduce((sum, t) => sum + t.valor, 0);

    const lucro = receitas - despesas;

    return { receitas, despesas, lucro };
  };

  // Busca transações por tipo
  const getTransacoesPorTipo = (tipo: "receita" | "despesa") => {
    return transacoes.filter((t) => t.tipo === tipo);
  };

  // Busca transações do mês atual
  const getTransacoesMesAtual = () => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    return transacoes.filter(
      (t) => t.data_transacao >= inicioMes && t.data_transacao <= fimMes,
    );
  };

  // Formata valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Formata data para exibição
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  // Carrega dados quando o usuário muda
  useEffect(() => {
    if (user?.id) {
      loadDashboardStats();
      loadTransacoes();
    }
  }, [user?.id]);

  // Atualiza estatísticas do dashboard quando houver alterações em agendamentos
  useEffect(() => {
    if (!user?.id) return;
    let timer: number | undefined;
    const onAgendamentoChanged = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        loadDashboardStats();
      }, 800);
    };
    window.addEventListener('agendamento-changed', onAgendamentoChanged as any);
    return () => {
      window.removeEventListener('agendamento-changed', onAgendamentoChanged as any);
      if (timer) window.clearTimeout(timer);
    };
  }, [user?.id]);

  return {
    stats,
    transacoes,
    loading,
    error,
    addTransacao,
    calcularTotais,
    getTransacoesPorTipo,
    getTransacoesMesAtual,
    formatCurrency,
    formatDate,
    reload: loadDashboardStats,
    reloadTransacoes: loadTransacoes,
  };
}
