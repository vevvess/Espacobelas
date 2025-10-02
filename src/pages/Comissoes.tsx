import React, { useState, useEffect } from "react";
import {
  FiTrendingUp,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiEye,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiPercent,
  FiLock,
  FiBarChart,
} from "react-icons/fi";
import { useAuth } from "../contexts/SimpleAuthContext";
import { useAgendamentosRealTimeOptimized } from "../hooks/useAgendamentosRealTimeOptimized";
import { useRolePermissions } from "../components/RoleProtectedRoute";

interface ComissaoConfig {
  id: string;
  funcionario_id: string;
  funcionario_nome: string;
  servico_id?: string;
  servico_nome?: string;
  tipo: "percentual" | "valor_fixo";
  valor: number;
  ativo: boolean;
  created_at: Date;
}

export default function Comissoes() {
  const { user } = useAuth();
  const { isStaff, canEdit } = useRolePermissions();
  const {
    agendamentos,
    funcionarios,
    loading,
    formatCurrency,
    formatDateTime,
  } = useAgendamentosRealTimeOptimized();

  const [comissoes, setComissoes] = useState<ComissaoConfig[]>([]);
  const [showNovaComissao, setShowNovaComissao] = useState(false);
  const [comissaoEditando, setComissaoEditando] =
    useState<ComissaoConfig | null>(null);
  const [periodo, setPeriodo] = useState("mes-atual");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // Formulário de nova comissão
  const [novaComissao, setNovaComissao] = useState({
    funcionario_id: "",
    servico_id: "",
    tipo: "percentual" as "percentual" | "valor_fixo",
    valor: 0,
  });

  // Configurar período inicial
  useEffect(() => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    setDataInicio(inicioMes.toISOString().split("T")[0]);
    setDataFim(fimMes.toISOString().split("T")[0]);

    // Carregar comissões mockadas (em produção viria do banco)
    loadComissoes();
  }, []);

  const loadComissoes = () => {
    // Dados mockados de comissões
    const comissoesMock: ComissaoConfig[] = [
      {
        id: "1",
        funcionario_id: user?.id || "",
        funcionario_nome: user?.nome || "Funcionário",
        tipo: "percentual",
        valor: 20, // 20%
        ativo: true,
        created_at: new Date(),
      },
      // Adicionar mais comissões conforme necessário
    ];

    // Se for funcionário, mostrar apenas suas comissões
    const comissoesFiltradas = isStaff
      ? comissoesMock.filter((c) => c.funcionario_id === user?.id)
      : comissoesMock;

    setComissoes(comissoesFiltradas);
  };

  // Filtrar agendamentos pelo período
  const getAgendamentosPorPeriodo = () => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);

    return agendamentos.filter((agendamento) => {
      const dataAgendamento = new Date(agendamento.data_hora);
      return (
        dataAgendamento >= inicio &&
        dataAgendamento <= fim &&
        agendamento.status === "concluido"
      );
    });
  };

  // Calcular comissões por funcionário
  const calcularComissoes = () => {
    const agendamentosPeriodo = getAgendamentosPorPeriodo();
    const comissoesCalculadas: Record<
      string,
      {
        funcionario_nome: string;
        servicos: number;
        faturamento: number;
        comissao: number;
        agendamentos: any[];
      }
    > = {};

    agendamentosPeriodo.forEach((agendamento) => {
      agendamento.servicos?.forEach((servicoAgendamento) => {
        if (!servicoAgendamento.funcionario_id) return;

        // Se for funcionário, mostrar apenas seus dados
        if (isStaff && servicoAgendamento.funcionario_id !== user?.id) return;

        const funcionarioId = servicoAgendamento.funcionario_id;
        const funcionario = funcionarios.find((f) => f.id === funcionarioId);

        if (!funcionario) return;

        if (!comissoesCalculadas[funcionarioId]) {
          comissoesCalculadas[funcionarioId] = {
            funcionario_nome: funcionario.nome,
            servicos: 0,
            faturamento: 0,
            comissao: 0,
            agendamentos: [],
          };
        }

        const comissaoConfig = comissoes.find(
          (c) =>
            c.funcionario_id === funcionarioId &&
            (!c.servico_id || c.servico_id === servicoAgendamento.servico_id),
        );

        const valorServico = servicoAgendamento.preco;
        let valorComissao = 0;

        if (comissaoConfig && comissaoConfig.ativo) {
          if (comissaoConfig.tipo === "percentual") {
            valorComissao = (valorServico * comissaoConfig.valor) / 100;
          } else {
            valorComissao = comissaoConfig.valor;
          }
        }

        comissoesCalculadas[funcionarioId].servicos += 1;
        comissoesCalculadas[funcionarioId].faturamento += valorServico;
        comissoesCalculadas[funcionarioId].comissao += valorComissao;
        comissoesCalculadas[funcionarioId].agendamentos.push({
          ...agendamento,
          servico: servicoAgendamento,
          comissao: valorComissao,
        });
      });
    });

    return Object.values(comissoesCalculadas);
  };

  const handleSalvarComissao = () => {
    if (!novaComissao.funcionario_id || novaComissao.valor <= 0) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    const funcionario = funcionarios.find(
      (f) => f.id === novaComissao.funcionario_id,
    );
    if (!funcionario) return;

    if (comissaoEditando) {
      // Editar comissão existente
      setComissoes((prev) =>
        prev.map((c) =>
          c.id === comissaoEditando.id
            ? {
                ...c,
                funcionario_id: novaComissao.funcionario_id,
                funcionario_nome: funcionario.nome,
                servico_id: novaComissao.servico_id || undefined,
                tipo: novaComissao.tipo,
                valor: novaComissao.valor,
              }
            : c,
        ),
      );
      setComissaoEditando(null);
    } else {
      // Nova comissão
      const nova: ComissaoConfig = {
        id: Date.now().toString(),
        funcionario_id: novaComissao.funcionario_id,
        funcionario_nome: funcionario.nome,
        servico_id: novaComissao.servico_id || undefined,
        tipo: novaComissao.tipo,
        valor: novaComissao.valor,
        ativo: true,
        created_at: new Date(),
      };
      setComissoes((prev) => [...prev, nova]);
    }

    setShowNovaComissao(false);
    resetForm();
  };

  const resetForm = () => {
    setNovaComissao({
      funcionario_id: "",
      servico_id: "",
      tipo: "percentual",
      valor: 0,
    });
  };

  const handleEditarComissao = (comissao: ComissaoConfig) => {
    setComissaoEditando(comissao);
    setNovaComissao({
      funcionario_id: comissao.funcionario_id,
      servico_id: comissao.servico_id || "",
      tipo: comissao.tipo,
      valor: comissao.valor,
    });
    setShowNovaComissao(true);
  };

  const handleDeleteComissao = (id: string) => {
    if (
      confirm("Tem certeza que deseja excluir esta configuração de comissão?")
    ) {
      setComissoes((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const comissoesCalculadas = calcularComissoes();
  const totalComissoes = comissoesCalculadas.reduce(
    (sum, c) => sum + c.comissao,
    0,
  );
  const totalFaturamento = comissoesCalculadas.reduce(
    (sum, c) => sum + c.faturamento,
    0,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-bella-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-bella-600">Carregando comissões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bella-800 flex items-center space-x-2">
            <span>Comissões</span>
            {isStaff && (
              <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1">
                <FiEye className="w-3 h-3" />
                <span>Minhas Comissões</span>
              </span>
            )}
          </h1>
          <p className="text-bella-600">
            {isStaff
              ? "Visualize suas comissões e rendimentos"
              : "Gerencie comissões e calcule rendimentos dos funcionários"}
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowNovaComissao(true)}
            className="bella-button flex items-center space-x-2"
          >
            <FiPlus className="w-4 h-4" />
            <span>Nova Comissão</span>
          </button>
        )}
      </div>

      {/* Aviso para funcionários */}
      {isStaff && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <FiLock className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-medium text-amber-800">
                Visualização de Comissões
              </h3>
              <p className="text-sm text-amber-700">
                Você pode visualizar suas comissões e rendimentos, mas não pode
                editar as configurações. Entre em contato com um administrador
                para alterações.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros de Período */}
      <div className="bella-card">
        <h3 className="text-lg font-semibold text-bella-800 mb-4">
          Período de Cálculo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-bella-700 mb-2">
              Período Rápido
            </label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
            >
              <option value="mes-atual">Mês Atual</option>
              <option value="mes-passado">Mês Passado</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-bella-700 mb-2">
              Data Início
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-bella-700 mb-2">
              Data Fim
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
            />
          </div>
        </div>
      </div>

      {/* Resumo de Comissões */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bella-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bella-600">
                {isStaff ? "Meu Faturamento" : "Faturamento Total"}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalFaturamento)}
              </p>
            </div>
            <FiBarChart className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bella-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bella-600">
                {isStaff ? "Minhas Comissões" : "Total Comissões"}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalComissoes)}
              </p>
            </div>
            <FiDollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bella-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bella-600">
                % Médio de Comissão
              </p>
              <p className="text-2xl font-bold text-bella-600">
                {totalFaturamento > 0
                  ? ((totalComissoes / totalFaturamento) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
            <FiPercent className="w-8 h-8 text-bella-500" />
          </div>
        </div>
      </div>

      {/* Configurações de Comissão */}
      {!isStaff && comissoes.length > 0 && (
        <div className="bella-card">
          <h3 className="text-lg font-semibold text-bella-800 mb-4">
            Configurações de Comissão
          </h3>
          <div className="space-y-3">
            {comissoes.map((comissao) => (
              <div
                key={comissao.id}
                className="flex items-center justify-between p-3 bg-bella-50 rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-bella-800">
                    {comissao.funcionario_nome}
                  </h4>
                  <p className="text-sm text-bella-600">
                    {comissao.servico_nome || "Todos os serviços"} -{" "}
                    {comissao.tipo === "percentual"
                      ? `${comissao.valor}%`
                      : formatCurrency(comissao.valor)}{" "}
                    {comissao.tipo === "percentual"
                      ? "do valor"
                      : "por serviço"}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditarComissao(comissao)}
                    className="p-2 text-bella-600 hover:bg-bella-200 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteComissao(comissao.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comissões Calculadas por Funcionário */}
      {comissoesCalculadas.length > 0 && (
        <div className="bella-card">
          <h3 className="text-lg font-semibold text-bella-800 mb-4">
            {isStaff ? "Meus Rendimentos" : "Comissões por Funcionário"}
          </h3>
          <div className="space-y-4">
            {comissoesCalculadas.map((funcionario, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  isStaff && funcionario.funcionario_nome === user?.nome
                    ? "bg-bella-100 border-bella-300"
                    : "bg-bella-50 border-bella-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-bella-800">
                    {funcionario.funcionario_nome}
                    {isStaff && funcionario.funcionario_nome === user?.nome && (
                      <span className="ml-2 text-bella-600 text-sm">
                        (Você)
                      </span>
                    )}
                  </h4>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(funcionario.comissao)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm text-bella-600">
                  <div>
                    <span className="font-medium">Serviços:</span>{" "}
                    {funcionario.servicos}
                  </div>
                  <div>
                    <span className="font-medium">Faturamento:</span>{" "}
                    {formatCurrency(funcionario.faturamento)}
                  </div>
                  <div>
                    <span className="font-medium">% Comissão:</span>{" "}
                    {funcionario.faturamento > 0
                      ? (
                          (funcionario.comissao / funcionario.faturamento) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {comissoesCalculadas.length === 0 && (
        <div className="bella-card text-center py-8">
          <FiTrendingUp className="w-12 h-12 text-bella-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-bella-800 mb-2">
            Nenhuma comissão calculada
          </h3>
          <p className="text-bella-600">
            Não há {isStaff ? "suas " : ""}comissões no período selecionado ou
            não há configurações de comissão ativas.
          </p>
        </div>
      )}

      {/* Modal Nova/Editar Comissão */}
      {showNovaComissao && canEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-bella-800">
                {comissaoEditando ? "Editar Comissão" : "Nova Comissão"}
              </h2>
              <button
                onClick={() => {
                  setShowNovaComissao(false);
                  setComissaoEditando(null);
                  resetForm();
                }}
                className="p-2 text-bella-600 hover:bg-bella-100 rounded-lg"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  Funcionário *
                </label>
                <select
                  value={novaComissao.funcionario_id}
                  onChange={(e) =>
                    setNovaComissao((prev) => ({
                      ...prev,
                      funcionario_id: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                  required
                >
                  <option value="">Selecione um funcionário</option>
                  {funcionarios.map((funcionario) => (
                    <option key={funcionario.id} value={funcionario.id}>
                      {funcionario.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  Tipo de Comissão *
                </label>
                <select
                  value={novaComissao.tipo}
                  onChange={(e) =>
                    setNovaComissao((prev) => ({
                      ...prev,
                      tipo: e.target.value as "percentual" | "valor_fixo",
                    }))
                  }
                  className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                >
                  <option value="percentual">Percentual do Valor</option>
                  <option value="valor_fixo">Valor Fixo por Serviço</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  {novaComissao.tipo === "percentual"
                    ? "Percentual (%)"
                    : "Valor Fixo (R$)"}{" "}
                  *
                </label>
                <input
                  type="number"
                  step={novaComissao.tipo === "percentual" ? "0.1" : "0.01"}
                  min="0"
                  max={novaComissao.tipo === "percentual" ? "100" : undefined}
                  value={novaComissao.valor}
                  onChange={(e) =>
                    setNovaComissao((prev) => ({
                      ...prev,
                      valor: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                  placeholder={
                    novaComissao.tipo === "percentual" ? "20" : "10.00"
                  }
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowNovaComissao(false);
                    setComissaoEditando(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 border border-bella-300 text-bella-700 rounded-lg hover:bg-bella-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarComissao}
                  className="flex-1 bella-button"
                >
                  {comissaoEditando ? "Atualizar" : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
