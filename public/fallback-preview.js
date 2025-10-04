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
        .icon { width: 18px; height: 18px; vertical-align: -3px; }
        .agenda-hero h1 { margin: 0 0 6px; font-size: 28px; color: var(--bella-800); font-weight: 900; letter-spacing: .2px; display:flex; align-items:center; gap:10px; }
        .agenda-hero .chip-online { display:inline-flex; align-items:center; gap:6px; background:#eafff1; color:#15803d; font-weight:800; padding:6px 12px; border-radius:999px; font-size:12px; border:1px solid #bbf7d0; }
        .agenda-hero p { margin: 0; color: #9d3a69; font-weight: 600; }
        .btn-lg { display:inline-flex; align-items:center; gap:10px; background: linear-gradient(90deg,var(--bella-500),var(--bella-400)); color:#fff; font-weight:900; border-radius:16px; padding:16px 22px; border:0; box-shadow: var(--shadow); }
        .card-blue { background:#eff6ff; border:1px solid #bfdbfe; border-radius:18px; padding:14px; box-shadow: var(--shadow); }
        .card-blue .grid { display:grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 10px; }
        .muted-strong { color:#334155; font-weight:800; }
        .ok { color:#16a34a; font-weight:800; }
        .row-info { display:flex; align-items:center; gap:16px; color:#6b7280; font-weight:700; flex-wrap: wrap; }
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
        .appt { position:relative; border-radius:20px; padding:14px; background:#fff; box-shadow: var(--shadow); border:2px solid #f9c3a7; margin-bottom:16px; overflow:hidden; }
        .appt.in-progress { border-color:#f59e0b; background: #fff7ed; }
        .appt .progress-fill { position:absolute; left:0; top:0; bottom:0; width:0; background: linear-gradient(90deg, rgba(34,197,94,.3), rgba(34,197,94,.08)); }
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

      <button class="btn-lg" data-open="agendamento">
        <svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
        Novo Agendamento
      </button>

      <div class="card-blue" style="margin-top:12px;">
        <div class="grid">
          <div><div class="muted">Status</div><div class="muted-strong">Automático</div></div>
          <div><div class="muted">Tempo real por</div><div class="muted-strong">eventos</div></div>
          <div><div class="muted">1</div><div class="muted-strong">em andamento</div></div>
          <div><div class="muted">Eventos do</div><div class="muted-strong">sistema</div></div>
        </div>
        <div class="muted" style="margin-top:10px;">
          <svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v16H4z" stroke="#334155" stroke-width="1.5" stroke-linejoin="round"/><path d="M7 4v16M4 8h16" stroke="#334155" stroke-width="1.5"/></svg>
          1 agendamentos hoje • Atualiza apenas quando algo muda
        </div>
      </div>

      <div class="row-info" style="margin-top:10px;">
        <span class="chip"><span class="dot"></span>Tempo real ativo</span>
        <span class="chip">
          <svg class="icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#334155" stroke-width="1.8"/><path d="M12 8v5l3 2" stroke="#334155" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Atualizado: <span id="lastUpdate">Agora</span>
        </span>
        <button id="btnAtualizar" class="btn-refresh">
          <svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M20 11a8 8 0 1 1-2.34-5.66L20 8M20 8V4m0 4h-4" stroke="#4338ca" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Atualizar
        </button>
      </div>

      <div class="kpi-mini">
        <div class="item">
          <div>
            <div class="title">Hoje (01/10/2025)</div>
            <div class="val">1</div>
          </div>
          <div>
            <svg class="icon" viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="15" rx="2" stroke="#a1125b" stroke-width="1.8"/><path d="M8 3v4M16 3v4M4 10h16" stroke="#a1125b" stroke-width="1.8" stroke-linecap="round"/></svg>
          </div>
        </div>
        <div class="item">
          <div>
            <div class="title">Pendentes</div>
            <div class="val">1</div>
          </div>
          <div>
            <svg class="icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#a1125b" stroke-width="1.8"/><path d="M12 8v5l3 2" stroke="#a1125b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>
        <div class="item orange">
          <div>
            <div class="title" style="color:#d97706;">Aguardando Confirmação</div>
            <div class="val" style="color:#d97706;">0</div>
          </div>
          <div>
            <svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M12 6v12M17 10c0-1.657-2.239-3-5-3s-5 1.343-5 3 2.239 3 5 3 5 1.343 5 3-2.239 3-5 3-5-1.343-5-3" stroke="#d97706" stroke-width="1.8" stroke-linecap="round"/></svg>
          </div>
        </div>
        <div class="item purple">
          <div>
            <div class="title" style="color:#a21caf;">Concluídos</div>
            <div class="val" style="color:#a21caf;">0</div>
          </div>
          <div>
            <svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#a21caf" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>
      </div>

      <div class="view-card">
        <div class="view-switch">
          <button class="btn active"><svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="#a1125b" stroke-width="2" stroke-linecap="round"/></svg></button>
          <button class="btn"><svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" stroke="#a1125b" stroke-width="1.8"/></svg></button>
          <button class="btn"><svg class="icon" viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="15" rx="2" stroke="#a1125b" stroke-width="1.8"/><path d="M8 3v4M16 3v4M4 10h16" stroke="#a1125b" stroke-width="1.8" stroke-linecap="round"/></svg></button>
        </div>
        <div class="date-nav">
          <button class="arrow" aria-label="Anterior"><svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="#a1125b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          <div style="text-align:center;">
            <div class="date">02/10/2025</div>
            <div class="muted">02/10/2025 ▾</div>
          </div>
          <button class="arrow" aria-label="Próximo"><svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="#a1125b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        </div>
        <div><span class="chip">Hoje</span></div>
      </div>

      <section class="section staff-card">
        <div class="top">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M16 14a4 4 0 10-8 0M12 7a4 4 0 110-8 4 4 0 010 8z" transform="translate(0,4)" stroke="#a1125b" stroke-width="1.8" stroke-linecap="round"/></svg>
            <h2 style="margin:0;">Funcionários</h2><span class="badge">1 ativo</span>
          </div>
          <div class="muted" style="display:flex; gap:14px; align-items:center;">
            <a href="#" style="color:#a1125b; font-weight:900; text-decoration:none;">Ver Todos</a>
            <svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#64748b" stroke-width="1.5"/><circle cx="12" cy="12" r="3" fill="#64748b"/></svg>
          </div>
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

              <div class="row">
                <svg class="icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#a1125b" stroke-width="1.8"/><path d="M12 8v5l3 2" stroke="#a1125b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                02/10/2025, 09:00
              </div>
              <div class="row">
                <svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.86 19.86 0 013 5.18 2 2 0 015 3h3l2 5-3 2a16 16 0 008 8l2-3 5 2z" stroke="#a1125b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                (81) 98886-1850
              </div>

              <div class="section-title">Serviços:</div>
              <div class="chip-box">
                <div class="chip-sub">
                  <svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M20 7l-8 8M14 7l-8 8" stroke="#a1125b" stroke-width="1.8" stroke-linecap="round"/></svg>
                  Chapinha<br/><span class="muted">
                    <svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M16 14a4 4 0 10-8 0" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="8" r="3" fill="#64748b"/></svg>
                    Kelly Monice
                  </span>
                </div>
                <strong>R$ 50,00</strong>
              </div>

              <div class="section-title">Funcionários:</div>
              <div class="worker-pill">
                <svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M16 14a4 4 0 10-8 0" stroke="#065f46" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="8" r="3" fill="#065f46"/></svg>
                Kelly Monice
              </div>

              <div class="total">
                <div class="label">Valor Total:</div>
                <div class="value">R$ 50,00</div>
              </div>
            </div>

            <div class="actions">
              <button class="btn-outline" title="Visualizar"><svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#a1125b" stroke-width="1.6"/><circle cx="12" cy="12" r="3" fill="#a1125b"/></svg></button>
              <button class="btn-outline" title="Editar"><svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="#a1125b" stroke-width="1.6"/></svg></button>
              <button class="btn-outline" title="Cobrar"><svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M12 6v12M17 10c0-1.657-2.239-3-5-3s-5 1.343-5 3 2.239 3 5 3 5 1.343 5 3-2.239 3-5 3-5-1.343-5-3" stroke="#a1125b" stroke-width="1.6" stroke-linecap="round"/></svg></button>
              <button class="btn-outline" title="Excluir"><svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" stroke="#a1125b" stroke-width="1.6" stroke-linecap="round"/></svg></button>
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

              <div class="row">
                <svg class="icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#a1125b" stroke-width="1.8"/><path d="M12 8v5l3 2" stroke="#a1125b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                02/10/2025, 11:25
              </div>
              <div class="row">
                <svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.86 19.86 0 013 5.18 2 2 0 015 3h3l2 5-3 2a16 16 0 008 8l2-3 5 2z" stroke="#a1125b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                (81) 98886-1850
              </div>

              <div class="section-title">Serviços:</div>
              <div class="chip-box" style="background:#d1fae5; border-color:#a7f3d0;">
                <div class="chip-sub">
                  <svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M20 7l-8 8M14 7l-8 8" stroke="#065f46" stroke-width="1.8" stroke-linecap="round"/></svg>
                  Chapinha<br/><span class="muted">
                    <svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M16 14a4 4 0 10-8 0" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="8" r="3" fill="#64748b"/></svg>
                    Simone Barboza
                  </span>
                </div>
                <strong>R$ 20,00</strong>
              </div>

              <div class="section-title">Funcionários:</div>
              <div class="worker-pill">
                <svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M16 14a4 4 0 10-8 0" stroke="#065f46" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="8" r="3" fill="#065f46"/></svg>
                Simone Barboza
              </div>

              <div class="total">
                <div class="label">Valor Total:</div>
                <div class="value">R$ 20,00</div>
              </div>
            </div>

            <div class="actions">
              <button class="btn-outline" title="Visualizar"><svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#a1125b" stroke-width="1.6"/><circle cx="12" cy="12" r="3" fill="#a1125b"/></svg></button>
              <button class="btn-outline" title="Editar"><svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="#a1125b" stroke-width="1.6"/></svg></button>
              <button class="btn-outline" title="Agendar"><svg class="icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#a1125b" stroke-width="1.6"/><path d="M12 8v5l3 2" stroke="#a1125b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
              <button class="btn-outline" title="Excluir"><svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" stroke="#a1125b" stroke-width="1.6" stroke-linecap="round"/></svg></button>
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
      <div id="caixa-root"></div>
    `;

    const Estoque = () => `
      <div id="estoque-root"></div>
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
      <section class="section list">
        <div class="row">
          <div><strong>Exportar Build/Dist</strong><div class="muted">Gera um snapshot ZIP do preview estático</div></div>
          <button class="btn-outline" id="btnDistZip">Gerar ZIP</button>
        </div>
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
      "/estoque": { title: "Estoque", view: Estoque },
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
            <a class="item" href="#/estoque" data-link="/estoque"><span class="icon">📦</span><span class="label">Estoque</span></a>
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

      // Configurações: gerar ZIP do dist (snapshot)
      async function ensureJSZip() {
        // @ts-ignore
        if (!window.__loadedScripts) window.__loadedScripts = {};
        const src = "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";
        if (!window.__loadedScripts[src]) {
          await new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
          });
          window.__loadedScripts[src] = true;
        }
      }
      async function generateDistZip() {
        try {
          await ensureJSZip();
          const JSZip = window.JSZip;
          const zip = new JSZip();
          const fetchText = async (path) => {
            try {
              const res = await fetch(path);
              return res.ok ? await res.text() : "";
            } catch {
              return "";
            }
          };
          const fetchBlob = async (path) => {
            try {
              const res = await fetch(path);
              return res.ok ? await res.blob() : new Blob([]);
            } catch {
              return new Blob([]);
            }
          };

          const idx = await fetchText("/index.html");
          if (idx) zip.file("index.html", idx);
          const fb = await fetchText("/public/fallback-preview.js");
          if (fb) zip.file("public/fallback-preview.js", fb);
          const manRoot = await fetchText("/cosine-manifest.json");
          if (manRoot) zip.file("cosine-manifest.json", manRoot);
          const manPub = await fetchText("/public/cosine-manifest.json");
          if (manPub) zip.file("public/cosine-manifest.json", manPub);

          const assets = [
            { path: "/public/favicon.ico", name: "public/favicon.ico", binary: true },
            { path: "/public/robots.txt", name: "public/robots.txt" },
            { path: "/public/placeholder.svg", name: "public/placeholder.svg" },
          ];
          for (const a of assets) {
            if (a.binary) {
              const blob = await fetchBlob(a.path);
              if (blob.size) zip.file(a.name, blob);
            } else {
              const txt = await fetchText(a.path);
              if (txt) zip.file(a.name, txt);
            }
          }

          const content = await zip.generateAsync({ type: "blob" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(content);
          a.download = `bella-app-dist-snapshot_${new Date().toISOString().slice(0,10)}.zip`;
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(a.href);
          a.remove();
        } catch (e) {
          console.warn("Falha ao gerar dist snapshot:", e);
        }
      }
      if (hash === "/configuracoes") {
        const btn = page.querySelector("#btnDistZip");
        btn && btn.addEventListener("click", generateDistZip);
      }

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
            const v = Number(a.valor) || 0;
            if (a.pagamento === "pix") totalPix += v;
            else if (a.pagamento === "cartao") totalCartao += v;
            else if (a.pagamento === "dinheiro") totalDinheiro += v;
            else if (a.pagamento === "mensal") totalDebitos += v;
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
                            <span class="badge ${
                              a.pagamento === "pix"
                                ? "pay-pix"
                                : a.pagamento === "cartao"
                                ? "pay-cartao"
                                : a.pagamento === "dinheiro"
                                ? "pay-dinheiro"
                                : "pay-mensal"
                            }">${a.pagamento}</span>
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
                        <th>Descrição</th><th>Origem</th><th class="right">Valor (R$)</th><th>QR</th><th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${s.deps
                        .map(
                          (d) => `
                        <tr>
                          <td>${d.descricao}</td>
                          <td>${d.origem === "caixa" ? "Retirada do Caixa" : "Outro"}</td>
                          <td class="right">${money(d.valor)}</td>
                          <td>${d.qr_text ? "QR" : "-"}</td>
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

          // Ações
          byId("btnAtendimento").addEventListener("click", () => showAtendimentoModal());
          byId("btnDespesa").addEventListener("click", () => showDespesaModal());
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
                  border:2px solid #f3c6d9; border-radius:14px; padding:12px; font-weight:700; color:#a1125b; background:#fff;
                }
                .amodal input[readonly] { background:#fff7fb; }
                .amodal .hint { color:#9ca3af; font-weight:700; }
                .amodal .svc-head { display:flex; align-items:center; justify-content:space-between; margin-top:6px; }
                .amodal .svc-row {
                  display:grid; grid-template-columns: 1fr 130px 180px 42px; gap:8px; align-items:center;
                }
                .amodal .svc-add { border:1px solid #f3c6d9; background:#fff; color:#a1125b; border-radius:12px; padding:10px 12px; font-weight:900; }
                .amodal .footer { display:flex; justify-content:space-between; gap:8px; margin-top:8px; }
                .amodal .btn-cancel {
                  border:2px solid #f3c6d9; border-radius:16px; padding:12px 16px; background:#fff; color:#a1125b; font-weight:900;
                }
                .amodal .btn-save {
                  border:0; border-radius:16px; padding:12px 16px; font-weight:900; color:#fff;
                  background:linear-gradient(90deg,var(--bella-500),var(--bella-400));
                }
                @media(max-width: 520px){
                  .amodal .grid2 { grid-template-columns: 1fr; }
                  .amodal .svc-row { grid-template-columns: 1fr 110px 1fr 42px; }
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
                  <label>Forma de Pagamento</label>
                  <select id="fPagamento">
                    <option value="dinheiro" ${!existing || existing?.pagamento === "dinheiro" ? "selected" : ""}>Dinheiro</option>
                    <option value="pix" ${existing?.pagamento === "pix" ? "selected" : ""}>PIX</option>
                    <option value="cartao" ${existing?.pagamento === "cartao" ? "selected" : ""}>Cartão</option>
                    <option value="mensal" ${existing?.pagamento === "mensal" ? "selected" : ""}>Mensal (débito)</option>
                  </select>
                </div>

                <div class="footer">
                  <button class="btn-cancel" data-close>Cancelar</button>
                  <button class="btn-save" id="saveAtt">${existing ? "Salvar Atendimento" : "Salvar Atendimento"}</button>
                </div>
              </div>
            `;

            modals.style.display = "flex";

            const svcList = modal.querySelector("#svcList");

            function addRow(svc = { nome: "", valor: "", profissional: "" }) {
              const row = document.createElement("div");
              row.className = "svc-row";
              row.innerHTML = `
                <input placeholder="Serviço" class="svc-nome" value="${svc.nome || ""}">
                <input type="number" step="0.01" min="0" placeholder="Valor" class="svc-valor" value="${svc.valor || ""}">
                <input placeholder="Profissional" class="svc-prof" value="${svc.profissional || ""}">
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
              const pagamento = modal.querySelector("#fPagamento").value;
              const total = parseFloat(modal.querySelector("#fTotal").value || "0") || 0;
              const servicos = Array.from(modal.querySelectorAll("#svcList .svc-row")).map((r) => ({
                nome: r.querySelector(".svc-nome").value.trim(),
                valor: parseFloat(r.querySelector(".svc-valor").value || "0") || 0,
                profissional: r.querySelector(".svc-prof").value.trim(),
              }));

              const store = getStore();
              const day = getDay(store, selectedDate);

              if (existing) {
                const idx = day.atendimentos.findIndex((a) => String(a.id) === String(existing.id));
                if (idx >= 0)
                  day.atendimentos[idx] = { ...existing, cliente, pagamento, valor: total, servicos };
              } else {
                day.atendimentos.push({
                  id: "att-" + Date.now(),
                  data: selectedDate,
                  cliente,
                  pagamento,
                  valor: total,
                  servicos,
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
              try {
                if (window.BarcodeDetector) {
                  const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
                  const bmp = await createImageBitmap(f);
                  const res = await detector.detect(bmp);
                  if (res && res.length) text = res[0].rawValue || res[0].raw || "";
                }
              } catch {}
              const fr = new FileReader();
              fr.onload = () => {
                const dataUrl = String(fr.result || "");
                qrPayload.textContent = text ? ("Payload: " + text) : "";
                qrPreview.innerHTML = dataUrl ? `<img src="${dataUrl}" style="max-width:140px;border:1px solid #f1e6ee;border-radius:8px;">` : "";
                // stash temporário nos elementos
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
              head: [["Descrição","Origem","Valor"]],
              body: depRows,
              styles: { font:"helvetica", fontSize: 9, cellPadding: 2 },
              headStyles: { fillColor: [254,226,226], textColor: [153,27,27] },
              columnStyles: { 2: { halign: "right" } },
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
            const s2 = snapshot(selectedDate);
            const brDate = fmtBR(selectedDate);
            const genStr = new Date().toLocaleString("pt-BR");
            const money = (n) => (Number(n) || 0).toLocaleString("pt-BR", { style:"currency", currency:"BRL" });

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
                .r-title { font-weight:900; font-size:24px; color:#9d174d; margin-bottom:4px; }
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
                table { width:100%; border-collapse:separate; border-spacing:0 6px; font-size:13px; }
                th { text-align:left; color:#9d174d; font-weight:800; }
                td, th { padding:8px 10px; border:1px solid #f1e6ee; background:#fff; }
                td.num { text-align:right; font-weight:900; }
                .muted { color:#64748b; }
                .foot { margin-top: 8px; color:#64748b; font-size:12px; }
              </style>

              <div class="r-title">Fechamento de Caixa — Espaço Bella's</div>
              <div class="r-sub">Data do caixa: <strong>${brDate}</strong> • Gerado em: ${genStr}</div>
              <div class="r-sub">CNPJ: 30.504.701/0001-29 • Endereço: R. Rezende, 229 - Iputinga, Recife - PE, 50680-200 • Tel: (81) 98628-8749</div>

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

              <div class="sec">
                <h3>Detalhes dos Atendimentos</h3>
                ${
                  s2.atts.length
                    ? `<table>
                        <thead><tr><th>Cliente</th><th>Serviços</th><th>Funcionário</th><th>Pagamento</th><th>Valor</th></tr></thead>
                        <tbody>
                          ${s2.atts.map(a => `
                            <tr>
                              <td>${a.cliente || "-"}</td>
                              <td>${(a.servicos || []).map(sv => sv.nome).join(" + ") || a.servico || "-"}</td>
                              <td>${(a.servicos || []).map(sv => sv.profissional).filter(Boolean).join(", ") || a.profissional || "-"}</td>
                              <td>${(a.pagamento || "").toUpperCase()}</td>
                              <td class="num">${money(a.valor)}</td>
                            </tr>
                          `).join("")}
                        </tbody>
                      </table>`
                    : `<div class="muted">Sem atendimentos para esta data</div>`
                }
              </div>

              ${
                s2.atts.filter(a => a.pagamento === "mensal").length
                  ? `<div class="sec">
                      <h3>Débito Mensal (Não Pago)</h3>
                      <table>
                        <thead><tr><th>Cliente</th><th>Serviços</th><th>Funcionário</th><th>Valor</th></tr></thead>
                        <tbody>
                          ${s2.atts.filter(a => a.pagamento === "mensal").map(a => `
                            <tr>
                              <td>${a.cliente || "-"}</td>
                              <td>${(a.servicos || []).map(sv => sv.nome).join(" + ") || a.servico || "-"}</td>
                              <td>${(a.servicos || []).map(sv => sv.profissional).filter(Boolean).join(", ") || a.profissional || "-"}</td>
                              <td class="num">${money(a.valor)}</td>
                            </tr>
                          `).join("")}
                        </tbody>
                      </table>
                    </div>`
                  : ""
              }

              <div class="sec">
                <h3>Detalhes das Despesas</h3>
                ${
                  s2.deps.length
                    ? `<table>
                        <thead><tr><th>Descrição</th><th>Origem</th><th>Valor</th></tr></thead>
                        <tbody>
                          ${s2.deps.map(d => `
                            <tr>
                              <td>${d.descricao}</td>
                              <td>${d.origem === "caixa" ? "Retirada do Caixa" : "Outro"}</td>
                              <td class="num">${money(d.valor)}</td>
                            </tr>
                          `).join("")}
                        </tbody>
                      </table>`
                    : `<div class="muted">Sem despesas para esta data</div>`
                }
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

              <div class="foot">Gerado em ${genStr}</div>
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