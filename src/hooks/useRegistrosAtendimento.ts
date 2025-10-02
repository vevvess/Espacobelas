import { useState, useEffect } from "react";
import { useAgendamentosRealTimeOptimized } from "./useAgendamentosRealTimeOptimized";

interface ProdutoUsado {
  id: string;
  categoria: "tinta" | "descolorante" | "toner" | "tratamento" | "outros";
  marca: string;
  produto: string;
  cor?: string;
  volume?: string;
  quantidade: string;
  observacoes: string;
}

interface RegistroAtendimento {
  id: string;
  clienteId: string;
  clienteNome: string;
  profissional: string;
  servicos: string[];
  produtos: ProdutoUsado[];
  observacoes: string;
  observacoesImportantes: string;
  data: Date;
  valor: number;
  tags: string[];
  tempoProcesso: string;
  resultadoFinal: string;
  proximoRetorno?: Date;
}

const REGISTROS_STORAGE_KEY = "bellas_registros_personalizados";

export function useRegistrosAtendimento() {
  const { agendamentos } = useAgendamentosRealTimeOptimized();
  const [registros, setRegistros] = useState<RegistroAtendimento[]>([]);

  // Carregar registros personalizados do localStorage
  const loadCustomRegistros = (): RegistroAtendimento[] => {
    try {
      const stored = localStorage.getItem(REGISTROS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Converter datas de string para Date objects
        return parsed.map((registro: any) => ({
          ...registro,
          data: new Date(registro.data),
          proximoRetorno: registro.proximoRetorno
            ? new Date(registro.proximoRetorno)
            : undefined,
        }));
      }
      return [];
    } catch (error) {
      console.error("Erro ao carregar registros do localStorage:", error);
      return [];
    }
  };

  // Salvar registros personalizados no localStorage
  const saveCustomRegistros = (customRegistros: RegistroAtendimento[]) => {
    try {
      localStorage.setItem(
        REGISTROS_STORAGE_KEY,
        JSON.stringify(customRegistros),
      );
    } catch (error) {
      console.error("Erro ao salvar registros no localStorage:", error);
    }
  };

  // Converter agendamentos em registros de atendimento e mesclar com registros personalizados
  useEffect(() => {
    const registrosFromAgendamentos = agendamentos
      .filter((agendamento) => agendamento.status === "concluido")
      .map((agendamento) => {
        // Obter serviços do agendamento
        const servicos =
          agendamento.servicos?.map(
            (s) => s.servico?.nome || "Serviço não especificado",
          ) || [];

        // Calcular valor total
        const valorTotal =
          agendamento.servicos?.reduce(
            (total, s) => total + (Number(s.preco) || 0),
            0,
          ) || 0;

        // Obter profissional principal
        const profissional =
          agendamento.servicos?.[0]?.funcionario?.nome ||
          "Profissional não especificado";

        const registro: RegistroAtendimento = {
          id: agendamento.id,
          clienteId: agendamento.cliente_id,
          clienteNome: agendamento.cliente?.nome || "Cliente não especificado",
          profissional: profissional,
          servicos: servicos,
          produtos: [], // Por enquanto vazio, pode ser expandido
          observacoes: agendamento.observacoes || "",
          observacoesImportantes: "", // Pode ser expandido
          data: new Date(agendamento.data_hora),
          valor: valorTotal,
          tags: [], // Pode ser expandido baseado no tipo de serviço
          tempoProcesso: "", // Pode ser calculado baseado nos serviços
          resultadoFinal: "", // Pode ser expandido
        };

        return registro;
      });

    // Carregar registros personalizados do localStorage
    const customRegistros = loadCustomRegistros();

    // Mesclar registros dos agendamentos com registros personalizados
    const todosRegistros = [...registrosFromAgendamentos, ...customRegistros];

    setRegistros(todosRegistros);
  }, [agendamentos]);

  // Adicionar novo registro personalizado
  const addRegistro = (novoRegistro: Omit<RegistroAtendimento, "id">) => {
    const registro: RegistroAtendimento = {
      ...novoRegistro,
      id: `custom_${Date.now()}`,
    };

    setRegistros((prev) => {
      const novosRegistros = [...prev, registro];

      // Salvar apenas registros personalizados no localStorage
      const customRegistros = novosRegistros.filter((r) =>
        r.id.startsWith("custom_"),
      );
      saveCustomRegistros(customRegistros);

      return novosRegistros;
    });
  };

  // Atualizar registro existente
  const updateRegistro = (
    id: string,
    dadosAtualizados: Partial<RegistroAtendimento>,
  ) => {
    setRegistros((prev) => {
      const registrosAtualizados = prev.map((registro) =>
        registro.id === id ? { ...registro, ...dadosAtualizados } : registro,
      );

      // Se for um registro personalizado, salvar no localStorage
      if (id.startsWith("custom_")) {
        const customRegistros = registrosAtualizados.filter((r) =>
          r.id.startsWith("custom_"),
        );
        saveCustomRegistros(customRegistros);
      }

      return registrosAtualizados;
    });
  };

  // Remover registro
  const removeRegistro = (id: string) => {
    setRegistros((prev) => {
      const registrosFiltrados = prev.filter((registro) => registro.id !== id);

      // Se for um registro personalizado, atualizar localStorage
      if (id.startsWith("custom_")) {
        const customRegistros = registrosFiltrados.filter((r) =>
          r.id.startsWith("custom_"),
        );
        saveCustomRegistros(customRegistros);
      }

      return registrosFiltrados;
    });
  };

  // Obter registros de um cliente específico
  const getRegistrosByCliente = (clienteId: string) => {
    return registros
      .filter((registro) => registro.clienteId === clienteId)
      .sort((a, b) => b.data.getTime() - a.data.getTime());
  };

  // Limpar todos os registros personalizados
  const clearCustomRegistros = () => {
    try {
      localStorage.removeItem(REGISTROS_STORAGE_KEY);
      // Recarregar apenas registros dos agendamentos
      const registrosFromAgendamentos = agendamentos
        .filter((agendamento) => agendamento.status === "concluido")
        .map((agendamento) => {
          const servicos =
            agendamento.servicos?.map(
              (s) => s.servico?.nome || "Serviço não especificado",
            ) || [];
          const valorTotal =
            agendamento.servicos?.reduce(
              (total, s) => total + (Number(s.preco) || 0),
              0,
            ) || 0;
          const profissional =
            agendamento.servicos?.[0]?.funcionario?.nome ||
            "Profissional não especificado";

          return {
            id: agendamento.id,
            clienteId: agendamento.cliente_id,
            clienteNome:
              agendamento.cliente?.nome || "Cliente não especificado",
            profissional: profissional,
            servicos: servicos,
            produtos: [],
            observacoes: agendamento.observacoes || "",
            observacoesImportantes: "",
            data: new Date(agendamento.data_hora),
            valor: valorTotal,
            tags: [],
            tempoProcesso: "",
            resultadoFinal: "",
          } as RegistroAtendimento;
        });
      setRegistros(registrosFromAgendamentos);
    } catch (error) {
      console.error("Erro ao limpar registros personalizados:", error);
    }
  };

  return {
    registros,
    addRegistro,
    updateRegistro,
    removeRegistro,
    getRegistrosByCliente,
    clearCustomRegistros,
  };
}
