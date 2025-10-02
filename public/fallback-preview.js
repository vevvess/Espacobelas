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
        .section-divider { display:flex; align-items:center; gap: 12px; color:#9c1d5f; font-weight: 900; padding: 10px 14px; }
        .section-divider::before, .section-divider::after { content:""; height:1px; background:#f3c6d9; flex:1; border-radius: 999px; }

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
        .item.danger { color:#b91c1c; border-color:#fca5a5; }
        .logout { margin-top: auto; padding: 12px; border-top:1px solid #f1e6ee; }

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

        /* Lists */
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
      <style>
        .agenda-hero h1 { margin: 0 0 6px; font-size: 28px; color: var(--bella-800); font-weight: 900; letter-spacing: .2px; display:flex; align-items:center; gap:10px; }
        .agenda-hero .chip-online { display:inline-flex; align-items:center; gap:6px; background:#eafff1; color:#15803d; font-weight:800; padding:6px 12px; border-radius:999px; font-size:12px; border:1px solid #bbf7d0; }
        .agenda-hero p { margin: 0; color: #9d3a69; font-weight: 600; }
        .btn-lg { display:inline-flex; align-items:center; gap:10px; background: linear-gradient(90deg,var(--bella-500),var(--bella-400)); color:#fff; font-weight:900; border-radius:16px; padding:16px 22px; border:0; box-shadow: var(--shadow); }
        .card-blue { background:#eff6ff; border:1px solid #bfdbfe; border-radius:18px; padding:14px; box-shadow: var(--shadow); }
        .card-blue .grid { display:grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 10px; }
        .muted-strong { color:#334155; font-weight:800; }
        .ok { color:#16a34a; font-weight:800; }
        .row-info { display:flex; align-items:center; gap:16px; color:#6b7280; font-weight:700; }
        .row-info .chip { display:inline-flex; align-items:center; gap:6px; background:#f1f5f9; border:1px solid #e2e8f0; padding:6px 10px; border-radius:10px; }
        .row-info .btn-refresh { display:inline-flex; align-items:center; gap:6px; background:#eef2ff; border:1px solid #c7d2fe; padding:8px 12px; border-radius:12px; color:#4338ca; font-weight:800; }

        .kpi-mini { display:grid; gap:12px; margin:14px 0; }
        .kpi-mini .item { background:#fff; border:1px solid #f3c6d9; border-radius:18px; padding:14px; display:flex; align-items:center; justify-content:space-between; box-shadow: var(--shadow); }
        .kpi-mini .item.orange { background: #fff7ed; border-color:#fed7aa; }
        .kpi-mini .item.purple { border-color:#e9d5ff; }
        .kpi-mini .title { color:#a1125b; font-weight:900; }
        .kpi-mini .val { font-size:32px; font-weight:900; color:#a1125b; }

        .view-card { background:#fff; border:1px solid #f3c6d9; border-radius:18px; padding:14px; box-shadow: var(--shadow); display:grid; gap:12px; }
        .view-switch { display:flex; gap:8px; }
        .view-switch .btn { width:42px; height:42px; border-radius:12px; display:grid; place-items:center; border:1px solid #f3c6d9; color:#a1125b; background:#fff; }
        .view-switch .btn.active { background: linear-gradient(180deg,#fff,#ffe9f1); border:2px solid #f3a1c8; box-shadow: var(--shadow); }
        .date-nav { display:flex; align-items:center; justify-content:space-between; }
        .date-nav .arrow { width:40px; height:40px; display:grid; place-items:center; border-radius:12px; border:1px solid #f3c6d9; color:#a1125b; background:#fff; }
        .date-nav .date { font-size:22px; font-weight:900; color:#a1125b; }
        .date-nav .chip { border:1px solid #fde2f1; background:#fff4f9; padding:6px 12px; border-radius:999px; font-weight:800; color:#a1125b; }

        .staff-card .top { display:flex; align-items:center; justify-content:space-between; }
        .staff-card .badge { background:#fee2f2; color:#a1125b; border:1px solid #fbcfe8; padding:6px 10px; border-radius:999px; font-weight:800; }
        .staff-item { display:flex; align-items:center; justify-content:space-between; gap: 10px; background:#fff7fb; border:1px solid #f3c6d9; border-radius:14px; padding:12px; }
        .staff-item .left { display:flex; gap:10px; align-items:center; }
        .staff-item .ava { width:34px; height:34px; border-radius:999px; display:grid; place-items:center; background:#f472b6; color:#fff; font-weight:900; }
        .staff-footer { display:flex; align-items:center; justify-content:space-between; color:#a1125b; font-weight:900; }

        .filters .field { display:grid; gap:6px; margin:8px 0; }
        .filters select { width:100%; border:1px solid #f3c6d9; padding:12px; border-radius:14px; background:#fff; font-weight:700; color:#a1125b; }
        .filters .check { display:flex; align-items:center; gap:8px; font-weight:800; color:#a1125b; }

        .title-row { display:flex; align-items:center; justify-content:space-between; }
        .title-row .badge { background:#fee2f2; color:#a1125b; border:1px solid #fbcfe8; padding:8px 12px; border-radius:999px; font-weight:800; }

        /* Appointment cards */
        .appt { position:relative; border-radius:20px; padding:14px; background:#fff; box-shadow: var(--shadow); border:2px solid #f9c3a7; margin-bottom:16px; }
        .appt.in-progress { border-color:#f59e0b; background: linear-gradient(90deg, rgba(34,197,94,.25) 0 0); } /* baseline */
        .appt .progress-fill { position:absolute; left:0; top:0; bottom:0; width:0; border-radius:20px; background: linear-gradient(90deg, rgba(34,197,94,.35), rgba(34,197,94,.08)); pointer-events:none; }
        .appt .inner { position:relative; display:grid; grid-template-columns: 1fr auto; gap: 10px; }
        .appt .header { display:flex; align-items:center; gap:12px; }
        .appt .ava { width:44px; height:44px; border-radius:999px; display:grid; place-items:center; background:#f472b6; color:#fff; font-weight:900; }
        .appt .name { font-weight:900; color:#7a0f3f; font-size:20px; }
        .appt .status { background:#fef3c7; color:#a16207; padding:6px 10px; border-radius:999px; font-weight:900; border:1px solid #fde68a; }
        .appt .status.scheduled { background:#e0f2fe; color:#075985; border-color:#bae6fd; }
        .appt .actions { display:grid; gap:10px; color:#a1125b; }
        .appt .row { display:flex; align-items:center; gap:8px; color:#a1125b; font-weight:700; }
        .appt .section-title { color:#a1125b; font-weight:900; margin: 8px 0 6px; }
        .chip-box { background:#e6f4ff; border:1px solid #cfe2ff; padding:10px 12px; border-radius:14px; display:flex; align-items:center; justify-content:space-between; }
        .chip-sub { display:flex; align-items:center; gap:8px; color:#a1125b; font-weight:700; }
        .worker-pill { display:inline-flex; align-items:center; gap:8px; background:#def7ec; border:1px solid #a7f3d0; color:#065f46; padding:10px 12px; border-radius:14px; font-weight:800; }
        .total { background:#fff; border:1px solid #f3c6d9; padding:12px 14px; border-radius:14px; display:flex; align-items:center; justify-content:space-between; margin-top:10px; }
        .total .label { color:#a1125b; font-weight:900; }
        .total .value { color:#16a34a; font-weight:900; }

        .appt.scheduled { border-color:#10b981; background:#ecfdf5; }
        .appt.scheduled .ava { background:#10b981; }

      </style>

      <div class="agenda-hero">
        <h1>Agenda <span class="chip-online"><span class="dot"></span>Online</span></h1>
        <p>Gerencie os agendamentos do salão</p>
      </div>

      <button class="btn-lg" data-open="agendamento">+ Novo Agendamento</button>

      <div class="card-blue" style="margin-top:12px;">
        <div class="grid">
          <div><div class="muted">Status</div><div class="muted-strong">Automático</div></div>
          <div><div class="muted">Tempo real por</div><div class="muted-strong">eventos</div></div>
          <div><div class="muted">1</div><div class="muted-strong">em andamento</div></div>
          <div><div class="muted">Eventos do</div><div class="muted-strong">sistema</div></div>
        </div>
        <div class="muted" style="margin-top:10px;">📋 1 agendamentos hoje • Atualiza apenas quando algo muda</div>
      </div>

      <div class="row-info" style="margin-top:10px;">
        <span class="chip">🟢 Tempo real ativo</span>
        <span class="chip">⏱️ Atualizado: <span id="lastUpdate">Agora</span></span>
        <button id="btnAtualizar" class="btn-refresh">↻ Atualizar</button>
      </div>

      <div class="kpi-mini">
        <div class="item">
          <div>
            <div class="title">Hoje (01/10/2025)</div>
            <div class="val">1</div>
          </div>
          <div>📅</div>
        </div>
        <div class="item">
          <div>
            <div class="title">Pendentes</div>
            <div class="val">1</div>
          </div>
          <div>🕒</div>
        </div>
        <div class="item orange">
          <div>
            <div class="title" style="color:#d97706;">Aguardando Confirmação</div>
            <div class="val" style="color:#d97706;">0</div>
          </div>
          <div style="color:#d97706;">💲</div>
        </div>
        <div class="item purple">
          <div>
            <div class="title" style="color:#a21caf;">Concluídos</div>
            <div class="val" style="color:#a21caf;">0</div>
          </div>
          <div style="color:#a21caf;">✔️</div>
        </div>
      </div>

      <div class="view-card">
        <div class="view-switch">
          <button class="btn active">≣</button>
          <button class="btn">▦</button>
          <button class="btn">📆</button>
        </div>
        <div class="date-nav">
          <button class="arrow" aria-label="Anterior">←</button>
          <div style="text-align:center;">
            <div class="date">02/10/2025</div>
            <div class="muted">02/10/2025 ▾</div>
          </div>
          <button class="arrow" aria-label="Próximo">→</button>
        </div>
        <div><span class="chip">Hoje</span></div>
      </div>

      <section class="section staff-card">
        <div class="top">
          <div style="display:flex; align-items:center; gap:8px;"><span>👥</span><h2 style="margin:0;">Funcionários</h2><span class="badge">1 ativo</span></div>
          <div class="muted" style="display:flex; gap:14px; align-items:center;"><a href="#" style="color:#a1125b; font-weight:900; text-decoration:none;">Ver Todos</a> 👁️</div>
        </div>

        <div class="staff-item" style="margin:12px 0;">
          <div class="left">
            <div class="ava">K</div>
            <div>
              <div class="muted-strong">Kelly Monice</div>
              <div class="muted">@Kelly</div>
            </div>
          </div>
          <span class="badge">1 agend.</span>
        </div>

        <div class="staff-footer">
          <div>1 Agendamentos</div>
          <div>1 Funcionários</div>
        </div>
      </section>

      <section class="section filters">
        <div class="field">
          <label class="muted-strong">Data</label>
          <select>
            <option>02/10/2025</option>
          </select>
        </div>
        <div class="field">
          <label class="muted-strong">Status</label>
          <select>
            <option>Todos os status</option>
          </select>
        </div>
        <label class="check"><input type="checkbox"> Mostrar concluídos</label>
      </section>

      <section class="section">
        <div class="title-row">
          <h2 style="margin:0;">Agendamentos – 02/10/2025</h2>
          <span class="badge">2 agendamentos</span>
        </div>

        <!-- Appointment 1 - Em andamento com progresso -->
        <article class="appt in-progress" id="appt1">
          <div class="progress-fill" style="width:64%"></div>
          <div class="inner">
            <div>
              <div class="header">
                <div class="ava">A</div>
                <div style="flex:1;">
                  <div class="name">Adriane Lima</div>
                </div>
                <span class="status">Em Andamento</span>
              </div>

              <div class="row">🕒 02/10/2025, 09:00</div>
              <div class="row">👤 (81) 98886-1850</div>

              <div class="section-title">Serviços:</div>
              <div class="chip-box">
                <div class="chip-sub">💇‍♀️ Chapinha<br/><span class="muted">👤 Kelly Monice</span></div>
                <strong>R$ 50,00</strong>
              </div>

              <div class="section-title">Funcionários:</div>
              <div class="worker-pill">🟢 Kelly Monice</div>

              <div class="total">
                <div class="label">Valor Total:</div>
                <div class="value">R$ 50,00</div>
              </div>
            </div>

            <div class="actions">
              <button class="btn-outline" title="Visualizar">👁️</button>
              <button class="btn-outline" title="Editar">✏️</button>
              <button class="btn-outline" title="Cobrar">💲</button>
              <button class="btn-outline" title="Excluir">🗑️</button>
            </div>
          </div>
        </article>

        <!-- Appointment 2 - Agendado -->
        <article class="appt scheduled">
          <div class="inner">
            <div>
              <div class="header">
                <div class="ava">A</div>
                <div style="flex:1;">
                  <div class="name">Adriane Lima</div>
                </div>
                <span class="status scheduled">Agendado</span>
              </div>

              <div class="row">🕒 02/10/2025, 11:25</div>
              <div class="row">👤 (81) 98886-1850</div>

              <div class="section-title">Serviços:</div>
              <div class="chip-box" style="background:#d1fae5; border-color:#a7f3d0;">
                <div class="chip-sub">💇‍♀️ Chapinha<br/><span class="muted">👤 Simone Barboza</span></div>
                <strong>R$ 20,00</strong>
              </div>

              <div class="section-title">Funcionários:</div>
              <div class="worker-pill">🟢 Simone Barboza</div>

              <div class="total">
                <div class="label">Valor Total:</div>
                <div class="value">R$ 20,00</div>
              </div>
            </div>

            <div class="actions">
              <button class="btn-outline" title="Visualizar">👁️</button>
              <button class="btn-outline" title="Editar">✏️</button>
              <button class="btn-outline" title="Agendar">🕒</button>
              <button class="btn-outline" title="Excluir">🗑️</button>
            </div>
          </div>
        </article>
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

    const FichaCliente = () => `
      <div class="hero"><h1>Ficha Cliente</h1><p>Histórico e informações do cliente</p></div>
      <section class="section list">
        <div class="row"><div><strong>Nome</strong><div class="muted">Claudia Maria</div></div><span class="pill">Ativa</span></div>
        <div class="row"><div><strong>Último atendimento</strong><div class="muted">há 15 dias</div></div><span class="pill">Coloração</span></div>
        <div class="row"><div><strong>Observações</strong><div class="muted">Prefere sábado à tarde</div></div></div>
      </section>
    `;

    const ClientesMensais = () => `
      <div class="hero"><h1>Clientes Mensais</h1><p>Assinaturas e recorrência</p></div>
      <section class="section list">
        <div class="row"><div><strong>Rafael</strong><div class="muted">Plano: Mensal</div></div><span class="pill">Ativo</span></div>
        <div class="row"><div><strong>Mari</strong><div class="muted">Plano: Mensal</div></div><span class="pill">Ativo</span></div>
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

    const Configuracoes = () => `
      <div class="hero"><h1>Configurações</h1><p>Preferências do sistema</p></div>
      <section class="section list">
        <div class="row"><div><strong>Tema</strong><div class="muted">Claro</div></div><button class="btn-outline">Alterar</button></div>
        <div class="row"><div><strong>Notificações</strong><div class="muted">Ativadas</div></div><button class="btn-outline">Editar</button></div>
      </section>
    `;

    // Rotas (sem Relatórios, conforme pedido)
    const routes = {
      "/dashboard": { title: "Dashboard", view: Dashboard },
      "/agenda": { title: "Agenda", view: Agenda },
      "/clientes": { title: "Clientes", view: Clientes },
      "/ficha-cliente": { title: "Ficha Cliente", view: FichaCliente },
      "/clientes-mensais": { title: "Clientes Mensais", view: ClientesMensais },
      "/servicos": { title: "Serviços", view: Servicos },
      "/caixa": { title: "Caixa", view: Caixa },
      "/usuarios": { title: "Usuários", view: Usuarios },
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
                <span class="chip">Admin</span>
              </div>
            </div>
          </div>

          <nav class="navlist">
            <a class="item" href="#/dashboard" data-link="/dashboard"><span class="icon">🏠</span><span class="label">Dashboard</span></a>
            <a class="item" href="#/agenda" data-link="/agenda"><span class="icon">📅</span><span class="label">Agenda</span></a>
            <a class="item" href="#/clientes" data-link="/clientes"><span class="icon">👥</span><span class="label">Clientes</span></a>
            <a class="item" href="#/ficha-cliente" data-link="/ficha-cliente"><span class="icon">📄</span><span class="label">Ficha Cliente</span></a>
            <a class="item" href="#/clientes-mensais" data-link="/clientes-mensais"><span class="icon">🗓️</span><span class="label">Clientes Mensais</span></a>
            <a class="item" href="#/servicos" data-link="/servicos"><span class="icon">⚙️</span><span class="label">Serviços</span></a>
            <a class="item" href="#/caixa" data-link="/caixa"><span class="icon">💵</span><span class="label">Caixa</span></a>
          </nav>

          <div class="section-divider"><span>ADMINISTRAÇÃO</span></div>

          <nav class="navlist" style="padding-top: 0;">
            <a class="item" href="#/usuarios" data-link="/usuarios"><span class="icon">🛡️</span><span class="label">Usuários</span></a>
            <a class="item" href="#/configuracoes" data-link="/configuracoes"><span class="icon">🔧</span><span class="label">Configurações</span></a>
          </nav>

          <div class="logout">
            <a class="item danger" href="#" id="logoutBtn"><span class="icon">↪️</span><span class="label">Sair</span></a>
          </div>
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

    // Monta layout
    root.innerHTML = layout;

    // Helpers
    const $ = (sel) => document.querySelector(sel);
    const page = $("#page");
    const titlebar = $("#titlebar");
    const drawer = $("#drawer");
    $("#menuBtn").addEventListener("click", () => (drawer.style.display = "block"));
    $("#drawerClose").addEventListener("click", () => (drawer.style.display = "none"));
    drawer.addEventListener("click", (e) => {
      if (e.target === drawer) drawer.style.display = "none";
    });
    $("#logoutBtn").addEventListener("click", (e) => {
      e.preventDefault();
      alert("Sessão encerrada (simulação).");
      drawer.style.display = "none";
    });

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

      // Modais simples
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

      // Interações específicas da Agenda (progresso e atualizar)
      if (hash === "/agenda") {
        const btnUpd = document.getElementById("btnAtualizar");
        const last = document.getElementById("lastUpdate");
        btnUpd && btnUpd.addEventListener("click", () => (last.textContent = "Agora"));
        // Progresso: simulação suave de preenchimento
        const card = page.querySelector("#appt1 .progress-fill");
        if (card) {
          let w = parseFloat(card.style.width) || 64;
          function step() {
            w += 0.15; // ~0.15% por frame (~9%/seg a 60fps)
            if (w >= 100) w = 100;
            card.style.width = w + "%";
            if (w < 100) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        }
      }
    }

    window.addEventListener("hashchange", renderRoute);
    if (!location.hash) location.hash = "/dashboard";
    renderRoute();
  };
})();