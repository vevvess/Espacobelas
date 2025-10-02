import React, { useState, useEffect } from "react";
import {
  FiCalendar,
  FiPlus,
  FiClock,
  FiUser,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiX,
  FiSearch,
  FiFilter,
  FiDollarSign,
  FiCreditCard,
  FiUsers,
  FiLoader,
  FiEye,
  FiLock,
} from "react-icons/fi";
import { useAuth } from "../contexts/SimpleAuthContext";
import { useAgendamentosSimple } from "../hooks/useAgendamentosSimple";
import { useFuncionarios } from "@/hooks/useFuncionarios";
import { ModalAgendamento } from "@/components/ModalAgendamentoFixed";
import { ModalEditarConcluido } from "@/components/ModalEditarConcluido";
import { ModalVisualizarAgendamento } from "@/components/ModalVisualizarAgendamento";
import { ModalConcluirAgendamento } from "@/components/ModalConcluirAgendamento";
import { AgendamentoCard } from "@/components/AgendamentoCard";
import { AgendamentoCardWithProgress } from "@/components/AgendamentoCardWithProgress";
import {
  ViewSelector,
  getDateRange,
  ViewType,
} from "@/components/ViewSelector";
import { WeekView } from "@/components/WeekView";
import { MonthView } from "@/components/MonthView";
import { FuncionarioLegenda } from "@/components/FuncionarioLegenda";
import { AgendamentosRealTimeStatus } from "@/components/AgendamentosRealTimeStatus";
import { AgendamentosDebugMonitorSafe } from "@/components/AgendamentosDebugMonitorSafe";
import { AlwaysOnlineIndicator } from "@/components/AlwaysOnlineStatus";
import { StatusAutomaticoIndicator } from "@/components/StatusAutomaticoIndicator";
// removed HybridSystemBadge (hybrid mode disabled)

import { AgendamentoAguardandoPagamento } from "@/components/AgendamentoAguardandoPagamento";
import { FORMAS_PAGAMENTO } from "@/services/agendamentoService";
import { useRolePermissions } from "../components/RoleProtectedRoute";
import {
  formatDateTime,
  formatTime,
  formatCurrency,
  getAgendamentosHoje,
} from "@/lib/agendamentoUtils";

import { SimpleOfflineIndicator } from "@/components/SimpleOfflineIndicator";

// Importar testes do sistema híbrido (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  import("../test-hybrid-system.js");
  import("../final-migration-test.js");
  import("../test-prisma-hybrid-final.js");
}

export default function Agenda() {
  const { user } = useAuth();
  const { isStaff, canEdit, isAdmin, canViewAllValues, hasFullAccess } =
    useRolePermissions();

  const canViewValues = canViewAllValues; // Admins ou funcionários com acesso total podem ver valores

  // Estados de UI - inicializar primeiro
  const [showNovoAgendamento, setShowNovoAgendamento] = useState(false);
  const [showConcluirAgendamento, setShowConcluirAgendamento] = useState(false);
  const [showEditarConcluido, setShowEditarConcluido] = useState(false);
  const [agendamentoEditando, setAgendamentoEditando] = useState(null);
  const [agendamentoConcluindo, setAgendamentoConcluindo] = useState(null);
  const [agendamentoEditandoConcluido, setAgendamentoEditandoConcluido] =
    useState(null);
  const [agendamentoVisualizando, setAgendamentoVisualizando] = useState(null);
  const [currentView, setCurrentView] = useState<ViewType>("day");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calcular intervalo de datas baseado na visualização atual
  const dateRange = getDateRange(currentDate, currentView);

  const {
    agendamentos,
    loading,
    error,
    createAgendamento: addAgendamento,
    updateAgendamento: editAgendamento,
    deleteAgendamento: removeAgendamento,
    refresh: reload,
    isRealTime,
    isChangingDate,
    hasCachedData,
  } = useAgendamentosSimple(dateRange.start, dateRange.end);

  // Debug dos agendamentos carregados
  useEffect(() => {
    if (agendamentos.length > 0) {
      console.log("📊 Agendamentos na Agenda:", agendamentos.length);
      console.log("📋 Primeiro agendamento estrutura:", agendamentos[0]);
      console.log(
        "🔍 Servicos do primeiro agendamento:",
        agendamentos[0]?.servicos,
      );
    }
  }, [agendamentos]);

  // Funcionários reais do banco
  const { funcionarios } = useFuncionarios();
  const lastSyncTime = new Date();

  const [deletingAgendamento, setDeletingAgendamento] = useState<string | null>(
    null,
  );
  const [dataAtual, setDataAtual] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [mostrarConcluidos, setMostrarConcluidos] = useState(false);

  const handleSalvarAgendamento = async (data: any) => {
    try {
      if (agendamentoEditando) {
        await editAgendamento(agendamentoEditando.id, data);
        setAgendamentoEditando(null);
      } else {
        await addAgendamento(data);
      }
      setShowNovoAgendamento(false);
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
    }
  };

  const handleConfirmAndCompleteWithAnimation = async (data: any) => {
    try {
      if (agendamentoEditando) {
        await editAgendamento(agendamentoEditando.id, {
          ...data,
          status: "aguardando_confirmacao_pagamento",
        });
        setAgendamentoEditando(null);
      } else {
        await addAgendamento({
          ...data,
          status: "aguardando_confirmacao_pagamento",
        });
      }
    } catch (error) {
      console.error("Erro ao salvar agendamento com animação:", error);
      throw error;
    }
  };

  const handleConcluirAgendamento = async (data: any) => {
    try {
      // Atualizar agendamento para status "concluido" e adicionar pagamentos
      await editAgendamento(data.agendamento_id, {
        status: "concluido",
        pagamentos: data.pagamentos,
      });
      setAgendamentoConcluindo(null);
      setShowConcluirAgendamento(false);
    } catch (error) {
      console.error("Erro ao concluir agendamento:", error);
    }
  };

  const handleIniciarServico = async (agendamento: any) => {
    if (agendamento.status === "em_andamento") {
      alert("Este agendamento já está em andamento");
      return;
    }

    if (agendamento.status === "concluido") {
      alert("Este agendamento já foi concluído");
      return;
    }

    try {
      console.log(
        "🟡 Iniciando serviço:",
        agendamento.id,
        "Status atual:",
        agendamento.status,
      );
      console.log(
        "🟡 Dados do agendamento:",
        JSON.stringify(
          {
            id: agendamento.id,
            status: agendamento.status,
            user_simple_id: agendamento.user_simple_id,
            observacoes: agendamento.observacoes,
          },
          null,
          2,
        ),
      );

      await editAgendamento(agendamento.id, { status: "em_andamento" });
      console.log(
        "✅ Serviço iniciado com sucesso - aguardando atualização em tempo real",
      );

      // Forçar um reload manual após 2 segundos para verificar se persistiu
      setTimeout(() => {
        console.log("🔄 Verificando se mudança persistiu...");
        reload();
      }, 2000);
    } catch (error) {
      console.error("❌ Erro ao iniciar serviço:", error);
      alert(
        "Erro ao iniciar serviço: " + (error?.message || "Erro desconhecido"),
      );
    }
  };

  const handleIniciarConclusao = (agendamento: any) => {
    if (agendamento.status === "concluido") {
      alert("Este agendamento já foi concluído");
      return;
    }
    setAgendamentoConcluindo(agendamento);
    setShowConcluirAgendamento(true);
  };

  const handleEditarAgendamento = (agendamento: any) => {
    if (agendamento.status === "concluido") {
      alert(
        "Use o botão 'Editar Concluído' para editar agendamentos finalizados",
      );
      return;
    }
    setAgendamentoEditando(agendamento);
    setShowNovoAgendamento(true);
  };

  const handleEditarAgendamentoConcluido = (agendamento: any) => {
    setAgendamentoEditandoConcluido(agendamento);
    setShowEditarConcluido(true);
  };

  const handleConfirmarPagamento = (agendamento: any) => {
    // Abrir modal de conclusão com seleção de forma de pagamento
    setAgendamentoConcluindo(agendamento);
    setShowConcluirAgendamento(true);
  };

  const handleSalvarEdicaoConcluido = async (data: any) => {
    try {
      // TODO: Implementar editarAgendamentoConcluido no novo hook
      await editAgendamento(data.agendamento_id, {
        data_hora: data.data_hora,
        observacoes: data.observacoes,
        status: "concluido",
      });
      setAgendamentoEditandoConcluido(null);
      setShowEditarConcluido(false);
    } catch (error) {
      console.error("Erro ao editar agendamento concluído:", error);
    }
  };

  const handleDeleteAgendamento = async (id: string) => {
    const agendamento = agendamentos.find((a) => a.id === id);
    if (agendamento?.status === "concluido") {
      alert("Não é possível excluir agendamentos concluídos");
      return;
    }

    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      setDeletingAgendamento(id);

      try {
        console.log(`🗑️ Iniciando exclusão do agendamento ${id}`);
        await removeAgendamento(id);
        console.log(`✅ Agendamento ${id} excluído com sucesso`);
      } catch (error) {
        console.error(
          "❌ Erro detalhado ao excluir agendamento:",
          JSON.stringify(
            {
              agendamentoId: id,
              errorMessage:
                error?.message || error?.toString() || "Unknown error",
              errorType: error?.constructor?.name || typeof error,
              stack: error?.stack?.split("\n")[0] || "No stack available",
            },
            null,
            2,
          ),
        );

        // Mostrar alerta com mais detalhes para debug
        const errorMessage =
          error?.message || error?.toString() || "Erro desconhecido";
        alert(`Erro ao excluir agendamento: ${errorMessage}`);
      } finally {
        setDeletingAgendamento(null);
      }
    }
  };

  const agendamentosFiltrados = agendamentos.filter((agendamento) => {
    const dataAgendamento = new Date(agendamento.data_hora);

    // Usar DateRange do ViewSelector para filtrar baseado na view
    const { start, end } = getDateRange(currentDate, currentView);
    const dentroDoRange = dataAgendamento >= start && dataAgendamento <= end;

    // Filtro por status
    const statusMatch =
      filtroStatus === "todos" || agendamento.status === filtroStatus;

    // Filtro para mostrar/ocultar concluídos
    const conclusaoMatch = mostrarConcluidos
      ? true
      : agendamento.status !== "concluido";

    // Filtro para ocultar agendamentos aguardando confirmação para funcionários (apenas admins podem ver)
    const aguardandoConfirmacaoMatch =
      isAdmin ||
      (agendamento.status !== "aguardando_confirmacao" &&
        agendamento.status !== "aguardando_confirmacao_pagamento");

    return (
      dentroDoRange &&
      statusMatch &&
      conclusaoMatch &&
      aguardandoConfirmacaoMatch
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado":
        return "bg-blue-100 text-blue-800";
      case "confirmado":
        return "bg-green-100 text-green-800";
      case "em_andamento":
        return "bg-yellow-100 text-yellow-800";
      case "aguardando_pagamento":
        return "bg-orange-100 text-orange-800";
      case "concluido":
        return "bg-purple-100 text-purple-800";
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
      case "em_andamento":
        return "Em Andamento";
      case "aguardando_pagamento":
        return "Aguardando Pagamento";
      case "concluido":
        return "Concluído";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

  // Filtrar agendamentos aguardando confirmação (apenas para admins)
  const agendamentosAguardandoConfirmacao = isAdmin
    ? agendamentos.filter(
        (agendamento) =>
          agendamento.status === "aguardando_confirmacao" ||
          agendamento.status === "aguardando_confirmacao_pagamento",
      )
    : [];

  // Estatísticas básicas
  const estatisticas = {
    total: agendamentosFiltrados.length,
    concluidos: agendamentos.filter((a) => a.status === "concluido").length,
    pendentes: agendamentos.filter((a) => a.status !== "concluido").length,
    aguardandoConfirmacao: agendamentosAguardandoConfirmacao.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FiLoader className="w-8 h-8 text-bella-500 animate-spin" />
        <span className="ml-2 text-bella-600">Carregando agendamentos...</span>
      </div>
    );
  }

  if (error) {
    const isFailedToFetch = error.includes("Failed to fetch");
    const isConnectivityError =
      isFailedToFetch ||
      error.includes("CONNECTIVITY") ||
      error.includes("fetch");

    return (
      <div className="bella-card">
        <div className="text-center py-8">
          <div className="mb-4">
            {isFailedToFetch ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-medium mb-2">
                  🚨 Falha de Conectividade Crítica
                </p>
                <p className="text-red-700 text-sm mb-2">
                  "Failed to fetch" detectado - problema persistente de conexão
                  com o servidor.
                </p>
                <p className="text-red-600 text-xs">
                  Tentando reconectar automaticamente... Por favor, aguarde.
                </p>
              </div>
            ) : isConnectivityError ? (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <p className="text-orange-800 font-medium mb-2">
                  🔄 Problema de conectividade
                </p>
                <p className="text-orange-700 text-sm">
                  Verificando sua conexão... Os dados podem estar
                  temporariamente indisponíveis.
                </p>
              </div>
            ) : (
              <p className="text-red-600 mb-4">
                Erro ao carregar agendamentos: {error}
              </p>
            )}
          </div>

          <div className="space-x-4">
            <button onClick={reload} className="bella-button">
              Tentar novamente
            </button>

            {isConnectivityError && (
              <button
                onClick={() => window.location.reload()}
                className="bella-button-secondary"
              >
                Recarregar página
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-bella-800">Agenda</h1>
            <AlwaysOnlineIndicator />
          </div>
          <p className="text-bella-600">
            {isStaff && !hasFullAccess
              ? "Visualize seus agendamentos"
              : "Gerencie os agendamentos do salão"}
          </p>
          {isStaff && !hasFullAccess && (
            <div className="flex items-center space-x-2 mt-2">
              <FiLock className="w-4 h-4 text-bella-500" />
              <span className="text-sm text-bella-500">Modo visualização</span>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          {canEdit && (
            <button
              onClick={() => setShowNovoAgendamento(true)}
              className="bella-button flex items-center space-x-2"
            >
              <FiPlus className="w-4 h-4" />
              <span>Novo Agendamento</span>
            </button>
          )}

          {process.env.NODE_ENV === "development" && (
            <button
              onClick={() => {
                console.clear();
                console.log("🔍 DEBUG SISTEMA DE AGENDAMENTOS (SEMPRE ONLINE)");
                console.log("Total de agendamentos:", agendamentos.length);
                console.log("Loading:", loading);
                console.log("Error:", error);
                console.log("Agendamentos:", agendamentos);

                // Debug do sistema sempre online
                if (
                  typeof (window as any).alwaysOnlineService !== "undefined"
                ) {
                  console.log("⚡ SISTEMA SEMPRE ONLINE DISPONÍVEL");
                  const status = (
                    window as any
                  ).alwaysOnlineService.getStatus();
                  console.log("Status sempre online:", status);

                  // Teste de conectividade
                  (window as any).alwaysOnlineService
                    .testConnection()
                    .then(() =>
                      console.log("✅ Teste de conexão sempre online: SUCESSO"),
                    )
                    .catch((err: any) =>
                      console.log(
                        "❌ Teste de conexão sempre online: FALHOU",
                        err.message,
                      ),
                    );

                  // Check de todas as URLs
                  (window as any).alwaysOnlineService
                    .checkAllUrls()
                    .then(() =>
                      console.log("✅ Verificação de URLs: CONCLUÍDA"),
                    )
                    .catch((err: any) =>
                      console.log(
                        "❌ Verificação de URLs: FALHOU",
                        err.message,
                      ),
                    );
                } else {
                  console.log("❌ Sistema sempre online não disponível");
                }

                if (agendamentos.length > 0) {
                  console.log(
                    "Primeiro agendamento detalhado:",
                    JSON.stringify(agendamentos[0], null, 2),
                  );
                }

                console.log("📋 COMANDOS DISPONÍVEIS:");
                console.log("- window.alwaysOnlineService.getStatus()");
                console.log("- window.alwaysOnlineService.testConnection()");
                console.log("- window.alwaysOnlineService.checkAllUrls()");
                console.log("- window.alwaysOnlineService.resetStats()");

                console.log("🌐 Navigator online:", navigator.onLine);

                // Debug do cache
                console.log("\n💾 CACHE DE AGENDAMENTOS:");
                console.log("Usando dados do cache:", hasCachedData);
                console.log("Mudando data:", isChangingDate);

                // Debug do status automático
                console.log("\n🔄 SISTEMA DE STATUS AUTOMÁTICO:");
                console.log("Hora atual:", new Date().toLocaleTimeString());

                // Debug das observações
                console.log("\n📝 DEBUG DE OBSERVAÇÕES:");
                agendamentos.forEach((agendamento) => {
                  if (agendamento.observacoes_usuario) {
                    const temCodigo =
                      agendamento.observacoes_usuario.includes("[SERVICOS:") ||
                      agendamento.observacoes_usuario.includes("[FUNC:") ||
                      agendamento.observacoes_usuario.includes('{"');

                    console.log(`📋 ${agendamento.id}:`, {
                      observacoes:
                        agendamento.observacoes_usuario.substring(0, 100) +
                        "...",
                      temCodigo,
                      tamanho: agendamento.observacoes_usuario.length,
                    });

                    if (temCodigo) {
                      console.warn(`  ⚠️ CÓDIGO DETECTADO nas observações!`);
                    }
                  }
                });

                agendamentos.forEach((agendamento) => {
                  const dataHora = new Date(agendamento.data_hora);
                  const agora = new Date();
                  const diffMinutos =
                    (agora.getTime() - dataHora.getTime()) / (1000 * 60);

                  console.log(
                    `📅 ${agendamento.id}: ${dataHora.toLocaleTimeString()} (${Math.round(diffMinutos)}min atrás) - Status: ${agendamento.status}`,
                  );

                  if (
                    diffMinutos > 0 &&
                    diffMinutos < 120 &&
                    agendamento.status !== "em_andamento" &&
                    agendamento.status !== "concluido"
                  ) {
                    console.log(`   ⚠️ Deveria estar em andamento!`);
                  }
                });
              }}
              className="bella-button-secondary flex items-center space-x-2"
            >
              <FiEye className="w-4 h-4" />
              <span>Debug</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Automático */}
      <StatusAutomaticoIndicator
        agendamentos={agendamentos}
        error={error}
        loading={loading}
        isChangingDate={isChangingDate}
        hasCachedData={hasCachedData}
      />

      {/* Status de Tempo Real e Informações */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <AgendamentosRealTimeStatus
            isActive={!document.hidden}
            lastUpdateTime={lastSyncTime?.toISOString()}
            onForceRefresh={reload}
          />
          <SimpleOfflineIndicator />
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bella-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bella-600">
                Hoje ({new Date(dataAtual).toLocaleDateString("pt-BR")})
              </p>
              <p className="text-2xl font-bold text-bella-700">
                {estatisticas.total}
              </p>
            </div>
            <FiCalendar className="w-8 h-8 text-bella-500" />
          </div>
        </div>

        <div className="bella-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bella-600">Pendentes</p>
              <p className="text-2xl font-bold text-blue-600">
                {estatisticas.pendentes}
              </p>
            </div>
            <FiClock className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {isAdmin && (
          <div className="bella-card border-orange-200 bg-orange-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">
                  Aguardando Confirmação
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {estatisticas.aguardandoConfirmacao}
                </p>
              </div>
              <FiDollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        )}

        <div className="bella-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bella-600">Concluídos</p>
              <p className="text-2xl font-bold text-purple-600">
                {estatisticas.concluidos}
              </p>
            </div>
            <FiCheck className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* View Selector */}
      <ViewSelector
        currentView={currentView}
        onViewChange={setCurrentView}
        currentDate={currentDate}
        onDateChange={(date) => {
          setCurrentDate(date);
          setDataAtual(date.toISOString().split("T")[0]);
        }}
      />

      {/* Legenda de Funcionários */}
      <FuncionarioLegenda
        agendamentos={agendamentosFiltrados}
        className="lg:max-w-sm lg:mx-0 mx-auto"
      />

      {/* Filtros */}
      <div className="bella-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-bella-700 mb-2">
              Data
            </label>
            <input
              type="date"
              value={dataAtual}
              onChange={(e) => {
                setDataAtual(e.target.value);
                setCurrentDate(new Date(e.target.value + "T00:00:00"));
              }}
              className="w-full px-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-bella-700 mb-2">
              Status
            </label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full px-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
            >
              <option value="todos">Todos os status</option>
              <option value="agendado">Agendado</option>
              <option value="confirmado">Confirmado</option>
              <option value="em_andamento">Em Andamento</option>
              {isAdmin && (
                <option value="aguardando_confirmacao">
                  Aguardando Confirma��ão
                </option>
              )}
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="mostrarConcluidos"
                checked={mostrarConcluidos}
                onChange={(e) => setMostrarConcluidos(e.target.checked)}
                className="w-4 h-4 text-bella-600 border-bella-300 rounded focus:ring-bella-500"
              />
              <label
                htmlFor="mostrarConcluidos"
                className="text-sm font-medium text-bella-700"
              >
                Mostrar concluídos
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Agendamentos - Renderização Condicional */}
      {currentView === "week" && (
        <WeekView
          agendamentos={agendamentosFiltrados}
          currentDate={currentDate}
          onEditAgendamento={handleEditarAgendamento}
          onRemoveAgendamento={handleDeleteAgendamento}
          onVisualizarAgendamento={(agendamento) =>
            setAgendamentoVisualizando(agendamento)
          }
          formatTime={formatTime}
          formatCurrency={formatCurrency}
          canEdit={canEdit}
        />
      )}

      {currentView === "month" && (
        <MonthView
          agendamentos={agendamentos}
          currentDate={currentDate}
          onVisualizarAgendamento={(agendamento) =>
            setAgendamentoVisualizando(agendamento)
          }
          onDayClick={(date) => {
            setCurrentView("day");
            setCurrentDate(date);
            setDataAtual(date.toISOString().split("T")[0]);
          }}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Lista de Agendamentos (Day View) */}
      {currentView === "day" && (
        <div className="bella-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-bella-800">
              Agendamentos - {currentDate.toLocaleDateString("pt-BR")}
            </h2>
            <span className="bg-bella-100 text-bella-700 text-sm font-medium px-3 py-1 rounded-full">
              {agendamentosFiltrados.length} agendamentos
            </span>
          </div>

          <div className="space-y-6 w-full overflow-hidden">
            {/* Seção de Agendamentos Aguardando Confirmação de Pagamento */}
            <div
              className="bg-orange-50 border border-orange-200 rounded-lg p-4"
              data-section="aguardando-confirmacao"
              style={{
                display:
                  agendamentosFiltrados.some(
                    (a) => a.status === "aguardando_confirmacao",
                  ) ||
                  agendamentosFiltrados.some(
                    (a) => a.status === "aguardando_confirmacao_pagamento",
                  )
                    ? "block"
                    : "none",
              }}
            >
              <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                <FiCreditCard className="w-5 h-5 mr-2" />
                Aguardando Confirmação de Pagamento
                <span className="ml-2 px-2 py-1 bg-orange-200 text-orange-800 rounded-full text-sm">
                  {
                    agendamentosFiltrados.filter(
                      (a) =>
                        a.status === "aguardando_confirmacao" ||
                        a.status === "aguardando_confirmacao_pagamento",
                    ).length
                  }
                </span>
              </h3>
              <div
                className="space-y-2"
                data-appointments-container="aguardando-confirmacao"
              >
                {agendamentosFiltrados
                  .filter(
                    (agendamento) =>
                      agendamento.status === "aguardando_confirmacao" ||
                      agendamento.status === "aguardando_confirmacao_pagamento",
                  )
                  .sort(
                    (a, b) =>
                      new Date(a.data_hora).getTime() -
                      new Date(b.data_hora).getTime(),
                  )
                  .map((agendamento) => (
                    <div key={agendamento.id} className="w-full">
                      <AgendamentoAguardandoPagamento
                        agendamento={agendamento}
                        onConfirmarPagamento={handleConfirmarPagamento}
                        onEditarAgendamento={handleEditarAgendamento}
                        onExcluirAgendamento={handleDeleteAgendamento}
                        formatDateTime={formatDateTime}
                        formatCurrency={formatCurrency}
                        canEdit={canEdit}
                        canViewValues={canViewValues}
                      />
                    </div>
                  ))}
              </div>
            </div>

            {/* Seção invisível para animação quando não há agendamentos aguardando */}
            {!(
              agendamentosFiltrados.some(
                (a) => a.status === "aguardando_confirmacao",
              ) ||
              agendamentosFiltrados.some(
                (a) => a.status === "aguardando_confirmacao_pagamento",
              )
            ) && (
              <div
                className="opacity-0 pointer-events-none h-0"
                data-section="aguardando-confirmacao"
              >
                <div
                  className="space-y-2"
                  data-appointments-container="aguardando-confirmacao"
                ></div>
              </div>
            )}

            {/* Seção de Outros Agendamentos */}
            <div className="space-y-4">
              {agendamentosFiltrados
                .filter(
                  (agendamento) =>
                    agendamento.status !== "aguardando_confirmacao" &&
                    agendamento.status !== "aguardando_confirmacao_pagamento",
                )
                .map((agendamento) => (
                  <div key={agendamento.id} className="w-full">
                    {agendamento.status === "em_andamento" ? (
                      <AgendamentoCardWithProgress
                        agendamento={agendamento}
                        onEdit={handleEditarAgendamento}
                        onDelete={handleDeleteAgendamento}
                        onView={(agendamento) =>
                          setAgendamentoVisualizando(agendamento)
                        }
                        onConcluir={handleIniciarConclusao}
                        onIniciar={handleIniciarServico}
                        onEditConcluido={handleEditarAgendamentoConcluido}
                        formatDateTime={formatDateTime}
                        formatCurrency={formatCurrency}
                        canEdit={canEdit}
                        isStaff={isStaff}
                        canViewValues={canViewValues}
                      />
                    ) : (
                      <AgendamentoCard
                        agendamento={agendamento}
                        onEdit={handleEditarAgendamento}
                        onDelete={handleDeleteAgendamento}
                        onView={(agendamento) =>
                          setAgendamentoVisualizando(agendamento)
                        }
                        onConcluir={handleIniciarConclusao}
                        onIniciar={handleIniciarServico}
                        onEditConcluido={handleEditarAgendamentoConcluido}
                        formatDateTime={formatDateTime}
                        formatCurrency={formatCurrency}
                        canEdit={canEdit}
                        isStaff={isStaff}
                        canViewValues={canViewValues}
                        isDeleting={deletingAgendamento === agendamento.id}
                      />
                    )}
                  </div>
                ))}

              {agendamentosFiltrados.filter(
                (a) =>
                  a.status !== "aguardando_confirmacao" &&
                  a.status !== "aguardando_confirmacao_pagamento",
              ).length === 0 &&
                agendamentosFiltrados.filter(
                  (a) =>
                    a.status === "aguardando_confirmacao" ||
                    a.status === "aguardando_confirmacao_pagamento",
                ).length === 0 && (
                  <div className="text-center py-8">
                    <FiCalendar className="w-12 h-12 text-bella-300 mx-auto mb-4" />
                    <p className="text-bella-600">
                      {mostrarConcluidos
                        ? "Nenhum agendamento encontrado"
                        : "Nenhum agendamento pendente para esta data"}
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo/Editar Agendamento */}
      <ModalAgendamento
        isOpen={showNovoAgendamento}
        onClose={() => {
          setShowNovoAgendamento(false);
          setAgendamentoEditando(null);
        }}
        onSave={handleSalvarAgendamento}
        funcionarios={funcionarios}
        agendamentoEditando={agendamentoEditando}
      />

      {/* Modal Concluir Agendamento */}
      <ModalConcluirAgendamento
        isOpen={showConcluirAgendamento}
        onClose={() => {
          setShowConcluirAgendamento(false);
          setAgendamentoConcluindo(null);
        }}
        onConcluir={handleConcluirAgendamento}
        agendamento={agendamentoConcluindo}
      />

      {/* Modal Editar Concluído */}
      <ModalEditarConcluido
        isOpen={showEditarConcluido}
        onClose={() => {
          setShowEditarConcluido(false);
          setAgendamentoEditandoConcluido(null);
        }}
        onSave={handleSalvarEdicaoConcluido}
        agendamento={agendamentoEditandoConcluido}
        funcionarios={funcionarios}
      />

      {/* Modal Visualização */}
      <ModalVisualizarAgendamento
        isOpen={!!agendamentoVisualizando}
        onClose={() => setAgendamentoVisualizando(null)}
        agendamento={agendamentoVisualizando}
        formatDateTime={formatDateTime}
        formatCurrency={formatCurrency}
      />

      {/* Debug Monitor (versão segura) */}
      {process.env.NODE_ENV === "development" && (
        <>
          <AgendamentosDebugMonitorSafe
            agendamentos={agendamentos}
            lastSyncTime={lastSyncTime}
            loading={loading}
            error={error}
          />
        </>
      )}
    </div>
  );
}
