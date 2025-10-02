import React, { useState, useEffect } from "react";
import {
  FiX,
  FiEdit,
  FiDollarSign,
  FiCreditCard,
  FiCalendar,
  FiFileText,
  FiSave,
} from "react-icons/fi";
import { FORMAS_PAGAMENTO } from "@/services/agendamentoService";

interface ModalEditarMovimentacaoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    movimentoId: string;
    descricao: string;
    valor: number;
    categoria: string;
    formaPagamento?: string;
    data: Date;
    observacoes: string;
  }) => Promise<void>;
  movimentacao: any;
}

const categoriasEntrada = ["Atendimento", "Produtos", "Outros"];
const categoriasSaida = [
  "Compras",
  "Salários",
  "Aluguel",
  "Fornecedores",
  "Outros",
];

export function ModalEditarMovimentacao({
  isOpen,
  onClose,
  onSave,
  movimentacao,
}: ModalEditarMovimentacaoProps) {
  const [saving, setSaving] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [data, setData] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // Reset form quando modal abre
  useEffect(() => {
    if (isOpen && movimentacao) {
      setDescricao(movimentacao.descricao || "");
      setValor(movimentacao.valor?.toString() || "");
      setCategoria(movimentacao.categoria || "");
      setFormaPagamento(movimentacao.formaPagamento || "dinheiro");
      setObservacoes(movimentacao.observacoes || "");

      // Formatar data para input datetime-local
      if (movimentacao.data) {
        const dataLocal = new Date(movimentacao.data);
        const offsetMs = dataLocal.getTimezoneOffset() * 60000;
        const dataComOffset = new Date(dataLocal.getTime() - offsetMs);
        setData(dataComOffset.toISOString().slice(0, 16));
      }
    }
  }, [isOpen, movimentacao]);

  const handleSave = async () => {
    if (!descricao.trim() || !valor || !categoria || !data) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      alert("Valor deve ser um número positivo");
      return;
    }

    try {
      setSaving(true);
      await onSave({
        movimentoId: movimentacao.id,
        descricao: descricao.trim(),
        valor: valorNumerico,
        categoria,
        formaPagamento:
          movimentacao.tipo === "entrada" ? formaPagamento : undefined,
        data: new Date(data),
        observacoes: observacoes.trim(),
      });
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar alterações");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setDescricao("");
    setValor("");
    setCategoria("");
    setFormaPagamento("dinheiro");
    setData("");
    setObservacoes("");
  };

  const handleClose = () => {
    if (!saving) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen || !movimentacao) return null;

  const categorias =
    movimentacao.tipo === "entrada" ? categoriasEntrada : categoriasSaida;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-bella-800 flex items-center space-x-2">
            <FiEdit className="w-5 h-5" />
            <span>
              Editar {movimentacao.tipo === "entrada" ? "Entrada" : "Saída"}
            </span>
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-bella-600 hover:bg-bella-100 rounded-lg"
            disabled={saving}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Informações do Movimento Original */}
          <div className="bg-bella-50 rounded-lg p-4">
            <h3 className="font-semibold text-bella-800 mb-2 flex items-center space-x-2">
              <FiFileText className="w-4 h-4" />
              <span>Movimento Original</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-bella-600">Tipo:</span>{" "}
                <span
                  className={`font-medium ${
                    movimentacao.tipo === "entrada"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {movimentacao.tipo === "entrada" ? "Entrada" : "Saída"}
                </span>
              </div>
              <div>
                <span className="text-bella-600">Cliente/Origem:</span>{" "}
                <span className="font-medium">
                  {movimentacao.clienteNome || "N/A"}
                </span>
              </div>
              {movimentacao.agendamentoId && (
                <div className="col-span-2">
                  <span className="text-bella-600">Agendamento:</span>{" "}
                  <span className="font-medium text-purple-600">
                    ID: {movimentacao.agendamentoId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Campos Editáveis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-bella-700 mb-2">
                Descrição *
              </label>
              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                placeholder="Descrição da movimentação"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-bella-700 mb-2">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                placeholder="0,00"
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-bella-700 mb-2">
                Categoria *
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                disabled={saving}
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {movimentacao.tipo === "entrada" && (
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  Forma de Pagamento
                </label>
                <select
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                  disabled={saving}
                >
                  {FORMAS_PAGAMENTO.filter((f) => !f.mensal).map((forma) => (
                    <option key={forma.id} value={forma.id}>
                      {forma.icon} {forma.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-bella-700 mb-2">
              Data e Hora *
            </label>
            <input
              type="datetime-local"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-bella-700 mb-2">
              Observações
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
              rows={3}
              placeholder="Observações sobre a movimentação..."
              disabled={saving}
            />
          </div>

          {/* Aviso sobre Propagação */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="text-yellow-600 mt-0.5">⚠️</div>
              <div>
                <h4 className="font-medium text-yellow-800">Importante</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  As alterações feitas aqui serão refletidas em todo o sistema,
                  incluindo relatórios, comissões e estatísticas. Certifique-se
                  de que os dados estão corretos antes de salvar.
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-bella-300 text-bella-700 rounded-lg hover:bg-bella-50"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bella-button flex items-center justify-center space-x-2"
              disabled={
                saving || !descricao.trim() || !valor || !categoria || !data
              }
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
