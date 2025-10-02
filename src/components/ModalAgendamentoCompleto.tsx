import React, { useState, useEffect } from "react";
import {
  FiX,
  FiPlus,
  FiTrash2,
  FiUser,
  FiDollarSign,
  FiCreditCard,
  FiCalendar,
  FiClock,
  FiCheck,
} from "react-icons/fi";
import { useClientes } from "@/hooks/useClientes";
import { useServicos } from "@/hooks/useServicos";
import { FORMAS_PAGAMENTO } from "@/services/agendamentoService";
import { formatForDateTimeInput } from "@/lib/dateUtils";

interface ServicoSelecionado {
  servico_id: string;
  funcionario_id?: string;
  preco: number;
  nome?: string; // Para exibição
}

interface PagamentoSelecionado {
  forma_pagamento: string;
  valor: number;
  observacoes?: string;
}

interface ModalAgendamentoCompletoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    cliente_id: string;
    data_hora: Date;
    observacoes?: string;
    servicos: ServicoSelecionado[];
    pagamentos: PagamentoSelecionado[];
  }) => Promise<void>;
  funcionarios: Array<{
    id: string;
    nome: string;
    username: string;
    is_admin: boolean;
  }>;
  agendamentoEditando?: any;
}

export function ModalAgendamentoCompleto({
  isOpen,
  onClose,
  onSave,
  funcionarios,
  agendamentoEditando,
}: ModalAgendamentoCompletoProps) {
  const { clientes } = useClientes();
  const { servicos } = useServicos();

  const [clienteId, setClienteId] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [servicosSelecionados, setServicosSelecionados] = useState<
    ServicoSelecionado[]
  >([]);
  const [pagamentosSelecionados, setPagamentosSelecionados] = useState<
    PagamentoSelecionado[]
  >([]);
  const [saving, setSaving] = useState(false);

  // Reset form quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      if (agendamentoEditando) {
        // Preencher form para edição
        setClienteId(agendamentoEditando.cliente_id || "");

        // Formatar data para input datetime-local preservando timezone local
        const dataLocal = new Date(agendamentoEditando.data_hora);
        setDataHora(formatForDateTimeInput(dataLocal));

        setObservacoes(agendamentoEditando.observacoes || "");

        // Carregar serviços - garantir que tenham todos os campos necessários
        const servicosParaEdicao = (agendamentoEditando.servicos || []).map(
          (servico: any) => ({
            servico_id: servico.servico_id || "",
            funcionario_id: servico.funcionario_id || "",
            preco: servico.preco || 0,
            nome: servico.servico?.nome || servico.nome || "",
          }),
        );

        setServicosSelecionados(servicosParaEdicao);
        setPagamentosSelecionados(agendamentoEditando.pagamentos || []);
      } else {
        // Reset para novo agendamento
        setClienteId("");
        setDataHora("");
        setObservacoes("");
        setServicosSelecionados([]);
        setPagamentosSelecionados([]);
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

    // Auto-preencher preço quando serviço é selecionado
    if (campo === "servico_id") {
      const servico = servicos.find((s) => s.id === valor);
      if (servico) {
        novosServicos[index].preco = servico.preco;
        novosServicos[index].nome = servico.nome;
      }
    }

    setServicosSelecionados(novosServicos);
  };

  const adicionarPagamento = () => {
    const totalServicos = servicosSelecionados.reduce(
      (sum, s) => sum + s.preco,
      0,
    );
    const totalPagamentos = pagamentosSelecionados.reduce(
      (sum, p) => sum + p.valor,
      0,
    );
    const valorRestante = totalServicos - totalPagamentos;

    setPagamentosSelecionados([
      ...pagamentosSelecionados,
      {
        forma_pagamento: "",
        valor: valorRestante > 0 ? valorRestante : 0,
        observacoes: "",
      },
    ]);
  };

  const removerPagamento = (index: number) => {
    setPagamentosSelecionados(
      pagamentosSelecionados.filter((_, i) => i !== index),
    );
  };

  const atualizarPagamento = (
    index: number,
    campo: keyof PagamentoSelecionado,
    valor: any,
  ) => {
    const novosPagamentos = [...pagamentosSelecionados];
    novosPagamentos[index] = { ...novosPagamentos[index], [campo]: valor };
    setPagamentosSelecionados(novosPagamentos);
  };

  const calcularTotais = () => {
    const totalServicos = servicosSelecionados.reduce(
      (sum, s) => sum + s.preco,
      0,
    );
    const totalPagamentos = pagamentosSelecionados.reduce(
      (sum, p) => sum + p.valor,
      0,
    );
    return {
      totalServicos,
      totalPagamentos,
      diferenca: totalServicos - totalPagamentos,
    };
  };

  const handleSave = async () => {
    const { totalServicos, totalPagamentos } = calcularTotais();

    if (!clienteId || !dataHora || servicosSelecionados.length === 0) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    if (Math.abs(totalServicos - totalPagamentos) > 0.01) {
      alert(
        `Total dos pagamentos deve ser igual ao total dos serviços!\nServiços: R$ ${totalServicos.toFixed(2)}\nPagamentos: R$ ${totalPagamentos.toFixed(2)}`,
      );
      return;
    }

    try {
      setSaving(true);
      await onSave({
        cliente_id: clienteId,
        data_hora: new Date(dataHora),
        observacoes,
        servicos: servicosSelecionados.filter((s) => s.servico_id),
        pagamentos: pagamentosSelecionados.filter((p) => p.forma_pagamento),
      });
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (!isOpen) return null;

  const { totalServicos, totalPagamentos, diferenca } = calcularTotais();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-bella-800">
            {agendamentoEditando ? "Editar" : "Novo"} Agendamento Completo
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-bella-600 hover:bg-bella-100 rounded-lg"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-bella-700 mb-2">
                Cliente *
              </label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                disabled={saving}
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
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
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-bella-700 mb-2">
              Observações
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
              rows={3}
              placeholder="Observações sobre o agendamento..."
              disabled={saving}
            />
          </div>

          {/* Serviços */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-bella-800 flex items-center space-x-2">
                <FiUser className="w-5 h-5" />
                <span>Serviços</span>
              </h3>
              <button
                onClick={adicionarServico}
                className="px-3 py-2 bg-bella-500 text-white rounded-lg hover:bg-bella-600 flex items-center space-x-2"
                disabled={saving}
              >
                <FiPlus className="w-4 h-4" />
                <span>Adicionar Serviço</span>
              </button>
            </div>

            {servicosSelecionados.map((servico, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-bella-200 rounded-lg mb-3"
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
                    onChange={(e) =>
                      atualizarServico(index, "funcionario_id", e.target.value)
                    }
                    className="w-full p-2 border border-bella-200 rounded"
                    disabled={saving}
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
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => removerServico(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded"
                    disabled={saving}
                  >
                    <FiTrash2 className="w-4 h-4" />
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

          {/* Pagamentos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-bella-800 flex items-center space-x-2">
                <FiCreditCard className="w-5 h-5" />
                <span>Formas de Pagamento</span>
              </h3>
              <button
                onClick={adicionarPagamento}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
                disabled={saving}
              >
                <FiPlus className="w-4 h-4" />
                <span>Adicionar Pagamento</span>
              </button>
            </div>

            {pagamentosSelecionados.map((pagamento, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-bella-200 rounded-lg mb-3"
              >
                <div>
                  <label className="block text-sm font-medium text-bella-700 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={pagamento.forma_pagamento}
                    onChange={(e) =>
                      atualizarPagamento(
                        index,
                        "forma_pagamento",
                        e.target.value,
                      )
                    }
                    className="w-full p-2 border border-bella-200 rounded"
                    disabled={saving}
                  >
                    <option value="">Selecione</option>
                    {FORMAS_PAGAMENTO.map((forma) => (
                      <option key={forma.id} value={forma.id}>
                        {forma.icon} {forma.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-bella-700 mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={pagamento.valor}
                    onChange={(e) =>
                      atualizarPagamento(
                        index,
                        "valor",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="w-full p-2 border border-bella-200 rounded"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-bella-700 mb-1">
                    Observações
                  </label>
                  <input
                    type="text"
                    value={pagamento.observacoes || ""}
                    onChange={(e) =>
                      atualizarPagamento(index, "observacoes", e.target.value)
                    }
                    className="w-full p-2 border border-bella-200 rounded"
                    placeholder="Ex: Cartão final 1234"
                    disabled={saving}
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => removerPagamento(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded"
                    disabled={saving}
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {pagamentosSelecionados.length === 0 && (
              <p className="text-bella-500 text-center py-4">
                Nenhuma forma de pagamento adicionada ainda
              </p>
            )}
          </div>

          {/* Resumo */}
          <div className="bg-bella-50 rounded-lg p-4">
            <h4 className="font-semibold text-bella-800 mb-3">
              Resumo Financeiro
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-bella-600">Total Serviços:</span>
                <p className="font-semibold text-lg">
                  {formatCurrency(totalServicos)}
                </p>
              </div>
              <div>
                <span className="text-bella-600">Total Pagamentos:</span>
                <p className="font-semibold text-lg">
                  {formatCurrency(totalPagamentos)}
                </p>
              </div>
              <div>
                <span className="text-bella-600">Diferença:</span>
                <p
                  className={`font-semibold text-lg ${
                    Math.abs(diferenca) < 0.01
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(diferenca)}
                  {Math.abs(diferenca) < 0.01 && (
                    <FiCheck className="inline w-4 h-4 ml-1" />
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-bella-300 text-bella-700 rounded-lg hover:bg-bella-50"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bella-button"
              disabled={saving || Math.abs(diferenca) > 0.01}
            >
              {saving ? "Salvando..." : "Salvar Agendamento"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
