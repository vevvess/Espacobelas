import React, { useState, useEffect } from "react";
import {
  FiBarChart,
  FiCalendar,
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiDownload,
  FiEye,
  FiLock,
} from "react-icons/fi";
import { useAuth } from "../contexts/SimpleAuthContext";
import { useAgendamentosRealTimeOptimized } from "../hooks/useAgendamentosRealTimeOptimized";
import { useRolePermissions } from "../components/RoleProtectedRoute";

export default function Relatorios() {
  const { user } = useAuth();
  const { isStaff, canEdit } = useRolePermissions();
  const { agendamentos, loading, formatCurrency, formatDateTime } =
    useAgendamentosRealTimeOptimized();

  // Funções temporárias até serem implementadas no hook
  const getTotalReceita = (agendamentos: any[]) => {
    return agendamentos
      .filter((a) => a.status === "concluido")
      .reduce((sum, a) => sum + (a.valor_total || 0), 0);
  };

  const getDistribuicaoFuncionarios = () => {
    return []; // Implementar depois
  };

  const [periodo, setPeriodo] = useState("mes-atual");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // Configurar período inicial
  useEffect(() => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    setDataInicio(inicioMes.toISOString().split("T")[0]);
    setDataFim(fimMes.toISOString().split("T")[0]);
  }, []);

  // Filtrar agendamentos pelo período
  const getAgendamentosPorPeriodo = () => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);

    return agendamentos.filter((agendamento) => {
      const dataAgendamento = new Date(agendamento.data_hora);
      return dataAgendamento >= inicio && dataAgendamento <= fim;
    });
  };

  const agendamentosPeriodo = getAgendamentosPorPeriodo();
  const distribuicaoFuncionarios = getDistribuicaoFuncionarios();

  // Estatísticas gerais
  const estatisticas = {
    totalAgendamentos: agendamentosPeriodo.length,
    agendamentosConfirmados: agendamentosPeriodo.filter(
      (a) => a.status === "confirmado",
    ).length,
    agendamentosConcluidos: agendamentosPeriodo.filter(
      (a) => a.status === "concluido",
    ).length,
    receitaTotal: getTotalReceita(agendamentosPeriodo),
    ticketMedio:
      agendamentosPeriodo.filter((a) => a.status === "concluido").length > 0
        ? getTotalReceita(agendamentosPeriodo) /
          agendamentosPeriodo.filter((a) => a.status === "concluido").length
        : 0,
  };

  // Relatório específico do funcionário (se for staff)
  const meuRelatorio = isStaff
    ? {
        agendamentos: agendamentosPeriodo.filter((a) =>
          a.servicos?.some((s) => s.funcionario_id === user.id),
        ).length,
        receita: agendamentosPeriodo
          .filter((a) => a.status === "concluido")
          .reduce((total, agendamento) => {
            const meuValor = agendamento.servicos
              ?.filter((s) => s.funcionario_id === user.id)
              ?.reduce((sum, s) => sum + s.preco, 0);
            return total + (meuValor || 0);
          }, 0),
        servicos: agendamentosPeriodo
          .flatMap((a) => a.servicos || [])
          .filter((s) => s.funcionario_id === user.id).length,
      }
    : null;

  const handleChangePeriodo = (novoPeriodo: string) => {
    setPeriodo(novoPeriodo);
    const hoje = new Date();

    switch (novoPeriodo) {
      case "hoje":
        setDataInicio(hoje.toISOString().split("T")[0]);
        setDataFim(hoje.toISOString().split("T")[0]);
        break;
      case "semana-atual":
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        setDataInicio(inicioSemana.toISOString().split("T")[0]);
        setDataFim(fimSemana.toISOString().split("T")[0]);
        break;
      case "mes-atual":
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        setDataInicio(inicioMes.toISOString().split("T")[0]);
        setDataFim(fimMes.toISOString().split("T")[0]);
        break;
      case "mes-passado":
        const inicioMesPassado = new Date(
          hoje.getFullYear(),
          hoje.getMonth() - 1,
          1,
        );
        const fimMesPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
        setDataInicio(inicioMesPassado.toISOString().split("T")[0]);
        setDataFim(fimMesPassado.toISOString().split("T")[0]);
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-bella-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-bella-600">Carregando relatórios...</p>
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
            <span>Relatórios</span>
            {isStaff && (
              <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1">
                <FiEye className="w-3 h-3" />
                <span>Meus Dados</span>
              </span>
            )}
          </h1>
          <p className="text-bella-600">
            {isStaff
              ? "Visualize seu desempenho e estatísticas"
              : "Análise completa do desempenho do salão"}
          </p>
        </div>
        {!isStaff && (
          <button className="flex items-center space-x-2 px-4 py-2 border border-bella-300 text-bella-700 rounded-lg hover:bg-bella-50 transition-colors">
            <FiDownload className="w-4 h-4" />
            <span>Exportar PDF</span>
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
                Relatório Personalizado
              </h3>
              <p className="text-sm text-amber-700">
                Você está visualizando apenas dados relacionados aos seus
                serviços e agendamentos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros de Período */}
      <div className="bella-card">
        <h3 className="text-lg font-semibold text-bella-800 mb-4">
          Período de Análise
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-bella-700 mb-2">
              Período Rápido
            </label>
            <select
              value={periodo}
              onChange={(e) => handleChangePeriodo(e.target.value)}
              className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
            >
              <option value="hoje">Hoje</option>
              <option value="semana-atual">Semana Atual</option>
              <option value="mes-atual">Mês Atual</option>
              <option value="mes-passado">Mês Passado</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>

          <div className="md:col-span-2">
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

          <div className="md:col-span-2">
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

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bella-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bella-600">
                {isStaff ? "Meus Agendamentos" : "Total Agendamentos"}
              </p>
              <p className="text-2xl font-bold text-bella-700">
                {isStaff
                  ? meuRelatorio?.agendamentos
                  : estatisticas.totalAgendamentos}
              </p>
            </div>
            <FiCalendar className="w-8 h-8 text-bella-500" />
          </div>
        </div>

        <div className="bella-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bella-600">
                {isStaff ? "Meus Serviços" : "Concluídos"}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {isStaff
                  ? meuRelatorio?.servicos
                  : estatisticas.agendamentosConcluidos}
              </p>
            </div>
            <FiUsers className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bella-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bella-600">
                {isStaff ? "Minha Receita" : "Receita Total"}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  isStaff
                    ? meuRelatorio?.receita || 0
                    : estatisticas.receitaTotal,
                )}
              </p>
            </div>
            <FiDollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {!isStaff && (
          <div className="bella-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-bella-600">
                  Ticket Médio
                </p>
                <p className="text-2xl font-bold text-bella-600">
                  {formatCurrency(estatisticas.ticketMedio)}
                </p>
              </div>
              <FiTrendingUp className="w-8 h-8 text-bella-500" />
            </div>
          </div>
        )}
      </div>

      {/* Desempenho por Funcionário */}
      {distribuicaoFuncionarios.length > 0 && (
        <div className="bella-card">
          <h3 className="text-lg font-semibold text-bella-800 mb-4">
            {isStaff
              ? "Meu Desempenho Detalhado"
              : "Desempenho por Funcionário"}
          </h3>
          <div className="space-y-4">
            {distribuicaoFuncionarios.map((funcionario, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  isStaff && funcionario.nome === user.nome
                    ? "bg-bella-100 border-bella-300"
                    : "bg-bella-50 border-bella-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-bella-800">
                    {funcionario.nome}
                    {isStaff && funcionario.nome === user.nome && (
                      <span className="ml-2 text-bella-600 text-sm">
                        (Você)
                      </span>
                    )}
                  </h4>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(funcionario.total)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-bella-600">
                  <div>
                    <span className="font-medium">Serviços realizados:</span>{" "}
                    {funcionario.servicos}
                  </div>
                  <div>
                    <span className="font-medium">Média por serviço:</span>{" "}
                    {formatCurrency(
                      funcionario.servicos > 0
                        ? funcionario.total / funcionario.servicos
                        : 0,
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Agendamentos do Período */}
      {agendamentosPeriodo.length > 0 && (
        <div className="bella-card">
          <h3 className="text-lg font-semibold text-bella-800 mb-4">
            {isStaff ? "Meus Agendamentos" : "Agendamentos do Período"}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-bella-700 uppercase bg-bella-50">
                <tr>
                  <th className="px-6 py-3">Data/Hora</th>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Serviços</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Valor</th>
                </tr>
              </thead>
              <tbody>
                {agendamentosPeriodo.slice(0, 10).map((agendamento) => (
                  <tr
                    key={agendamento.id}
                    className="bg-white border-b hover:bg-bella-50"
                  >
                    <td className="px-6 py-4">
                      {formatDateTime(agendamento.data_hora)}
                    </td>
                    <td className="px-6 py-4 font-medium text-bella-900">
                      {agendamento.cliente?.nome}
                    </td>
                    <td className="px-6 py-4">
                      {agendamento.servicos
                        ?.filter(
                          (s) => !isStaff || s.funcionario_id === user.id,
                        )
                        ?.map((s) => s.servico?.nome)
                        ?.join(", ")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          agendamento.status === "concluido"
                            ? "bg-green-100 text-green-800"
                            : agendamento.status === "confirmado"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {agendamento.status === "concluido"
                          ? "Concluído"
                          : agendamento.status === "confirmado"
                            ? "Confirmado"
                            : "Agendado"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-green-600">
                      {isStaff
                        ? formatCurrency(
                            agendamento.servicos
                              ?.filter((s) => s.funcionario_id === user.id)
                              ?.reduce((sum, s) => sum + s.preco, 0) || 0,
                          )
                        : formatCurrency(agendamento.valor_total || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {agendamentosPeriodo.length > 10 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-bella-600">
                Mostrando 10 de {agendamentosPeriodo.length} agendamentos
              </p>
            </div>
          )}
        </div>
      )}

      {agendamentosPeriodo.length === 0 && (
        <div className="bella-card text-center py-8">
          <FiBarChart className="w-12 h-12 text-bella-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-bella-800 mb-2">
            Nenhum dado encontrado
          </h3>
          <p className="text-bella-600">
            Não há {isStaff ? "seus " : ""}agendamentos no período selecionado.
          </p>
        </div>
      )}
    </div>
  );
}
