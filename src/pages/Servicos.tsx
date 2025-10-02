import React, { useState, useEffect } from "react";
import {
  FiSettings,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiX,
  FiClock,
  FiDollarSign,
  FiTag,
  FiToggleLeft,
  FiToggleRight,
  FiLoader,
} from "react-icons/fi";
import { useAuth } from "../contexts/SimpleAuthContext";
import { useServicos } from "../hooks/useServicos";
import { Servico } from "@/lib/neon";

const categorias = [
  "Cabelo",
  "Unhas",
  "Sobrancelhas",
  "Estética",
  "Tratamentos",
  "Outros",
];

export default function Servicos() {
  const { user } = useAuth();
  const { servicos, loading, error, addServico, editServico, removeServico } =
    useServicos();

  const [showNovoServico, setShowNovoServico] = useState(false);
  const [servicoEditando, setServicoEditando] = useState<Servico | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [saving, setSaving] = useState(false);

  // Formulário de novo serviço
  const [novoServico, setNovoServico] = useState({
    nome: "",
    duracao_minutos: 60,
    preco: 0,
    categoria: "Cabelo",
    descricao: "",
    ativo: true,
  });

  const resetForm = () => {
    setNovoServico({
      nome: "",
      duracao_minutos: 60,
      preco: 0,
      categoria: "Cabelo",
      descricao: "",
      ativo: true,
    });
  };

  const handleSalvarServico = async () => {
    if (!novoServico.nome || !novoServico.categoria || novoServico.preco <= 0) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    setSaving(true);

    try {
      if (servicoEditando) {
        // Editando serviço existente
        await editServico(servicoEditando.id, {
          nome: novoServico.nome,
          descricao: novoServico.descricao,
          preco: novoServico.preco,
          duracao_minutos: novoServico.duracao_minutos,
          ativo: novoServico.ativo,
        });
        setServicoEditando(null);
      } else {
        // Novo serviço
        await addServico({
          nome: novoServico.nome,
          descricao: novoServico.descricao,
          preco: novoServico.preco,
          duracao_minutos: novoServico.duracao_minutos,
          ativo: novoServico.ativo,
        });
      }

      setShowNovoServico(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      alert("Erro ao salvar serviço");
    } finally {
      setSaving(false);
    }
  };

  const handleEditarServico = (servico: Servico) => {
    setServicoEditando(servico);
    setNovoServico({
      nome: servico.nome,
      duracao_minutos: servico.duracao_minutos,
      preco: servico.preco,
      categoria: "Cabelo", // Como categoria não existe no banco, usar valor padrão
      descricao: servico.descricao || "",
      ativo: servico.ativo,
    });
    setShowNovoServico(true);
  };

  const handleDeleteServico = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      try {
        await removeServico(id);
      } catch (error) {
        console.error("Erro ao excluir serviço:", error);
        alert("Erro ao excluir serviço");
      }
    }
  };

  const handleToggleAtivo = async (id: string) => {
    try {
      const servico = servicos.find((s) => s.id === id);
      if (servico) {
        await editServico(id, { ...servico, ativo: !servico.ativo });
      }
    } catch (error) {
      console.error("Erro ao atualizar status do serviço:", error);
      alert("Erro ao atualizar status do serviço");
    }
  };

  const handleCancelarModal = () => {
    setShowNovoServico(false);
    setServicoEditando(null);
    resetForm();
  };

  // Filtros
  const servicosFiltrados = servicos.filter((servico) => {
    const matchBusca = servico.nome.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria =
      filtroCategoria === "todas" || servico.categoria === filtroCategoria;
    return matchBusca && matchCategoria;
  });

  const formatarDuracao = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const min = minutos % 60;
    if (horas > 0) {
      return `${horas}h${min > 0 ? ` ${min}min` : ""}`;
    }
    return `${min}min`;
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  // Estatísticas
  const estatisticas = {
    total: servicos.length,
    ativos: servicos.filter((s) => s.ativo).length,
    inativos: servicos.filter((s) => !s.ativo).length,
    valorMedio:
      servicos.length > 0
        ? servicos.reduce((sum, s) => sum + s.preco, 0) / servicos.length
        : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FiLoader className="w-8 h-8 text-bella-500 animate-spin" />
        <span className="ml-2 text-bella-600">Carregando serviços...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bella-card">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">
            Erro ao carregar serviços: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bella-button"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bella-800">Serviços</h1>
          <p className="text-bella-600">Gerencie os serviços oferecidos</p>
        </div>
        <button
          onClick={() => setShowNovoServico(true)}
          className="bella-button flex items-center space-x-2"
        >
          <FiPlus className="w-4 h-4" />
          <span>Novo Serviço</span>
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bella-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bella-600">Total</p>
              <p className="text-2xl font-bold text-bella-700">
                {estatisticas.total}
              </p>
            </div>
            <FiSettings className="w-8 h-8 text-bella-500" />
          </div>
        </div>

        <div className="bella-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bella-600">Ativos</p>
              <p className="text-2xl font-bold text-green-600">
                {estatisticas.ativos}
              </p>
            </div>
            <FiToggleRight className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bella-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bella-600">Inativos</p>
              <p className="text-2xl font-bold text-red-600">
                {estatisticas.inativos}
              </p>
            </div>
            <FiToggleLeft className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bella-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bella-600">Valor Médio</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatarValor(estatisticas.valorMedio)}
              </p>
            </div>
            <FiDollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bella-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-bella-700 mb-2">
              Buscar Serviço
            </label>
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full px-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-bella-700 mb-2">
              Categoria
            </label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full px-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
            >
              <option value="todas">Todas as categorias</option>
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Serviços */}
      <div className="bella-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-bella-800">
            Lista de Serviços
          </h2>
          <span className="bg-bella-100 text-bella-700 text-sm font-medium px-3 py-1 rounded-full">
            {servicosFiltrados.length} serviços
          </span>
        </div>

        <div className="space-y-4">
          {servicosFiltrados.map((servico) => (
            <div
              key={servico.id}
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 bg-bella-50 rounded-lg hover:bg-bella-100 transition-colors duration-200"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-bella-800 text-lg">
                    {servico.nome}
                  </h3>
                  <span className="bg-bella-200 text-bella-700 text-xs font-medium px-2 py-1 rounded-full">
                    {servico.categoria}
                  </span>
                  {servico.ativo ? (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      Ativo
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                      Inativo
                    </span>
                  )}
                </div>

                {servico.descricao && (
                  <p className="text-bella-600 text-sm mb-2">
                    {servico.descricao}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-bella-600">
                  <div className="flex items-center space-x-1">
                    <FiClock className="w-4 h-4" />
                    <span>{formatarDuracao(servico.duracao_minutos)}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <FiDollarSign className="w-4 h-4" />
                    <span className="font-semibold text-green-600">
                      {formatarValor(servico.preco)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleAtivo(servico.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    servico.ativo
                      ? "text-green-600 hover:bg-green-100"
                      : "text-red-600 hover:bg-red-100"
                  }`}
                  title={servico.ativo ? "Desativar" : "Ativar"}
                >
                  {servico.ativo ? (
                    <FiToggleRight className="w-5 h-5" />
                  ) : (
                    <FiToggleLeft className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={() => handleEditarServico(servico)}
                  className="p-2 text-bella-600 hover:bg-bella-200 rounded-lg transition-colors"
                  title="Editar"
                >
                  <FiEdit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteServico(servico.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {servicosFiltrados.length === 0 && (
            <div className="text-center py-8">
              <FiSettings className="w-12 h-12 text-bella-300 mx-auto mb-4" />
              <p className="text-bella-600">
                {busca || filtroCategoria !== "todas"
                  ? "Nenhum serviço encontrado"
                  : "Nenhum serviço cadastrado ainda"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Novo/Editar Serviço */}
      {showNovoServico && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-bella-800">
                {servicoEditando ? "Editar Serviço" : "Novo Serviço"}
              </h2>
              <button
                onClick={handleCancelarModal}
                className="p-2 text-bella-600 hover:bg-bella-100 rounded-lg"
                disabled={saving}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-bella-700 mb-2">
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
                    className="w-full px-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                    placeholder="Ex: Corte feminino"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-bella-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={novoServico.categoria}
                    onChange={(e) =>
                      setNovoServico((prev) => ({
                        ...prev,
                        categoria: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                    disabled={saving}
                  >
                    {categorias.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-bella-700 mb-2">
                    Duração (minutos) *
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={novoServico.duracao_minutos}
                    onChange={(e) =>
                      setNovoServico((prev) => ({
                        ...prev,
                        duracao_minutos: parseInt(e.target.value) || 60,
                      }))
                    }
                    className="w-full px-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-bella-700 mb-2">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={novoServico.preco}
                    onChange={(e) =>
                      setNovoServico((prev) => ({
                        ...prev,
                        preco: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                    disabled={saving}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={novoServico.descricao}
                  onChange={(e) =>
                    setNovoServico((prev) => ({
                      ...prev,
                      descricao: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descrição do serviço..."
                  disabled={saving}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={novoServico.ativo}
                  onChange={(e) =>
                    setNovoServico((prev) => ({
                      ...prev,
                      ativo: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-bella-600 border-bella-300 rounded focus:ring-bella-500"
                  disabled={saving}
                />
                <label htmlFor="ativo" className="text-sm text-bella-700">
                  Serviço ativo
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCancelarModal}
                className="flex-1 px-4 py-2 border border-bella-300 text-bella-700 rounded-lg hover:bg-bella-50 transition-colors"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarServico}
                className="flex-1 bella-button"
                disabled={
                  saving ||
                  !novoServico.nome ||
                  !novoServico.categoria ||
                  novoServico.preco <= 0
                }
              >
                {saving ? "Salvando..." : "Salvar Serviço"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
