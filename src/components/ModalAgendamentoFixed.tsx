import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  FiX,
  FiUser,
  FiCalendar,
  FiClock,
  FiPlus,
  FiTrash2,
  FiUserPlus,
  FiTool,
  FiCheck,
} from "react-icons/fi";
import { useClientes } from "@/hooks/useClientes";
import { useServicos } from "@/hooks/useServicos";
import { formatForDateTimeInput, dateTimeLocalToDate } from "@/lib/dateUtils";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { createCliente, createServico } from "@/services/database";
import {
  removeFuncionarioFromObservacoes,
  extractUserObservacoes,
} from "@/services/funcionarioService";
import { extractObservacoesUsuario } from "@/utils/observacoesBuilder";

interface ServicoSelecionado {
  servico_id: string;
  funcionario_id?: string;
  preco: number;
  nome?: string;
}

interface ModalAgendamentoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    cliente_id: string;
    data_hora: Date;
    observacoes?: string;
    servicos: ServicoSelecionado[];
    status: string;
  }) => Promise<void>;
  funcionarios: Array<{
    id: string;
    nome: string;
    username: string;
    is_admin: boolean;
    cor?: string;
  }>;
  agendamentoEditando?: any;
  onConfirmAndCompleteWithAnimation?: (data: any) => Promise<void>;
}

// Função para estimar duração de serviço baseado no nome
const estimarDuracaoServico = (nomeServico: string): number => {
  const nome = nomeServico.toLowerCase();

  if (nome.includes('cutilação') || nome.includes('cuticula')) {
    if (nome.includes('pé') && nome.includes('mão')) return 60;
    if (nome.includes('pé')) return 30;
    if (nome.includes('mão')) return 30;
    return 45;
  }

  if (nome.includes('escova')) {
    if (nome.includes('progressiva') || nome.includes('definitiva')) return 180;
    if (nome.includes('modeladora') || nome.includes('lisa')) return 90;
    return 60;
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

  return 60; // Duração padrão mais realista que 30min
};

export function ModalAgendamento({
  isOpen,
  onClose,
  onSave,
  funcionarios,
  agendamentoEditando,
  onConfirmAndCompleteWithAnimation,
}: ModalAgendamentoProps) {
  const { clientes, reload: reloadClientes } = useClientes();
  const { servicos, reload: reloadServicos } = useServicos();
  const { user } = useAuth();

  const [clienteId, setClienteId] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [buscaCliente, setBuscaCliente] = useState("");
  const [mostrarListaClientes, setMostrarListaClientes] = useState(false);
  const [indiceSelecionado, setIndiceSelecionado] = useState(-1);
  const [servicosSelecionados, setServicosSelecionados] = useState<
    ServicoSelecionado[]
  >([]);
  const [saving, setSaving] = useState(false);

  // Estados para criação rápida
  const [showNovoCliente, setShowNovoCliente] = useState(false);
  const [showNovoServico, setShowNovoServico] = useState(false);
  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    telefone: "",
    email: "",
  });
  const [novoServico, setNovoServico] = useState({
    nome: "",
    preco: 0,
    duracao_minutos: 60,
  });

  // Reset form quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      if (agendamentoEditando) {
        // Preencher form para edição
        setClienteId(agendamentoEditando.cliente_id || "");

        // Preencher nome do cliente na busca
        const clienteEncontrado = clientes.find(c => c.id === agendamentoEditando.cliente_id);
        if (clienteEncontrado) {
          setBuscaCliente(clienteEncontrado.nome);
        }

        // Formatar data para input datetime-local preservando timezone local
        const dataLocal = new Date(agendamentoEditando.data_hora);
        setDataHora(formatForDateTimeInput(dataLocal));

        // Extrair observações do usuário (sem tags técnicas) - versão robusta
        const observacoesLimpas = extractObservacoesUsuario(
          agendamentoEditando.observacoes || "",
        );
        setObservacoes(observacoesLimpas);

        // Carregar serviços - usar dados dos serviços processados
        const servicosParaEdicao = (agendamentoEditando.servicos || []).map(
          (servico: any) => {
            // Extrair funcionario_id de várias fontes possíveis
            let funcionario_id = servico.funcionario_id || "";

            // Se não tem funcionario_id diretamente, tentar extrair do objeto funcionario
            if (!funcionario_id && servico.funcionario?.id) {
              funcionario_id = servico.funcionario.id;
            }

            return {
              // No formato moderno, o ID do item de serviço representa o serviço selecionado
              servico_id: servico.id || "",
              funcionario_id: funcionario_id,
              preco: Number(servico.preco) || 0,
              nome: servico.servico?.nome || servico.nome || "",
            };
          },
        );

        setServicosSelecionados(servicosParaEdicao);
      } else {
        // Resetar form para novo agendamento
        setClienteId("");
        setBuscaCliente("");
        setMostrarListaClientes(false);
        setDataHora("");
        setObservacoes("");
        setServicosSelecionados([]);
      }
    }
  }, [isOpen, agendamentoEditando]);

  const adicionarServico = () => {
    setServicosSelecionados([
      ...servicosSelecionados,
      {
        servico_id: "",
        funcionario_id: "",
        preco: 0,
      },
    ]);
  };

  const removerServico = (index: number) => {
    setServicosSelecionados(servicosSelecionados.filter((_, i) => i !== index));
  };

  const atualizarServico = (
    index: number,
    campo: keyof ServicoSelecionado,
    valor: any,
  ) => {
    const novosServicos = [...servicosSelecionados];
    novosServicos[index] = { ...novosServicos[index], [campo]: valor };

    // Auto-preencher preço e duração quando serviço é selecionado
    if (campo === "servico_id") {
      const servico = servicos.find((s) => s.id === valor);
      if (servico) {
        novosServicos[index].preco = servico.preco;
        novosServicos[index].nome = servico.nome;

        // Se serviço não tem duração, estimar baseado no nome
        if (servico.duracao_minutos && servico.duracao_minutos > 0) {
          novosServicos[index].duracao_minutos = servico.duracao_minutos;
          console.log(`📊 Serviço selecionado: "${servico.nome}" - ${servico.duracao_minutos} minutos (DB)`);
        } else {
          const duracaoEstimada = estimarDuracaoServico(servico.nome);
          novosServicos[index].duracao_minutos = duracaoEstimada;
          console.warn(`⚠️ Serviço "${servico.nome}" sem duração no DB - estimando: ${duracaoEstimada} minutos`);
        }
      }
    }

    setServicosSelecionados(novosServicos);
  };

  const calcularTotal = () => {
    if (!servicosSelecionados || servicosSelecionados.length === 0) {
      return 0;
    }
    return servicosSelecionados.reduce((sum, s) => {
      const preco = Number(s.preco) || 0;
      return sum + preco;
    }, 0);
  };

  // Filtrar clientes baseado na busca
  const clientesFiltrados = useMemo(() => {
    if (!buscaCliente.trim()) {
      return clientes;
    }

    const termo = buscaCliente.toLowerCase().trim();
    return clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(termo) ||
      (cliente.telefone && cliente.telefone.includes(termo))
    );
  }, [clientes, buscaCliente]);

  // Função para selecionar um cliente
  const selecionarCliente = (cliente: any) => {
    setClienteId(cliente.id);
    setBuscaCliente(cliente.nome);
    setMostrarListaClientes(false);
    setIndiceSelecionado(-1);
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.cliente-search-container')) {
        setMostrarListaClientes(false);
      }
    };

    if (mostrarListaClientes) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [mostrarListaClientes]);

  const handleSave = async () => {
    if (!clienteId || !dataHora || servicosSelecionados.length === 0) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    // Verificar se o cliente foi selecionado corretamente
    const clienteValido = clientes.find(c => c.id === clienteId);
    if (!clienteValido) {
      alert("Por favor, selecione um cliente válido da lista");
      setBuscaCliente("");
      setClienteId("");
      setMostrarListaClientes(false);
      return;
    }

    // Validar se todos os serviços foram selecionados
    const servicosIncompletos = servicosSelecionados.filter(
      (s) => !s.servico_id,
    );
    if (servicosIncompletos.length > 0) {
      alert("Selecione todos os serviços");
      return;
    }

    const servicosParaSalvar = servicosSelecionados.filter((s) => s.servico_id);

    try {
      setSaving(true);
      // Usar função que preserva o timezone local sem conversões
      const dataHoraLocal = dateTimeLocalToDate(dataHora);

      await onSave({
        cliente_id: clienteId,
        data_hora: dataHoraLocal,
        observacoes,
        servicos: servicosParaSalvar,
        status: agendamentoEditando?.status || "agendado",
      });
      onClose();
    } catch (error) {
      console.error("  ❌ Erro ao salvar:", error);
      alert("Erro ao salvar agendamento");
      setSaving(false);
    }
};

const handleSaveWithAnimation = async (_agendamentoData: any) => {
  // Animação desativada
  return;
};

const handleConfirmAndComplete = async () => {
  if (!clienteId || !dataHora || servicosSelecionados.length === 0) {
    alert("Preencha todos os campos obrigatórios");
    return;
  }

  // Verificar se o cliente foi selecionado corretamente
  const clienteValido = clientes.find(c => c.id === clienteId);
  if (!clienteValido) {
    alert("Por favor, selecione um cliente válido da lista");
    setBuscaCliente("");
    setClienteId("");
    setMostrarListaClientes(false);
    return;
  }

  // Validar se todos os serviços foram selecionados
  const servicosIncompletos = servicosSelecionados.filter(
    (s) => !s.servico_id,
  );
  if (servicosIncompletos.length > 0) {
    alert("Selecione todos os serviços");
    return;
  }

  const servicosParaSalvar = servicosSelecionados.filter((s) => s.servico_id);

  try {
    setSaving(true);

    // Preparar dados do agendamento
    const dataHoraLocal = dateTimeLocalToDate(dataHora);
    const agendamentoData = {
      cliente_id: clienteId,
      data_hora: dataHoraLocal,
      observacoes,
      servicos: servicosParaSalvar,
      status: "aguardando_confirmacao_pagamento", // Status intermediário para animação
    };

    await onSave({
      ...agendamentoData,
      status: "concluido"
    });
    onClose();

  } catch (error) {
    console.error("  ❌ Erro ao confirmar e concluir:", error);
    alert("Erro ao confirmar e concluir agendamento");
    setSaving(false);
  }
};

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleCriarCliente = async () => {
    if (!novoCliente.nome.trim()) {
      alert("Nome do cliente é obrigatório");
      return;
    }

    if (!user?.id) {
      alert("Usuário não identificado. Faça login novamente.");
      return;
    }

    try {
      const clienteCriado = await createCliente(user.id, {
        nome: novoCliente.nome.trim(),
        telefone: novoCliente.telefone.trim(),
        email: novoCliente.email.trim(),
        tipo_cliente: "normal",
      });

      // Selecionar o cliente criado
      setClienteId(clienteCriado.id);

      // Limpar formulário e fechar modal
      setNovoCliente({ nome: "", telefone: "", email: "" });
      setShowNovoCliente(false);

      alert(`Cliente "${clienteCriado.nome}" criado com sucesso!`);

      // Recarregar lista de clientes
      await reloadClientes();
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      alert("Erro ao criar cliente. Tente novamente.");
    }
  };

  const handleCriarServico = async () => {
    if (!novoServico.nome.trim() || novoServico.preco <= 0) {
      alert("Nome e preço do serviço são obrigatórios");
      return;
    }

    if (!user?.id) {
      alert("Usuário não identificado. Faça login novamente.");
      return;
    }

    try {
      const servicoCriado = await createServico(user.id, {
        nome: novoServico.nome.trim(),
        preco: novoServico.preco,
        duracao_minutos: novoServico.duracao_minutos,
        categoria: "Geral",
        ativo: true,
      });

      // Adicionar o servi��o criado aos serviços selecionados
      if (servicosSelecionados.length === 0) {
        adicionarServico();
      }

      // Limpar formulário e fechar modal
      setNovoServico({ nome: "", preco: 0, duracao_minutos: 60 });
      setShowNovoServico(false);

      alert(`Serviço "${servicoCriado.nome}" criado com sucesso!`);

      // Recarregar lista de serviços
      await reloadServicos();
    } catch (error) {
      console.error("Erro ao criar serviço:", error);
      alert("Erro ao criar serviço. Tente novamente.");
    }
  };

  if (!isOpen) return null;

  const total = calcularTotal();

  return createPortal(
    <div>
      {/* Modal Principal */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999999,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          data-modal="agendamento"
          style={{
            backgroundColor: "white",
            borderRadius: "0.75rem",
            width: "100%",
            maxWidth: "48rem",
            maxHeight: "95vh",
            overflowY: "auto",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-bella-800">
                {agendamentoEditando ? "Editar" : "Novo"} Agendamento
              </h2>
              <button
                onClick={onClose}
                className="touch-button text-bella-600 hover:bg-bella-100 rounded-lg"
                style={{
                  minHeight: "44px",
                  minWidth: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  Cliente *
                </label>
                <div className="flex space-x-2 relative">
                  <div className="flex-1 relative cliente-search-container">
                    <input
                      type="text"
                      value={buscaCliente}
                      onChange={(e) => {
                        setBuscaCliente(e.target.value);
                        setMostrarListaClientes(true);
                        setIndiceSelecionado(-1);
                        if (!e.target.value.trim()) {
                          setClienteId("");
                        }
                      }}
                      onFocus={() => setMostrarListaClientes(true)}
                      onKeyDown={(e) => {
                        if (!mostrarListaClientes || clientesFiltrados.length === 0) return;

                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setIndiceSelecionado(prev =>
                            prev < Math.min(clientesFiltrados.length - 1, 9) ? prev + 1 : 0
                          );
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setIndiceSelecionado(prev =>
                            prev > 0 ? prev - 1 : Math.min(clientesFiltrados.length - 1, 9)
                          );
                        } else if (e.key === 'Enter' && indiceSelecionado >= 0) {
                          e.preventDefault();
                          const clienteSelecionado = clientesFiltrados.slice(0, 10)[indiceSelecionado];
                          if (clienteSelecionado) {
                            selecionarCliente(clienteSelecionado);
                          }
                        } else if (e.key === 'Escape') {
                          setMostrarListaClientes(false);
                          setIndiceSelecionado(-1);
                        }
                      }}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-bella-500 ${
                        clienteId ? 'border-green-300 bg-green-50' : 'border-bella-200'
                      }`}
                      disabled={saving}
                      style={{ minHeight: "44px", fontSize: "16px" }}
                      placeholder="Digite o nome do cliente..."
                    />

                    {/* Indicador de cliente selecionado e botão limpar */}
                    {clienteId && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => {
                            setClienteId("");
                            setBuscaCliente("");
                            setMostrarListaClientes(false);
                            setIndiceSelecionado(-1);
                          }}
                          className="w-5 h-5 bg-gray-400 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                          title="Limpar seleção"
                        >
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Dropdown de clientes filtrados */}
                    {mostrarListaClientes && clientesFiltrados.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 bg-white border border-bella-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {clientesFiltrados.slice(0, 10).map((cliente, index) => (
                          <div
                            key={cliente.id}
                            onClick={() => selecionarCliente(cliente)}
                            className={`p-3 cursor-pointer border-b last:border-b-0 transition-colors ${
                              index === indiceSelecionado
                                ? 'bg-bella-100 border-bella-300'
                                : 'hover:bg-bella-50'
                            }`}
                          >
                            <div className="font-medium text-bella-800">{cliente.nome}</div>
                            {cliente.telefone && (
                              <div className="text-sm text-bella-600">{cliente.telefone}</div>
                            )}
                          </div>
                        ))}
                        {clientesFiltrados.length > 10 && (
                          <div className="p-3 text-center text-sm text-bella-500 bg-bella-50">
                            Mostrando 10 de {clientesFiltrados.length} resultados. Continue digitando para refinar...
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mensagem quando não encontra clientes */}
                    {mostrarListaClientes && buscaCliente && clientesFiltrados.length === 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 bg-white border border-bella-200 rounded-lg shadow-lg p-4 text-center text-bella-600">
                        Nenhum cliente encontrado para "{buscaCliente}"
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNovoCliente(true)}
                    className="px-3 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center"
                    disabled={saving}
                    title="Criar novo cliente"
                    style={{ minHeight: "44px", minWidth: "44px" }}
                  >
                    <FiUserPlus size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  Data e Hora *
                </label>
                <input
                  type="datetime-local"
                  value={dataHora}
                  onChange={(e) => setDataHora(e.target.value)}
                  className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                  disabled={saving}
                  style={{ minHeight: "44px", fontSize: "16px" }}
                />
              </div>
            </div>

            {/* Serviços */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-bella-800 flex items-center space-x-2">
                  <FiUser size={20} />
                  <span>Serviços</span>
                </h3>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowNovoServico(true)}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
                    disabled={saving}
                  >
                    <FiTool size={16} />
                    <span className="hidden sm:inline">Novo Serviço</span>
                  </button>
                  <button
                    onClick={adicionarServico}
                    className="px-3 py-2 bg-bella-500 text-white rounded-lg hover:bg-bella-600 flex items-center space-x-2"
                    disabled={saving}
                  >
                    <FiPlus size={16} />
                    <span className="hidden sm:inline">Adicionar Serviço</span>
                  </button>
                </div>
              </div>

              {servicosSelecionados.map((servico, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 border border-bella-200 rounded-lg mb-3"
                >
                  <div>
                    <label className="block text-sm font-medium text-bella-700 mb-1">
                      Serviço
                    </label>
                    <select
                      value={servico.servico_id}
                      onChange={(e) =>
                        atualizarServico(index, "servico_id", e.target.value)
                      }
                      className="w-full p-2 border border-bella-200 rounded"
                      disabled={saving}
                      style={{ minHeight: "44px", fontSize: "16px" }}
                    >
                      <option value="">Selecione</option>
                      {servicos.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-bella-700 mb-1">
                      Funcionário
                    </label>
                    <select
                      value={servico.funcionario_id || ""}
                      onChange={(e) => {
                        const funcionarioId = e.target.value;
                        atualizarServico(
                          index,
                          "funcionario_id",
                          funcionarioId,
                        );
                      }}
                      className="w-full p-2 border border-bella-200 rounded"
                      disabled={saving}
                      style={{ minHeight: "44px", fontSize: "16px" }}
                    >
                      <option value="">Não especificar</option>
                      {funcionarios.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-bella-700 mb-1">
                      Preço (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={servico.preco}
                      onChange={(e) =>
                        atualizarServico(
                          index,
                          "preco",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="w-full p-2 border border-bella-200 rounded"
                      disabled={saving}
                      style={{ minHeight: "44px", fontSize: "16px" }}
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => removerServico(index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded"
                      disabled={saving}
                      style={{ minHeight: "44px", minWidth: "44px" }}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {servicosSelecionados.length === 0 && (
                <p className="text-bella-500 text-center py-4">
                  Nenhum serviço adicionado ainda
                </p>
              )}
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-bella-700 mb-2">
                Observações
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 resize-none"
                rows={3}
                placeholder="Observações sobre o agendamento..."
                disabled={saving}
                style={{ fontSize: "16px" }}
              />
            </div>

            {/* Total */}
            <div className="bg-bella-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-bella-600">Total dos Serviços:</span>
                <span className="text-xl font-semibold text-bella-800">
                  {formatCurrency(total)}
                </span>
              </div>
              <p className="text-sm text-bella-500 mt-1">
                💡 Pagamento será registrado quando o agendamento for concluído
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-bella-300 text-bella-700 rounded-lg hover:bg-bella-50"
              style={{ minHeight: "44px" }}
            >
              {saving ? "Fechar" : "Cancelar"}
            </button>

            {/* Se o agendamento está aguardando confirmação, mostrar ambos os botões */}
            {agendamentoEditando?.status === "aguardando_confirmacao" ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-bella-500 text-white px-4 py-3 rounded-lg hover:bg-bella-600 disabled:opacity-50"
                  disabled={saving || servicosSelecionados.length === 0}
                  style={{ minHeight: "44px" }}
                >
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </button>
                <button
                  onClick={handleConfirmAndComplete}
                  className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                  disabled={saving || servicosSelecionados.length === 0}
                  style={{ minHeight: "44px" }}
                >
                  <FiCheck className="w-4 h-4" />
                  <span>{saving ? "Confirmando..." : "Confirmar e Concluir"}</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 rounded-lg disabled:opacity-50 flex items-center justify-center space-x-2 bg-green-600 text-white hover:bg-green-700"
                disabled={saving || servicosSelecionados.length === 0}
                style={{ minHeight: "44px" }}
              >
                <span>🎨</span>
                <span>{saving ? "Salvando..." : "Criar Agendamento"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal Novo Cliente */}
      {showNovoCliente &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999999,
              backgroundColor: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "0.75rem",
                padding: "1.5rem",
                width: "100%",
                maxWidth: "28rem",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "bold",
                    margin: 0,
                  }}
                >
                  Novo Cliente
                </h3>
                <button
                  onClick={() => setShowNovoCliente(false)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "0.5rem",
                    cursor: "pointer",
                    borderRadius: "0.5rem",
                  }}
                >
                  <FiX size={20} />
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={novoCliente.nome}
                    onChange={(e) =>
                      setNovoCliente((prev) => ({
                        ...prev,
                        nome: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "16px",
                      minHeight: "44px",
                    }}
                    placeholder="Digite o nome do cliente"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={novoCliente.telefone}
                    onChange={(e) =>
                      setNovoCliente((prev) => ({
                        ...prev,
                        telefone: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "16px",
                      minHeight: "44px",
                    }}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={novoCliente.email}
                    onChange={(e) =>
                      setNovoCliente((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "16px",
                      minHeight: "44px",
                    }}
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={() => setShowNovoCliente(false)}
                    style={{
                      flex: 1,
                      padding: "0.75rem 1rem",
                      border: "1px solid #d1d5db",
                      backgroundColor: "white",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      minHeight: "44px",
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCriarCliente}
                    disabled={!novoCliente.nome.trim()}
                    style={{
                      flex: 1,
                      padding: "0.75rem 1rem",
                      backgroundColor: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      opacity: !novoCliente.nome.trim() ? 0.5 : 1,
                      minHeight: "44px",
                    }}
                  >
                    Criar Cliente
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Modal Novo Serviço */}
      {showNovoServico &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999999,
              backgroundColor: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "0.75rem",
                padding: "1.5rem",
                width: "100%",
                maxWidth: "28rem",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "bold",
                    margin: 0,
                  }}
                >
                  Novo Serviço
                </h3>
                <button
                  onClick={() => setShowNovoServico(false)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "0.5rem",
                    cursor: "pointer",
                    borderRadius: "0.5rem",
                  }}
                >
                  <FiX size={20} />
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Nome do Serviço *
                  </label>
                  <input
                    type="text"
                    value={novoServico.nome}
                    onChange={(e) =>
                      setNovoServico((prev) => ({
                        ...prev,
                        nome: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "16px",
                      minHeight: "44px",
                    }}
                    placeholder="Ex: Corte de Cabelo"
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Preço (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={novoServico.preco}
                      onChange={(e) =>
                        setNovoServico((prev) => ({
                          ...prev,
                          preco: parseFloat(e.target.value) || 0,
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.5rem",
                        fontSize: "16px",
                        minHeight: "44px",
                      }}
                      placeholder="0,00"
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Duração (min)
                    </label>
                    <input
                      type="number"
                      value={novoServico.duracao_minutos}
                      onChange={(e) =>
                        setNovoServico((prev) => ({
                          ...prev,
                          duracao_minutos: parseInt(e.target.value) || 60,
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.5rem",
                        fontSize: "16px",
                        minHeight: "44px",
                      }}
                      placeholder="60"
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={() => setShowNovoServico(false)}
                    style={{
                      flex: 1,
                      padding: "0.75rem 1rem",
                      border: "1px solid #d1d5db",
                      backgroundColor: "white",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      minHeight: "44px",
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCriarServico}
                    disabled={
                      !novoServico.nome.trim() || novoServico.preco <= 0
                    }
                    style={{
                      flex: 1,
                      padding: "0.75rem 1rem",
                      backgroundColor: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      opacity:
                        !novoServico.nome.trim() || novoServico.preco <= 0
                          ? 0.5
                          : 1,
                      minHeight: "44px",
                    }}
                  >
                    Criar Serviço
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>,
    document.body,
  );
}
