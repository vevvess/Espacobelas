import React, { useState, useEffect } from "react";
import {
  FiFileText,
  FiSearch,
  FiUser,
  FiTag,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiX,
  FiCopy,
  FiDownload,
  FiCalendar,
  FiDollarSign,
  FiAlertCircle,
  FiStar,
  FiRepeat,
} from "react-icons/fi";
import { useAuth } from "../contexts/SimpleAuthContext";
import { useClientes } from "../hooks/useClientes";
import { useAgendamentosRealTimeOptimized } from "../hooks/useAgendamentosRealTimeOptimized";
import { useRegistrosAtendimento } from "../hooks/useRegistrosAtendimento";
import { toast } from "@/hooks/use-toast";
import { formatarAniversario, calcularIdade } from "../utils/dateFormatters";

interface Cliente {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  data_nascimento?: string;
  endereco?: string;
  observacoes?: string;
  created_at: string;
}

interface RegistroAtendimento {
  id: string;
  clienteId: string;
  clienteNome: string;
  profissional: string;
  servicos: string[];
  produtos: ProdutoUsado[];
  observacoes: string;
  observacoesImportantes: string;
  data: Date;
  valor: number;
  tags: string[];
  tempoProcesso: string;
  resultadoFinal: string;
  proximoRetorno?: Date;
}

interface ProdutoUsado {
  id: string;
  categoria: "tinta" | "descolorante" | "toner" | "tratamento" | "outros";
  marca: string;
  produto: string;
  cor?: string;
  volume?: string;
  quantidade: string;
  observacoes: string;
}

// Removido clientesMock - agora usando dados reais

const tagsDisponiveis = [
  { id: "vip", nome: "VIP", cor: "bg-purple-100 text-purple-800" },
  { id: "alergia", nome: "Alergia", cor: "bg-red-100 text-red-800" },
  { id: "promo", nome: "Promoção", cor: "bg-green-100 text-green-800" },
  { id: "primeira_vez", nome: "1ª Vez", cor: "bg-blue-100 text-blue-800" },
  { id: "retoque", nome: "Retoque", cor: "bg-yellow-100 text-yellow-800" },
  { id: "teste", nome: "Teste", cor: "bg-gray-100 text-gray-800" },
];

const marcasDisponiveis = [
  "Igora",
  "Schwarzkopf",
  "L'Oréal",
  "Wella",
  "Matrix",
  "Redken",
  "Alfaparf",
  "Framesi",
  "Outros",
];

const volumesOx = ["10 vol", "20 vol", "30 vol", "40 vol"];

export default function FichaCliente() {
  const { user } = useAuth();
  const { clientes, loading: clientesLoading } = useClientes();
  const { agendamentos, loading: agendamentosLoading } =
    useAgendamentosRealTimeOptimized();
  const {
    registros,
    addRegistro,
    updateRegistro,
    removeRegistro,
    getRegistrosByCliente,
    clearCustomRegistros,
  } = useRegistrosAtendimento();

  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(
    null,
  );
  const [showNovoRegistro, setShowNovoRegistro] = useState(false);
  const [registroEditando, setRegistroEditando] =
    useState<RegistroAtendimento | null>(null);
  const [busca, setBusca] = useState("");
  const [buscaCliente, setBuscaCliente] = useState("");

  // Estados para serviços personalizados
  const [servicosPersonalizados, setServicosPersonalizados] = useState<
    string[]
  >([]);
  const [novoServicoNome, setNovoServicoNome] = useState("");
  const [mostrarAdicionarServico, setMostrarAdicionarServico] = useState(false);

  // Verificar se cliente foi passado por URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const clienteId = urlParams.get("cliente");

    if (clienteId && clientes.length > 0) {
      const cliente = clientes.find((c) => c.id === clienteId);
      if (cliente) {
        setClienteSelecionado(cliente);
      }
    }
  }, [clientes]);

  // Formulário de novo registro
  const [novoRegistro, setNovoRegistro] = useState({
    servicos: [] as string[],
    produtos: [] as ProdutoUsado[],
    observacoes: "",
    observacoesImportantes: "",
    valor: 0 as number,
    tags: [] as string[],
    tempoProcesso: "",
    resultadoFinal: "",
    proximoRetorno: "",
  });

  // Produto sendo adicionado
  const [novoProduto, setNovoProduto] = useState({
    categoria: "tinta" as ProdutoUsado["categoria"],
    marca: "",
    produto: "",
    cor: "",
    volume: "",
    quantidade: "",
    observacoes: "",
  });

  const servicosBase = [
    "Coloração",
    "Luzes",
    "Reflexos",
    "Descoloração",
    "Toner",
    "Retoque de Raiz",
    "Escova Progressiva",
    "Botox Capilar",
    "Hidratação",
    "Reconstrução",
    "Cauterização",
    "Cronograma Capilar",
  ];

  // Combinar serviços base com serviços personalizados
  const servicosDisponiveis = [...servicosBase, ...servicosPersonalizados];

  // Registros agora são carregados automaticamente via hook integrado

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
      (cliente.telefone && cliente.telefone.includes(buscaCliente)) ||
      (cliente.email &&
        cliente.email.toLowerCase().includes(buscaCliente.toLowerCase())),
  );

  const registrosDoCliente = clienteSelecionado
    ? getRegistrosByCliente(clienteSelecionado.id)
    : [];

  const registrosFiltrados = registrosDoCliente.filter(
    (registro) =>
      registro.servicos.some((s) =>
        s.toLowerCase().includes(busca.toLowerCase()),
      ) ||
      registro.produtos.some(
        (p) =>
          p.marca.toLowerCase().includes(busca.toLowerCase()) ||
          p.produto.toLowerCase().includes(busca.toLowerCase()) ||
          (p.cor && p.cor.toLowerCase().includes(busca.toLowerCase())),
      ) ||
      registro.observacoes.toLowerCase().includes(busca.toLowerCase()),
  );

  const handleSelecionarCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setBuscaCliente("");
  };

  const handleAdicionarProduto = () => {
    if (!novoProduto.marca || !novoProduto.produto) {
      alert("Por favor, preencha marca e produto");
      return;
    }

    const produto: ProdutoUsado = {
      id: Date.now().toString(),
      categoria: novoProduto.categoria,
      marca: novoProduto.marca,
      produto: novoProduto.produto,
      cor: novoProduto.cor,
      volume: novoProduto.volume,
      quantidade: novoProduto.quantidade,
      observacoes: novoProduto.observacoes,
    };

    setNovoRegistro((prev) => ({
      ...prev,
      produtos: [...prev.produtos, produto],
    }));

    setNovoProduto({
      categoria: "tinta",
      marca: "",
      produto: "",
      cor: "",
      volume: "",
      quantidade: "",
      observacoes: "",
    });
  };

  const handleRemoverProduto = (produtoId: string) => {
    setNovoRegistro((prev) => ({
      ...prev,
      produtos: prev.produtos.filter((p) => p.id !== produtoId),
    }));
  };

  const handleToggleTag = (tagId: string) => {
    setNovoRegistro((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((t) => t !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  const handleToggleServico = (servico: string) => {
    setNovoRegistro((prev) => ({
      ...prev,
      servicos: prev.servicos.includes(servico)
        ? prev.servicos.filter((s) => s !== servico)
        : [...prev.servicos, servico],
    }));
  };

  const handleAdicionarServicoPersonalizado = () => {
    if (!novoServicoNome.trim()) {
      alert("Por favor, digite o nome do serviço");
      return;
    }

    const nomeServico = novoServicoNome.trim();

    // Verificar se já existe
    if (servicosDisponiveis.includes(nomeServico)) {
      alert("Este serviço já existe");
      return;
    }

    // Adicionar aos serviços personalizados
    setServicosPersonalizados((prev) => [...prev, nomeServico]);

    // Automaticamente selecionar o novo serviço
    setNovoRegistro((prev) => ({
      ...prev,
      servicos: [...prev.servicos, nomeServico],
    }));

    // Limpar e fechar
    setNovoServicoNome("");
    setMostrarAdicionarServico(false);
  };

  const handleRemoverServicoPersonalizado = (servicoNome: string) => {
    if (
      confirm(
        `Deseja remover o serviço "${servicoNome}"? Ele será removido de todos os registros.`,
      )
    ) {
      // Remover da lista de serviços personalizados
      setServicosPersonalizados((prev) =>
        prev.filter((s) => s !== servicoNome),
      );

      // Remover do registro atual se estiver selecionado
      setNovoRegistro((prev) => ({
        ...prev,
        servicos: prev.servicos.filter((s) => s !== servicoNome),
      }));
    }
  };

  const resetForm = () => {
    setNovoRegistro({
      servicos: [],
      produtos: [],
      observacoes: "",
      observacoesImportantes: "",
      valor: 0,
      tags: [],
      tempoProcesso: "",
      resultadoFinal: "",
      proximoRetorno: "",
    });
    setNovoProduto({
      categoria: "tinta",
      marca: "",
      produto: "",
      cor: "",
      volume: "",
      quantidade: "",
      observacoes: "",
    });
    setNovoServicoNome("");
    setMostrarAdicionarServico(false);
  };

  const handleSalvarRegistro = () => {
    if (!clienteSelecionado || novoRegistro.servicos.length === 0) {
      alert("Selecione um cliente e pelo menos um serviço");
      return;
    }

    if (registroEditando) {
      // Editando registro existente
      updateRegistro(registroEditando.id, {
        servicos: novoRegistro.servicos,
        produtos: novoRegistro.produtos,
        observacoes: novoRegistro.observacoes,
        observacoesImportantes: novoRegistro.observacoesImportantes,
        valor: novoRegistro.valor,
        tags: novoRegistro.tags,
        tempoProcesso: novoRegistro.tempoProcesso,
        resultadoFinal: novoRegistro.resultadoFinal,
        proximoRetorno: novoRegistro.proximoRetorno
          ? new Date(novoRegistro.proximoRetorno)
          : undefined,
      });
      setRegistroEditando(null);
      toast({
        title: "Registro atualizado",
        description: "O atendimento foi atualizado com sucesso",
      });
    } else {
      // Novo registro
      addRegistro({
        clienteId: clienteSelecionado.id,
        clienteNome: clienteSelecionado.nome,
        profissional: user?.nome || "Profissional",
        servicos: novoRegistro.servicos,
        produtos: novoRegistro.produtos,
        observacoes: novoRegistro.observacoes,
        observacoesImportantes: novoRegistro.observacoesImportantes,
        data: new Date(),
        valor: novoRegistro.valor,
        tags: novoRegistro.tags,
        tempoProcesso: novoRegistro.tempoProcesso,
        resultadoFinal: novoRegistro.resultadoFinal,
        proximoRetorno: novoRegistro.proximoRetorno
          ? new Date(novoRegistro.proximoRetorno)
          : undefined,
      });
      toast({
        title: "Atendimento salvo",
        description:
          "O novo atendimento foi salvo com sucesso e ficará permanente",
      });
    }

    setShowNovoRegistro(false);
    resetForm();
  };

  const handleEditarRegistro = (registro: RegistroAtendimento) => {
    setRegistroEditando(registro);
    setNovoRegistro({
      servicos: registro.servicos,
      produtos: registro.produtos,
      observacoes: registro.observacoes,
      observacoesImportantes: registro.observacoesImportantes,
      valor: Number(registro.valor) || 0,
      tags: registro.tags,
      tempoProcesso: registro.tempoProcesso,
      resultadoFinal: registro.resultadoFinal,
      proximoRetorno: registro.proximoRetorno
        ? registro.proximoRetorno.toISOString().split("T")[0]
        : "",
    });
    setShowNovoRegistro(true);
  };

  const handleRepetirAtendimento = (registro: RegistroAtendimento) => {
    setNovoRegistro({
      servicos: registro.servicos,
      produtos: registro.produtos.map((p) => ({
        ...p,
        id: Date.now() + Math.random().toString(),
      })),
      observacoes: `Repetindo procedimento de ${registro.data.toLocaleDateString("pt-BR")}`,
      observacoesImportantes: registro.observacoesImportantes,
      valor: Number(registro.valor) || 0,
      tags: registro.tags.filter((t) => t !== "primeira_vez"),
      tempoProcesso: registro.tempoProcesso,
      resultadoFinal: "",
      proximoRetorno: "",
    });
    setShowNovoRegistro(true);
  };

  const handleDeleteRegistro = (id: string) => {
    if (
      confirm(
        "Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.",
      )
    ) {
      removeRegistro(id);
    }
  };

  const handleExportarFicha = () => {
    if (!clienteSelecionado) return;

    const conteudo = `
ESPAÇO BELLA'S - FICHA DO CLIENTE
Cliente: ${clienteSelecionado.nome}
Telefone: ${clienteSelecionado.telefone}
Email: ${clienteSelecionado.email}

=== HISTÓRICO DE ATENDIMENTOS ===
${registrosDoCliente
  .map(
    (r) => `
DATA: ${r.data.toLocaleDateString("pt-BR")}
PROFISSIONAL: ${r.profissional}
SERVIÇOS: ${r.servicos.join(", ")}
PRODUTOS UTILIZADOS:
${r.produtos
  .map(
    (p) =>
      `- ${p.marca} ${p.produto}${p.cor ? ` ${p.cor}` : ""}${p.volume ? ` (${p.volume})` : ""} - ${p.quantidade}`,
  )
  .join("\n")}
TEMPO DE PROCESSO: ${r.tempoProcesso}
RESULTADO: ${r.resultadoFinal}
VALOR: R$ ${(Number(r.valor) || 0).toFixed(2)}
OBSERVA����ES: ${r.observacoes}
${r.observacoesImportantes ? `OBSERVAÇÕES IMPORTANTES: ${r.observacoesImportantes}` : ""}
TAGS: ${r.tags.map((t) => tagsDisponiveis.find((tag) => tag.id === t)?.nome).join(", ")}
${r.proximoRetorno ? `PRÓXIMO RETORNO: ${r.proximoRetorno.toLocaleDateString("pt-BR")}` : ""}
`,
  )
  .join("\n" + "=".repeat(50) + "\n")}

Ficha gerada em: ${new Date().toLocaleString("pt-BR")}
    `;

    // Simular download do PDF
    const blob = new Blob([conteudo], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ficha-${clienteSelecionado.nome.replace(/\s+/g, "-").toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert("Ficha exportada com sucesso!");
  };

  const handleCancelarModal = () => {
    setShowNovoRegistro(false);
    setRegistroEditando(null);
    resetForm();
  };

  const getTagInfo = (tagId: string) => {
    return tagsDisponiveis.find((t) => t.id === tagId);
  };

  const getCategoriaIcon = (categoria: ProdutoUsado["categoria"]) => {
    switch (categoria) {
      case "tinta":
        return "🎨";
      case "descolorante":
        return "⚡";
      case "toner":
        return "✨";
      case "tratamento":
        return "💧";
      default:
        return "📦";
    }
  };

  // Loading state
  if (clientesLoading || agendamentosLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-bella-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-bella-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bella-800">
            Ficha do Cliente
          </h1>
          <p className="text-bella-600">
            Histórico detalhado de atendimentos e fórmulas
          </p>
        </div>
        {clienteSelecionado && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowNovoRegistro(true)}
              className="bella-button flex items-center space-x-2"
            >
              <FiPlus className="w-4 h-4" />
              <span>Novo Atendimento</span>
            </button>
            <button
              onClick={handleExportarFicha}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <FiDownload className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* Busca de Cliente */}
      <div className="bella-card">
        <div className="flex flex-col space-y-4">
          <label className="block text-sm font-medium text-bella-700">
            Buscar Cliente
          </label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bella-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar cliente por nome, email ou telefone..."
              value={buscaCliente}
              onChange={(e) => setBuscaCliente(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
            />
          </div>

          {/* Lista de clientes filtrados */}
          {buscaCliente && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {clientesFiltrados.map((cliente) => (
                <button
                  key={cliente.id}
                  onClick={() => handleSelecionarCliente(cliente)}
                  className="w-full text-left p-3 bg-bella-50 hover:bg-bella-100 rounded-lg transition-colors"
                >
                  <div className="font-medium text-bella-800">
                    {cliente.nome}
                  </div>
                  <div className="text-sm text-bella-600">
                    {cliente.telefone || "Sem telefone"} •{" "}
                    {cliente.email || "Sem email"}
                  </div>
                </button>
              ))}

              {clientesFiltrados.length === 0 && (
                <p className="text-bella-600 text-center py-4">
                  Nenhum cliente encontrado
                </p>
              )}
            </div>
          )}

          {/* Cliente selecionado */}
          {clienteSelecionado && (
            <div className="p-4 bg-gradient-to-r from-bella-100 to-bella-50 rounded-lg border border-bella-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-bella-800">
                    {clienteSelecionado.nome}
                  </h3>
                  <p className="text-bella-600">
                    {clienteSelecionado.telefone || "Sem telefone"} •{" "}
                    {clienteSelecionado.email || "Sem email"}
                  </p>
                  <p className="text-sm text-bella-600 mt-1">
                    {registrosDoCliente.length} atendimento(s) registrado(s)
                  </p>
                </div>
                <button
                  onClick={() => setClienteSelecionado(null)}
                  className="p-2 text-bella-600 hover:bg-bella-200 rounded-lg"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Histórico do Cliente */}
      {clienteSelecionado && (
        <div className="bella-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-bella-800">
              Histórico de Atendimentos
            </h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bella-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar procedimentos..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500 focus:border-transparent"
                />
              </div>
              <span className="bg-bella-100 text-bella-700 text-sm font-medium px-3 py-1 rounded-full">
                {registrosFiltrados.length} registro(s)
              </span>

              {user?.is_admin &&
                registrosFiltrados.some((r) => r.id.startsWith("custom_")) && (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          "Deseja limpar todos os registros personalizados? Esta ação não pode ser desfeita.",
                        )
                      ) {
                        clearCustomRegistros();
                      }
                    }}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    title="Limpar registros personalizados"
                  >
                    Limpar Personalizados
                  </button>
                )}
            </div>
          </div>

          <div className="space-y-6">
            {registrosFiltrados.map((registro) => (
              <div
                key={registro.id}
                className="border border-bella-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 ${registro.id.startsWith("custom_") ? "bg-gradient-to-r from-blue-400 to-blue-300" : "bg-gradient-to-r from-bella-400 to-bella-300"} rounded-full flex items-center justify-center`}
                    >
                      <FiFileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-bella-800 text-lg">
                          {registro.data.toLocaleDateString("pt-BR")}
                        </h3>
                        {registro.id.startsWith("custom_") && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                            Personalizado
                          </span>
                        )}
                      </div>
                      <p className="text-bella-600">
                        por {registro.profissional}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRepetirAtendimento(registro)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Repetir Atendimento"
                    >
                      <FiRepeat className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditarRegistro(registro)}
                      className="p-2 text-bella-600 hover:bg-bella-100 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRegistro(registro.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tags */}
                {registro.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {registro.tags.map((tagId) => {
                      const tag = getTagInfo(tagId);
                      return tag ? (
                        <span
                          key={tagId}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${tag.cor}`}
                        >
                          {tag.nome}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}

                {/* Serviços */}
                <div className="mb-4">
                  <h4 className="font-medium text-bella-800 mb-2">Serviços:</h4>
                  <div className="flex flex-wrap gap-2">
                    {registro.servicos.map((servico, index) => (
                      <span
                        key={index}
                        className="bg-bella-100 text-bella-700 px-3 py-1 rounded-lg text-sm"
                      >
                        {servico}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Produtos */}
                {registro.produtos.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-bella-800 mb-2">
                      Fórmula/Produtos:
                    </h4>
                    <div className="space-y-2">
                      {registro.produtos.map((produto) => (
                        <div
                          key={produto.id}
                          className="bg-gray-50 p-3 rounded-lg"
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-lg">
                              {getCategoriaIcon(produto.categoria)}
                            </span>
                            <span className="font-medium text-gray-800">
                              {produto.marca} {produto.produto}
                              {produto.cor && ` - ${produto.cor}`}
                              {produto.volume && ` (${produto.volume})`}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>Quantidade:</strong> {produto.quantidade}
                            {produto.observacoes && (
                              <>
                                <br />
                                <strong>Obs:</strong> {produto.observacoes}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detalhes do procedimento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {registro.tempoProcesso && (
                    <div>
                      <h4 className="font-medium text-bella-800 mb-1">
                        Tempo de Processo:
                      </h4>
                      <p className="text-bella-600">{registro.tempoProcesso}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-green-600">
                      <FiDollarSign className="w-4 h-4" />
                      <span className="font-semibold">
                        R$ {(Number(registro.valor) || 0).toFixed(2)}
                      </span>
                    </div>

                    {registro.proximoRetorno && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <FiCalendar className="w-4 h-4" />
                        <span className="text-sm">
                          Retorno:{" "}
                          {registro.proximoRetorno.toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resultado */}
                {registro.resultadoFinal && (
                  <div className="mb-4">
                    <h4 className="font-medium text-bella-800 mb-1">
                      Resultado Final:
                    </h4>
                    <p className="text-bella-600">{registro.resultadoFinal}</p>
                  </div>
                )}

                {/* Observações */}
                {registro.observacoes && (
                  <div className="mb-4">
                    <h4 className="font-medium text-bella-800 mb-1">
                      Observações:
                    </h4>
                    <p className="text-bella-600">{registro.observacoes}</p>
                  </div>
                )}

                {/* Observações importantes */}
                {registro.observacoesImportantes && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <FiAlertCircle className="w-4 h-4 text-red-600" />
                      <h4 className="font-medium text-red-800">
                        Observações Importantes:
                      </h4>
                    </div>
                    <p className="text-red-700">
                      {registro.observacoesImportantes}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {registrosFiltrados.length === 0 && (
              <div className="text-center py-8">
                <FiFileText className="w-12 h-12 text-bella-300 mx-auto mb-4" />
                <p className="text-bella-600">
                  {busca
                    ? "Nenhum registro encontrado"
                    : "Nenhum atendimento registrado ainda"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Novo/Editar Registro */}
      {showNovoRegistro && clienteSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-bella-800">
                {registroEditando ? "Editar Atendimento" : "Novo Atendimento"}
              </h2>
              <button
                onClick={handleCancelarModal}
                className="p-2 text-bella-600 hover:bg-bella-100 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Informações do cliente */}
              <div className="bg-bella-50 p-4 rounded-lg">
                <h3 className="font-semibold text-bella-800 mb-1">
                  {clienteSelecionado.nome}
                </h3>
                <p className="text-bella-600 text-sm">
                  {clienteSelecionado.telefone} • {clienteSelecionado.email}
                </p>
              </div>

              {/* Serviços */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-bella-700">
                    Serviços Realizados *
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setMostrarAdicionarServico(!mostrarAdicionarServico)
                    }
                    className="px-3 py-1 text-sm bg-bella-500 text-white rounded-lg hover:bg-bella-600 transition-colors flex items-center space-x-1"
                  >
                    <FiPlus className="w-3 h-3" />
                    <span>Adicionar Serviço</span>
                  </button>
                </div>

                {/* Formulário para adicionar serviço personalizado */}
                {mostrarAdicionarServico && (
                  <div className="mb-3 p-3 bg-bella-50 border border-bella-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Nome do novo serviço..."
                        value={novoServicoNome}
                        onChange={(e) => setNovoServicoNome(e.target.value)}
                        className="flex-1 p-2 border border-bella-200 rounded focus:ring-2 focus:ring-bella-500"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleAdicionarServicoPersonalizado();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAdicionarServicoPersonalizado}
                        className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMostrarAdicionarServico(false);
                          setNovoServicoNome("");
                        }}
                        className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-bella-600 mt-1">
                      Digite o nome do serviço e pressione Enter ou clique no
                      botão +
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 border border-bella-200 rounded-lg max-h-48 overflow-y-auto">
                  {servicosBase.map((servico) => (
                    <label
                      key={servico}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-bella-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={novoRegistro.servicos.includes(servico)}
                        onChange={() => handleToggleServico(servico)}
                        className="w-4 h-4 text-bella-600 border-bella-300 rounded focus:ring-bella-500"
                      />
                      <span className="text-sm text-bella-800">{servico}</span>
                    </label>
                  ))}

                  {/* Serviços personalizados */}
                  {servicosPersonalizados.map((servico) => (
                    <div
                      key={servico}
                      className="flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-200"
                    >
                      <label className="flex items-center space-x-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={novoRegistro.servicos.includes(servico)}
                          onChange={() => handleToggleServico(servico)}
                          className="w-4 h-4 text-bella-600 border-bella-300 rounded focus:ring-bella-500"
                        />
                        <span className="text-sm text-blue-800 font-medium">
                          {servico}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoverServicoPersonalizado(servico)
                        }
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Remover serviço personalizado"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {servicosPersonalizados.length > 0 && (
                  <p className="text-xs text-blue-600 mt-2 flex items-center space-x-1">
                    <FiStar className="w-3 h-3" />
                    <span>
                      {servicosPersonalizados.length} serviço(s)
                      personalizado(s) criado(s)
                    </span>
                  </p>
                )}
              </div>

              {/* Produtos */}
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  Produtos/Fórmula Utilizada
                </label>

                {/* Adicionar produto */}
                <div className="border border-bella-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-bella-700 mb-3">
                    Adicionar Produto
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                    <select
                      value={novoProduto.categoria}
                      onChange={(e) =>
                        setNovoProduto((prev) => ({
                          ...prev,
                          categoria: e.target
                            .value as ProdutoUsado["categoria"],
                        }))
                      }
                      className="p-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                    >
                      <option value="tinta">Tinta</option>
                      <option value="descolorante">Descolorante</option>
                      <option value="toner">Toner</option>
                      <option value="tratamento">Tratamento</option>
                      <option value="outros">Outros</option>
                    </select>

                    <select
                      value={novoProduto.marca}
                      onChange={(e) =>
                        setNovoProduto((prev) => ({
                          ...prev,
                          marca: e.target.value,
                        }))
                      }
                      className="p-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                    >
                      <option value="">Selecione a marca</option>
                      {marcasDisponiveis.map((marca) => (
                        <option key={marca} value={marca}>
                          {marca}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Produto"
                      value={novoProduto.produto}
                      onChange={(e) =>
                        setNovoProduto((prev) => ({
                          ...prev,
                          produto: e.target.value,
                        }))
                      }
                      className="p-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                    />

                    <input
                      type="text"
                      placeholder="Cor/Tom"
                      value={novoProduto.cor}
                      onChange={(e) =>
                        setNovoProduto((prev) => ({
                          ...prev,
                          cor: e.target.value,
                        }))
                      }
                      className="p-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <select
                      value={novoProduto.volume}
                      onChange={(e) =>
                        setNovoProduto((prev) => ({
                          ...prev,
                          volume: e.target.value,
                        }))
                      }
                      className="p-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                    >
                      <option value="">Volume OX</option>
                      {volumesOx.map((vol) => (
                        <option key={vol} value={vol}>
                          {vol}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Quantidade (ex: 60ml + 60ml OX)"
                      value={novoProduto.quantidade}
                      onChange={(e) =>
                        setNovoProduto((prev) => ({
                          ...prev,
                          quantidade: e.target.value,
                        }))
                      }
                      className="p-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                    />

                    <input
                      type="text"
                      placeholder="Observações"
                      value={novoProduto.observacoes}
                      onChange={(e) =>
                        setNovoProduto((prev) => ({
                          ...prev,
                          observacoes: e.target.value,
                        }))
                      }
                      className="p-2 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                    />
                  </div>

                  <button
                    onClick={handleAdicionarProduto}
                    className="px-4 py-2 bg-bella-500 text-white rounded-lg hover:bg-bella-600 transition-colors"
                  >
                    Adicionar Produto
                  </button>
                </div>

                {/* Lista de produtos adicionados */}
                {novoRegistro.produtos.length > 0 && (
                  <div className="space-y-2">
                    {novoRegistro.produtos.map((produto) => (
                      <div
                        key={produto.id}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {getCategoriaIcon(produto.categoria)}
                          </span>
                          <div>
                            <span className="font-medium">
                              {produto.marca} {produto.produto}
                              {produto.cor && ` - ${produto.cor}`}
                              {produto.volume && ` (${produto.volume})`}
                            </span>
                            <div className="text-sm text-gray-600">
                              {produto.quantidade}
                              {produto.observacoes &&
                                ` - ${produto.observacoes}`}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoverProduto(produto.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Detalhes do procedimento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-bella-700 mb-2">
                    Tempo de Processo
                  </label>
                  <input
                    type="text"
                    placeholder="ex: 45 min + 20 min toner"
                    value={novoRegistro.tempoProcesso}
                    onChange={(e) =>
                      setNovoRegistro((prev) => ({
                        ...prev,
                        tempoProcesso: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-bella-700 mb-2">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={novoRegistro.valor}
                    onChange={(e) =>
                      setNovoRegistro((prev) => ({
                        ...prev,
                        valor: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                  />
                </div>
              </div>

              {/* Resultado e próximo retorno */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-bella-700 mb-2">
                    Resultado Final
                  </label>
                  <textarea
                    value={novoRegistro.resultadoFinal}
                    onChange={(e) =>
                      setNovoRegistro((prev) => ({
                        ...prev,
                        resultadoFinal: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                    rows={3}
                    placeholder="Descreva como ficou o resultado..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-bella-700 mb-2">
                    Próximo Retorno
                  </label>
                  <input
                    type="date"
                    value={novoRegistro.proximoRetorno}
                    onChange={(e) =>
                      setNovoRegistro((prev) => ({
                        ...prev,
                        proximoRetorno: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={novoRegistro.observacoes}
                  onChange={(e) =>
                    setNovoRegistro((prev) => ({
                      ...prev,
                      observacoes: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-bella-200 rounded-lg focus:ring-2 focus:ring-bella-500"
                  rows={3}
                  placeholder="Observações gerais sobre o atendimento..."
                />
              </div>

              {/* Observações importantes */}
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  <span className="flex items-center space-x-2">
                    <FiAlertCircle className="w-4 h-4 text-red-600" />
                    <span>Observações Importantes (Alergias, etc.)</span>
                  </span>
                </label>
                <textarea
                  value={novoRegistro.observacoesImportantes}
                  onChange={(e) =>
                    setNovoRegistro((prev) => ({
                      ...prev,
                      observacoesImportantes: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500"
                  rows={2}
                  placeholder="Informações críticas sobre alergias, preferências, etc..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {tagsDisponiveis.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleToggleTag(tag.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        novoRegistro.tags.includes(tag.id)
                          ? tag.cor
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {tag.nome}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botões */}
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelarModal}
                  className="flex-1 px-4 py-3 border border-bella-300 text-bella-700 rounded-lg hover:bg-bella-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarRegistro}
                  className="flex-1 bella-button"
                >
                  {registroEditando ? "Atualizar" : "Salvar"} Atendimento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
