import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SimpleAuthContext";
import {
  getServicos,
  createServico,
  updateServico,
  deleteServico,
  corrigirServicosSemDuracao,
} from "@/services/database";
// Tipo Servico local
interface Servico {
  id: string;
  user_id?: string;
  user_simple_id?: string;
  nome: string;
  descricao?: string;
  preco: number;
  duracao_minutos?: number;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}
import { toast } from "@/hooks/use-toast";
import { executeWithRetry } from "@/utils/connectionRecovery";

export function useServicos() {
  const { user } = useAuth();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega os serviços do usuário (com retry e cache)
  const loadServicos = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Carregar cache inicial para UX rápido
      try {
        const cached = localStorage.getItem(`servicos_cache_${user.id}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed?.data) && parsed.data.length > 0) {
            setServicos(parsed.data);
          }
        }
      } catch {}

      // Buscar do banco com retry
      const servicosData = await executeWithRetry(
        () => getServicos(user.id),
        "fetch servicos"
      );
      setServicos(servicosData);

      // Salvar cache
      try {
        localStorage.setItem(
          `servicos_cache_${user.id}`,
          JSON.stringify({ data: servicosData, timestamp: Date.now() })
        );
      } catch {}

      // Corrigir serviços sem duração automaticamente em background
      try {
        const corrigidos = await corrigirServicosSemDuracao(user.id);
        if (corrigidos > 0) {
          console.log(`✅ ${corrigidos} serviços corrigidos automaticamente`);
          // Recarregar os serviços para pegar as correções
          setTimeout(async () => {
            const atualizados = await getServicos(user.id);
            setServicos(atualizados);
            try {
              localStorage.setItem(
                `servicos_cache_${user.id}`,
                JSON.stringify({ data: atualizados, timestamp: Date.now() })
              );
            } catch {}
          }, 1000);
        }
      } catch (correctionError) {
        console.warn('⚠️ Erro ao corrigir serviços automaticamente:', correctionError);
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);

      // Fallback para cache
      try {
        const cached = localStorage.getItem(`servicos_cache_${user.id}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed?.data) && parsed.data.length > 0) {
            console.warn('🔁 Usando serviços em cache devido a problemas de conectividade');
            setServicos(parsed.data);
            setLoading(false);
            return;
          }
        }
      } catch {}

      // Notificações amigáveis
      const friendly = message.includes('Failed to fetch') ? 'Problema de conectividade. Tente novamente mais tarde.' : message;
      toast({ title: 'Erro ao carregar serviços', description: friendly, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Adiciona um novo serviço
  const addServico = async (
    servicoData: Omit<
      Servico,
      "id" | "user_id" | "user_simple_id" | "created_at" | "updated_at"
    >,
  ) => {
    if (!user?.id) return;

    try {
      const novoServico = await createServico(user.id, servicoData);
      setServicos((prev) => [...prev, novoServico]);

      toast({
        title: "Serviço adicionado",
        description: `${novoServico.nome} foi adicionado com sucesso.`,
      });

      return novoServico;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar serviço";
      toast({
        title: "Erro ao adicionar serviço",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Atualiza um serviço existente
  const editServico = async (
    servicoId: string,
    servicoData: Partial<
      Omit<
        Servico,
        "id" | "user_id" | "user_simple_id" | "created_at" | "updated_at"
      >
    >,
  ) => {
    if (!user?.id) return;

    try {
      const servicoAtualizado = await updateServico(
        servicoId,
        user.id,
        servicoData,
      );
      setServicos((prev) =>
        prev.map((servico) =>
          servico.id === servicoId ? servicoAtualizado : servico,
        ),
      );

      toast({
        title: "Serviço atualizado",
        description: "As informações do serviço foram atualizadas.",
      });

      return servicoAtualizado;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao atualizar serviço";
      toast({
        title: "Erro ao atualizar serviço",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Função para corrigir serviços manualmente
  const corrigirServicos = async () => {
    if (!user?.id) return;

    try {
      const corrigidos = await corrigirServicosSemDuracao(user.id);
      if (corrigidos > 0) {
        toast({
          title: "Serviços corrigidos",
          description: `${corrigidos} serviços foram atualizados com durações padrão.`,
        });
        // Recarregar serviços
        await loadServicos();
      } else {
        toast({
          title: "Nenhuma correção necessária",
          description: "Todos os serviços já possuem duração definida.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao corrigir serviços",
        description: "Não foi possível corrigir os serviços automaticamente.",
        variant: "destructive",
      });
    }
  };

  // Remove um serviço (marca como inativo)
  const removeServico = async (servicoId: string) => {
    if (!user?.id) return;

    try {
      await deleteServico(servicoId, user.id);
      setServicos((prev) => prev.filter((servico) => servico.id !== servicoId));

      toast({
        title: "Serviço removido",
        description: "O serviço foi removido com sucesso.",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao remover serviço";
      toast({
        title: "Erro ao remover serviço",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Busca serviços por nome
  const searchServicos = (termo: string) => {
    if (!termo.trim()) return servicos;

    const termoLower = termo.toLowerCase();
    return servicos.filter(
      (servico) =>
        servico.nome.toLowerCase().includes(termoLower) ||
        servico.descricao?.toLowerCase().includes(termoLower),
    );
  };

  // Formata o preço para exibição
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  // Carrega serviços quando o usuário muda
  useEffect(() => {
    if (user?.id) {
      loadServicos();
    }
  }, [user?.id]);

  return {
    servicos,
    loading,
    error,
    addServico,
    editServico,
    removeServico,
    searchServicos,
    formatPrice,
    reload: loadServicos,
    corrigirServicos,
  };
}
