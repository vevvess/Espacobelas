import React, { useState, useEffect } from "react";
import {
  FiX,
  FiEdit,
  FiDollarSign,
  FiCreditCard,
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiUser,
  FiSave,
} from "react-icons/fi";
import { FORMAS_PAGAMENTO } from "@/services/agendamentoService";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { formatForDateTimeInput } from "@/lib/dateUtils";

interface PagamentoEditavel {
  id?: string;
  forma_pagamento: string;
  valor: number;
  observacoes?: string;
}

interface ServicoEditavel {
  id?: string;
  servico_id: string;
  funcionario_id?: string;
  preco: number;
  nome?: string;
}

interface ModalEditarConcluidoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    agendamento_id: string;
    data_hora?: Date;
    observacoes?: string;
    servicos?: ServicoEditavel[];
    pagamentos?: PagamentoEditavel[];
  }) => Promise<void>;
  agendamento: any;
  funcionarios: Array<{
    id: string;
    nome: string;
    username: string;
    is_admin: boolean;
  }>;
}

export function ModalEditarConcluido({
  isOpen,
  onClose,
  onSave,
  agendamento,
  funcionarios,
}: ModalEditarConcluidoProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [clienteMensal, setClienteMensal] = useState(false);

  // Estados editáveis
  const [dataHora, setDataHora] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [servicosEditaveis, setServicosEditaveis] = useState<ServicoEditavel[]>(
    [],
  );
  const [pagamentosEditaveis, setPagamentosEditaveis] = useState<
    PagamentoEditavel[]
  >([]);

  // Reset form quando modal abre
  useEffect(() => {
    if (isOpen && agendamento) {
      // Verificar se é cliente mensal
      const isClienteMensal = agendamento.cliente?.tipo_cliente === "mensal";
      setClienteMensal(isClienteMensal);

      // Formatar data para input datetime-local preservando timezone local
      const dataLocal = new Date(agendamento.data_hora);
      setDataHora(formatForDateTimeInput(dataLocal));

      setObservacoes(agendamento.observacoes || "");

      // Carregar serviços existentes
      const servicos = agendamento.servicos || [];
      setServicosEditaveis(
        servicos.map((s: any) => ({
          id: s.id,
          servico_id: s.servico_id,
          funcionario_id: s.funcionario_id,
          preco: s.preco || 0,
          nome: s.servico?.nome || "Serviço",
        })),
      );

      // Carregar pagamentos existentes
      const pagamentos = agendamento.pagamentos || [];
      setPagamentosEditaveis(
        pagamentos.map((p: any) => ({
          id: p.id,
          forma_pagamento: p.forma_pagamento,
          valor: p.valor || 0,
          observacoes: p.observacoes || "",
        })),
      );

      // Se não tem pagamentos e não é débito mensal, adicionar um pagamento padrão
      if (pagamentos.length === 0 && !isClienteMensal) {
        const valorTotal = servicos.reduce(
          (sum: number, s: any) => sum + (s.preco || 0),
          0,
        );
        setPagamentosEditaveis([
          {
            forma_pagamento: "dinheiro",
            valor: valorTotal,
            observacoes: "",
          },
        ]);
      }
    }
  }, [isOpen, agendamento]);

  const adicionarServico = () => {
    setServicosEditaveis([
      ...servicosEditaveis,
      {
        servico_id: "",
        funcionario_id: "",
        preco: 0,
        nome: "",
      },
    ]);
  };

  const removerServico = (index: number) => {
    setServicosEditaveis(servicosEditaveis.filter((_, i) => i !== index));
  };

  const atualizarServico = (
    index: number,
    campo: keyof ServicoEditavel,
    valor: any,
  ) => {
    const novosServicos = [...servicosEditaveis];
    novosServicos[index] = { ...novosServicos[index], [campo]: valor };
    setServicosEditaveis(novosServicos);
  };

  const adicionarPagamento = () => {
    const valorTotal = servicosEditaveis.reduce((sum, s) => sum + s.preco, 0);
    const totalPagamentos = pagamentosEditaveis.reduce(
      (sum, p) => sum + p.valor,
      0,
    );
    const valorRestante = valorTotal - totalPagamentos;

    setPagamentosEditaveis([
      ...pagamentosEditaveis,
      {
        forma_pagamento: "dinheiro",
        valor: valorRestante > 0 ? valorRestante : 0,
        observacoes: "",
      },
    ]);
  };

  const removerPagamento = (index: number) => {
    setPagamentosEditaveis(pagamentosEditaveis.filter((_, i) => i !== index));
  };

  const atualizarPagamento = (
    index: number,
    campo: keyof PagamentoEditavel,
    valor: any,
  ) => {
    const novosPagamentos = [...pagamentosEditaveis];
    novosPagamentos[index] = { ...novosPagamentos[index], [campo]: valor };
    setPagamentosEditaveis(novosPagamentos);
  };

  const calcularTotais = () => {
    const totalServicos = servicosEditaveis.reduce(
      (sum, s) => sum + s.preco,
      0,
    );
    const totalPagamentos = pagamentosEditaveis.reduce(
      (sum, p) => sum + p.valor,
      0,
    );
    return { totalServicos, totalPagamentos };
  };

  const handleSave = async () => {
    if (servicosEditaveis.length === 0) {
      alert("Adicione pelo menos um serviço");
      return;
    }

    // Verificar se tem débito mensal
    const temDebitoMensal = pagamentosEditaveis.some(
      (p) => p.forma_pagamento === "debito_mensal",
    );

    if (!temDebitoMensal && pagamentosEditaveis.length === 0) {
      alert("Adicione pelo menos uma forma de pagamento");
      return;
    }

    if (!temDebitoMensal) {
      const { totalServicos, totalPagamentos } = calcularTotais();
      if (Math.abs(totalServicos - totalPagamentos) > 0.01) {
        alert(
          `Total dos pagamentos deve ser igual ao total dos serviços!\nServiços: R$ ${totalServicos.toFixed(2)}\nPagamentos: R$ ${totalPagamentos.toFixed(2)}`,
        );
        return;
      }
    }

    try {
      setSaving(true);
      await onSave({
        agendamento_id: agendamento.id,
        data_hora: new Date(dataHora),
        observacoes,
        servicos: servicosEditaveis.filter((s) => s.servico_id),
        pagamentos: pagamentosEditaveis.filter(
          (p) => p.forma_pagamento && p.forma_pagamento !== "debito_mensal",
        ),
      });
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar alterações");
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

  if (!isOpen || !agendamento) return null;

  const { totalServicos, totalPagamentos } = calcularTotais();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-bella-800 flex items-center space-x-2">
            <FiEdit className="w-5 h-5" />
            <span>Editar Agendamento Concluído</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-bella-600 hover:bg-bella-100 rounded-lg"
            disabled={saving}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Informações do Cliente */}
          <div className="bg-bella-50 rounded-lg p-4">
            <h3 className="font-semibold text-bella-800 mb-2 flex items-center space-x-2">
              <FiUser className="w-4 h-4" />
              <span>Cliente: {agendamento.cliente?.nome}</span>
            </h3>
            <p className="text-sm text-bella-600">
              {agendamento.cliente?.telefone &&
                `📱 ${agendamento.cliente.telefone}`}
              {agendamento.cliente?.tipo_cliente === "mensal" && (
                <span className="ml-4 bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                  Cliente Mensal
                </span>
              )}
            </p>
          </div>

          {/* Data e Observações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-bella-700 mb-2">
                Data e Hora
              </label>
              <input
                type="datetime-local"
                value={dataHora}
                onChange={(e) => setDataHora(e.target.value)}
                className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-bella-700 mb-2">
                Observações
              </label>
              <input
                type="text"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                placeholder="Observações sobre o agendamento..."
                disabled={saving}
              />
            </div>
          </div>

          {/* Serviços */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-bella-800 flex items-center space-x-2">
                <FiDollarSign className="w-5 h-5" />
                <span>Serviços</span>
              </h3>
              <button
                onClick={adicionarServico}
                className="px-3 py-2 bg-bella-500 text-white rounded-lg hover:bg-bella-600 flex items-center space-x-2"
                disabled={saving}
              >
                <FiPlus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </div>

            {servicosEditaveis.map((servico, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-bella-200 rounded-lg mb-3"
              >
                <div>
                  <label className="block text-sm font-medium text-bella-700 mb-1">
                    Serviço
                  </label>
                  <input
                    type="text"
                    value={servico.nome || ""}
                    onChange={(e) =>
                      atualizarServico(index, "nome", e.target.value)
                    }
                    className="w-full p-2 border border-bella-200 rounded"
                    placeholder="Nome do serviço"
                    disabled={saving}
                  />
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
                <span>Adicionar</span>
              </button>
            </div>

            {pagamentosEditaveis.map((pagamento, index) => (
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
                    {FORMAS_PAGAMENTO.filter(
                      (forma) =>
                        // Mostrar débito mensal apenas para clientes mensais
                        !forma.mensal || clienteMensal,
                    ).map((forma) => (
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
                    placeholder="Observações do pagamento"
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
          </div>

          {/* Resumo */}
          <div className="bg-bella-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-bella-600">Total dos Serviços</p>
                <p className="text-lg font-semibold text-bella-800">
                  {formatCurrency(totalServicos)}
                </p>
              </div>
              <div>
                <p className="text-sm text-bella-600">Total dos Pagamentos</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(totalPagamentos)}
                </p>
              </div>
              <div>
                <p className="text-sm text-bella-600">Diferença</p>
                <p
                  className={`text-lg font-semibold ${
                    Math.abs(totalServicos - totalPagamentos) < 0.01
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(totalServicos - totalPagamentos)}
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
              className="flex-1 bella-button flex items-center justify-center space-x-2"
              disabled={saving || servicosEditaveis.length === 0}
            >
              <FiSave className="w-4 h-4" />
              <span>{saving ? "Salvando..." : "Salvar Alterações"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
