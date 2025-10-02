import React, { useState } from "react";
import { useAuth } from "../contexts/SimpleAuthContext";
import { useDashboard } from "../hooks/useDashboard";
import { useClientes } from "../hooks/useClientes";
import { useAgendamentos } from "../hooks/useAgendamentos";
import { useAgendamentosSimple } from "../hooks/useAgendamentosSimple";
import { useFuncionarios } from "@/hooks/useFuncionarios";
import { ModalAgendamentoCompleto } from "../components/ModalAgendamentoCompleto";
import { ModalNovoCliente } from "../components/ModalNovoCliente";
import { ModalRegistrarVenda } from "../components/ModalRegistrarVenda";
import { DatabaseConnectionDebug } from "../components/DatabaseConnectionDebug";

import DatabaseConnectionStatus from "../components/DatabaseConnectionStatus";
import {
  FiUsers,
  FiUser,
  FiDollarSign,
  FiCalendar,
  FiTrendingUp,
  FiGift,
  FiClock,
  FiStar,
  FiActivity,
  FiLoader,
  FiPhone,
  FiCheckCircle,
  FiAlertCircle,
  FiClock as FiTime,
} from "react-icons/fi";

interface KPI {
  id: string;
  title: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ComponentType<any>;
  color: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const {
    stats,
    loading: dashboardLoading,
    error: dashboardError,
    formatCurrency,
    reload,
  } = useDashboard();
  const { clientes, loading: clientesLoading, addCliente } = useClientes();
  const {
    agendamentos,
    getAgendamentosHoje,
    getProximosAgendamentos,
    formatDateTime,
    formatTime,
    loading: agendamentosLoading,
  } = useAgendamentos();
  const { createAgendamento, loading: agendamentosCompletoLoading } = useAgendamentosSimple();
  const { funcionarios } = useFuncionarios();

  // Estados dos modais
  const [showNovoAgendamento, setShowNovoAgendamento] = useState(false);
  const [showNovoCliente, setShowNovoCliente] = useState(false);
  const [showRegistrarVenda, setShowRegistrarVenda] = useState(false);

  const loading = dashboardLoading || clientesLoading || agendamentosLoading;

  // Calcula aniversariantes do dia
  const getAniversariantesHoje = () => {
    const hoje = new Date();
    return clientes.filter((cliente) => {
      if (!cliente.data_nascimento) return false;
      const nascimento = new Date(cliente.data_nascimento);
      return (
        nascimento.getDate() === hoje.getDate() &&
        nascimento.getMonth() === hoje.getMonth()
      );
    });
  };

  // Calcula aniversariantes do mês
  const getAniversariantesMes = () => {
    const hoje = new Date();
    return clientes.filter((cliente) => {
      if (!cliente.data_nascimento) return false;
      const nascimento = new Date(cliente.data_nascimento);
      return nascimento.getMonth() === hoje.getMonth();
    }).sort((a, b) => {
      const dataA = new Date(a.data_nascimento!);
      const dataB = new Date(b.data_nascimento!);
      return dataA.getDate() - dataB.getDate();
    });
  };

  // Calcula KPIs baseados nos dados reais
  const kpis: KPI[] = stats
    ? [
        {
          id: "1",
          title: "Agendamentos Hoje",
          value: stats.agendamentosHoje,
          change: `${getAgendamentosHoje().length} confirmados`,
          changeType: "neutral",
          icon: FiCalendar,
          color: "bella-500",
        },
        {
          id: "2",
          title: "Receita do Mês",
          value: formatCurrency(stats.receitaMes),
          change: "Até hoje",
          changeType: "positive",
          icon: FiDollarSign,
          color: "green-500",
        },
        {
          id: "3",
          title: "Total de Clientes",
          value: stats.totalClientes,
          change: `${
            clientes.filter(
              (c) =>
                new Date(c.created_at).getMonth() === new Date().getMonth(),
            ).length
          } novos este mês`,
          changeType: "positive",
          icon: FiUsers,
          color: "blue-500",
        },
        {
          id: "4",
          title: "Aniversariantes",
          value: getAniversariantesHoje().length,
          change: `${getAniversariantesMes().length} este mês`,
          changeType: "neutral",
          icon: FiGift,
          color: "purple-500",
        },
      ]
    : [];

  const agendamentosHoje = getAgendamentosHoje();
  const proximosAgendamentos = getProximosAgendamentos(5);
  const aniversariantesHoje = getAniversariantesHoje();
  const aniversariantesMes = getAniversariantesMes();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado":
        return "bg-blue-100 text-blue-800";
      case "confirmado":
        return "bg-green-100 text-green-800";
      case "concluido":
        return "bg-bella-100 text-bella-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "agendado":
        return "Agendado";
      case "confirmado":
        return "Confirmado";
      case "concluido":
        return "Concluído";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "agendado":
        return FiTime;
      case "confirmado":
        return FiCheckCircle;
      case "concluido":
        return FiStar;
      case "cancelado":
        return FiAlertCircle;
      default:
        return FiClock;
    }
  };

  // Handlers para os modais
  const handleNovoAgendamento = async (data: any) => {
    try {
      await createAgendamento(data);
      await reload();
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      throw error;
    }
  };

  const handleNovoCliente = async (clienteData: any) => {
    try {
      await addCliente(clienteData);
      await reload();
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      throw error;
    }
  };

  const handleRegistrarVenda = async (vendaData: any) => {
    try {
      // Simular registro de venda (você pode integrar com um servi��o real)
      console.log("Registrando venda:", vendaData);

      // Por enquanto, apenas simular uma transação bem-sucedida
      // Em uma implementação real, você faria uma chamada para a API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Venda registrada com sucesso!");
      await reload();
    } catch (error) {
      console.error("Erro ao registrar venda:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <FiLoader className="w-8 h-8 text-bella-500 animate-spin" />
          <p className="text-bella-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar dashboard</p>
          <DatabaseConnectionDebug />
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-spacing animate-fade-in">
      {/* Database Connection Status */}
      <DatabaseConnectionStatus />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
        <div className="animate-slide-up">
          <h1 className="text-3xl sm:text-4xl font-bold text-bella-800 mb-2">
            Bem-vindo, {user?.nome}! 👋
          </h1>
          <p className="text-lg text-bella-600">
            Aqui está um resumo das suas atividades de hoje
          </p>
        </div>
        <div className="animate-slide-up">
          <div className="bg-white rounded-xl p-4 shadow-lg border border-bella-100 hover-lift">
            <p className="text-sm font-medium text-bella-800">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <div className="flex items-center mt-2">
              <div className="status-online mr-2"></div>
              <span className="text-xs text-bella-600">Sistema online</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="mobile-grid mb-8">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              className="bella-card hover-lift hover-glow tap-scale relative overflow-hidden group"
              style={{
                animationDelay: `${index * 150}ms`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-bella-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex-1">
                  <p className="text-sm font-medium text-bella-600 mb-2">
                    {kpi.title}
                  </p>
                  <p className="text-3xl font-bold text-bella-800 mb-2">
                    {kpi.value}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p
                      className={`text-sm font-medium ${
                        kpi.changeType === "positive"
                          ? "text-green-600"
                          : kpi.changeType === "negative"
                            ? "text-red-600"
                            : "text-gray-600"
                      }`}
                    >
                      {kpi.change}
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl ${kpi.color} transform transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Today's Appointments */}
        <div className="lg:col-span-2 animate-slide-up">
          <div className="bella-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-bella-800 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-bella-500 to-bella-400 rounded-xl flex items-center justify-center">
                  <FiCalendar className="w-5 h-5 text-white" />
                </div>
                <span>Agendamentos de Hoje</span>
              </h2>
              <div className="flex items-center space-x-3">
                <span className="bg-gradient-to-r from-bella-500 to-bella-400 text-white text-sm font-medium px-4 py-2 rounded-full animate-pulse-soft">
                  {agendamentosHoje.length} agendamentos
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {agendamentosHoje.length > 0 ? (
                agendamentosHoje.map((agendamento, index) => {
                  const StatusIcon = getStatusIcon(agendamento.status);
                  return (
                    <div
                      key={agendamento.id}
                      className="flex items-center justify-between p-5 bg-gradient-to-r from-bella-50 to-white rounded-xl hover:shadow-lg transition-all duration-300 hover-lift border border-bella-100 group"
                      style={{
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-bella-400 to-bella-300 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {agendamento.cliente?.nome
                              ?.charAt(0)
                              .toUpperCase() || "?"}
                          </span>
                        </div>

                        <div className="flex-1">
                          <h3 className="font-medium text-bella-800">
                            {agendamento.cliente?.nome ||
                              "Cliente não informado"}
                          </h3>
                          <p className="text-sm text-bella-600">
                            {agendamento.servico?.nome ||
                              "Serviço não informado"}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-bella-500 flex items-center space-x-1">
                              <FiClock className="w-3 h-3" />
                              <span>{formatTime(agendamento.data_hora)}</span>
                            </span>
                            {agendamento.valor && (
                              <span className="text-xs text-green-600 font-medium">
                                {formatCurrency(agendamento.valor)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(agendamento.status)}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          <span>{getStatusText(agendamento.status)}</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <FiCalendar className="w-12 h-12 text-bella-300 mx-auto mb-4" />
                  <p className="text-bella-600">Nenhum agendamento para hoje</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 animate-slide-up">
          {/* Pr��ximos Agendamentos */}
          <div className="bella-card hover-glow">
            <h3 className="text-lg font-bold text-bella-800 mb-6 flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg flex items-center justify-center">
                <FiClock className="w-4 h-4 text-white" />
              </div>
              <span>Próximos</span>
            </h3>

            <div className="space-y-3">
              {proximosAgendamentos.length > 0 ? (
                proximosAgendamentos.slice(0, 4).map((agendamento, index) => (
                  <div
                    key={agendamento.id}
                    className="p-4 bg-gradient-to-r from-bella-50 to-white rounded-xl hover:shadow-md transition-all duration-300 hover-lift border border-bella-100 group"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-bella-400 to-bella-300 rounded-full flex items-center justify-center">
                        <FiUser className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-bella-800 text-sm truncate">
                          {agendamento.cliente?.nome || "Cliente não informado"}
                        </p>
                        <p className="text-xs text-bella-600 truncate">
                          {agendamento.servico?.nome || "Serviço não informado"}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <FiTime className="w-3 h-3 text-bella-500" />
                          <p className="text-xs text-bella-500 font-medium">
                            {formatDateTime(agendamento.data_hora)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-bella-600 text-center py-4">
                  Nenhum agendamento próximo
                </p>
              )}
            </div>
          </div>

          {/* Aniversariantes */}
          <div className="bella-card hover-glow">
            <h3 className="text-xl font-bold text-yellow-800 mb-6 flex items-center space-x-3 bg-gradient-to-r from-yellow-200 to-pink-200 p-4 rounded-xl border-2 border-yellow-400">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-pink-500 rounded-xl flex items-center justify-center animate-pulse">
                <FiGift className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl">🎂 ANIVERSARIANTES 🎂</span>
              <span className="text-3xl animate-bounce">🎉</span>
            </h3>

            {/* Aniversariantes de Hoje */}
            {aniversariantesHoje.length > 0 && (
              <div className="mb-8 bg-gradient-to-r from-yellow-100 via-yellow-50 to-pink-100 p-4 rounded-2xl border-4 border-yellow-400 shadow-2xl">
                <h4 className="text-lg font-bold text-yellow-900 mb-4 flex items-center justify-center space-x-3 bg-gradient-to-r from-yellow-200 to-pink-200 p-4 rounded-xl border-2 border-yellow-500 shadow-lg">
                  <span className="text-2xl animate-bounce">🎂</span>
                  <span className="text-xl font-black">🎉 ANIVERSARIANTES HOJE ({aniversariantesHoje.length}) 🎉</span>
                  <span className="text-2xl animate-bounce">🎉</span>
                </h4>
                <div className="space-y-2">
                  {aniversariantesHoje.map((cliente, index) => (
                    <div
                      key={cliente.id}
                      className="relative p-3 bg-gradient-to-r from-yellow-50 via-yellow-25 to-pink-50 border-l-4 border-yellow-400 rounded-xl hover:shadow-lg transition-all duration-300 hover-lift group overflow-hidden"
                      style={{
                        animationDelay: `${index * 150}ms`,
                      }}
                    >
                      <div className="absolute top-0 right-0 text-4xl opacity-10 transform rotate-12">
                        🎂
                      </div>

                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full flex items-center justify-center animate-pulse-soft">
                            <span className="text-white font-bold text-sm">
                              {cliente.nome.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-yellow-800 text-sm">
                              {cliente.nome}
                            </p>
                            <p className="text-xs text-yellow-600 font-medium flex items-center space-x-1">
                              <span>🎈</span>
                              <span>
                                {cliente.data_nascimento ?
                                  new Date(cliente.data_nascimento).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})
                                  : 'Hoje!'
                                }
                              </span>
                            </p>
                          </div>
                        </div>
                        {cliente.telefone && (
                          <a
                            href={`tel:${cliente.telefone}`}
                            className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-all duration-200 hover-lift tap-scale touch-button"
                            title="Ligar para parabenizar"
                          >
                            <FiPhone className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aniversariantes do Mês */}
            <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-300">
              <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center space-x-2 bg-blue-100 p-3 rounded-lg border border-blue-400">
                <span className="text-xl">📅</span>
                <span className="font-bold">📅 TODOS DESTE MÊS ({aniversariantesMes.length})</span>
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {aniversariantesMes.length > 0 ? (
                  aniversariantesMes.map((cliente, index) => {
                    const isToday = aniversariantesHoje.some(h => h.id === cliente.id);
                    const dataAniversario = new Date(cliente.data_nascimento!);
                    const dia = dataAniversario.getDate();
                    const hoje = new Date().getDate();
                    const isPast = dia < hoje;
                    const isFuture = dia > hoje;

                    return (
                      <div
                        key={cliente.id}
                        className={`p-4 rounded-xl transition-all duration-300 hover-lift ${
                          isToday
                            ? 'bg-gradient-to-r from-yellow-200 via-yellow-100 to-pink-200 border-4 border-yellow-500 shadow-2xl ring-4 ring-yellow-300 ring-opacity-75 transform scale-105'
                            : isPast
                            ? 'bg-gray-50 border border-gray-200'
                            : 'bg-blue-50 border border-blue-200'
                        }`}
                        style={{
                          animationDelay: `${index * 100}ms`,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              isToday
                                ? 'bg-gradient-to-r from-yellow-400 to-pink-400 text-white animate-pulse shadow-lg'
                                : isPast
                                ? 'bg-gray-300 text-gray-600'
                                : 'bg-blue-300 text-blue-800'
                            }`}>
                              {cliente.nome.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className={`font-medium text-sm ${
                                isToday ? 'text-yellow-800' : isPast ? 'text-gray-600' : 'text-blue-800'
                              }`}>
                                {cliente.nome}
                              </p>
                              <p className={`text-sm flex items-center space-x-1 ${
                                isToday ? 'text-yellow-800 font-black' : isPast ? 'text-gray-500' : 'text-blue-600'
                              }`}>
                                <span className="text-lg">{isToday ? '🎂' : isPast ? '✅' : '📅'}</span>
                                <span className={isToday ? 'text-lg font-black animate-pulse' : ''}>
                                  {dataAniversario.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
                                  {isToday ? ' - 🎉🎂 HOJE! 🎂🎉' : isPast ? ' - já foi' : ''}
                                </span>
                              </p>
                            </div>
                          </div>
                          {cliente.telefone && !isPast && (
                            <a
                              href={`tel:${cliente.telefone}`}
                              className={`p-2 rounded-lg transition-all duration-200 hover-lift tap-scale touch-button ${
                                isToday
                                  ? 'text-yellow-600 hover:bg-yellow-100'
                                  : 'text-blue-600 hover:bg-blue-100'
                              }`}
                              title={isToday ? "Ligar para parabenizar" : "Ligar para o cliente"}
                            >
                              <FiPhone className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-bella-600 text-center py-4">
                    Nenhum aniversariante este mês
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bella-card hover-glow">
            <h3 className="text-lg font-bold text-bella-800 mb-6 flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-400 rounded-lg flex items-center justify-center">
                <FiActivity className="w-4 h-4 text-white" />
              </div>
              <span>Ações Rápidas</span>
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowNovoAgendamento(true)}
                className="w-full bella-button flex items-center justify-center space-x-3 text-sm hover-glow tap-scale"
              >
                <FiCalendar className="w-4 h-4" />
                <span>Novo Agendamento</span>
              </button>
              <button
                onClick={() => setShowNovoCliente(true)}
                className="w-full px-4 py-3 border-2 border-bella-300 text-bella-700 rounded-xl hover:bg-bella-50 hover:border-bella-400 transition-all duration-200 flex items-center justify-center space-x-3 text-sm font-medium hover-lift tap-scale"
              >
                <FiUsers className="w-4 h-4" />
                <span>Novo Cliente</span>
              </button>
              <button
                onClick={() => setShowRegistrarVenda(true)}
                className="w-full px-4 py-3 border-2 border-green-300 text-green-700 rounded-xl hover:bg-green-50 hover:border-green-400 transition-all duration-200 flex items-center justify-center space-x-3 text-sm font-medium hover-lift tap-scale"
              >
                <FiDollarSign className="w-4 h-4" />
                <span>Registrar Venda</span>
              </button>
            </div>
          </div>
        </div>
      </div>



      {/* Modais */}
      <ModalAgendamentoCompleto
        isOpen={showNovoAgendamento}
        onClose={() => setShowNovoAgendamento(false)}
        onSave={handleNovoAgendamento}
        funcionarios={funcionarios}
      />

      <ModalNovoCliente
        isOpen={showNovoCliente}
        onClose={() => setShowNovoCliente(false)}
        onSave={handleNovoCliente}
      />

      <ModalRegistrarVenda
        isOpen={showRegistrarVenda}
        onClose={() => setShowRegistrarVenda(false)}
        onSave={handleRegistrarVenda}
        clientes={clientes}
      />
    </div>
  );
}
