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
          --ring: 0 10px 15px -3px rgba(236,72,153,.15),0 4px 6px -4px rgba(236,72,153,.15);
        }
        html, body, #root { height: 100%; margin: 0; }
        body { background: #f7f7fb; color: #0f172a; font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
        .app {
          display: grid;
          grid-template-columns: 240px 1fr;
          min-height: 100%;
        }
        .sidebar {
          background: #ffffff;
          border-right: 1px solid #e5e7eb;
          padding: 20px 16px;
        }
        .brand {
          display: flex; align-items: center; gap: 10px;
          font-weight: 800; font-size: 18px; color: var(--bella-700);
        }
        .nav { margin-top: 24px; display: grid; gap: 6px; }
        .nav a {
          text-decoration: none; color: #334155; padding: 10px 12px; border-radius: 10px; display: flex; align-items: center; gap: 10px;
        }
        .nav a.active, .nav a:hover { background: var(--bella-50); color: var(--bella-900); }
        .content { padding: 24px; }
        .topbar {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
        }
        .user {
          display: flex; align-items: center; gap: 12px; color: #0f172a;
        }
        .user .role { background: #eef2ff; color:#3730a3; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 700; }
        .datecard {
          background: #fff; border: 1px solid #e5e7eb; padding: 12px 16px; border-radius: 16px; box-shadow: 0 8px 24px -16px rgba(0,0,0,.25);
        }
        .online { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; display: inline-block; margin-right: 6px; }
        .kpis { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 16px; margin: 22px 0; }
        .kpi {
          background: #fff; border: 1px solid #e5e7eb; padding: 16px; border-radius: 16px; box-shadow: 0 8px 24px -16px rgba(0,0,0,.25);
        }
        .kpi .title { color:#64748b; font-weight:600; font-size:13px; }
        .kpi .value { font-size:28px; font-weight:800; color:#111827; margin: 6px 0 4px; }
        .kpi .note { font-size:13px; color:#475569; }
        .grid-main { display: grid; grid-template-columns: 1fr 360px; gap: 16px; }
        .card {
          background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px; box-shadow: 0 8px 24px -16px rgba(0,0,0,.25);
        }
        .card h2 { margin: 0 0 12px; font-size: 18px; }
        .badge { background: linear-gradient(90deg,var(--bella-500),var(--bella-400)); color: #fff; padding: 6px 10px; border-radius: 999px; font-weight:700; font-size: 12px; }
        .empty { text-align:center; color:#94a3b8; padding: 28px 0; }
        .birth-head {
          display:flex; align-items:center; gap: 10px; padding: 10px; border-radius: 12px;
          background: linear-gradient(90deg,#fef3c7,#fbcfe8); color:#78350f; border:2px solid #f59e0b;
          font-weight: 900; justify-content: center;
        }
        .month-list { background:#eff6ff; border:2px solid #93c5fd; border-radius: 12px; padding: 12px; }
        .month-item { display:flex; align-items:center; justify-content:space-between; padding: 10px; border-radius: 12px; margin-bottom: 8px; }
        .month-item.today { background: linear-gradient(90deg,#fde68a,#fecaca); border: 4px solid #f59e0b; box-shadow: var(--ring); }
        .month-item.past { background:#f8fafc; border:1px solid #cbd5e1; color:#64748b; }
        .month-item.future { background:#eff6ff; border:1px solid #bfdbfe; color:#1e40af; }
        .circle { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; }
        .today .circle { background: linear-gradient(90deg,#f59e0b,#ec4899); color:#fff; }
        .past .circle { background:#e2e8f0; color:#475569; }
        .future .circle { background:#93c5fd; color:#1e3a8a; }
        .actions .btn { width:100%; display:flex; align-items:center; justify-content:center; gap: 8px; padding: 12px; font-weight:700; border-radius: 12px; border:2px solid #e5e7eb; color:#0f172a; background:#fff; }
        .actions .btn.primary { color:#fff; background: linear-gradient(90deg,var(--bella-500),var(--bella-400)); border:0; }
        .actions .btn:hover { filter: saturate(1.05); transform: translateY(-1px); transition: all .2s; }
        .row { display:flex; align-items:center; justify-content: space-between; gap: 8px; padding: 12px; border:1px solid #f1f5f9; border-radius: 12px; background: linear-gradient(90deg,var(--bella-50),#fff); }
        .row .status { font-size: 12px; font-weight: 700; padding: 4px 8px; border-radius: 999px; }
        .status.agendado { background:#dbeafe; color:#1d4ed8; }
        .status.confirmado { background:#dcfce7; color:#166534; }
        .status.concluido { background:#fae8ff; color:#a21caf; }
        .status.cancelado { background:#fee2e2; color:#991b1b; }
        .pill { display:inline-block; padding:6px 10px; border-radius:999px; background: var(--bella-50); color: var(--bella-900); font-weight:700; font-size:12px; }
        .muted { color:#64748b; font-size: 13px; }
        .header h1 { margin: 0 0 6px; font-size: 28px; }
        .header p { margin: 0; color: #6b7280; }
        .modals { position: fixed; inset: 0; display:none; align-items:center; justify-content:center; background: rgba(15,23,42,.45); padding: 16px; }
        .modal { width: 100%; max-width: 520px; background: #fff; border-radius: 16px; border:1px solid #e5e7eb; padding: 16px; }
        .modal h3 { margin: 0 0 12px; }
        .field { display:grid; gap:6px; margin-bottom: 10px; }
        .field label { font-size: 13px; color: #334155; font-weight: 600; }
        .field input, .field select, .field textarea { border:1px solid #e5e7eb; border-radius: 10px; padding: 10px; font-family: inherit; }
        .modal .footer { display:flex; justify-content:flex-end; gap: 8px; margin-top: 8px; }
        .btn-outline { border: 1px solid #e5e7eb; background:#fff; border-radius: 10px; padding: 10px 14px; }
        .btn-solid { background: linear-gradient(90deg,var(--bella-500),var(--bella-400)); color:#fff; border:0; border-radius: 10px; padding: 10px 14px; }
        @media (max-width: 980px) {
          .app { grid-template-columns: 1fr; }
          .sidebar { display: none; }
          .grid-main { grid-template-columns: 1fr; }
          .kpis { grid-template-columns: 1fr 1fr; }
        }
      </style>

      <div class="app">
        <aside class="sidebar">
          <div class="brand">Bella's</div>
          <nav class="nav">
            <a class="active" href="#/dashboard">Dashboard</a>
            <a href="#/agenda">Agenda</a>
            <a href="#/clientes">Clientes</a>
            <a href="#/servicos">Serviços</a>
            <a href="#/caixa">Caixa</a>
            <a href="#/usuarios">Usuários</a>
            <a href="#/relatorios">Relatórios</a>
            <a href="#/configuracoes">Configurações</a>
          </nav>
        </aside>

        <main class="content">
          <div class="topbar">
            <div class="header">
              <h1>Bem-vindo, Weslley Raphael! 👋</h1>
              <p>Aqui está um resumo das suas atividades de hoje</p>
            </div>
            <div class="datecard">
              <div style="font-size: 14px; font-weight:700;">${formatDateLong()}</div>
              <div class="muted"><span class="online"></span>Sistema online</div>
            </div>
          </div>

          <section class="kpis">
            <div class="kpi">
              <div class="title">Agendamentos Hoje</div>
              <div class="value">0</div>
              <div class="note">0 confirmados</div>
            </div>
            <div class="kpi">
              <div class="title">Receita do Mês</div>
              <div class="value">R$ 0,00</div>
              <div class="note">Até hoje</div>
            </div>
            <div class="kpi">
              <div class="title">Total de Clientes</div>
              <div class="value">168</div>
              <div class="note">0 novos este mês</div>
            </div>
            <div class="kpi">
              <div class="title">Aniversariantes</div>
              <div class="value">0</div>
              <div class="note">7 este mês</div>
            </div>
          </section>

          <section class="grid-main">
            <div class="card">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
                <h2 style="display:flex; align-items:center; gap: 10px; margin:0;">
                  <span class="pill">Agendamentos de Hoje</span>
                </h2>
                <span class="badge">0 agendamentos</span>
              </div>
              <div class="empty">Nenhum agendamento para hoje</div>
            </div>

            <div class="column">
              <div class="card" style="margin-bottom: 16px;">
                <h2 style="display:flex; align-items:center; gap: 10px; margin-top:0;">Próximos</h2>
                <div class="empty">Nenhum agendamento próximo</div>
              </div>

              <div class="card" style="margin-bottom: 16px;">
                <div class="birth-head">
                  <span>🎂</span>
                  <span>ANIVERSARIANTES</span>
                  <span>🎉</span>
                </div>

                <div class="month-list" style="margin-top: 12px;">
                  <h3 style="margin:0 0 10px; display:flex; align-items:center; gap:8px;"><span>📅</span><span>📅 TODOS DESTE MÊS (7)</span></h3>

                  <div class="month-item future">
                    <div style="display:flex; gap:10px; align-items:center;">
                      <div class="circle">R</div>
                      <div>
                        <div style="font-weight:700;">Rafael</div>
                        <div class="muted"><span>📅</span> 02/10</div>
                      </div>
                    </div>
                    <a href="tel:(81) 9556-3242" title="Ligar para o cliente" style="text-decoration:none; color:#1e3a8a;">Ligar para o cliente</a>
                  </div>

                  <div class="month-item future">
                    <div style="display:flex; gap:10px; align-items:center;">
                      <div class="circle">C</div>
                      <div>
                        <div style="font-weight:700;">Claudia Maria da Silva</div>
                        <div class="muted"><span>📅</span> 03/10</div>
                      </div>
                    </div>
                    <a href="tel:(81) 99635-8025" title="Ligar para o cliente" style="text-decoration:none; color:#1e3a8a;">Ligar para o cliente</a>
                  </div>

                  <div class="month-item future">
                    <div style="display:flex; gap:10px; align-items:center;">
                      <div class="circle">E</div>
                      <div>
                        <div style="font-weight:700;">Emanuel Ferreira</div>
                        <div class="muted"><span>📅</span> 05/10</div>
                      </div>
                    </div>
                    <a href="tel:(81) 99671-8111" title="Ligar para o cliente" style="text-decoration:none; color:#1e3a8a;">Ligar para o cliente</a>
                  </div>

                  <div class="month-item future">
                    <div style="display:flex; gap:10px; align-items:center;">
                      <div class="circle">D</div>
                      <div>
                        <div style="font-weight:700;">Dona Fátima</div>
                        <div class="muted"><span>📅</span> 20/10</div>
                      </div>
                    </div>
                    <span class="muted"></span>
                  </div>

                  <div class="month-item future">
                    <div style="display:flex; gap:10px; align-items:center;">
                      <div class="circle">M</div>
                      <div>
                        <div style="font-weight:700;">Magnalva Madalena (Nalva)</div>
                        <div class="muted"><span>📅</span> 20/10</div>
                      </div>
                    </div>
                    <span class="muted"></span>
                  </div>

                  <div class="month-item future">
                    <div style="display:flex; gap:10px; align-items:center;">
                      <div class="circle">M</div>
                      <div>
                        <div style="font-weight:700;">Mari</div>
                        <div class="muted"><span>📅</span> 20/10</div>
                      </div>
                    </div>
                    <a href="tel:(81) 98376-0490" title="Ligar para o cliente" style="text-decoration:none; color:#1e3a8a;">Ligar para o cliente</a>
                  </div>

                  <div class="month-item future">
                    <div style="display:flex; gap:10px; align-items:center;">
                      <div class="circle">G</div>
                      <div>
                        <div style="font-weight:700;">Gabriela Cavalcanti</div>
                        <div class="muted"><span>📅</span> 30/10</div>
                      </div>
                    </div>
                    <a href="tel:(81) 99811-9739" title="Ligar para o cliente" style="text-decoration:none; color:#1e3a8a;">Ligar para o cliente</a>
                  </div>
                </div>
              </div>

              <div class="card">
                <h2 style="margin-top:0;">Ações Rápidas</h2>
                <div class="actions" style="display:grid; gap: 8px;">
                  <button class="btn primary" data-open="agendamento">Novo Agendamento</button>
                  <button class="btn" data-open="cliente">Novo Cliente</button>
                  <button class="btn" data-open="venda">Registrar Venda</button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

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