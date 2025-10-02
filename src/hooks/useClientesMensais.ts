import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SimpleAuthContext";
import {
  getClientesMensais,
  getResumoClientesMensais,
  getDetalhesClienteMensal,
  registrarPagamentoMensal,
  atualizarTipoCliente,
} from "@/services/clientesMensaisService";
import { toast } from "@/hooks/use-toast";

export function useClientesMensais() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarClientesMensais = async () => {
    if (!user?.id) return [];

    try {
      setLoading(true);
      setError(null);
      const clientes = await getClientesMensais(user.id);
      return clientes;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast({
        title: "Erro ao carregar clientes mensais",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const carregarResumoClientesMensais = async (mesReferencia?: string) => {
    if (!user?.id) return [];

    try {
      setLoading(true);
      setError(null);
      const resumos = await getResumoClientesMensais(user.id, mesReferencia);
      return resumos;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast({
        title: "Erro ao carregar resumos",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const carregarDetalhesCliente = async (
    clienteId: string,
    mesReferencia?: string,
  ) => {
    if (!user?.id) return null;

    try {
      const detalhes = await getDetalhesClienteMensal(
        clienteId,
        user.id,
        mesReferencia,
      );
      return detalhes;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast({
        title: "Erro ao carregar detalhes",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const efetuarPagamentoMensal = async (
    clienteId: string,
    mesReferencia: string,
    valorPago: number,
    observacoes?: string,
  ) => {
    try {
      const pagamento = await registrarPagamentoMensal(
        clienteId,
        mesReferencia,
        valorPago,
        observacoes,
      );

      toast({
        title: "Pagamento registrado",
        description: `Pagamento de ${formatCurrency(valorPago)} registrado com sucesso`,
      });

      return pagamento;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao registrar pagamento";
      toast({
        title: "Erro ao registrar pagamento",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const configurarClienteMensal = async (clienteId: string) => {
    if (!user?.id) return;

    try {
      await atualizarTipoCliente(clienteId, user.id, "mensal");

      toast({
        title: "Cliente configurado",
        description: "Cliente configurado como mensal com sucesso",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao configurar cliente como mensal";
      toast({
        title: "Erro ao configurar cliente",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const removerClienteMensal = async (clienteId: string) => {
    if (!user?.id) return;

    try {
      await atualizarTipoCliente(clienteId, user.id, "normal");

      toast({
        title: "Cliente alterado",
        description: "Cliente alterado para tipo normal",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao alterar tipo do cliente";
      toast({
        title: "Erro ao alterar cliente",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return {
    loading,
    error,
    carregarClientesMensais,
    carregarResumoClientesMensais,
    carregarDetalhesCliente,
    efetuarPagamentoMensal,
    configurarClienteMensal,
    removerClienteMensal,
    formatCurrency,
  };
}
