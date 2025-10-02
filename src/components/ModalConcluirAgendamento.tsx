import React, { useState, useEffect } from "react";
import {
  FiX,
  FiCheck,
  FiDollarSign,
  FiCreditCard,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { FORMAS_PAGAMENTO } from "@/services/agendamentoService";
import { criarDebitoMensal } from "@/services/clientesMensaisService";
import { useAuth } from "@/contexts/SimpleAuthContext";

interface PagamentoSelecionado {
  forma_pagamento: string;
  valor: number;
  observacoes?: string;
}

interface ModalConcluirAgendamentoProps {
  isOpen: boolean;
  onClose: () => void;
  onConcluir: (data: {
    agendamento_id: string;
    pagamentos: PagamentoSelecionado[];
  }) => Promise<void>;
  agendamento: any;
}

export function ModalConcluirAgendamento({
  isOpen,
  onClose,
  onConcluir,
  agendamento,
}: ModalConcluirAgendamentoProps) {
  const { user } = useAuth();
  const [pagamentosSelecionados, setPagamentosSelecionados] = useState<
    PagamentoSelecionado[]
  >([]);
  const [saving, setSaving] = useState(false);
  const [clienteMensal, setClienteMensal] = useState(false);

  // Reset form quando modal abre
  useEffect(() => {
    if (isOpen && agendamento) {
      // Verificar se é cliente mensal
      const isClienteMensal = agendamento.cliente?.tipo_cliente === "mensal";
      setClienteMensal(isClienteMensal);

      // Inicializar com um pagamento igual ao valor total
      const valorTotal =
        agendamento.servicos?.reduce(
          (total: number, s: any) => total + (s.preco || 0),
          0,
        ) || 0;

      setPagamentosSelecionados([
        {
          // Sugerir débito mensal para clientes mensais, mas permitir alteração
          forma_pagamento: isClienteMensal ? "debito_mensal" : "dinheiro",
          valor: valorTotal,
          observacoes: "",
        },
      ]);
    }
  }, [isOpen, agendamento]);

  const adicionarPagamento = () => {
    const valorTotal =
      agendamento.servicos?.reduce(
        (total: number, s: any) => total + (s.preco || 0),
        0,
      ) || 0;
    const totalPagamentos = pagamentosSelecionados.reduce(
      (sum, p) => sum + p.valor,
      0,
    );
    const valorRestante = valorTotal - totalPagamentos;

    setPagamentosSelecionados([
      ...pagamentosSelecionados,
      {
        forma_pagamento: "dinheiro",
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
    const totalServicos =
      agendamento.servicos?.reduce(
        (total: number, s: any) => total + (s.preco || 0),
        0,
      ) || 0;
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

  const handleConcluir = async () => {
    if (pagamentosSelecionados.length === 0) {
      alert("Adicione pelo menos uma forma de pagamento");
      return;
    }

    // Verificar se tem débito mensal
    const temDebitoMensal = pagamentosSelecionados.some(
      (p) => p.forma_pagamento === "debito_mensal",
    );

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

      // Se tem débito mensal, criar o registro de débito
      for (const pagamento of pagamentosSelecionados) {
        if (pagamento.forma_pagamento === "debito_mensal" && user?.id) {
          // Criar débito para cada serviço
          for (const servico of agendamento.servicos || []) {
            await criarDebitoMensal(
              agendamento.id,
              agendamento.cliente_id,
              new Date(agendamento.data_hora),
              servico.servico?.nome || "Serviço",
              servico.funcionario?.nome,
              servico.preco || 0,
            );
          }
        }
      }

      await onConcluir({
        agendamento_id: agendamento.id,
        pagamentos: pagamentosSelecionados.filter(
          (p) => p.forma_pagamento && p.forma_pagamento !== "debito_mensal",
        ),
      });
      onClose();
    } catch (error) {
      console.error("Erro ao concluir:", error);
      alert("Erro ao concluir agendamento");
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

  const { totalServicos, totalPagamentos, diferenca } = calcularTotais();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-bella-800 flex items-center space-x-2">
            <FiCheck className="w-5 h-5" />
            <span>Concluir Agendamento</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-bella-600 hover:bg-bella-100 rounded-lg"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Informações do Agendamento */}
          <div className="bg-bella-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-bella-800">
                {agendamento.cliente?.nome}
              </h3>
              {clienteMensal ? (
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                  Cliente Mensal
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  Cliente Normal
                </span>
              )}
            </div>
            {!clienteMensal && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                <p className="text-yellow-800 text-xs">
                  💡 <strong>Dica:</strong> Para usar "Débito Mensal", edite
                  este cliente em
                  <span className="font-semibold"> Clientes</span> e altere o
                  tipo para "Cliente Mensal".
                </p>
              </div>
            )}
            <p className="text-bella-600 text-sm mb-2">
              {new Date(agendamento.data_hora).toLocaleString("pt-BR")}
            </p>
            <div className="text-sm text-bella-600">
              <strong>Serviços:</strong>
              <ul className="mt-1">
                {agendamento.servicos?.map((servico: any, index: number) => (
                  <li key={index} className="flex justify-between">
                    <span>{servico.servico?.nome || "Serviço"}</span>
                    <span>{formatCurrency(servico.preco || 0)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Formas de Pagamento */}
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
              onClick={handleConcluir}
              className="flex-1 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
              disabled={saving || Math.abs(diferenca) > 0.01}
            >
              <FiCheck className="w-4 h-4" />
              <span>{saving ? "Concluindo..." : "Concluir Agendamento"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
