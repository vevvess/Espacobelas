import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/SimpleAuthContext";
import {
  listProdutos,
  listCategorias,
  listLocais,
  createProduto,
  recordMovimento,
  updateProduto,
  exportProdutosCSV,
  exportMovimentosCSV,
  listMovimentos,
  computeAlerts,
  type Produto,
  type Categoria,
  type LocalArmazenamento,
  type Unidade,
} from "@/services/estoqueDbService";
import {
  FiBox,
  FiPlus,
  FiMinus,
  FiSearch,
  FiLayers,
  FiMapPin,
  FiCamera,
  FiSave,
  FiBarChart2,
  FiDownload,
  FiAlertTriangle,
  FiAlertOctagon,
  FiRefreshCcw,
  FiX,
} from "react-icons/fi";
import { toast } from "@/hooks/use-toast";

const unidades: Unidade[] = ["un", "pct", "ml", "g", "l", "kg"];

function compressImageToDataUrl(file: File, maxW = 800, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const fr = new FileReader();
    fr.onload = () => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxW / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("ctx null"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = fr.result as string;
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

async function detectBarcodeFromFile(file: File): Promise<string | null> {
  try {
    // Prefer BarcodeDetector
    // @ts-ignore
    if (window.BarcodeDetector) {
      // @ts-ignore
      const detector = new window.BarcodeDetector({ formats: ["ean_13", "ean_8", "code_128", "code_39", "qr_code", "upc_a", "upc_e"] });
      const bmp = await createImageBitmap(file);
      const res = await detector.detect(bmp as any);
      if (res && res.length > 0) {
        return res[0].rawValue || res[0].raw || null;
      }
    }
  } catch (e) {
    console.warn("BarcodeDetector failed:", e);
  }
  return null;
}

export default function Estoque() {
  const { user } = useAuth();

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [locais, setLocais] = useState<LocalArmazenamento[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("");
  const [filtroLocal, setFiltroLocal] = useState<string>("");

  const [modalNovoOpen, setModalNovoOpen] = useState(false);
  const [novo, setNovo] = useState<Partial<Produto>>({
    unidade: "un",
    fracionavel: false,
    fator_pacote: 1,
    alerta_validade_dias: 7,
    alerta_estoque_qtd: 1,
  });

  const [movProdutoId, setMovProdutoId] = useState<string | null>(null);
  const [movQtd, setMovQtd] = useState<number>(1);
  const [movTipo, setMovTipo] = useState<"entrada" | "saida">("entrada");

  const [exporting, setExporting] = useState(false);

  const loadAll = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [ps, cs, ls] = await Promise.all([
        listProdutos(user.id, q, filtroCategoria || undefined, filtroLocal || undefined),
        listCategorias(user.id),
        listLocais(user.id),
      ]);
      setProdutos(ps);
      setCategorias(cs);
      setLocais(ls);
    } catch (e: any) {
      toast({ title: "Erro ao carregar estoque", description: e?.message || String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, q, filtroCategoria, filtroLocal]);

  const produtosComAlerta = useMemo(() => {
    return produtos.map((p) => ({ p, alert: computeAlerts(p) }));
  }, [produtos]);

  const handleQuickMove = async (produto: Produto, tipo: "entrada" | "saida", qtdDelta = 1) => {
    if (!user?.id) return;
    try {
      const qtd = Number(qtdDelta);
      if (isNaN(qtd) || qtd <= 0) return;
      await recordMovimento(user.id, {
        produto_id: produto.id,
        tipo,
        quantidade: qtd,
        unidade: produto.unidade,
        motivo: tipo === "entrada" ? "compra" : "consumo",
        created_by: user.id,
      });
      toast({ title: tipo === "entrada" ? "Entrada registrada" : "Saída registrada" });
      await loadAll();
    } catch (e: any) {
      toast({ title: "Erro ao registrar", description: e?.message || String(e), variant: "destructive" });
    }
  };

  const scanInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const onPickPhoto = () => photoInputRef.current?.click();

  const [scanLoading, setScanLoading] = useState(false);

  const onScanFromCamera = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    setScanLoading(true);
    try {
      const code = await detectBarcodeFromFile(file);
      if (code) {
        setNovo((p) => ({ ...p, codigo_barras: code }));
        toast({ title: "Código detectado", description: code });
      } else {
        toast({ title: "Não foi possível ler o código", description: "Digite manualmente ou tente outra foto." });
      }
    } finally {
      setScanLoading(false);
      ev.target.value = "";
    }
  };

  const onPickProductPhoto = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageToDataUrl(file, 900, 0.8);
      setNovo((p) => ({ ...p, foto: dataUrl }));
    } catch (e) {
      console.warn("Falha ao comprimir imagem", e);
    } finally {
      ev.target.value = "";
    }
  };

  const salvarNovoProduto = async () => {
    if (!user?.id) return;
    if (!novo.nome) {
      toast({ title: "Informe o nome do produto", variant: "destructive" });
      return;
    }
    try {
      const created = await createProduto(user.id, {
        nome: novo.nome!,
        codigo_barras: (novo as any).codigo_barras || null,
        unidade: (novo.unidade as Unidade) || "un",
        fator_pacote: Number(novo.fator_pacote || 1),
        fracionavel: !!novo.fracionavel,
        categoria_id: novo.categoria_id || null,
        local_id: novo.local_id || null,
        validade: (novo.validade as any) || null,
        alerta_validade_dias: Number(novo.alerta_validade_dias ?? 7),
        alerta_estoque_qtd: Number(novo.alerta_estoque_qtd ?? 1),
        foto: novo.foto || null,
      });
      // primeira entrada opcional
      if (movTipo && movQtd > 0) {
        await recordMovimento(user.id, {
          produto_id: created.id,
          tipo: movTipo,
          quantidade: movQtd,
          unidade: created.unidade,
          motivo: movTipo === "entrada" ? "compra" : "consumo",
          created_by: user.id,
        });
      }
      toast({ title: "Produto cadastrado" });
      setModalNovoOpen(false);
      setNovo({
        unidade: "un",
        fracionavel: false,
        fator_pacote: 1,
        alerta_validade_dias: 7,
        alerta_estoque_qtd: 1,
      });
      setMovQtd(1);
      setMovTipo("entrada");
      await loadAll();
    } catch (e: any) {
      toast({ title: "Erro ao salvar produto", description: e?.message || String(e), variant: "destructive" });
    }
  };

  const exportarProdutos = async () => {
    setExporting(true);
    try {
      exportProdutosCSV(produtos);
    } finally {
      setExporting(false);
    }
  };

  const exportarMovimentosPeriodo = async () => {
    if (!user?.id) return;
    setExporting(true);
    try {
      const fim = new Date();
      const inicio = new Date(fim.getTime() - 30 * 86400000);
      const movs = await listMovimentos(user.id, { inicio, fim });
      exportMovimentosCSV(movs);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bella-800">Estoque</h1>
          <p className="text-bella-600">Cadastro de produtos, entradas e saídas com scanner e alertas</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setModalNovoOpen(true)} className="bella-button flex items-center space-x-2">
            <FiPlus className="w-4 h-4" />
            <span>Novo Produto</span>
          </button>
          <button onClick={() => exportarProdutos()} className="bella-button flex items-center space-x-2">
            <FiDownload className="w-4 h-4" />
            <span>Exportar Produtos</span>
          </button>
          <button onClick={() => exportarMovimentosPeriodo()} className="bella-button flex items-center space-x-2">
            <FiBarChart2 className="w-4 h-4" />
            <span>Exportar Movimentos</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bella-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-bella-400" />
            <input
              placeholder="Buscar por nome, categoria ou código"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 text-bella-700">
              <FiLayers />
              <span className="text-sm font-medium">Categoria</span>
            </div>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full px-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 text-bella-700">
              <FiMapPin />
              <span className="text-sm font-medium">Local</span>
            </div>
            <select
              value={filtroLocal}
              onChange={(e) => setFiltroLocal(e.target.value)}
              className="w-full px-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              {locais.map((l) => (
                <option key={l.id} value={l.id}>{l.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="bella-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-bella-800">Produtos</h2>
          <button onClick={loadAll} className="text-bella-600 hover:text-bella-900 flex items-center gap-2">
            <FiRefreshCcw className="w-4 h-4" /> Atualizar
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-bella-600">Carregando...</div>
        ) : (
          <div className="space-y-3">
            {produtosComAlerta.map(({ p, alert }) => (
              <div key={p.id} className="p-4 bg-bella-50 rounded-lg hover:bg-bella-100 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-white border border-bella-200 flex items-center justify-center overflow-hidden">
                      {p.foto ? (
                        <img src={p.foto} alt={p.nome} className="w-full h-full object-cover" />
                      ) : (
                        <FiBox className="w-6 h-6 text-bella-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-bella-800">{p.nome}</h3>
                        {alert.baixo && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <FiAlertTriangle className="w-3 h-3" /> Baixo estoque
                          </span>
                        )}
                        {alert.validadeCritico && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <FiAlertOctagon className="w-3 h-3" /> Vencido
                          </span>
                        )}
                        {!alert.validadeCritico && alert.validadeAtencao && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <FiAlertTriangle className="w-3 h-3" /> Validade em {alert.diasParaVencer}d
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-bella-600">
                        <span>{p.categoria_nome || "Sem categoria"}</span>
                        <span className="mx-2">•</span>
                        <span>{p.local_nome || "Sem local"}</span>
                        <span className="mx-2">•</span>
                        <span>
                          {Number(p.saldo_atual || 0)} {p.unidade}
                          {p.unidade === "pct" && p.fator_pacote ? ` (x${p.fator_pacote})` : ""}
                        </span>
                        {p.codigo_barras && <span className="ml-2 text-bella-500">#{p.codigo_barras}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuickMove(p, "saida", 1)}
                      className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                      title="Retirar (−1)"
                    >
                      <FiMinus />
                    </button>
                    <button
                      onClick={() => handleQuickMove(p, "entrada", 1)}
                      className="px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                      title="Adicionar (+1)"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {produtos.length === 0 && (
              <div className="py-10 text-center text-bella-600">Nenhum produto encontrado.</div>
            )}
          </div>
        )}
      </div>

      {/* Modal Novo Produto */}
      {modalNovoOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-bella-800">Novo Produto</h2>
              <button onClick={() => setModalNovoOpen(false)} className="p-2 text-bella-600 hover:bg-bella-100 rounded-lg">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-1">Nome *</label>
                <input
                  value={novo.nome || ""}
                  onChange={(e) => setNovo((p) => ({ ...p, nome: e.target.value }))}
                  className="w-full px-3 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-1">Código de barras</label>
                <div className="flex gap-2">
                  <input
                    value={(novo as any).codigo_barras || ""}
                    onChange={(e) => setNovo((p) => ({ ...p, codigo_barras: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                    placeholder="Escaneie ou digite"
                  />
                  <button
                    onClick={() => scanInputRef.current?.click()}
                    className="px-3 py-2 border border-bella-200 rounded-lg hover:bg-bella-50 flex items-center gap-2"
                  >
                    <FiCamera /> {scanLoading ? "..." : "Escanear"}
                  </button>
                  <input
                    ref={scanInputRef}
                    type="file"
                    accept="image/*;capture=camera"
                    onChange={onScanFromCamera}
                    hidden
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-bella-700 mb-1">Unidade</label>
                <select
                  value={(novo.unidade as any) || "un"}
                  onChange={(e) => setNovo((p) => ({ ...p, unidade: e.target.value as Unidade }))}
                  className="w-full px-3 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                >
                  {unidades.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-1">Fator por pacote (se pct)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={Number(novo.fator_pacote || 1)}
                  onChange={(e) => setNovo((p) => ({ ...p, fator_pacote: Number(e.target.value || 1) }))}
                  className="w-full px-3 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="fracionavel"
                  type="checkbox"
                  checked={!!novo.fracionavel}
                  onChange={(e) => setNovo((p) => ({ ...p, fracionavel: e.target.checked }))}
                />
                <label htmlFor="fracionavel" className="text-sm text-bella-700">Fracionável (permite decimais)</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-bella-700 mb-1">Categoria</label>
                <select
                  value={novo.categoria_id || ""}
                  onChange={(e) => setNovo((p) => ({ ...p, categoria_id: e.target.value || null }))}
                  className="w-full px-3 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                >
                  <option value="">Selecionar</option>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-1">Local</label>
                <select
                  value={novo.local_id || ""}
                  onChange={(e) => setNovo((p) => ({ ...p, local_id: e.target.value || null }))}
                  className="w-full px-3 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                >
                  <option value="">Selecionar</option>
                  {locais.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-bella-700 mb-1">Validade (opcional)</label>
                <input
                  type="date"
                  value={(novo.validade as any) || ""}
                  onChange={(e) => setNovo((p) => ({ ...p, validade: e.target.value || null }))}
                  className="w-full px-3 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-bella-700 mb-1">Alerta validade (dias)</label>
                  <input
                    type="number"
                    step="1"
                    value={Number(novo.alerta_validade_dias ?? 7)}
                    onChange={(e) => setNovo((p) => ({ ...p, alerta_validade_dias: Number(e.target.value || 7) }))}
                    className="w-full px-3 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bella-700 mb-1">Alerta baixo estoque (qtd)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={Number(novo.alerta_estoque_qtd ?? 1)}
                    onChange={(e) => setNovo((p) => ({ ...p, alerta_estoque_qtd: Number(e.target.value || 1) }))}
                    className="w-full px-3 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-bella-700 mb-1">Foto do produto</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg bg-bella-50 border border-bella-200 overflow-hidden flex items-center justify-center">
                    {novo.foto ? (
                      <img src={novo.foto} alt="foto" className="w-full h-full object-cover" />
                    ) : (
                      <FiCamera className="w-6 h-6 text-bella-400" />
                    )}
                  </div>
                  <button onClick={onPickPhoto} className="px-3 py-2 border border-bella-200 rounded-lg hover:bg-bella-50 flex items-center gap-2">
                    <FiCamera /> Tirar/Escolher foto
                  </button>
                  <input type="file" accept="image/*;capture=camera" onChange={onPickProductPhoto} hidden ref={photoInputRef} />
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-bella-700 mb-1">Movimentação inicial</label>
                    <select
                      value={movTipo}
                      onChange={(e) => setMovTipo(e.target.value as any)}
                      className="w-full px-3 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                    >
                      <option value="entrada">Entrada</option>
                      <option value="saida">Saída</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bella-700 mb-1">Quantidade</label>
                    <input
                      type="number"
                      step="0.01"
                      value={movQtd}
                      onChange={(e) => setMovQtd(Number(e.target.value || 0))}
                      className="w-full px-3 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setModalNovoOpen(false)} className="flex-1 px-4 py-3 border border-bella-300 text-bella-700 rounded-lg hover:bg-bella-50">
                Cancelar
              </button>
              <button onClick={salvarNovoProduto} className="flex-1 bella-button flex items-center justify-center gap-2">
                <FiSave /> Salvar Produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}