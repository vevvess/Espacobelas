import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SimpleAuthContext";
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
} from "@/services/database";
// Tipo Cliente local
interface Cliente {
  id: string;
  user_id?: string;
  user_simple_id?: string;
  nome: string;
  telefone?: string;
  email?: string;
  data_nascimento?: Date;
  endereco?: string;
  observacoes?: string;
  tipo_cliente?: string;
  created_at: Date;
  updated_at: Date;
}
import { toast } from "@/hooks/use-toast";

export function useClientes() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega os clientes do usuário com cache e fallback
  const loadClientes = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const clientesData = await getClientes(user.id);
      setClientes(clientesData);

      // Salvar no cache local
      try {
        localStorage.setItem(
          `clientes_cache_${user.id}`,
          JSON.stringify(clientesData),
        );
      } catch (cacheErr) {
        console.warn("Erro ao salvar cache de clientes:", cacheErr);
      }
    } catch (err: any) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);

      console.error("Erro detalhado ao carregar clientes:", {
        error: err,
        message: errorMessage,
        userId: user.id,
      });

      // Tentar carregar do cache como fallback
      try {
        const cached = localStorage.getItem(`clientes_cache_${user.id}`);
        if (cached) {
          const clientesCache = JSON.parse(cached);
          setClientes(clientesCache);
          console.log("Carregado clientes do cache:", clientesCache.length);

          toast({
            title: "Modo offline",
            description:
              "Carregando clientes do cache local devido a problema de conexão.",
            variant: "default",
          });
          return; // Sair sem mostrar erro se conseguiu carregar do cache
        }
      } catch (cacheErr) {
        console.warn("Erro ao carregar cache de clientes:", cacheErr);
      }

      // Se não conseguiu carregar do cache, usar lista vazia
      setClientes([]);

      // Verificar se é erro de conexão
      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("conexão")
      ) {
        toast({
          title: "Erro de conexão",
          description:
            "Não foi possível conectar ao banco. Usando modo offline.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao carregar clientes",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Adiciona um novo cliente
  const addCliente = async (
    clienteData: Omit<
      Cliente,
      "id" | "user_id" | "user_simple_id" | "created_at" | "updated_at"
    > & { tipo_cliente?: "normal" | "mensal" },
  ) => {
    if (!user?.id) return;

    try {
      const novoCliente = await createCliente(user.id, clienteData);
      setClientes((prev) => [...prev, novoCliente]);

      toast({
        title: "Cliente adicionado",
        description: `${novoCliente.nome} foi adicionado com sucesso.`,
      });

      return novoCliente;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar cliente";
      toast({
        title: "Erro ao adicionar cliente",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Atualiza um cliente existente
  const editCliente = async (
    clienteId: string,
    clienteData: Partial<
      Omit<
        Cliente,
        "id" | "user_id" | "user_simple_id" | "created_at" | "updated_at"
      >
    >,
  ) => {
    if (!user?.id) return;

    try {
      const clienteAtualizado = await updateCliente(
        clienteId,
        user.id,
        clienteData,
      );
      setClientes((prev) =>
        prev.map((cliente) =>
          cliente.id === clienteId ? clienteAtualizado : cliente,
        ),
      );

      toast({
        title: "Cliente atualizado",
        description: "As informações do cliente foram atualizadas.",
      });

      return clienteAtualizado;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao atualizar cliente";
      toast({
        title: "Erro ao atualizar cliente",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Remove um cliente
  const removeCliente = async (clienteId: string) => {
    if (!user?.id) return;

    try {
      await deleteCliente(clienteId, user.id);
      setClientes((prev) => prev.filter((cliente) => cliente.id !== clienteId));

      toast({
        title: "Cliente removido",
        description: "O cliente foi removido com sucesso.",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao remover cliente";
      toast({
        title: "Erro ao remover cliente",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Busca clientes por nome
  const searchClientes = (termo: string) => {
    if (!termo.trim()) return clientes;

    const termoLower = termo.toLowerCase();
    return clientes.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(termoLower) ||
        cliente.telefone?.includes(termo) ||
        cliente.email?.toLowerCase().includes(termoLower),
    );
  };

  // Carrega clientes quando o usuário muda
  useEffect(() => {
    if (user?.id) {
      // Tentar carregar do cache primeiro para melhor UX
      try {
        const cached = localStorage.getItem(`clientes_cache_${user.id}`);
        if (cached) {
          const clientesCache = JSON.parse(cached);
          setClientes(clientesCache);
          setLoading(false);
          console.log("Clientes carregados do cache inicialmente");
        }
      } catch (err) {
        console.warn("Erro ao carregar cache inicial:", err);
      }

      // Depois tentar carregar do banco em background
      loadClientes();
    }
  }, [user?.id]);

  return {
    clientes,
    loading,
    error,
    addCliente,
    editCliente,
    removeCliente,
    searchClientes,
    reload: loadClientes,
  };
}
