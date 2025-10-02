(function () {
  window.__runFallbackPreview = function (root) {
    const formatDateLong = () =>
      new Date().toLocaleDateString("pt-BR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

    const html = `
      <style>
        :root {
          --bella-50:#fdf2f8; --bella-100:#fce7f3; --bella-200:#fbcfe8; --bella-300:#f9a8d4;
          --bella-400:#f472b6; --bella-500:#ec4899; --bella-600:#db2777; --bella-700:#be185d;
          --bella-800:#9d174d; --bella-900:#831843;
          --surface:#ffffff; --line:#f3e6ee; --shadow: 0 10px 30px rgba(173, 24, 94, .08);
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

        .shell { max-width: 980px; margin: 0 auto; padding: 16px 14px 40px; }

        /* Topbar mobile */
        .topnav {
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; background: rgba(255,255,255,.7); backdrop-filter: blur(10px);
          border-bottom: 1px solid #f1e6ee; padding: 12px 6px; z-index: 10;
        }
        .menu {
          width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center;
          background: #fff; border: 1px solid var(--line); box-shadow: var(--shadow);
          color: var(--bella-700);
        }
        .titlebar {
          display: flex; align-items: center; gap: 8px; color: var(--bella-800);
          font-weight: 800; font-size: 18px; letter-spacing: .2px;
          position: relative;
        }
        .titlebar::after {
          content:""; position:absolute; left:0; bottom:-8px; width: 110px; height: 3px;
          background: linear-gradient(90deg, var(--bella-700), var(--bella-400));
          border-radius: 999px;
        }
        .avatar {
          width: 36px; height: 36px; border-radius: 999px;
          background: linear-gradient(180deg, #ffb6cf, #f472b6);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.6), 0 4px 12px rgba(236,72,153,.25);
          border: 2px solid #fff;
        }

        /* Header hero */
        .hero { padding: 18px 4px 10px; }
        .hero h1 {
          margin: 0 0 6px; font-size: 32px; line-height: 1.15;
          color: var(--bella-800); font-weight: 900; letter-spacing: .2px;
        }
        .hero p { margin: 0; color: #9d3a69; font-weight: 600; }

        /* Date card */
        .datecard {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 14px 16px;
          box-shadow: var(--shadow);
          margin: 16px 0 14px;
        }
        .dot { width: 10px; height: 10px; border-radius: 999px; background: #22c55e; display:inline-block; margin-right: 8px; }
        .muted { color:#6b7280; }

        /* KPI cards – mobile first, stack */
        .kpi {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 16px;
          box-shadow: var(--shadow);
          margin: 14px 0;
        }
        .kpi .title { color:#c23475; font-weight:800; }
        .kpi .value { font-size: 36px; font-weight: 900; color: var(--bella-800); margin: 4px 0; }
        .kpi .note-ok { color:#16a34a; font-weight:700; }
        .kpi .note { color:#6b7280; font-weight:700; }

        /* Sections */
        .section { background: var(--surface); border: 1px solid var(--line); border-radius: 18px; padding: 14px; box-shadow: var(--shadow); margin: 14px 0; }
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

        /* Modals (estático) */
        .modals { position: fixed; inset: 0; display:none; align-items:center; justify-content:center; background: rgba(15,23,42,.45); padding: 16px; }
        .modal { width: 100%; max-width: 520px; background: #fff; border-radius: 16px; border:1px solid #e5e7eb; padding: 16px; }
        .modal h3 { margin: 0 0 12px; }
        .field { display:grid; gap:6px; margin-bottom: 10px; }
        .field label { font-size: 13px; color: #334155; font-weight: 600; }
        .field input { border:1px solid #e5e7eb; border-radius: 10px; padding: 10px; font-family: inherit; }
        .modal .footer { display:flex; justify-content:flex-end; gap: 8px; margin-top: 8px; }
        .btn-outline { border: 1px solid #e5e7eb; background:#fff; border-radius: 10px; padding: 10px 14px; }
        .btn-solid { background: linear-gradient(90deg,var(--bella-500),var(--bella-400)); color:#fff; border:0; border-radius: 10px; padding: 10px 14px; }
        .btn-main { width:100%; display:flex; align-items:center; justify-content:center; gap: 8px; padding: 12px; font-weight:800; border-radius: 12px; border:2px solid #e5e7eb; color:#0f172a; background:#fff; }
        .btn-primary { color:#fff; background: linear-gradient(90deg,var(--bella-500),var(--bella-400)); border:0; }

        @media (min-width: 980px) {
          .hero h1 { font-size: 42px; }
          .kpis-grid { display:grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; }
          .section-grid { display:grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        }
      </style>

      <div class="shell">
        <!-- Top bar -->
        <div class="topnav">
          <button class="menu" aria-label="menu" title="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
          <div class="titlebar">Dashboard</div>
          <div class="avatar" title="Conta"></div>
        </div>

        <!-- Page header -->
        <div class="hero">
          <h1>Bem-vindo, Weslley<br/>Raphael! 👋</h1>
          <p>Aqui está um resumo das suas atividades de hoje</p>
        </div>

        <!-- Date card -->
        <div class="datecard">
          <div style="font-size: 14px; font-weight:800;">${formatDateLong()}</div>
          <div class="muted" style="margin-top: 4px;"><span class="dot"></span>Sistema online</div>
        </div>

        <!-- KPIs -->
        <div class="kpis">
          <div class="kpi">
            <div class="title">Agendamentos Hoje</div>
            <div class="value">1</div>
            <div class="note-ok">1 confirmados</div>
          </div>

          <div class="kpi">
            <div class="title">Receita do Mês</div>
            <div class="value">R$ 0,00</div>
            <div class="note">Até hoje</div>
          </div>

          <div class="kpi">
            <div class="title">Total de Clientes</div>
            <div class="value">168</div>
            <div class="note-ok">0 novos este mês</div>
          </div>
        </div>

        <!-- Sections -->
        <div class="section-grid">
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

        <section class="section" style="margin-top: 14px;">
          <div class="birth-head">
            <span>🎂</span><span>ANIVERSARIANTES</span><span>🎉</span>
          </div>
          <div class="month-box">
            <h3 style="margin:0 0 10px; display:flex; align-items:center; gap:8px;"><span>📅</span><span>📅 TODOS DESTE MÊS (7)</span></h3>

            <div class="month-item">
              <div style="display:flex; gap:10px; align-items:center;">
                <div class="circle">R</div>
                <div>
                  <div style="font-weight:900;">Rafael</div>
                  <div class="muted"><span>📅</span> 02/10</div>
                </div>
              </div>
              <a class="tel" href="tel:(81) 9556-3242" title="Ligar para o cliente">Ligar para o cliente</a>
            </div>

            <div class="month-item">
              <div style="display:flex; gap:10px; align-items:center;">
                <div class="circle">C</div>
                <div>
                  <div style="font-weight:900;">Claudia Maria da Silva</div>
                  <div class="muted"><span>📅</span> 03/10</div>
                </div>
              </div>
              <a class="tel" href="tel:(81) 99635-8025" title="Ligar para o cliente">Ligar para o cliente</a>
            </div>

            <div class="month-item">
              <div style="display:flex; gap:10px; align-items:center;">
                <div class="circle">E</div>
                <div>
                  <div style="font-weight:900;">Emanuel Ferreira</div>
                  <div class="muted"><span>📅</span> 05/10</div>
                </div>
              </div>
              <a class="tel" href="tel:(81) 99671-8111" title="Ligar para o cliente">Ligar para o cliente</a>
            </div>

            <div class="month-item">
              <div style="display:flex; gap:10px; align-items:center;">
                <div class="circle">D</div>
                <div>
                  <div style="font-weight:900;">Dona Fátima</div>
                  <div class="muted"><span>📅</span> 20/10</div>
                </div>
              </div>
              <span></span>
            </div>

            <div class="month-item">
              <div style="display:flex; gap:10px; align-items:center;">
                <div class="circle">M</div>
                <div>
                  <div style="font-weight:900;">Magnalva Madalena (Nalva)</div>
                  <div class="muted"><span>📅</span> 20/10</div>
                </div>
              </div>
              <span></span>
            </div>

            <div class="month-item">
              <div style="display:flex; gap:10px; align-items:center;">
                <div class="circle">M</div>
                <div>
                  <div style="font-weight:900;">Mari</div>
                  <div class="muted"><span>📅</span> 20/10</div>
                </div>
              </div>
              <a class="tel" href="tel:(81) 98376-0490" title="Ligar para o cliente">Ligar para o cliente</a>
            </div>

            <div class="month-item">
              <div style="display:flex; gap:10px; align-items:center;">
                <div class="circle">G</div>
                <div>
                  <div style="font-weight:900;">Gabriela Cavalcanti</div>
                  <div class="muted"><span>📅</span> 30/10</div>
                </div>
              </div>
              <a class="tel" href="tel:(81) 99811-9739" title="Ligar para o cliente">Ligar para o cliente</a>
            </div>
          </div>
        </section>

        <section class="section" style="margin-top: 14px;">
          <h2>Ações Rápidas</h2>
          <div style="display:grid; gap: 8px;">
            <button class="btn-main btn-primary" data-open="agendamento">Novo Agendamento</button>
            <button class="btn-main" data-open="cliente">Novo Cliente</button>
            <button class="btn-main" data-open="venda">Registrar Venda</button>
          </div>
        </section>
      </div>

      <!-- Modais estáticos -->
      <div class="modals" id="modals">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <h3 id="modal-title">Novo Agendamento</h3>
          <div class="field">
            <label>Cliente</label>
            <input placeholder="Nome do cliente">
          </div>
          <div class="field">
            <label>Serviço</label>
            <input placeholder="Ex.: Corte, Coloração...">
          </div>
          <div class="field">
            <label>Data e hora</label>
            <input type="datetime-local">
          </div>
          <div class="footer">
            <button class="btn-outline" data-close>Cancelar</button>
            <button class="btn-solid" data-close>Salvar</button>
          </div>
        </div>
      </div>
    `;

    root.innerHTML = html;

    // Interações simples para os modais
    const modals = document.getElementById("modals");
    function openModal(title) {
      const h = modals.querySelector("#modal-title");
      h.textContent = title;
      modals.style.display = "flex";
    }
    function closeModal() {
      modals.style.display = "none";
    }
    root.querySelectorAll("[data-open='agendamento']").forEach((b) =>
      b.addEventListener("click", () => openModal("Novo Agendamento"))
    );
    root.querySelectorAll("[data-open='cliente']").forEach((b) =>
      b.addEventListener("click", () => openModal("Novo Cliente"))
    );
    root.querySelectorAll("[data-open='venda']").forEach((b) =>
      b.addEventListener("click", () => openModal("Registrar Venda"))
    );
    modals.addEventListener("click", (e) => {
      if (e.target === modals || e.target.hasAttribute("data-close")) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  };
})();