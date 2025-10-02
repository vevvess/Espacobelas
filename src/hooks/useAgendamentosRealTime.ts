import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { Agendamento } from "@/lib/neon";
import { toast } from "@/hooks/use-toast";
import { useRealTimeData, realTimeUpdater } from "@/lib/realTimeUpdater";
import { getAgendamentosWithFuncionario } from "@/services/agendamentoServiceImproved";
import { 
  createAgendamento as createAgendamentoDB,
  updateAgendamento as updateAgendamentoDB,
  deleteAgendamento as deleteAgendamentoDB
} from "@/services/database";

export function useAgendamentosRealTime(dataInicio?: Date, dataFim?: Date) {
  const { user } = useAuth();
  const [optimisticUpdates, setOptimisticUpdates] = useState<Agendamento[]>([]);

  // Query function para buscar agendamentos
  const queryAgendamentos = useCallback(async () => {
    if (!user?.id) throw new Error('Usuário não autenticado');
    
    return await getAgendamentosWithFuncionario(user.id, dataInicio, dataFim);
  }, [user?.id, dataInicio, dataFim]);

  // Hook de tempo real
  const {
    data: agendamentos,
    error,
    isLoading,
    refresh
  } = useRealTimeData(
    'agendamentos',
    queryAgendamentos,
    user?.id || '',
    {
      interval: 5000, // Polling a cada 5 segundos
      enabled: !!user?.id
    }
  );

  // Combinar dados reais com updates otimistas
  const finalAgendamentos = optimisticUpdates.length > 0 
    ? mergeOptimisticUpdates(agendamentos || [], optimisticUpdates)
    : agendamentos || [];

  // Criar agendamento com update otimista
  const createAgendamento = useCallback(async (agendamentoData: {
    cliente_id: string;
    servico_id: string;
    data_hora: Date;
    observacoes?: string;
    valor?: number;
  }) => {
    if (!user?.id) throw new Error('Usuário não autenticado');

    try {
      // Update otimista - adicionar temporariamente
      const tempId = `temp_${Date.now()}`;
      const optimisticAgendamento: Agendamento = {
        id: tempId,
        user_simple_id: user.id,
        cliente_id: agendamentoData.cliente_id,
        servico_id: agendamentoData.servico_id,
        data_hora: agendamentoData.data_hora,
        status: 'agendado',
        observacoes: agendamentoData.observacoes,
        valor: agendamentoData.valor,
        created_at: new Date(),
        updated_at: new Date(),
        // Dados placeholder
        cliente: { nome: 'Carregando...', telefone: '', tipo_cliente: 'normal' },
        servico: { nome: 'Carregando...', preco: 0, duracao_minutos: 0 }
      };

      setOptimisticUpdates(prev => [...prev, optimisticAgendamento]);

      // Executar criação real
      const novoAgendamento = await createAgendamentoDB(user.id, agendamentoData);

      // Remover update otimista e forçar refresh dos dados
      setOptimisticUpdates(prev => prev.filter(a => a.id !== tempId));
      await refresh();

      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso"
      });

      return novoAgendamento;
    } catch (error) {
      // Remover update otimista em caso de erro
      setOptimisticUpdates(prev => prev.filter(a => a.id !== tempId));
      
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar agendamento";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  }, [user?.id, refresh]);

  // Atualizar agendamento com update otimista
  const updateAgendamento = useCallback(async (
    agendamentoId: string,
    updates: Partial<{
      status: string;
      data_hora: Date;
      observacoes: string;
      valor: number;
      funcionario_id?: string;
      servico_id?: string;
    }>
  ) => {
    if (!user?.id) throw new Error('Usuário não autenticado');

    try {
      // Update otimista - aplicar mudanças temporariamente
      setOptimisticUpdates(prev => {
        const existing = prev.find(a => a.id === agendamentoId);
        if (existing) {
          return prev.map(a => a.id === agendamentoId ? { ...a, ...updates } : a);
        } else {
          // Se não está nos updates otimistas, buscar nos dados reais
          const realAgendamento = agendamentos?.find(a => a.id === agendamentoId);
          if (realAgendamento) {
            return [...prev, { ...realAgendamento, ...updates }];
          }
        }
        return prev;
      });

      // Executar atualização real
      const agendamentoAtualizado = await updateAgendamentoDB(agendamentoId, user.id, updates);

      // Remover update otimista e forçar refresh
      setOptimisticUpdates(prev => prev.filter(a => a.id !== agendamentoId));
      await refresh();

      toast({
        title: "Sucesso",
        description: "Agendamento atualizado com sucesso"
      });

      return agendamentoAtualizado;
    } catch (error) {
      // Remover update otimista em caso de erro
      setOptimisticUpdates(prev => prev.filter(a => a.id !== agendamentoId));
      
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar agendamento";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  }, [user?.id, agendamentos, refresh]);

  // Deletar agendamento com update otimista
  const deleteAgendamento = useCallback(async (agendamentoId: string) => {
    if (!user?.id) throw new Error('Usuário não autenticado');

    try {
      // Update otimista - remover temporariamente
      const agendamentoRemovido = agendamentos?.find(a => a.id === agendamentoId);
      setOptimisticUpdates(prev => [...prev.filter(a => a.id !== agendamentoId), 
        ...(agendamentoRemovido ? [{ ...agendamentoRemovido, _deleted: true }] : [])]);

      // Executar remoção real
      await deleteAgendamentoDB(agendamentoId, user.id);

      // Forçar refresh dos dados
      await refresh();

      toast({
        title: "Sucesso",
        description: "Agendamento removido com sucesso"
      });

      return true;
    } catch (error) {
      // Reverter update otimista em caso de erro
      setOptimisticUpdates(prev => prev.filter(a => a.id !== agendamentoId));
      
      const errorMessage = error instanceof Error ? error.message : "Erro ao remover agendamento";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  }, [user?.id, agendamentos, refresh]);

  // Forçar atualização manual
  const forceRefresh = useCallback(async () => {
    setOptimisticUpdates([]); // Limpar updates otimistas
    await refresh();
  }, [refresh]);

  return {
    agendamentos: finalAgendamentos,
    loading: isLoading,
    error,
    createAgendamento,
    updateAgendamento,
    deleteAgendamento,
    refresh: forceRefresh,
    isRealTime: true
  };
}

// Helper para merge de updates otimistas
function mergeOptimisticUpdates(
  realData: Agendamento[], 
  optimisticUpdates: Agendamento[]
): Agendamento[] {
  const result = [...realData];
  
  for (const update of optimisticUpdates) {
    if ('_deleted' in update) {
      // Remover item marcado como deletado
      const index = result.findIndex(item => item.id === update.id);
      if (index > -1) {
        result.splice(index, 1);
      }
    } else {
      const existingIndex = result.findIndex(item => item.id === update.id);
      if (existingIndex > -1) {
        // Atualizar item existente
        result[existingIndex] = { ...result[existingIndex], ...update };
      } else {
        // Adicionar novo item (criação otimista)
        result.push(update);
      }
    }
  }
  
  return result;
}
