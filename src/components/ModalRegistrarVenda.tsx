import React, { useState } from "react";
import {
  FiX,
  FiDollarSign,
  FiCreditCard,
  FiPackage,
  FiUser,
  FiCalendar,
  FiMessageSquare,
} from "react-icons/fi";

interface ModalRegistrarVendaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vendaData: {
    tipo: "produto" | "servico";
    descricao: string;
    cliente_nome: string;
    valor: number;
    forma_pagamento: string;
    observacoes: string;
  }) => Promise<void>;
  clientes: Array<{ id: string; nome: string }>;
}

const FORMAS_PAGAMENTO = [
  { id: "dinheiro", nome: "💵 Dinheiro" },
  { id: "pix", nome: "📱 PIX" },
  { id: "credito", nome: "💳 Cartão de Crédito" },
  { id: "debito", nome: "💳 Cartão de Débito" },
  { id: "transferencia", nome: "🏦 Transferência" },
];

export function ModalRegistrarVenda({
  isOpen,
  onClose,
  onSave,
  clientes,
}: ModalRegistrarVendaProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    tipo: "produto" as "produto" | "servico",
    descricao: "",
    cliente_nome: "",
    valor: 0,
    forma_pagamento: "dinheiro",
    observacoes: "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      tipo: "produto",
      descricao: "",
      cliente_nome: "",
      valor: 0,
      forma_pagamento: "dinheiro",
      observacoes: "",
    });
  };

  const handleSave = async () => {
    if (!formData.descricao.trim()) {
      alert("Descrição é obrigatória");
      return;
    }

    if (formData.valor <= 0) {
      alert("Valor deve ser maior que zero");
      return;
    }

    try {
      setSaving(true);
      await onSave(formData);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Erro ao registrar venda:", error);
      alert("Erro ao registrar venda");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      resetForm();
      onClose();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-bella-800 flex items-center space-x-2">
            <FiDollarSign className="w-5 h-5" />
            <span>Registrar Venda</span>
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-bella-600 hover:bg-bella-100 rounded-lg"
            disabled={saving}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Tipo de venda */}
          <div>
            <label className="block text-sm font-medium text-bella-700 mb-2">
              Tipo de Venda *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleInputChange("tipo", "produto")}
                className={`p-3 rounded-lg border-2 flex items-center justify-center space-x-2 transition-colors ${
                  formData.tipo === "produto"
                    ? "border-bella-500 bg-bella-50 text-bella-700"
                    : "border-bella-200 text-bella-600 hover:border-bella-300"
                }`}
                disabled={saving}
              >
                <FiPackage className="w-4 h-4" />
                <span>Produto</span>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange("tipo", "servico")}
                className={`p-3 rounded-lg border-2 flex items-center justify-center space-x-2 transition-colors ${
                  formData.tipo === "servico"
                    ? "border-bella-500 bg-bella-50 text-bella-700"
                    : "border-bella-200 text-bella-600 hover:border-bella-300"
                }`}
                disabled={saving}
              >
                <FiUser className="w-4 h-4" />
                <span>Serviço</span>
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-bella-700 mb-2">
              Descrição *
            </label>
            <div className="relative">
              <FiPackage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bella-400 w-4 h-4" />
              <input
                type="text"
                value={formData.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                placeholder={
                  formData.tipo === "produto"
                    ? "Nome do produto vendido"
                    : "Serviço realizado"
                }
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-bella-700 mb-2">
                Cliente
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bella-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.cliente_nome}
                  onChange={(e) =>
                    handleInputChange("cliente_nome", e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                  placeholder="Nome do cliente (opcional)"
                  list="clientes-list"
                  disabled={saving}
                />
                <datalist id="clientes-list">
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.nome} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-bella-700 mb-2">
                Valor *
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bella-400 w-4 h-4" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor}
                  onChange={(e) =>
                    handleInputChange("valor", parseFloat(e.target.value) || 0)
                  }
                  className="w-full pl-10 pr-4 py-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                  placeholder="0,00"
                  disabled={saving}
                />
              </div>
              {formData.valor > 0 && (
                <p className="text-sm text-bella-600 mt-1">
                  {formatCurrency(formData.valor)}
                </p>
              )}
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-bella-700 mb-2">
              Forma de Pagamento *
            </label>
            <div className="relative">
              <FiCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bella-400 w-4 h-4" />
              <select
                value={formData.forma_pagamento}
                onChange={(e) =>
                  handleInputChange("forma_pagamento", e.target.value)
                }
                className="w-full pl-10 pr-4 py-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                disabled={saving}
              >
                {FORMAS_PAGAMENTO.map((forma) => (
                  <option key={forma.id} value={forma.id}>
                    {forma.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-bella-700 mb-2">
              Observações
            </label>
            <div className="relative">
              <FiMessageSquare className="absolute left-3 top-3 text-bella-400 w-4 h-4" />
              <textarea
                value={formData.observacoes}
                onChange={(e) =>
                  handleInputChange("observacoes", e.target.value)
                }
                className="w-full pl-10 pr-4 py-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                rows={3}
                placeholder="Observações sobre a venda..."
                disabled={saving}
              />
            </div>
          </div>

          {/* Resumo */}
          <div className="bg-bella-50 rounded-lg p-4">
            <h4 className="font-semibold text-bella-800 mb-2">
              Resumo da Venda
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-bella-600">Tipo:</span>
                <span className="font-medium">
                  {formData.tipo === "produto" ? "Produto" : "Serviço"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-bella-600">Valor:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(formData.valor)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-bella-600">Pagamento:</span>
                <span className="font-medium">
                  {FORMAS_PAGAMENTO.find(
                    (f) => f.id === formData.forma_pagamento,
                  )?.nome || "Não selecionado"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 border border-bella-300 text-bella-700 rounded-lg hover:bg-bella-50 transition-colors"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bella-button"
            disabled={
              saving || !formData.descricao.trim() || formData.valor <= 0
            }
          >
            {saving ? "Salvando..." : "Registrar Venda"}
          </button>
        </div>
      </div>
    </div>
  );
}
