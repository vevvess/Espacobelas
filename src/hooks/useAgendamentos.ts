import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SimpleAuthContext";
import {
  createAgendamento,
  updateAgendamento,
  deleteAgendamento,
} from "@/services/database";
import { getAgendamentosWithFuncionario } from "@/services/agendamentoServiceImproved";
import { Agendamento } from "@/lib/neon";
import { toast } from "@/hooks/use-toast";

export function useAgendamentos() {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega os agendamentos do usuário
  const loadAgendamentos = async (dataInicio?: Date, dataFim?: Date) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const agendamentosData = await getAgendamentosWithFuncionario(
        user.id,
        dataInicio,
        dataFim,
      );
      setAgendamentos(agendamentosData);

      // Salvar no cache
      try {
        const cacheKey = `agendamentos_cache_${user.id}`;
        localStorage.setItem(cacheKey, JSON.stringify(agendamentosData));
      } catch (cacheErr) {
        console.warn("Erro ao salvar cache de agendamentos:", cacheErr);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";

      console.error("Agendamentos loading error:", JSON.stringify({
        errorMessage: errorMessage,
        errorType: err?.constructor?.name || typeof err,
        userId: user.id,
        timestamp: new Date().toISOString()
      }, null, 2));

      // Tentar carregar do cache
      try {
        const cacheKey = `agendamentos_cache_${user.id}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const agendamentosCache = JSON.parse(cached);
          setAgendamentos(agendamentosCache);
          console.log("Agendamentos carregados do cache");

          toast({
            title: "Modo offline",
            description: "Carregando agendamentos do cache local.",
            variant: "default",
          });
          return;
        }
      } catch (cacheErr) {
        console.warn("Erro ao carregar cache de agendamentos:", cacheErr);
      }

      // Se não conseguiu carregar do cache
      setAgendamentos([]);
      setError(errorMessage);

      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("fetch")) {
        toast({
          title: "Problema de conectividade",
          description: "Não foi possível carregar agendamentos. Verifique sua conexão.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao carregar agendamentos",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Adiciona um novo agendamento
  const addAgendamento = async (agendamentoData: {
    cliente_id: string;
    servico_id: string;
    data_hora: Date;
    observacoes?: string;
    valor?: number;
  }) => {
    if (!user?.id) return;

    try {
      const novoAgendamento = await createAgendamento(user.id, agendamentoData);
      setAgendamentos((prev) => [...prev, novoAgendamento]);

      toast({
        title: "Agendamento criado",
        description: "O agendamento foi criado com sucesso.",
      });

      return novoAgendamento;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar agendamento";
      toast({
        title: "Erro ao criar agendamento",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Atualiza um agendamento existente
  const editAgendamento = async (
    agendamentoId: string,
    agendamentoData: Partial<{
      status: string;
      data_hora: Date;
      observacoes: string;
      valor: number;
    }>,
  ) => {
    if (!user?.id) return;

    try {
      const agendamentoAtualizado = await updateAgendamento(
        agendamentoId,
        user.id,
        agendamentoData,
      );
      setAgendamentos((prev) =>
        prev.map((agendamento) =>
          agendamento.id === agendamentoId
            ? agendamentoAtualizado
            : agendamento,
        ),
      );

      toast({
        title: "Agendamento atualizado",
        description: "O agendamento foi atualizado com sucesso.",
      });

      return agendamentoAtualizado;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao atualizar agendamento";
      toast({
        title: "Erro ao atualizar agendamento",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Remove um agendamento
  const removeAgendamento = async (agendamentoId: string) => {
    if (!user?.id) return;

    try {
      await deleteAgendamento(agendamentoId, user.id);
      setAgendamentos((prev) =>
        prev.filter((agendamento) => agendamento.id !== agendamentoId),
      );

      toast({
        title: "Agendamento removido",
        description: "O agendamento foi removido com sucesso.",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao remover agendamento";
      toast({
        title: "Erro ao remover agendamento",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Busca agendamentos por data
  const getAgendamentosPorData = (data: Date) => {
    const dataStr = data.toDateString();
    return agendamentos.filter(
      (agendamento) => agendamento.data_hora.toDateString() === dataStr,
    );
  };

  // Busca agendamentos de hoje
  const getAgendamentosHoje = () => {
    return getAgendamentosPorData(new Date());
  };

  // Busca próximos agendamentos
  const getProximosAgendamentos = (limite = 5) => {
    const agora = new Date();
    return agendamentos
      .filter((agendamento) => agendamento.data_hora > agora)
      .sort((a, b) => a.data_hora.getTime() - b.data_hora.getTime())
      .slice(0, limite);
  };

  // Busca agendamentos por status
  const getAgendamentosPorStatus = (status: string) => {
    return agendamentos.filter((agendamento) => agendamento.status === status);
  };

  // Formata data e hora para exibição
  const formatDateTime = (data: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(data);
  };

  // Formata apenas a hora
  const formatTime = (data: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(data);
  };

  // Carrega agendamentos quando o usuário muda
  useEffect(() => {
    if (user?.id) {
      loadAgendamentos();
    }
  }, [user?.id]);

  return {
    agendamentos,
    loading,
    error,
    addAgendamento,
    editAgendamento,
    removeAgendamento,
    getAgendamentosPorData,
    getAgendamentosHoje,
    getProximosAgendamentos,
    getAgendamentosPorStatus,
    formatDateTime,
    formatTime,
    reload: loadAgendamentos,
  };
}
