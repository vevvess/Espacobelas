import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiPlus,
  FiSearch,
  FiPhone,
  FiMail,
  FiEdit,
  FiTrash2,
  FiX,
  FiCalendar,
  FiStar,
  FiUserCheck,
  FiGift,
  FiLoader,
  FiFileText,
} from "react-icons/fi";
import { useAuth } from "../contexts/SimpleAuthContext";
import { useClientes } from "../hooks/useClientes";
import { Cliente } from "../lib/neon";
import NotionClienteSync from "../components/NotionClienteSync";
import ClienteImportManager from "../components/ClienteImportManager";
import NotionConnect from "../components/NotionConnect";
import {
  formatarAniversario,
  aniversarioParaData,
  isAniversarioProximo,
  formatarEntradaAniversario,
  validarFormatoAniversario
} from "../utils/dateFormatters";

export default function Clientes() {
  const { user } = useAuth();
  const {
    clientes,
    loading,
    error,
    addCliente,
    editCliente,
    removeCliente,
    searchClientes,
  } = useClientes();

  // Verificar se é funcionário (acesso somente leitura)
  const isReadOnly = !user?.is_admin;

  const [showNovoCliente, setShowNovoCliente] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroMensal, setFiltroMensal] = useState<string>("todos");
  const [saving, setSaving] = useState(false);

  // Formulário de novo cliente
  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    telefone: "",
    email: "",
    data_aniversario: "",
    observacoes: "",
    endereco: "",
  });

  const resetForm = () => {
    setNovoCliente({
      nome: "",
      telefone: "",
      email: "",
      data_aniversario: "",
      observacoes: "",
      endereco: "",
    });
  };

  const handleSalvarCliente = async () => {
    if (!novoCliente.nome.trim() || !novoCliente.telefone.trim()) {
      alert("Por favor, preencha pelo menos o nome e telefone");
      return;
    }

    try {
      setSaving(true);

      // Converter data de aniversário (DD/MM) para data completa usando utilitário
      const dataNascimento = aniversarioParaData(novoCliente.data_aniversario);

      const clienteData = {
        nome: novoCliente.nome.trim(),
        telefone: novoCliente.telefone.trim(),
        email: novoCliente.email.trim() || undefined,
        data_nascimento: dataNascimento,
        observacoes: novoCliente.observacoes.trim() || undefined,
        endereco: novoCliente.endereco.trim() || undefined,
      };

      if (clienteEditando) {
        // Editando cliente existente
        await editCliente(clienteEditando.id, clienteData);
        setClienteEditando(null);
      } else {
        // Novo cliente
        await addCliente(clienteData);
      }

      setShowNovoCliente(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditarCliente = (cliente: Cliente) => {
    setClienteEditando(cliente);

    // Converter data_nascimento para formato DD/MM usando utilitário
    const dataAniversario = formatarAniversario(cliente.data_nascimento);

    setNovoCliente({
      nome: cliente.nome,
      telefone: cliente.telefone || "",
      email: cliente.email || "",
      data_aniversario: dataAniversario,
      observacoes: cliente.observacoes || "",
      endereco: cliente.endereco || "",
    });
    setShowNovoCliente(true);
  };

  const handleDeleteCliente = async (id: string) => {
    const cliente = clientes.find((c) => c.id === id);
    if (
      confirm(
        `Tem certeza que deseja excluir o cliente "${cliente?.nome}"? Esta ação não pode ser desfeita.`,
      )
    ) {
      try {
        await removeCliente(id);
      } catch (error) {
        console.error("Erro ao excluir cliente:", error);
      }
    }
  };

  const handleCancelarModal = () => {
    setShowNovoCliente(false);
    setClienteEditando(null);
    resetForm();
  };

  const formatarTelefone = (telefone: string) => {
    const numero = telefone.replace(/\D/g, "");
    if (numero.length === 11) {
      return `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`;
    }
    if (numero.length === 10) {
      return `(${numero.slice(0, 2)}) ${numero.slice(2, 6)}-${numero.slice(6)}`;
    }
    return telefone;
  };

  // Funções movidas para utils/dateFormatters.ts

  // Filtros de busca
  const clientesFiltrados = busca ? searchClientes(busca) : clientes;

  const estatisticas = {
    total: clientes.length,
    mensais: 0, // Removido filtro mensal pois não temos esse campo no schema
    aniversariantes: clientes.filter((c) =>
      isAniversarioProximo(c.data_nascimento),
    ).length,
    novos: clientes.filter(
      (c) =>
        new Date().getTime() - new Date(c.created_at).getTime() <
        30 * 24 * 60 * 60 * 1000,
    ).length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bella-800">Clientes</h1>
          <p className="text-bella-600">Gerencie o cadastro de clientes</p>
        </div>
        <button
          onClick={() => setShowNovoCliente(true)}
          className="bella-button flex items-center space-x-2"
        >
          <FiPlus className="w-4 h-4" />
          <span>Novo Cliente</span>
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
            <FiUsers className="w-8 h-8 text-bella-500" />
          </div>
        </div>

        <div className="bella-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bella-600">Este Mês</p>
              <p className="text-2xl font-bold text-green-600">
                {
                  clientes.filter(
                    (c) =>
                      new Date(c.created_at).getMonth() ===
                        new Date().getMonth() &&
                      new Date(c.created_at).getFullYear() ===
                        new Date().getFullYear(),
                  ).length
                }
              </p>
            </div>
            <FiStar className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bella-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bella-600">Aniversários</p>
              <p className="text-2xl font-bold text-yellow-600">
                {estatisticas.aniversariantes}
              </p>
            </div>
            <FiGift className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bella-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bella-600">Novos (30d)</p>
              <p className="text-2xl font-bold text-blue-600">
                {estatisticas.novos}
              </p>
            </div>
            <FiUserCheck className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Integração real com Notion (OAuth) - Apenas Admin */}
      {!isReadOnly && (
        <>
          <NotionConnect />
          <NotionClienteSync />
        </>
      )}

      {/* Importação de Lista de Clientes - Apenas para Admins */}
      {!isReadOnly && (
        <ClienteImportManager />
      )}

      {/* Filtros */}
      <div className="bella-card">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-bella-700 mb-2">
              Buscar Cliente
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bella-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome, telefone ou email..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="bella-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-bella-800">
            Lista de Clientes
          </h2>
          <span className="bg-bella-100 text-bella-700 text-sm font-medium px-3 py-1 rounded-full">
            {clientesFiltrados.length} clientes
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <FiLoader className="w-8 h-8 text-bella-400 animate-spin" />
            <span className="ml-2 text-bella-600">Carregando clientes...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              Erro ao carregar clientes: {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bella-button"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {clientesFiltrados.map((cliente) => {
              const aniversarioProximo = isAniversarioProximo(
                cliente.data_nascimento,
              );

              return (
                <div
                  key={cliente.id}
                  className="bg-bella-50 rounded-lg p-4 hover:bg-bella-100 transition-colors duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-bella-400 to-bella-300 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {cliente.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-bella-800 text-lg">
                            {cliente.nome}
                          </h3>
                          {aniversarioProximo && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                              🎂 Aniversário
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-bella-600">
                          {cliente.telefone && (
                            <div className="flex items-center space-x-2">
                              <FiPhone className="w-4 h-4 text-bella-400" />
                              <span>{formatarTelefone(cliente.telefone)}</span>
                            </div>
                          )}

                          {cliente.email && (
                            <div className="flex items-center space-x-2">
                              <FiMail className="w-4 h-4 text-bella-400" />
                              <span>{cliente.email}</span>
                            </div>
                          )}

                          {cliente.data_nascimento && (
                            <div className="flex items-center space-x-2">
                              <FiCalendar className="w-4 h-4 text-bella-400" />
                              <span>
                                Aniversário: {formatarAniversario(cliente.data_nascimento)}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                            <FiUserCheck className="w-4 h-4 text-bella-400" />
                            <span>
                              Cliente desde{" "}
                              {new Date(cliente.created_at).toLocaleDateString(
                                "pt-BR",
                              )}
                            </span>
                          </div>
                        </div>

                        {cliente.observacoes && (
                          <div className="mt-2 p-2 bg-white rounded border-l-4 border-bella-300">
                            <p className="text-sm text-bella-700">
                              <strong>Obs:</strong> {cliente.observacoes}
                            </p>
                          </div>
                        )}

                        {cliente.endereco && (
                          <div className="mt-2 text-xs text-bella-500">
                            <strong>Endereço:</strong> {cliente.endereco}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          window.open(
                            `/ficha-cliente?cliente=${cliente.id}`,
                            "_blank",
                          )
                        }
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Ver Ficha"
                        disabled={saving}
                      >
                        <FiFileText className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleEditarCliente(cliente)}
                        className="p-2 text-bella-600 hover:bg-bella-200 rounded-lg transition-colors"
                        title="Editar"
                        disabled={saving}
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteCliente(cliente.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Excluir"
                        disabled={saving}
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {clientesFiltrados.length === 0 && !loading && (
              <div className="text-center py-8">
                <FiUsers className="w-12 h-12 text-bella-300 mx-auto mb-4" />
                <p className="text-bella-600">
                  {busca
                    ? "Nenhum cliente encontrado"
                    : "Nenhum cliente cadastrado ainda"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Novo/Editar Cliente */}
      {showNovoCliente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-bella-800">
                {clienteEditando ? "Editar Cliente" : "Novo Cliente"}
              </h2>
              <button
                onClick={handleCancelarModal}
                className="p-2 text-bella-600 hover:bg-bella-100 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  Nome Completo *
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
                  className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                  placeholder="Digite o nome completo"
                  required
                />
              </div>

              {/* Telefone e Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-bella-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={novoCliente.telefone}
                    onChange={(e) =>
                      setNovoCliente((prev) => ({
                        ...prev,
                        telefone: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-bella-700 mb-2">
                    Email{" "}
                    <span className="text-bella-400 text-xs">(opcional)</span>
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
                    className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                    placeholder="cliente@email.com (opcional)"
                  />
                </div>
              </div>

              {/* Data de Aniversário */}
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  Data de Aniversário (DD/MM)
                </label>
                <input
                  type="text"
                  value={novoCliente.data_aniversario}
                  onChange={(e) => {
                    const valorFormatado = formatarEntradaAniversario(e.target.value);
                    setNovoCliente((prev) => ({
                      ...prev,
                      data_aniversario: valorFormatado,
                    }));
                  }}
                  className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                  placeholder="Ex: 15/06"
                  maxLength={5}
                  disabled={saving}
                />
                <p className="text-xs text-bella-500 mt-1">
                  Digite apenas dia e mês (ex: 15/06)
                </p>
              </div>

              {/* Endereço */}
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  Endereço
                </label>
                <input
                  type="text"
                  value={novoCliente.endereco}
                  onChange={(e) =>
                    setNovoCliente((prev) => ({
                      ...prev,
                      endereco: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                  placeholder="Endereço completo (opcional)"
                  disabled={saving}
                />
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={novoCliente.observacoes}
                  onChange={(e) =>
                    setNovoCliente((prev) => ({
                      ...prev,
                      observacoes: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                  rows={3}
                  placeholder="Preferências, alergias, observações especiais..."
                />
              </div>

              {/* Botões */}
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelarModal}
                  className="flex-1 px-4 py-3 border border-bella-300 text-bella-700 rounded-lg hover:bg-bella-50 transition-colors"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarCliente}
                  className="flex-1 bella-button flex items-center justify-center space-x-2"
                  disabled={saving}
                >
                  {saving && <FiLoader className="w-4 h-4 animate-spin" />}
                  <span>
                    {saving
                      ? "Salvando..."
                      : (clienteEditando ? "Atualizar" : "Salvar") + " Cliente"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
