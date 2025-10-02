/**
 * Hook de Agendamentos Híbrido
 * Usa PostgreSQL remoto quando disponível, IndexedDB local como fallback
 * Switch automático e transparente para o usuário
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAgendamentos,
  createAgendamento,
  updateAgendamento,
  deleteAgendamento,
  getAgendamentosStats,
  debugSystemStatus
} from '@/services/agendamentoHybridService';
import { getSystemStatus } from '@/lib/hybridDatabase';

interface AgendamentoModerno {
  id: string;
  user_simple_id: string;
  cliente_id: string;
  servico_id: string;
  funcionario_id?: string;
  data_hora: Date;
  status: string;
  observacoes?: string;
  valor?: number;
  created_at: Date;
  updated_at: Date;
  cliente?: {
    nome: string;
    telefone?: string;
  };
  servico?: {
    nome: string;
    preco: number;
    duracao_minutos?: number;
  };
}

interface UseAgendamentosHybridState {
  agendamentos: AgendamentoModerno[];
  loading: boolean;
  error: string | null;
  stats: any;
  systemStatus: any;
  isRealTime: boolean;
  isChangingDate: boolean;
  hasCachedData: boolean;
}

export function useAgendamentosHybrid(
  dataInicio: Date,
  dataFim: Date,
  userId: string = 'default-user'
) {
  const [state, setState] = useState<UseAgendamentosHybridState>({
    agendamentos: [],
    loading: true,
    error: null,
    stats: null,
    systemStatus: null,
    isRealTime: true, // Híbrido é sempre "tempo real"
    isChangingDate: false,
    hasCachedData: false
  });

  const loadingRef = useRef(false);
  const cacheRef = useRef(new Map<string, AgendamentoModerno[]>());

  // Gerar chave de cache baseada nas datas
  const getCacheKey = useCallback((start: Date, end: Date) => {
    return `${start.toISOString()}-${end.toISOString()}`;
  }, []);

  // Carregar agendamentos
  const loadAgendamentos = useCallback(async (
    start: Date,
    end: Date,
    isDateChange = false
  ) => {
    if (loadingRef.current) return;

    const cacheKey = getCacheKey(start, end);
    const cachedData = cacheRef.current.get(cacheKey);

    // Se mudando data e tem cache, usar imediatamente
    if (isDateChange && cachedData) {
      setState(prev => ({
        ...prev,
        agendamentos: cachedData,
        loading: false,
        isChangingDate: false,
        hasCachedData: true,
        error: null
      }));
      return;
    }

    loadingRef.current = true;
    
    setState(prev => ({
      ...prev,
      loading: true,
      isChangingDate: isDateChange,
      error: null
    }));

    try {
      console.log(`🔄 Carregando agendamentos híbridos ${start.toDateString()} → ${end.toDateString()}`);
      
      // Carregar dados
      const data = await getAgendamentos(userId, start, end);
      
      // Converter datas
      const agendamentos = data.map(ag => ({
        ...ag,
        data_hora: new Date(ag.data_hora),
        created_at: new Date(ag.created_at),
        updated_at: new Date(ag.updated_at)
      }));

      // Atualizar cache
      cacheRef.current.set(cacheKey, agendamentos);
      
      // Limitar cache a 10 entradas
      if (cacheRef.current.size > 10) {
        const firstKey = cacheRef.current.keys().next().value;
        cacheRef.current.delete(firstKey);
      }

      // Carregar estatísticas
      const stats = await getAgendamentosStats(userId);
      const systemStatus = getSystemStatus();

      setState(prev => ({
        ...prev,
        agendamentos,
        stats,
        systemStatus,
        loading: false,
        isChangingDate: false,
        hasCachedData: cacheRef.current.has(cacheKey),
        error: null
      }));

      console.log(`✅ Agendamentos híbridos carregados: ${agendamentos.length} registros (modo: ${systemStatus.mode})`);

    } catch (error: any) {
      console.error('❌ Erro ao carregar agendamentos híbridos:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        isChangingDate: false,
        error: error?.message || 'Erro ao carregar agendamentos'
      }));
    } finally {
      loadingRef.current = false;
    }
  }, [userId, getCacheKey]);

  // Criar agendamento
  const createAgendamentoHybrid = useCallback(async (agendamentoData: {
    cliente_id: string;
    servico_id: string;
    data_hora: Date;
    observacoes?: string;
    valor?: number;
    funcionario_id?: string;
  }) => {
    try {
      console.log('➕ Criando agendamento híbrido...');
      
      const novoAgendamento = await createAgendamento(userId, agendamentoData);
      
      // Invalidar cache relevante
      cacheRef.current.clear();
      
      // Recarregar dados
      await loadAgendamentos(dataInicio, dataFim);
      
      console.log('✅ Agendamento híbrido criado com sucesso');
      return novoAgendamento;
      
    } catch (error: any) {
      console.error('❌ Erro ao criar agendamento híbrido:', error);
      throw error;
    }
  }, [userId, dataInicio, dataFim, loadAgendamentos]);

  // Atualizar agendamento
  const updateAgendamentoHybrid = useCallback(async (
    agendamentoId: string,
    updates: Partial<{
      status: string;
      data_hora: Date;
      observacoes: string;
      valor: number;
      funcionario_id: string;
    }>
  ) => {
    try {
      console.log('✏️ Atualizando agendamento híbrido...');
      
      const agendamentoAtualizado = await updateAgendamento(agendamentoId, userId, updates);
      
      // Invalidar cache
      cacheRef.current.clear();
      
      // Recarregar dados
      await loadAgendamentos(dataInicio, dataFim);
      
      console.log('✅ Agendamento híbrido atualizado com sucesso');
      return agendamentoAtualizado;
      
    } catch (error: any) {
      console.error('❌ Erro ao atualizar agendamento híbrido:', error);
      throw error;
    }
  }, [userId, dataInicio, dataFim, loadAgendamentos]);

  // Deletar agendamento
  const deleteAgendamentoHybrid = useCallback(async (agendamentoId: string) => {
    try {
      console.log('🗑️ Deletando agendamento híbrido...');
      
      const success = await deleteAgendamento(agendamentoId, userId);
      
      if (success) {
        // Invalidar cache
        cacheRef.current.clear();
        
        // Recarregar dados
        await loadAgendamentos(dataInicio, dataFim);
        
        console.log('✅ Agendamento híbrido deletado com sucesso');
      }
      
      return success;
      
    } catch (error: any) {
      console.error('❌ Erro ao deletar agendamento híbrido:', error);
      throw error;
    }
  }, [userId, dataInicio, dataFim, loadAgendamentos]);

  // Refresh manual
  const refresh = useCallback(async () => {
    cacheRef.current.clear();
    await loadAgendamentos(dataInicio, dataFim);
  }, [dataInicio, dataFim, loadAgendamentos]);

  // Efeito para carregar dados quando as datas mudam
  useEffect(() => {
    const isDateChange = !loadingRef.current;
    loadAgendamentos(dataInicio, dataFim, isDateChange);
  }, [dataInicio, dataFim, loadAgendamentos]);

  // Polling suave para atualizações (só se estiver no remoto)
  useEffect(() => {
    if (!state.systemStatus?.remoteAvailable) {
      return; // Não fazer polling se estiver offline
    }

    const interval = setInterval(() => {
      if (!loadingRef.current && !state.isChangingDate) {
        loadAgendamentos(dataInicio, dataFim);
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [dataInicio, dataFim, loadAgendamentos, state.systemStatus?.remoteAvailable, state.isChangingDate]);

  // Debug helpers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).debugHybridHook = () => {
        console.log('🔍 Estado do Hook Híbrido:', {
          agendamentosCount: state.agendamentos.length,
          loading: state.loading,
          systemStatus: state.systemStatus,
          cacheSize: cacheRef.current.size,
          error: state.error
        });
        return state;
      };
      
      (window as any).clearHybridCache = () => {
        cacheRef.current.clear();
        console.log('🧹 Cache híbrido limpo');
      };
      
      console.log('🔧 Debug: Use window.debugHybridHook() e window.clearHybridCache()');
    }
  }, [state]);

  return {
    agendamentos: state.agendamentos,
    loading: state.loading,
    error: state.error,
    stats: state.stats,
    systemStatus: state.systemStatus,
    isRealTime: state.isRealTime,
    isChangingDate: state.isChangingDate,
    hasCachedData: state.hasCachedData,
    createAgendamento: createAgendamentoHybrid,
    updateAgendamento: updateAgendamentoHybrid,
    deleteAgendamento: deleteAgendamentoHybrid,
    refresh,
    debugSystemStatus
  };
}

export default useAgendamentosHybrid;
