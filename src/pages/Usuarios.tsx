import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/SimpleAuthContext";
import {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  UserSimple,
  ensureCanEditAllMigration,
} from "../services/userService";
import {
  FiUsers,
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiX,
  FiLoader,
  FiShield,
  FiUser,
  FiEye,
  FiEyeOff,
  FiUserCheck,
  FiUserX,
  FiDroplet,
} from "react-icons/fi";
import { FuncionarioCoresConfig } from "../components/FuncionarioCoresConfig";

interface Usuario {
  id: string;
  username: string;
  nome: string;
  is_admin: boolean;
  can_edit_all?: boolean;
  ativo: boolean;
  created_at: string;
  created_by?: string;
}

export default function Usuarios() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [showNovoUsuario, setShowNovoUsuario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCoresConfig, setShowCoresConfig] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formulário de novo usuário
  const [novoUsuario, setNovoUsuario] = useState({
    username: "",
    password: "",
    nome: "",
    is_admin: false,
    can_edit_all: false,
  });

  // Verificar se é admin
  if (!user?.is_admin) {
    return (
      <div className="bella-card text-center py-8">
        <FiShield className="w-12 h-12 text-bella-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-bella-800 mb-2">
          Acesso Restrito
        </h2>
        <p className="text-bella-600">
          Apenas administradores podem acessar esta página.
        </p>
      </div>
    );
  }

  // Carregar usuários do banco de dados
  useEffect(() => {
    const loadUsuarios = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Carregando usuários do banco de dados...");

        // Garantir que a migração can_edit_all foi executada
        await ensureCanEditAllMigration();

        const usuariosBanco = await getAllUsers();

        const usuariosFormatados: Usuario[] = usuariosBanco.map(
          (u: UserSimple) => ({
            id: u.id,
            username: u.username,
            nome: u.nome,
            is_admin: u.is_admin,
            can_edit_all: u.can_edit_all || false,
            ativo: u.ativo,
            created_at: u.created_at.toISOString(),
            created_by: u.created_by,
          }),
        );

        setUsuarios(usuariosFormatados);
        console.log("Usuários carregados:", usuariosFormatados.length);
      } catch (err) {
        console.error("Erro ao carregar usuários:", err);
        setError("Erro ao carregar usuários do banco de dados");
      } finally {
        setLoading(false);
      }
    };

    loadUsuarios();
  }, []);

  const resetForm = () => {
    setNovoUsuario({
      username: "",
      password: "",
      nome: "",
      is_admin: false,
      can_edit_all: false,
    });
    setError(null);
  };

  const handleSalvarUsuario = async () => {
    if (
      !novoUsuario.username.trim() ||
      !novoUsuario.nome.trim() ||
      (!usuarioEditando && !novoUsuario.password.trim())
    ) {
      setError("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (usuarioEditando) {
        // Editando usuário existente
        console.log("Atualizando usuário:", usuarioEditando.id);
        console.log("Dados do formulário:", novoUsuario);

        const dadosAtualizacao: any = {
          username: novoUsuario.username.trim(),
          nome: novoUsuario.nome.trim(),
          is_admin: novoUsuario.is_admin,
          can_edit_all: novoUsuario.can_edit_all,
        };

        console.log("Dados de atualização enviados:", dadosAtualizacao);

        // Só incluir senha se foi preenchida
        if (novoUsuario.password.trim()) {
          dadosAtualizacao.password = novoUsuario.password.trim();
        }

        const usuarioAtualizado = await updateUser(
          usuarioEditando.id,
          dadosAtualizacao,
        );

        console.log(
          "Usuário atualizado retornado do servidor:",
          usuarioAtualizado,
        );

        setUsuarios((prev) =>
          prev.map((usuario) =>
            usuario.id === usuarioEditando.id
              ? {
                  ...usuario,
                  username: usuarioAtualizado.username,
                  nome: usuarioAtualizado.nome,
                  is_admin: usuarioAtualizado.is_admin,
                  can_edit_all: usuarioAtualizado.can_edit_all || false,
                }
              : usuario,
          ),
        );

        setUsuarioEditando(null);
        console.log("Usuário atualizado com sucesso");
      } else {
        // Novo usuário
        console.log("Criando novo usuário:", novoUsuario.username);

        const novoUsuarioCriado = await createUser({
          username: novoUsuario.username.trim(),
          password: novoUsuario.password.trim(),
          nome: novoUsuario.nome.trim(),
          is_admin: novoUsuario.is_admin,
          can_edit_all: novoUsuario.can_edit_all,
          created_by: user.id,
        });

        const usuarioFormatado: Usuario = {
          id: novoUsuarioCriado.id,
          username: novoUsuarioCriado.username,
          nome: novoUsuarioCriado.nome,
          is_admin: novoUsuarioCriado.is_admin,
          can_edit_all: novoUsuarioCriado.can_edit_all || false,
          ativo: novoUsuarioCriado.ativo,
          created_at: novoUsuarioCriado.created_at.toISOString(),
          created_by: novoUsuarioCriado.created_by,
        };

        setUsuarios((prev) => [usuarioFormatado, ...prev]);
        console.log("Usuário criado com sucesso");
      }

      setShowNovoUsuario(false);
      resetForm();
    } catch (error: any) {
      console.error("Erro ao salvar usuário:", error);
      setError(error.message || "Erro ao salvar usuário");
    } finally {
      setSaving(false);
    }
  };

  const handleEditarUsuario = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setNovoUsuario({
      username: usuario.username,
      password: "", // Não mostramos a senha atual
      nome: usuario.nome,
      is_admin: usuario.is_admin,
      can_edit_all: usuario.can_edit_all || false,
    });
    setShowNovoUsuario(true);
    setError(null);
  };

  const handleDeleteUsuario = async (id: string) => {
    const usuario = usuarios.find((u) => u.id === id);
    if (
      confirm(
        `Tem certeza que deseja excluir o usuário "${usuario?.nome}"? Esta ação não pode ser desfeita.`,
      )
    ) {
      try {
        console.log("Excluindo usuário:", id);
        const sucesso = await deleteUser(id);

        if (sucesso) {
          setUsuarios((prev) => prev.filter((u) => u.id !== id));
          console.log("Usuário excluído com sucesso");
        } else {
          setError("Erro ao excluir usuário");
        }
      } catch (error: any) {
        console.error("Erro ao excluir usuário:", error);
        setError("Erro ao excluir usuário");
      }
    }
  };

  const handleToggleAtivo = async (id: string) => {
    try {
      const usuario = usuarios.find((u) => u.id === id);
      if (!usuario) return;

      console.log("Alterando status do usuário:", id, "para", !usuario.ativo);

      const usuarioAtualizado = await updateUser(id, { ativo: !usuario.ativo });

      setUsuarios((prev) =>
        prev.map((usuario) =>
          usuario.id === id
            ? { ...usuario, ativo: usuarioAtualizado.ativo }
            : usuario,
        ),
      );

      console.log("Status do usuário alterado com sucesso");
    } catch (error: any) {
      console.error("Erro ao alterar status do usuário:", error);
      setError("Erro ao alterar status do usuário");
    }
  };

  const handleCancelarModal = () => {
    setShowNovoUsuario(false);
    setUsuarioEditando(null);
    resetForm();
  };

  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
      usuario.username.toLowerCase().includes(busca.toLowerCase()),
  );

  const estatisticas = {
    total: usuarios.length,
    admins: usuarios.filter((u) => u.is_admin).length,
    ativos: usuarios.filter((u) => u.ativo).length,
    inativos: usuarios.filter((u) => !u.ativo).length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bella-800">
            Gestão de Usuários
          </h1>
          <p className="text-bella-600">Gerencie usuários e permissões</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCoresConfig(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <FiDroplet className="w-4 h-4" />
            <span>Configurar Cores</span>
          </button>
          <button
            onClick={() => setShowNovoUsuario(true)}
            className="bella-button flex items-center space-x-2"
          >
            <FiPlus className="w-4 h-4" />
            <span>Novo Usuário</span>
          </button>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiX className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex text-red-400 hover:text-red-600"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

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
              <p className="text-sm font-medium text-bella-600">Admins</p>
              <p className="text-2xl font-bold text-purple-600">
                {estatisticas.admins}
              </p>
            </div>
            <FiShield className="w-8 h-8 text-purple-500" />
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
            <FiUserCheck className="w-8 h-8 text-green-500" />
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
            <FiUserX className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bella-card">
        <div>
          <label className="block text-sm font-medium text-bella-700 mb-2">
            Buscar Usuário
          </label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bella-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome ou usuário..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="bella-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-bella-800">
            Lista de Usuários
          </h2>
          <span className="bg-bella-100 text-bella-700 text-sm font-medium px-3 py-1 rounded-full">
            {usuariosFiltrados.length} usuários
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <FiLoader className="w-8 h-8 text-bella-400 animate-spin" />
            <span className="ml-2 text-bella-600">Carregando usuários...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {usuariosFiltrados.map((usuario) => (
              <div
                key={usuario.id}
                className={`rounded-lg p-4 transition-colors duration-200 ${
                  usuario.ativo
                    ? "bg-bella-50 hover:bg-bella-100"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        usuario.ativo
                          ? "bg-gradient-to-r from-bella-400 to-bella-300"
                          : "bg-gray-400"
                      }`}
                    >
                      <span className="text-white font-semibold text-lg">
                        {usuario.nome.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3
                          className={`font-semibold text-lg ${
                            usuario.ativo ? "text-bella-800" : "text-gray-600"
                          }`}
                        >
                          {usuario.nome}
                        </h3>
                        {usuario.is_admin && (
                          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1">
                            <FiShield className="w-3 h-3" />
                            <span>Admin</span>
                          </span>
                        )}
                        {!usuario.is_admin && usuario.can_edit_all && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1">
                            <FiUserCheck className="w-3 h-3" />
                            <span>Acesso Total</span>
                          </span>
                        )}
                        {!usuario.ativo && (
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                            Inativo
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-bella-600">
                        <div className="flex items-center space-x-2">
                          <FiUser className="w-4 h-4 text-bella-400" />
                          <span>@{usuario.username}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-bella-500">
                            Criado em{" "}
                            {new Date(usuario.created_at).toLocaleDateString(
                              "pt-BR",
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleAtivo(usuario.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        usuario.ativo
                          ? "text-red-600 hover:bg-red-100"
                          : "text-green-600 hover:bg-green-100"
                      }`}
                      title={usuario.ativo ? "Desativar" : "Ativar"}
                      disabled={saving || usuario.id === user.id}
                    >
                      {usuario.ativo ? (
                        <FiUserX className="w-4 h-4" />
                      ) : (
                        <FiUserCheck className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleEditarUsuario(usuario)}
                      className="p-2 text-bella-600 hover:bg-bella-200 rounded-lg transition-colors"
                      title="Editar"
                      disabled={saving}
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteUsuario(usuario.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Excluir"
                      disabled={saving || usuario.id === user.id}
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {usuariosFiltrados.length === 0 && !loading && (
              <div className="text-center py-8">
                <FiUsers className="w-12 h-12 text-bella-300 mx-auto mb-4" />
                <p className="text-bella-600">
                  {busca
                    ? "Nenhum usuário encontrado"
                    : "Nenhum usuário cadastrado ainda"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Novo/Editar Usuário */}
      {showNovoUsuario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-bella-800">
                {usuarioEditando ? "Editar Usuário" : "Novo Usuário"}
              </h2>
              <button
                onClick={handleCancelarModal}
                className="p-2 text-bella-600 hover:bg-bella-100 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Erro no Modal */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={novoUsuario.nome}
                  onChange={(e) =>
                    setNovoUsuario((prev) => ({
                      ...prev,
                      nome: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                  placeholder="Digite o nome completo"
                  required
                  disabled={saving}
                />
              </div>

              {/* Usuário e Senha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-bella-700 mb-2">
                    Usuário *
                  </label>
                  <input
                    type="text"
                    value={novoUsuario.username}
                    onChange={(e) =>
                      setNovoUsuario((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                    placeholder="usuario"
                    required
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-bella-700 mb-2">
                    Senha {!usuarioEditando && "*"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={novoUsuario.password}
                      onChange={(e) =>
                        setNovoUsuario((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="w-full p-3 pr-10 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                      placeholder={
                        usuarioEditando
                          ? "Deixe vazio para manter a atual"
                          : "Digite a senha"
                      }
                      required={!usuarioEditando}
                      disabled={saving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-bella-400 hover:text-bella-600"
                      disabled={saving}
                    >
                      {showPassword ? (
                        <FiEyeOff className="w-4 h-4" />
                      ) : (
                        <FiEye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Administrador */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={novoUsuario.is_admin}
                    onChange={(e) =>
                      setNovoUsuario((prev) => ({
                        ...prev,
                        is_admin: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 text-bella-600 border-bella-300 rounded focus:ring-bella-500"
                    disabled={saving}
                  />
                  <div>
                    <span className="text-sm font-medium text-bella-700 flex items-center space-x-2">
                      <FiShield className="w-4 h-4" />
                      <span>Administrador</span>
                    </span>
                    <p className="text-xs text-bella-600">
                      Usuário terá acesso total ao sistema
                    </p>
                  </div>
                </label>
              </div>

              {/* Acesso Total à Agenda - apenas se não for admin */}
              {!novoUsuario.is_admin && (
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={novoUsuario.can_edit_all}
                      onChange={(e) =>
                        setNovoUsuario((prev) => ({
                          ...prev,
                          can_edit_all: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 text-green-600 border-bella-300 rounded focus:ring-green-500"
                      disabled={saving}
                    />
                    <div>
                      <span className="text-sm font-medium text-bella-700 flex items-center space-x-2">
                        <FiUserCheck className="w-4 h-4" />
                        <span>Acesso Total à Agenda</span>
                      </span>
                      <p className="text-xs text-bella-600">
                        Funcionário poderá ver todos os agendamentos, editar e
                        ver valores
                      </p>
                    </div>
                  </label>
                </div>
              )}

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
                  onClick={handleSalvarUsuario}
                  className="flex-1 bella-button flex items-center justify-center space-x-2"
                  disabled={saving}
                >
                  {saving && <FiLoader className="w-4 h-4 animate-spin" />}
                  <span>
                    {saving
                      ? "Salvando..."
                      : (usuarioEditando ? "Atualizar" : "Salvar") + " Usuário"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Configuração de Cores */}
      <FuncionarioCoresConfig
        isOpen={showCoresConfig}
        onClose={() => setShowCoresConfig(false)}
      />
    </div>
  );
}
