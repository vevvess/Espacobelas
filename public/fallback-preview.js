(function () {
  window.__runFallbackPreview = function (root) {
    const formatDateLong = () =>
      new Date().toLocaleDateString("pt-BR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

    const css = `
      <style>
        :root {
          --bella-50:#fdf2f8; --bella-100:#fce7f3; --bella-200:#fbcfe8; --bella-300:#f9a8d4;
          --bella-400:#f472b6; --bella-500:#ec4899; --bella-600:#db2777; --bella-700:#be185d;
          --bella-800:#9d174d; --bella-900:#831843;
          --surface:#ffffff; --line:#f3e6ee; --shadow: 0 10px 30px rgba(173,24,94,.08);
        }
        html, body, #root { height: 100%; margin: 0; }
        body {
          background:
            radial-gradient(1200px 400px at -10% -5%, rgba(236,72,153,.08), transparent 60%),
            radial-gradient(800px 300px at 110% 0%, rgba(236,72,153,.06), transparent 60%),
            #fff;
          color: #0f172a;
          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        }
        .shell { max-width: 980px; margin: 0 auto; padding: 16px 14px 56px; }

        /* Topbar mobile */
        .topnav {
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; background: rgba(255,255,255,.7); backdrop-filter: blur(10px);
          border-bottom: 1px solid #f1e6ee; padding: 12px 10px; z-index: 20;
        }
        .menu {
          width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center;
          background: #fff; border: 1px solid var(--line); box-shadow: var(--shadow);
          color: var(--bella-700);
        }
        .titlebar {
          display: flex; align-items: center; gap: 8px; color: var(--bella-800);
          font-weight: 800; font-size: 18px; letter-spacing: .2px; position: relative;
        }
        .titlebar::after {
          content:""; position:absolute; left:0; bottom:-8px; height:3px; width:120px;
          background: linear-gradient(90deg, var(--bella-700), var(--bella-400)); border-radius: 999px;
        }
        .shield {
          width: 36px; height: 36px; border-radius: 999px; display:grid; place-items:center;
          background: radial-gradient(circle at 30% 30%, #ffc2d6, #f472b6);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.65), 0 8px 22px rgba(236,72,153,.28);
          border: 2px solid #fff;
        }
        .drawer {
          position: fixed; inset: 0; background: rgba(15,23,42,.55); display: none; z-index: 30;
        }
        .drawer .panel {
          position: absolute; top:0; left:0; bottom:0; width: 260px; background:#fff; border-right:1px solid #f1e6ee;
          padding: 16px; box-shadow: var(--shadow);
        }
        .drawer a {
          display:block; text-decoration:none; color:#334155; padding: 10px 12px; border-radius: 10px; margin: 4px 0;
        }
        .drawer a.active, .drawer a:hover {
          background: var(--bella-50); color: var(--bella-900);
        }

        /* Hero */
        .hero { padding: 18px 4px 10px; }
        .hero h1 {
          margin: 0 0 6px; font-size: 32px; line-height: 1.15;
          color: var(--bella-800); font-weight: 900; letter-spacing: .2px;
        }
        .hero p { margin: 0; color: #9d3a69; font-weight: 600; }

        /* Common surface */
        .card, .datecard, .kpi, .section {
          background: var(--surface); border: 1px solid var(--line); border-radius: 18px; box-shadow: var(--shadow);
        }
        .datecard { padding: 14px 16px; margin: 16px 0 14px; }
        .dot { width: 10px; height: 10px; border-radius: 999px; background: #22c55e; display:inline-block; margin-right: 8px; }
        .muted { color:#6b7280; }

        /* KPI */
        .kpi { padding: 16px; margin: 14px 0; }
        .kpi .title { color:#c23475; font-weight:800; }
        .kpi .value { font-size: 36px; font-weight: 900; color: var(--bella-800); margin: 4px 0; }
        .kpi .note-ok { color:#16a34a; font-weight:700; }
        .kpi .note { color:#6b7280; font-weight:700; }

        /* Sections */
        .section { padding: 14px; margin: 14px 0; }
        .section h2 { margin: 0 0 8px; font-size: 18px; color: var(--bella-800); }
        .badge { display:inline-block; background: linear-gradient(90deg,var(--bella-500),var(--bella-400)); color:#fff; font-weight: 800; padding:6px 10px; border-radius: 999px; font-size: 12px; }
        .empty { text-align:center; color:#9ca3af; padding: 22px 0; }

        /* Birthdays */
        .birth-head {
          display:flex; align-items:center; justify-content:center; gap: 8px;
          background: linear-gradient(90deg,#fde68a,#fecaca);
          border: 2px solid #f59e0b; color:#7c2d12; border-radius: 14px; padding: 8px; font-weight:900;
          margin-bottom: 10px;
        }
        .month-box { background:#eff6ff; border: 2px solid #93c5fd; padding: 10px; border-radius: 14px; }
        .month-item { display:flex; align-items:center; justify-content:space-between; padding: 10px; border-radius: 12px; margin-bottom: 8px; background: #fff; border: 1px solid #e5e7eb; }
        .circle { width:32px; height:32px; border-radius: 999px; display:grid; place-items:center; background:#93c5fd; color:#1e3a8a; font-weight: 900; }
        .tel { color:#1e3a8a; text-decoration:none; font-weight:700; }

        /* Lists, table shells */
        .list { display:grid; gap: 10px; }
        .row { display:flex; align-items:center; justify-content:space-between; gap: 10px; border: 1px solid #f1e6ee; background: #fff; border-radius: 12px; padding: 12px; }
        .pill { display:inline-block; padding:6px 10px; border-radius:999px; background: var(--bella-50); color: var(--bella-900); font-weight:700; font-size:12px; }

        /* Buttons */
        .btn-primary { color:#fff; background: linear-gradient(90deg,var(--bella-500),var(--bella-400)); border:0; border-radius: 10px; padding: 10px 14px; }
        .btn-outline { border: 1px solid #e5e7eb; background:#fff; border-radius: 10px; padding: 10px 14px; }

        /* Modals */
        .modals { position: fixed; inset: 0; display:none; align-items:center; justify-content:center; background: rgba(15,23,42,.45); padding: 16px; z-index:40; }
        .modal { width: 100%; max-width: 520px; background: #fff; border-radius: 16px; border:1px solid #e5e7eb; padding: 16px; }
        .modal h3 { margin: 0 0 12px; }
        .field { display:grid; gap:6px; margin-bottom: 10px; }
        .field label { font-size: 13px; color: #334155; font-weight: 600; }
        .field input { border:1px solid #e5e7eb; border-radius: 10px; padding: 10px; font-family: inherit; }

        @media (min-width: 980px) {
          .hero h1 { font-size: 42px; }
          .kpi-grid { display:grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; }
          .split { display:grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        }
      </style>
    `;

    // Pages
    const Dashboard = () => `
      <div class="hero">
        <h1>Bem-vindo, Weslley<br/>Raphael! 👋</h1>
        <p>Aqui está um resumo das suas atividades de hoje</p>
      </div>
      <div class="datecard">
        <div style="font-size: 14px; font-weight:800;">${formatDateLong()}</div>
        <div class="muted" style="margin-top: 4px;"><span class="dot"></span>Sistema online</div>
      </div>
      <div class="kpi-grid">
        <div class="kpi"><div class="title">Agendamentos Hoje</div><div class="value">1</div><div class="note-ok">1 confirmados</div></div>
        <div class="kpi"><div class="title">Receita do Mês</div><div class="value">R$ 0,00</div><div class="note">Até hoje</div></div>
        <div class="kpi"><div class="title">Total de Clientes</div><div class="value">168</div><div class="note-ok">0 novos este mês</div></div>
      </div>
      <div class="split">
        <section class="section">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <h2>Agendamentos de Hoje</h2>
            <span class="badge">0 agendamentos</span>
          </div>
          <div class="empty">Nenhum agendamento para hoje</div>
        </section>
        <section class="section">
          <h2>Próximos</h2>
          <div class="empty">Nenhum agendamento próximo</div>
        </section>
      </div>
      <section class="section">
        <div class="birth-head"><span>🎂</span><span>ANIVERSARIANTES</span><span>🎉</span></div>
        <div class="month-box">
          <h3 style="margin:0 0 10px; display:flex; align-items:center; gap:8px;"><span>📅</span><span>📅 TODOS DESTE MÊS (7)</span></h3>
          ${[
            ["R", "Rafael", "02/10", "(81) 9556-3242"],
            ["C", "Claudia Maria da Silva", "03/10", "(81) 99635-8025"],
            ["E", "Emanuel Ferreira", "05/10", "(81) 99671-8111"],
            ["D", "Dona Fátima", "20/10", ""],
            ["M", "Magnalva Madalena (Nalva)", "20/10", ""],
            ["M", "Mari", "20/10", "(81) 98376-0490"],
            ["G", "Gabriela Cavalcanti", "30/10", "(81) 99811-9739"],
          ]
            .map(
              ([ch, name, date, tel]) => `
              <div class="month-item">
                <div style="display:flex; gap:10px; align-items:center;">
                  <div class="circle">${ch}</div>
                  <div>
                    <div style="font-weight:900;">${name}</div>
                    <div class="muted"><span>📅</span> ${date}</div>
                  </div>
                </div>
                ${
                  tel
                    ? `<a class="tel" href="tel:${tel}" title="Ligar para o cliente">Ligar para o cliente</a>`
                    : `<span></span>`
                }
              </div>
            `
            )
            .join("")}
        </div>
      </section>
      <section class="section">
        <h2>Ações Rápidas</h2>
        <div class="list">
          <button class="btn-primary" data-open="agendamento">Novo Agendamento</button>
          <button class="btn-outline" data-open="cliente">Novo Cliente</button>
          <button class="btn-outline" data-open="venda">Registrar Venda</button>
        </div>
      </section>
    `;

    const Agenda = () => `
      <div class="hero"><h1>Agenda</h1><p>Agendamentos e calendário</p></div>
      <section class="section">
        <div class="row"><strong>09:00</strong><span class="pill">Livre</span></div>
        <div class="row"><strong>10:00</strong><span class="pill">Livre</span></div>
        <div class="row"><strong>11:00</strong><span class="pill">Livre</span></div>
        <div class="row"><strong>14:00</strong><span class="pill">Confirmado</span></div>
      </section>
    `;

    const Clientes = () => `
      <div class="hero"><h1>Clientes</h1><p>Cadastro, consulta e ficha</p></div>
      <section class="section">
        <div class="list">
          <div class="row"><div><strong>Claudia Maria</strong><div class="muted">+55 81 99635-8025</div></div><span class="pill">Ativa</span></div>
          <div class="row"><div><strong>Rafael</strong><div class="muted">+55 81 9556-3242</div></div><span class="pill">Ativo</span></div>
          <div class="row"><div><strong>Mari</strong><div class="muted">+55 81 98376-0490</div></div><span class="pill">Ativa</span></div>
        </div>
      </section>
      <section class="section">
        <button class="btn-primary" data-open="cliente">Novo Cliente</button>
      </section>
    `;

    const Servicos = () => `
      <div class="hero"><h1>Serviços</h1><p>Catálogo, preços e duração</p></div>
      <section class="section list">
        <div class="row"><div><strong>Corte</strong><div class="muted">30 min</div></div><strong>R$ 35,00</strong></div>
        <div class="row"><div><strong>Coloração</strong><div class="muted">90 min</div></div><strong>R$ 120,00</strong></div>
        <div class="row"><div><strong>Manicure</strong><div class="muted">45 min</div></div><strong>R$ 40,00</strong></div>
      </section>
    `;

    const Caixa = () => `
      <div class="hero"><h1>Caixa</h1><p>Movimentações e pagamentos</p></div>
      <section class="section list">
        <div class="row"><div><strong>Venda #1021</strong><div class="muted">Hoje • Corte</div></div><strong>R$ 35,00</strong></div>
        <div class="row"><div><strong>Pix</strong><div class="muted">Ontem</div></div><strong>R$ 90,00</strong></div>
      </section>
    `;

    const Usuarios = () => `
      <div class="hero"><h1>Usuários</h1><p>Times, permissões e perfis</p></div>
      <section class="section list">
        <div class="row"><div><strong>Weslley Raphael</strong><div class="muted">Administrador</div></div><span class="pill">Ativo</span></div>
        <div class="row"><div><strong>Claudia</strong><div class="muted">Staff</div></div><span class="pill">Ativa</span></div>
      </section>
    `;

    const Relatorios = () => `
      <div class="hero"><h1>Relatórios</h1><p>Métricas e indicadores</p></div>
      <section class="section list">
        <div class="row"><div><strong>Receita (Mês)</strong></div><strong>R$ 0,00</strong></div>
        <div class="row"><div><strong>Agendamentos (Hoje)</strong></div><strong>1</strong></div>
      </section>
    `;

    const Configuracoes = () => `
      <div class="hero"><h1>Configurações</h1><p>Preferências do sistema</p></div>
      <section class="section list">
        <div class="row"><div><strong>Tema</strong><div class="muted">Claro</div></div><button class="btn-outline">Alterar</button></div>
        <div class="row"><div><strong>Notificações</strong><div class="muted">Ativadas</div></div><button class="btn-outline">Editar</button></div>
      </section>
    `;

    const routes = {
      "/dashboard": { title: "Dashboard", view: Dashboard },
      "/agenda": { title: "Agenda", view: Agenda },
      "/clientes": { title: "Clientes", view: Clientes },
      "/servicos": { title: "Serviços", view: Servicos },
      "/caixa": { title: "Caixa", view: Caixa },
      "/usuarios": { title: "Usuários", view: Usuarios },
      "/relatorios": { title: "Relatórios", view: Relatorios },
      "/configuracoes": { title: "Configurações", view: Configuracoes },
    };

    const layout = `
      ${css}
      <div class="topnav">
        <button class="menu" id="menuBtn" aria-label="menu" title="Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <div class="titlebar" id="titlebar">Dashboard</div>
        <div class="shield" title="Conta"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 4v5c0 5-3.5 9-7 9s-7-4-7-9V7l7-4z" fill="white" fill-opacity=".85"/></svg></div>
      </div>
      <div class="drawer" id="drawer">
        <div class="panel">
          <h3 style="margin:0 0 10px; color: var(--bella-800);">Navegação</h3>
          ${Object.keys(routes)
            .map(
              (path) => `<a href="#${path}" data-link="${path}" id="link-${path.slice(1)}">${routes[path].title}</a>`
            )
            .join("")}
        </div>
      </div>
      <div class="shell"><div id="page"></div></div>

      <!-- Modal shell -->
      <div class="modals" id="modals">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <h3 id="modal-title">Novo Agendamento</h3>
          <div class="field"><label>Cliente</label><input placeholder="Nome do cliente"></div>
          <div class="field"><label>Serviço</label><input placeholder="Ex.: Corte, Coloração..."></div>
          <div class="field"><label>Data e hora</label><input type="datetime-local"></div>
          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button class="btn-outline" data-close>Cancelar</button>
            <button class="btn-primary" data-close>Salvar</button>
          </div>
        </div>
      </div>
    `;

    // Mount layout
    root.innerHTML = layout;

    // Helpers
    const $ = (sel) => document.querySelector(sel);
    const page = $("#page");
    const titlebar = $("#titlebar");
    const drawer = $("#drawer");
    $("#menuBtn").addEventListener("click", () => (drawer.style.display = "block"));
    drawer.addEventListener("click", (e) => {
      if (e.target === drawer) drawer.style.display = "none";
    });
    drawer.querySelectorAll("a[data-link]").forEach((a) =>
      a.addEventListener("click", () => (drawer.style.display = "none"))
    );

    function renderRoute() {
      const hash = location.hash.replace("#", "") || "/dashboard";
      const route = routes[hash] || routes["/dashboard"];
      titlebar.textContent = route.title;
      page.innerHTML = route.view();

      // highlight active link
      drawer.querySelectorAll("a[data-link]").forEach((a) => {
        const active = a.getAttribute("data-link") === hash;
        a.classList.toggle("active", active);
      });

      // wire modals on dashboard and clients
      const modals = $("#modals");
      function openModal(title) {
        $("#modal-title").textContent = title;
        modals.style.display = "flex";
      }
      function closeModal() {
        modals.style.display = "none";
      }
      page.querySelectorAll("[data-open='agendamento']").forEach((b) =>
        b.addEventListener("click", () => openModal("Novo Agendamento"))
      );
      page.querySelectorAll("[data-open='cliente']").forEach((b) =>
        b.addEventListener("click", () => openModal("Novo Cliente"))
      );
      page.querySelectorAll("[data-open='venda']").forEach((b) =>
        b.addEventListener("click", () => openModal("Registrar Venda"))
      );
      modals.addEventListener("click", (e) => {
        if (e.target === modals || e.target.hasAttribute("data-close")) closeModal();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
      });
    }

    window.addEventListener("hashchange", renderRoute);
    if (!location.hash) location.hash = "/dashboard";
    renderRoute();
  };
})();