/**
 * COSINE STATIC PREVIEW (safe baseline)
 * Minimal fallback to guarantee initialization and avoid syntax errors from prior merges.
 * If you need the full-featured preview again, I can re-add modules incrementally.
 * // COSINE_APP_SENTINEL: BELLA-APP-V1 (Estoque + Caixa + UI nova)
 */
(function () {
  if (window.__runFallbackPreview && typeof window.__runFallbackPreview === "function") {
    // Avoid double-define if script is injected twice
    return;
  }

  window.__runFallbackPreview = function (root) {
    try {
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
          *, *::before, *::after { box-sizing: border-box; }
          body {
            background:
              radial-gradient(1200px 400px at -10% -5%, rgba(236,72,153,.08), transparent 60%),
              radial-gradient(800px 300px at 110% 0%, rgba(236,72,153,.06), transparent 60%),
              #fff;
            color: #0f172a;
            font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          }
          .shell { max-width: 980px; margin: 0 auto; padding: 16px 14px 56px; }

          /* Topbar */
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

          /* Drawer */
          .drawer { position: fixed; inset: 0; background: rgba(15,23,42,.55); display: none; z-index: 30; }
          .drawer .panel { position:absolute; top:0; left:0; bottom:0; width: 320px; background:#fff; border-right:1px solid #f1e6ee; box-shadow: var(--shadow); display:flex; flex-direction:column; }
          .brandbar {
            background: linear-gradient(90deg, var(--bella-500), var(--bella-400));
            color: #fff; display:flex; align-items:center; justify-content:space-between;
            padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,.25);
          }
          .brandbar .left { display:flex; align-items:center; gap: 10px; font-weight: 900; font-size: 18px; }
          .brandbar .heart {
            width: 36px; height: 36px; border-radius: 999px; background: rgba(255,255,255,.25);
            display:grid; place-items:center; box-shadow: inset 0 1px 0 rgba(255,255,255,.35);
          }
          .brandbar .close {
            width: 40px; height: 40px; border-radius: 12px; display:grid; place-items:center;
            background: rgba(255,255,255,.25); border: 1px solid rgba(255,255,255,.4);
          }

          .usercard {
            display:flex; gap: 12px; align-items:center; padding: 14px; border-bottom:1px solid #f1e6ee;
            background: linear-gradient(180deg, #fff, #fff9fb);
          }
          .usercard .ava {
            width: 52px; height: 52px; border-radius: 16px; display:grid; place-items:center;
            background: radial-gradient(circle at 30% 30%, #ffc2d6, #f472b6);
            box-shadow: inset 0 1px 0 rgba(255,255,255,.65), 0 8px 22px rgba(236,72,153,.28);
            border: 2px solid #fff;
          }
          .usercard .name { font-weight: 900; color: #8b1049; }
          .chips { display:flex; gap: 6px; margin-top: 4px; align-items:center; }
          .chip { font-size: 12px; font-weight: 800; padding: 3px 8px; border-radius: 999px; background: #fde7f2; color:#8b1049; }
          .online { width: 8px; height: 8px; border-radius: 999px; background:#22c55e; display:inline-block; }

          .navlist { padding: 12px; display:grid; gap: 8px; }
          .item {
            display:flex; align-items:center; gap: 12px; text-decoration:none; color:#a1125b;
            padding: 12px; border-radius: 14px; border:1px solid #f7d2e2; background:#fff;
            box-shadow: 0 2px 10px rgba(173,24,94,.05);
          }
          .item .icon { width: 22px; height: 22px; display:grid; place-items:center; color:#a1125b; }
          .item .label { font-weight: 800; }
          .item.active {
            background: linear-gradient(90deg, rgba(236,72,153,.10), rgba(236,72,153,.03));
            border: 2px solid #f3a1c8;
            box-shadow: 0 10px 26px rgba(173,24,94,.15);
          }

          /* Sections */
          .hero { padding: 18px 4px 10px; }
          .hero h1 {
            margin: 0 0 6px; font-size: 32px; line-height: 1.15;
            color: var(--bella-800); font-weight: 900; letter-spacing: .2px;
          }
          .hero p { margin: 0; color: #9d3a69; font-weight: 600; }
          .section { padding: 14px; margin: 14px 0; background: var(--surface); border: 1px solid var(--line); border-radius: 18px; box-shadow: var(--shadow); }
          .empty { text-align:center; color:#9ca3af; padding: 22px 0; }
          .muted { color:#6b7280; }
        </style>
      `;

      // Pages (mínimas para estabilizar o preview)
      const Dashboard = () => `
        <div class="hero">
          <h1>Preview Estático</h1>
          <p>Carregado com sucesso — ${formatDateLong()}</p>
        </div>
        <section class="section">
          <div class="muted">Este é um fallback simples apenas para garantir a inicialização do preview.</div>
        </section>
      `;

      const SimplePage = (title) => `
        <div class="hero"><h1>${title}</h1><p>Placeholder do preview estático</p></div>
        <section class="section"><div class="empty">Conteúdo mínimo carregado.</div></section>
      `;

      const routes = {
        "/dashboard": { title: "Dashboard", view: Dashboard },
        "/agenda": { title: "Agenda", view: () => SimplePage("Agenda") },
        "/clientes": { title: "Clientes", view: () => SimplePage("Clientes") },
        "/ficha-cliente": { title: "Ficha Cliente", view: () => SimplePage("Ficha Cliente") },
        "/clientes-mensais": { title: "Clientes Mensais", view: () => SimplePage("Clientes Mensais") },
        "/servicos": { title: "Serviços", view: () => SimplePage("Serviços") },
        "/caixa": { title: "Caixa", view: () => SimplePage("Caixa") },
        "/historico-caixa": { title: "Histórico do Caixa", view: () => SimplePage("Histórico do Caixa") },
        "/relatorios": { title: "Relatórios", view: () => SimplePage("Relatórios") },
        "/estoque": { title: "Estoque", view: () => SimplePage("Estoque") },
        "/usuarios": { title: "Usuários", view: () => SimplePage("Usuários") },
        "/configuracoes": { title: "Configurações", view: () => SimplePage("Configurações") },
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
            <div class="brandbar">
              <div class="left">
                <div class="heart"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 21s-6.4-3.7-9.2-8C.8 10.1 1.3 6.7 4.2 5.3A5 5 0 0 1 12 7a5 5 0 0 1 7.8-1.7c2.9 1.4 3.4 4.8 1.4 7.7C18.4 17.3 12 21 12 21z" fill="white" fill-opacity=".9"/></svg></div>
                <div>Bella's</div>
              </div>
              <button class="close" id="drawerClose" aria-label="Fechar">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
            </div>

            <div class="usercard">
              <div class="ava"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 4v5c0 5-3.5 9-7 9s-7-4-7-9V7l7-4z" fill="white" fill-opacity=".85"/></svg></div>
              <div style="flex:1;">
                <div class="name">Weslley Raphael</div>
                <div class="chips">
                  <span class="online"></span>
                  <span class="chip">Admin</span>
                </div>
              </div>
            </div>

            <nav class="navlist">
              ${Object.keys(routes).map(path => {
                const label = routes[path].title;
                const icon = "•";
                return `<a class="item" href="#${path}" data-link="${path}"><span class="icon">${icon}</span><span class="label">${label}</span></a>`;
              }).join("")}
            </nav>

            <div class="logout">
              <a class="item danger" href="#" id="logoutBtn"><span class="icon">↪️</span><span class="label">Sair</span></a>
            </div>
          </div>
        </div>

        <div class="shell"><div id="page"></div></div>
      `;

      // Monta layout
      root.innerHTML = layout;

      // Helpers
      const $ = (sel) => document.querySelector(sel);
      const page = $("#page");
      const titlebar = $("#titlebar");
      const drawer = $("#drawer");
      $("#menuBtn").addEventListener("click", () => (drawer.style.display = "block"));
      $("#drawerClose").addEventListener("click", () => (drawer.style.display = "none"));
      drawer.addEventListener("click", (e) => { if (e.target === drawer) drawer.style.display = "none"; });
      $("#logoutBtn").addEventListener("click", (e) => { e.preventDefault(); alert("Sessão encerrada (simulação)."); drawer.style.display = "none"; });

      function renderRoute() {
        const hash = location.hash.replace("#", "") || "/dashboard";
        const route = routes[hash] || routes["/dashboard"];
        titlebar.textContent = route.title;
        page.innerHTML = route.view();

        // destacar item ativo
        drawer.querySelectorAll("a[data-link]").forEach((a) => {
          const active = a.getAttribute("data-link") === hash;
          a.classList.toggle("active", active);
        });
      }

      window.addEventListener("hashchange", renderRoute);
      renderRoute();
    } catch (e) {
      const msg = `
        <div style="max-width:900px;margin:20px auto;padding:16px;border:1px solid #fecaca;border-radius:12px;background:#fff7f7;color:#7f1d1d;font-family:system-ui;">
          <div style="font-weight:900;margin-bottom:8px;">Falha ao inicializar o preview estático</div>
          <div style="white-space:pre-wrap;font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;">${(e && (e.stack || e.message)) || String(e)}</div>
        </div>
      `;
      root.innerHTML = msg;
      console.error("[fallback-preview-safe] init error:", e);
    }
  };
})();