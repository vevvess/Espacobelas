import React, { useEffect, useMemo, useState } from "react";
import { FiLink, FiDatabase, FiPlay, FiDownloadCloud, FiCheckCircle, FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import { useClientes } from "@/hooks/useClientes";
import { toast } from "@/hooks/use-toast";

type NotionDB = { id: string; title: string };
type NotionProp = { name: string; type: string };
type NotionClient = { id: string; name: string; phone: string; birthdate: string };

function normalizeNome(nome: string): string {
  return (nome || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatPhone(p: string): string {
  const n = (p || "").replace(/\D+/g, "");
  if (n.length === 11) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
  if (n.length === 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  if (n.length === 9) return `(81) ${n.slice(0, 5)}-${n.slice(5)}`;
  if (n.length === 8) return `(81) ${n.slice(0, 4)}-${n.slice(4)}`;
  return p;
}

export default function NotionConnect() {
  const { clientes, addCliente, editCliente, reload } = useClientes();
  const [status, setStatus] = useState<{ connected: boolean; meta?: any; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [databases, setDatabases] = useState<NotionDB[]>([]);
  const [selectedDb, setSelectedDb] = useState<string>("");
  const [props, setProps] = useState<NotionProp[]>([]);
  const [map, setMap] = useState<{ name: string; phone: string; birth: string }>({ name: "", phone: "", birth: "" });
  const [preview, setPreview] = useState<NotionClient[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/notion/status");
        const j = await r.json();
        setStatus(j);
      } catch (e: any) {
        setStatus({ connected: false, error: e?.message || String(e) });
      }
    })();
  }, []);

  const connected = !!status?.connected;

  async function refreshDatabases() {
    setLoading(true);
    try {
      const r = await fetch("/api/notion/search-databases");
      if (!r.ok) throw new Error(await r.text());
      const j = await r.json();
      setDatabases(j.items || []);
      toast({ title: "Notion", description: `Encontradas ${j.items?.length || 0} bases` });
    } catch (e: any) {
      toast({ title: "Erro ao listar bases", description: e?.message || String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function loadDatabaseProps(id: string) {
    if (!id) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/notion/database?id=${encodeURIComponent(id)}`);
      if (!r.ok) throw new Error(await r.text());
      const j = await r.json();
      const properties: NotionProp[] = j.properties || [];
      setProps(properties);

      // preselect guesses
      const nameProp = properties.find((p) => p.type === "title")?.name || "";
      const phoneProp =
        properties.find((p) => p.type === "phone_number")?.name ||
        properties.find((p) => p.type === "rich_text")?.name ||
        "";
      const birthProp = properties.find((p) => p.type === "date")?.name || "";
      setMap({ name: nameProp, phone: phoneProp, birth: birthProp });
      toast({ title: "Notion", description: `Propriedades carregadas (${properties.length})` });
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message || String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function doPreview() {
    if (!selectedDb || !map.name) {
      toast({ title: "Seleção incompleta", description: "Escolha a base e mapeie pelo menos o campo de Nome.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        dbid: selectedDb,
        name: map.name,
      });
      if (map.phone) qs.set("phone", map.phone);
      if (map.birth) qs.set("birth", map.birth);
      const r = await fetch(`/api/notion/clients?${qs.toString()}`);
      if (!r.ok) throw new Error(await r.text());
      const j = await r.json();
      setPreview(j.items || []);
      toast({ title: "Pré-visualização", description: `${j.total || (j.items?.length || 0)} clientes do Notion` });
    } catch (e: any) {
      toast({ title: "Erro na pré-visualização", description: e?.message || String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const existingByName = useMemo(() => {
    const map = new Map<string, any>();
    clientes.forEach((c: any) => map.set(normalizeNome(c.nome), c));
    return map;
  }, [clientes]);

  async function doImport() {
    if (!preview || preview.length === 0) return;

    setLoading(true);
    let created = 0;
    let updated = 0;
    try {
      for (const it of preview) {
        const nm = normalizeNome(it.name);
        const found = existingByName.get(nm);
        const phoneFmt = formatPhone(it.phone || "");
        const birthISO = it.birthdate || ""; // already ISO YYYY-MM-DD
        if (found) {
          const patch: any = {};
          if (phoneFmt && (!found.telefone || found.telefone.trim() === "")) patch.telefone = phoneFmt;
          if (birthISO && !found.data_nascimento) patch.data_nascimento = new Date(birthISO);
          if (Object.keys(patch).length > 0) {
            try {
              await editCliente(found.id, patch);
              updated++;
            } catch (e) {
              console.warn("Falha ao atualizar", found.id, e);
            }
          }
        } else {
          // create minimal record
          try {
            await addCliente({
              nome: it.name,
              telefone: phoneFmt || "",
              email: "",
              data_nascimento: birthISO ? new Date(birthISO) : undefined,
              endereco: "",
              observacoes: "",
              tipo_cliente: "normal",
            } as any);
            created++;
          } catch (e) {
            console.warn("Falha ao criar", it, e);
          }
        }
      }
      toast({
        title: "Importação concluída",
        description: `Criados: ${created} • Atualizados: ${updated}`,
      });
      await reload();
    } catch (e: any) {
      toast({ title: "Erro na importação", description: e?.message || String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (!status) {
    return (
      <div className="bella-card">
        <div className="flex items-center gap-2 text-bella-700">
          <FiRefreshCw className="animate-spin" />
          <span>Verificando conexão com Notion...</span>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="bella-card">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-bella-800">Conectar ao Notion</h3>
            <p className="text-sm text-bella-600">
              Conecte sua conta do Notion para importar sua base de clientes.
            </p>
          </div>
          <a
            href="/api/notion/start"
            className="bella-button inline-flex items-center gap-2"
            title="Conectar Notion"
          >
            <FiLink className="w-4 h-4" />
            Conectar
          </a>
        </div>
        {status.error && (
          <div className="mt-3 text-sm text-red-600">
            {status.error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bella-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-green-700">
          <FiCheckCircle />
          <div>
            <div className="font-semibold">Notion conectado</div>
            <div className="text-xs opacity-80">
              Workspace: {status.meta?.workspace_id || "—"}
            </div>
          </div>
        </div>
        <button
          onClick={refreshDatabases}
          disabled={loading}
          className="px-3 py-2 rounded-lg border border-bella-300 text-bella-700 hover:bg-bella-100 disabled:opacity-50 inline-flex items-center gap-2"
        >
          <FiDatabase className="w-4 h-4" />
          Listar Bases
        </button>
      </div>

      {/* Databases */}
      {databases.length > 0 && (
        <div className="grid gap-2">
          <label className="text-sm font-medium text-bella-700">Selecionar base de clientes</label>
          <select
            className="w-full p-2 border border-bella-200 rounded-lg"
            value={selectedDb}
            onChange={(e) => {
              setSelectedDb(e.target.value);
              setProps([]);
              setPreview(null);
              if (e.target.value) loadDatabaseProps(e.target.value);
            }}
          >
            <option value="">Selecione...</option>
            {databases.map((d) => (
              <option key={d.id} value={d.id}>{d.title} — {d.id.slice(0,8)}</option>
            ))}
          </select>
        </div>
      )}

      {/* Properties mapping */}
      {props.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-bella-700 mb-1">Campo de Nome (title)</label>
            <select
              className="w-full p-2 border border-bella-200 rounded-lg"
              value={map.name}
              onChange={(e) => setMap((m) => ({ ...m, name: e.target.value }))}
            >
              <option value="">Selecione...</option>
              {props.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} ({p.type})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-bella-700 mb-1">Campo Telefone</label>
            <select
              className="w-full p-2 border border-bella-200 rounded-lg"
              value={map.phone}
              onChange={(e) => setMap((m) => ({ ...m, phone: e.target.value }))}
            >
              <option value="">(opcional)</option>
              {props.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} ({p.type})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-bella-700 mb-1">Campo Aniversário (date)</label>
            <select
              className="w-full p-2 border border-bella-200 rounded-lg"
              value={map.birth}
              onChange={(e) => setMap((m) => ({ ...m, birth: e.target.value }))}
            >
              <option value="">(opcional)</option>
              {props.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} ({p.type})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Actions */}
      {selectedDb && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={doPreview}
            disabled={loading || !map.name}
            className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 inline-flex items-center gap-2"
          >
            <FiPlay className="w-4 h-4" />
            Pré-visualizar
          </button>
          {preview && preview.length > 0 && (
            <button
              onClick={doImport}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 inline-flex items-center gap-2"
            >
              <FiDownloadCloud className="w-4 h-4" />
              Importar/Atualizar ({preview.length})
            </button>
          )}
        </div>
      )}

      {/* Preview results */}
      {preview && (
        <div className="border border-bella-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-bella-800">Pré-visualização ({preview.length})</div>
            <div className="text-sm text-bella-600">Serão criados clientes não encontrados e atualizados telefone/aniversário dos existentes</div>
          </div>
          <div className="max-h-56 overflow-y-auto text-sm">
            {preview.slice(0, 50).map((c) => (
              <div key={c.id} className="py-1 border-b border-bella-100">
                <div className="font-medium text-bella-800">{c.name}</div>
                <div className="text-bella-600">
                  {c.phone ? `Tel: ${c.phone}` : "Tel: —"} • {c.birthdate ? `Aniv.: ${new Date(c.birthdate).toLocaleDateString("pt-BR")}` : "Aniv.: —"}
                </div>
              </div>
            ))}
            {preview.length > 50 && (
              <div className="text-xs text-bella-500 mt-2">... e mais {preview.length - 50} registros</div>
            )}
          </div>
          <div className="mt-2 text-yellow-700 text-sm flex items-center gap-2">
            <FiAlertTriangle />
            Revise os campos mapeados antes de importar.
          </div>
        </div>
      )}
    </div>
  );
}