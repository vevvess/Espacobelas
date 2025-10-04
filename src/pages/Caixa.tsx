import React, { useEffect, useMemo, useState } from "react";
import {
  FiDollarSign,
  FiDownload,
  FiPlus,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiCreditCard,
  FiEdit,
  FiTrash2,
  FiX,
  FiPrinter,
  FiFilter,
  FiLoader,
} from "react-icons/fi";
import { useAuth } from "../contexts/SimpleAuthContext";
import { useCaixa } from "../hooks/useCaixa";
import { ModalEditarMovimentacao } from "../components/ModalEditarMovimentacao";
import { toast } from "../hooks/use-toast";
import { getDinheiroInformado, setDinheiroInformado as setDinheiroInformadoDB } from "@/services/caixaDbService";

interface MovimentoCaixa {
  id: string;
  tipo: "entrada" | "saida";
  descricao: string;
  valor: number;
  categoria: string;
  formaPagamento?: string;
  data: Date;
  observacoes: string;
  agendamentoId?: string;
  clienteNome?: string;
  profissional?: string;
}

interface AtendimentoDia {
  id: string;
  clienteNome: string;
  profissional: string;
  servicos: string[];
  horario: string;
  valor: number;
  formaPagamento: string;
  status: "pago" | "pendente";
  observacoes: string;
}

const categoriasEntrada = ["Atendimento", "Produtos", "Outros"];

const categoriasSaida = [
  "Compras",
  "Salários",
  "Contas",
  "Impostos",
  "Marketing",
  "Manutenção",
  "Outros",
];

const formasPagamento = [
  { id: "dinheiro", nome: "Dinheiro", icon: "💵" },
  { id: "pix", nome: "PIX", icon: "📱" },
  { id: "cartao_debito", nome: "Cartão de Débito", icon: "💳" },
  { id: "cartao_credito", nome: "Cartão de Crédito", icon: "💳" },
  { id: "conta_corrente", nome: "Deixar na Conta", icon: "📋" },
  { id: "debito_mensal", nome: "Débito Mensal", icon: "📅" },
];

export default function Caixa() {
  const { user } = useAuth();
  const formatLocalYMD = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
  const parseYMDToLocalDate = (ymd: string) => {
    const [y, m, d] = ymd.split("-").map((n) => parseInt(n, 10));
    return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
  };

  const [dataAtual, setDataAtual] = useState(formatLocalYMD(new Date()));
  // Data selecionada e overrides de dinheiro informado
  const selectedDate = useMemo(
    () => parseYMDToLocalDate(dataAtual),
    [dataAtual],
  );
  const cashKey = useMemo(
    () => `caixa_cash_override_${dataAtual}`,
    [dataAtual],
  );
  const [dinheiroInformado, setDinheiroInformado] = useState<number>(() => {
    try {
      const v = localStorage.getItem(cashKey);
      return v ? Number(v) : 0;
    } catch {
      return 0;
    }
  });
  const saveDinheiroInformado = async (v: number) => {
    setDinheiroInformado(v);
    try {
      localStorage.setItem(cashKey, String(v));
    } catch {}
    try {
      if (user?.id) {
        await setDinheiroInformadoDB(user.id, dataAtual, Number(v) || 0);
      }
    } catch (e) {
      console.warn("Falha ao persistir dinheiro informado no banco:", e);
    }
  };
  const hiddenKey = useMemo(() => `caixa_hidden_${dataAtual}`, [dataAtual]);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(hiddenKey);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      return new Set(arr);
    } catch {
      return new Set();
    }
  });
  const loadHidden = () => {
    try {
      const raw = localStorage.getItem(hiddenKey);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      setHiddenIds(new Set(arr));
    } catch {
      setHiddenIds(new Set());
    }
  };
  const persistHidden = (setVal: Set<string>) => {
    try {
      localStorage.setItem(hiddenKey, JSON.stringify(Array.from(setVal)));
    } catch {}
  };
  useEffect(() => {
    loadHidden();
  }, [hiddenKey]);

  // Carregar Dinheiro Informado do banco ao trocar a data
  useEffect(() => {
    let cancelled = false;
    async function loadCash() {
      try {
        if (user?.id) {
          const v = await getDinheiroInformado(user.id, dataAtual);
          if (!cancelled) {
            setDinheiroInformado(v || 0);
            try { localStorage.setItem(cashKey, String(v || 0)); } catch {}
          }
        }
      } catch (e) {
        // Silencioso: se falhar, fica com o que estiver no localStorage
        console.warn("Falha ao carregar Dinheiro Informado do banco:", e);
      }
    }
    loadCash();
    return () => { cancelled = true; };
  }, [user?.id, dataAtual]);
  const {
    movimentos,
    atendimentos,
    loading,
    error,
    saldoInicial,
    totalEntradas,
    totalSaidas,
    saldoFinal,
    adicionarMovimentoManual,
    editarMovimentacao,
    removerMovimento,
    setSaldoInicial,
    formatCurrency,
    getResumoDiario,
  } = useCaixa(selectedDate);

  const [showNovoMovimento, setShowNovoMovimento] = useState(false);
  const [showNovoAtendimento, setShowNovoAtendimento] = useState(false);
  const [showNovaDespesa, setShowNovaDespesa] = useState(false);
  const [showEditarMovimento, setShowEditarMovimento] = useState(false);
  const [movimentoEditando, setMovimentoEditando] =
    useState<MovimentoCaixa | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  const [novoAtendimento, setNovoAtendimento] = useState({
    cliente: "",
    servicos: "",
    profissional: "",
    valor: 0,
    formaPagamento: "dinheiro",
  });

  const resumo = useMemo(
    () => getResumoDiario(selectedDate),
    [getResumoDiario, selectedDate],
  );

  // Formulário de novo movimento
  const [novoMovimento, setNovoMovimento] = useState({
    tipo: "entrada" as "entrada" | "saida",
    descricao: "",
    valor: 0,
    categoria: "Atendimento",
    formaPagamento: "dinheiro",
    observacoes: "",
  });

  const resetForm = () => {
    setNovoMovimento({
      tipo: "entrada",
      descricao: "",
      valor: 0,
      categoria: "Atendimento",
      formaPagamento: "dinheiro",
      observacoes: "",
    });
  };

  const handleSalvarMovimento = () => {
    if (
      !novoMovimento.descricao ||
      !novoMovimento.categoria ||
      novoMovimento.valor <= 0
    ) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    if (movimentoEditando) {
      // Editar movimento existente
      if (movimentoEditando.agendamentoId) {
        alert(
          "Não é possível editar movimentos vindos de agendamentos. Para alterar, edite o agendamento correspondente.",
        );
        return;
      }
      // TODO: Implementar edição de movimentos manuais
      alert("Edição de movimentos será implementada em breve");
      return;
    }

    // Adicionar novo movimento manual (respeitando a data selecionada no filtro)
    adicionarMovimentoManual({
      tipo: novoMovimento.tipo,
      descricao: novoMovimento.descricao,
      valor: novoMovimento.valor,
      categoria: novoMovimento.categoria,
      formaPagamento: novoMovimento.formaPagamento,
      data: new Date(selectedDate.getTime()),
      observacoes: novoMovimento.observacoes,
    });

    setShowNovoMovimento(false);
    resetForm();
  };

  const handleEditarMovimento = (movimento: MovimentoCaixa) => {
    setMovimentoEditando(movimento);
    setShowEditarMovimento(true);
  };

  const handleSalvarEdicaoMovimento = async (data: any) => {
    try {
      await editarMovimentacao(data.movimentoId, {
        descricao: data.descricao,
        valor: data.valor,
        categoria: data.categoria,
        formaPagamento: data.formaPagamento,
        data: data.data,
        observacoes: data.observacoes,
      });
      setMovimentoEditando(null);
      setShowEditarMovimento(false);
    } catch (error) {
      console.error("Erro ao editar movimentação:", error);
    }
  };

  const handleDeleteMovimento = (id: string) => {
    const movimento = movimentos.find((m) => m.id === id);
    if (!movimento) return;

    if (movimento.id.startsWith("manual_")) {
      if (confirm("Tem certeza que deseja excluir este movimento?")) {
        removerMovimento(id);
      }
      return;
    }

    if (
      confirm(
        "Remover este item do Caixa do dia? (O agendamento original permanece)",
      )
    ) {
      const next = new Set(hiddenIds);
      next.add(id);
      setHiddenIds(next);
      persistHidden(next);
      toast({
        title: "Removido do caixa",
        description: "O agendamento original não foi alterado.",
      });
    }
  };

  const handleCancelarModal = () => {
    setShowNovoMovimento(false);
    setMovimentoEditando(null);
    resetForm();
  };

  // Filtrar movimentos por data e tipo
  const dataFiltro = selectedDate;

  const movimentosFiltrados = movimentos.filter((movimento) => {
    if (hiddenIds.has(movimento.id)) return false;
    const dataMovimento = new Date(movimento.data);
    const mesmaData =
      dataMovimento.getFullYear() === dataFiltro.getFullYear() &&
      dataMovimento.getMonth() === dataFiltro.getMonth() &&
      dataMovimento.getDate() === dataFiltro.getDate();

    const tipoMatch = filtroTipo === "todos" || movimento.tipo === filtroTipo;
    return mesmaData && tipoMatch;
  });

  const limparDebug = (txt?: string) => {
    if (!txt) return "";
    return txt
      .replace(/\[SERVICOS:[^\]]*\]/gi, "")
      .replace(/\[FUNC:[^\]]*\]/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const movimentosAtendimentoDia = useMemo(() => {
    const lista = movimentosFiltrados
      .filter((m) => m.tipo === "entrada" && m.categoria === "Atendimento")
      .map((m) => {
        let servicos = "";
        if (m.agendamentoId) {
          const base = m.descricao || "";
          const idx = base.indexOf(":");
          servicos = idx >= 0 ? base.substring(idx + 1).trim() : base.trim();
        } else {
          servicos = m.observacoes || "";
        }
        servicos = limparDebug(servicos);
        return {
          id: m.id,
          cliente: m.clienteNome || m.descricao || "-",
          servicos,
          profissional: m.profissional || "-",
          valor: m.valor,
          pagamento: m.formaPagamento || "-",
          movimento: m,
          isManual: m.id.startsWith("manual_"),
          isAgendamento: Boolean(m.agendamentoId),
        };
      });
    return lista;
  }, [movimentosFiltrados]);

  // Função para gerar PDF do dia
  const gerarPdfDoDia = () => {
    const dateLabel = selectedDate.toLocaleDateString("pt-BR");
    const movimentosDia = movimentosFiltrados;
    const despesasDia = movimentosDia.filter((m) => m.tipo === "saida");

    const moeda = (v: number) => formatCurrency(Number(v) || 0);

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Fechamento de Caixa</title>
    <style>
      :root{
        --green:#16a34a; --green-50:#ecfdf5;
        --blue:#2563eb; --blue-50:#eff6ff;
        --indigo:#4f46e5; --indigo-50:#eef2ff;
        --emerald:#059669; --emerald-50:#ecfdf5;
        --amber:#d97706; --amber-50:#fffbeb;
        --rose:#e11d48; --rose-50:#fff1f2;
        --teal:#0d9488; --teal-50:#f0fdfa;
        --gray:#111827; --muted:#6b7280;
      }
      *{box-sizing:border-box}
      body{font-family: Inter, Arial, sans-serif; padding:28px; color:var(--gray)}
      h1{font-size:22px;margin:0 0 6px}
      .subtitle{color:var(--muted); margin-bottom:16px}
      .grid{display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px}
      .card{border:1px solid #e5e7eb; border-left-width:6px; padding:10px 12px; border-radius:10px; background:#fff}
      .card .label{font-size:12px; color:var(--muted); margin-bottom:4px}
      .card .value{font-size:16px; font-weight:700}
      .b-green{border-left-color:var(--green); background:var(--green-50)}
      .b-blue{border-left-color:var(--blue); background:var(--blue-50)}
      .b-indigo{border-left-color:var(--indigo); background:var(--indigo-50)}
      .b-emerald{border-left-color:var(--emerald); background:var(--emerald-50)}
      .b-amber{border-left-color:var(--amber); background:var(--amber-50)}
      .b-rose{border-left-color:var(--rose); background:var(--rose-50)}
      .b-teal{border-left-color:var(--teal); background:var(--teal-50)}
      table{width:100%; border-collapse: collapse; margin-top:14px}
      th,td{border:1px solid #e5e7eb; padding:8px 10px; font-size:12px}
      th{background:#f8fafc; text-align:left}
      tbody tr:nth-child(odd){background:#fafafa}
      .section{margin-top:18px}
      .footer{margin-top:16px; font-size:12px; color:var(--muted)}
    </style>
    </head><body>
    <h1>Fechamento de Caixa - Espaço Bella's</h1>
    <div class="subtitle">Data: ${dateLabel}</div>

    <div class="grid">
      <div class="card b-green"><div class="label">Total Entradas (PIX+Cartão+Dinheiro)</div><div class="value">${moeda(resumo.totalEntradas)}</div></div>
      <div class="card b-blue"><div class="label">Total PIX</div><div class="value">${moeda(resumo.entradasPix)}</div></div>
      <div class="card b-indigo"><div class="label">Total Cartão (Débito/Crédito)</div><div class="value">${moeda(resumo.entradasCartao)}</div></div>
      <div class="card b-emerald"><div class="label">Total Dinheiro (Entrada)</div><div class="value">${moeda(resumo.entradasDinheiro)}</div></div>
      <div class="card b-amber"><div class="label">Total Débitos (Não Pago)</div><div class="value">${moeda(resumo.debitos)}</div></div>
      <div class="card b-rose"><div class="label">Total Despesas</div><div class="value">${moeda(resumo.despesas)}</div></div>
      <div class="card b-teal"><div class="label">Dinheiro em Caixa (Calculado)</div><div class="value">${moeda(resumo.dinheiroCalculado)}</div></div>
    </div>

    <div class="section">
      <h2 style="margin:0 0 6px;font-size:16px">Detalhes dos Atendimentos</h2>
      <table>
        <thead><tr><th>Cliente</th><th>Serviço</th><th>Funcionário</th><th>Valor Total</th><th>Pagamento</th></tr></thead>
        <tbody>
          ${movimentosAtendimentoDia
            .map(
              (r) =>
                `<tr><td>${r.cliente || "-"}</td><td>${r.servicos || "-"}</td><td>${r.profissional || "-"}</td><td>${moeda(Number(r.valor) || 0)}</td><td>${(r.pagamento || "").toUpperCase()}</td></tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2 style="margin:0 0 6px;font-size:16px">Detalhes das Despesas</h2>
      <table>
        <thead><tr><th>Descrição</th><th>Valor</th></tr></thead>
        <tbody>
          ${despesasDia
            .map(
              (d) =>
                `<tr><td>${d.descricao}</td><td>${moeda(Number(d.valor) || 0)}</td></tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <div class="footer">Gerado em: ${new Date().toLocaleString("pt-BR")}</div>
    </body></html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <FiLoader className="w-8 h-8 text-bella-500 animate-spin" />
          <p className="text-bella-600">Carregando dados do caixa...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bella-card">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">
            Erro ao carregar dados do caixa: {error}
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
          <h1 className="text-2xl font-bold text-bella-800">Caixa</h1>
          <p className="text-bella-600">Controle financeiro e movimentações</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowNovoAtendimento(true)}
            className="bella-button flex items-center space-x-2"
          >
            <FiPlus className="w-4 h-4" />
            <span>Atendimento Manual</span>
          </button>
          <button
            onClick={() => setShowNovaDespesa(true)}
            className="bella-button flex items-center space-x-2"
          >
            <FiPlus className="w-4 h-4" />
            <span>Despesa</span>
          </button>
          <button
            onClick={() => gerarPdfDoDia()}
            className="bella-button flex items-center space-x-2"
          >
            <FiPrinter className="w-4 h-4" />
            <span>Gerar PDF</span>
          </button>
        </div>
      </div>

      {/* Resumo Financeiro - Diário */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bella-card border-l-4 border-green-400 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">
                Total Entradas (PIX+Cartão+Din.)
              </p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(resumo.totalEntradas)}
              </p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bella-card border-l-4 border-blue-400 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total PIX</p>
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrency(resumo.entradasPix)}
              </p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bella-card border-l-4 border-indigo-400 bg-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-700">
                Total Cartão (Crédito/Débito)
              </p>
              <p className="text-2xl font-bold text-indigo-700">
                {formatCurrency(resumo.entradasCartao)}
              </p>
            </div>
            <FiCreditCard className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <div className="bella-card border-l-4 border-emerald-400 bg-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">
                Total Dinheiro (Entrada)
              </p>
              <p className="text-2xl font-bold text-emerald-700">
                {formatCurrency(resumo.entradasDinheiro)}
              </p>
            </div>
            <FiDollarSign className="w-8 h-8 text-emerald-600" />
          </div>
        </div>

        <div className="bella-card border-l-4 border-amber-400 bg-amber-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700">
                Total Débitos (Não Pago)
              </p>
              <p className="text-2xl font-bold text-amber-700">
                {formatCurrency(resumo.debitos)}
              </p>
            </div>
            <FiTrendingDown className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        <div className="bella-card border-l-4 border-rose-400 bg-rose-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-rose-700">
                Total Despesas
              </p>
              <p className="text-2xl font-bold text-rose-700">
                {formatCurrency(resumo.despesas)}
              </p>
            </div>
            <FiTrendingDown className="w-8 h-8 text-rose-600" />
          </div>
        </div>

        <div className="bella-card border-l-4 border-teal-400 bg-teal-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-teal-700">
                Dinheiro em Caixa (Calculado)
              </p>
              <p
                className={`text-2xl font-bold ${resumo.dinheiroCalculado >= 0 ? "text-teal-700" : "text-red-700"}`}
              >
                {formatCurrency(resumo.dinheiroCalculado)}
              </p>
            </div>
            <FiDollarSign className="w-8 h-8 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Filtros e Dinheiro Informado */}
      <div className="bella-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-bella-700 mb-2">
              Data
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const d = parseYMDToLocalDate(dataAtual);
                  d.setDate(d.getDate() - 1);
                  setDataAtual(formatLocalYMD(d));
                }}
                className="px-3 py-2 rounded-lg border border-bella-200 hover:bg-bella-50"
                aria-label="Dia anterior"
                title="Dia anterior"
              >
                ◀
              </button>
              <input
                type="date"
                value={dataAtual}
                onChange={(e) => setDataAtual(e.target.value)}
                onInput={(e) => setDataAtual((e.target as HTMLInputElement).value)}
                onBlur={(e) => setDataAtual((e.target as HTMLInputElement).value)}
                className="w-full px-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => {
                  const d = parseYMDToLocalDate(dataAtual);
                  d.setDate(d.getDate() + 1);
                  setDataAtual(formatLocalYMD(d));
                }}
                className="px-3 py-2 rounded-lg border border-bella-200 hover:bg-bella-50"
                aria-label="Próximo dia"
                title="Próximo dia"
              >
                ▶
              </button>
              <button
                type="button"
                onClick={() => setDataAtual(formatLocalYMD(new Date()))}
                className="px-3 py-2 rounded-lg border border-bella-200 hover:bg-bella-50"
                aria-label="Hoje"
                title="Hoje"
              >
                Hoje
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-bella-700 mb-2">
              Tipo
            </label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
            >
              <option value="todos">Todos os tipos</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-bella-700 mb-2">
              Dinheiro em Caixa (Informado)
            </label>
            <input
              type="number"
              step="0.01"
              value={dinheiroInformado}
              onChange={(e) =>
                saveDinheiroInformado(parseFloat(e.target.value || "0"))
              }
              className="w-full px-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
              placeholder="0,00"
            />
          </div>
        </div>
      </div>

      {/* Atendimentos do Caixa (Diário) */}
      <div className="bella-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-bella-800">
            Atendimentos do Caixa ({selectedDate.toLocaleDateString("pt-BR")})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-bella-700">
                <th className="text-left py-2">Cliente</th>
                <th className="text-left py-2">Serviço</th>
                <th className="text-left py-2">Funcionário</th>
                <th className="text-left py-2">Valor Total (R$)</th>
                <th className="text-left py-2">Pagamento</th>
                <th className="text-right py-2">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {movimentosAtendimentoDia.map((row) => (
                <tr key={row.id}>
                  <td className="py-2">{row.cliente}</td>
                  <td className="py-2">{row.servicos || "-"}</td>
                  <td className="py-2">{row.profissional}</td>
                  <td className="py-2">
                    {formatCurrency(Number(row.valor) || 0)}
                  </td>
                  <td className="py-2">
                    {(row.pagamento || "").toUpperCase()}
                  </td>
                  <td className="py-2">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditarMovimento(row.movimento)}
                        className="p-1 text-bella-600 hover:bg-bella-100 rounded transition-colors"
                        title="Editar"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMovimento(row.id)}
                        className={`p-1 rounded transition-colors text-red-600 hover:bg-red-100`}
                        title={
                          row.isManual
                            ? "Excluir"
                            : "Remover do caixa (não apaga o agendamento)"
                        }
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {movimentosAtendimentoDia.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-bella-600">
                    Sem atendimentos para esta data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lista de Movimentações */}
      <div className="bella-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-bella-800">
            Movimentações do Dia
          </h2>
          <span className="bg-bella-100 text-bella-700 text-sm font-medium px-3 py-1 rounded-full">
            {movimentosFiltrados.length} movimentações
          </span>
        </div>

        <div className="space-y-4">
          {movimentosFiltrados.map((movimento) => (
            <div
              key={movimento.id}
              className="flex items-center justify-between p-4 bg-bella-50 rounded-lg hover:bg-bella-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    movimento.tipo === "entrada" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {movimento.tipo === "entrada" ? (
                    <FiTrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <FiTrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-medium text-bella-800">
                    {movimento.descricao}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-bella-600">
                    <span className="bg-bella-200 px-2 py-1 rounded">
                      {movimento.categoria}
                    </span>
                    {movimento.formaPagamento && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {
                          formasPagamento.find(
                            (f) => f.id === movimento.formaPagamento,
                          )?.nome
                        }
                      </span>
                    )}
                    {movimento.agendamentoId && (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        Agendamento
                      </span>
                    )}
                    {movimento.clienteNome && (
                      <span className="text-bella-500">
                        • {movimento.clienteNome}
                      </span>
                    )}
                  </div>
                  {movimento.observacoes && (
                    <p className="text-xs text-bella-500 mt-1">
                      {limparDebug(movimento.observacoes)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      movimento.tipo === "entrada"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {movimento.tipo === "entrada" ? "+" : "-"}
                    {formatCurrency(movimento.valor)}
                  </p>
                  <p className="text-xs text-bella-500">
                    {new Date(movimento.data).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditarMovimento(movimento)}
                    className="p-1 text-bella-600 hover:bg-bella-100 rounded transition-colors"
                    title="Editar"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMovimento(movimento.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                    title={
                      movimento.id.startsWith("manual_")
                        ? "Excluir"
                        : "Remover do caixa (não apaga o agendamento)"
                    }
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {movimentosFiltrados.length === 0 && (
            <div className="text-center py-8">
              <FiDollarSign className="w-12 h-12 text-bella-300 mx-auto mb-4" />
              <p className="text-bella-600">
                Nenhuma movimentação encontrada para esta data
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Atendimento Manual */}
      {showNovoAtendimento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-bella-800">
                Novo Atendimento Manual
              </h2>
              <button
                onClick={() => setShowNovoAtendimento(false)}
                className="p-2 text-bella-600 hover:bg-bella-100 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-bella-700 mb-2">
                    Cliente *
                  </label>
                  <input
                    type="text"
                    value={novoAtendimento.cliente}
                    onChange={(e) =>
                      setNovoAtendimento((p) => ({
                        ...p,
                        cliente: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                    placeholder="Nome do cliente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-bella-700 mb-2">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={novoAtendimento.valor}
                    onChange={(e) =>
                      setNovoAtendimento((prev) => ({
                        ...prev,
                        valor: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  Serviço(s) *
                </label>
                <input
                  type="text"
                  value={novoAtendimento.servicos}
                  onChange={(e) =>
                    setNovoAtendimento((prev) => ({
                      ...prev,
                      servicos: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                  placeholder="Ex: Corte + Escova"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-bella-700 mb-2">
                    Categoria
                  </label>
                  <input
                    value="Atendimento"
                    disabled
                    className="w-full px-4 py-2 border border-bella-200 rounded-lg bg-bella-50 text-bella-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-bella-700 mb-2">
                    Forma de Pagamento
                  </label>
                  <select
                    value={novoAtendimento.formaPagamento}
                    onChange={(e) =>
                      setNovoAtendimento((prev) => ({
                        ...prev,
                        formaPagamento: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                  >
                    {formasPagamento.map((forma) => (
                      <option key={forma.id} value={forma.id}>
                        {forma.icon} {forma.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  Funcionário *
                </label>
                <input
                  type="text"
                  value={novoAtendimento.profissional}
                  onChange={(e) =>
                    setNovoAtendimento((prev) => ({
                      ...prev,
                      profissional: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                  placeholder="Nome do funcionário"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowNovoAtendimento(false);
                    setNovoAtendimento({
                      cliente: "",
                      servicos: "",
                      profissional: "",
                      valor: 0,
                      formaPagamento: "dinheiro",
                    });
                  }}
                  className="flex-1 px-4 py-3 border border-bella-300 text-bella-700 rounded-lg hover:bg-bella-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (
                      !novoAtendimento.cliente ||
                      !novoAtendimento.servicos ||
                      !novoAtendimento.profissional ||
                      novoAtendimento.valor <= 0
                    )
                      return;
                    adicionarMovimentoManual({
                      tipo: "entrada",
                      descricao: `Atendimento manual`,
                      valor: novoAtendimento.valor,
                      categoria: "Atendimento",
                      formaPagamento: novoAtendimento.formaPagamento,
                      data: new Date(selectedDate.getTime()),
                      observacoes: novoAtendimento.servicos,
                      clienteNome: novoAtendimento.cliente,
                      profissional: novoAtendimento.profissional,
                    });
                    setShowNovoAtendimento(false);
                    setNovoAtendimento({
                      cliente: "",
                      servicos: "",
                      profissional: "",
                      valor: 0,
                      formaPagamento: "dinheiro",
                    });
                  }}
                  className="flex-1 bella-button"
                  disabled={
                    !novoAtendimento.cliente ||
                    !novoAtendimento.servicos ||
                    !novoAtendimento.profissional ||
                    novoAtendimento.valor <= 0
                  }
                >
                  Salvar Atendimento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Despesa */}
      {showNovaDespesa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-bella-800">Nova Despesa</h2>
              <button
                onClick={() => setShowNovaDespesa(false)}
                className="p-2 text-bella-600 hover:bg-bella-100 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  onChange={(e) =>
                    setNovoMovimento((prev) => ({
                      ...prev,
                      descricao: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                  placeholder="Ex: água"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  onChange={(e) =>
                    setNovoMovimento((prev) => ({
                      ...prev,
                      valor: parseFloat(e.target.value || "0"),
                    }))
                  }
                  className="w-full px-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                  placeholder="0,00"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNovaDespesa(false)}
                  className="flex-1 px-4 py-3 border border-bella-300 text-bella-700 rounded-lg hover:bg-bella-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (
                      !novoMovimento.descricao ||
                      (novoMovimento.valor || 0) <= 0
                    )
                      return;
                    adicionarMovimentoManual({
                      tipo: "saida",
                      descricao: novoMovimento.descricao,
                      valor: novoMovimento.valor,
                      categoria: "Despesas",
                      data: new Date(selectedDate.getTime()),
                      observacoes: "Despesa manual",
                    });
                    setShowNovaDespesa(false);
                    setNovoMovimento({
                      tipo: "entrada",
                      descricao: "",
                      valor: 0,
                      categoria: "Atendimento",
                      formaPagamento: "dinheiro",
                      observacoes: "",
                    });
                  }}
                  className="flex-1 bella-button"
                >
                  Salvar Despesa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Movimentação */}
      <ModalEditarMovimentacao
        isOpen={showEditarMovimento}
        onClose={() => {
          setShowEditarMovimento(false);
          setMovimentoEditando(null);
        }}
        onSave={handleSalvarEdicaoMovimento}
        movimentacao={movimentoEditando}
      />
    </div>
  );
}
