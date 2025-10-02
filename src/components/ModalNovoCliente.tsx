import React, { useState } from "react";
import {
  FiX,
  FiUser,
  FiPhone,
  FiMail,
  FiCalendar,
  FiMapPin,
  FiMessageSquare,
} from "react-icons/fi";
import { aniversarioParaData, formatarEntradaAniversario } from "../utils/dateFormatters";

interface ModalNovoClienteProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clienteData: {
    nome: string;
    telefone: string;
    email: string;
    data_nascimento?: Date;
    observacoes: string;
    endereco: string;
    tipo_cliente: "normal" | "mensal";
  }) => Promise<void>;
}

export function ModalNovoCliente({
  isOpen,
  onClose,
  onSave,
}: ModalNovoClienteProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    data_aniversario: "",
    observacoes: "",
    endereco: "",
    tipo_cliente: "normal" as "normal" | "mensal",
  });

  const handleInputChange = (
    field: string,
    value: string | "normal" | "mensal",
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      telefone: "",
      email: "",
      data_aniversario: "",
      observacoes: "",
      endereco: "",
      tipo_cliente: "normal",
    });
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      alert("Nome é obrigatório");
      return;
    }

    try {
      setSaving(true);

      // Converter data de aniversário para formato de data de nascimento
      const dataNascimento = aniversarioParaData(formData.data_aniversario);

      const clienteData = {
        nome: formData.nome,
        telefone: formData.telefone,
        email: formData.email,
        data_nascimento: dataNascimento,
        observacoes: formData.observacoes,
        endereco: formData.endereco,
        tipo_cliente: formData.tipo_cliente,
      };

      await onSave(clienteData);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      alert("Erro ao salvar cliente");
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-bella-800">Novo Cliente</h2>
          <button
            onClick={handleClose}
            className="p-2 text-bella-600 hover:bg-bella-100 rounded-lg"
            disabled={saving}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Nome e Tipo de Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-bella-700 mb-2">
                Nome Completo *
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bella-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                  placeholder="Nome completo do cliente"
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-bella-700 mb-2">
                Tipo de Cliente
              </label>
              <select
                value={formData.tipo_cliente}
                onChange={(e) =>
                  handleInputChange(
                    "tipo_cliente",
                    e.target.value as "normal" | "mensal",
                  )
                }
                className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                disabled={saving}
              >
                <option value="normal">Cliente Normal</option>
                <option value="mensal">Cliente Mensal</option>
              </select>
              <p className="text-xs text-bella-500 mt-1">
                Clientes mensais acumulam débitos para pagamento posterior
              </p>
            </div>
          </div>

          {/* Telefone e Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-bella-700 mb-2">
                Telefone
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bella-400 w-4 h-4" />
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) =>
                    handleInputChange("telefone", e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                  disabled={saving}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-bella-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bella-400 w-4 h-4" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                  placeholder="email@exemplo.com"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* Data de Aniversário */}
          <div>
            <label className="block text-sm font-medium text-bella-700 mb-2">
              Data de Aniversário (DD/MM)
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bella-400 w-4 h-4" />
              <input
                type="text"
                value={formData.data_aniversario}
                onChange={(e) => {
                  const valorFormatado = formatarEntradaAniversario(e.target.value);
                  handleInputChange("data_aniversario", valorFormatado);
                }}
                className="w-full pl-10 pr-4 py-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                placeholder="Ex: 15/06"
                maxLength={5}
                disabled={saving}
              />
            </div>
            <p className="text-xs text-bella-500 mt-1">
              Digite apenas dia e mês (ex: 15/06)
            </p>
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-sm font-medium text-bella-700 mb-2">
              Endereço
            </label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-3 text-bella-400 w-4 h-4" />
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) => handleInputChange("endereco", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                placeholder="Rua, número, bairro, cidade"
                disabled={saving}
              />
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
                className="w-full pl-10 pr-4 py-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Informações adicionais sobre o cliente..."
                disabled={saving}
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex space-x-3">
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
              disabled={saving || !formData.nome.trim()}
            >
              {saving ? "Salvando..." : "Salvar Cliente"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
