(function () {
  // Fallback Preview — versão estabilizada
  // Objetivo: garantir que o preview estático abra SEM ERROS de sintaxe.
  // Depois reintroduziremos incrementos com segurança.

  window.__runFallbackPreview = function (root) {
    const css = `
      <style>
        :root {
          --bella-50:#fdf2f8; --bella-100:#fce7f3; --bella-200:#fbcfe8; --bella-300:#f9a8d4;
          --bella-400:#f472b6; --bella-500:#ec4899; --bella-600:#db2777; --bella-700:#be185d;
          --bella-800:#9d174d; --bella-900:#831843; --line:#f1e6ee;
        }
        html, body, #root { height: 100%; margin: 0; }
        *, *::before, *::after { box-sizing: border-box; }
        body { background:#fff; color:#0f172a; font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
        .topnav { display:flex; align-items:center; justify-content:space-between; gap:12px; position:sticky; top:0; padding:12px 10px; background:#fff; border-bottom:1px solid var(--line); }
        .menu, .shield { width:36px; height:36px; border-radius:10px; border:1px solid var(--line); display:grid; place-items:center; background:#fff; }
        .titlebar { font-weight:900; color:#9d174d; }
        .shell { max-width: 980px; margin: 0 auto; padding: 16px 14px 56px; }
        .drawer { position: fixed; inset: 0; display:none; background: rgba(15,23,42,.55); z-index: 30; }
        .drawer .panel { position:absolute; top:0; bottom:0; left:0; width:300px; background:#fff; border-right:1px solid var(--line); display:flex; flex-direction:column; }
        .brandbar { display:flex; align-items:center; justify-content:space-between; padding: 12px; background: linear-gradient(90deg, var(--bella-500), var(--bella-400)); color:#fff; }
        .navlist { padding: 12px; display:grid; gap:8px; }
        .item { display:flex; align-items:center; gap:10px; text-decoration:none; color:#9d174d; padding:10px; border:1px solid var(--line); border-radius:12px; background:#fff; }
        .item.active { border-color:#f3a1c8; box-shadow: 0 6px 20px rgba(173,24,94,.10); }
        .section { padding:14px; border:1px solid var(--line); border-radius:18px; background:#fff; box-shadow: 0 10px 30px rgba(173,24,94,.06); margin:14px 0; }
        .hero { padding: 18px 4px 10px; }
        .hero h1 { margin:0 0 6px; font-size:28px; color:#9d174d; font-weight:900; }
        .hero p { margin:0; color:#9d3a69; font-weight:600; }
        .btn { border-radius:12px; padding:10px 14px; border:1px solid var(--line); background:#fff; color:#9d174d; font-weight:900; }
        .btn.primary { background: linear-gradient(90deg, var(--bella-500), var(--bella-400)); color:#fff; border:0; }
        .badge{ display:inline-block; padding:6px 10px; border-radius:999px; font-weight:800; background:#fdf2f8; color:#9d174d; border:1px solid #f3c6d9; }
        .list-table{ width:100%; border-collapse:separate; border-spacing:0 8px; }
        .list-table th{ text-align:left; color:#9d174d; font-size:12px; }
        .list-table td{ background:#fff; border:1px solid var(--line); padding:10px; border-radius:10px; }
        .muted { color:#6b7280; }
        .right { text-align:right; }
        .modals { position: fixed; inset: 0; display:none; align-items:center; justify-content:center; background: rgba(15,23,42,.45); padding: 16px; z-index:40; }
        .modal { width: min(92vw, 520px); max-width: 520px; background: #fff; border-radius: 16px; border:1px solid var(--line); padding: 16px; max-height: calc(100dvh - 24px); overflow: auto; }
        .modal h3 { margin: 0 0 12px; font-weight:900; color:#9d174d; }
        .field { display:grid; gap:6px; margin-bottom: 10px; }
        .field label { font-size: 13px; color: #334155; font-weight: 700; }
        .field input, .field select { border:1px solid var(--line); border-radius: 10px; padding: 10px; font-family: inherit; font-weight:700; color:#9d174d; }
        @media(max-width:640px){ .list-table{ display:block; overflow-x:auto; -webkit-overflow-scrolling:touch; min-width:720px; } .list-table th, .list-table td{ white-space:nowrap; } }
      </style>
    `;

    const layout = `
      ${css}
      <div class="topnav">
        <button class="menu" id="menuBtn" title="Menu">☰</button>
        <div class="titlebar" id="titlebar">Dashboard</div>
        <div class="shield" id="accBtn" title="Conta">👤</div>
      </div>

      <div class="drawer" id="drawer">
        <div class="panel">
          <div class="brandbar">
            <div style="font-weight:900;">Espaço Bella's</div>
            <button class="btn" id="drawerClose" style="border:1px solid rgba(255,255,255,.5); color:#fff; background:transparent;">Fechar</button>
          </div>
          <nav class="navlist">
            <a class="item" href="#/dashboard" data-link="/dashboard">🏠 Dashboard</a>
            <a class="item" href="#/agenda" data-link="/agenda">📅 Agenda</a>
            <a class="item" href="#/servicos" data-link="/servicos">⚙️ Serviços</a>
            <a class="item" href="#/caixa" data-link="/caixa">💵 Caixa</a>
            <a class="item" href="#/estoque" data-link="/estoque">📦 Estoque</a>
          </nav>
        </div>
      </div>

      <div class="shell"><div id="page"></div></div>

      <div class="modals" id="modals"><div class="modal"></div></div>
    `;

    // Pages (mínimo viável e estável)
    const Dashboard = () => `
      <div class="hero"><h1>Dashboard</h1><p>Preview estático carregado com sucesso.</p></div>
      <section class="section">
        <div class="muted">Use o menu para acessar Agenda, Serviços e Caixa. Este preview não depende do Vercel.</div>
      </section>
    `;

    const Agenda = () => `
      <div class="hero"><h1>Agenda</h1><p>Versão estável do preview (em breve funcionalidades completas).</p></div>
      <section class="section">
        <div class="muted">A agenda do preview foi temporariamente simplificada para garantir que o app abra sem erros. As funções avançadas voltarão na próxima rodada.</div>
      </section>
    `;

    const Servicos = () => `
      <div class="hero"><h1>Serviços</h1><p>Catálogo local (somente leitura no preview seguro).</p></div>
      <section class="section">
        <div class="muted">Lista exibida com base em defaults salvos no navegador.</div>
        <div id="svcList"></div>
      </section>
    `;

    const Estoque = () => `
      <div class="hero"><h1>Estoque</h1><p>Em estabilização no preview.</p></div>
      <section class="section">
        <div class="muted">As funções de estoque permanecerão desativadas aqui no preview até concluirmos a revalidação.</div>
      </section>
    `;

    const Caixa = () => `
      <div class="hero"><h1>Caixa</h1><p>Preview estático seguro — dados no navegador (localStorage)</p></div>
      <section class="section" id="cxFilters">
        <div class="field">
          <label>Data</label>
          <input type="date" id="cxDate">
        </div>
        <div class="field">
          <label>Dinheiro em Caixa (Informado)</label>
          <input type="number" id="cxDinheiro" step="0.01" min="0">
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;">
          <button class="btn primary" id="btnAtendimento">+ Atendimento Manual</button>
          <button class="btn" id="btnDespesa">+ Despesa</button>
        </div>
      </section>
      <section class="section" id="cxCards"></section>
      <section class="section" id="cxAtts"></section>
      <section class="section" id="cxDeps"></section>
    `;

    const routes = {
      "/dashboard": { title: "Dashboard", view: Dashboard },
      "/agenda": { title: "Agenda", view: Agenda },
      "/servicos": { title: "Serviços", view: Servicos },
      "/caixa": { title: "Caixa", view: Caixa },
      "/estoque": { title: "Estoque", view: Estoque },
    };

    // Mount
    root.innerHTML = layout;
    const $ = (sel) => document.querySelector(sel);
    const page = $("#page");
    const titlebar = $("#titlebar");
    const drawer = $("#drawer");
    $("#menuBtn").addEventListener("click", () => (drawer.style.display = "block"));
    $("#drawerClose").addEventListener("click", () => (drawer.style.display = "none"));
    drawer.addEventListener("click", (e) => { if (e.target === drawer) drawer.style.display = "none"; });

    function setActive(hash) {
      drawer.querySelectorAll("a[data-link]").forEach(a => {
        a.classList.toggle("active", a.getAttribute("data-link") === hash);
      });
    }

    function renderRoute() {
      const hash = location.hash.replace("#", "") || "/dashboard";
      const route = routes[hash] || routes["/dashboard"];
      titlebar.textContent = route.title;
      page.innerHTML = route.view();
      setActive(hash);

      if (hash === "/servicos") {
        // defaults simples de serviços
        const items = [
          { nome: "Alongamento em Acrigel", dur: 150, preco: 150 },
          { nome: "Corte Feminino", dur: 40, preco: 40 },
          { nome: "Coloração", dur: 90, preco: 120 },
        ];
        const el = document.createElement("div");
        el.innerHTML = `
          <table class="list-table">
            <thead><tr><th>Serviço</th><th>Duração</th><th class="right">Preço</th></tr></thead>
            <tbody>
              ${items.map(s => `<tr><td>${s.nome}</td><td>${s.dur}min</td><td class="right">R$ ${s.preco.toFixed(2)}</td></tr>`).join("")}
            </tbody>
          </table>
        `;
        page.querySelector("#svcList").appendChild(el);
      }

      if (hash === "/caixa") {
        // Caixa — implementação segura
        const storageKey = "bella_caixa_v1";
        const todayYMD = (() => {
          const t = new Date(); const y = t.getFullYear();
          const m = String(t.getMonth()+1).padStart(2,"0");
          const d = String(t.getDate()).padStart(2,"0");
          return `${y}-${m}-${d}`;
        })();
        let selectedDate = localStorage.getItem("bella_caixa_selected_date") || todayYMD;
        function money(n){ return (Number(n)||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }
        function fmtBR(ymd){ const [y,m,d]=ymd.split("-"); return `${d}/${m}/${y}`; }
        function getStore(){ try{ return JSON.parse(localStorage.getItem(storageKey)||'{"days":{}}'); }catch{ return {days:{}}; } }
        function setStore(s){ localStorage.setItem(storageKey, JSON.stringify(s)); }
        function getDay(store, ymd){
          if (!store.days[ymd]) store.days[ymd] = { atendimentos: [], despesas: [], dinheiroInformado: 0 };
          return store.days[ymd];
        }
        function snapshot(ymd){
          const store = getStore(); const day = getDay(store, ymd);
          let totalPix=0,totalCartao=0,totalDinheiro=0,totalDebitos=0;
          (day.atendimentos||[]).forEach(a=>{
            if (Array.isArray(a.servicos) && a.servicos.length){
              a.servicos.forEach(sv=>{
                const v=Number(sv.valor)||0; const p=sv.pagamento||a.pagamento;
                if (p==="pix") totalPix+=v; else if (p==="cartao") totalCartao+=v; else if (p==="dinheiro") totalDinheiro+=v; else if (p==="mensal") totalDebitos+=v;
              });
            } else {
              const v=Number(a.valor)||0; const p=a.pagamento;
              if (p==="pix") totalPix+=v; else if (p==="cartao") totalCartao+=v; else if (p==="dinheiro") totalDinheiro+=v; else if (p==="mensal") totalDebitos+=v;
            }
          });
          let totalDespesas=0,totalDespesasCaixa=0;
          (day.despesas||[]).forEach(d=>{ const v=Number(d.valor)||0; totalDespesas+=v; if (d.origem==="caixa") totalDespesasCaixa+=v; });
          const entradas = totalPix + totalCartao + totalDinheiro;
          const dinheiroInformado = Number(day.dinheiroInformado||0);
          const dinheiroCalculado = dinheiroInformado + totalDinheiro - totalDespesasCaixa;
          return { store, day, entradas, totalPix, totalCartao, totalDinheiro, totalDebitos, totalDespesas, totalDespesasCaixa, dinheiroInformado, dinheiroCalculado };
        }
        function payBadge(att){
          const pays = (att.servicos||[]).map(s=>s.pagamento).filter(Boolean);
          let lab = att.pagamento || ""; if (pays.length){ const u=[...new Set(pays)]; lab = u.length===1 ? u[0] : "misto"; }
          const style = 'class="badge"';
          if (lab==="pix") return `<span ${style}>pix</span>`;
          if (lab==="cartao") return `<span ${style}>cartao</span>`;
          if (lab==="dinheiro") return `<span ${style}>dinheiro</span>`;
          if (lab==="mensal") return `<span ${style}>mensal</span>`;
          return `<span ${style}>misto</span>`;
        }

        function render(){
          const s = snapshot(selectedDate);
          // filtros
          const f = page.querySelector("#cxFilters");
          if (f){
            f.querySelector("#cxDate").value = selectedDate;
            f.querySelector("#cxDinheiro").value = s.dinheiroInformado;
          }
          // cards
          const cards = page.querySelector("#cxCards");
          cards.innerHTML = `
            <div style="display:grid;gap:12px;grid-template-columns:repeat(3,minmax(0,1fr));">
              <div class="section"><div class="muted">Data</div><div style="font-weight:900;">${fmtBR(selectedDate)}</div></div>
              <div class="section"><div class="muted">Entradas</div><div style="font-weight:900;">${money(s.entradas)}</div></div>
              <div class="section"><div class="muted">Dinheiro (Calc)</div><div style="font-weight:900;">${money(s.dinheiroCalculado)}</div></div>
            </div>
          `;
          // atendimentos
          const atts = page.querySelector("#cxAtts");
          const listA = (s.day.atendimentos||[]);
          atts.innerHTML = `
            <h2 style="margin:0 0 10px;">Atendimentos — ${fmtBR(selectedDate)}</h2>
            ${
              listA.length ? `
              <table class="list-table">
                <thead><tr><th>Cliente</th><th>Serviços</th><th class="right">Total</th><th>Pagamento</th><th>Ações</th></tr></thead>
                <tbody>
                  ${listA.map(a=>`
                    <tr>
                      <td>${a.cliente||"-"}</td>
                      <td>${(a.servicos||[]).map(sv=>sv.nome).join(", ")||a.servico||"-"}</td>
                      <td class="right">${money(a.valor)}</td>
                      <td>${payBadge(a)}</td>
                      <td>
                        <button class="btn" data-edit-att="${a.id}">Editar</button>
                        <button class="btn" data-del-att="${a.id}">Excluir</button>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>` : `<div class="muted">Sem atendimentos</div>`
            }
          `;
          // despesas
          const deps = page.querySelector("#cxDeps");
          const listD = (s.day.despesas||[]);
          deps.innerHTML = `
            <h2 style="margin:0 0 10px;">Despesas</h2>
            ${
              listD.length ? `
              <table class="list-table">
                <thead><tr><th>Descrição</th><th>Origem</th><th class="right">Valor</th><th>Ações</th></tr></thead>
                <tbody>
                  ${listD.map(d=>`
                    <tr>
                      <td>${d.descricao||"-"}</td>
                      <td>${d.origem==="caixa"?"Retirada do Caixa":"Outro"}</td>
                      <td class="right">${money(d.valor)}</td>
                      <td>
                        <button class="btn" data-edit-dep="${d.id}">Editar</button>
                        <button class="btn" data-del-dep="${d.id}">Excluir</button>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>` : `<div class="muted">Nenhuma despesa</div>`
            }
          `;

          // binds (editar/excluir)
          page.querySelectorAll("[data-del-att]").forEach(b=>{
            b.addEventListener("click", ()=>{
              const id = b.getAttribute("data-del-att");
              const store = getStore(); const day = getDay(store, selectedDate);
              day.atendimentos = (day.atendimentos||[]).filter(a=>String(a.id)!==String(id));
              setStore(store); render();
            });
          });
          page.querySelectorAll("[data-edit-att]").forEach(b=>{
            b.addEventListener("click", ()=>{
              const id = b.getAttribute("data-edit-att");
              const store = getStore(); const day = getDay(store, selectedDate);
              const it = (day.atendimentos||[]).find(a=>String(a.id)===String(id));
              showAttModal(it);
            });
          });
          page.querySelectorAll("[data-del-dep]").forEach(b=>{
            b.addEventListener("click", ()=>{
              const id = b.getAttribute("data-del-dep");
              const store = getStore(); const day = getDay(store, selectedDate);
              day.despesas = (day.despesas||[]).filter(a=>String(a.id)!==String(id));
              setStore(store); render();
            });
          });
          page.querySelectorAll("[data-edit-dep]").forEach(b=>{
            b.addEventListener("click", ()=>{
              const id = b.getAttribute("data-edit-dep");
              const store = getStore(); const day = getDay(store, selectedDate);
              const it = (day.despesas||[]).find(a=>String(a.id)===String(id));
              showDepModal(it);
            });
          });
        }

        // filtros
        const dateInput = page.querySelector("#cxDate");
        const moneyInput = page.querySelector("#cxDinheiro");
        dateInput.value = selectedDate;
        dateInput.addEventListener("change",(e)=>{
          selectedDate = e.target.value || selectedDate;
          localStorage.setItem("bella_caixa_selected_date", selectedDate);
          render();
        });
        moneyInput.addEventListener("change",(e)=>{
          const v = parseFloat(e.target.value||"0")||0;
          const s = getStore(); const day = getDay(s, selectedDate);
          day.dinheiroInformado = v; setStore(s); render();
        });

        // ações
        page.querySelector("#btnAtendimento").addEventListener("click", ()=> showAttModal());
        page.querySelector("#btnDespesa").addEventListener("click", ()=> showDepModal());

        function showAttModal(existing){
          const modals = $("#modals"); const modal = modals.querySelector(".modal");
          const it = existing ? { ...existing } : {
            id: "att-" + Date.now(), cliente: "", pagamento: "dinheiro", valor: 0, servicos: [{ nome:"", valor:0, pagamento:"dinheiro" }], obs:""
          };
          modal.innerHTML = `
            <h3>${existing ? "Editar Atendimento" : "Novo Atendimento"}</h3>
            <div class="field"><label>Cliente *</label><input id="fCli" value="${it.cliente||""}"></div>
            <div class="field"><label>Serviço</label><input id="fServ" value="${(it.servicos&&it.servicos[0]?.nome)||""}" placeholder="Ex.: Corte + Escova"></div>
            <div class="field"><label>Valor (R$)</label><input id="fVal" type="number" step="0.01" min="0" value="${Number(it.valor||0).toFixed(2)}"></div>
            <div class="field">
              <label>Pagamento</label>
              <select id="fPay">
                <option value="dinheiro" ${it.pagamento==="dinheiro"?"selected":""}>Dinheiro</option>
                <option value="pix" ${it.pagamento==="pix"?"selected":""}>PIX</option>
                <option value="cartao" ${it.pagamento==="cartao"?"selected":""}>Cartão</option>
                <option value="mensal" ${it.pagamento==="mensal"?"selected":""}>Mensal</option>
              </select>
            </div>
            <div class="field"><label>Observação</label><input id="fObs" value="${it.obs||""}" placeholder="Opcional"></div>
            <div style="display:flex;justify-content:flex-end;gap:8px;">
              <button class="btn" data-close>Cancelar</button>
              <button class="btn primary" id="fSave">Salvar</button>
            </div>
          `;
          modals.style.display = "flex";
          modal.addEventListener("click", (e)=>{ if (e.target.hasAttribute("data-close")) modals.style.display = "none"; }, { once:true });
          modal.querySelector("#fSave").addEventListener("click", ()=>{
            const store = getStore(); const day = getDay(store, selectedDate);
            const cliente = modal.querySelector("#fCli").value.trim();
            const serv = modal.querySelector("#fServ").value.trim();
            const valor = parseFloat(modal.querySelector("#fVal").value||"0")||0;
            const pagamento = modal.querySelector("#fPay").value || "dinheiro";
            const obs = modal.querySelector("#fObs").value.trim();
            const rec = {
              id: it.id, data: selectedDate, cliente, pagamento, valor,
              servicos: [{ nome: serv, valor, pagamento }], obs
            };
            if (existing){
              const idx = (day.atendimentos||[]).findIndex(a=>String(a.id)===String(it.id));
              if (idx>=0) day.atendimentos[idx] = rec; else day.atendimentos.push(rec);
            } else {
              day.atendimentos.push(rec);
            }
            setStore(store); modals.style.display = "none"; render();
          });
        }

        function showDepModal(existing){
          const modals = $("#modals"); const modal = modals.querySelector(".modal");
          const it = existing ? { ...existing } : { id: "dep-" + Date.now(), descricao:"", valor:0, origem:"caixa" };
          modal.innerHTML = `
            <h3>${existing ? "Editar Despesa" : "Nova Despesa"}</h3>
            <div class="field"><label>Descrição</label><input id="dDesc" value="${it.descricao||""}" placeholder="Ex.: Compra de produtos"></div>
            <div class="field"><label>Valor</label><input id="dVal" type="number" step="0.01" min="0" value="${Number(it.valor||0).toFixed(2)}"></div>
            <div class="field">
              <label>Origem</label>
              <select id="dOri">
                <option value="caixa" ${it.origem==="caixa"?"selected":""}>Retirar do caixa</option>
                <option value="outro" ${it.origem==="outro"?"selected":""}>Outro</option>
              </select>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:8px;">
              <button class="btn" data-close>Cancelar</button>
              <button class="btn primary" id="dSave">Salvar</button>
            </div>
          `;
          modals.style.display = "flex";
          modal.addEventListener("click", (e)=>{ if (e.target.hasAttribute("data-close")) modals.style.display = "none"; }, { once:true });
          modal.querySelector("#dSave").addEventListener("click", ()=>{
            const store = getStore(); const day = getDay(store, selectedDate);
            const descricao = modal.querySelector("#dDesc").value.trim();
            const valor = parseFloat(modal.querySelector("#dVal").value||"0")||0;
            const origem = modal.querySelector("#dOri").value || "caixa";
            if (existing){
              const idx = (day.despesas||[]).findIndex(a=>String(a.id)===String(it.id));
              if (idx>=0) day.despesas[idx] = { ...it, descricao, valor, origem }; else day.despesas.push({ ...it, descricao, valor, origem });
            } else {
              day.despesas.push({ id: it.id, data: selectedDate, descricao, valor, origem });
            }
            setStore(store); modals.style.display = "none"; render();
          });
        }

        render();
      }
    }

    window.addEventListener("hashchange", renderRoute);
    renderRoute();
  };
})();
        let agSelected = localStorage.getItem(AG_SEL_KEY) || todayYMD_ag;

        function ymdFromISO(iso) { try { const d = new Date(iso); const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,"0"); const dd=String(d.getDate()).padStart(2,"0"); return `${y}-${m}-${dd}`; } catch { return ""; } }
        function brFromYMD(ymd) { const [y,m,d] = String(ymd||"").split("-"); return `${d}/${m}/${y}`; }
        function fmtHM(iso) { try { const d = new Date(iso); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; } catch { return ""; } }

        function updateKpisForDay(list) {
          const items = page.querySelectorAll(".kpi-mini .item");
          if (!items || !items.length) return;
          const total = list.length;
          const scheduled = list.filter(it => (it.status || "scheduled") === "scheduled").length;
          const inProg = list.filter(it => (it.status || "scheduled") === "in_progress").length;
          const done = list.filter(it => (it.status || "scheduled") === "done").length;
          try {
            items[0].querySelector(".title").textContent = `Hoje (${brFromYMD(agSelected)})`;
            items[0].querySelector(".val").textContent = String(total);
            items[1].querySelector(".val").textContent = String(scheduled);
            items[2].querySelector(".val").textContent = String(inProg);
            items[3].querySelector(".val").textContent = String(done);
          } catch {}
        }

        function showApptViewModal(appt) {
          const modals = document.getElementById("modals");
          const modal = modals.querySelector(".modal");
          const money = (n) => (Number(n)||0).toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
          const svs = (appt.servicos||[]).map(s=>`• ${s.nome} — ${s.duracao_min}min — ${money(s.preco)}`).join("<br>");
          modal.innerHTML = `
            <h3>Agendamento</h3>
            <div class="field"><label>Cliente</label><input value="${appt.cliente || "-"}" readonly></div>
            <div class="field"><label>Telefone</label><input value="${appt.telefone || ""}" readonly></div>
            <div class="field"><label>Início</label><input value="${new Date(appt.inicio).toLocaleString("pt-BR")}" readonly></div>
            <div class="field"><label>Fim</label><input value="${new Date(appt.fim).toLocaleString("pt-BR")}" readonly></div>
            <div class="field"><label>Serviços</label><div class="muted">${svs || "-"}</div></div>
            <div class="field"><label>Total</label><input value="${money(appt.total)}" readonly></div>
            <div style="display:flex; justify-content:flex-end;"><button class="btn" data-close>Fechar</button></div>
          `;
          modals.style.display = "flex";
          modal.addEventListener("click", (e) => { if (e.target.hasAttribute("data-close")) modals.style.display = "none"; }, { once: true });
          document.addEventListener("keydown", (e) => { if (e.key === "Escape") modals.style.display = "none"; }, { once: true });
        }
        function syncToCaixa(appt) {
          try {
            const CAIXA_KEY = "bella
          const listEl = page.querySelector("#agList");
          if (!listEl) return;

          // bind controls once
          const dayTitle = page.querySelector("#agDayTitle");
          if (dayTitle) dayTitle.textContent = brFromYMD(agSelected);

          const dateInput = page.querySelector("#agDateInput");
          if (dateInput && !dateInput.__agBound) {
            dateInput.__agBound = true;
            dateInput.value = agSelected;
            dateInput.addEventListener("change", (e) => {
              agSelected = e.target.value || agSelected;
              localStorage.setItem(AG_SEL_KEY, agSelected);
              renderAgendaList();
            });
          }
          const prevBtn = page.querySelector("#agPrev");
          if (prevBtn && !prevBtn.__agBound) {
            prevBtn.__agBound = true;
            prevBtn.addEventListener("click", () => {
              const d = new Date(agSelected + "T00:00:00");
              d.setDate(d.getDate() - 1);
              const ymd = d.toISOString().slice(0,10);
              agSelected = ymd;
              localStorage.setItem(AG_SEL_KEY, ymd);
              const di = page.querySelector("#agDateInput"); if (di) di.value = ymd;
              renderAgendaList();
            });
          }
          const nextBtn = page.querySelector("#agNext");
          if (nextBtn && !nextBtn.__agBound) {
            nextBtn.__agBound = true;
            nextBtn.addEventListener("click", () => {
              const d = new Date(agSelected + "T00:00:00");
              d.setDate(d.getDate() + 1);
              const ymd = d.toISOString().slice(0,10);
              agSelected = ymd;
              localStorage.setItem(AG_SEL_KEY, ymd);
              const di = page.querySelector("#agDateInput"); if (di) di.value = ymd;
              renderAgendaList();
            });
          }
          const statusSel = page.querySelector("#agStatus");
          if (statusSel && !statusSel.__agBound) {
            statusSel.__agBound = true;
            statusSel.addEventListener("change", () => renderAgendaList());
          }

          const ag = getAgenda();
          const all = (ag.items || []).filter(it => ymdFromISO(it.inicio) === agSelected);
          updateKpisForDay(all);

          let list = all.slice().sort((a,b) => new Date(a.inicio) - new Date(b.inicio));
          const stFilter = (statusSel && statusSel.value) || "all";
          if (stFilter !== "all") list = list.filter(it => (it.status || "scheduled") === stFilter);

          const money = (n) => (Number(n)||0).toLocaleString("pt-BR", { style:"currency", currency:"BRL" });

          listEl.innerHTML = list.map(a => {
            const st = a.status || "scheduled";
            const cls = st === "in_progress" ? "in-progress" : (st === "done" ? "scheduled" : "scheduled");
            let pct = 0;
            try {
              if (st === "in_progress") {
                const start = new Date(a.inicio).getTime();
                const end = new Date(a.fim).getTime();
                pct = Math.max(0, Math.min(100, Math.round(((Date.now() - start)/(end - start))*100)));
              }
            } catch {}
            const services = (a.servicos||[]).map(s => `${s.nome} — ${s.duracao_min}min — ${money(s.preco)}`).join(" • ");
            return `
              <article class="appt ${cls}" data-id="${a.id}">
                ${st==="in_progress" ? `<div class="progress-fill" style="width:${pct}%"></div>` : ``}
                <div class="inner">
                  <div>
                    <div class="header">
                      <div class="ava">${(a.cliente || "?").slice(0,1).toUpperCase()}</div>
                      <div style="flex:1;">
                        <div class="name">${a.cliente || "-"}</div>
                      </div>
                      <span class="status ${st==="in_progress" ? "" : (st==="scheduled" ? "scheduled" : "scheduled")}">${st==="scheduled"?"Agendado":(st==="in_progress"?"Em Andamento":"Concluído")}</span>
                    </div>
                    <div class="row">
                      <svg class="icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#a1125b" stroke-width="1.8"/><path d="M12 8v5l3 2" stroke="#a1125b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      ${fmtHM(a.inicio)} – ${fmtHM(a.fim)}
                    </div>
                    ${a.telefone ? `<div class="row"><svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M22 16.92V21a1 1 0 0 1-1.09 1c-9.4-.5-17-8.1-17.5-17.5A1 1 0 0 1 4 3h4.09A1 1 0 0 1 9 3.91l1.2 3a1 1 0 0 1-.27 1.11L8.9 9.3a16 16 0 0 0 6.8 6.8l1.28-1.05a1 1 0 0 1 1.11-.27l3 1.2a1 1 0 0 1 .91.99z" stroke="#a1125b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> ${a.telefone}</div>` : ``}
                    <div class="section-title">Serviços:</div>
                    <div class="chip-box">
                      <div class="chip-sub">🧾 ${services || "-"}</div>
                      <strong>${money(a.total || 0)}</strong>
                    </div>
                  </div>
                  <div class="actions">
                    <button class="btn-outline" data-act="view" title="Ver">👁️</button>
                    <button class="btn-outline" data-act="edit" title="Editar">✏️</button>
                    ${st==="scheduled" ? `<button class="btn-outline" data-act="start" title="Iniciar">▶️</button>` : ``}
                    ${st!=="done" ? `<button class="btn-outline" data-act="done" title="Concluir">✔️</button>` : ``}
                    <button class="btn-outline" data-act="del" title="Excluir">🗑️</button>
                  </div>
                </div>
              </article>
            `;
          }).join("") || `<div class="empty">Nenhum agendamento para este dia</div>`;

          listEl.querySelectorAll(".appt .btn-outline").forEach(btn => {
            const card = btn.closest(".appt");
            const id = card?.getAttribute("data-id");
            const act = btn.getAttribute("data-act");
            const agData = getAgenda();
            const find = () => (agData.items || []).find(x => String(x.id) === String(id));
            if (act === "view") {
              btn.addEventListener("click", () => { const it = find(); it && showApptViewModal(it); });
            } else if (act === "edit") {
              btn.addEventListener("click", () => { const it = find(); it && showAgendamentoModal([], it); });
            } else if (act === "start") {
              btn.addEventListener("click", () => {
                const it = find(); if (!it) return;
                it.status = "in_progress"; it.started_at = new Date().toISOString();
                setAgenda(agData); renderAgendaList();
              });
            } else if (act === "done") {
              btn.addEventListener("click", () => {
                const it = find(); if (!it) return;
                it.status = "done"; it.completed_at = new Date().toISOString();
                setAgenda(agData); renderAgendaList();
              });
            } else if (act === "del") {
              btn.addEventListener("click", () => {
                if (!confirm("Excluir agendamento?")) return;
                const idx = (agData.items || []).findIndex(x => String(x.id) === String(id));
                if (idx >= 0) { agData.items.splice(idx,1); setAgenda(agData); renderAgendaList(); }
              });
            }
          });
        }

        // ---- Views: Dia / Semana / Mês ----
        function toYMD_ag(d) {
          const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,"0"), dd = String(d.getDate()).padStart(2,"0");
          return `${y}-${m}-${dd}`;
        }
        function weekStartFromYMD(ymd) {
          const d = new Date(ymd + "T00:00:00");
          const day = d.getDay(); // 0 (Dom) .. 6 (Sáb)
          const diff = day === 0 ? -6 : 1 - day; // Segunda como início
          d.setDate(d.getDate() + diff);
          return d;
        }

        function renderWeekView() {
          const wrap = page.querySelector("#agWeek");
          const titleEl = page.querySelector("#agWeekTitle");
          if (!wrap) return;
          const start = weekStartFromYMD(agSelected);
          const days = [];
          for (let i = 0; i < 7; i++) { const di = new Date(start); di.setDate(start.getDate() + i); days.push(di); }
          titleEl && (titleEl.textContent = `${brFromYMD(toYMD_ag(days[0]))} a ${brFromYMD(toYMD_ag(days[6]))}`);

          const ag = getAgenda();
          const filter = (page.querySelector("#agStatus")?.value) || "all";
          const showDone = (page.querySelector("#agShowDone")?.checked) ?? true;
          const qv = (page.querySelector("#agQ")?.value || localStorage.getItem("bella_agenda_q") || "").trim().toLowerCase();
          const qd = qv.replace(/\D+/g,"");

          const startHour = 8, endHour = 20;
          const pxPerMin = 1; // 1px por minuto
          const totalMin = (endHour - startHour) * 60;
          const colHeight = totalMin * pxPerMin;

          function filt(list) {
            let arr = list.slice();
            if (!showDone) arr = arr.filter(a => (a.status || "scheduled") !== "done");
            if (filter !== "all") arr = arr.filter(a => (a.status || "scheduled") === filter);
            if (qv) {
              arr = arr.filter(a => {
                const name = String(a.cliente || "").toLowerCase();
                const tel = String(a.telefone || "");
                return name.includes(qv) || (qd && tel.replace(/\D+/g,"").includes(qd));
              });
            }
            return arr;
          }
          function durMin(a) {
            if (a.duracao_min) return Number(a.duracao_min) || 0;
            try { return Math.max(15, Math.floor((new Date(a.fim) - new Date(a.inicio)) / 60000)); } catch { return 60; }
          }
          function money(n){ return (Number(n)||0).toLocaleString("pt-BR",{style:"currency", currency:"BRL"}); }

          let html = `
            <div style="display:grid;grid-template-columns:60px repeat(7,1fr);gap:6px;">
              <div></div>
              ${days.map(d=>`<div style="text-align:center;font-weight:900;color:#7a0f3f;">${brFromYMD(toYMD_ag(d))}</div>`).join("")}
              <div style="border-right:1px solid #f1e6ee;">
                <div style="position:relative;height:${colHeight}px;">
                  ${Array.from({length: endHour-startHour+1}).map((_,i)=> {
                    const h = startHour + i;
                    return `<div style="position:absolute;top:${(h-startHour)*60*pxPerMin-8}px;left:0;right:6px;color:#64748b;font-weight:700;font-size:12px;">${String(h).padStart(2,"0")}:00</div>`;
                  }).join("")}
                </div>
              </div>
              ${days.map(d=>{
                const ymd = toYMD_ag(d);
                const list = filt((ag.items || []).filter(a=> ymdFromISO(a.inicio) === ymd).sort((a,b)=> new Date(a.inicio) - new Date(b.inicio)));
                const blocks = list.map(a=>{
                  const start = new Date(a.inicio);
                  const mFromStart = start.getHours()*60 + start.getMinutes() - startHour*60;
                  const top = Math.max(0, mFromStart * pxPerMin);
                  const height = Math.max(24, durMin(a) * pxPerMin);
                  const st = a.status || "scheduled";
                  const color = st==="in_progress" ? "#f59e0b" : (st==="done" ? "#10b981" : "#2563eb");
                  return `
                    <div class="w-appt" data-id="${a.id}"
                         style="position:absolute;left:6px;right:6px;top:${top}px;height:${height}px;border:2px solid ${color};border-radius:10px;background:#fff;box-shadow:0 4px 14px rgba(16,24,40,.06);padding:6px;overflow:hidden;">
                      <div style="display:flex;justify-content:space-between;gap:6px;">
                        <div style="font-weight:900;color:#7a0f3f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${a.cliente || "-"}</div>
                        <div style="color:#334155;font-weight:800;">${money(a.total || 0)}</div>
                      </div>
                      <div style="color:#64748b;font-weight:700;font-size:12px;">${fmtHM(a.inicio)}–${fmtHM(a.fim)}</div>
                    </div>`;
                }).join("");
                return `
                  <div style="position:relative;height:${colHeight}px;border:1px solid #f1e6ee;border-radius:12px;background:linear-gradient(180deg,#fff,#fff);">
                    ${Array.from({length: endHour-startHour+1}).map((_,i)=> {
                      const y = (i*60*pxPerMin);
                      return `<div style="position:absolute;left:0;right:0;top:${y}px;height:1px;background:#f1e6ee;"></div>`;
                    }).join("")}
                    ${blocks || `<div style="position:absolute;left:0;right:0;top:10px;color:#9ca3af;font-weight:700;font-size:12px;text-align:center;">Sem agendamentos</div>`}
                  </div>`;
              }).join("")}
            </div>
          `;
          wrap.innerHTML = html;

          wrap.querySelectorAll(".w-appt").forEach(el => {
            const id = el.getAttribute("data-id");
            el.addEventListener("click", () => {
              const agData = getAgenda();
              const it = (agData.items || []).find(x => String(x.id) === String(id));
              if (it) showApptViewModal(it);
            });
          });
        function renderMonthView() {
          const wrap = page.querySelector("#agMonth");
          const titleEl = page.querySelector("#agMonthTitle");
          if (!wrap) return;
          const base = new Date(agSelected + "T00:00:00");
          titleEl && (titleEl.textContent = base.toLocaleDateString("pt-BR", { month:"long", year:"numeric" }));
          const startMonth = new Date(base.getFullYear(), base.getMonth(), 1);
          const startDay = startMonth.getDay(); // 0 Dom .. 6 Sáb
          const offset = startDay === 0 ? 6 : (startDay - 1); // segunda
          const gridStart = new Date(startMonth); gridStart.setDate(startMonth.getDate() - offset);
          const ag = getAgenda();
          const filter = (page.querySelector("#agStatus")?.value) || "all";
          const showDone = (page.query          let html = `<div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;">`;
          for (let i = 0; i < 42; i++) {
            const d = new Date(gridStart); d.setDate(gridStart.getDate() + i);
            const ymd = toYMD_ag(d);
            const inMonth = d.getMonth() === base.getMonth();
            const count = (ag.items || []).filter(a => ymdFromISO(a.inicio) === ymd).length;
            html += `
              <div data-ymd="${ymd}" style="border:1px solid #f1e6ee;border-radius:12px;padding:8px;background:${inMonth ? "#fff" : "#f9fafb"};${ymd===todayYMD ? "box-shadow:0 0 0 2px #f3a1c8 inset;" : ""}cursor:pointer;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <div style="font-weight:900;color:#7a0f3f;">${d.getDate()}</div>
                  ${count ? `<span class="badge" style="padding:4px 8px;">${count}</span>` : ``}
                </div>
              </div>
            `;
          }
          html += `</div>`;
          wrap.innerHTML = html;
          wrap.querySelectorAll("[data-ymd]").forEach(cell => {
            cell.addEventListener("click", () => {
              agSelected = cell.getAttribute("data-ymd");
              localStorage.setItem(AG_SEL_KEY, agSelected);
              setView("day");
            });
          });
        }

        // Filtro "mostrar concluídos" e render do DIA com persistência
        function bindDoneCheckbox() {
          const doneChk = page.querySelector("#agShowDone");
          if (doneChk && !doneChk.__bound) {
            doneChk.__bound = true;
            const saved = localStorage.getItem("bella_agenda_show_done");
            if (saved != null) doneChk.checked = saved === "1";
            else doneChk.checked = true;
            doneChk.addEventListener("change", () => {
              localStorage.setItem("bella_agenda_show_done", doneChk.checked ? "1" : "0");
              const vm = localStorage.getItem("bella_agenda_view") || "day";
              if (vm === "day") renderAgendaList();
              else if (vm === "week") renderWeekView();
              else renderMonthView();
            });
          }
        }
        // Reescreve parte do renderAgendaList para respeitar o checkbox
        const _renderAgendaListOrig = renderAgendaList;
        renderAgendaList = function() {
          bindDoneCheckbox();
          const statusSel = page.querySelector("#agStatus");
          const doneChk = page.querySelector("#agShowDone");
          const showDone = doneChk ? !!doneChk.checked : true;

          const ag = getAgenda();
          let all = (ag.items || []).filter(it => ymdFromISO(it.inicio) === agSelected);
          if (!showDone) all = all.filter(it => (it.status || "scheduled") !== "done");
          const qv = (page.querySelector("#agQ")?.value || localStorage.getItem("bella_agenda_q") || "").trim().toLowerCase();
          if (qv) {
            const qd = qv.replace
          // Atualiza KPIs com base no filtro atual
          updateKpisForDay(all);

          let list = all.slice().sort((a,b) => new Date(a.inicio) - new Date(b.inicio));
          const stFilter = (statusSel && statusSel.value) || "all";
          if (stFilter !== "all") list = list.filter(it => (it.status || "scheduled") === stFilter);

          // Redesenha cards do dia usando o mecanismo já implementado
          // Para evitar duplicidade de código, vamos reaproveitar o HTML builder original:
          const listEl = page.querySelector("#agList");
          const dayTitle = page.querySelector("#agDayTitle");
          if (dayTitle) dayTitle.textContent = brFromYMD(agSelected);
          const money = (n) => (Number(n)||0).toLocaleString("pt-BR", { style:"currency", currency:"BRL" });

          listEl.innerHTML = list.map(a => {
            const st = a.status || "scheduled";
            const cls = st === "in_progress" ? "in-progress" : (st === "done" ? "scheduled" : "scheduled");
            let pct = 0;
            try {
              if (st === "in_progress") {
                const start = new Date(a.inicio).getTime();
                const end = new Date(a.fim).getTime();
                pct = Math.max(0, Math.min(100, Math.round(((Date.now() - start)/(end - start))*100)));
              }
            } catch {}
            const services = (a.servicos||[]).map(s => `${s.nome} — ${s.duracao_min}min — ${money(s.preco)}`).join(" • ");
            return `
              <article class="appt ${cls}" data-id="${a.id}">
                ${st==="in_progress" ? `<div class="progress-fill" style="width:${pct}%"></div>` : ``}
                <div class="inner">
                  <div>
                    <div class="header">
                      <div class="ava">${(a.cliente || "?").slice(0,1).toUpperCase()}</div>
                      <div style="flex:1;">
                        <div class="name">${a.cliente || "-"}</div>
                      </div>
                      <span class="status ${st==="in_progress" ? "" : (st==="scheduled" ? "scheduled" : "scheduled")}">${st==="scheduled"?"Agendado":(st==="in_progress"?"Em Andamento":"Concluído")}</span>
                    </div>
                    <div class="row">
                      <svg class="icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#a1125b" stroke-width="1.8"/><path d="M12 8v5l3 2" stroke="#a1125b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      ${fmtHM(a.inicio)} – ${fmtHM(a.fim)}
                    </div>
                    ${a.telefone ? `<div class="row"><svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M22 16.92V21a1 1 0 0 1-1.09 1c-9.4-.5-17-8.1-17.5-17.5A1 1 0 0 1 4 3h4.09A1 1 0 0 1 9 3.91l1.2 3a1 1 0 0 1-.27 1.11L8.9 9.3a16 16 0 0 0 6.8 6.8l1.28-1.05a1 1 0 0 1 1.11-.27l3 1.2a1 1 0 0 1 .91.99z" stroke="#a1125b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> ${a.telefone}</div>` : ``}
                    <div class="section-title">Serviços:</div>
                    <div class="chip-box">
                      <div class="chip-sub">🧾 ${services || "-"}</div>
                      <strong>${money(a.total || 0)}</strong>
                    </div>
                  </div>
                  <div class="actions">
                    <button class="btn-outline" data-act="view" title="Ver">👁️</button>
                    <button class="btn-outline" data-act="edit" title="Editar">✏️</button>
                    ${st==="scheduled" ? `<button class="btn-outline" data-act="start" title="Iniciar">▶️</button>` : ``}
                    ${st!=="done" ? `<button class="btn-outline" data-act="done" title="Concluir">✔️</button>` : ``}
                    <button class="btn-outline" data-act="del" title="Excluir">🗑️</button>
                  </div>
                </div>
              </article>
            `;
          }).join("") || `<div class="empty">Nenhum agendamento para este dia</div>`;

          // bind card actions novamente
          listEl.querySelectorAll(".appt .btn-outline").forEach(btn => {
            const card = btn.closest(".appt");
            const id = card?.getAttribute("data-id");
            const act = btn.getAttribute("data-act");
            const agData = getAgenda();
            const find = () => (agData.items || []).find(x => String(x.id) === String(id));
            if (act === "view") {
              btn.addEventListener("click", () => { const it = find(); it && showApptViewModal(it); });
            } else if (act === "edit") {
              btn.addEventListener("click", () => { const it = find(); it && showAgendamentoModal([], it); });
            } else if (act === "start") {
              btn.addEventListener("click", () => { const it = find(); if (!it) return; it.status = "in_progress"; it.started_at = new Date().toISOString(); setAgenda(agData); renderAgendaList(); });
            } else if (act === "done") {
              btn.addEventListener("click", () => { const it = find(); if (!it) return; it.status = "done"; it.completed_at = new Date().toISOString(); setAgenda(agData); renderAgendaList(); });
            } else if (act === "del") {
              btn.addEventListener("click", () => { if (!confirm("Excluir agendamento?")) return; const idx = (agData.items || []).findIndex(x => String(x.id) === String(id)); if (idx >= 0) { agData.items.splice(idx,1); setAgenda(agData); renderAgendaList(); } });
            }
          });
        };

        // Alternância de visualização
        const AG_VIEW_KEY = "bella_agenda_view";
        function setView(mode) {
          localStorage.setItem(AG_VIEW_KEY, mode);
          const bDay = page.querySelector("#agViewDay");
          const bWeek = page.querySelector("#agViewWeek");
          const bMonth = page.querySelector("#agViewMonth");
          [bDay,bWeek,bMonth].forEach(b => b && b.classList.remove("active"));
          ({ day: bDay, week: bWeek, month: bMonth }[mode])?.classList.add("active");
          page.querySelector("#agendaSection").style.display = mode === "day" ? "" : "none";
          page.querySelector("#weekSection").style.display = mode === "week" ? "" : "none";
          page.querySelector("#monthSection").style.display = mode === "month" ? "" : "none";
          if (mode === "day") renderAgendaList();
          else if (mode === "week") renderWeekView();
          else renderMonthView();
        }
        page.querySelector("#agViewDay")?.addEventListener("click", () => setView("day"));
        page.querySelector("#agViewWeek")?.addEventListener("click", () => setView("week"));
        page.querySelector("#agViewMonth")?.addEventListener("click", () => setView("month"));

        // Bind dos controles principais (uma vez)
        const dateInput_ag = page.querySelector("#agDateInput");
        const statusSel_ag = page.querySelector("#agStatus");
        const qInput_ag = page.querySelector("#agQ");
        const prevBtn_ag = page.querySelector("#agPrev");
        const nextBtn_ag = page.querySelector("#agNext");
        const prevMonthBtn = page.querySelector("#agPrevMonth");
        const nextMonthBtn = page.querySelector("#agNextMonth");

        if (dateInput_ag && !dateInput_ag.__bound) {
          dateInput_ag.__bound = true;
          dateInput_ag.value = agSelected;
          dateInput_ag.addEventListener("change", (e) => {
            agSelected = e.target.value || agSelected;
            localStorage.setItem(AG_SEL_KEY, agSelected);
            const vm = localStorage.getItem(AG_VIEW_KEY) || "day";
            if (vm === "day") renderAgendaList();
            else if (vm === "week") renderWeekView();
            else renderMonthView();
          });
        }
        if (statusSel_ag && !statusSel_ag.__bound) {
          statusSel_ag.__bound = true;
          statusSel_ag.addEventListener("change", () => {
            const vm = localStorage.getItem(AG_VIEW_KEY) || "day";
            if (vm === "day") renderAgendaList();
            else if (vm === "week") renderWeekView();
            else renderMonthView();
          });
        }
        if (qInput_ag && !qInput_ag.__bound) {
          qInput_ag.__bound = true;
          const savedQ = localStorage.getItem("bella_agenda_q") || "";
          if (!qInput_ag.value) qInput_ag.value = savedQ;
          qInput_ag.addEventListener("input", (e) => {
            const v = (e.target.value || "").trim();
            localStorage.setItem("bella_agenda_q", v);
            const vm = localStorage.getItem(AG_VIEW_KEY) || "day";
            if (vm === "day") renderAgendaList();
            else if (vm === "week") renderWeekView();
            else renderMonthView();
          });
        }
        if (prevBtn_ag && !prevBtn_ag.__bound) {
          prevBtn_ag.__bound = true;
          prevBtn_ag.addEventListener("click", () => {
            const d = new Date(agSelected + "T00:00:00");
            d.setDate(d.getDate() - 1);
            agSelected = toYMD_ag(d);
            localStorage.setItem(AG_SEL_KEY, agSelected);
            const di = page.querySelector("#agDateInput"); if (di) di.value = agSelected;
            const vm = localStorage.getItem(AG_VIEW_KEY) || "day";
            if (vm === "day") renderAgendaList(); else renderWeekView();
          });
        }
        if (nextBtn_ag && !nextBtn_ag.__bound) {
          nextBtn_ag.__bound = true;
          nextBtn_ag.addEventListener("click", () => {
            const d = new Date(agSelected + "T00:00:00");
            d.setDate(d.getDate() + 1);
            agSelected = toYMD_ag(d);
            localStorage.setItem(AG_SEL_KEY, agSelected);
            const di = page.querySelector("#agDateInput"); if (di) di.value = agSelected;
            const vm = localStorage.getItem(AG_VIEW_KEY) || "day";
            if (vm === "day") renderAgendaList(); else renderWeekView();
          });
        }
        if (prevMonthBtn && !prevMonthBtn.__bound) {
          prevMonthBtn.__bound = true;
          prevMonthBtn.addEventListener("click", () => {
            const d = new Date(agSelected + "T00:00:00");
            d.setMonth(d.getMonth() - 1);
            d.setDate(1);
            agSelected = toYMD_ag(d);
            localStorage.setItem(AG_SEL_KEY, agSelected);
            renderMonthView();
          });
        }
        if (nextMonthBtn && !nextMonthBtn.__bound) {
          nextMonthBtn.__bound = true;
          nextMonthBtn.addEventListener("click", () => {
            const d = new Date(agSelected + "T00:00:00");
            d.setMonth(d.getMonth() + 1);
            d.setDate(1);
            agSelected = toYMD_ag(d);
            localStorage.setItem(AG_SEL_KEY, agSelected);
            renderMonthView();
          });
        }

        // Inicia na visão gravada ou Dia
        setView(localStorage.getItem(AG_VIEW_KEY) || "day");
   _code  new </}
  }

      // Interações específicas do Caixa (persistência local e cálculos)
      if (hash === "/caixa") {
        const storageKey = "bella_caixa_v1";
        const todayYMD = (() => {
          const t = new Date();
          const y = t.getFullYear();
          const m = String(t.getMonth() + 1).padStart(2, "0");
          const d = String(t.getDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        })();
        const selectedDate = localStorage.getItem("bella_caixa_selected_date") || todayYMD;

        const money = (n) =>
          (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        const fmtBR = (ymd) => {
          const [y, m, d] = ymd.split("-");
          return `${d}/${m}/${y}`;
        };
        const getStore = () => {
          try {
            return JSON.parse(localStorage.getItem(storageKey) || '{"days":{}}');
          } catch {
            return { days: {} };
          }
        };
        const setStore = (s) => localStorage.setItem(storageKey, JSON.stringify(s));
        const getDay = (store, ymd) => {
          if (!store.days[ymd]) {
            store.days[ymd] = { atendimentos: [], despesas: [], dinheiroInformado: 0 };
          }
          return store.days[ymd];
        };

        const snapshot = (ymd) => {
          const store = getStore();
          const day = getDay(store, ymd);
          const atts = day.atendimentos || [];
          const deps = day.despesas || [];
          let totalPix = 0,
            totalCartao = 0,
            totalDinheiro = 0,
            totalDebitos = 0;
          atts.forEach((a) => {
            if (Array.isArray(a.servicos) && a.servicos.length) {
              a.servicos.forEach((sv) => {
                const v = Number(sv.valor) || 0;
                const p = sv.pagamento || a.pagamento;
                if (p === "pix") totalPix += v;
                else if (p === "cartao") totalCartao += v;
                else if (p === "dinheiro") totalDinheiro += v;
                else if (p === "mensal") totalDebitos += v;
              });
            } else {
              const v = Number(a.valor) || 0;
              const p = a.pagamento;
              if (p === "pix") totalPix += v;
              else if (p === "cartao") totalCartao += v;
              else if (p === "dinheiro") totalDinheiro += v;
              else if (p === "mensal") totalDebitos += v;
            }
          });
          let totalDespesas = 0,
            totalDespesasCaixa = 0;
          deps.forEach((d) => {
            const v = Number(d.valor) || 0;
            totalDespesas += v;
            if (d.origem === "caixa") totalDespesasCaixa += v;
          });
          const entradas = totalPix + totalCartao + totalDinheiro;
          const dinheiroInformado = Number(day.dinheiroInformado || 0);
          const dinheiroCalculado = dinheiroInformado + totalDinheiro - totalDespesasCaixa;
          return {
            store,
            day,
            atts,
            deps,
            totalPix,
            totalCartao,
            totalDinheiro,
            totalDebitos,
            totalDespesas,
            totalDespesasCaixa,
            entradas,
            dinheiroInformado,
            dinheiroCalculado,
          };
        };

        function renderCaixa() {
          const s = snapshot(selectedDate);
          const brDate = fmtBR(selectedDate);

          function payBadge(att) {
            const pays = (att.servicos || []).map(s => s.pagamento).filter(Boolean);
            let lab = att.pagamento || "";
            if (pays.length) {
              const uniq = Array.from(new Set(pays));
              lab = uniq.length === 1 ? uniq[0] : "misto";
            }
            if (lab === "pix") return '<span class="badge pay-pix">pix</span>';
            if (lab === "cartao") return '<span class="badge pay-cartao">cartao</span>';
            if (lab === "dinheiro") return '<span class="badge pay-dinheiro">dinheiro</span>';
            if (lab === "mensal") return '<span class="badge pay-mensal">mensal</span>';
            return '<span class="badge" style="background:#f1f5f9;border:1px solid #e2e8f0;color:#334155;">misto</span>';
          }

          page.innerHTML = `
            <style>
              .cx-actions{ display:flex; gap:10px; flex-wrap:wrap; margin:12px 0; }
              .btn { border-radius:12px; padding:10px 14px; border:1px solid #f1e6ee; background:#fff; font-weight:900; color:#a1125b; box-shadow: var(--shadow); }
              .btn.primary{ background:linear-gradient(90deg,var(--bella-500),var(--bella-400)); color:#fff; border:0; }
              .grid-cards{ display:grid; gap:12px; margin:12px 0; }
              .card-sm{ border-radius:16px; border:1px solid #f1e6ee; background:#fff; padding:14px; box-shadow: var(--shadow); }
              .card-sm.green{ border-color:#86efac; }
              .card-sm.blue{ border-color:#93c5fd; }
              .card-sm.purple{ border-color:#c7d2fe; }
              .card-sm.yellow{ border-color:#fde68a; background:#fffbeb; }
              .card-sm.red{ border-color:#fecaca; }
              .k-title{ color:#a1125b; font-weight:900; }
              .k-value{ font-size:28px; font-weight:900; color:#0f172a; }
              @media(min-width:980px){ .grid-cards{ grid-template-columns: repeat(3,minmax(0,1fr)); } }
              .filter-card{ display:grid; gap:10px; }
              .filter-card .field{ display:grid; gap:6px; }
              .filter-card input, .filter-card select { border:1px solid #f3c6d9; border-radius:12px; padding:10px; font-weight:700; color:#a1125b; background:#fff; }
              .list-table{ width:100%; border-collapse:separate; border-spacing:0 8px; }
              .list-table th{ text-align:left; color:#a1125b; font-size:12px; }
              .list-table td{ background:#fff; border:1px solid #f1e6ee; padding:10px; border-radius:10px; }
              @media(max-width:640px){
                .list-table{ display:block; overflow-x:auto; -webkit-overflow-scrolling:touch; min-width:720px; }
                .list-table th, .list-table td{ white-space:nowrap; }
              }
              .badge{ display:inline-block; padding:6px 10px; border-radius:999px; font-weight:800; }
              .pay-pix{ background:#eff6ff; border:1px solid #bfdbfe; color:#1d4ed8; }
              .pay-cartao{ background:#f3e8ff; border:1px solid #e9d5ff; color:#6d28d9; }
              .pay-dinheiro{ background:#ecfdf5; border:1px solid #a7f3d0; color:#065f46; }
              .pay-mensal{ background:#fff7ed; border:1px solid #fed7aa; color:#b45309; }
              .muted2{ color:#6b7280; }
              .section h2{ margin:0 0 10px; }
              .right{ text-align:right; }
            </style>

            <div class="hero"><h1>Caixa</h1><p>Controle financeiro e movimentações</p></div>

            <div class="cx-actions">
              <button class="btn primary" id="btnAtendimento">+ Atendimento Manual</button>
              <button class="btn" id="btnDespesa">+ Despesa</button>
              <button class="btn" id="btnRecibo">Recibo Semanal</button>
              <button class="btn" id="btnPdf">Exportar PDF</button>
              <button class="btn" id="btnImg">Exportar Imagem</button>
            </div>

            <div class="grid-cards">
              <div class="card-sm green">
                <div class="k-title">Total Entradas (PIX+Cartão+Din.)</div>
                <div class="k-value">${money(s.entradas)}</div>
              </div>
              <div class="card-sm blue">
                <div class="k-title">Total PIX</div>
                <div class="k-value">${money(s.totalPix)}</div>
              </div>
              <div class="card-sm purple">
                <div class="k-title">Total Cartão (Crédito/Débito)</div>
                <div class="k-value">${money(s.totalCartao)}</div>
              </div>
              <div class="card-sm">
                <div class="k-title">Total Dinheiro (Entrada)</div>
                <div class="k-value">${money(s.totalDinheiro)}</div>
              </div>
              <div class="card-sm yellow">
                <div class="k-title">Total Débitos (Não Pago)</div>
                <div class="k-value">${money(s.totalDebitos)}</div>
              </div>
              <div class="card-sm red">
                <div class="k-title">Total Despesas</div>
                <div class="k-value">${money(s.totalDespesas)}</div>
              </div>
              <div class="card-sm">
                <div class="k-title">Dinheiro em Caixa (Calculado)</div>
                <div class="k-value">${money(s.dinheiroCalculado)}</div>
              </div>
            </div>

            <section class="section filter-card">
              <div class="field">
                <label class="muted2">Data</label>
                <input type="date" id="cxDate" value="${selectedDate}">
              </div>
              <div class="field">
                <label class="muted2">Tipo</label>
                <select id="cxTipo">
                  <option value="todos">Todos os tipos</option>
                  <option value="atendimentos">Atendimentos</option>
                  <option value="despesas">Despesas</option>
                </select>
              </div>
              <div class="field">
                <label class="muted2">Dinheiro em Caixa (Informado)</label>
                <input type="number" id="cxDinheiro" value="${s.dinheiroInformado}" step="0.01" min="0">
              </div>
              <div class="field">
                <label class="muted2">Exportação compacta</label>
                <label style="display:flex;align-items:center;gap:8px;font-weight:800;color:#a1125b;">
                  <input type="checkbox" id="cxExportCompact">
                  <span>2 colunas, menos espaçamento</span>
                </label>
              </div>
              <div class="field">
                <label class="muted2">Exportação legível</label>
                <label style="display:flex;align-items:center;gap:8px;font-weight:800;color:#a1125b;">
                  <input type="checkbox" id="cxExportLegible">
                  <span>Layout focado em leitura (blocos de cliente + observações destacadas)</span>
                </label>
              </div>
              <div class="field">
                <label class="muted2">Legível compacto</label>
                <label style="display:flex;align-items:center;gap:8px;font-weight:800;color:#a1125b;">
                  <input type="checkbox" id="cxExportLegibleCompact">
                  <span>2 colunas no modo legível</span>
                </label>
              </div>
            </section>

            <section class="section">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <h2>Atendimentos do Caixa (${brDate})</h2>
                <span class="badge muted2">${s.atts.length} atend.</span>
              </div>
              ${
                s.atts.length
                  ? `
                  <table class="list-table">
                    <thead>
                      <tr>
                        <th>Cliente</th><th>Serviços</th><th>Funcionário</th><th class="right">Total (R$)</th><th>Pagamento</th><th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${s.atts
                        .map(
                          (a) => `
                        <tr>
                          <td>${a.cliente || "-"}</td>
                          <td>${(a.servicos || []).map((sv) => sv.nome).join(", ") || a.servico || "-"}</td>
                          <td>${(a.servicos || [])
                            .map((sv) => sv.profissional)
                            .filter(Boolean)
                            .join(", ") || a.profissional || "-"}</td>
                          <td class="right">${money(a.valor)}</td>
                          <td>
                            ${payBadge(a)}
                          </td>
                          <td>
                            <button class="btn" data-edit-att="${a.id}">Editar</button>
                            <button class="btn" data-del-att="${a.id}">Excluir</button>
                          </td>
                        </tr>
                      `
                        )
                        .join("")}
                    </tbody>
                  </table>
                `
                  : `<div class="empty">Sem atendimentos para esta data</div>`
              }
            </section>

            <section class="section">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <h2>Movimentações do Dia</h2>
                <span class="badge muted2">${s.deps.length} movimentações</span>
              </div>
              ${
                s.deps.length
                  ? `
                  <table class="list-table">
                    <thead>
                      <tr>
                        <th>Descrição</th><th>Origem</th><th>Comprovante</th><th class="right">Valor (R$)</th><th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${s.deps
                        .map(
                          (d) => `
                        <tr>
                          <td>${d.descricao}</td>
                          <td>${d.origem === "caixa" ? "Retirada do Caixa" : "Outro"}</td>
                          <td>
                            ${
                              (d.qr_text || d.qr_image)
                                ? `
                                  <span class="badge">QR anexado</span>
                                  ${
                                    d.qr_image ? `<img src="${d.qr_image}" alt="QR" style="width:48px;height:48px;object-fit:contain;border:1px solid #eee;border-radius:6px;display:block;margin-top:4px;">` : ``
                                  }
                                  ${
                                    d.qr_text
                                      ? (/^https?:/i.test(d.qr_text)
                                          ? `<a href="${d.qr_text}" target="_blank" rel="noopener" class="muted2" style="max-width:160px;display:inline-block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${d.qr_text}</a>`
                                          : `<div class="muted2" style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${d.qr_text}</div>`)
                                      : ``
                                  }
                                `
                                : `<span class="muted2">—</span>`
                            }
                          </td>
                          <td class="right">${money(d.valor)}</td>
                          <td>
                            <button class="btn" data-edit-dep="${d.id}">Editar</button>
                            <button class="btn" data-del-dep="${d.id}">Excluir</button>
                          </td>
                        </tr>
                      `
                        )
                        .join("")}
                    </tbody>
                  </table>
                `
                  : `<div class="empty">Nenhuma movimentação encontrada para esta data</div>`
              }
            </section>
          `;

          // Eventos do cabeçalho/filters
          const byId = (id) => document.getElementById(id);
          byId("cxDate").addEventListener("change", (e) => {
            const v = e.target.value || selectedDate;
            localStorage.setItem("bella_caixa_selected_date", v);
            renderCaixa();
          });
          byId("cxDinheiro").addEventListener("change", (e) => {
            const v = parseFloat(e.target.value || "0") || 0;
            const store = getStore();
            const day = getDay(store, selectedDate);
            day.dinheiroInformado = v;
            setStore(store);
            renderCaixa();
          });

          const expC = byId("cxExportCompact");
          if (expC) {
            expC.checked = localStorage.getItem("bella_export_compact") === "1";
            expC.addEventListener("change", (e) => {
              localStorage.setItem("bella_export_compact", e.target.checked ? "1" : "0");
            });
          }
          const expL = byId("cxExportLegible");
          if (expL) {
            expL.checked = localStorage.getItem("bella_export_legible") === "1";
            expL.addEventListener("change", (e) => {
              localStorage.setItem("bella_export_legible", e.target.checked ? "1" : "0");
            });
          }
          const expLC = byId("cxExportLegibleCompact");
          if (expLC) {
            expLC.checked = localStorage.getItem("bella_export_legible_compact") === "1";
            expLC.addEventListener("change", (e) => {
              localStorage.setItem("bella_export_legible_compact", e.target.checked ? "1" : "0");
            });
          }

          // Ações
          byId("btnAtendimento").addEventListener("click", () => showAtendimentoModal());
          byId("btnDespesa").addEventListener("click", () => showDespesaModal());
          const recBtn = byId("btnRecibo");
          if (recBtn) recBtn.addEventListener("click", () => showReciboModal());
          const pdfBtn = byId("btnPdf");
          if (pdfBtn) pdfBtn.addEventListener("click", () => exportPDF());
          const imgBtn = byId("btnImg");
          if (imgBtn) imgBtn.addEventListener("click", () => exportImage());

          // Atendimentos - editar/excluir
          page.querySelectorAll("[data-del-att]").forEach((b) =>
            b.addEventListener("click", () => {
              const id = b.getAttribute("data-del-att");
              const store = getStore();
              const day = getDay(store, selectedDate);
              day.atendimentos = (day.atendimentos || []).filter((a) => String(a.id) !== String(id));
              setStore(store);
              renderCaixa();
            })
          );
          page.querySelectorAll("[data-edit-att]").forEach((b) =>
            b.addEventListener("click", () => {
              const id = b.getAttribute("data-edit-att");
              const store = getStore();
              const day = getDay(store, selectedDate);
              const att = (day.atendimentos || []).find((a) => String(a.id) === String(id));
              showAtendimentoModal(att);
            })
          );

          // Despesas - editar/excluir
          page.querySelectorAll("[data-del-dep]").forEach((b) =>
            b.addEventListener("click", () => {
              const id = b.getAttribute("data-del-dep");
              const store = getStore();
              const day = getDay(store, selectedDate);
              day.despesas = (day.despesas || []).filter((a) => String(a.id) !== String(id));
              setStore(store);
              renderCaixa();
            })
          );
          page.querySelectorAll("[data-edit-dep]").forEach((b) =>
            b.addEventListener("click", () => {
              const id = b.getAttribute("data-edit-dep");
              const store = getStore();
              const day = getDay(store, selectedDate);
              const dep = (day.despesas || []).find((a) => String(a.id) === String(id));
              showDespesaModal(dep);
            })
          );

          function showAtendimentoModal(existing) {
            const modals = document.getElementById("modals");
            const modal = modals.querySelector(".modal");

            modal.innerHTML = `
              <style>
                .amodal h3 {
                  margin: 0 0 14px;
                  font-weight: 900;
                  color: var(--bella-800);
                  font-size: 22px;
                }
                .amodal .header {
                  display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;
                }
                .amodal .closex {
                  width:38px; height:38px; border-radius:12px; display:grid; place-items:center;
                  background:#fff; border:1px solid #f3c6d9; color:#a1125b;
                }
                .amodal .grid2 { display:grid; grid-template-columns: 1fr 180px; gap:10px; }
                .amodal .field { display:grid; gap:8px; }
                .amodal label { color:#a1125b; font-weight:900; }
                .amodal input, .amodal select {
                  border:2px solid #f3c6d9; border-radius:14px; padding:12px; font-weight:700; color:#a1125b; background:#fff; width:100%; min-width:0;
                }
                .amodal input[readonly] { background:#fff7fb; }
                .amodal .hint { color:#9ca3af; font-weight:700; }
                .amodal .svc-head { display:flex; align-items:center; justify-content:space-between; margin-top:6px; }
                .amodal #svcList { display:grid; gap:10px; }
                .amodal .svc-row {
                  display:grid; grid-template-columns: 1fr 110px 160px 140px 42px; grid-template-areas: "nome valor prof pay del"; gap:10px; align-items:center;
                  background:#fff; border:1.5px solid #f3c6d9; border-radius:12px; padding:10px;
                }
                .amodal .svc-row .svc-nome { grid-area: nome; }
                .amodal .svc-row .svc-valor { grid-area: valor; }
                .amodal .svc-row .svc-prof { grid-area: prof; }
                .amodal .svc-row .svc-pay { grid-area: pay; }
                .amodal .svc-row .svc-del { grid-area: del; justify-self:end; }
                .amodal .svc-add { border:1px solid #f3c6d9; background:#fff; color:#a1125b; border-radius:12px; padding:10px 12px; font-weight:900; display:inline-flex; align-items:center; gap:8px; max-width:100%; }
                .amodal .footer { display:flex; justify-content:space-between; gap:8px; margin-top:8px; }
                .amodal .btn-cancel {
                  border:2px solid #f3c6d9; border-radius:16px; padding:12px 16px; background:#fff; color:#a1125b; font-weight:900;
                }
                .amodal .btn-save {
                  border:0; border-radius:16px; padding:12px 16px; font-weight:900; color:#fff;
                  background:linear-gradient(90deg,var(--bella-500),var(--bella-400));
                }
                @media(max-width: 640px){
                  .amodal .grid2 { grid-template-columns: 1fr; }
                  .amodal .svc-row { grid-template-columns: 1fr 110px 42px; grid-template-areas:
                    "nome valor del"
                    "prof pay del";
                  }
                  .amodal .svc-row .svc-nome,
                  .amodal .svc-row .svc-valor,
                  .amodal .svc-row .svc-prof,
                  .amodal .svc-row .svc-pay { min-width: 0; }
                }
              </style>

              <div class="amodal">
                <div class="header">
                  <h3 id="modal-title">${existing ? "Editar Atendimento" : "Novo Atendimento Manual"}</h3>
                  <button class="closex" data-close aria-label="Fechar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                  </button>
                </div>

                <div class="grid2">
                  <div class="field">
                    <label>Cliente *</label>
                    <input id="fCliente" placeholder="Nome do cliente" value="${existing?.cliente || ""}">
                  </div>
                  <div class="field">
                    <label>Valor (R$) *</label>
                    <input id="fTotal" type="number" step="0.01" min="0" value="${existing ? existing.valor : 0}" readonly>
                  </div>
                </div>

                <div class="field">
                  <label>Serviço(s) *</label>
                  <div class="hint">Ex: Corte + Escova</div>
                  <div id="svcList" style="margin-top:6px;"></div>
                  <button class="svc-add" id="addSvc" type="button">+ Adicionar serviço</button>
                </div>

                <div class="field">
                  <label>Categoria</label>
                  <input value="Atendimento" readonly>
                </div>

                

                <div class="field">
                  <label>Observação</label>
                  <input id="fObs" placeholder="Opcional (ex.: combo unhas + cabelos R$ 100)" value="${existing?.obs || ""}">
                </div>

                <div class="footer">
                  <button class="btn-cancel" data-close>Cancelar</button>
                  <button class="btn-save" id="saveAtt">${existing ? "Salvar Atendimento" : "Salvar Atendimento"}</button>
                </div>
              </div>
            `;

            modals.style.display = "flex";

            const svcList = modal.querySelector("#svcList");

            const defaultPay = existing?.pagamento || "dinheiro";

            function addRow(svc = { nome: "", valor: "", profissional: "", pagamento: "" }) {
              const row = document.createElement("div");
              row.className = "svc-row";
              const payVal = svc.pagamento || defaultPay || "dinheiro";
              const sel = (val) => (payVal === val ? "selected" : "");
              row.innerHTML = `
                <input placeholder="Serviço" class="svc-nome" value="${svc.nome || ""}">
                <input type="number" step="0.01" min="0" placeholder="Valor" class="svc-valor" value="${svc.valor || ""}">
                <input placeholder="Profissional" class="svc-prof" value="${svc.profissional || ""}">
                <select class="svc-pay">
                  <option value="dinheiro" ${sel("dinheiro")}>Dinheiro</option>
                  <option value="pix" ${sel("pix")}>PIX</option>
                  <option value="cartao" ${sel("cartao")}>Cartão</option>
                  <option value="mensal" ${sel("mensal")}>Mensal</option>
                </select>
                <button class="closex svc-del" type="button" title="Remover">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                </button>
              `;
              row.querySelector(".svc-del").addEventListener("click", () => {
                row.remove();
                recalcTotal();
              });
              row.querySelectorAll("input").forEach((inp) =>
                inp.addEventListener("input", recalcTotal)
              );
              svcList.appendChild(row);
            }

            function recalcTotal() {
              const values = Array.from(modal.querySelectorAll(".svc-valor"))
                .map((i) => parseFloat(i.value || "0") || 0);
              const total = values.reduce((a, b) => a + b, 0);
              modal.querySelector("#fTotal").value = String(total.toFixed(2));
            }

            modal.querySelector("#addSvc").addEventListener("click", () => addRow());
            if (existing?.servicos?.length) existing.servicos.forEach(addRow);
            else addRow();

            modal.querySelector("#saveAtt").addEventListener("click", () => {
              const cliente = modal.querySelector("#fCliente").value.trim();
              const obs = (modal.querySelector("#fObs")?.value || "").trim();
              const total = parseFloat(modal.querySelector("#fTotal").value || "0") || 0;
              const servicos = Array.from(modal.querySelectorAll("#svcList .svc-row")).map((r) => ({
                nome: r.querySelector(".svc-nome").value.trim(),
                valor: parseFloat(r.querySelector(".svc-valor").value || "0") || 0,
                profissional: r.querySelector(".svc-prof").value.trim(),
                pagamento: (r.querySelector(".svc-pay")?.value) || defaultPay || "dinheiro",
              }));

              // pagamento do atendimento: se todos iguais, usa o único; senão, "misto"
              const uniquePays = Array.from(new Set(servicos.map((s) => s.pagamento).filter(Boolean)));
              const pagamentoTop = uniquePays.length === 1 ? uniquePays[0] : "misto";

              const store = getStore();
              const day = getDay(store, selectedDate);

              if (existing) {
                const idx = day.atendimentos.findIndex((a) => String(a.id) === String(existing.id));
                if (idx >= 0)
                  day.atendimentos[idx] = { ...existing, cliente, pagamento: pagamentoTop, valor: total, servicos, obs };
              } else {
                day.atendimentos.push({
                  id: "att-" + Date.now(),
                  data: selectedDate,
                  cliente,
                  pagamento: pagamentoTop,
                  valor: total,
                  servicos,
                  obs,
                });
              }
              setStore(store);
              modals.style.display = "none";
              renderCaixa();
            });
          }

          function showDespesaModal(existing) {
            const modals = document.getElementById("modals");
            const modal = modals.querySelector(".modal");
            modal.innerHTML = `
              <h3 id="modal-title">${existing ? "Editar Despesa" : "Nova Despesa"}</h3>
              <div class="field"><label>Descrição</label><input id="dDesc" placeholder="Ex.: Compra de produtos" value="${existing?.descricao || ""}"></div>
              <div class="field"><label>Valor</label><input id="dVal" type="number" step="0.01" min="0" value="${existing ? existing.valor : 0}"></div>
              <div class="field"><label>Origem</label>
                <select id="dOrigem">
                  <option value="caixa" ${existing?.origem === "caixa" ? "selected" : ""}>Retirar do caixa</option>
                  <option value="outro" ${existing?.origem === "outro" ? "selected" : ""}>Outro</option>
                </select>
              </div>
              <div class="field"><label>QR da Despesa (opcional)</label>
                <input type="file" id="dQRFile" accept="image/*;capture=camera" style="display:none;">
                <div style="display:flex;gap:8px;align-items:center;">
                  <button class="btn" id="dQrScan">Escanear QR (foto)</button>
                  <span class="muted" id="dQrPayload">${existing?.qr_text ? "Payload: " + existing.qr_text : ""}</span>
                </div>
                <div id="dQrPreview" style="margin-top:6px;">${existing?.qr_image ? `<img src="${existing.qr_image}" style="max-width:140px;border:1px solid #f1e6ee;border-radius:8px;">` : ""}</div>
              </div>
              <div style="display:flex; justify-content:flex-end; gap:8px;">
                <button class="btn" data-close>Cancelar</button>
                <button class="btn primary" id="saveDesp">${existing ? "Salvar alterações" : "Salvar"}</button>
              </div>
            `;
            modals.style.display = "flex";

            // QR: scan handlers
            const qrFile = modal.querySelector("#dQRFile");
            const qrScanBtn = modal.querySelector("#dQrScan");
            const qrPayload = modal.querySelector("#dQrPayload");
            const qrPreview = modal.querySelector("#dQrPreview");
            qrScanBtn && qrScanBtn.addEventListener("click", () => qrFile.click());
            qrFile && qrFile.addEventListener("change", async (ev) => {
              const f = ev.target.files && ev.target.files[0];
              if (!f) return;
              let text = "";
              // 1) Tenta via BarcodeDetector (nativo)
              try {
                if (window.BarcodeDetector) {
                  const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
                  const bmp = await createImageBitmap(f);
                  const res = await detector.detect(bmp);
                  if (res && res.length) text = res[0].rawValue || res[0].raw || "";
                }
              } catch {}
              const fr = new FileReader();
              fr.onload = async () => {
                const dataUrl = String(fr.result || "");
                // 2) Se não conseguiu via nativo, tenta decodificar via jsQR (fallback)
                if (!text && dataUrl) {
                  try {
                    await (async function ensureJsQR() {
                      if (!window.jsQR) {
                        await new Promise((resolve, reject) => {
                          const s = document.createElement("script");
                          s.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
                          s.onload = resolve;
                          s.onerror = reject;
                          document.head.appendChild(s);
                        });
                      }
                    })();
                    if (window.jsQR) {
                      await new Promise((resolve) => {
                        const img = new Image();
                        img.onload = () => {
                          try {
                            const canvas = document.createElement("canvas");
                            canvas.width = img.naturalWidth || img.width;
                            canvas.height = img.naturalHeight || img.height;
                            const ctx = canvas.getContext("2d");
                            ctx.drawImage(img, 0, 0);
                            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            const result = window.jsQR(imageData.data, imageData.width, imageData.height);
                            if (result && result.data) text = result.data;
                          } catch {}
                          resolve();
                        };
                        img.onerror = () => resolve();
                        img.src = dataUrl;
                      });
                    }
                  } catch {}
                }
                // Atualiza UI e armazena
                qrPayload.textContent = text ? ("Payload: " + text) : "";
                qrPreview.innerHTML = dataUrl ? `<img src="${dataUrl}" style="max-width:140px;border:1px solid #f1e6ee;border-radius:8px;">` : "";
                qrPayload.setAttribute("data-qrtext", text);
                qrPreview.setAttribute("data-qrimg", dataUrl);
              };
              fr.readAsDataURL(f);
              ev.target.value = "";
            });

            modal.querySelector("#saveDesp").addEventListener("click", () => {
              const descricao = modal.querySelector("#dDesc").value.trim();
              const valor = parseFloat(modal.querySelector("#dVal").value || "0") || 0;
              const origem = modal.querySelector("#dOrigem").value;
              const store = getStore();
              const day = getDay(store, selectedDate);
              // bloqueia negativo se for retirada do caixa
              if (origem === "caixa") {
                const snap = snapshot(selectedDate);
                const saldoAtual = snap.dinheiroCalculado;
                if (valor > saldoAtual) {
                  alert(
                    "Valor indisponível no caixa. Ajuste o Dinheiro em Caixa (Informado) ou altere a origem."
                  );
                  return;
                }
              }
              const qr_text = qrPayload.getAttribute("data-qrtext") || (existing && existing.qr_text) || "";
              const qr_image = qrPreview.getAttribute("data-qrimg") || (existing && existing.qr_image) || "";
              if (existing) {
                const idx = day.despesas.findIndex(
                  (d) => String(d.id) === String(existing.id)
                );
                if (idx >= 0)
                  day.despesas[idx] = { ...existing, descricao, valor, origem, qr_text, qr_image };
              } else {
                day.despesas.push({
                  id: "dep-" + Date.now(),
                  data: selectedDate,
                  descricao,
                  valor,
                  origem,
                  qr_text,
                  qr_image,
                });
              }
              setStore(store);
              modals.style.display = "none";
              renderCaixa();
            });
          }

          // ======== Recibo Semanal (assinatura eletrônica simples, sem custo) ========
          function showReciboModal() {
            const modals = document.getElementById("modals");
            const modal = modals.querySelector(".modal");

            modal.innerHTML = `
              <style>
                .rmodal h3 { margin:0 0 12px; font-weight:900; color:var(--bella-800); }
                .rmodal .grid2 { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
                .rmodal .grid3 { display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; }
                .rmodal .field { display:grid; gap:6px; }
                .rmodal label { color:#a1125b; font-weight:900; font-size:13px; }
                .rmodal input, .rmodal select, .rmodal textarea {
                  border:2px solid #f3c6d9; border-radius:14px; padding:10px; font-weight:700; color:#a1125b; background:#fff; width:100%; min-width:0;
                }
                .rmodal textarea { resize: vertical; min-height: 64px; }
                .rmodal .row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
                .rmodal .btn { border:1px solid #f3c6d9; background:#fff; color:#a1125b; border-radius:12px; padding:10px 12px; font-weight:900; }
                .rmodal .btn.primary { background:linear-gradient(90deg,var(--bella-500),var(--bella-400)); color:#fff; border:0; }
                .rmodal .sigbox { border:2px dashed #f3c6d9; border-radius:14px; padding:8px; background:#fff7fb; }
                .rmodal .sig-actions { display:flex; justify-content:space-between; gap:8px; margin-top:6px; }
                .rmodal canvas { width:100%; height:160px; display:block; background:#fff; border-radius:10px; }
                .rmodal .hint { color:#64748b; font-weight:700; font-size:12px; }
                .rmodal .footer { display:flex; justify-content:space-between; gap:8px; margin-top:10px; }
                @media(max-width:640px){ .rmodal .grid2, .rmodal .grid3 { grid-template-columns: 1fr; } }
              </style>

              <div class="rmodal">
                <div class="row" style="justify-content:space-between;">
                  <h3>Recibo Semanal — Assinatura</h3>
                  <button class="btn" data-close aria-label="Fechar">Fechar</button>
                </div>

                <div class="grid2">
                  <div class="field">
                    <label>Nome do Autônomo *</label>
                    <input id="rcNome" placeholder="Ex.: Kelly Monice">
                  </div>
                  <div class="field">
                    <label>Valor (R$) *</label>
                    <input id="rcValor" type="number" step="0.01" min="0" placeholder="0,00">
                  </div>
                </div>

                <div class="grid3" style="margin-top:8px;">
                  <div class="field">
                    <label>CPF *</label>
                    <input id="rcCPF" placeholder="Somente números">
                  </div>
                  <div class="field">
                    <label>RG</label>
                    <input id="rcRG" placeholder="Opcional">
                  </div>
                  <div class="field">
                    <label>WhatsApp (p/ enviar código)</label>
                    <input id="rcWhats" placeholder="(DDD) 9xxxx-xxxx">
                  </div>
                </div>

                <div class="grid2" style="margin-top:8px;">
                  <div class="field">
                    <label>Período — De *</label>
                    <input id="rcDe" type="date" value="${selectedDate}">
                  </div>
                  <div class="field">
                    <label>Até *</label>
                    <input id="rcAte" type="date" value="${selectedDate}">
                  </div>
                </div>

                <div class="grid3" style="margin-top:8px;">
                  <div class="field">
                    <label>Cidade</label>
                    <input id="rcCidade" value="Recife">
                  </div>
                  <div class="field">
                    <label>Data do recibo</label>
                    <input id="rcData" type="date" value="${selectedDate}">
                  </div>
                  <div class="field">
                    <label>Nº (gerado)</label>
                    <input id="rcNum" value="REC-${Date.now().toString().slice(-6)}" readonly>
                  </div>
                </div>

                <div class="field" style="margin-top:8px;">
                  <label>Confirmação por código (opcional, recomendado)</label>
                  <div class="row">
                    <button class="btn" id="rcGenCode">Gerar código</button>
                    <div class="hint">Código: <strong id="rcCode">—</strong></div>
                    <button class="btn" id="rcSendWA">Enviar por WhatsApp</button>
                    <input id="rcOtp" placeholder="Digite o código recebido" style="max-width:220px;">
                  </div>
                </div>

                <div class="field" style="margin-top:6px;">
                  <label>Assinatura do Autônomo *</label>
                  <div class="sigbox">
                    <canvas id="sigPad"></canvas>
                    <div class="sig-actions">
                      <span class="hint">Assine com o dedo (celular) ou mouse (PC). Use o botão limpar se necessário.</span>
                      <div>
                        <button class="btn" id="sigClear">Limpar</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="hint" style="margin-top:6px;">
                  Ao gerar, salvaremos o PDF do recibo e um arquivo “evidências.json” contendo hash dos dados, IP (quando disponível),
                  data/hora, dispositivo e a imagem da assinatura. Isso fortalece a prova da assinatura (assinatura eletrônica simples).
                </div>

                <div class="footer">
                  <button class="btn" data-close>Cancelar</button>
                  <button class="btn primary" id="rcGerar">Gerar Recibo (PDF + evidências)</button>
                </div>
              </div>
            `;
            modals.style.display = "flex";

            // Helpers
            const $q = (sel) => modal.querySelector(sel);
            const onlyDigits = (s) => (s || "").replace(/\D+/g, "");

            // OTP
            let currentCode = "";
            $q("#rcGenCode").addEventListener("click", () => {
              currentCode = String(Math.floor(100000 + Math.random() * 900000));
              $q("#rcCode").textContent = currentCode;
            });
            $q("#rcSendWA").addEventListener("click", () => {
              if (!currentCode) {
                alert("Gere um código primeiro.");
                return;
              }
              const nome = ($q("#rcNome").value || "").trim();
              const de = $q("#rcDe").value || "";
              const ate = $q("#rcAte").value || "";
              const text = encodeURIComponent(`Código de confirmação do recibo — Espaço Bella's: ${currentCode}\nProfissional: ${nome}\nPeríodo: ${de} a ${ate}.`);
              const raw = onlyDigits($q("#rcWhats").value);
              const url = raw ? `https://wa.me/${raw}?text=${text}` : `https://wa.me/?text=${text}`;
              window.open(url, "_blank");
            });

            // Signature pad
            const canvas = $q("#sigPad");
            const ctx = canvas.getContext("2d");
            let drawing = false;
            let hasInk = false;

            function resizeCanvas() {
              const dpr = Math.max(1, window.devicePixelRatio || 1);
              const rect = canvas.getBoundingClientRect();
              canvas.width = Math.floor(rect.width * dpr);
              canvas.height = Math.floor(rect.height * dpr);
              ctx.scale(dpr, dpr);
              ctx.lineWidth = 2;
              ctx.lineJoin = "round";
              ctx.lineCap = "round";
              ctx.strokeStyle = "#111827";
              ctx.fillStyle = "#ffffff";
              ctx.clearRect(0, 0, rect.width, rect.height);
            }
            // Need to reset transform on resize
            const initCanvas = () => {
              const rect = canvas.getBoundingClientRect();
              const dpr = Math.max(1, window.devicePixelRatio || 1);
              canvas.width = Math.floor(rect.width * dpr);
              canvas.height = Math.floor(rect.height * dpr);
              ctx.setTransform(1,0,0,1,0,0);
              ctx.scale(dpr, dpr);
              ctx.lineWidth = 2;
              ctx.lineJoin = "round";
              ctx.lineCap = "round";
              ctx.strokeStyle = "#111827";
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, rect.width, rect.height);
            };
            initCanvas();
            window.addEventListener("resize", initCanvas, { once: true });

            const pos = (ev) => {
              const r = canvas.getBoundingClientRect();
              const x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
              const y = (ev.touches ? ev.touches[0].clientY : ev.clientY) - r.top;
              return { x, y };
            };

            function start(ev) {
              drawing = true;
              hasInk = true;
              const p = pos(ev);
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ev.preventDefault();
            }
            function move(ev) {
              if (!drawing) return;
              const p = pos(ev);
              ctx.lineTo(p.x, p.y);
              ctx.stroke();
              ev.preventDefault();
            }
            function end() { drawing = false; }

            canvas.addEventListener("mousedown", start);
            canvas.addEventListener("mousemove", move);
            window.addEventListener("mouseup", end);

            canvas.addEventListener("touchstart", start, { passive: false });
            canvas.addEventListener("touchmove", move, { passive: false });
            canvas.addEventListener("touchend", end);

            $q("#sigClear").addEventListener("click", () => {
              initCanvas();
              hasInk = false;
            });

            // Utils
            async function sha256HexFromArrayBuffer(buf) {
              try {
                const hash = await crypto.subtle.digest("SHA-256", buf);
                return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,"0")).join("");
              } catch { return null; }
            }
            async function sha256HexFromString(text) {
              try {
                const enc = new TextEncoder();
                return await sha256HexFromArrayBuffer(enc.encode(text));
              } catch { return null; }
            }
            async function getPublicIP() {
              try {
                const ctrl = new AbortController();
                const t = setTimeout(() => ctrl.abort(), 2500);
                const r = await fetch("https://api.ipify.org?format=json", { signal: ctrl.signal });
                clearTimeout(t);
                if (!r.ok) return null;
                const j = await r.json();
                return j?.ip || null;
              } catch { return null; }
            }
            function downloadBlob(blob, filename) {
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
            }
            function safeName(s) {
              return String(s || "").normalize("NFKD").replace(/[\\u0300-\\u036f]/g,"").replace(/[^a-z0-9_\\-\\.]+/gi,"-").slice(0,80);
            }

            $q("[data-close]").addEventListener("click", () => (modals.style.display = "none"));

            $q("#rcGerar").addEventListener("click", async () => {
              const nome = ($q("#rcNome").value || "").trim();
              const cpf = onlyDigits($q("#rcCPF").value);
              const rg = ($q("#rcRG").value || "").trim();
              const valor = parseFloat($q("#rcValor").value || "0") || 0;
              const de = $q("#rcDe").value || "";
              const ate = $q("#rcAte").value || "";
              const cidade = ($q("#rcCidade").value || "Recife").trim();
              const dataRec = $q("#rcData").value || selectedDate;
              const numero = ($q("#rcNum").value || ("REC-" + Date.now())).trim();
              const otpIn = ($q("#rcOtp").value || "").trim();

              if (!nome || !cpf || !valor || !de || !ate) {
                alert("Preencha Nome, CPF, Valor e o Período (De/Até).");
                return;
              }
              if (!hasInk) {
                alert("Por favor, colha a assinatura do profissional.");
                return;
              }

              const otpOk = currentCode && otpIn ? (otpIn === currentCode) : false;

              await ensureJsPDF();
              const { jsPDF } = window.jspdf || {};
              const doc = new jsPDF({ unit: "mm", format: "a4" });
              const margin = 18;
              let y = margin;

              // Cabeçalho
              doc.setFont("helvetica", "bold");
              doc.setFontSize(16);
              doc.text("Espaço Bella's — Recibo de Pagamento por Serviços Prestados", margin, y);
              y += 8;

              doc.setFont("helvetica", "normal");
              doc.setFontSize(11);

              const valorBR = (Number(valor) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

              const body =
                `Eu, ${nome}, CPF ${cpf}${rg ? `, RG ${rg}` : ""}, declaro para os devidos fins que recebi nesta data a quantia de ${valorBR} do estabelecimento Espaço Bella's, referente aos serviços prestados no período de ${de} até ${ate}, na condição de autônomo, não caracterizando vínculo empregatício.\n\n` +
                "Declaro ainda estar de pleno acordo com os valores descritos e dou plena quitação dos serviços prestados no período informado.\n\n" +
                `Local e data: ${cidade}, ${new Date(dataRec + "T00:00:00").toLocaleDateString("pt-BR")}\n`;

              const lines = doc.splitTextToSize(body, 210 - margin * 2);
              doc.text(lines, margin, y);
              y += lines.length * 5 + 10;

              // Linha de assinatura
              const sigW = 80, sigH = 28;
              const sigX = margin, sigY = y;
              // Desenha a assinatura
              try {
                const sigData = canvas.toDataURL("image/png");
                doc.addImage(sigData, "PNG", sigX, sigY, sigW, sigH);
              } catch {}
              doc.setDrawColor(51, 65, 85);
              doc.line(sigX, sigY + sigH + 2, sigX + sigW, sigY + sigH + 2);
              doc.setFontSize(10);
              doc.text("Assinatura do Autônomo", sigX, sigY + sigH + 7);
              doc.text(`Nome: ${nome}`, sigX + sigW + 10, sigY + sigH - 2);
              y = sigY + sigH + 16;

              // Rodapé: identificadores
              const createdAt = new Date().toLocaleString("pt-BR");
              doc.setFontSize(9);
              doc.setTextColor(107,114,128);
              doc.text(`Nº: ${numero}`, margin, 297 - margin - 6);
              doc.text(`Gerado em: ${createdAt}`, margin, 297 - margin);

              // Evidências
              const ua = navigator.userAgent || "";
              const ip = await getPublicIP();
              const evidBase = {
                numero,
                createdAt: new Date().toISOString(),
                device: { userAgent: ua, screen: { w: window.screen?.width || null, h: window.screen?.height || null } },
                ip: ip || null,
                profissional: { nome, cpf, rg },
                periodo: { de, ate },
                valor: valor,
                cidade,
                dataRecibo: dataRec,
                otp: currentCode ? { generated: true, provided: !!otpIn, verified: otpOk, code: currentCode, verifiedAt: otpOk ? new Date().toISOString() : null } : { generated: false },
              };
              const evidHash = await sha256HexFromString(JSON.stringify(evidBase));

              // Carimba hash de dados no PDF
              doc.setTextColor(107,114,128);
              doc.setFontSize(8);
              doc.text(`Hash dos dados: ${evidHash || "-"}`, 210 - margin, 297 - margin, { align: "right" });

              // Gerar blob/arraybuffer para hash do PDF
              const pdfArrayBuf = doc.output("arraybuffer");
              const pdfBlob = new Blob([pdfArrayBuf], { type: "application/pdf" });
              const pdfSha = await sha256HexFromArrayBuffer(pdfArrayBuf);

              const sigDataUrl = canvas.toDataURL("image/png");

              const evidFull = {
                ...evidBase,
                dataHash: evidHash || null,
                pdfSha256: pdfSha || null,
                signature: sigDataUrl,
              };

              // Downloads
              const base = `recibo_semanal_${dataRec}_${safeName(nome)}`;
              downloadBlob(pdfBlob, base + ".pdf");
              downloadBlob(new Blob([JSON.stringify(evidFull, null, 2)], { type: "application/json" }), base + "_evidencias.json");

              modals.style.display = "none";
            });
          }

          // ======== Exportação: PDF e Imagem ========

          async function loadScriptOnce(src) {
            if (!window.__loadedScripts) window.__loadedScripts = {};
            if (window.__loadedScripts[src]) return;
            await new Promise((resolve, reject) => {
              const s = document.createElement("script");
              s.src = src;
              s.onload = resolve;
              s.onerror = reject;
              document.head.appendChild(s);
            });
            window.__loadedScripts[src] = true;
          }

          async function ensureJsPDF() {
            if (!(window.jspdf && window.jspdf.jsPDF)) {
              await loadScriptOnce("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js");
            }
            // autotable
            if (!window.jspdf?.autoTable && !window.jsPDF?.API?.autoTable) {
              await loadScriptOnce("https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js");
            }
          }

          async function ensureHtml2Canvas() {
            if (!window.html2canvas) {
              await loadScriptOnce("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js");
            }
          }

          function hexToRgb(hex) {
            const m = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
            return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0,0,0];
          }

          async function exportPDF() {
            await ensureJsPDF();
            const { jsPDF } = window.jspdf || {};
            const doc = new jsPDF({ unit: "mm", format: "a4" });

            const margin = 12;
            const pageW = 210;
            let y = margin;

            const s2 = snapshot(selectedDate);
            const brDate = fmtBR(selectedDate);
            const gen = new Date();
            const genStr = gen.toLocaleString("pt-BR");

            const money = (n) => (Number(n) || 0).toLocaleString("pt-BR", { style:"currency", currency:"BRL" });

            // Header
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.text("Fechamento de Caixa — Espaço Bella's", margin, y);
            y += 7;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text(`Data do caixa: ${brDate}`, margin, y);
            doc.text(`Gerado em: ${genStr}`, pageW - margin, y, { align: "right" });
            y += 5;
            doc.text(`CNPJ: 30.504.701/0001-29`, margin, y);
            y += 5;
            doc.text(`Endereço: R. Rezende, 229 - Iputinga, Recife - PE, 50680-200 — Espaço Bella's`, margin, y);
            y += 5;
            doc.text(`Telefone: (81) 98628-8749`, margin, y);
            y += 6;

            // Cards (3 col x N rows)
            const gap = 5;
            const cols = 3;
            const cardW = (pageW - margin*2 - gap*(cols-1)) / cols;
            const cardH = 18;

            const cards = [
              { t:"Total Entradas (PIX+Cartão+Dinheiro)", v: money(s2.entradas), c:"#059669" },
              { t:"Total PIX", v: money(s2.totalPix), c:"#2563eb" },
              { t:"Total Cartão (Crédito/Débito)", v: money(s2.totalCartao), c:"#7c3aed" },
              { t:"Total Dinheiro (Entrada)", v: money(s2.totalDinheiro), c:"#059669" },
              { t:"Total Débitos (Não Pago)", v: money(s2.totalDebitos), c:"#d97706" },
              { t:"Total Despesas", v: money(s2.totalDespesas), c:"#dc2626" },
              { t:"Dinheiro em Caixa (Calculado)", v: money(s2.dinheiroCalculado), c:"#0f172a" },
              { t:"Dinheiro em Caixa (Informado)", v: money(s2.dinheiroInformado), c:"#334155" },
              { t:"Diferença (Calc − Informado)", v: money(s2.dinheiroCalculado - s2.dinheiroInformado), c:(s2.dinheiroCalculado - s2.dinheiroInformado === 0 ? "#059669" : "#dc2626") },
            ];

            function drawCard(ix, iy, title, value, color) {
              const [r,g,b] = hexToRgb(color);
              doc.setDrawColor(r,g,b);
              doc.setLineWidth(0.6);
              doc.roundedRect(ix, iy, cardW, cardH, 2, 2);

              doc.setTextColor(51,65,85);
              doc.setFont("helvetica", "bold");
              doc.setFontSize(9);
              doc.text(title, ix + 2.5, iy + 5);

              doc.setTextColor(15,23,42);
              doc.setFontSize(12);
              doc.text(value, ix + 2.5, iy + 12.5);
            }

            let row = 0, col = 0, iy = y;
            cards.forEach((c, i) => {
              const ix = margin + col*(cardW + gap);
              drawCard(ix, iy, c.t, c.v, c.c);
              col++;
              if (col >= cols) {
                col = 0;
                iy += cardH + gap;
              }
            });
            y = iy + (col === 0 ? 0 : cardH + gap);
            y += 4;

            // Tabela Atendimentos
            const attRows = (s2.atts || []).map(a => [
              a.cliente || "-",
              (a.servicos || []).map(sv => sv.nome).join(" + ") || a.servico || "-",
              (a.servicos || []).map(sv => sv.profissional).filter(Boolean).join(", ") || a.profissional || "-",
              (a.pagamento || "").toUpperCase(),
              money(a.valor)
            ]);

            if ((attRows || []).length) {
              doc.setTextColor(161,18,91);
              doc.setFont("helvetica","bold");
              doc.setFontSize(12);
              doc.text("Detalhes dos Atendimentos", margin, y);
              y += 3;

              doc.setTextColor(15,23,42);
              doc.autoTable({
                startY: y,
                head: [["Cliente","Serviços","Funcionário","Pagamento","Valor"]],
                body: attRows,
                styles: { font:"helvetica", fontSize: 9, cellPadding: 2 },
                headStyles: { fillColor: [252,231,243], textColor: [161,18,91] },
                columnStyles: { 4: { halign: "right" } },
                theme: "grid",
                margin: { left: margin, right: margin },
              });
              y = (doc.lastAutoTable?.finalY || y) + 6;
            }

            // Tabela Débito Mensal
            const mensalRows = (s2.atts || [])
              .filter(a => a.pagamento === "mensal")
              .map(a => [
                a.cliente || "-",
                (a.servicos || []).map(sv => sv.nome).join(" + ") || a.servico || "-",
                (a.servicos || []).map(sv => sv.profissional).filter(Boolean).join(", ") || a.profissional || "-",
                money(a.valor)
              ]);
            if ((mensalRows || []).length) {
              doc.setTextColor(217,119,6);
              doc.setFont("helvetica","bold");
              doc.setFontSize(12);
              doc.text("Débito Mensal (Não Pago)", margin, y);
              y += 3;

              doc.setTextColor(15,23,42);
              doc.autoTable({
                startY: y,
                head: [["Cliente","Serviços","Funcionário","Valor"]],
                body: mensalRows,
                styles: { font:"helvetica", fontSize: 9, cellPadding: 2 },
                headStyles: { fillColor: [255,247,237], textColor: [180,83,9] },
                columnStyles: { 3: { halign: "right" } },
                theme: "grid",
                margin: { left: margin, right: margin },
              });
              y = (doc.lastAutoTable?.finalY || y) + 6;
            }

            // Tabela Despesas
            const depRows = (s2.deps || []).map(d => [
              d.descricao || "-",
              d.origem === "caixa" ? "Retirada do Caixa" : "Outro",
              (d.qr_text || d.qr_image) ? "QR" : "—",
              money(d.valor)
            ]);
            doc.setTextColor(161,18,91);
            doc.setFont("helvetica","bold");
            doc.setFontSize(12);
            doc.text("Detalhes das Despesas", margin, y);
            y += 3;
            doc.setTextColor(15,23,42);
            doc.autoTable({
              startY: y,
              head: [["Descrição","Origem","QR","Valor"]],
              body: depRows,
              styles: { font:"helvetica", fontSize: 9, cellPadding: 2 },
              headStyles: { fillColor: [254,226,226], textColor: [153,27,27] },
              columnStyles: { 3: { halign: "right" } },
              theme: "grid",
              margin: { left: margin, right: margin },
            });
            y = (doc.lastAutoTable?.finalY || y) + 6;

            // Ledger resumo final
            const diff = s2.dinheiroCalculado - s2.dinheiroInformado;
            doc.setFont("helvetica","bold");
            doc.setFontSize(12);
            doc.text("Resumo do Caixa", margin, y);
            y += 5;
            doc.setFont("helvetica","normal");
            doc.setFontSize(10);
            doc.text(`Dinheiro em Caixa (Informado): ${money(s2.dinheiroInformado)}`, margin, y); y+=5;
            doc.text(`Entradas em Dinheiro: ${money(s2.totalDinheiro)}`, margin, y); y+=5;
            doc.text(`Retiradas do Caixa (Despesas): ${money(s2.totalDespesasCaixa)}`, margin, y); y+=5;
            doc.text(`Dinheiro em Caixa (Calculado): ${money(s2.dinheiroCalculado)}`, margin, y); y+=5;
            doc.text(`Diferença (Calc − Informado): ${money(diff)}`, margin, y);
            y += 8;

            // Footer
            doc.setFontSize(9);
            doc.setTextColor(107,114,128);
            doc.text(`Gerado em ${genStr}`, margin, 297 - margin);

            const filename = `fechamento-caixa_${selectedDate}.pdf`;
            doc.save(filename);
          }

          async function exportImage() {
            await ensureHtml2Canvas();

            // Ensure QR generator for embedding QR codes of expense receipts
            async function ensureQRious() {
              if (!window.QRious) {
                await loadScriptOnce("https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js");
              }
            }
            await ensureQRious();

            const s2 = snapshot(selectedDate);
            const brDate = fmtBR(selectedDate);
            const genStr = new Date().toLocaleString("pt-BR");
            const money = (n) => (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
            const compact = (document.getElementById("cxExportCompact")?.checked ?? (localStorage.getItem("bella_export_compact") === "1"));
            const legible = (document.getElementById("cxExportLegible")?.checked ?? (localStorage.getItem("bella_export_legible") === "1"));
            const legibleCompact = (document.getElementById("cxExportLegibleCompact")?.checked ?? (localStorage.getItem("bella_export_legible_compact") === "1"));
            const useCompact = legible ? legibleCompact : compact;
            const legendHTML = legible ? `<div style="display:flex; gap:8px; flex-wrap:wrap; margin:4px 0 8px;">
              <span style="display:inline-flex;align-items:center;gap:6px;background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;padding:4px 8px;border-radius:999px;font-weight:800;">PIX</span>
              <span style="display:inline-flex;align-items:center;gap:6px;background:#f3e8ff;border:1px solid #e9d5ff;color:#6d28d9;padding:4px 8px;border-radius:999px;font-weight:800;">Cartão</span>
              <span style="display:inline-flex;align-items:center;gap:6px;background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;padding:4px 8px;border-radius:999px;font-weight:800;">Dinheiro</span>
              <span style="display:inline-flex;align-items:center;gap:6px;background:#fff7ed;border:1px solid #fed7aa;color:#b45309;padding:4px 8px;border-radius:999px;font-weight:800;">Mensal</span>
            </div>` : ``;

            // Group attendances by client and explode multiple services
            function groupAttsByClient(atts) {
              const map = {};
              (atts || []).forEach((a) => {
                const cliente = a.cliente || "-";
                if (!map[cliente]) map[cliente] = { items: [], obs: [] };
                if (a.obs) map[cliente].obs.push(a.obs);
                const pagamento = a.pagamento || "";
                if (Array.isArray(a.servicos) && a.servicos.length) {
                  a.servicos.forEach((sv) => {
                    map[cliente].items.push({
                      servico: sv?.nome || a.servico || "-",
                      profissional: sv?.profissional || a.profissional || "-",
                      pagamento: sv?.pagamento || pagamento,
                      valor: Number(sv?.valor ?? 0) || 0,
                    });
                  });
                } else {
                  map[cliente].items.push({
                    servico: a.servico || "-",
                    profissional: a.profissional || "-",
                    pagamento,
                    valor: Number(a.valor ?? 0) || 0,
                  });
                }
              });
              return map;
            }

            function renderGroupedAttsTable(groups, isCompact) {
              const entries = Object.entries(groups || {});
              if (!entries.length) {
                return `<div class="muted">Sem atendimentos para esta data</div>`;
              }
              const paymentSummary = (items) => {
                const counts = { pix: 0, cartao: 0, dinheiro: 0, mensal: 0 };
                (items || []).forEach((it) => {
                  const p = (it.pagamento || "").toLowerCase();
                  if (counts[p] != null) counts[p] += 1;
                });
                const used = Object.entries(counts).filter(([, v]) => v > 0);
                const uniform = used.length <= 1;
                const label = used
                  .map(([k, v]) => (k.toUpperCase() + (v > 1 ? ` ${v}` : "")))
                  .join(" • ");
                return { counts, uniform, label, unique: used.map(([k]) => k) };
              };

              const headPad = isCompact ? "6px 8px" : "10px 12px";
              const chipPad = isCompact ? "3px 6px" : "4px 8px";
              const chipFont = isCompact ? "11px" : "12px";
              const groupRadius = isCompact ? "10px" : "14px";
              const groupMargin = isCompact ? "8px 0" : "10px 0";
              const bodyPad = isCompact ? "6px 8px" : "8px 10px";
              const cellPad = isCompact ? "6px 8px" : "8px 10px";
              const rowSpace = isCompact ? 4 : 6;

              let html = "";
              entries.forEach(([cliente, data]) => {
                const items = (data && data.items) || [];
                if (!items.length) return;
                const total = items.reduce((acc, it) => acc + (Number(it.valor) || 0), 0);
                const stats = paymentSummary(items);
                const showPayCol = !stats.uniform;

                const obsHtml =
                  (data && data.obs && data.obs.length)
                    ? `<div class="client-obs" style="color:#64748b; font-size:12px;">${data.obs.map((o) => String(o)).join(" • ")}</div>`
                    : "";

                const header = `
                  <div class="client-group" style="border:1px solid #f1e6ee; border-radius:${groupRadius}; margin:${groupMargin}; overflow:hidden;">
                    <div class="client-head" style="display:flex; align-items:center; justify-content:space-between; gap:10px; background:#fff7fb; border-bottom:1px solid #f9e0ea; padding:${headPad};">
                      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                        <div class="stripe" style="width:4px; height:${isCompact ? "18px" : "20px"}; background:#ec4899; border-radius:999px;"></div>
                        <div class="client-name" style="font-weight:900; color:#9d174d; font-size:${isCompact ? "15px" : "16px"};">${cliente}</div>
                        <div class="chips" style="display:flex; gap:6px; flex-wrap:wrap;">
                          <span class="chip" style="background:#fdf2f8; border:1px solid #f3c6d9; color:#9d174d; font-weight:800; font-size:${chipFont}; padding:${chipPad}; border-radius:999px;">Total ${money(total)}</span>
                          <span class="chip" style="background:#fdf2f8; border:1px solid #f3c6d9; color:#9d174d; font-weight:800; font-size:${chipFont}; padding:${chipPad}; border-radius:999px;">${items.length} serviços</span>
                          <span class="chip" style="background:#fdf2f8; border:1px solid #f3c6d9; color:#9d174d; font-weight:800; font-size:${chipFont}; padding:${chipPad}; border-radius:999px;">${stats.uniform ? (stats.unique[0] || "").toUpperCase() : stats.label}</span>
                        </div>
                      </div>
                      ${obsHtml}
                    </div>
                    <div class="client-body" style="padding:${bodyPad};">
                      <table class="svc-table" style="width:100%; border-collapse:separate; border-spacing:0 ${rowSpace}px; font-size:13px;">
                        <thead>
                          <tr>
                            <th style="text-align:left; color:#9d174d; font-weight:800;">Serviço</th>
                            <th style="text-align:left; color:#9d174d; font-weight:800;">Profissional</th>
                            ${showPayCol ? `<th style="text-align:left; color:#9d174d; font-weight:800;">Pagamento</th>` : ``}
                            <th style="text-align:right; color:#9d174d; font-weight:800;">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${items
                            .map((it) => `
                              <tr>
                                <td style="padding:${cellPad}; border:1px solid #f1e6ee; background:#fff;">${it.servico || "-"}</td>
                                <td style="padding:${cellPad}; border:1px solid #f1e6ee; background:#fff;">${it.profissional || "-"}</td>
                                ${showPayCol ? `<td style="padding:${cellPad}; border:1px solid #f1e6ee; background:#fff;">${(it.pagamento || "").toUpperCase()}</td>` : ``}
                                <td class="num" style="padding:${cellPad}; border:1px solid #f1e6ee; background:#fff; text-align:right; font-weight:900;">${money(it.valor)}</td>
                              </tr>
                            `)
                            .join("")}
                        </tbody>
                      </table>
                    </div>
                  </div>
                `;
                html += header;
              });
              return html;
            }

            // Novo layout legível (cards por cliente com observação destacada)
            function renderLegibleGroups(groups, isCompact) {
              const entries = Object.entries(groups || {});
              if (!entries.length) {
                return `<div class="muted">Sem atendimentos para esta data</div>`;
              }
              const paySummary = (items) => {
                const counts = { pix:0, cartao:0, dinheiro:0, mensal:0 };
                items.forEach(it => { const p=(it.pagamento||"").toLowerCase(); if (p in counts) counts[p]++; });
                const used = Object.entries(counts).filter(([,v])=>v>0);
                const uniform = used.length<=1;
                const label = used.map(([k,v])=>k.toUpperCase() + (v>1?` ${v}`:"")).join(" • ");
                const unique = used.map(([k])=>k);
                return { uniform, label, unique };
              };

              const padHead = isCompact ? "8px 10px" : "12px 14px";
              const padBody = isCompact ? "8px" : "10px";
              const padCell = isCompact ? "6px 8px" : "8px 10px";
              const fsTitle = isCompact ? "15px" : "16px";
              const rowGap = isCompact ? 4 : 6;

              let html = "";
              entries.forEach(([cliente, data]) => {
                const items = (data?.items)||[];
                if (!items.length) return;
                const total = items.reduce((s,it)=>s+(Number(it.valor)||0),0);
                const ps = paySummary(items);
                const showPay = !ps.uniform;

                const obsLine = (data?.obs?.length)
                  ? `<div style="padding:${isCompact ? "6px 10px" : "8px 12px"}; background:#f8fafc; border-bottom:1px solid #e5e7eb; color:#334155; font-weight:700;">🧾 Observações: ${data.obs.map(String).join(" • ")}</div>`
                  : "";

                html += `
                  <div style="border:2px solid #f1e6ee; border-radius:14px; overflow:hidden; background:#fff; margin:${isCompact ? "6px 0" : "8px 0"};">
                    <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; background:#fff; padding:${padHead}; border-bottom:1px solid #f1e6ee;">
                      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                        <div style="width:4px; height:${isCompact ? "18px":"20px"}; background:#ec4899; border-radius:999px;"></div>
                        <div style="font-weight:900; color:#9d174d; font-size:${fsTitle};">${cliente}</div>
                        <div style="display:flex; gap:6px; flex-wrap:wrap;">
                          <span style="display:inline-flex;align-items:center;gap:6px;background:#fdf2f8;border:1px solid #f3c6d9;color:#9d174d;padding:${isCompact ? "3px 6px":"4px 8px"};border-radius:999px;font-weight:800;">Total ${money(total)}</span>
                          <span style="display:inline-flex;align-items:center;gap:6px;background:#fdf2f8;border:1px solid #f3c6d9;color:#9d174d;padding:${isCompact ? "3px 6px":"4px 8px"};border-radius:999px;font-weight:800;">${items.length} serviços</span>
                          <span style="display:inline-flex;align-items:center;gap:6px;background:#fdf2f8;border:1px solid #f3c6d9;color:#9d174d;padding:${isCompact ? "3px 6px":"4px 8px"};border-radius:999px;font-weight:800;">${ps.uniform ? (ps.unique[0]||"").toUpperCase() : ps.label}</span>
                        </div>
                      </div>
                    </div>
                    ${obsLine}
                    <div style="padding:${padBody};">
                      <table style="width:100%; border-collapse:separate; border-spacing:0 ${rowGap}px;">
                        <thead>
                          <tr>
                            <th style="text-align:left; color:#9d174d; font-weight:800;">Serviço</th>
                            <th style="text-align:left; color:#9d174d; font-weight:800;">Profissional</th>
                            ${showPay ? `<th style="text-align:left; color:#9d174d; font-weight:800;">Pagamento</th>` : ``}
                            <th style="text-align:right; color:#9d174d; font-weight:800;">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${items.map(it => `
                            <tr>
                              <td style="padding:${padCell}; border:1px solid #f1e6ee; background:#fff;">${it.servico || "-"}</td>
                              <td style="padding:${padCell}; border:1px solid #f1e6ee; background:#fff;">${it.profissional || "-"}</td>
                              ${showPay ? `<td style="padding:${padCell}; border:1px solid #f1e6ee; background:#fff;">${(it.pagamento||"").toUpperCase()}</td>` : ``}
                              <td style="padding:${padCell}; border:1px solid #f1e6ee; background:#fff; text-align:right; font-weight:900;">${money(it.valor)}</td>
                            </tr>
                          `).join("")}
                        </tbody>
                      </table>
                    </div>
                  </div>
                `;
              });
              return html;
            }

            // Build QR image for expense proof if qr_text exists
            function qrImgFor(text) {
              try {
                if (!text) return "";
                const qr = new window.QRious({ value: text, size: useCompact ? 105 : 120, level: "H", background: "white", foreground: "#111827" });
                if (typeof qr.toDataURL === "function") return qr.toDataURL();
                if (qr.image && qr.image.src) return qr.image.src;
                if (qr.canvas && qr.canvas.toDataURL) return qr.canvas.toDataURL("image/png");
              } catch {}
              return "";
            }

            // Compose HTML strings for tables
            const grouped = groupAttsByClient(s2.atts || []);
            const attTableHTML = legible ? renderLegibleGroups(grouped, useCompact) : renderGroupedAttsTable(grouped, useCompact);

            const mensalHTML = (() => {
              const filtered = (s2.atts || [])
                .map(a => ({ ...a, servicos: (a.servicos || []).filter(sv => (sv.pagamento || a.pagamento) === "mensal") }))
                .filter(a => (a.servicos || []).length);
              const has = filtered.length > 0;
              const groupsHtml = legible ? renderLegibleGroups(groupAttsByClient(filtered), useCompact) : renderGroupedAttsTable(groupAttsByClient(filtered), useCompact);
              return has ? `<div class="sec"><h3>Débito Mensal (Não Pago)</h3>${groupsHtml}</div>` : "";
            })();

            const payAgg = (() => {
              const sums = { pix:0, cartao:0, dinheiro:0, mensal:0 };
              const cnt = { pix:0, cartao:0, dinheiro:0, mensal:0 };
              (s2.atts || []).forEach(a => {
                if (Array.isArray(a.servicos) && a.servicos.length) {
                  a.servicos.forEach(sv => {
                    const v = Number(sv.valor)||0;
                    const p = sv.pagamento || a.pagamento;
                    if (p === "pix") { sums.pix += v; cnt.pix++; }
                    else if (p === "cartao") { sums.cartao += v; cnt.cartao++; }
                    else if (p === "dinheiro") { sums.dinheiro += v; cnt.dinheiro++; }
                    else if (p === "mensal") { sums.mensal += v; cnt.mensal++; }
                  });
                } else {
                  const v = Number(a.valor)||0;
                  const p = a.pagamento;
                  if (p === "pix") { sums.pix += v; cnt.pix++; }
                  else if (p === "cartao") { sums.cartao += v; cnt.cartao++; }
                  else if (p === "dinheiro") { sums.dinheiro += v; cnt.dinheiro++; }
                  else if (p === "mensal") { sums.mensal += v; cnt.mensal++; }
                }
              });
              return { sums, cnt };
            })();

            const paySummaryHTML = `
              <div class="sec">
                <h3>Resumo por Forma de Pagamento</h3>
                <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;">
                  <div class="r-card blue"><div class="t">PIX</div><div class="v">${money(payAgg.sums.pix)}</div><div class="muted sm">(${payAgg.cnt.pix} itens)</div></div>
                  <div class="r-card purple"><div class="t">Cartão</div><div class="v">${money(payAgg.sums.cartao)}</div><div class="muted sm">(${payAgg.cnt.cartao} itens)</div></div>
                  <div class="r-card green"><div class="t">Dinheiro</div><div class="v">${money(payAgg.sums.dinheiro)}</div><div class="muted sm">(${payAgg.cnt.dinheiro} itens)</div></div>
                  <div class="r-card amber"><div class="t">Mensal (Débito)</div><div class="v">${money(payAgg.sums.mensal)}</div><div class="muted sm">(${payAgg.cnt.mensal} itens)</div></div>
                </div>
              </div>
            `;

            const depTableHTML =
              (s2.deps || []).length
                ? `
                  <table>
                    <thead><tr><th>Descrição</th><th>Origem</th><th>Comprovante</th><th>Valor</th></tr></thead>
                    <tbody>
                      ${(s2.deps || [])
                        .map((d) => {
                          const proof = d.qr_text
                            ? `<img class="qrimg" src="${qrImgFor(d.qr_text)}" alt="QR da nota">`
                            : `<span class="muted">—</span>`;
                          return `
                            <tr>
                              <td>${d.descricao}</td>
                              <td>${d.origem === "caixa" ? "Retirada do Caixa" : "Outro"}</td>
                              <td class="qr-cell">${proof}</td>
                              <td class="num">${money(d.valor)}</td>
                            </tr>
                          `;
                        })
                        .join("")}
                    </tbody>
                  </table>
                `
                : `<div class="muted">Sem despesas para esta data</div>`;

            const gridClass = useCompact ? "client-grid grid2" : "client-grid";

            const container = document.createElement("div");
            container.id = "report-capture";
            container.style.position = "fixed";
            container.style.left = "-10000px";
            container.style.top = "0";
            container.style.width = "980px";
            container.style.background = "#fff";
            container.style.color = "#0f172a";
            container.style.padding = "20px";
            container.style.fontFamily = "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";

            container.innerHTML = `
              <style>
                .r-title { font-weight:900; font-size:26px; color:#9d174d; margin-bottom:4px; }
                .r-sub { color:#475569; font-weight:700; }
                .r-grid { display:grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap:10px; margin:12px 0 6px; }
                .r-card { border:2px solid #f1e6ee; border-radius:12px; padding:10px; }
                .r-card.green { border-color:#10b981; }
                .r-card.blue { border-color:#2563eb; }
                .r-card.purple { border-color:#7c3aed; }
                .r-card.amber { border-color:#d97706; }
                .r-card.red { border-color:#dc2626; }
                .r-card .t { color:#475569; font-weight:800; font-size:12px; }
                .r-card .v { color:#0f172a; font-weight:900; font-size:18px; margin-top:4px; }
                .sec { margin-top:14px; }
                .sec h3 { margin: 0 0 6px; color:#9d174d; font-size:16px; }
                .client-grid { display:block; }
                .client-grid.grid2 { display:grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap:8px; }
                table { width:100%; border-collapse:separate; border-spacing:0 ${compact ? 4 : 6}px; font-size:13px; }
                th { text-align:left; color:#9d174d; font-weight:800; }
                td, th { padding:${compact ? "6px 8px" : "8px 10px"}; border:1px solid #f1e6ee; background:#fff; }
                td.num { text-align:right; font-weight:900; }
                .muted { color:#64748b; }
                .sm { font-size:12px; }
                .mode-badge { displaypx; color:#64748b; font-size:12px; }
                .r-client-cell { background:#fff7fb; border-width:2px; border-color:#f1e6ee; min-width:180px; vertical-align:top; }
                .r-client-cell .nm { font-weight:900; color:#9d174d; }
                .qrimg { width:${compact ? 105 : 120}px; height:${compact ? 105 : 120}px; object-fit:contain; border:1px solid #e5e7eb; border-radius:8px; background:#fff; }
                .qr-cell { text-align:center; }
              </style>

              <div style="display:flex; align-items:flex-end; justify-content:space-between; gap: 10px; margin-bottom: 4px;">
                <div>
                  <div class="r-title" style="font-size:26px;">Fechamento de Caixa — Espaço Bella's</div>
                  <div class="r-day" style="font-size:22px; font-weight:900; color:#7a0f3f;">Dia: <strong>${brDate}</strong></div>
                </div>
                <div class="r-meta" style="color:#64748b; font-weight:700; text-align:right;">Gerado em: ${genStr}</div>
              </div>
              ${legendHTML}

              <div class="r-grid">
                <div class="r-card green"><div class="t">Total Entradas (PIX+Cartão+Dinheiro)</div><div class="v">${money(s2.entradas)}</div></div>
                <div class="r-card blue"><div class="t">Total PIX</div><div class="v">${money(s2.totalPix)}</div></div>
                <div class="r-card purple"><div class="t">Total Cartão</div><div class="v">${money(s2.totalCartao)}</div></div>
                <div class="r-card green"><div class="t">Total Dinheiro (Entrada)</div><div class="v">${money(s2.totalDinheiro)}</div></div>
                <div class="r-card amber"><div class="t">Total Débitos (Não Pago)</div><div class="v">${money(s2.totalDebitos)}</div></div>
                <div class="r-card red"><div class="t">Total Despesas</div><div class="v">${money(s2.totalDespesas)}</div></div>
                <div class="r-card"><div class="t">Dinheiro em Caixa (Calculado)</div><div class="v">${money(s2.dinheiroCalculado)}</div></div>
                <div class="r-card"><div class="t">Dinheiro em Caixa (Informado)</div><div class="v">${money(s2.dinheiroInformado)}</div></div>
                <div class="r-card ${ (s2.dinheiroCalculado - s2.dinheiroInformado) === 0 ? 'green' : 'red' }"><div class="t">Diferença</div><div class="v">${money(s2.dinheiroCalculado - s2.dinheiroInformado)}</div></div>
              </div>
              ${paySummaryHTML}

              <div class="sec">
                <h3>Detalhes dos Atendimentos</h3>
                <div class="${gridClass}">${attTableHTML}</div>
              </div>

              ${mensalHTML}

              <div class="sec">
                <h3>Detalhes das Despesas</h3>
                ${depTableHTML}
              </div>

              <div class="sec">
                <h3>Resumo do Caixa</h3>
                <table>
                  <tbody>
                    <tr><td>Dinheiro em Caixa (Informado)</td><td class="num">${money(s2.dinheiroInformado)}</td></tr>
                    <tr><td>Entradas em Dinheiro</td><td class="num">${money(s2.totalDinheiro)}</td></tr>
                    <tr><td>Retiradas do Caixa (Despesas)</td><td class="num">${money(s2.totalDespesasCaixa)}</td></tr>
                    <tr><td><strong>Dinheiro em Caixa (Calculado)</strong></td><td class="num"><strong>${money(s2.dinheiroCalculado)}</strong></td></tr>
                    <tr><td>Diferença</td><td class="num">${money(s2.dinheiroCalculado - s2.dinheiroInformado)}</td></tr>
                  </tbody>
                </table>
              </div>

              <div class="foot">
                <div style="margin-bottom:4px;">CNPJ: 30.504.701/0001-29 • Endereço: R. Rezende, 229 - Iputinga, Recife - PE, 50680-200 • Tel: (81) 98628-8749</div>
                <div>Gerado em ${genStr}</div>
              </div>
            `;

            document.body.appendChild(container);
            const canvas = await html2canvas(container, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
            const dataUrl = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = `fechamento-caixa_${selectedDate}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            container.remove();
          }
        }

        // Primeira renderização
        renderCaixa();
      }

      // Interações específicas do Estoque (CRUD local com câmera, export, filtros)
      if (hash === "/estoque") {
        const SKEY = "bella_stock_v1";

        function loadScriptOnce(src) {
          if (!window.__loadedScripts) window.__loadedScripts = {};
          if (window.__loadedScripts[src]) return Promise.resolve();
          return new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = src;
            s.onload = () => resolve();
            s.onerror = reject;
            document.head.appendChild(s);
          }).then(() => (window.__loadedScripts[src] = true));
        }

        function uid(p) {
          return `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        }

        function getStore() {
          try {
            const raw = localStorage.getItem(SKEY);
            if (raw) return JSON.parse(raw);
          } catch {}
          return { categorias: [], locais: [], produtos: [], movimentos: [] };
        }
        function setStore(s) {
          localStorage.setItem(SKEY, JSON.stringify(s));
        }

        function ensureDefaults() {
          const s = getStore();
          if (!s._initialized) {
            if (!s.categorias.length) {
              s.categorias = [
                { id: uid("cat"), nome: "Manicure/Pedicure" },
                { id: uid("cat"), nome: "Coloração" },
                { id: uid("cat"), nome: "Equipamentos" },
              ];
            }
            if (!s.locais.length) {
              s.locais = [
                { id: uid("loc"), nome: "Armário" },
                { id: uid("loc"), nome: "Recepção" },
              ];
            }
            s._initialized = true;
            setStore(s);
          }
        }

        function money(n) {
          return (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        }

        function saldoDoProduto(prodId) {
          const s = getStore();
          let total = 0;
          (s.movimentos || []).forEach((m) => {
            if (m.produto_id === prodId) {
              if (m.tipo === "entrada") total += Number(m.quantidade) || 0;
              else if (m.tipo === "saida") total -= Number(m.quantidade) || 0;
              else total += Number(m.quantidade) || 0; // ajuste pode ser negativo
            }
          });
          return total;
        }

        function computeAlertsLocal(p) {
          const alerts = { baixo: false, validadeAtencao: false, validadeCritico: false, diasParaVencer: null };
          const saldo = saldoDoProduto(p.id);
          if (saldo <= Number(p.alerta_estoque_qtd || 0)) alerts.baixo = true;
          if (p.validade) {
            try {
              const today = new Date();
              const d0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
              const v = new Date(p.validade).getTime();
              const diff = Math.floor((v - d0) / 86400000);
              alerts.diasParaVencer = diff;
              if (diff < 0) alerts.validadeCritico = true;
              else if (diff <= Number(p.alerta_validade_dias || 7)) alerts.validadeAtencao = true;
            } catch {}
          }
          return alerts;
        }

        function exportProdutosCSVLocal(produtos) {
          const header = [
            "Nome",
            "Código de Barras",
            "Categoria",
            "Local",
            "Unidade",
            "Fator Pacote",
            "Fracionável",
            "Validade",
            "Alerta Validade (dias)",
            "Alerta Estoque (qtd)",
            "Saldo Atual",
          ];
          const esc = (s) => {
            s = String(s ?? "");
            return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          };
          const s = getStore();
          const rows = produtos.map((p) => {
            const cat = (s.categorias.find((c) => c.id === p.categoria_id) || {}).nome || "";
            const loc = (s.locais.find((l) => l.id === p.local_id) || {}).nome || "";
            return [
              esc(p.nome),
              esc(p.codigo_barras || ""),
              esc(cat),
              esc(loc),
              p.unidade || "un",
              String(p.fator_pacote || 1),
              p.fracionavel ? "Sim" : "Não",
              p.validade || "",
              String(p.alerta_validade_dias ?? 7),
              String(p.alerta_estoque_qtd ?? 1),
              String(saldoDoProduto(p.id)),
            ];
          });
          const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `estoque_produtos_${new Date().toISOString().slice(0, 10)}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        }

        async function ensureXLSX() {
          if (!window.XLSX) {
            await loadScriptOnce("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js");
          }
        }

        async function exportProdutosXLSXLocal(produtos) {
          await ensureXLSX();
          const s = getStore();
          const catName = (id) => (s.categorias.find((c) => c.id === id) || {}).nome || "";
          const locName = (id) => (s.locais.find((l) => l.id === id) || {}).nome || "";
          const data = produtos.map((p) => ({
            Nome: p.nome,
            "Código de Barras": p.codigo_barras || "",
            Categoria: catName(p.categoria_id),
            Local: locName(p.local_id),
            Unidade: p.unidade || "un",
            "Fator Pacote": p.fator_pacote || 1,
            Fracionável: p.fracionavel ? "Sim" : "Não",
            Validade: p.validade || "",
            "Alerta Validade (dias)": p.alerta_validade_dias ?? 7,
            "Alerta Estoque (qtd)": p.alerta_estoque_qtd ?? 1,
            "Saldo Atual": saldoDoProduto(p.id),
          }));
          const ws = XLSX.utils.json_to_sheet(data);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Produtos");
          XLSX.writeFile(wb, `estoque_produtos_${new Date().toISOString().slice(0,10)}.xlsx`);
        }

        function compressImageToDataUrl(file, maxW = 800, quality = 0.8) {
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
              img.src = fr.result;
            };
            fr.onerror = reject;
            fr.readAsDataURL(file);
          });
        }

        async function detectBarcodeFromFile(file) {
          try {
            if (window.BarcodeDetector) {
              const detector = new window.BarcodeDetector({ formats: ["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"] });
              const bmp = await createImageBitmap(file);
              const res = await detector.detect(bmp);
              if (res && res.length) return res[0].rawValue || res[0].raw || null;
            }
          } catch (e) {
            console.warn("BarcodeDetector falhou:", e);
          }
          return null;
        }

        function renderEstoque() {
          ensureDefaults();
          const s = getStore();

          // estado de filtros
          const params = new URLSearchParams(location.hash.split("?")[1] || "");
          let q = params.get("q") || "";
          let cat = params.get("cat") || "";
          let loc = params.get("loc") || "";

          const catName = (id) => (s.categorias.find((c) => c.id === id) || {}).nome || "";
          const locName = (id) => (s.locais.find((l) => l.id === id) || {}).nome || "";

          function filteredProdutos() {
            return (s.produtos || [])
              .filter((p) => (cat ? p.categoria_id === cat : true))
              .filter((p) => (loc ? p.local_id === loc : true))
              .filter((p) => {
                if (!q) return true;
                const value = `${p.nome} ${(p.codigo_barras || "")} ${catName(p.categoria_id)} ${locName(p.local_id)}`.toLowerCase();
                return value.includes(q.toLowerCase());
              })
              .sort((a, b) => a.nome.localeCompare(b.nome));
          }

          function productRow(p) {
            const saldo = saldoDoProduto(p.id);
            const alert = computeAlertsLocal(p);
            const badges = [];
            if (alert.baixo) badges.push(`<span class="badge warn">Baixo estoque</span>`);
            if (alert.validadeCritico) badges.push(`<span class="badge danger">Vencido</span>`);
            else if (alert.validadeAtencao) badges.push(`<span class="badge warn">Validade em ${alert.diasParaVencer}d</span>`);
            return `
              <div class="stock-row" data-prod="${p.id}">
                <div class="left">
                  <div class="thumb">${(p.nome || "?").slice(0,1).toUpperCase()}</div>
                  <div>
                    <div style="font-weight:900;color:#7a0f3f;">${p.nome}</div>
                    <div class="muted">${catName(p.categoria_id) || "Sem categoria"} • ${locName(p.local_id) || "Sem local"} • ${saldo} ${p.unidade}${p.unidade==="pct" && p.fator_pacote ? ` (x${p.fator_pacote})` : ""} ${p.codigo_barras ? `• #${p.codigo_barras}` : ""}</div>
                  </div>
                </div>
                <div>
                  ${badges.join(" ")}
                  <button class="btn" data-act="sub">−1</button>
                  <button class="btn" data-act="add">+1</button>
                  <button class="btn" data-act="edit">Editar</button>
                </div>
              </div>
            `;
          }

          // estilo
          const style = `
            <style>
              .stock-hero h1 { margin: 0 0 6px; font-size: 28px; color: var(--bella-800); font-weight: 900; letter-spacing: .2px; }
              .stock-hero p { margin: 0; color: #9d3a69; font-weight: 600; }
              .stock-actions{ display:flex; gap:10px; flex-wrap:wrap; margin:12px 0; }
              .btn { border-radius:12px; padding:10px 14px; border:1px solid #f1e6ee; background:#fff; font-weight:900; color:#a1125b; box-shadow: var(--shadow); }
              .btn.primary{ background:linear-gradient(90deg,var(--bella-500),var(--bella-400)); color:#fff; border:0; }
              .stock-filters { display:grid; gap:10px; margin:12px 0; }
              .stock-filters .field { display:grid; gap:6px; }
              .stock-filters input, .stock-filters select { border:1px solid #f3c6d9; border-radius:12px; padding:10px; font-weight:700; color:#a1125b; background:#fff; }
              .stock-list { display:grid; gap:10px; }
              .stock-row { display:flex; align-items:center; justify-content:space-between; gap:10px; border:1px solid #f1e6ee; background:#fff; border-radius:12px; padding:12px; }
              .stock-row .left { display:flex; gap:10px; align-items:center; }
              .thumb { width:44px; height:44px; border-radius:12px; background:#fff; border:1px solid #f1e6ee; display:grid; place-items:center; color:#a1125b; font-weight:900; }
              .badge { display:inline-block; padding:6px 10px; border-radius:999px; font-weight:800; margin-right:6px; }
              .warn { background:#fff7ed; border:1px solid #fed7aa; color:#b45309; }
              .danger { background:#fee2e2; border:1px solid #fecaca; color:#b91c1c; }
            </style>
          `;

          page.innerHTML = `
            ${style}
            <div class="stock-hero">
              <h1>Estoque</h1>
              <p>Cadastro, scanner por câmera (foto), histórico e exportações — preview estático com dados salvos neste navegador.</p>
            </div>

            <div class="stock-actions">
              <button class="btn primary" id="stNovo">+ Novo Produto</button>
              <button class="btn" id="stManage">Gerenciar Categorias/Locais</button>
              <button class="btn" id="stCSV">Exportar CSV</button>
              <button class="btn" id="stXLSX">Exportar XLSX</button>
              <button class="btn" id="stRefresh">Atualizar</button>
            </div>

            <section class="section stock-filters">
              <div class="field">
                <label class="muted">Buscar</label>
                <input id="stQ" placeholder="Nome, código de barras ou categoria" value="${q}">
              </div>
              <div class="field">
                <label class="muted">Categoria</label>
                <select id="stCat">
                  <option value="">Todas</option>
                  ${s.categorias.map((c) => `<option value="${c.id}" ${c.id===cat?"selected":""}>${c.nome}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <label class="muted">Local</label>
                <select id="stLoc">
                  <option value="">Todos</option>
                  ${s.locais.map((l) => `<option value="${l.id}" ${l.id===loc?"selected":""}>${l.nome}</option>`).join("")}
                </select>
              </div>
            </section>

            <section class="section">
              <h2 style="margin:0 0 8px;">Produtos</h2>
              <div class="stock-list" id="stList">
                ${filteredProdutos().map(productRow).join("") || `<div class="muted" style="padding:12px;">Nenhum produto cadastrado. Clique em “+ Novo Produto”.</div>`}
              </div>
            </section>
          `;

          // listeners de filtros
          page.querySelector("#stQ").addEventListener("input", (e) => {
            q = e.target.value || "";
            const params = new URLSearchParams({ q, cat, loc });
            location.hash = "/estoque?" + params.toString();
          });
          page.querySelector("#stCat").addEventListener("change", (e) => {
            cat = e.target.value || "";
            const params = new URLSearchParams({ q, cat, loc });
            location.hash = "/estoque?" + params.toString();
          });
          page.querySelector("#stLoc").addEventListener("change", (e) => {
            loc = e.target.value || "";
            const params = new URLSearchParams({ q, cat, loc });
            location.hash = "/estoque?" + params.toString();
          });

          page.querySelector("#stRefresh").addEventListener("click", () => renderEstoque());

          // exportações
          page.querySelector("#stCSV").addEventListener("click", () => exportProdutosCSVLocal(filteredProdutos()));
          page.querySelector("#stXLSX").addEventListener("click", () => exportProdutosXLSXLocal(filteredProdutos()));

          // novo produto
          page.querySelector("#stNovo").addEventListener("click", () => showProdutoModal());

          // gerenciar cat/loc
          page.querySelector("#stManage").addEventListener("click", () => showManageModal());

          // ações de linha
          page.querySelectorAll(".stock-row .btn").forEach((btn) => {
            const prodId = btn.closest(".stock-row").getAttribute("data-prod");
            const act = btn.getAttribute("data-act");
            if (act === "add") {
              btn.addEventListener("click", () => {
                const s2 = getStore();
                s2.movimentos.push({ id: uid("mov"), produto_id: prodId, tipo: "entrada", quantidade: 1, unidade: (s.produtos.find(p=>p.id===prodId)||{}).unidade || "un", motivo: "compra", created_at: new Date().toISOString() });
                setStore(s2);
                renderEstoque();
              });
            } else if (act === "sub") {
              btn.addEventListener("click", () => {
                const s2 = getStore();
                s2.movimentos.push({ id: uid("mov"), produto_id: prodId, tipo: "saida", quantidade: 1, unidade: (s.produtos.find(p=>p.id===prodId)||{}).unidade || "un", motivo: "consumo", created_at: new Date().toISOString() });
                setStore(s2);
                renderEstoque();
              });
            } else if (act === "edit") {
              btn.addEventListener("click", () => {
                const p = getStore().produtos.find((x) => x.id === prodId);
                showProdutoModal(p);
              });
            }
          });
        }

        function showManageModal() {
          const s = getStore();
          const modals = document.getElementById("modals");
          const modal = modals.querySelector(".modal");
          modal.innerHTML = `
            <style>
              .mgrid { display:grid; grid-template-columns: 1fr 1fr; gap:14px; }
              .listbox { border:1px solid #f1e6ee; border-radius:12px; padding:12px; background:#fff; }
              .row { display:flex; gap:8px; align-items:center; margin-bottom:8px; }
              .row input { flex:1; border:1px solid #f1e6ee; border-radius:10px; padding:8px; }
              .btn { border:1px solid #f1e6ee; border-radius:10px; padding:8px 10px; font-weight:800; color:#a1125b; background:#fff; }
              .title { font-weight:900; color:#9d174d; margin-bottom:8px; }
            </style>
            <div class="mgrid">
              <div class="listbox">
                <div class="title">Categorias</div>
                <div id="catList">
                  ${s.categorias.map(c => `
                    <div class="row" data-id="${c.id}">
                      <input value="${c.nome}">
                      <button class="btn" data-act="del">Excluir</button>
                    </div>`).join("")}
                </div>
                <button class="btn" id="addCat">+ Adicionar categoria</button>
              </div>
              <div class="listbox">
                <div class="title">Locais</div>
                <div id="locList">
                  ${s.locais.map(l => `
                    <div class="row" data-id="${l.id}">
                      <input value="${l.nome}">
                      <button class="btn" data-act="del">Excluir</button>
                    </div>`).join("")}
                </div>
                <button class="btn" id="addLoc">+ Adicionar local</button>
              </div>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px;">
              <button class="btn" data-close>Fechar</button>
              <button class="btn" id="saveMgmt" style="background:linear-gradient(90deg,var(--bella-500),var(--bella-400));color:#fff;border:0;">Salvar</button>
            </div>
          `;
          modals.style.display = "flex";

          modal.querySelector("#addCat").addEventListener("click", () => {
            const wrapper = modal.querySelector("#catList");
            const id = uid("cat");
            const row = document.createElement("div");
            row.className = "row";
            row.setAttribute("data-id", id);
            row.innerHTML = `<input value=""><button class="btn" data-act="del">Excluir</button>`;
            wrapper.appendChild(row);
            row.querySelector('[data-act="del"]').addEventListener("click", () => row.remove());
          });
          modal.querySelector("#addLoc").addEventListener("click", () => {
            const wrapper = modal.querySelector("#locList");
            const id = uid("loc");
            const row = document.createElement("div");
            row.className = "row";
            row.setAttribute("data-id", id);
            row.innerHTML = `<input value=""><button class="btn" data-act="del">Excluir</button>`;
            wrapper.appendChild(row);
            row.querySelector('[data-act="del"]').addEventListener("click", () => row.remove());
          });

          // Remover existentes
          modal.querySelectorAll('[data-act="del"]').forEach((b) =>
            b.addEventListener("click", () => b.closest(".row").remove())
          );

          modal.querySelector("#saveMgmt").addEventListener("click", () => {
            const s2 = getStore();
            const cats = Array.from(modal.querySelectorAll("#catList .row")).map((r) => ({
              id: r.getAttribute("data-id") || uid("cat"),
              nome: r.querySelector("input").value.trim() || "Sem nome",
            })).filter(x => x.nome);
            const locs = Array.from(modal.querySelectorAll("#locList .row")).map((r) => ({
              id: r.getAttribute("data-id") || uid("loc"),
              nome: r.querySelector("input").value.trim() || "Sem nome",
            })).filter(x => x.nome);
            s2.categorias = cats;
            s2.locais = locs;
            setStore(s2);
            modals.style.display = "none";
            renderEstoque();
          });

          modals.addEventListener("click", (e) => {
            if (e.target === modals || e.target.hasAttribute("data-close")) {
              modals.style.display = "none";
            }
          }, { once: true });
        }

        function showProdutoModal(existing) {
          const s = getStore();
          const modals = document.getElementById("modals");
          const modal = modals.querySelector(".modal");

          const p = existing ? { ...existing } : {
            id: uid("prod"),
            nome: "",
            codigo_barras: "",
            unidade: "un",
            fator_pacote: 1,
            fracionavel: false,
            categoria_id: "",
            local_id: "",
            validade: "",
            alerta_validade_dias: 7,
            alerta_estoque_qtd: 1,
            foto: "",
            created_at: new Date().toISOString(),
          };

          modal.innerHTML = `
            <style>
              .amodal h3 { margin:0 0 14px; font-weight:900; color:var(--bella-800); font-size:22px; }
              .amodal .grid2 { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
              .amodal .field { display:grid; gap:8px; }
              .amodal label { color:#a1125b; font-weight:900; }
              .amodal input, .amodal select { border:2px solid #f3c6d9; border-radius:14px; padding:12px; font-weight:700; color:#a1125b; background:#fff; }
              .amodal .row { display:flex; gap:8px; align-items:center; }
              .amodal .btn { border:1px solid #f3c6d9; background:#fff; color:#a1125b; border-radius:12px; padding:10px 12px; font-weight:900; }
              .amodal .footer { display:flex; justify-content:space-between; gap:8px; margin-top:8px; }
              .amodal .photo { width:64px; height:64px; border-radius:12px; border:1px solid #f1e6ee; display:grid; place-items:center; overflow:hidden; background:#fff7fb; }
              @media(max-width:520px){ .amodal .grid2 { grid-template-columns: 1fr; } }
            </style>

            <div class="amodal">
              <h3>${existing ? "Editar Produto" : "Novo Produto"}</h3>
              <div class="grid2">
                <div class="field">
                  <label>Nome *</label>
                  <input id="pNome" value="${p.nome || ""}" placeholder="Ex.: Removedor de esmalte">
                </div>
                <div class="field">
                  <label>Código de barras</label>
                  <div class="row">
                    <input id="pCode" value="${p.codigo_barras || ""}" placeholder="Escaneie ou digite" style="flex:1;">
                    <input type="file" id="pScan" accept="image/*;capture=camera" style="display:none;">
                    <button class="btn" id="btnScan">Escanear</button>
                  </div>
                </div>

                <div class="field">
                  <label>Unidade</label>
                  <select id="pUn">
                    ${["un","pct","ml","g","l","kg"].map(u => `<option value="${u}" ${p.unidade===u?"selected":""}>${u}</option>`).join("")}
                  </select>
                </div>
                <div class="field">
                  <label>Fator por pacote (se pct)</label>
                  <input type="number" id="pFator" min="1" step="1" value="${p.fator_pacote || 1}">
                </div>

                <div class="row">
                  <input type="checkbox" id="pFrac" ${p.fracionavel ? "checked":""}>
                  <label for="pFrac">Fracionável (permite decimais)</label>
                </div>

                <div class="field">
                  <label>Categoria</label>
                  <select id="pCat"><option value="">Selecionar</option>${s.categorias.map(c=>`<option value="${c.id}" ${p.categoria_id===c.id?"selected":""}>${c.nome}</option>`).join("")}</select>
                </div>
                <div class="field">
                  <label>Local</label>
                  <select id="pLoc"><option value="">Selecionar</option>${s.locais.map(l=>`<option value="${l.id}" ${p.local_id===l.id?"selected":""}>${l.nome}</option>`).join("")}</select>
                </div>

                <div class="field">
                  <label>Validade (opcional)</label>
                  <input type="date" id="pVal" value="${p.validade || ""}">
                </div>
                <div class="grid2">
                  <div class="field">
                    <label>Alerta validade (dias)</label>
                    <input type="number" id="pAlVal" min="1" step="1" value="${p.alerta_validade_dias || 7}">
                  </div>
                  <div class="field">
                    <label>Alerta baixo estoque (qtd)</label>
                    <input type="number" id="pAlEst" step="0.01" value="${p.alerta_estoque_qtd || 1}">
                  </div>
                </div>

                <div class="field" style="grid-column: 1 / -1;">
                  <label>Foto do produto</label>
                  <div class="row">
                    <div class="photo" id="pThumb">${p.foto ? `<img src="${p.foto}" style="width:100%;height:100%;object-fit:cover;">` : "📷"}</div>
                    <input type="file" id="pFoto" accept="image/*;capture=camera" style="display:none;">
                    <button class="btn" id="btnFoto">Tirar/Escolher foto</button>
                  </div>
                </div>

                ${existing ? "" : `
                <div class="grid2" style="grid-column:1 / -1;">
                  <div class="field">
                    <label>Movimentação inicial</label>
                    <select id="mTipo"><option value="entrada">Entrada</option><option value="saida">Saída</option></select>
                  </div>
                  <div class="field">
                    <label>Quantidade</label>
                    <input type="number" id="mQtd" step="0.01" value="1">
                  </div>
                </div>`}
              </div>

              <div class="footer">
                <button class="btn" data-close>Cancelar</button>
                <button class="btn" id="saveProd" style="background:linear-gradient(90deg,var(--bella-500),var(--bella-400));color:#fff;border:0;">Salvar</button>
              </div>
            </div>
          `;
          modals.style.display = "flex";

          // buttons
          modal.querySelector("#btnScan").addEventListener("click", () => modal.querySelector("#pScan").click());
          modal.querySelector("#pScan").addEventListener("change", async (ev) => {
            const f = ev.target.files && ev.target.files[0];
            if (!f) return;
            const code = await detectBarcodeFromFile(f);
            if (code) modal.querySelector("#pCode").value = code;
            else alert("Não foi possível ler o código. Tente outra foto.");
            ev.target.value = "";
          });

          modal.querySelector("#btnFoto").addEventListener("click", () => modal.querySelector("#pFoto").click());
          modal.querySelector("#pFoto").addEventListener("change", async (ev) => {
            const f = ev.target.files && ev.target.files[0];
            if (!f) return;
            try {
              const dataUrl = await compressImageToDataUrl(f, 900, 0.8);
              const ph = modal.querySelector("#pThumb");
              ph.innerHTML = `<img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover;">`;
              p.foto = dataUrl;
            } catch (e) { console.warn(e); }
            ev.target.value = "";
          });

          modal.querySelector("#saveProd").addEventListener("click", () => {
            const s2 = getStore();
            p.nome = modal.querySelector("#pNome").value.trim();
            if (!p.nome) { alert("Informe o nome do produto"); return; }
            p.codigo_barras = modal.querySelector("#pCode").value.trim() || "";
            p.unidade = modal.querySelector("#pUn").value;
            p.fator_pacote = Number(modal.querySelector("#pFator").value || 1);
            p.fracionavel = !!modal.querySelector("#pFrac").checked;
            p.categoria_id = modal.querySelector("#pCat").value || "";
            p.local_id = modal.querySelector("#pLoc").value || "";
            p.validade = modal.querySelector("#pVal").value || "";
            p.alerta_validade_dias = Number(modal.querySelector("#pAlVal").value || 7);
            p.alerta_estoque_qtd = Number(modal.querySelector("#pAlEst").value || 1);

            if (existing) {
              const idx = s2.produtos.findIndex((x) => x.id === existing.id);
              if (idx >= 0) s2.produtos[idx] = p;
            } else {
              s2.produtos.push(p);
              const tipo = modal.querySelector("#mTipo").value;
              const qtd = Number(modal.querySelector("#mQtd").value || 0);
              if (qtd > 0) {
                s2.movimentos.push({
                  id: uid("mov"),
                  produto_id: p.id,
                  tipo,
                  quantidade: qtd,
                  unidade: p.unidade,
                  motivo: tipo === "entrada" ? "compra" : "consumo",
                  created_at: new Date().toISOString(),
                });
              }
            }
            setStore(s2);
            modals.style.display = "none";
            renderEstoque();
          });

          modals.addEventListener("click", (e) => {
            if (e.target === modals || e.target.hasAttribute("data-close")) modals.style.display = "none";
          }, { once: true });
        }

        // Primeira renderização da página Estoque
        renderEstoque();
      }
    }

    window.addEventListener("hashchange", renderRoute);
    if (!location.hash) location.hash = "/dashboard";
    renderRoute();
  };
})();