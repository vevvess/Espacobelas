import React, { useState, useEffect } from "react";
import {
  FiCalendar,
  FiDollarSign,
  FiUsers,
  FiPlus,
  FiEye,
  FiCreditCard,
  FiTrendingUp,
  FiLoader,
  FiCheck,
  FiX,
  FiFilter,
} from "react-icons/fi";
import { useAuth } from "../contexts/SimpleAuthContext";
import {
  getResumoClientesMensais,
  getDetalhesClienteMensal,
  registrarPagamentoMensal,
  atualizarTipoCliente,
} from "../services/clientesMensaisService";
import { useClientes } from "../hooks/useClientes";
import { toast } from "../hooks/use-toast";

interface ResumoClienteMensal {
  cliente: any;
  total_debito: number;
  total_pago: number;
  saldo_devedor: number;
  qtd_servicos: number;
}

export default function ClientesMensais() {
  const { user } = useAuth();
  const { clientes } = useClientes();
  const [resumosClientes, setResumosClientes] = useState<ResumoClienteMensal[]>(
    [],
  );
  const [clienteDetalhado, setClienteDetalhado] = useState<any>(null);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [showPagamento, setShowPagamento] = useState(false);
  const [showNovoMensal, setShowNovoMensal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mesReferencia, setMesReferencia] = useState(
    new Date().toISOString().slice(0, 7), // YYYY-MM
  );

  // Estados para pagamento
  const [valorPagamento, setValorPagamento] = useState("");
  const [observacoesPagamento, setObservacoesPagamento] = useState("");
  const [processandoPagamento, setProcessandoPagamento] = useState(false);

  // Estados para novo cliente mensal
  const [clienteSelecionado, setClienteSelecionado] = useState("");

  const loadResumos = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const dados = await getResumoClientesMensais(user.id, mesReferencia);
      setResumosClientes(dados);
    } catch (error) {
      console.error("Erro ao carregar resumos:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos clientes mensais",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDetalhes = async (clienteId: string) => {
    if (!user?.id) return;

    try {
      const detalhes = await getDetalhesClienteMensal(
        clienteId,
        user.id,
        mesReferencia,
      );
      setClienteDetalhado(detalhes);
      setShowDetalhes(true);
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar detalhes do cliente",
        variant: "destructive",
      });
    }
  };

  const handlePagamento = async () => {
    if (!clienteDetalhado || !valorPagamento) return;

    try {
      setProcessandoPagamento(true);
      await registrarPagamentoMensal(
        clienteDetalhado.cliente.id,
        mesReferencia,
        parseFloat(valorPagamento),
        observacoesPagamento,
      );

      toast({
        title: "Pagamento registrado",
        description: `Pagamento de ${formatCurrency(parseFloat(valorPagamento))} registrado com sucesso`,
      });

      // Recarregar dados
      await loadResumos();
      await loadDetalhes(clienteDetalhado.cliente.id);

      // Limpar form
      setValorPagamento("");
      setObservacoesPagamento("");
      setShowPagamento(false);
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      toast({
        title: "Erro",
        description: "Erro ao registrar pagamento",
        variant: "destructive",
      });
    } finally {
      setProcessandoPagamento(false);
    }
  };

  const handleNovoClienteMensal = async () => {
    if (!clienteSelecionado || !user?.id) return;

    try {
      await atualizarTipoCliente(clienteSelecionado, user.id, "mensal");

      toast({
        title: "Cliente mensal",
        description: "Cliente configurado como mensal com sucesso",
      });

      setClienteSelecionado("");
      setShowNovoMensal(false);
      await loadResumos();
    } catch (error) {
      console.error("Erro ao configurar cliente:", error);
      toast({
        title: "Erro",
        description: "Erro ao configurar cliente como mensal",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const clientesNormaisDisponiveis = clientes.filter(
    (c) => !resumosClientes.some((r) => r.cliente.id === c.id),
  );

  useEffect(() => {
    if (user?.id) {
      loadResumos();
    }
  }, [user?.id, mesReferencia]);

  // Calcular totais gerais
  const totaisGerais = resumosClientes.reduce(
    (acc, resumo) => ({
      total_debito: acc.total_debito + resumo.total_debito,
      total_pago: acc.total_pago + resumo.total_pago,
      saldo_devedor: acc.saldo_devedor + resumo.saldo_devedor,
      qtd_clientes: acc.qtd_clientes + 1,
    }),
    { total_debito: 0, total_pago: 0, saldo_devedor: 0, qtd_clientes: 0 },
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FiLoader className="w-8 h-8 text-bella-500 animate-spin" />
        <span className="ml-2 text-bella-600">
          Carregando clientes mensais...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bella-800">
            Clientes Mensais
          </h1>
          <p className="text-bella-600">
            Gerencie débitos e pagamentos dos clientes mensais
          </p>
        </div>
        <button
          onClick={() => setShowNovoMensal(true)}
          className="bella-button flex items-center space-x-2"
        >
          <FiPlus className="w-4 h-4" />
          <span>Novo Cliente Mensal</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bella-card">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-bella-700 mb-2">
              Mês de Referência
            </label>
            <input
              type="month"
              value={mesReferencia}
              onChange={(e) => setMesReferencia(e.target.value)}
              className="px-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
            />
          </div>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bella-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bella-600">Clientes</p>
              <p className="text-2xl font-bold text-bella-700">
                {totaisGerais.qtd_clientes}
              </p>
            </div>
            <FiUsers className="w-8 h-8 text-bella-500" />
          </div>
        </div>

        <div className="bella-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bella-600">Total Débito</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totaisGerais.total_debito)}
              </p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bella-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bella-600">Total Pago</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totaisGerais.total_pago)}
              </p>
            </div>
            <FiCheck className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bella-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bella-600">
                Saldo Devedor
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(totaisGerais.saldo_devedor)}
              </p>
            </div>
            <FiDollarSign className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="bella-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-bella-800">
            Clientes Mensais
          </h2>
          <span className="bg-bella-100 text-bella-700 text-sm font-medium px-3 py-1 rounded-full">
            {resumosClientes.length} clientes
          </span>
        </div>

        <div className="space-y-4">
          {resumosClientes.map((resumo) => (
            <div
              key={resumo.cliente.id}
              className="p-4 rounded-lg border border-bella-200 hover:bg-bella-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-bella-400 to-bella-300 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {resumo.cliente.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-bella-800 text-lg">
                      {resumo.cliente.nome}
                    </h3>
                    <div className="flex items-center space-x-3 text-sm text-bella-600">
                      <span className="flex items-center space-x-1">
                        <FiCalendar className="w-3 h-3" />
                        <span>
                          {resumo.qtd_servicos} serviço
                          {resumo.qtd_servicos !== 1 ? "s" : ""} este mês
                        </span>
                      </span>
                      {resumo.cliente.telefone && (
                        <span className="flex items-center space-x-1">
                          <span>•</span>
                          <span>{resumo.cliente.telefone}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm text-bella-600">Débito Total</p>
                    <p className="font-semibold text-red-600">
                      {formatCurrency(resumo.total_debito)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-bella-600">Pago</p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(resumo.total_pago)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-bella-600">Saldo</p>
                    <p
                      className={`font-semibold ${
                        resumo.saldo_devedor > 0
                          ? "text-orange-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatCurrency(resumo.saldo_devedor)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => loadDetalhes(resumo.cliente.id)}
                      className="p-2 text-bella-600 hover:bg-bella-200 rounded-lg transition-colors"
                      title="Ver detalhes"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>

                    {resumo.saldo_devedor > 0 && (
                      <button
                        onClick={() => {
                          setClienteDetalhado({
                            cliente: resumo.cliente,
                            saldo_devedor: resumo.saldo_devedor,
                          });
                          setValorPagamento(resumo.saldo_devedor.toString());
                          setShowPagamento(true);
                        }}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Registrar pagamento"
                      >
                        <FiCreditCard className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {resumosClientes.length === 0 && (
            <div className="text-center py-8">
              <FiUsers className="w-12 h-12 text-bella-300 mx-auto mb-4" />
              <p className="text-bella-600">Nenhum cliente mensal cadastrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Detalhes */}
      {showDetalhes && clienteDetalhado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-bella-800">
                Detalhes - {clienteDetalhado.cliente.nome}
              </h2>
              <button
                onClick={() => setShowDetalhes(false)}
                className="p-2 text-bella-600 hover:bg-bella-100 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Resumo do Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bella-card">
                <div className="text-center">
                  <p className="text-sm text-bella-600">Total Débito</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(clienteDetalhado.total_debito)}
                  </p>
                </div>
              </div>
              <div className="bella-card">
                <div className="text-center">
                  <p className="text-sm text-bella-600">Total Pago</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(clienteDetalhado.total_pago)}
                  </p>
                </div>
              </div>
              <div className="bella-card">
                <div className="text-center">
                  <p className="text-sm text-bella-600">Saldo Devedor</p>
                  <p
                    className={`text-xl font-bold ${
                      clienteDetalhado.saldo_devedor > 0
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {formatCurrency(clienteDetalhado.saldo_devedor)}
                  </p>
                </div>
              </div>
            </div>

            {/* Serviços */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-bella-800 mb-4 flex items-center space-x-2">
                <FiCalendar className="w-5 h-5" />
                <span>
                  Serviços Realizados ({clienteDetalhado.debitos?.length || 0})
                </span>
              </h3>

              {clienteDetalhado.debitos &&
              clienteDetalhado.debitos.length > 0 ? (
                <div className="space-y-3">
                  {clienteDetalhado.debitos.map((debito: any) => (
                    <div
                      key={debito.id}
                      className="p-4 bg-bella-50 rounded-lg border border-bella-200 hover:bg-bella-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-bella-500 rounded-full flex items-center justify-center">
                              <FiDollarSign className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-bella-800 text-lg">
                                {debito.servico_nome || "Serviço"}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-bella-600">
                                <span className="flex items-center space-x-1">
                                  <FiCalendar className="w-3 h-3" />
                                  <span>
                                    {debito.data_servico
                                      ? new Date(
                                          debito.data_servico,
                                        ).toLocaleDateString("pt-BR", {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      : "Data não informada"}
                                  </span>
                                </span>
                                {debito.profissional_nome && (
                                  <span className="flex items-center space-x-1">
                                    <FiUsers className="w-3 h-3" />
                                    <span>{debito.profissional_nome}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {debito.agendamento_id && (
                            <p className="text-xs text-bella-500 ml-11">
                              Agendamento: {debito.agendamento_id}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-xl text-bella-800">
                            {formatCurrency(debito.valor || 0)}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              debito.pago
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {debito.pago ? "Pago" : "Pendente"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-bella-50 rounded-lg border border-bella-200">
                  <FiCalendar className="w-12 h-12 text-bella-300 mx-auto mb-4" />
                  <p className="text-bella-600">
                    Nenhum serviço encontrado para este período
                  </p>
                  <p className="text-bella-500 text-sm mt-1">
                    Serviços com "débito mensal" aparecerão aqui
                  </p>
                </div>
              )}
            </div>

            {/* Pagamentos */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-bella-800 mb-4 flex items-center space-x-2">
                <FiCreditCard className="w-5 h-5" />
                <span>
                  Pagamentos Realizados (
                  {clienteDetalhado.pagamentos?.length || 0})
                </span>
              </h3>

              {clienteDetalhado.pagamentos &&
              clienteDetalhado.pagamentos.length > 0 ? (
                <div className="space-y-3">
                  {clienteDetalhado.pagamentos.map((pagamento: any) => (
                    <div
                      key={pagamento.id}
                      className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <FiCheck className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-green-800 text-lg">
                                Pagamento Recebido
                              </p>
                              <div className="flex items-center space-x-1 text-sm text-green-600">
                                <FiCalendar className="w-3 h-3" />
                                <span>
                                  {pagamento.data_pagamento
                                    ? new Date(
                                        pagamento.data_pagamento,
                                      ).toLocaleDateString("pt-BR", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "Data não informada"}
                                </span>
                              </div>
                            </div>
                          </div>
                          {pagamento.observacoes && (
                            <p className="text-sm text-green-700 ml-11 italic">
                              "{pagamento.observacoes}"
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-xl text-green-800">
                            {formatCurrency(pagamento.valor_pago || 0)}
                          </p>
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                            Confirmado
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200">
                  <FiCreditCard className="w-12 h-12 text-green-300 mx-auto mb-4" />
                  <p className="text-green-600">Nenhum pagamento registrado</p>
                  <p className="text-green-500 text-sm mt-1">
                    Pagamentos aparecerão aqui quando registrados
                  </p>
                </div>
              )}
            </div>

            {/* Botão de Pagamento */}
            {clienteDetalhado.saldo_devedor > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setValorPagamento(
                      clienteDetalhado.saldo_devedor.toString(),
                    );
                    setShowPagamento(true);
                  }}
                  className="bella-button flex items-center space-x-2"
                >
                  <FiCreditCard className="w-4 h-4" />
                  <span>Registrar Pagamento</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Pagamento */}
      {showPagamento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-bella-800">
                Registrar Pagamento
              </h2>
              <button
                onClick={() => setShowPagamento(false)}
                className="p-2 text-bella-600 hover:bg-bella-100 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  Valor Pago (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={valorPagamento}
                  onChange={(e) => setValorPagamento(e.target.value)}
                  className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  value={observacoesPagamento}
                  onChange={(e) => setObservacoesPagamento(e.target.value)}
                  className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                  rows={3}
                  placeholder="Observações sobre o pagamento..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPagamento(false)}
                  className="flex-1 px-4 py-3 border border-bella-300 text-bella-700 rounded-lg hover:bg-bella-50"
                  disabled={processandoPagamento}
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePagamento}
                  className="flex-1 bella-button"
                  disabled={!valorPagamento || processandoPagamento}
                >
                  {processandoPagamento ? "Processando..." : "Registrar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Cliente Mensal */}
      {showNovoMensal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-bella-800">
                Novo Cliente Mensal
              </h2>
              <button
                onClick={() => setShowNovoMensal(false)}
                className="p-2 text-bella-600 hover:bg-bella-100 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  Selecionar Cliente
                </label>
                <select
                  value={clienteSelecionado}
                  onChange={(e) => setClienteSelecionado(e.target.value)}
                  className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                >
                  <option value="">Selecione um cliente</option>
                  {clientesNormaisDisponiveis.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowNovoMensal(false)}
                  className="flex-1 px-4 py-3 border border-bella-300 text-bella-700 rounded-lg hover:bg-bella-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleNovoClienteMensal}
                  className="flex-1 bella-button"
                  disabled={!clienteSelecionado}
                >
                  Configurar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
