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
        .modal { width: min(92vw, 520px); max-width: 520px; background: #fff; border-radius: 16px; border:1px solid #e5e7eb; padding: 16px; max-height: calc(100dvh - 24px); overflow: auto; box-sizing: border-box; }
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
      <section class="section" id="birthSection">
        <div class="birth-head"><span>🎂</span><span>ANIVERSARIANTES</span><span>🎉</span></div>
        <div class="month-box" id="birthBox">
          <div class="empty">Sem dados de aniversariantes. Importe clientes do Notion em “Clientes › Importar do Notion”.</div>
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
      <div class="hero"><h1>Clientes</h1><p>Integração e cadastro</p></div>
      <section class="section">
        <div class="list">
          <div class="row" style="justify-content:space-between; gap:8px;">
            <div>
              <strong>Integração com Notion</strong>
              <div class="muted">Importe clientes e datas de aniversário a partir de uma base do Notion</div>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button class="btn-primary" id="btnNotionImport">Importar do Notion</button>
              <button class="btn-outline" id="btnNewClient">+ Novo Cliente</button>
            </div>
          </div>
        </div>
      </section>
      <section class="section">
        <h2 style="margin:0 0 8px;">Lista de clientes</h2>
        <div class="list" id="clientsList"></div>
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
      <div class="hero"><h1>Clientes Mensais</h1><p>Gestão de débitos mensais e pagamentos</p></div>
      <section class="section" id="mensalRoot"></section>
    `;

    const Servicos = () => `
      <style>
        .svc-hero h1 { margin:0 0 6px; font-size:28px; color:var(--bella-800); font-weight:900; letter-spacing:.2px; }
        .svc-hero p { margin:0; color:#9d3a69; font-weight:600; }
        .svc-actions { display:flex; gap:10px; flex-wrap:wrap; margin:12px 0; }
        .btn { border-radius:12px; padding:10px 14px; border:1px solid #f1e6ee; background:#fff; font-weight:900; color:#a1125b; box-shadow: var(--shadow); }
        .btn.primary { background:linear-gradient(90deg,var(--bella-500),var(--bella-400)); color:#fff; border:0; }
        .svc-filters { display:grid; gap:10px; margin:12px 0; }
        .svc-filters .field { display:grid; gap:6px; }
        .svc-filters input, .svc-filters select { border:1px solid #f3c6d9; border-radius:12px; padding:10px; font-weight:700; color:#a1125b; background:#fff; }
        .tabs { display:flex; gap:8px; overflow:auto; padding-bottom:2px; }
        .tab { white-space:nowrap; padding:8px 12px; border-radius:999px; border:1px solid #f3c6d9; color:#a1125b; font-weight:800; background:#fff; }
        .tab.active { background:#fff4f9; border:2px solid #f3a1c8; }
        .svc-list { display:grid; gap:12px; }
        .svc-card { display:grid; grid-template-columns: 108px 1fr; gap:12px; background:#fff; border:1px solid #f1e6ee; border-radius:18px; padding:12px; box-shadow: var(--shadow); }
        .svc-photo { width:100%; height:100%; max-height:92px; border-radius:14px; object-fit:cover; border:1px solid #f1e6ee; background:#fff7fb; }
        .svc-title { font-weight:900; color:#9d174d; text-transform:uppercase; letter-spacing:.2px; }
        .svc-desc { color:#6b7280; font-weight:600; font-size:13px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
        .svc-meta { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-top:6px; }
        .chip { display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:999px; font-weight:900; }
        .chip.time { background:#eef2ff; border:1px solid #c7d2fe; color:#4338ca; }
        .chip.price { background:linear-gradient(90deg,var(--bella-500),var(--bella-400)); color:#fff; }
        .svc-actions-inline { margin-top:8px; display:flex; gap:8px; flex-wrap:wrap; }
        @media(max-width:520px){ .svc-card { grid-template-columns: 1fr; } .svc-photo { max-height:160px; } }
      </style>

      <div class="svc-hero">
        <h1>Serviços</h1>
        <p>Catálogo, preços e duração (usado nos agendamentos)</p>
      </div>

      <div class="svc-actions">
        <button class="btn primary" id="svcNovo">+ Novo Serviço</button>
        <button class="btn" id="svcCat">Gerenciar Categorias</button>
      </div>

      <section class="section svc-filters">
        <div class="field">
          <label class="muted">Pesquisar</label>
          <input id="svcQ" placeholder="Nome ou descrição">
        </div>
        <div class="field">
          <label class="muted">Categorias</label>
          <div class="tabs" id="svcTabs"></div>
        </div>
      </section>

      <section class="section">
        <h2 style="margin:0 0 8px;">Lista</h2>
        <div class="svc-list" id="svcList"></div>
      </section>
    `;

    const Caixa = () => `
      <div id="caixa-root"></div>
    `;

    const Estoque = () => `
      <div id="estoque-root"></div>
    `;

    const Usuarios = () => `
      <div class="hero"><h1>Usuários</h1><p>Funcionários (usados na Agenda e preferências dos Clientes)</p></div>
      <section class="section">
        <div class="list">
          <div class="row" style="justify-content:space-between;gap:8px;">
            <div>
              <strong>Funcionários</strong>
              <div class="muted">Cadastre e edite usuários. Cada usuário tem uma cor usada nos cartões da Agenda.</div>
            </div>
            <button class="btn-outline" id="btnNewUser">+ Novo Usuário</button>
          </div>
        </div>
      </section>
      <section class="section">
        <h2 style="margin:0 0 8px;">Lista de usuários</h2>
        <div class="list" id="usersList"></div>
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

    // Novas páginas
    const HistoricoCaixa = () => `
      <div class="hero"><h1>Histórico do Caixa</h1><p>Dias de caixa fechados e salvos</p></div>
      <section class="section">
        <div id="histRoot"></div>
      </section>
    `;

    const Relatorios = () => `
      <div class="hero"><h1>Relatórios</h1><p>Semanal e mensal com base nos fechamentos do Caixa</p></div>
      <section class="section">
        <style>
          .rep-grid { display:grid; gap:14px; }
          .rep-card { border:1px solid #f1e6ee; border-radius:16px; padding:12px; background:#fff; box-shadow: var(--shadow); }
          .rep-row { display:grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap:10px; }
          .rep-kpi { border:1px solid #e5e7eb; border-radius:12px; padding:10px; }
          .rep-kpi .t { color:#334155; font-weight:900; font-size:12px; }
          .rep-kpi .v { color:#0f172a; font-weight:900; font-size:22px; }
          .rep-table { width:100%; border-collapse:separate; border-spacing:0 8px; }
          .rep-table th { text-align:left; color:#a1125b; font-size:12px; }
          .rep-table td { background:#fff; border:1px solid #f1e6ee; padding:10px; border-radius:10px; }
          .num { text-align:right; font-weight:900; }
          @media(max-width: 980px){ .rep-row { grid-template-columns: 1fr; } }
        </style>
        <div class="rep-grid">
          <div class="rep-card">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;">
              <div style="font-weight:900; color:#a1125b;">Relatório Semanal</div>
              <div style="display:flex; gap:8px; align-items:center;">
                <input id="repWeekRef" type="date">
                <button id="repWeekImg" class="btn-outline">Exportar Imagem</button>
                <button id="repWeekPdf" class="btn-outline">Exportar PDF</button>
              </div>
            </div>
            <div id="repWeek"></div>
          </div>
          <div class="rep-card">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;">
              <div style="font-weight:900; color:#a1125b;">Relatório Mensal</div>
              <div style="display:flex; gap:8px; align-items:center;">
                <input id="repMonthRef" type="month">
                <button id="repMonthImg" class="btn-outline">Exportar Imagem</button>
                <button id="repMonthPdf" class="btn-outline">Exportar PDF</button>
              </div>
            </div>
            <div id="repMonth"></div>
          </div>
        </div>
      </section>
    `;

    // Rotas da aplicação (preview estático)
    const routes = {
      "/dashboard": { title: "Dashboard", view: Dashboard },
      "/agenda": { title: "Agenda", view: Agenda },
      "/clientes": { title: "Clientes", view: Clientes },
      "/ficha-cliente": { title: "Ficha Cliente", view: FichaCliente },
      "/clientes-mensais": { title: "Clientes Mensais", view: ClientesMensais },
      "/servicos": { title: "Serviços", view: Servicos },
      "/caixa": { title: "Caixa", view: Caixa },
      "/historico-caixa": { title: "Histórico do Caixa", view: HistoricoCaixa },
      "/relatorios": { title: "Relatórios", view: Relatorios },
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
            <a class="item" href="#/historico-caixa" data-link="/historico-caixa"><span class="icon">🗂️</span><span class="label">Histórico do Caixa</span></a>
            <a class="item" href="#/relatorios" data-link="/relatorios"><span class="icon">📊</span><span class="label">Relatórios</span></a>
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

      // ==== Histórico do Caixa (helpers globais para múltiplas rotas) ====
      const HISTORY_KEY = "bella_caixa_history_v1";
      function getHistory() {
        try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{"days":{}}'); } catch { return { days: {} }; }
      }
      function setHistory(h) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
      }

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

      // ==== Clientes: armazenamento e integração com Notion ====
      const CLIENTS_KEY = "bella_clients_v1";
      function getClientsStore() {
        try {
          return JSON.parse(localStorage.getItem(CLIENTS_KEY) || '{"clients":[]}');
        } catch {
          return { clients: [] };
        }
      }
      function setClientsStore(s) {
        localStorage.setItem(CLIENTS_KEY, JSON.stringify(s));
      }
      function onlyDigitsLocal(s) { return String(s || "").replace(/\D+/g, ""); }
      function fmtDDMMLocal(iso) {
        if (!iso) return "";
        try { const [y,m,d] = iso.slice(0,10).split("-"); return `${d}/${m}`; } catch { return ""; }
      }
      function monthDayLocal(iso) {
        try { const [y,m,d] = iso.slice(0,10).split("-").map(Number); return { m, d }; } catch { return { m:null, d:null }; }
      }
      const NOTION_CFG_KEY = "bella_notion_cfg";
      function getNotionCfg() {
        try {
          return JSON.parse(localStorage.getItem(NOTION_CFG_KEY) || '{"secret":"","dbid":"","map":{"name":"Name","phone":"Phone","birth":"Birthday"}}');
        } catch {
          return { secret:"", dbid:"", map:{ name:"Name", phone:"Phone", birth:"Birthday" } };
        }
      }
      function setNotionCfg(cfg) {
        localStorage.setItem(NOTION_CFG_KEY, JSON.stringify(cfg));
      }

      // ==== Usuários (Funcionários) ====
      const USERS_KEY = "bella_users_v1";
      function getUsersStore() {
        try {
          return JSON.parse(localStorage.getItem(USERS_KEY) || '{"users":[]}');
        } catch {
          return { users: [] };
        }
      }
      function setUsersStore(s) {
        localStorage.setItem(USERS_KEY, JSON.stringify(s));
      }
      function ensureUsersDefaults() {
        const s = getUsersStore();
        if (!Array.isArray(s.users)) s.users = [];
        const palette = ["#10b981", "#ec4899", "#6366f1", "#f59e0b", "#06b6d4", "#84cc16", "#ef4444", "#14b8a6"];
        // Initialize defaults if empty
        if ((s.users || []).length === 0) {
          s.users = [
            { id: "u-kelly", nome: "Kelly Monice", handle: "@Kelly", telefone: "", color: "#10b981" }, // verde
            { id: "u-simone", nome: "Simone Barboza", handle: "@Simone", telefone: "", color: "#ec4899" }, // rosa
          ];
          setUsersStore(s);
          return;
        }
        // Ensure each user has a color
        let changed = false;
        s.users = (s.users || []).map((u, i) => {
          if (!u.color) { changed = true; return { ...u, color: palette[i % palette.length] }; }
          return u;
        });
        if (changed) setUsersStore(s);
      }
      function userColorByName(name) {
        try {
          const nm = String(name || "").toLowerCase();
          const u = (getUsersStore().users || []).find(x => String(x.nome || "").toLowerCase() === nm);
          return u && u.color ? u.color : "#9d174d";
        } catch { return "#9d174d"; }
      }

      // ==== Serviços: armazenamento local (catálogo usado nos agendamentos) ====
      const SVC_KEY = "bella_services_v1";
      function svcUid(p) { return `${p}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }
      function getSvcStore() {
        try { return JSON.parse(localStorage.getItem(SVC_KEY) || '{"cats":[],"items":[]}'); } catch { return { cats:[], items:[] }; }
      }
      function setSvcStore(s) { localStorage.setItem(SVC_KEY, JSON.stringify(s)); }
      function moneyBR(n) { return (Number(n)||0).toLocaleString("pt-BR", { style:"currency", currency:"BRL" }); }
      function minsTxt(min) {
        min = Number(min)||0;
        if (min < 60) return `${min}min`;
        const h = Math.floor(min/60); const m = min%60;
        return m ? `${h}h ${m}min` : `${h}h`;
      }
      function ensureSvcDefaults() {
        const s = getSvcStore();
        if ((s.items||[]).length) return;
        s.cats = [
          { id: svcUid("cat"), nome: "Unhas" },
          { id: svcUid("cat"), nome: "Cabelos" },
          { id: svcUid("cat"), nome: "Sobrancelha" },
          { id: svcUid("cat"), nome: "Depilação" },
        ];
        const cat = (name) => s.cats.find(c=>c.nome===name)?.id || s.cats[0].id;
        s.items = [
          { id: svcUid("svc"), nome: "Alongamento em Acrigel", cat_id: cat("Unhas"), preco: 150, duracao_min: 150, desc:"O que está incluso no serviço e principais benefícios. Tempo médio e objetivos.", foto: "/public/placeholder.svg" },
          { id: svcUid("svc"), nome: "Alongamento em Gel", cat_id: cat("Unhas"), preco: 150, duracao_min: 150, desc:"Descrição breve e objetiva do procedimento.", foto: "/public/placeholder.svg" },
          { id: svcUid("svc"), nome: "Alongamento Fibra de Vidro", cat_id: cat("Unhas"), preco: 180, duracao_min: 165, desc:"Durável e leve. Inclui manutenção básica.", foto: "/public/placeholder.svg" },
          { id: svcUid("svc"), nome: "Corte Feminino", cat_id: cat("Cabelos"), preco: 40, duracao_min: 40, desc:"Corte com acabamento escova simples.", foto: "/public/placeholder.svg" },
          { id: svcUid("svc"), nome: "Coloração", cat_id: cat("Cabelos"), preco: 120, duracao_min: 90, desc:"Coloração completa com tonalização.", foto: "/public/placeholder.svg" },
          { id: svcUid("svc"), nome: "Design de Sobrancelhas", cat_id: cat("Sobrancelha"), preco: 35, duracao_min: 30, desc:"Medição, marcação e alinhamento.", foto: "/public/placeholder.svg" },
        ];
        setSvcStore(s);
      }
      if (hash === "/dashboard") {
        const box = page.querySelector("#birthBox");
        if (box) {
          const s = getClientsStore();
          const list = (s.clients || []).filter(c => !!c.birthdate);
          const now = new Date();
          const cm = now.getMonth() + 1;
          const cd = now.getDate();
          const curr = list.filter(c => monthDayLocal(c.birthdate).m === cm)
                           .sort((a,b) => monthDayLocal(a.birthdate).d - monthDayLocal(b.birthdate).d);
          const today = curr.filter(c => monthDayLocal(c.birthdate).d === cd);
          const past = curr.filter(c => monthDayLocal(c.birthdate).d < cd);
          const upcoming = curr.filter(c => monthDayLocal(c.birthdate).d > cd);

          function item(c, tag) {
            const ch = (c.name || "?").slice(0,1).toUpperCase();
            const tel = onlyDigitsLocal(c.phone || "");
            const badge = tag ? `<span class="pill" style="background:#eef2ff;border:1px solid #c7d2fe;color:#4338ca;">${tag}</span>` : "";
            return `
              <div class="month-item">
                <div style="display:flex; gap:10px; align-items:center;">
                  <div class="circle">${ch}</div>
                  <div>
                    <div style="font-weight:900;">${c.name || "-"}</div>
                    <div class="muted"><span>📅</span> ${fmtDDMMLocal(c.birthdate)} ${badge}</div>
                  </div>
                </div>
                ${tel ? `<a class="tel" href="tel:+55${tel}" title="Ligar para o cliente">Ligar</a>` : `<span></span>`}
              </div>
            `;
          }

          if (!curr.length) {
            box.innerHTML = `<div class="empty">Nenhum aniversariante deste mês. Importe clientes do Notion em “Clientes › Importar do Notion”.</div>`;
          } else {
            const parts = [];
            parts.push(`<h3 style="margin:0 0 10px; display:flex; align-items:center; gap:8px;"><span>📅</span><span>Todos deste mês (${curr.length})</span></h3>`);
            if (today.length) {
              parts.push(`<div class="muted" style="font-weight:800;margin:6px 0;">Hoje</div>`);
              parts.push(today.map(c => item(c, "hoje")).join(""));
            }
            if (upcoming.length) {
              parts.push(`<div class="muted" style="font-weight:800;margin:6px 0;">Próximos</div>`);
              parts.push(upcoming.map(c => item(c, "")).join(""));
            }
            if (past.length) {
              parts.push(`<div class="muted" style="font-weight:800;margin:6px 0;">Já passaram</div>`);
              parts.push(past.map(c => item(c, "passou")).join(""));
            }
            box.innerHTML = parts.join("");
          }
        }
      }

      // Clientes: listar e importar do Notion
      if (hash === "/clientes") {
        const listEl = page.querySelector("#clientsList");
        function renderClientsList() {
          if (!listEl) return;
          const s = getClientsStore();
          const arr = (s.clients || []).slice().sort((a,b) => (a.name || "").localeCompare(b.name || ""));
          if (!arr.length) {
            listEl.innerHTML = `<div class="muted" style="padding:12px;">Nenhum cliente cadastrado. Clique em “Novo Cliente” para adicionar ou importe do Notion.</div>`;
            return;
          }
          listEl.innerHTML = arr.map(c => `
            <div class="row" data-id="${c.id}">
              <div>
                <strong>${c.name || "-"}</strong>
                <div class="muted">
                  ${[
                    c.phone || "",
                    c.prefUserName ? ("Prefere: " + c.prefUserName) : ""
                  ].filter(Boolean).join(" • ")}
                </div>
              </div>
              <div style="display:flex; gap:8px; align-items:center;">
                <span class="pill">${fmtDDMMLocal(c.birthdate) || "—"}</span>
                <button class="btn-outline" data-act="edit">Editar</button>
                <button class="btn-outline" data-act="del">Excluir</button>
              </div>
            </div>
          `).join("");
        }

        function showClientModal(existing = null) {
          const modals = document.getElementById("modals");
          const modal = modals.querySelector(".modal");
          const users = (getUsersStore().users || []);
          const it = existing ? { ...existing } : {
            id: "cl-" + Date.now(),
            name: "",
            phone: "",
            birthdate: "",
            prefUserId: "",
            prefUserName: ""
          };
          modal.innerHTML = `
            <style>
              .cmodal h3 { margin:0 0 12px; font-weight:900; color:var(--bella-800); }
              .cmodal .grid2 { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
              .cmodal .field { display:grid; gap:6px; }
              .cmodal label { color:#a1125b; font-weight:900; font-size:13px; }
              .cmodal input, .cmodal select {
                border:2px solid #f3c6d9; border-radius:14px; padding:10px; font-weight:700; color:#a1125b; background:#fff; width:100%; min-width:0;
              }
              .cmodal .footer { display:flex; justify-content:space-between; gap:8px; margin-top:10px; }
              .btn { border:1px solid #f1e6ee; border-radius:12px; padding:10px 12px; font-weight:900; color:#a1125b; background:#fff; }
              .btn.primary { background:linear-gradient(90deg,var(--bella-500),var(--bella-400)); color:#fff; border:0; }
              @media(max-width:640px){ .cmodal .grid2 { grid-template-columns: 1fr; } }
            </style>
            <div class="cmodal">
              <h3>${existing ? "Editar Cliente" : "Novo Cliente"}</h3>
              <div class="grid2">
                <div class="field">
                  <label>Nome *</label>
                  <input id="cNome" value="${(it.name || "").replace(/"/g,"&quot;")}" placeholder="Nome completo">
                </div>
                <div class="field">
                  <label>Telefone</label>
                  <input id="cTel" value="${(it.phone || "").replace(/"/g,"&quot;")}" placeholder="(DDD) 9xxxx-xxxx">
                </div>
                <div class="field">
                  <label>Aniversário</label>
                  <input id="cBirth" type="date" value="${it.birthdate || ""}">
                </div>
                <div class="field">
                  <label>Profissional preferido</label>
                  <select id="cPref">
                    <option value="">Selecionar</option>
                    ${users.map(u => `<option value="${u.id}" ${it.prefUserId===u.id?"selected":""}>${u.nome || ""}</option>`).join("")}
                  </select>
                </div>
              </div>
              <div class="footer">
                <button class="btn" data-close>Cancelar</button>
                <button class="btn primary" id="cSalvar">${existing ? "Salvar" : "Criar"}</button>
              </div>
            </div>
          `;
          modals.style.display = "flex";
          const $m = (sel)=>modal.querySelector(sel);

          $m("#cSalvar").addEventListener("click", () => {
            const name = ($m("#cNome").value || "").trim();
            if (!name) { alert("Informe o nome"); return; }
            const phone = ($m("#cTel").value || "").trim();
            const birthdate = $m("#cBirth").value || "";
            const prefUserId = $m("#cPref").value || "";
            const users = (getUsersStore().users || []);
            const prefUserName = prefUserId ? (users.find(u=>String(u.id)===String(prefUserId))?.nome || "") : "";

            const s = getClientsStore();
            const payload = { ...it, name, phone, birthdate, prefUserId, prefUserName };
            const idx = (s.clients || []).findIndex(c => String(c.id) === String(it.id));
            if (idx >= 0) s.clients[idx] = payload; else s.clients = (s.clients || []).concat(payload);
            setClientsStore(s);
            modals.style.display = "none";
            renderClientsList();
          });

          modal.addEventListener("click", (e) => { if (e.target.hasAttribute("data-close")) modals.style.display = "none"; });
        }

        function showNotionImportModal() {
          const modals = document.getElementById("modals");
          const modal = modals.querySelector(".modal");
          const cfg = getNotionCfg();

          modal.innerHTML = `
            <style>
              .nt-grid { display:grid; grid-template-columns: 1fr; gap:10px; }
              .nt-row { display:grid; gap:6px; }
              .nt-actions { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-top:10px; flex-wrap:wrap; }
              .nt-right { display:flex; gap:8px; }
              .nt-muted { color:#64748b; font-size:12px; font-weight:700; }
              .nt-select { border:1px solid #e5e7eb; border-radius:10px; padding:10px; font-family:inherit; }
              .nt-preview { border:1px solid #e5e7eb; border-radius:12px; padding:10px; background:#fff; max-height:180px; overflow:auto; }
              .nt-small { font-size:12px; color:#475569; }
              .btn { border:1px solid #f1e6ee; border-radius:10px; padding:10px 12px; font-weight:900; color:#a1125b; background:#fff; }
              .btn.primary { background: linear-gradient(90deg,var(--bella-500),var(--bella-400)); color:#fff; border:0; }
            </style>
            <h3>Importar do Notion (Preview Estático)</h3>
            <div class="nt-grid">
              <div class="nt-row">
                <label>Integration Secret *</label>
                <input id="ntSecret" placeholder="secret_..." value="${cfg.secret || ""}">
                <div class="nt-muted">Cole o secret da sua integração (Notion › My integrations) e compartilhe sua base com ela.</div>
              </div>

              <div class="nt-row">
                <label>Selecionar Database</label>
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                  <select id="ntDbSel" class="nt-select" style="min-width:260px;">
                    <option value="">— Listar bases do seu Notion —</option>
                  </select>
                  <button class="btn" id="ntListDb">Listar bases</button>
                </div>
                <div class="nt-small">Database ID selecionado</div>
                <input id="ntDb" placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" value="${cfg.dbid || ""}">
              </div>

              <div class="nt-row">
                <label>Mapeamento de Campos</label>
                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px;">
                  <div>
                    <div class="nt-small">Nome (Title)</div>
                    <select id="ntMapNameSel" class="nt-select"><option value="">—</option></select>
                  </div>
                  <div>
                    <div class="nt-small">Telefone (Phone/Rich Text)</div>
                    <select id="ntMapPhoneSel" class="nt-select"><option value="">—</option></select>
                  </div>
                  <div>
                    <div class="nt-small">Aniversário (Date)</div>
                    <select id="ntMapBirthSel" class="nt-select"><option value="">—</option></select>
                  </div>
                </div>
              </div>

              <div class="nt-actions">
                <div class="nt-muted">Dica: após selecionar a base, carregamos as propriedades para você escolher o mapeamento.</div>
                <div class="nt-right">
                  <button class="btn" id="ntPreview">Pré-visualizar</button>
                  <button class="btn primary" id="ntImport">Importar</button>
                  <button class="btn" data-close>Cancelar</button>
                </div>
              </div>

              <div class="nt-row">
                <label>Pré-visualização</label>
                <div id="ntPreviewArea" class="nt-preview nt-small">Sem dados. Clique em “Pré-visualizar”.</div>
              </div>
            </div>
          `;

          modals.style.display = "flex";
          const $m = (sel) => modal.querySelector(sel);
          modal.addEventListener("click", (e) => { if (e.target.hasAttribute("data-close")) modals.style.display = "none"; });

          // Helpers Notion
          async function notionSearchDatabases(secret) {
            const r = await fetch("https://api.notion.com/v1/search", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${secret}`,
                "Content-Type": "application/json",
                "Notion-Version": "2022-06-28",
              },
              body: JSON.stringify({
                page_size: 100,
                sort: { direction: "ascending", timestamp: "last_edited_time" },
                filter: { value: "database", property: "object" }
              }),
            });
            if (!r.ok) throw new Error("Falha ao buscar bases. Verifique o Secret e permissões da integração.");
            const j = await r.json();
            return (j.results || []).filter(x => x.object === "database").map(db => ({
              id: db.id,
              title: ((db.title || []).map(t => t.plain_text).join("") || "(Sem título)").trim(),
            }));
          }
          async function notionGetDatabase(secret, dbid) {
            const r = await fetch(`https://api.notion.com/v1/databases/${dbid}`, {
              headers: {
                "Authorization": `Bearer ${secret}`,
                "Notion-Version": "2022-06-28",
              },
            });
            if (!r.ok) throw new Error("Falha ao carregar propriedades do Database. Verifique compartilhamento com a integração.");
            const j = await r.json();
            const props = j.properties || {};
            return Object.keys(props).map((name) => ({ name, type: props[name]?.type || "" }));
          }
          async function notionQueryAll(secret, dbid) {
            let cursor = undefined;
            let all = [];
            for (let i = 0; i < 20; i++) {
              const body = cursor ? { start_cursor: cursor, page_size: 100 } : { page_size: 100 };
              const r = await fetch(`https://api.notion.com/v1/databases/${dbid}/query`, {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${secret}`,
                  "Content-Type": "application/json",
                  "Notion-Version": "2022-06-28",
                },
                body: JSON.stringify(body),
              });
              if (!r.ok) throw new Error("Falha ao consultar a base do Notion. Verifique o Secret, o Database ID e o compartilhamento.");
              const j = await r.json();
              all = all.concat(j.results || []);
              if (j.has_more && j.next_cursor) cursor = j.next_cursor; else break;
            }
            return all;
          }
          function getTitle(prop){ try { return (prop?.title || []).map(t=>t.plain_text).join("").trim(); } catch { return ""; } }
          function getText(prop){
            try {
              if (!prop) return "";
              if (prop.type === "phone_number") return prop.phone_number || "";
              if (prop.type === "rich_text") return (prop.rich_text || []).map(t=>t.plain_text).join(" ").trim();
              if (prop.type === "title") return getTitle(prop);
              return "";
            } catch { return ""; }
          }
          function getDate(prop){ try { return (prop?.date?.start || "").slice(0,10); } catch { return ""; } }

          function fillMappingSelects(properties) {
            const nameSel = $m("#ntMapNameSel");
            const phoneSel = $m("#ntMapPhoneSel");
            const birthSel = $m("#ntMapBirthSel");
            const makeOpts = (filterFn) => {
              const frags = ['<option value=""></option>'];
              (properties || []).forEach(p => {
                if (!filterFn || filterFn(p)) frags.push(`<option value="${p.name}">${p.name} (${p.type})</option>`);
              });
              return frags.join("");
            };
            nameSel.innerHTML = makeOpts(p => p.type === "title");
            phoneSel.innerHTML = makeOpts(p => p.type === "phone_number" || p.type === "rich_text");
            birthSel.innerHTML = makeOpts(p => p.type === "date");

            // Defaults/restore from cfg.map
            if (cfg.map?.name) nameSel.value = cfg.map.name;
            if (cfg.map?.phone) phoneSel.value = cfg.map.phone;
            if (cfg.map?.birth) birthSel.value = cfg.map.birth;
            // Fallback guesses
            if (!nameSel.value) {
              const firstTitle = (properties || []).find(p => p.type === "title");
              if (firstTitle) nameSel.value = firstTitle.name;
            }
            if (!phoneSel.value) {
              const firstPhone = (properties || []).find(p => p.type === "phone_number") ||
                                 (properties || []).find(p => p.type === "rich_text");
              if (firstPhone) phoneSel.value = firstPhone.name;
            }
            if (!birthSel.value) {
              const firstDate = (properties || []).find(p => p.type === "date");
              if (firstDate) birthSel.value = firstDate.name;
            }
          }

          async function loadDatabases() {
            const secret = ($m("#ntSecret").value || "").trim();
            if (!secret) { alert("Informe o Secret primeiro."); return; }
            try {
              $m("#ntListDb").disabled = true;
              const items = await notionSearchDatabases(secret);
              const sel = $m("#ntDbSel");
              sel.innerHTML = `<option value="">— Selecione —</option>` + items.map(d => `<option value="${d.id}">${d.title} — ${d.id.slice(0,8)}</option>`).join("");
              if (cfg.dbid) {
                const found = items.find(d => d.id === cfg.dbid);
                if (found) sel.value = cfg.dbid;
              }
            } catch (e) {
              alert(e.message || "Falha ao listar bases do Notion.");
            } finally {
              $m("#ntListDb").disabled = false;
            }
          }

          async function onSelectDb() {
            const id = $m("#ntDbSel").value || "";
            $m("#ntDb").value = id;
            if (!id) return;
            const secret = ($m("#ntSecret").value || "").trim();
            if (!secret) return;
            try {
              const props = await notionGetDatabase(secret, id);
              fillMappingSelects(props);
            } catch (e) {
              alert(e.message || "Falha ao obter propriedades da base.");
            }
          }

          async function doPreview() {
            const secret = ($m("#ntSecret").value || "").trim();
            const dbid = ($m("#ntDb").value || "").trim();
            if (!secret || !dbid) { alert("Informe o Secret e selecione o Database."); return; }
            // Infer map from selects
            const map = {
              name: ($m("#ntMapNameSel").value || "").trim(),
              phone: ($m("#ntMapPhoneSel").value || "").trim(),
              birth: ($m("#ntMapBirthSel").value || "").trim(),
            };
            if (!map.name) { alert("Selecione o campo de Nome (title)."); return; }
            try {
              const pages = await notionQueryAll(secret, dbid);
              const items = [];
              pages.forEach(p => {
                const props = p.properties || {};
                const nameProp = props[map.name];
                const phoneProp = map.phone ? props[map.phone] : null;
                const birthProp = map.birth ? props[map.birth] : null;
                const name = nameProp ? (getTitle(nameProp) || getText(nameProp)) : "";
                if (!name) return;
                const phone = phoneProp ? getText(phoneProp) : "";
                const birthdate = birthProp ? getDate(birthProp) : "";
                items.push({ id: p.id, name, phone, birthdate });
              });
              const prev = $m("#ntPreviewArea");
              prev.innerHTML = items.slice(0, 50).map(c => `
                <div style="padding:4px 0; border-bottom:1px solid #f1f5f9;">
                  <strong>${c.name}</strong>
                  <div>${c.phone ? `Tel: ${c.phone}` : "Tel: —"} • ${c.birthdate ? `Aniv.: ${new Date(c.birthdate).toLocaleDateString("pt-BR")}` : "Aniv.: —"}</div>
                </div>
              `).join("") + (items.length > 50 ? `<div class="nt-muted">... e mais ${items.length - 50} registros</div>` : (items.length ? "" : "<div class='nt-muted'>Nenhum registro legível encontrado</div>"));
              // Save temp in dataset for import
              prev.setAttribute("data-count", String(items.length));
              // Cache last preview set in memory
              modal.__lastPreviewItems = items;
              alert(`Pré-visualização pronta: ${items.length} registros.`);
            } catch (e) {
              alert(e.message || "Falha na pré-visualização.");
            }
          }

          async function doImport() {
            const secret = ($m("#ntSecret").value || "").trim();
            const dbid = ($m("#ntDb").value || "").trim();
            const name = ($m("#ntMapNameSel").value || "").trim();
            const phone = ($m("#ntMapPhoneSel").value || "").trim();
            const birth = ($m("#ntMapBirthSel").value || "").trim();
            if (!secret || !dbid || !name) { alert("Informe Secret, Database e campo de Nome."); return; }
            const map = { name, phone, birth };
            // Persist cfg
            setNotionCfg({ secret, dbid, map });
            try {
              // If we have preview cached, reuse; else query
              const items = Array.isArray(modal.__lastPreviewItems)
                ? modal.__lastPreviewItems
                : (await (async () => {
                    const pages = await notionQueryAll(secret, dbid);
                    const out = [];
                    pages.forEach(p => {
                      const props = p.properties || {};
                      const nameProp = props[name];
                      const phoneProp = phone ? props[phone] : null;
                      const birthProp = birth ? props[birth] : null;
                      const nm = nameProp ? (getTitle(nameProp) || getText(nameProp)) : "";
                      if (!nm) return;
                      const ph = phoneProp ? getText(phoneProp) : "";
                      const bd = birthProp ? getDate(birthProp) : "";
                      out.push({ id: p.id, name: nm, phone: ph, birthdate: bd });
                    });
                    return out;
                  })());
              setClientsStore({ clients: items });
              modals.style.display = "none";
              renderClientsList();
              alert(`Importados ${items.length} clientes do Notion.`);
            } catch (e) {
              alert(e.message || "Erro ao importar do Notion.");
            }
          }

          // Wire buttons
          $m("#ntListDb").addEventListener("click", loadDatabases);
          $m("#ntDbSel").addEventListener("change", onSelectDb);
          $m("#ntPreview").addEventListener("click", doPreview);
          $m("#ntImport").addEventListener("click", doImport);

          // Se já havia Secret/DBID salvos, tenta preencher props automaticamente
          (async () => {
            try {
              if (cfg.secret && cfg.dbid) {
                $m("#ntSecret").value = cfg.secret;
                $m("#ntDb").value = cfg.dbid;
                const props = await notionGetDatabase(cfg.secret, cfg.dbid);
                fillMappingSelects(props);
              }
            } catch {}
          })();
        }

        // Importador em massa (colar texto)
        function showBulkImportModal() {
          const modals = document.getElementById("modals");
          const modal = modals.querySelector(".modal");

          modal.innerHTML = `
            <style>
              .bmodal h3 { margin:0 0 12px; font-weight:900; color:var(--bella-800); }
              .bmodal .field { display:grid; gap:6px; }
              .bmodal label { color:#a1125b; font-weight:900; font-size:13px; }
              .bmodal textarea, .bmodal input, .bmodal select {
                border:2px solid #f3c6d9; border-radius:14px; padding:10px; font-weight:700; color:#a1125b; background:#fff; width:100%; min-width:0;
              }
              .bmodal .row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
              .bmodal .btn { border:1px solid #f1e6ee; border-radius:12px; padding:10px 12px; font-weight:900; color:#a1125b; background:#fff; }
              .bmodal .btn.primary { background:linear-gradient(90deg,var(--bella-500),var(--bella-400)); color:#fff; border:0; }
              .bmodal .prev { max-height:200px; overflow:auto; border:1px solid #e5e7eb; border-radius:12px; padding:10px; background:#fff; font-size:12px; }
              .bmodal .muted { color:#64748b; font-weight:700; font-size:12px; }
            </style>
            <div class="bmodal">
              <h3>Importar lista de clientes (colar texto)</h3>
              <div class="field">
                <label>Lista</label>
                <textarea id="bulkText" rows="10" placeholder="Cole aqui a lista. Aceita formatos: 
- 'Nome: X | Telefone: Y | Aniversário: DD/MM'
- 'Nome DD/MM Telefone'
- Tabela com colunas (Cliente, Data de Aniversário, Telefone)"></textarea>
                <div class="muted">Somente Nome, Aniversário e Telefone serão importados. Duplicados serão ignorados (dedupe por nome).</div>
              </div>
              <div class="row" style="justify-content:space-between;">
                <div class="muted" id="bulkStatus">Cole a lista e clique em Pré-visualizar.</div>
                <div class="row">
                  <button class="btn" id="bulkPreview">Pré-visualizar</button>
                  <button class="btn primary" id="bulkImport">Importar</button>
                  <button class="btn" data-close>Cancelar</button>
                </div>
              </div>
              <div class="field" style="margin-top:8px;">
                <label>Pré-visualização</label>
                <div id="bulkPrev" class="prev">Sem dados.</div>
              </div>
            </div>
          `;
          modals.style.display = "flex";
          const $m = (sel)=>modal.querySelector(sel);

          function normalizeName(n) {
            return String(n||"")
              .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
              .replace(/\s+/g," ").trim().toLowerCase();
          }
          function bestPhone(a, b) {
            const da = onlyDigitsLocal(a || "");
            const db = onlyDigitsLocal(b || "");
            if (!db) return da;
            if (!da) return db;
            return db.length > da.length ? db : da;
          }
          function toISOFromDDMM(ddmm) {
            if (!ddmm) return "";
            const s = String(ddmm).trim().toLowerCase();
            const mmap = {
              jan:"01", fev:"02", mar:"03", abr:"04", mai:"05", jun:"06",
              jul:"07", ago:"08", set:"09", out:"10", nov:"11", dez:"12"
            };
            // ex: 19/12 or 19/12/2024
            let m;
            m = s.match(/^(\d{1,2})\s*\/\s*(\d{1,2})(?:\s*\/\s*\d{2,4})?$/);
            if (m) {
              const d = String(Math.max(1, Math.min(31, parseInt(m[1],10)))).padStart(2,"0");
              const mo = String(Math.max(1, Math.min(12, parseInt(m[2],10)))).padStart(2,"0");
              return `2000-${mo}-${d}`;
            }
            // ex: 19/dez
            m = s.match(/^(\d{1,2})\s*\/\s*([a-zç]{3,})$/i);
            if (m) {
              const d = String(Math.max(1, Math.min(31, parseInt(m[1],10)))).padStart(2,"0");
              const mon = (m[2]||"").slice(0,3);
              const mo = mmap[mon] || "";
              if (mo) return `2000-${mo}-${d}`;
            }
            return "";
          }
          function parseBlocksNome(txt) {
            const items = [];
            const re = /Nome:\s*([^|]+?)\s*\|\s*Telefone:\s*([^|]*?)\s*\|\s*Aniversário:\s*([^|\n]*)/gi;
            let m;
            while ((m = re.exec(txt)) !== null) {
              const name = (m[1]||"").trim();
              const phone = (m[2]||"").trim();
              const ann = (m[3]||"").trim();
              if (!name) continue;
              const birth = toISOFromDDMM(ann);
              items.push({ name, phone, birthdate: birth });
            }
            return items;
          }
          function parseSimpleLines(txt) {
            const items = [];
            const lines = String(txt||"").split(/\r?\n/);
            const datePat = /(\d{1,2}\s*\/\s*(?:\d{1,2}|[A-Za-z]{3,}))/;
            for (let raw of lines) {
              let line = raw.trim();
              if (!line) continue;
              if (/^cliente/i.test(line)) continue; // header
              if (/^url:/i.test(line)) continue;
              if (/^user$/i.test(line)) continue;
              // pattern: Name date phone?
              const m = line.match(new RegExp(`^(.+?)\\s+${datePat.source}(?:\\s+(.*))?(function () {
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
        .modal { width: min(92vw, 520px); max-width: 520px; background: #fff; border-radius: 16px; border:1px solid #e5e7eb; padding: 16px; max-height: calc(100dvh - 24px); overflow: auto; box-sizing: border-box; }
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
      <section class="section" id="birthSection">
        <div class="birth-head"><span>🎂</span><span>ANIVERSARIANTES</span><span>🎉</span></div>
        <div class="month-box" id="birthBox">
          <div class="empty">Sem dados de aniversariantes. Importe clientes do Notion em “Clientes › Importar do Notion”.</div>
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
      <div class="hero"><h1>Clientes</h1><p>Integração e cadastro</p></div>
      <section class="section">
        <div class="list">
          <div class="row" style="justify-content:space-between; gap:8px;">
            <div>
              <strong>Integração com Notion</strong>
              <div class="muted">Importe clientes e datas de aniversário a partir de uma base do Notion</div>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button class="btn-primary" id="btnNotionImport">Importar do Notion</button>
              <button class="btn-outline" id="btnNewClient">+ Novo Cliente</button>
            </div>
          </div>
        </div>
      </section>
      <section class="section">
        <h2 style="margin:0 0 8px;">Lista de clientes</h2>
        <div class="list" id="clientsList"></div>
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
      <div class="hero"><h1>Clientes Mensais</h1><p>Gestão de débitos mensais e pagamentos</p></div>
      <section class="section" id="mensalRoot"></section>
    `;

    const Servicos = () => `
      <style>
        .svc-hero h1 { margin:0 0 6px; font-size:28px; color:var(--bella-800); font-weight:900; letter-spacing:.2px; }
        .svc-hero p { margin:0; color:#9d3a69; font-weight:600; }
        .svc-actions { display:flex; gap:10px; flex-wrap:wrap; margin:12px 0; }
        .btn { border-radius:12px; padding:10px 14px; border:1px solid #f1e6ee; background:#fff; font-weight:900; color:#a1125b; box-shadow: var(--shadow); }
        .btn.primary { background:linear-gradient(90deg,var(--bella-500),var(--bella-400)); color:#fff; border:0; }
        .svc-filters { display:grid; gap:10px; margin:12px 0; }
        .svc-filters .field { display:grid; gap:6px; }
        .svc-filters input, .svc-filters select { border:1px solid #f3c6d9; border-radius:12px; padding:10px; font-weight:700; color:#a1125b; background:#fff; }
        .tabs { display:flex; gap:8px; overflow:auto; padding-bottom:2px; }
        .tab { white-space:nowrap; padding:8px 12px; border-radius:999px; border:1px solid #f3c6d9; color:#a1125b; font-weight:800; background:#fff; }
        .tab.active { background:#fff4f9; border:2px solid #f3a1c8; }
        .svc-list { display:grid; gap:12px; }
        .svc-card { display:grid; grid-template-columns: 108px 1fr; gap:12px; background:#fff; border:1px solid #f1e6ee; border-radius:18px; padding:12px; box-shadow: var(--shadow); }
        .svc-photo { width:100%; height:100%; max-height:92px; border-radius:14px; object-fit:cover; border:1px solid #f1e6ee; background:#fff7fb; }
        .svc-title { font-weight:900; color:#9d174d; text-transform:uppercase; letter-spacing:.2px; }
        .svc-desc { color:#6b7280; font-weight:600; font-size:13px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
        .svc-meta { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-top:6px; }
        .chip { display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:999px; font-weight:900; }
        .chip.time { background:#eef2ff; border:1px solid #c7d2fe; color:#4338ca; }
        .chip.price { background:linear-gradient(90deg,var(--bella-500),var(--bella-400)); color:#fff; }
        .svc-actions-inline { margin-top:8px; display:flex; gap:8px; flex-wrap:wrap; }
        @media(max-width:520px){ .svc-card { grid-template-columns: 1fr; } .svc-photo { max-height:160px; } }
      </style>

      <div class="svc-hero">
        <h1>Serviços</h1>
        <p>Catálogo, preços e duração (usado nos agendamentos)</p>
      </div>

      <div class="svc-actions">
        <button class="btn primary" id="svcNovo">+ Novo Serviço</button>
        <button class="btn" id="svcCat">Gerenciar Categorias</button>
      </div>

      <section class="section svc-filters">
        <div class="field">
          <label class="muted">Pesquisar</label>
          <input id="svcQ" placeholder="Nome ou descrição">
        </div>
        <div class="field">
          <label class="muted">Categorias</label>
          <div class="tabs" id="svcTabs"></div>
        </div>
      </section>

      <section class="section">
        <h2 style="margin:0 0 8px;">Lista</h2>
        <div class="svc-list" id="svcList"></div>
      </section>
    `;

    const Caixa = () => `
      <div id="caixa-root"></div>
    `;

    const Estoque = () => `
      <div id="estoque-root"></div>
    `;

    const Usuarios = () => `
      <div class="hero"><h1>Usuários</h1><p>Funcionários (usados na Agenda e preferências dos Clientes)</p></div>
      <section class="section">
        <div class="list">
          <div class="row" style="justify-content:space-between;gap:8px;">
            <div>
              <strong>Funcionários</strong>
              <div class="muted">Cadastre e edite usuários. Cada usuário tem uma cor usada nos cartões da Agenda.</div>
            </div>
            <button class="btn-outline" id="btnNewUser">+ Novo Usuário</button>
          </div>
        </div>
      </section>
      <section class="section">
        <h2 style="margin:0 0 8px;">Lista de usuários</h2>
        <div class="list" id="usersList"></div>
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

    // Novas páginas
    const HistoricoCaixa = () => `
      <div class="hero"><h1>Histórico do Caixa</h1><p>Dias de caixa fechados e salvos</p></div>
      <section class="section">
        <div id="histRoot"></div>
      </section>
    `;

    const Relatorios = () => `
      <div class="hero"><h1>Relatórios</h1><p>Semanal e mensal com base nos fechamentos do Caixa</p></div>
      <section class="section">
        <style>
          .rep-grid { display:grid; gap:14px; }
          .rep-card { border:1px solid #f1e6ee; border-radius:16px; padding:12px; background:#fff; box-shadow: var(--shadow); }
          .rep-row { display:grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap:10px; }
          .rep-kpi { border:1px solid #e5e7eb; border-radius:12px; padding:10px; }
          .rep-kpi .t { color:#334155; font-weight:900; font-size:12px; }
          .rep-kpi .v { color:#0f172a; font-weight:900; font-size:22px; }
          .rep-table { width:100%; border-collapse:separate; border-spacing:0 8px; }
          .rep-table th { text-align:left; color:#a1125b; font-size:12px; }
          .rep-table td { background:#fff; border:1px solid #f1e6ee; padding:10px; border-radius:10px; }
          .num { text-align:right; font-weight:900; }
          @media(max-width: 980px){ .rep-row { grid-template-columns: 1fr; } }
        </style>
        <div class="rep-grid">
          <div class="rep-card">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;">
              <div style="font-weight:900; color:#a1125b;">Relatório Semanal</div>
              <div style="display:flex; gap:8px; align-items:center;">
                <input id="repWeekRef" type="date">
                <button id="repWeekImg" class="btn-outline">Exportar Imagem</button>
                <button id="repWeekPdf" class="btn-outline">Exportar PDF</button>
              </div>
            </div>
            <div id="repWeek"></div>
          </div>
          <div class="rep-card">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;">
              <div style="font-weight:900; color:#a1125b;">Relatório Mensal</div>
              <div style="display:flex; gap:8px; align-items:center;">
                <input id="repMonthRef" type="month">
                <button id="repMonthImg" class="btn-outline">Exportar Imagem</button>
                <button id="repMonthPdf" class="btn-outline">Exportar PDF</button>
              </div>
            </div>
            <div id="repMonth"></div>
          </div>
        </div>
      </section>
    `;

    // Rotas da aplicação (preview estático)
    const routes = {
      "/dashboard": { title: "Dashboard", view: Dashboard },
      "/agenda": { title: "Agenda", view: Agenda },
      "/clientes": { title: "Clientes", view: Clientes },
      "/ficha-cliente": { title: "Ficha Cliente", view: FichaCliente },
      "/clientes-mensais": { title: "Clientes Mensais", view: ClientesMensais },
      "/servicos": { title: "Serviços", view: Servicos },
      "/caixa": { title: "Caixa", view: Caixa },
      "/historico-caixa": { title: "Histórico do Caixa", view: HistoricoCaixa },
      "/relatorios": { title: "Relatórios", view: Relatorios },
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
            <a class="item" href="#/historico-caixa" data-link="/historico-caixa"><span class="icon">🗂️</span><span class="label">Histórico do Caixa</span></a>
            <a class="item" href="#/relatorios" data-link="/relatorios"><span class="icon">📊</span><span class="label">Relatórios</span></a>
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

      // ==== Histórico do Caixa (helpers globais para múltiplas rotas) ====
      const HISTORY_KEY = "bella_caixa_history_v1";
      function getHistory() {
        try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{"days":{}}'); } catch { return { days: {} }; }
      }
      function setHistory(h) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
      }

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

      // ==== Clientes: armazenamento e integração com Notion ====
      const CLIENTS_KEY = "bella_clients_v1";
      function getClientsStore() {
        try {
          return JSON.parse(localStorage.getItem(CLIENTS_KEY) || '{"clients":[]}');
        } catch {
          return { clients: [] };
        }
      }
      function setClientsStore(s) {
        localStorage.setItem(CLIENTS_KEY, JSON.stringify(s));
      }
      function onlyDigitsLocal(s) { return String(s || "").replace(/\D+/g, ""); }
      function fmtDDMMLocal(iso) {
        if (!iso) return "";
        try { const [y,m,d] = iso.slice(0,10).split("-"); return `${d}/${m}`; } catch { return ""; }
      }
      function monthDayLocal(iso) {
        try { const [y,m,d] = iso.slice(0,10).split("-").map(Number); return { m, d }; } catch { return { m:null, d:null }; }
      }
      const NOTION_CFG_KEY = "bella_notion_cfg";
      function getNotionCfg() {
        try {
          return JSON.parse(localStorage.getItem(NOTION_CFG_KEY) || '{"secret":"","dbid":"","map":{"name":"Name","phone":"Phone","birth":"Birthday"}}');
        } catch {
          return { secret:"", dbid:"", map:{ name:"Name", phone:"Phone", birth:"Birthday" } };
        }
      }
      function setNotionCfg(cfg) {
        localStorage.setItem(NOTION_CFG_KEY, JSON.stringify(cfg));
      }

      // ==== Usuários (Funcionários) ====
      const USERS_KEY = "bella_users_v1";
      function getUsersStore() {
        try {
          return JSON.parse(localStorage.getItem(USERS_KEY) || '{"users":[]}');
        } catch {
          return { users: [] };
        }
      }
      function setUsersStore(s) {
        localStorage.setItem(USERS_KEY, JSON.stringify(s));
      }
      function ensureUsersDefaults() {
        const s = getUsersStore();
        if (!Array.isArray(s.users)) s.users = [];
        const palette = ["#10b981", "#ec4899", "#6366f1", "#f59e0b", "#06b6d4", "#84cc16", "#ef4444", "#14b8a6"];
        // Initialize defaults if empty
        if ((s.users || []).length === 0) {
          s.users = [
            { id: "u-kelly", nome: "Kelly Monice", handle: "@Kelly", telefone: "", color: "#10b981" }, // verde
            { id: "u-simone", nome: "Simone Barboza", handle: "@Simone", telefone: "", color: "#ec4899" }, // rosa
          ];
          setUsersStore(s);
          return;
        }
        // Ensure each user has a color
        let changed = false;
        s.users = (s.users || []).map((u, i) => {
          if (!u.color) { changed = true; return { ...u, color: palette[i % palette.length] }; }
          return u;
        });
        if (changed) setUsersStore(s);
      }
      function userColorByName(name) {
        try {
          const nm = String(name || "").toLowerCase();
          const u = (getUsersStore().users || []).find(x => String(x.nome || "").toLowerCase() === nm);
          return u && u.color ? u.color : "#9d174d";
        } catch { return "#9d174d"; }
      }

      // ==== Serviços: armazenamento local (catálogo usado nos agendamentos) ====
      const SVC_KEY = "bella_services_v1";
      function svcUid(p) { return `${p}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }
      function getSvcStore() {
        try { return JSON.parse(localStorage.getItem(SVC_KEY) || '{"cats":[],"items":[]}'); } catch { return { cats:[], items:[] }; }
      }
      function setSvcStore(s) { localStorage.setItem(SVC_KEY, JSON.stringify(s)); }
      function moneyBR(n) { return (Number(n)||0).toLocaleString("pt-BR", { style:"currency", currency:"BRL" }); }
      function minsTxt(min) {
        min = Number(min)||0;
        if (min < 60) return `${min}min`;
        const h = Math.floor(min/60); const m = min%60;
        return m ? `${h}h ${m}min` : `${h}h`;
      }
      function ensureSvcDefaults() {
        const s = getSvcStore();
        if ((s.items||[]).length) return;
        s.cats = [
          { id: svcUid("cat"), nome: "Unhas" },
          { id: svcUid("cat"), nome: "Cabelos" },
          { id: svcUid("cat"), nome: "Sobrancelha" },
          { id: svcUid("cat"), nome: "Depilação" },
        ];
        const cat = (name) => s.cats.find(c=>c.nome===name)?.id || s.cats[0].id;
        s.items = [
          { id: svcUid("svc"), nome: "Alongamento em Acrigel", cat_id: cat("Unhas"), preco: 150, duracao_min: 150, desc:"O que está incluso no serviço e principais benefícios. Tempo médio e objetivos.", foto: "/public/placeholder.svg" },
          { id: svcUid("svc"), nome: "Alongamento em Gel", cat_id: cat("Unhas"), preco: 150, duracao_min: 150, desc:"Descrição breve e objetiva do procedimento.", foto: "/public/placeholder.svg" },
          { id: svcUid("svc"), nome: "Alongamento Fibra de Vidro", cat_id: cat("Unhas"), preco: 180, duracao_min: 165, desc:"Durável e leve. Inclui manutenção básica.", foto: "/public/placeholder.svg" },
          { id: svcUid("svc"), nome: "Corte Feminino", cat_id: cat("Cabelos"), preco: 40, duracao_min: 40, desc:"Corte com acabamento escova simples.", foto: "/public/placeholder.svg" },
          { id: svcUid("svc"), nome: "Coloração", cat_id: cat("Cabelos"), preco: 120, duracao_min: 90, desc:"Coloração completa com tonalização.", foto: "/public/placeholder.svg" },
          { id: svcUid("svc"), nome: "Design de Sobrancelhas", cat_id: cat("Sobrancelha"), preco: 35, duracao_min: 30, desc:"Medição, marcação e alinhamento.", foto: "/public/placeholder.svg" },
        ];
        setSvcStore(s);
      }
      if (hash === "/dashboard") {
        const box = page.querySelector("#birthBox");
        if (box) {
          const s = getClientsStore();
          const list = (s.clients || []).filter(c => !!c.birthdate);
          const now = new Date();
          const cm = now.getMonth() + 1;
          const cd = now.getDate();
          const curr = list.filter(c => monthDayLocal(c.birthdate).m === cm)
                           .sort((a,b) => monthDayLocal(a.birthdate).d - monthDayLocal(b.birthdate).d);
          const today = curr.filter(c => monthDayLocal(c.birthdate).d === cd);
          const past = curr.filter(c => monthDayLocal(c.birthdate).d < cd);
          const upcoming = curr.filter(c => monthDayLocal(c.birthdate).d > cd);

          function item(c, tag) {
            const ch = (c.name || "?").slice(0,1).toUpperCase();
            const tel = onlyDigitsLocal(c.phone || "");
            const badge = tag ? `<span class="pill" style="background:#eef2ff;border:1px solid #c7d2fe;color:#4338ca;">${tag}</span>` : "";
            return `
              <div class="month-item">
                <div style="display:flex; gap:10px; align-items:center;">
                  <div class="circle">${ch}</div>
                  <div>
                    <div style="font-weight:900;">${c.name || "-"}</div>
                    <div class="muted"><span>📅</span> ${fmtDDMMLocal(c.birthdate)} ${badge}</div>
                  </div>
                </div>
                ${tel ? `<a class="tel" href="tel:+55${tel}" title="Ligar para o cliente">Ligar</a>` : `<span></span>`}
              </div>
            `;
          }

          if (!curr.length) {
            box.innerHTML = `<div class="empty">Nenhum aniversariante deste mês. Importe clientes do Notion em “Clientes › Importar do Notion”.</div>`;
          } else {
            const parts = [];
            parts.push(`<h3 style="margin:0 0 10px; display:flex; align-items:center; gap:8px;"><span>📅</span><span>Todos deste mês (${curr.length})</span></h3>`);
            if (today.length) {
              parts.push(`<div class="muted" style="font-weight:800;margin:6px 0;">Hoje</div>`);
              parts.push(today.map(c => item(c, "hoje")).join(""));
            }
            if (upcoming.length) {
              parts.push(`<div class="muted" style="font-weight:800;margin:6px 0;">Próximos</div>`);
              parts.push(upcoming.map(c => item(c, "")).join(""));
            }
            if (past.length) {
              parts.push(`<div class="muted" style="font-weight:800;margin:6px 0;">Já passaram</div>`);
              parts.push(past.map(c => item(c, "passou")).join(""));
            }
            box.innerHTML = parts.join("");
          }
        }
      }

      // Clientes: listar e importar do Notion
      if (hash === "/clientes") {
        const listEl = page.querySelector("#clientsList");
        function renderClientsList() {
          if (!listEl) return;
          const s = getClientsStore();
          const arr = (s.clients || []).slice().sort((a,b) => (a.name || "").localeCompare(b.name || ""));
          if (!arr.length) {
            listEl.innerHTML = `<div class="muted" style="padding:12px;">Nenhum cliente cadastrado. Clique em “Novo Cliente” para adicionar ou importe do Notion.</div>`;
            return;
          }
          listEl.innerHTML = arr.map(c => `
            <div class="row" data-id="${c.id}">
              <div>
                <strong>${c.name || "-"}</strong>
                <div class="muted">
                  ${[
                    c.phone || "",
                    c.prefUserName ? ("Prefere: " + c.prefUserName) : ""
                  ].filter(Boolean).join(" • ")}
                </div>
              </div>
              <div style="display:flex; gap:8px; align-items:center;">
                <span class="pill">${fmtDDMMLocal(c.birthdate) || "—"}</span>
                <button class="btn-outline" data-act="edit">Editar</button>
                <button class="btn-outline" data-act="del">Excluir</button>
              </div>
            </div>
          `).join("");
        }

        function showClientModal(existing = null) {
          const modals = document.getElementById("modals");
          const modal = modals.querySelector(".modal");
          const users = (getUsersStore().users || []);
          const it = existing ? { ...existing } : {
            id: "cl-" + Date.now(),
            name: "",
            phone: "",
            birthdate: "",
            prefUserId: "",
            prefUserName: ""
          };
          modal.innerHTML = `
            <style>
              .cmodal h3 { margin:0 0 12px; font-weight:900; color:var(--bella-800); }
              .cmodal .grid2 { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
              .cmodal .field { display:grid; gap:6px; }
              .cmodal label { color:#a1125b; font-weight:900; font-size:13px; }
              .cmodal input, .cmodal select {
                border:2px solid #f3c6d9; border-radius:14px; padding:10px; font-weight:700; color:#a1125b; background:#fff; width:100%; min-width:0;
              }
              .cmodal .footer { display:flex; justify-content:space-between; gap:8px; margin-top:10px; }
              .btn { border:1px solid #f1e6ee; border-radius:12px; padding:10px 12px; font-weight:900; color:#a1125b; background:#fff; }
              .btn.primary { background:linear-gradient(90deg,var(--bella-500),var(--bella-400)); color:#fff; border:0; }
              @media(max-width:640px){ .cmodal .grid2 { grid-template-columns: 1fr; } }
            </style>
            <div class="cmodal">
              <h3>${existing ? "Editar Cliente" : "Novo Cliente"}</h3>
              <div class="grid2">
                <div class="field">
                  <label>Nome *</label>
                  <input id="cNome" value="${(it.name || "").replace(/"/g,"&quot;")}" placeholder="Nome completo">
                </div>
                <div class="field">
                  <label>Telefone</label>
                  <input id="cTel" value="${(it.phone || "").replace(/"/g,"&quot;")}" placeholder="(DDD) 9xxxx-xxxx">
                </div>
                <div class="field">
                  <label>Aniversário</label>
                  <input id="cBirth" type="date" value="${it.birthdate || ""}">
                </div>
                <div class="field">
                  <label>Profissional preferido</label>
                  <select id="cPref">
                    <option value="">Selecionar</option>
                    ${users.map(u => `<option value="${u.id}" ${it.prefUserId===u.id?"selected":""}>${u.nome || ""}</option>`).join("")}
                  </select>
                </div>
              </div>
              <div class="footer">
                <button class="btn" data-close>Cancelar</button>
                <button class="btn primary" id="cSalvar">${existing ? "Salvar" : "Criar"}</button>
              </div>
            </div>
          `;
          modals.style.display = "flex";
          const $m = (sel)=>modal.querySelector(sel);

          $m("#cSalvar").addEventListener("click", () => {
            const name = ($m("#cNome").value || "").trim();
            if (!name) { alert("Informe o nome"); return; }
            const phone = ($m("#cTel").value || "").trim();
            const birthdate = $m("#cBirth").value || "";
            const prefUserId = $m("#cPref").value || "";
            const users = (getUsersStore().users || []);
            const prefUserName = prefUserId ? (users.find(u=>String(u.id)===String(prefUserId))?.nome || "") : "";

            const s = getClientsStore();
            const payload = { ...it, name, phone, birthdate, prefUserId, prefUserName };
            const idx = (s.clients || []).findIndex(c => String(c.id) === String(it.id));
            if (idx >= 0) s.clients[idx] = payload; else s.clients = (s.clients || []).concat(payload);
            setClientsStore(s);
            modals.style.display = "none";
            renderClientsList();
          });

          modal.addEventListener("click", (e) => { if (e.target.hasAttribute("data-close")) modals.style.display = "none"; });
        }

        function showNotionImportModal() {
          const modals = document.getElementById("modals");
          const modal = modals.querySelector(".modal");
          const cfg = getNotionCfg();

          modal.innerHTML = `
            <style>
              .nt-grid { display:grid; grid-template-columns: 1fr; gap:10px; }
              .nt-row { display:grid; gap:6px; }
              .nt-actions { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-top:10px; flex-wrap:wrap; }
              .nt-right { display:flex; gap:8px; }
              .nt-muted { color:#64748b; font-size:12px; font-weight:700; }
              .nt-select { border:1px solid #e5e7eb; border-radius:10px; padding:10px; font-family:inherit; }
              .nt-preview { border:1px solid #e5e7eb; border-radius:12px; padding:10px; background:#fff; max-height:180px; overflow:auto; }
              .nt-small { font-size:12px; color:#475569; }
              .btn { border:1px solid #f1e6ee; border-radius:10px; padding:10px 12px; font-weight:900; color:#a1125b; background:#fff; }
              .btn.primary { background: linear-gradient(90deg,var(--bella-500),var(--bella-400)); color:#fff; border:0; }
            </style>
            <h3>Importar do Notion (Preview Estático)</h3>
            <div class="nt-grid">
              <div class="nt-row">
                <label>Integration Secret *</label>
                <input id="ntSecret" placeholder="secret_..." value="${cfg.secret || ""}">
                <div class="nt-muted">Cole o secret da sua integração (Notion › My integrations) e compartilhe sua base com ela.</div>
              </div>

              <div class="nt-row">
                <label>Selecionar Database</label>
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                  <select id="ntDbSel" class="nt-select" style="min-width:260px;">
                    <option value="">— Listar bases do seu Notion —</option>
                  </select>
                  <button class="btn" id="ntListDb">Listar bases</button>
                </div>
                <div class="nt-small">Database ID selecionado</div>
                <input id="ntDb" placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" value="${cfg.dbid || ""}">
              </div>

              <div class="nt-row">
                <label>Mapeamento de Campos</label>
                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px;">
                  <div>
                    <div class="nt-small">Nome (Title)</div>
                    <select id="ntMapNameSel" class="nt-select"><option value="">—</option></select>
                  </div>
                  <div>
                    <div class="nt-small">Telefone (Phone/Rich Text)</div>
                    <select id="ntMapPhoneSel" class="nt-select"><option value="">—</option></select>
                  </div>
                  <div>
                    <div class="nt-small">Aniversário (Date)</div>
                    <select id="ntMapBirthSel" class="nt-select"><option value="">—</option></select>
                  </div>
                </div>
              </div>

              <div class="nt-actions">
                <div class="nt-muted">Dica: após selecionar a base, carregamos as propriedades para você escolher o mapeamento.</div>
                <div class="nt-right">
                  <button class="btn" id="ntPreview">Pré-visualizar</button>
                  <button class="btn primary" id="ntImport">Importar</button>
                  <button class="btn" data-close>Cancelar</button>
                </div>
              </div>

              <div class="nt-row">
                <label>Pré-visualização</label>
                <div id="ntPreviewArea" class="nt-preview nt-small">Sem dados. Clique em “Pré-visualizar”.</div>
              </div>
            </div>
          `;

          modals.style.display = "flex";
          const $m = (sel) => modal.querySelector(sel);
          modal.addEventListener("click", (e) => { if (e.target.hasAttribute("data-close")) modals.style.display = "none"; });

          // Helpers Notion
          async function notionSearchDatabases(secret) {
            const r = await fetch("https://api.notion.com/v1/search", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${secret}`,
                "Content-Type": "application/json",
                "Notion-Version": "2022-06-28",
              },
              body: JSON.stringify({
                page_size: 100,
                sort: { direction: "ascending", timestamp: "last_edited_time" },
                filter: { value: "database", property: "object" }
              }),
            });
            if (!r.ok) throw new Error("Falha ao buscar bases. Verifique o Secret e permissões da integração.");
            const j = await r.json();
            return (j.results || []).filter(x => x.object === "database").map(db => ({
              id: db.id,
              title: ((db.title || []).map(t => t.plain_text).join("") || "(Sem título)").trim(),
            }));
          }
          async function notionGetDatabase(secret, dbid) {
            const r = await fetch(`https://api.notion.com/v1/databases/${dbid}`, {
              headers: {
                "Authorization": `Bearer ${secret}`,
                "Notion-Version": "2022-06-28",
              },
            });
            if (!r.ok) throw new Error("Falha ao carregar propriedades do Database. Verifique compartilhamento com a integração.");
            const j = await r.json();
            const props = j.properties || {};
            return Object.keys(props).map((name) => ({ name, type: props[name]?.type || "" }));
          }
          async function notionQueryAll(secret, dbid) {
            let cursor = undefined;
            let all = [];
            for (let i = 0; i < 20; i++) {
              const body = cursor ? { start_cursor: cursor, page_size: 100 } : { page_size: 100 };
              const r = await fetch(`https://api.notion.com/v1/databases/${dbid}/query`, {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${secret}`,
                  "Content-Type": "application/json",
                  "Notion-Version": "2022-06-28",
                },
                body: JSON.stringify(body),
              });
              if (!r.ok) throw new Error("Falha ao consultar a base do Notion. Verifique o Secret, o Database ID e o compartilhamento.");
              const j = await r.json();
              all = all.concat(j.results || []);
              if (j.has_more && j.next_cursor) cursor = j.next_cursor; else break;
            }
            return all;
          }
          function getTitle(prop){ try { return (prop?.title || []).map(t=>t.plain_text).join("").trim(); } catch { return ""; } }
          function getText(prop){
            try {
              if (!prop) return "";
              if (prop.type === "phone_number") return prop.phone_number || "";
              if (prop.type === "rich_text") return (prop.rich_text || []).map(t=>t.plain_text).join(" ").trim();
              if (prop.type === "title") return getTitle(prop);
              return "";
            } catch { return ""; }
          }
          function getDate(prop){ try { return (prop?.date?.start || "").slice(0,10); } catch { return ""; } }

          function fillMappingSelects(properties) {
            const nameSel = $m("#ntMapNameSel");
            const phoneSel = $m("#ntMapPhoneSel");
            const birthSel = $m("#ntMapBirthSel");
            const makeOpts = (filterFn) => {
              const frags = ['<option value=""></option>'];
              (properties || []).forEach(p => {
                if (!filterFn || filterFn(p)) frags.push(`<option value="${p.name}">${p.name} (${p.type})</option>`);
              });
              return frags.join("");
            };
            nameSel.innerHTML = makeOpts(p => p.type === "title");
            phoneSel.innerHTML = makeOpts(p => p.type === "phone_number" || p.type === "rich_text");
            birthSel.innerHTML = makeOpts(p => p.type === "date");

            // Defaults/restore from cfg.map
            if (cfg.map?.name) nameSel.value = cfg.map.name;
            if (cfg.map?.phone) phoneSel.value = cfg.map.phone;
            if (cfg.map?.birth) birthSel.value = cfg.map.birth;
            // Fallback guesses
            if (!nameSel.value) {
              const firstTitle = (properties || []).find(p => p.type === "title");
              if (firstTitle) nameSel.value = firstTitle.name;
            }
            if (!phoneSel.value) {
              const firstPhone = (properties || []).find(p => p.type === "phone_number") ||
                                 (properties || []).find(p => p.type === "rich_text");
              if (firstPhone) phoneSel.value = firstPhone.name;
            }
            if (!birthSel.value) {
              const firstDate = (properties || []).find(p => p.type === "date");
              if (firstDate) birthSel.value = firstDate.name;
            }
          }

          async function loadDatabases() {
            const secret = ($m("#ntSecret").value || "").trim();
            if (!secret) { alert("Informe o Secret primeiro."); return; }
            try {
              $m("#ntListDb").disabled = true;
              const items = await notionSearchDatabases(secret);
              const sel = $m("#ntDbSel");
              sel.innerHTML = `<option value="">— Selecione —</option>` + items.map(d => `<option value="${d.id}">${d.title} — ${d.id.slice(0,8)}</option>`).join("");
              if (cfg.dbid) {
                const found = items.find(d => d.id === cfg.dbid);
                if (found) sel.value = cfg.dbid;
              }
            } catch (e) {
              alert(e.message || "Falha ao listar bases do Notion.");
            } finally {
              $m("#ntListDb").disabled = false;
            }
          }

          async function onSelectDb() {
            const id = $m("#ntDbSel").value || "";
            $m("#ntDb").value = id;
            if (!id) return;
            const secret = ($m("#ntSecret").value || "").trim();
            if (!secret) return;
            try {
              const props = await notionGetDatabase(secret, id);
              fillMappingSelects(props);
            } catch (e) {
              alert(e.message || "Falha ao obter propriedades da base.");
            }
          }

          async function doPreview() {
            const secret = ($m("#ntSecret").value || "").trim();
            const dbid = ($m("#ntDb").value || "").trim();
            if (!secret || !dbid) { alert("Informe o Secret e selecione o Database."); return; }
            // Infer map from selects
            const map = {
              name: ($m("#ntMapNameSel").value || "").trim(),
              phone: ($m("#ntMapPhoneSel").value || "").trim(),
              birth: ($m("#ntMapBirthSel").value || "").trim(),
            };
            if (!map.name) { alert("Selecione o campo de Nome (title)."); return; }
            try {
              const pages = await notionQueryAll(secret, dbid);
              const items = [];
              pages.forEach(p => {
                const props = p.properties || {};
                const nameProp = props[map.name];
                const phoneProp = map.phone ? props[map.phone] : null;
                const birthProp = map.birth ? props[map.birth] : null;
                const name = nameProp ? (getTitle(nameProp) || getText(nameProp)) : "";
                if (!name) return;
                const phone = phoneProp ? getText(phoneProp) : "";
                const birthdate = birthProp ? getDate(birthProp) : "";
                items.push({ id: p.id, name, phone, birthdate });
              });
              const prev = $m("#ntPreviewArea");
              prev.innerHTML = items.slice(0, 50).map(c => `
                <div style="padding:4px 0; border-bottom:1px solid #f1f5f9;">
                  <strong>${c.name}</strong>
                  <div>${c.phone ? `Tel: ${c.phone}` : "Tel: —"} • ${c.birthdate ? `Aniv.: ${new Date(c.birthdate).toLocaleDateString("pt-BR")}` : "Aniv.: —"}</div>
                </div>
              `).join("") + (items.length > 50 ? `<div class="nt-muted">... e mais ${items.length - 50} registros</div>` : (items.length ? "" : "<div class='nt-muted'>Nenhum registro legível encontrado</div>"));
              // Save temp in dataset for import
              prev.setAttribute("data-count", String(items.length));
              // Cache last preview set in memory
              modal.__lastPreviewItems = items;
              alert(`Pré-visualização pronta: ${items.length} registros.`);
            } catch (e) {
              alert(e.message || "Falha na pré-visualização.");
            }
          }

          async function doImport() {
            const secret = ($m("#ntSecret").value || "").trim();
            const dbid = ($m("#ntDb").value || "").trim();
            const name = ($m("#ntMapNameSel").value || "").trim();
            const phone = ($m("#ntMapPhoneSel").value || "").trim();
            const birth = ($m("#ntMapBirthSel").value || "").trim();
            if (!secret || !dbid || !name) { alert("Informe Secret, Database e campo de Nome."); return; }
            const map = { name, phone, birth };
            // Persist cfg
            setNotionCfg({ secret, dbid, map });
            try {
              // If we have preview cached, reuse; else query
              const items = Array.isArray(modal.__lastPreviewItems)
                ? modal.__lastPreviewItems
                : (await (async () => {
                    const pages = await notionQueryAll(secret, dbid);
                    const out = [];
                    pages.forEach(p => {
                      const props = p.properties || {};
                      const nameProp = props[name];
                      const phoneProp = phone ? props[phone] : null;
                      const birthProp = birth ? props[birth] : null;
                      const nm = nameProp ? (getTitle(nameProp) || getText(nameProp)) : "";
                      if (!nm) return;
                      const ph = phoneProp ? getText(phoneProp) : "";
                      const bd = birthProp ? getDate(birthProp) : "";
                      out.push({ id: p.id, name: nm, phone: ph, birthdate: bd });
                    });
                    return out;
                  })());
              setClientsStore({ clients: items });
              modals.style.display = "none";
              renderClientsList();
              alert(`Importados ${items.length} clientes do Notion.`);
            } catch (e) {
              alert(e.message || "Erro ao importar do Notion.");
            }
          }

          // Wire buttons
          $m("#ntListDb").addEventListener("click", loadDatabases);
          $m("#ntDbSel").addEventListener("change", onSelectDb);
          $m("#ntPreview").addEventListener("click", doPreview);
          $m("#ntImport").addEventListener("click", doImport);

          // Se já havia Secret/DBID salvos, tenta preencher props automaticamente
          (async () => {
            try {
              if (cfg.secret && cfg.dbid) {
                $m("#ntSecret").value = cfg.secret;
                $m("#ntDb").value = cfg.dbid;
                const props = await notionGetDatabase(cfg.secret, cfg.dbid);
                fillMappingSelects(props);
              }
            } catch {}
          })();
        }

        , "i"));
              if (m) {
                const name = (m[1]||"").replace(/\s{2,}/g," ").trim();
                const dateStr = (m[2]||"").trim();
                const phone = (m[3]||"").trim();
                if (name) {
                  const birth = toISOFromDDMM(dateStr);
                  items.push({ name, phone, birthdate: birth });
                }
                continue;
              }
              // pattern: only name (no date/phone) - skip
            }
            return items;
          }
          function cleanItem(it) {
            const name = (it.name || "").replace(/\s{2,}/g," ").trim();
            let phone = onlyDigitsLocal(it.phone || "");
            if (phone.length < 8) phone = ""; // ignora muito curto
            const birth = it.birthdate || "";
            return { name, phone, birthdate: birth };
          }
          function mergeDedup(baseArr) {
            const map = new Map();
            baseArr.forEach(raw => {
              const it = cleanItem(raw);
              if (!it.name) return;
              const key = normalizeName(it.name);
              if (!key) return;
              const cur = map.get(key);
              if (!cur) {
                map.set(key, it);
              } else {
                // merge: keep best phone (longer), keep birthdate if missing
                const phone = bestPhone(cur.phone, it.phone);
                const birthdate = cur.birthdate || it.birthdate || "";
                map.set(key, { name: cur.name || it.name, phone, birthdate });
              }
            });
            return Array.from(map.values());
          }

          function parseAll(txt) {
            const a = parseBlocksNome(txt);
            const b = parseSimpleLines(txt);
            return mergeDedup(a.concat(b));
          }

          function renderPreview(items) {
            const prev = $m("#bulkPrev");
            if (!items.length) {
              prev.innerHTML = "<div class='muted'>Nenhum item legível encontrado.</div>";
              return;
            }
            const rows = items.slice(0, 80).map(c => {
              const phone = c.phone || "—";
              const birth = c.birthdate ? c.birthdate.slice(8,10)+"/"+c.birthdate.slice(5,7) : "—";
              return `<div style="display:flex; align-items:center; justify-content:space-between; gap:8px; border-bottom:1px solid #f1f5f9; padding:4px 0;">
                <div><strong>${c.name}</strong></div>
                <div class="muted">Aniv.: ${birth}</div>
                <div class="muted">Tel: ${phone}</div>
              </div>`;
            }).join("");
            prev.innerHTML = rows + (items.length > 80 ? `<div class="muted">... e mais ${items.length - 80} registros</div>` : "");
          }

          $m("#bulkPreview").addEventListener("click", () => {
            const txt = ($m("#bulkText").value || "").trim();
            const items = parseAll(txt);
            $m("#bulkStatus").textContent = `Pré-visualização: ${items.length} únicos (após dedupe por nome).`;
            renderPreview(items);
            modal.__bulkItems = items;
          });

          $m("#bulkImport").addEventListener("click", () => {
            const items = Array.isArray(modal.__bulkItems) ? modal.__bulkItems : parseAll(($m("#bulkText").value || "").trim());
            if (!items.length) { alert("Nada para importar."); return; }
            const s = getClientsStore();
            if (!Array.isArray(s.clients)) s.clients = [];
            const byKey = (arr) => {
              const map = new Map();
              arr.forEach(c => map.set(normalizeName(c.name || ""), c));
              return map;
            };
            const currentMap = byKey(s.clients || []);
            let added = 0, updated = 0;
            items.forEach(it => {
              const key = normalizeName(it.name);
              if (!key) return;
              const existing = currentMap.get(key);
              if (existing) {
                let ch = false;
                // phone
                const newPhone = bestPhone(existing.phone, it.phone);
                if ((existing.phone || "") !== newPhone) { existing.phone = newPhone; ch = true; }
                // birthdate
                if (!existing.birthdate && it.birthdate) { existing.birthdate = it.birthdate; ch = true; }
                if (ch) updated++;
              } else {
                const id = "cl-" + Date.now() + "-" + Math.random().toString(36).slice(2,7);
                s.clients.push({ id, name: it.name, phone: it.phone, birthdate: it.birthdate });
                currentMap.set(key, s.clients[s.clients.length-1]);
                added++;
              }
            });
            // Ordena por nome
            s.clients = (s.clients || []).slice().sort((a,b) => (a.name||"").localeCompare(b.name||""));
            setClientsStore(s);
            modals.style.display = "none";
            renderClientsList();
            alert(`Importação concluída: ${added} novos, ${updated} atualizados, ${items.length - (added + updated)} mantidos.`);
          });

          modal.addEventListener("click", (e)=>{ if (e.target.hasAttribute("data-close")) modals.style.display = "none"; });
        }

        page.querySelector("#btnNotionImport")?.addEventListener("click", showNotionImportModal);
        page.querySelector("#btnBulkImport")?.addEventListener("click", showBulkImportModal);
        ensureUsersDefaults();
        page.querySelector("#btnNewClient")?.addEventListener("click", () => showClientModal());
        if (listEl) {
          listEl.addEventListener("click", (e) => {
            const actBtn = e.target.closest("[data-act]");
            if (!actBtn) return;
            const rowEl = e.target.closest(".row[data-id]");
            if (!rowEl) return;
            const id = rowEl.getAttribute("data-id");
            const act = actBtn.getAttribute("data-act");
            const s = getClientsStore();
            const idx = (s.clients || []).findIndex((c) => String(c.id) === String(id));
            if (act === "edit") {
              const existing = idx >= 0 ? s.clients[idx] : null;
              if (existing) showClientModal(existing);
            } else if (act === "del") {
              if (confirm("Excluir este cliente? Isso não remove agendamentos existentes.")) {
                if (idx >= 0) {
                  s.clients.splice(idx, 1);
                  setClientsStore(s);
                  renderClientsList();
                }
              }
            }
          });
        }
        renderClientsList();
      }

      // Clientes Mensais: gestão de débitos, pagamentos e exportação
      if (hash === "/clientes-mensais") {
        ensureSvcDefaults();
        const root = page.querySelector("#mensalRoot");

        // Helpers stores
        const MONTHLY_KEY = "bella_monthly_v1";
        function getMonthlyStore() {
          try { return JSON.parse(localStorage.getItem(MONTHLY_KEY) || '{"clients":{}}'); } catch { return { clients: {} }; }
        }
        function setMonthlyStore(s) { localStorage.setItem(MONTHLY_KEY, JSON.stringify(s)); }
        const moneyBR = (n) => (Number(n)||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
        const today = new Date();
        const thisYM = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}`;
        const CL_SEL_KEY = "bella_mensal_selected_client";
        const YM_SEL_KEY = "bella_mensal_selected_month";
        const svcStore = getSvcStore();

        function getClients() {
          const s = getClientsStore();
          return (s.clients || []).slice().sort((a,b)=> (a.name||"").localeCompare(b.name||""));
        }
        function setClientMonthlyFlag(id, flag) {
          const s = getClientsStore();
          const idx = (s.clients||[]).findIndex(c => String(c.id) === String(id));
          if (idx>=0) {
            const it = s.clients[idx];
            it.isMonthly = !!flag;
            s.clients[idx] = it;
            setClientsStore(s);
          }
        }
        function getLedger(clientId, ym) {
          const st = getMonthlyStore();
          return (st.clients?.[clientId]?.[ym]) || { items: [], payments: [], closed: false };
        }
        function setLedger(clientId, ym, ledger) {
          const st = getMonthlyStore();
          if (!st.clients[clientId]) st.clients[clientId] = {};
          st.clients[clientId][ym] = ledger;
          setMonthlyStore(st);
        }
        function addPayment(clientId, ym, amount, note="") {
          const d = new Date();
          const ymd = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
          const led = getLedger(clientId, ym);
          led.payments.push({ id: "mp-"+Date.now(), date: ymd, amount: Number(amount)||0, note });
          setLedger(clientId, ym, led);
        }
        function totals(ledger) {
          const ts = (ledger.items||[]).reduce((a,b)=>a+(Number(b.value)||0),0);
          const tp = (ledger.payments||[]).reduce((a,b)=>a+(Number(b.amount)||0),0);
          return { totalServ: ts, totalPay: tp, outstanding: ts - tp };
        }

        async function ensureHtml2Canvas() {
          if (!window.html2canvas) {
            await new Promise((resolve, reject) => {
              const s = document.createElement("script");
              s.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
              s.onload = resolve;
              s.onerror = reject;
              document.head.appendChild(s);
            });
          }
        }

        function renderUI() {
          const clients = getClients();
          let selectedClient = null;
          const savedId = localStorage.getItem(CL_SEL_KEY);
          if (savedId) selectedClient = clients.find(c => String(c.id) === String(savedId));
          if (!selectedClient) selectedClient = clients[0] || null;
          const savedYM = localStorage.getItem(YM_SEL_KEY) || thisYM;

          const ledger = selectedClient ? getLedger(selectedClient.id, savedYM) : { items:[], payments:[], closed:false };
          const t = totals(ledger);

          root.innerHTML = `
            <style>
              .mrow { display:grid; grid-template-columns: 1fr 180px 180px; gap:10px; }
              .field { display:grid; gap:6px; }
              .field label { color:#334155; font-weight:800; font-size:13px; }
              select, input { border:1px solid #e5e7eb; border-radius:12px; padding:10px; font-weight:700; color:#0f172a; background:#fff; }
              .btn { border:1px solid #e5e7eb; border-radius:12px; padding:10px 12px; font-weight:900; color:#0f172a; background:#fff; }
              .btn.primary { background:linear-gradient(90deg,#0ea5a1,#4f46e5); color:#fff; border:0; }
              .grid3 { display:grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap:10px; margin:12px 0; }
              .k { border:2px solid #e5e7eb; border-radius:12px; padding:10px; background:#fff; }
              .k .t { color:#334155; font-weight:900; font-size:12px; }
              .k .v { color:#0f172a; font-weight:900; font-size:22px; margin-top:4px; }
              .list { border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; background:#fff; }
              table { width:100%; border-collapse:separate; border-spacing:0 8px; }
              th { text-align:left; color:#0f172a; font-weight:900; }
              td, th { padding:10px 12px; background:#fff; }
              tr td { border:1px solid #e5e7eb; }
              .num { text-align:right; font-weight:900; }
              .svcimg { width:56px; height:56px; border-radius:10px; border:1px solid #e5e7eb; object-fit:cover; background:#fff; }
              .row-actions { display:flex; gap:8px; flex-wrap:wrap; }
              .muted { color:#64748b; }
            </style>

            <div class="mrow">
              <div class="field">
                <label>Cliente</label>
                <select id="mnCli">
                  ${clients.map(c => `<option value="${c.id}" ${selectedClient && c.id===selectedClient.id?"selected":""}>${c.name || ""}${c.isMonthly ? " • Mensal" : ""}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <label>Mês</label>
                <input id="mnMonth" type="month" value="${savedYM}">
              </div>
              <div class="field">
                <label>Ações</label>
                <div class="row-actions">
                  ${selectedClient && !selectedClient.isMonthly ? `<button id="mnAtivar" class="btn">Ativar como Mensal</button>` : `<button id="mnDesativar" class="btn">Desativar Mensal</button>`}
                </div>
              </div>
            </div>

            <div class="grid3">
              <div class="k"><div class="t">Serviços no mês</div><div class="v">${moneyBR(t.totalServ)}</div></div>
              <div class="k"><div class="t">Pagamentos</div><div class="v">${moneyBR(t.totalPay)}</div></div>
              <div class="k"><div class="t">Débito atual</div><div class="v">${moneyBR(t.outstanding)}</div></div>
            </div>

            <div class="row-actions" style="margin:8px 0;">
              <input id="mnPayVal" type="number" step="0.01" min="0" placeholder="Valor do pagamento" style="max-width:200px;">
              <input id="mnPayNote" placeholder="Observação (opcional)" style="max-width:260px;">
              <button id="mnAddPay" class="btn">Registrar pagamento</button>
              <button id="mnQuitar" class="btn primary">Quitar tudo</button>
              <button id="mnExport" class="btn">Exportar imagem p/ cliente</button>
            </div>

            <section class="list" style="margin-top:10px;">
              <h3 style="margin:10px;">Serviços do mês</h3>
              ${(ledger.items||[]).length ? `
                <table>
                  <thead><tr><th>Data</th><th>Foto</th><th>Serviço</th><th>Profissional</th><th class="num">Valor</th></tr></thead>
                  <tbody>
                    ${(ledger.items||[]).map(it => {
                      const dbr = new Date(it.date + "T00:00:00").toLocaleDateString("pt-BR");
                      const img = it.image || (svcStore.items||[]).find(s => s.id === it.serviceId)?.foto || "/public/placeholder.svg";
                      return `<tr>
                        <td>${dbr}</td>
                        <td><img class="svcimg" src="${img}"></td>
                        <td>${it.serviceName || "-"}</td>
                        <td>${it.professional || "-"}</td>
                        <td class="num">${moneyBR(it.value)}</td>
                      </tr>`;
                    }).join("")}
                  </tbody>
                </table>
              ` : `<div class="muted" style="padding:12px;">Sem serviços anotados neste mês.</div>`}
            </section>

            <section class="list" style="margin-top:10px;">
              <h3 style="margin:10px;">Pagamentos</h3>
              ${(ledger.payments||[]).length ? `
                <table>
                  <thead><tr><th>Data</th><th>Obs.</th><th class="num">Valor</th></tr></thead>
                  <tbody>
                    ${(ledger.payments||[]).map(p => {
                      const dbr = new Date(p.date + "T00:00:00").toLocaleDateString("pt-BR");
                      return `<tr><td>${dbr}</td><td>${p.note || "-"}</td><td class="num">${moneyBR(p.amount)}</td></tr>`;
                    }).join("")}
                  </tbody>
                </table>
              ` : `<div class="muted" style="padding:12px;">Sem pagamentos registrados.</div>`}
            </section>
          `;

          // Wire
          const cliSel = root.querySelector("#mnCli");
          const ymInp = root.querySelector("#mnMonth");
          cliSel && cliSel.addEventListener("change", () => { localStorage.setItem(CL_SEL_KEY, cliSel.value || ""); renderUI(); });
          ymInp && ymInp.addEventListener("change", () => { localStorage.setItem(YM_SEL_KEY, ymInp.value || thisYM); renderUI(); });

          const selectedId = cliSel ? cliSel.value : null;
          root.querySelector("#mnAtivar")?.addEventListener("click", () => { if (selectedId) { setClientMonthlyFlag(selectedId, true); renderUI(); } });
          root.querySelector("#mnDesativar")?.addEventListener("click", () => { if (selectedId) { setClientMonthlyFlag(selectedId, false); renderUI(); } });

          root.querySelector("#mnAddPay")?.addEventListener("click", () => {
            const v = parseFloat(root.querySelector("#mnPayVal").value || "0") || 0;
            const note = (root.querySelector("#mnPayNote").value || "").trim();
            if (!selectedId) { alert("Selecione o cliente."); return; }
            if (v <= 0) { alert("Informe o valor do pagamento."); return; }
            addPayment(selectedId, ymInp.value || thisYM, v, note);
            renderUI();
          });
          root.querySelector("#mnQuitar")?.addEventListener("click", () => {
            if (!selectedId) return;
            const led = getLedger(selectedId, ymInp.value || thisYM);
            const t2 = totals(led);
            const rest = t2.outstanding;
            if (rest <= 0) { alert("Não há débito a quitar."); return; }
            addPayment(selectedId, ymInp.value || thisYM, rest, "Quitar tudo");
            // marca como fechado logicamente
            const led2 = getLedger(selectedId, ymInp.value || thisYM);
            led2.closed = true;
            setLedger(selectedId, ymInp.value || thisYM, led2);
            renderUI();
          });

          root.querySelector("#mnExport")?.addEventListener("click", async () => {
            if (!selectedId) return;
            await ensureHtml2Canvas();
            const client = getClients().find(c => String(c.id) === String(selectedId));
            const ym = ymInp.value || thisYM;
            const led = getLedger(selectedId, ym);
            const t3 = totals(led);
            // Build DOM
            const c = document.createElement("div");
            c.style.position = "fixed";
            c.style.left = "-10000px";
            c.style.top = "0";
            c.style.width = "960px";
            c.style.background = "#fff";
            c.style.color = "#0f172a";
            c.style.padding = "20px";
            c.style.fontFamily = "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
            const monthBr = ym.split("-").reverse().join("/");
            const genStr = new Date().toLocaleString("pt-BR");
            const rows = (led.items||[]).map(it => {
              const dbr = new Date(it.date + "T00:00:00").toLocaleDateString("pt-BR");
              const img = it.image || (svcStore.items||[]).find(s => s.id === it.serviceId)?.foto || "/public/placeholder.svg";
              return `
                <tr>
                  <td>${dbr}</td>
                  <td><img class="simg" src="${img}"></td>
                  <td>${it.serviceName || "-"}</td>
                  <td>${it.professional || "-"}</td>
                  <td class="num">${moneyBR(it.value)}</td>
                </tr>
              `;
            }).join("");
            const pays = (led.payments||[]).map(p => {
              const dbr = new Date(p.date + "T00:00:00").toLocaleDateString("pt-BR");
              return `<tr><td>${dbr}</td><td>${p.note || "-"}</td><td class="num">${moneyBR(p.amount)}</td></tr>`;
            }).join("");
            c.innerHTML = `
              <style>
                .brand { height:6px; background:linear-gradient(90deg,#0ea5a1,#4f46e5); border-radius:999px; margin-bottom:10px; }
                .head { display:flex; align-items:flex-end; justify-content:space-between; gap:16px; padding-bottom:8px; border-bottom:2px solid #e5e7eb; }
                .title { font-size:28px; font-weight:900; }
                .meta { color:#475569; font-weight:800; }
                .cards { display:grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap:10px; margin:10px 0 12px; }
                .card { border:2px solid #e5e7eb; border-radius:12px; padding:10px; background:#fff; }
                .card .t { color:#334155; font-weight:900; font-size:12px; }
                .card .v { color:#0f172a; font-weight:900; font-size:22px; margin-top:4px; }
                h3 { margin: 12px 0 8px; color:#0f172a; }
                table { width:100%; border-collapse:separate; border-spacing:0 8px; font-size:15px; }
                th { text-align:left; color:#0f172a; font-weight:900; }
                td, th { padding:10px 12px; border:1px solid #e5e7eb; background:#fff; }
                .simg { width:56px; height:56px; border-radius:10px; border:1px solid #e5e7eb; object-fit:cover; background:#fff; }
                .num { text-align:right; font-weight:900; }
                .foot { margin-top:10px; color:#64748b; font-size:12px; }
              </style>
              <div class="brand"></div>
              <div class="head">
                <div>
                  <div class="title">Extrato Mensal — Espaço Bella's</div>
                  <div><strong>Cliente:</strong> ${client?.name || "-"} • <strong>Mês:</strong> ${monthBr}</div>
                </div>
                <div class="meta">Gerado em: ${genStr}</div>
              </div>

              <div class="cards">
                <div class="card"><div class="t">Serviços no mês</div><div class="v">${moneyBR(t3.totalServ)}</div></div>
                <div class="card"><div class="t">Pagamentos</div><div class="v">${moneyBR(t3.totalPay)}</div></div>
                <div class="card"><div class="t">Saldo a pagar</div><div class="v">${moneyBR(t3.outstanding)}</div></div>
              </div>

              <h3>Serviços</h3>
              ${(led.items||[]).length ? `
                <table>
                  <thead><tr><th>Data</th><th>Foto</th><th>Serviço</th><th>Profissional</th><th class="num">Valor</th></tr></thead>
                  <tbody>${rows}</tbody>
                </table>` : `<div class="meta">Sem serviços neste mês.</div>`}

              <h3>Pagamentos</h3>
              ${(led.payments||[]).length ? `
                <table>
                  <thead><tr><th>Data</th><th>Obs.</th><th class="num">Valor</th></tr></thead>
                  <tbody>${pays}</tbody>
                </table>` : `<div class="meta">Sem pagamentos registrados.</div>`}

              <div class="foot">
                CNPJ: 30.504.701/0001-29 • Endereço: R. Rezende, 229 - Iputinga, Recife - PE, 50680-200 • Tel: (81) 98628-8749
              </div>
            `;
            document.body.appendChild(c);
            const canvas = await html2canvas(c, { backgroundColor: "#ffffff", scale: 2, windowWidth: 960, windowHeight: c.scrollHeight });
            const dataUrl = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = `extrato-mensal_${client?.name ? client.name.normalize("NFKD").replace(/[\\u0300-\\u036f]/g,"").replace(/[^a-z0-9_\\-\\.]+/gi,"-"):"cliente"}_${ym}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            c.remove();
          });
        }

        renderUI();
      }

      // Histórico do Caixa
      if (hash === "/historico-caixa") {
        const root = page.querySelector("#histRoot");
        const money = (n) => (Number(n)||0).toLocaleString("pt-BR",{style:"currency", currency:"BRL"});
        const h = getHistory();
        const keys = Object.keys(h.days || {}).sort((a,b) => b.localeCompare(a));
        if (!keys.length) {
          root.innerHTML = `<div class="empty">Nenhum fechamento salvo. Volte ao Caixa e clique em "Fechar caixa do dia".</div>`;
        } else {
          root.innerHTML = `
            <div class="list" id="histList">
              ${keys.map(ymd => {
                const d = h.days[ymd];
                const br = (() => { const [y,m,dd]=ymd.split("-"); return `${dd}/${m}/${y}`;})();
                const closed = new Date(d.closedAt || Date.now()).toLocaleString("pt-BR");
                const entradas = d?.resumo?.entradas || 0;
                const despesas = d?.resumo?.totalDespesas || 0;
                const saldo = (d?.resumo?.dinheiroCalculado || 0);
                return `
                  <div class="row" data-ymd="${ymd}">
                    <div>
                      <div style="font-weight:900;">${br}</div>
                      <div class="muted">Fechado em: ${closed}</div>
                    </div>
                    <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
                      <span class="pill">Entradas ${money(entradas)}</span>
                      <span class="pill">Despesas ${money(despesas)}</span>
                      <span class="pill">Dinheiro Calc. ${money(saldo)}</span>
                      <button class="btn-outline" data-act="open">Ver</button>
                      <button class="btn-outline" data-act="del">Excluir</button>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          `;
          const list = root.querySelector("#histList");
          list.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-act]");
            if (!btn) return;
            const row = e.target.closest(".row[data-ymd]");
            const ymd = row?.getAttribute("data-ymd");
            if (!ymd) return;
            const act = btn.getAttribute("data-act");
            if (act === "open") {
              localStorage.setItem("bella_caixa_selected_date", ymd);
              location.hash = "/caixa";
            } else if (act === "del") {
              if (!confirm("Remover este fechamento do histórico? Os dados do dia no Caixa não serão apagados.")) return;
              const hh = getHistory();
              if (hh.days) delete hh.days[ymd];
              setHistory(hh);
              // Re-render
              location.reload();
            }
          });
        }
      }

      // Relatórios (Semanal e Mensal) com base no histórico salvo
      if (hash === "/relatorios") {
        const weekRef = page.querySelector("#repWeekRef");
        const monthRef = page.querySelector("#repMonthRef");
        const weekBox = page.querySelector("#repWeek");
        const monthBox = page.querySelector("#repMonth");

        function ymdFromDate(d) {
          const y = d.getFullYear();
          const m = String(d.getMonth()+1).padStart(2,"0");
          const dd = String(d.getDate()).padStart(2,"0");
          return `${y}-${m}-${dd}`;
        }
        const today = new Date();
        weekRef.value = ymdFromDate(today);
        monthRef.value = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}`;

        function br(ymd) { const [y,m,d]=ymd.split("-"); return `${d}/${m}/${y}`; }

        function weekRangeFrom(refYmd) {
          const [y,m,d] = refYmd.split("-").map(Number);
          const dt = new Date(y, m-1, d);
          const dow = (dt.getDay() + 6) % 7; // 0 = Monday
          const start = new Date(dt); start.setDate(dt.getDate() - dow);
          const end = new Date(start); end.setDate(start.getDate() + 6);
          return { start: ymdFromDate(start), end: ymdFromDate(end) };
        }

        function daysBetween(a, b) {
          const [ya,ma,da] = a.split("-").map(Number);
          const [yb,mb,db] = b.split("-").map(Number);
          const s = new Date(ya,ma-1,da);
          const e = new Date(yb,mb-1,db);
          const out = [];
          for (let dt=new Date(s); dt<=e; dt.setDate(dt.getDate()+1)) {
            out.push(ymdFromDate(dt));
          }
          return out;
        }

        function aggregateDays(ymdList) {
          const h = getHistory();
          const src = (h.days || {});
          let totalPix=0,totalCartao=0,totalDinheiro=0,totalDebitos=0,totalDespesas=0, entradas=0;
          const svcCount = {}; // name -> count
          const svcRevenue = {}; // name -> sum
          const staffRevenue = {}; // name -> {valor,count}
          const usedDays = [];
          ymdList.forEach(ymd => {
            const d = src[ymd];
            if (!d) return;
            usedDays.push(ymd);
            const r = d.resumo || {};
            totalPix += r.totalPix || 0;
            totalCartao += r.totalCartao || 0;
            totalDinheiro += r.totalDinheiro || 0;
            totalDebitos += r.totalDebitos || 0;
            totalDespesas += r.totalDespesas || 0;
            entradas += r.entradas || 0;

            (d.atendimentos || []).forEach(a => {
              const list = Array.isArray(a.servicos) && a.servicos.length
                ? a.servicos
                : [{ nome: a.servico || "-", profissional: a.profissional || "-", valor: a.valor || 0 }];
              list.forEach(sv => {
                const name = sv.nome || "-";
                const val = Number(sv.valor)||0;
                svcCount[name] = (svcCount[name] || 0) + 1;
                svcRevenue[name] = (svcRevenue[name] || 0) + val;
                const pro = sv.profissional || "-";
                if (!staffRevenue[pro]) staffRevenue[pro] = { valor: 0, count: 0 };
                staffRevenue[pro].valor += val;
                staffRevenue[pro].count += 1;
              });
            });
          });

          function topN(map, n, byValue=false) {
            const arr = Object.keys(map).map(k => [k, map[k]]);
            arr.sort((a,b) => (b[1] - a[1]));
            return arr.slice(0, n);
          }
          const topByCount = topN(svcCount, 5);
          const topByRevenue = topN(svcRevenue, 5);
          const staffArr = Object.keys(staffRevenue).map(k => [k, staffRevenue[k].valor, staffRevenue[k].count]).sort((a,b) => b[1]-a[1]);

          return {
            usedDays, totalPix, totalCartao, totalDinheiro, totalDebitos, totalDespesas, entradas,
            saldo: entradas - totalDespesas,
            topByCount, topByRevenue, staffArr
          };
        }

        function kpiRowHTML(agg) {
          const money = (n) => (Number(n)||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
          return `
            <div class="rep-row">
              <div class="rep-kpi"><div class="t">Entradas (Pix+Cartão+Dinheiro)</div><div class="v">${money(agg.entradas)}</div></div>
              <div class="rep-kpi"><div class="t">Despesas</div><div class="v">${money(agg.totalDespesas)}</div></div>
              <div class="rep-kpi"><div class="t">Saldo</div><div class="v">${money(agg.saldo)}</div></div>
            </div>
            <div class="rep-row">
              <div class="rep-kpi"><div class="t">PIX</div><div class="v">${money(agg.totalPix)}</div></div>
              <div class="rep-kpi"><div class="t">Cartão</div><div class="v">${money(agg.totalCartao)}</div></div>
              <div class="rep-kpi"><div class="t">Dinheiro</div><div class="v">${money(agg.totalDinheiro)}</div></div>
            </div>
          `;
        }

        function listHTML(title, rows, cols, fmtLastRight=false) {
          if (!rows.length) return `<div class="muted">Sem dados</div>`;
          const head = `<thead><tr>${cols.map(c=>`<th>${c}</th>`).join("")}</tr></thead>`;
          const body = `<tbody>${
            rows.map(r => `<tr>${
              r.map((v,i) => `<td${fmtLastRight && i===r.length-1 ? ' class="num"':''}>${v}</td>`).join("")
            }</tr>`).join("")
          }</tbody>`;
          return `
            <h3 style="margin:10px 0 6px;">${title}</h3>
            <table class="rep-table">${head}${body}</table>
          `;
        }

        function renderWeek() {
          const ref = weekRef.value || ymdFromDate(new Date());
          const range = weekRangeFrom(ref);
          const days = daysBetween(range.start, range.end);
          const agg = aggregateDays(days);
          weekBox.innerHTML = `
            <div id="repWeekWrap">
              <div class="rep-kpi">${kpiRowHTML(agg)}</div>
              ${listHTML("Top serviços (mais saídos)", agg.topByCount.map(([n,c])=>[n, c]), ["Serviço","Qtd."])}
              ${listHTML("Top serviços por faturamento", agg.topByRevenue.map(([n,v])=>[n, (Number(v)||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})]), ["Serviço","Valor"], true)}
              ${listHTML("Totais por profissional", agg.staffArr.map(([n,v,c])=>[n, c, (Number(v)||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})]), ["Profissional","Qtd.","Valor"], true)}
              ${listHTML("Dias considerados", agg.usedDays.map(d=>[br(d)]), ["Dia"])}
            </div>
          `;
        }

        function renderMonth() {
          const ym = monthRef.value || `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}`;
          const h = getHistory();
          const keys = Object.keys(h.days || {}).filter(k => k.startsWith(ym + "-"));
          const agg = aggregateDays(keys);
          monthBox.innerHTML = `
            <div id="repMonthWrap">
              <div class="rep-kpi">${kpiRowHTML(agg)}</div>
              ${listHTML("Top serviços (mais saídos)", agg.topByCount.map(([n,c])=>[n, c]), ["Serviço","Qtd."])}
              ${listHTML("Top serviços por faturamento", agg.topByRevenue.map(([n,v])=>[n, (Number(v)||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})]), ["Serviço","Valor"], true)}
              ${listHTML("Totais por profissional", agg.staffArr.map(([n,v,c])=>[n, c, (Number(v)||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})]), ["Profissional","Qtd.","Valor"], true)}
              ${listHTML("Dias considerados", agg.usedDays.map(d=>[br(d)]), ["Dia"])}
            </div>
          `;
        }

        // Export helpers
        async function ensureHtml2CanvasLocal() {
          if (!window.html2canvas) {
            await new Promise((resolve,reject)=>{
              const s=document.createElement("script");
              s.src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
              s.onload=resolve; s.onerror=reject; document.head.appendChild(s);
            });
          }
        }
        async function ensureJsPDFLocal() {
          if (!(window.jspdf && window.jspdf.jsPDF)) {
            await new Promise((resolve,reject)=>{
              const s=document.createElement("script");
              s.src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";
              s.onload=resolve; s.onerror=reject; document.head.appendChild(s);
            });
          }
        }
        async function exportContainerAsImage(containerId, filename) {
          await ensureHtml2CanvasLocal();
          const el = page.querySelector("#"+containerId);
          const wrap = document.createElement("div");
          wrap.style.position="fixed"; wrap.style.left="-10000px"; wrap.style.top="0";
          wrap.style.width="960px"; wrap.style.background="#fff"; wrap.style.padding="16px";
          wrap.style.fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
          wrap.innerHTML = el.outerHTML;
          document.body.appendChild(wrap);
          const canvas = await html2canvas(wrap, { backgroundColor:"#fff", scale:2, windowWidth:960, windowHeight: wrap.scrollHeight });
          const dataUrl = canvas.toDataURL("image/png");
          const a = document.createElement("a");
          a.href = dataUrl; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
          wrap.remove();
        }
        async function exportContainerAsPDF(containerId, filename) {
          // simples: escala para caber em uma página A4 (pode reduzir caso muito alto)
          await ensureHtml2CanvasLocal(); await ensureJsPDFLocal();
          const { jsPDF } = window.jspdf || {};
          const el = page.querySelector("#"+containerId);
          const wrap = document.createElement("div");
          wrap.style.position="fixed"; wrap.style.left="-10000px"; wrap.style.top="0";
          wrap.style.width="960px"; wrap.style.background="#fff"; wrap.style.padding="16px";
          wrap.style.fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
          wrap.innerHTML = el.outerHTML;
          document.body.appendChild(wrap);
          const canvas = await html2canvas(wrap, { backgroundColor:"#fff", scale:2, windowWidth:960, windowHeight: wrap.scrollHeight });
          const imgData = canvas.toDataURL("image/jpeg", 0.92);
          wrap.remove();

          const doc = new jsPDF({ unit:"mm", format:"a4" });
          const pageW = 210, pageH = 297;
          const margin = 8;
          const imgW = pageW - margin*2;
          const imgH = canvas.height * imgW / canvas.width;
          const y = margin;
          if (imgH <= pageH - margin*2) {
            doc.addImage(imgData, "JPEG", margin, y, imgW, imgH);
          } else {
            // Se muito alto, escala para caber em uma página
            const scale = (pageH - margin*2) / imgH;
            const w2 = imgW * scale;
            const x = (pageW - w2)/2;
            const h2 = imgH * scale;
            doc.addImage(imgData, "JPEG", x, y, w2, h2);
          }
          doc.save(filename);
        }

        function bindExports() {
          page.querySelector("#repWeekImg")?.addEventListener("click", ()=> exportContainerAsImage("repWeekWrap", `relatorio-semanal_${weekRef.value}.png`));
          page.querySelector("#repWeekPdf")?.addEventListener("click", ()=> exportContainerAsPDF("repWeekWrap", `relatorio-semanal_${weekRef.value}.pdf`));
          page.querySelector("#repMonthImg")?.addEventListener("click", ()=> exportContainerAsImage("repMonthWrap", `relatorio-mensal_${monthRef.value}.png`));
          page.querySelector("#repMonthPdf")?.addEventListener("click", ()=> exportContainerAsPDF("repMonthWrap", `relatorio-mensal_${monthRef.value}.pdf`));
        }

        weekRef.addEventListener("change", renderWeek);
        monthRef.addEventListener("change", renderMonth);
        renderWeek();
        renderMonth();
        bindExports();
      }

      // Usuários: CRUD simples (funcionários) com cor utilizada na Agenda
      if (hash === "/usuarios") {
        ensureUsersDefaults();
        const listEl = page.querySelector("#usersList");
        const newBtn = page.querySelector("#btnNewUser");

        function userUid() { return "u-" + Date.now() + "-" + Math.random().toString(36).slice(2,8); }
        const palette = ["#10b981","#ec4899","#6366f1","#f59e0b","#06b6d4","#84cc16","#ef4444","#14b8a6"];

        function renderUsersList() {
          const s = getUsersStore();
          const arr = (s.users || []).slice().sort((a,b) => (a.nome || "").localeCompare(b.nome || ""));
          if (!listEl) return;
          if (!arr.length) {
            listEl.innerHTML = `<div class="muted" style="padding:12px;">Nenhum usuário cadastrado. Clique em “+ Novo Usuário”.</div>`;
            return;
          }
          listEl.innerHTML = arr.map(u => `
            <div class="row" data-id="${u.id}">
              <div style="display:flex; align-items:center; gap:10px;">
                <span title="${u.color || ''}" style="width:18px;height:18px;border-radius:6px;border:1px solid #e5e7eb;background:${u.color || '#f472b6'};"></span>
                <div>
                  <strong>${u.nome || "-"}</strong>
                  <div class="muted">${[u.handle || "", u.telefone || ""].filter(Boolean).join(" • ")}</div>
                </div>
              </div>
              <div style="display:flex; gap:8px;">
                <button class="btn-outline" data-act="edit">Editar</button>
                <button class="btn-outline" data-act="del">Excluir</button>
              </div>
            </div>
          `).join("");
        }

        function showUserModal(existing = null) {
          const modals = document.getElementById("modals");
          const modal = modals.querySelector(".modal");
          const it = existing ? { ...existing } : {
            id: userUid(),
            nome: "",
            handle: "",
            telefone: "",
            color: palette[Math.floor(Math.random()*palette.length)]
          };
          modal.innerHTML = `
            <style>
              .umodal h3 { margin:0 0 12px; font-weight:900; color:var(--bella-800); }
              .umodal .grid2 { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
              .umodal .field { display:grid; gap:6px; }
              .umodal label { color:#a1125b; font-weight:900; font-size:13px; }
              .umodal input { border:2px solid #f3c6d9; border-radius:14px; padding:10px; font-weight:700; color:#a1125b; background:#fff; width:100%; min-width:0; }
              .umodal .row { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
              .umodal .btn { border:1px solid #f1e6ee; border-radius:12px; padding:10px 12px; font-weight:900; color:#a1125b; background:#fff; }
              .umodal .btn.primary { background:linear-gradient(90deg,var(--bella-500),var(--bella-400)); color:#fff; border:0; }
              @media(max-width:640px){ .umodal .grid2 { grid-template-columns: 1fr; } }
            </style>
            <div class="umodal">
              <h3>${existing ? "Editar Usuário" : "Novo Usuário"}</h3>
              <div class="grid2">
                <div class="field">
                  <label>Nome *</label>
                  <input id="uNome" placeholder="Nome completo" value="${(it.nome || "").replace(/"/g,"&quot;")}">
                </div>
                <div class="field">
                  <label>Handle</label>
                  <input id="uHandle" placeholder="@apelido" value="${(it.handle || "").replace(/"/g,"&quot;")}">
                </div>
                <div class="field">
                  <label>Telefone</label>
                  <input id="uTel" placeholder="(DDD) 9xxxx-xxxx" value="${(it.telefone || "").replace(/"/g,"&quot;")}">
                </div>
                <div class="field">
                  <label>Cor</label>
                  <div class="row">
                    <input id="uColor" type="color" value="${it.color || "#f472b6"}" style="width:64px; padding:0; border-radius:12px; height:42px;">
                    <input id="uColorHex" value="${it.color || "#f472b6"}" style="max-width:160px;">
                  </div>
                </div>
              </div>
              <div style="display:flex; justify-content:space-between; gap:8px; margin-top:10px;">
                <button class="btn" data-close>Cancelar</button>
                <button class="btn primary" id="uSalvar">${existing ? "Salvar" : "Criar"}</button>
              </div>
            </div>
          `;
          modals.style.display = "flex";
          const $m = (sel)=>modal.querySelector(sel);
          const col = $m("#uColor");
          const hex = $m("#uColorHex");
          col.addEventListener("input", () => { hex.value = col.value; });
          hex.addEventListener("input", () => {
            const v = hex.value.trim();
            if (/^#?[0-9a-fA-F]{6}$/.test(v.replace("#",""))) col.value = v.startsWith("#") ? v : ("#"+v);
          });

          $m("#uSalvar").addEventListener("click", () => {
            const nome = ($m("#uNome").value || "").trim();
            if (!nome) { alert("Informe o nome"); return; }
            const handle = ($m("#uHandle").value || "").trim();
            const telefone = ($m("#uTel").value || "").trim();
            const color = ($m("#uColorHex").value || $m("#uColor").value || "").trim() || "#f472b6";
            const s = getUsersStore();
            const payload = { ...it, nome, handle, telefone, color: color.startsWith("#") ? color : ("#"+color) };
            const idx = (s.users || []).findIndex(u => String(u.id) === String(it.id));
            if (idx >= 0) s.users[idx] = payload; else s.users = (s.users || []).concat(payload);
            setUsersStore(s);
            modals.style.display = "none";
            renderUsersList();
          });

          modal.addEventListener("click", (e) => { if (e.target.hasAttribute("data-close")) modals.style.display = "none"; });
        }

        newBtn && newBtn.addEventListener("click", () => showUserModal());

        if (listEl) {
          listEl.addEventListener("click", (e) => {
            const actBtn = e.target.closest("[data-act]");
            if (!actBtn) return;
            const rowEl = e.target.closest(".row[data-id]");
            if (!rowEl) return;
            const id = rowEl.getAttribute("data-id");
            const s = getUsersStore();
            const idx = (s.users || []).findIndex(u => String(u.id) === String(id));
            const act = actBtn.getAttribute("data-act");
            if (act === "edit") {
              const existing = idx >= 0 ? s.users[idx] : null;
              if (existing) showUserModal(existing);
            } else if (act === "del") {
              if (!confirm("Excluir este usuário? Esta ação não remove referências em agendamentos antigos.")) return;
              if (idx >= 0) {
                s.users.splice(idx, 1);
                setUsersStore(s);
                renderUsersList();
              }
            }
          });
        }

        renderUsersList();
      }

      // Serviços: catálogo com abas, busca, cards e integração com agendamento
      if (hash === "/servicos") {
        ensureSvcDefaults();
        const st = getSvcStore();

        // estado via querystring
        const params = new URLSearchParams(location.hash.split("?")[1] || "");
        let q = params.get("q") || "";
        let cat = params.get("cat") || "all";

        function setParams(newQ, newCat) {
          const p = new URLSearchParams();
          if (newQ) p.set("q", newQ);
          if (newCat && newCat !== "all") p.set("cat", newCat);
          location.hash = "/servicos" + (p.toString() ? "?" + p.toString() : "");
        }

        function catName(id) {
          if (id === "all") return "Todas";
          return (st.cats || []).find(c => c.id === id)?.nome || "";
        }

        function filtered() {
          const items = (getSvcStore().items || []);
          return items
            .filter(s => (cat === "all" ? true : s.cat_id === cat))
            .filter(s => {
              if (!q) return true;
              const v = `${s.nome} ${s.desc || ""}`.toLowerCase();
              return v.includes(q.toLowerCase());
            })
            .sort((a,b) => a.nome.localeCompare(b.nome));
        }

        function renderTabs() {
          const tabs = page.querySelector("#svcTabs");
          const s = getSvcStore();
          const catList = [{ id: "all", nome: "Todas" }, ...s.cats];
          tabs.innerHTML = catList.map(c => `
            <button class="tab ${cat === c.id ? "active": ""}" data-cat="${c.id}">${c.nome}</button>
          `).join("");
          tabs.querySelectorAll(".tab").forEach(b => {
            b.addEventListener("click", () => {
              cat = b.getAttribute("data-cat");
              setParams(q, cat);
            });
          });
        }

        function cardHtml(svc) {
          const foto = svc.foto || "/public/placeholder.svg";
          return `
            <article class="svc-card" data-id="${svc.id}">
              <img class="svc-photo" src="${foto}" alt="${svc.nome}">
              <div>
                <div class="svc-title">${svc.nome}</div>
                <div class="svc-desc">${svc.desc || ""}</div>
                <div class="svc-meta">
                  <span class="chip time">⏱️ ${minsTxt(svc.duracao_min)} </span>
                  <span class="chip price"> ${moneyBR(svc.preco)} </span>
                </div>
                <div class="svc-actions-inline">
                  <button class="btn" data-act="agendar">Agendar</button>
                  <button class="btn" data-act="editar">Editar</button>
                  <button class="btn" data-act="remover">Excluir</button>
                </div>
              </div>
            </article>
          `;
        }

        function renderList() {
          const list = page.querySelector("#svcList");
          const arr = filtered();
          list.innerHTML = arr.length ? arr.map(cardHtml).join("") : `<div class="muted" style="padding:12px;">Nenhum serviço encontrado.</div>`;
          list.querySelectorAll(".svc-card .btn").forEach(btn => {
            const act = btn.getAttribute("data-act");
            const id = btn.closest(".svc-card").getAttribute("data-id");
            if (act === "agendar") {
              btn.addEventListener("click", () => {
                location.hash = "/agenda?addservice=" + encodeURIComponent(id);
              });
            } else if (act === "editar") {
              btn.addEventListener("click", () => showServiceModal((getSvcStore().items||[]).find(i=>i.id===id)));
            } else if (act === "remover") {
              btn.addEventListener("click", () => {
                const s2 = getSvcStore();
                s2.items = (s2.items||[]).filter(i => i.id !== id);
                setSvcStore(s2);
                renderList();
              });
            }
          });
        }

        function showCatsModal() {
          const modals = document.getElementById("modals");
          const modal = modals.querySelector(".modal");
          const s = getSvcStore();
          modal.innerHTML = `
            <style>
              .mgrid { display:grid; gap:10px; }
              .row { display:flex; gap:8px; align-items:center; }
              .row input { flex:1; border:1px solid #f1e6ee; border-radius:10px; padding:8px; }
              .btn { border:1px solid #f1e6ee; border-radius:10px; padding:8px 10px; font-weight:800; color:#a1125b; background:#fff; }
            </style>
            <h3>Categorias de Serviços</h3>
            <div id="catList" class="mgrid">
              ${(s.cats||[]).map(c => `
                <div class="row" data-id="${c.id}">
                  <input value="${c.nome}">
                  <button class="btn" data-del>Excluir</button>
                </div>
              `).join("")}
            </div>
            <div style="display:flex; gap:8px; margin-top:8px;">
              <button class="btn" id="addCat">+ Adicionar</button>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:10px;">
              <button class="btn" data-close>Fechar</button>
              <button class="btn primary" id="saveCats">Salvar</button>
            </div>
          `;
          modals.style.display = "flex";
          const $m = (sel)=>modal.querySelector(sel);
          $m("#addCat").addEventListener("click", () => {
            const row = document.createElement("div");
            row.className="row";
            row.setAttribute("data-id", svcUid("cat"));
            row.innerHTML = `<input value=""><button class="btn" data-del>Excluir</button>`;
            $m("#catList").appendChild(row);
            row.querySelector("[data-del]").addEventListener("click", ()=> row.remove());
          });
          modal.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", ()=> b.closest(".row").remove()));
          $m("#saveCats").addEventListener("click", () => {
            const cats = Array.from($m("#catList").children).map(r => ({
              id: r.getAttribute("data-id"),
              nome: r.querySelector("input").value.trim() || "Sem nome",
            })).filter(c=>c.nome);
            const s2 = getSvcStore();
            s2.cats = cats;
            setSvcStore(s2);
            modals.style.display = "none";
            renderTabs();
            renderList();
          });
          modal.addEventListener("click", (e) => { if (e.target.hasAttribute("data-close")) modals.style.display = "none"; });
        }

        function showServiceModal(existing) {
          const modals = document.getElementById("modals");
          const modal = modals.querySelector(".modal");
          const s = getSvcStore();
          const it = existing ? { ...existing } : { id: svcUid("svc"), nome:"", cat_id: (s.cats[0]||{}).id || "", preco: 0, duracao_min: 60, desc:"", foto:"/public/placeholder.svg" };
          modal.innerHTML = `
            <style>
              .amodal h3 { margin:0 0 12px; font-weight:900; color:var(--bella-800); }
              .amodal .grid2 { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
              .amodal .field { display:grid; gap:8px; }
              .amodal label { color:#a1125b; font-weight:900; }
              .amodal input, .amodal select, .amodal textarea { border:2px solid #f3c6d9; border-radius:14px; padding:10px; font-weight:700; color:#a1125b; background:#fff; }
              .amodal textarea { min-height: 80px; resize: vertical; }
              .row { display:flex; gap:8px; align-items:center; }
              .photo { width:92px; height:92px; border:1px solid #f1e6ee; border-radius:12px; overflow:hidden; display:grid; place-items:center; background:#fff7fb; }
              .btn { border:1px solid #f3c6d9; background:#fff; color:#a1125b; border-radius:12px; padding:10px 12px; font-weight:900; }
              .footer { display:flex; justify-content:space-between; gap:8px; margin-top:10px; }
              @media(max-width:520px){ .amodal .grid2 { grid-template-columns: 1fr; } }
            </style>
            <div class="amodal">
              <h3>${existing ? "Editar Serviço" : "Novo Serviço"}</h3>
              <div class="grid2">
                <div class="field">
                  <label>Nome *</label>
                  <input id="sNome" value="${it.nome}">
                </div>
                <div class="field">
                  <label>Categoria *</label>
                  <select id="sCat">
                    ${(s.cats||[]).map(c => `<option value="${c.id}" ${it.cat_id===c.id?"selected":""}>${c.nome}</option>`).join("")}
                  </select>
                </div>
                <div class="field">
                  <label>Preço (R$) *</label>
                  <input id="sPreco" type="number" step="0.01" min="0" value="${it.preco}">
                </div>
                <div class="field">
                  <label>Duração (min) *</label>
                  <input id="sDur" type="number" step="5" min="5" value="${it.duracao_min}">
                </div>
              </div>
              <div class="field">
                <label>Descrição</label>
                <textarea id="sDesc" placeholder="O que está incluso, benefícios e observações">${it.desc || ""}</textarea>
              </div>
              <div class="field">
                <label>Imagem</label>
                <div class="row" style="align-items:flex-start;">
                  <div class="photo" id="sThumb">${it.foto ? `<img src="${it.foto}" style="width:100%;height:100%;object-fit:cover;">` : "📷"}</div>
                  <input type="file" id="sFoto" accept="image/*;capture=camera" style="display:none;">
                  <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button class="btn" id="btnFoto">Tirar/Escolher foto</button>
                    <button class="btn" id="btnAI">Gerar com IA</button>
                  </div>
                </div>
                <div id="aiPanel" style="display:none; margin-top:8px; border:1px dashed #f3c6d9; border-radius:12px; padding:10px; background:#fff7fb;">
                  <div class="field">
                    <label>Prompt sugerido</label>
                    <textarea id="aiPrompt" placeholder="Prompt para gerar a imagem do serviço" style="border:1px solid #f3c6d9; border-radius:12px; padding:10px; min-height:70px;"></textarea>
                    <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:6px;">
                      <button class="btn" id="copyPrompt" type="button">Copiar prompt</button>
                      <button class="btn" id="openGen" type="button">Abrir gerador (Clipdrop)</button>
                    </div>
                  </div>
                  <div class="field" style="margin-top:6px;">
                    <label>URL da imagem gerada</label>
                    <input id="aiUrl" placeholder="Cole aqui a URL final da imagem gerada">
                    <div style="display:flex; gap:8px; margin-top:6px;">
                      <button class="btn primary" id="aiFetch" type="button">Buscar e aplicar</button>
                    </div>
                    <div class="muted" style="margin-top:6px; font-size:12px;">
                      Dica: gere no Clipdrop Stable Diffusion, copie a URL da imagem final e cole acima. Se houver bloqueio CORS, aplicamos a URL diretamente.
                    </div>
                  </div>
                </div>
              </div>
              <div class="footer">
                <button class="btn" data-close>Cancelar</button>
                <button class="btn primary" id="saveSvc">${existing ? "Salvar" : "Criar"}</button>
              </div>
            </div>
          `;
          modals.style.display = "flex";
          const $m = (sel)=>modal.querySelector(sel);

          function compressImageToDataUrl(file, maxW = 900, quality = 0.85) {
            return new Promise((resolve, reject) => {
              const img = new Image(); const fr = new FileReader();
              fr.onload = () => { img.onload = () => {
                  const canvas = document.createElement("canvas");
                  const scale = Math.min(1, maxW / img.width);
                  canvas.width = Math.round(img.width * scale);
                  canvas.height = Math.round(img.height * scale);
                  const ctx = canvas.getContext("2d");
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  resolve(canvas.toDataURL("image/jpeg", quality));
                }; img.onerror = reject; img.src = fr.result; };
              fr.onerror = reject; fr.readAsDataURL(file);
            });
          }

          $m("#btnFoto").addEventListener("click", () => $m("#sFoto").click());
          $m("#sFoto").addEventListener("change", async (ev) => {
            const f = ev.target.files && ev.target.files[0]; if (!f) return;
            try {
              const dataUrl = await compressImageToDataUrl(f);
              $m("#sThumb").innerHTML = `<img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover;">`;
              it.foto = dataUrl;
            } catch {}
            ev.target.value = "";
          });

          // IA: painel incorporado (mostrar/gerar/aplicar)
          const aiPanel = $m("#aiPanel");
          const btnAI = $m("#btnAI");
          if (btnAI && aiPanel) {
            btnAI.addEventListener("click", () => {
              aiPanel.style.display = aiPanel.style.display === "none" ? "block" : "none";
              const nomeVal = ($m("#sNome")?.value || "").trim();
              const catIdVal = $m("#sCat")?.value || "";
              const catObj = (getSvcStore().cats || []).find(c => String(c.id)===String(catIdVal));
              const prompt = buildServicePrompt(nomeVal, catObj?.nome || "");
              const ta = $m("#aiPrompt");
              if (ta) ta.value = prompt;
            });
            $m("#copyPrompt")?.addEventListener("click", async () => {
              await copyToClipboard(($m("#aiPrompt")?.value || "").trim());
            });
            $m("#openGen")?.addEventListener("click", () => {
              window.open("https://clipdrop.co/stable-diffusion", "_blank", "noopener");
            });
            $m("#aiFetch")?.addEventListener("click", async () => {
              const url = ($m("#aiUrl")?.value || "").trim();
              if (!url) { alert("Informe a URL final da imagem gerada."); return; }
              try {
                const dataUrl = await fetchImageAsDataUrl(url);
                $m("#sThumb").innerHTML = `<img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover;">`;
                it.foto = dataUrl;
              } catch (e) {
                alert("Falha ao baixar a imagem. Caso haja bloqueio CORS, baixe a imagem e use 'Tirar/Escolher foto'.");
              }
            });
          }

          // ===== IA: Gerar imagem para o serviço (fluxo humano-assistido) =====
          function buildServicePrompt(nome, catNome) {
            const n = (nome || "serviço de beleza").trim();
            const c = (catNome || "").trim();
            // Prompt em PT focado em foto realista para card
            return [
              `foto realista em alta qualidade (4k) do serviço "${n}" ${c ? `da categoria ${c}` : ""},`,
              "composição de produto/resultado do salão sobre fundo neutro elegante, iluminação suave,",
              "tons claros, estética moderna, foco nítido, sem texto, sem marcas d'água,",
              "estilo fotografia de catálogo, aspecto limpo, cores harmoniosas, proporção 1:1"
            ].join(" ");
          }
          async function copyToClipboard(text) {
            try {
              await navigator.clipboard.writeText(text);
              return true;
            } catch {
              try {
                const ta = document.createElement("textarea");
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                ta.remove();
                return true;
              } catch { return false; }
            }
          }
          async function fetchImageAsDataUrl(url) {
            try {
              // Suporta data URLs diretamente
              if ((url || "").startsWith("data:")) return url;
              const res = await fetch(url, { mode: "cors" });
              if (!res.ok) throw new Error("Falha ao baixar a imagem (HTTP " + res.status + ")");
              const blob = await res.blob();
              const file = new File([blob], "img." + ((blob.type || "").split("/")[1] || "jpg"), { type: blob.type || "image/jpeg" });
              return await compressImageToDataUrl(file);
            } catch (e) {
              throw e;
            }
          }

          const btnIA = $m("#btnFotoIA");
          if (btnIA) {
            btnIA.addEventListener("click", () => {
              // Cria painel IA se ainda não existir
              let box = $m("#sAIPanel");
              if (!box) {
                // onde inserir: abaixo da linha de imagem
                const imgField = $m("#sThumb")?.closest(".row")?.parentElement || $m("#sThumb")?.parentElement || $m("#sThumb");
                box = document.createElement("div");
                box.id = "sAIPanel";
                box.innerHTML = `
                  <style>
                    .ai-box { margin-top: 10px; border:1px solid #f3c6d9; border-radius: 12px; padding: 10px; background:#fff7fb; }
                    .ai-box .field { display:grid; gap:6px; margin-bottom: 8px; }
                    .ai-box label { color:#a1125b; font-weight:900; font-size:13px; }
                    .ai-box textarea, .ai-box input {
                      border:1.5px solid #f3c6d9; border-radius: 10px; padding: 10px; font-family: inherit; color:#a1125b; width: 100%; min-width: 0;
                    }
                    .ai-row { display:flex; gap:8px; align-items:center; flex-wrap: wrap; }
                    .ai-btn { border:1px solid #f3c6d9; border-radius: 10px; padding: 8px 10px; font-weight: 900; color:#a1125b; background:#fff; }
                    .ai-btn.primary { background: linear-gradient(90deg,var(--bella-500),var(--bella-400)); color:#fff; border:0; }
                    .ai-muted { color:#64748b; font-size:12px; font-weight:700; }
                  </style>
                  <div class="ai-box">
                    <div class="field">
                      <label>Prompt sugerido</label>
                      <textarea id="sAIPrompt" rows="3"></textarea>
                      <div class="ai-row">
                        <button class="ai-btn" id="sAICopy" type="button">Copiar prompt</button>
                        <a class="ai-btn" id="sAIOpen" target="_blank" rel="noopener">Abrir gerador</a>
                        <span class="ai-muted">Dica: cole o prompt no gerador, gere a imagem e copie a URL do resultado.</span>
                      </div>
                    </div>
                    <div class="field">
                      <label>URL da imagem gerada</label>
                      <input id="sAIUrl" placeholder="https://... (cole aqui a URL final da imagem)">
                      <div class="ai-row">
                        <button class="ai-btn primary" id="sAIBuscar" type="button">Buscar e aplicar</button>
                        <span class="ai-muted" id="sAIStatus"></span>
                      </div>
                    </div>
                  </div>
                `;
                imgField && imgField.appendChild(box);
              }
              // Preenche prompt e link do gerador
              const nome = ($m("#sNome")?.value || "").trim();
              const catIdVal = $m("#sCat")?.value || "";
              const catObj = (getSvcStore().cats || []).find(c => String(c.id)===String(catIdVal));
              const prompt = buildServicePrompt(nome, catObj?.nome || "");
              const ta = $m("#sAIPrompt");
              if (ta) ta.value = prompt;
              const genLink = "https://clipdrop.co/stable-diffusion"; // gerador público (cole o prompt)
              const aOpen = $m("#sAIOpen");
              if (aOpen) aOpen.href = genLink;

              $m("#sAICopy")?.addEventListener("click", async () => {
                const ok = await copyToClipboard(($m("#sAIPrompt")?.value || "").trim());
                const s = $m("#sAIStatus"); if (s) { s.textContent = ok ? "Prompt copiado." : "Não foi possível copiar automaticamente."; setTimeout(()=>s.textContent="", 2500); }
              }, { once: true });

              $m("#sAIBuscar")?.addEventListener("click", async () => {
                const url = ($m("#sAIUrl")?.value || "").trim();
                const s = $m("#sAIStatus");
                if (!url) { if (s) s.textContent = "Informe a URL da imagem gerada."; return; }
                const btn = $m("#sAIBuscar");
                if (btn) { btn.disabled = true; btn.textContent = "Buscando..."; }
                if (s) s.textContent = "Baixando imagem...";
                try {
                  const dataUrl = await fetchImageAsDataUrl(url);
                  $m("#sThumb").innerHTML = `<img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover;">`;
                  it.foto = dataUrl;
                  if (s) s.textContent = "Imagem aplicada com sucesso.";
                  setTimeout(()=>{ if (s) s.textContent = ""; }, 2500);
                } catch (e) {
                  if (s) s.textContent = "Falha ao baixar. A imagem pode bloquear CORS. Baixe a imagem e use 'Tirar/Escolher foto'.";
                } finally {
                  if (btn) { btn.disabled = false; btn.textContent = "Buscar e aplicar"; }
                }
              }, { once: true });
            });
          }

          $m("#saveSvc").addEventListener("click", () => {
            it.nome = $m("#sNome").value.trim();
            it.cat_id = $m("#sCat").value || it.cat_id;
            it.preco = parseFloat($m("#sPreco").value || "0") || 0;
            it.duracao_min = parseInt($m("#sDur").value || "0", 10) || 0;
            it.desc = ($m("#sDesc").value || "").trim();
            if (!it.nome || !it.cat_id || !it.duracao_min) { alert("Preencha Nome, Categoria e Duração."); return; }
            const s2 = getSvcStore();
            if (existing) {
              const idx = (s2.items||[]).findIndex(x => x.id === it.id);
              if (idx >= 0) s2.items[idx] = it;
            } else {
              s2.items = (s2.items||[]).concat(it);
            }
            setSvcStore(s2);
            modals.style.display = "none";
            renderList();
          });

          modal.addEventListener("click", (e) => { if (e.target.hasAttribute("data-close")) modals.style.display = "none"; });
        }

        // Inicializa UI
        const qInput = page.querySelector("#svcQ");
        qInput.value = q;
        qInput.addEventListener("input", (e) => {
          q = e.target.value || "";
          setParams(q, cat);
        });

        renderTabs();
        renderList();

        page.querySelector("#svcNovo").addEventListener("click", () => showServiceModal());
        page.querySelector("#svcCat").addEventListener("click", () => showCatsModal());
      }

      // Interações específicas da Agenda (progresso, atualizar e novo agendamento integrado a Serviços)
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

        // ---- Novo Agendamento (ligado ao catálogo de serviços)
        const AGENDA_KEY = "bella_agenda_v1";
        const getAgenda = () => { try { return JSON.parse(localStorage.getItem(AGENDA_KEY) || '{"items":[]}'); } catch { return { items: [] }; } };
        const setAgenda = (s) => localStorage.setItem(AGENDA_KEY, JSON.stringify(s));

        ensureSvcDefaults();

        function parseDT(val) {
          // returns Date or null
          try { return val ? new Date(val) : null; } catch { return null; }
        }
        function addMinutes(date, mins) {
          const d = new Date(date.getTime());
          d.setMinutes(d.getMinutes() + (Number(mins)||0));
          return d;
        }
        function dtLocalStr(d) {
          if (!d) return "";
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth()+1).padStart(2,"0");
          const dd = String(d.getDate()).padStart(2,"0");
          const HH = String(d.getHours()).padStart(2,"0");
          const MM = String(d.getMinutes()).padStart(2,"0");
          return `${yyyy}-${mm}-${dd}T${HH}:${MM}`;
        }
        function fmtHourMin(d) {
          if (!d) return "";
          return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
        }

        // ====== Agenda dinâmica (lista funcional por dia) ======
        const AG_SEL_KEY = "bella_agenda_selected_date";
        const AG_VIEW_KEY = "bella_agenda_view";
        let agView = localStorage.getItem(AG_VIEW_KEY) || "list";
        function ymdFromDate(d) {
          const y = d.getFullYear();
          const m = String(d.getMonth()+1).padStart(2,"0");
          const day = String(d.getDate()).padStart(2,"0");
          return `${y}-${m}-${day}`;
        }
        function ymdLocalFromISO(iso) {
          try {
            const d = new Date(iso);
            return ymdFromDate(d);
          } catch { return ""; }
        }
        function shiftYmd(ymd, deltaDays) {
          const [y,m,d] = ymd.split("-").map(Number);
          const date = new Date(y, m-1, d);
          date.setDate(date.getDate() + deltaDays);
          return ymdFromDate(date);
        }
        let agSelectedDate = localStorage.getItem(AG_SEL_KEY) || ymdFromDate(new Date());
        function setSelectedDate(ymd) {
          agSelectedDate = ymd;
          localStorage.setItem(AG_SEL_KEY, ymd);
        }
        function itemsForDate(ymd) {
          const ag = getAgenda();
          return (ag.items||[]).filter(it => ymdLocalFromISO(it.inicio) === ymd);
        }
        function statusFor(it) {
          const base = it.status || "scheduled";
          if (base === "done" || base === "canceled") return base;
          const now = new Date();
          const start = new Date(it.inicio);
          const end = new Date(it.fim);
          if (now >= start && now <= end) return "in-progress";
          return "scheduled";
        }
        function moneyBR2(n) { return (Number(n)||0).toLocaleString("pt-BR", { style:"currency", currency:"BRL" }); }
        function onlyDigitsAg(s) { return String(s||"").replace(/\D+/g, ""); }

        function renderAgendaUI() {
          const items = itemsForDate(agSelectedDate).slice().sort((a,b) => new Date(a.inicio) - new Date(b.inicio));
          const counts = items.reduce((acc,it) => {
            const st = statusFor(it);
            acc.total++;
            if (st === "done") acc.done++;
            else if (st === "canceled") acc.canceled++;
            else if (st === "in-progress") acc.inprog++;
            else acc.scheduled++;
            return acc;
          }, { total:0, scheduled:0, inprog:0, done:0, canceled:0 });

          function card(it) {
            const st = statusFor(it);
            const start = new Date(it.inicio);
            const end = new Date(it.fim);
            const dateStr = `${start.toLocaleDateString("pt-BR")}, ${fmtHourMin(start)}`;
            const endStr = fmtHourMin(end);
            const workers = Array.from(new Set((it.servicos||[]).map(s => s.profissional).filter(Boolean)));
            const total = moneyBR2(it.total || 0);
            const tel = onlyDigitsAg(it.telefone || "");
            const stLabel = st === "done" ? "Concluído" : st === "canceled" ? "Cancelado" : st === "in-progress" ? "Em Andamento" : "Agendado";
            const minimized = st === "done";
            // progress %
            let pct = 0;
            try {
              const now = new Date();
              if (now <= start) pct = 0;
              else if (now >= end) pct = 100;
              else pct = Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
            } catch {}
            // colorbar (listras)
            const colors = workers.map(w => userColorByName(w)).filter(Boolean);
            let colorbarStyle = "";
            if (!colors.length) {
              colorbarStyle = "background:#f3c6d9;";
            } else if (colors.length === 1) {
              colorbarStyle = `background:${colors[0]};`;
            } else {
              const seg = 100 / colors.length;
              const stops = colors.map((c, i) => `${c} ${Math.round(i*seg)}%, ${c} ${Math.round((i+1)*seg)}%`).join(", ");
              colorbarStyle = `background:linear-gradient(180deg, ${stops});`;
            }
            const svcLines = (it.servicos||[]).map((s) => {
              const price = moneyBR2(s.preco);
              const pro = s.profissional ? `<span class="svc-pro"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M16 14a4 4 0 10-8 0" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="8" r="3" fill="#64748b"/></svg>${s.profissional}</span>` : "";
              return `<div class="svc-line"><div><span class="svc-name">${s.nome || "-"}</span>${pro}</div><div>${price}</div></div>`;
            }).join("");
            return `
              <article class="appt ${minimized ? "min" : ""} ${st === "in-progress" ? "in-progress" : (st === "canceled" ? "canceled" : (st === "scheduled" ? "scheduled" : ""))}" data-id="${it.id}">
                <div class="progress-fill" style="width:${pct}%;"></div>
                <div class="colorbar" style="${colorbarStyle}"></div>
                <div class="inner">
                  <div>
                    <div class="header">
                      <div class="left-head">
                        <div class="ava">${(it.cliente||"?").slice(0,1).toUpperCase()}</div>
                        <div class="name">${it.cliente || "-"}</div>
                      </div>
                      <span class="status ${st === "scheduled" ? "scheduled" : ""}">${stLabel}</span>
                    </div>
                    <div class="pill">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#a1125b" stroke-width="1.5"/><path d="M12 8v5l3 2" stroke="#a1125b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      ${dateStr}
                    </div>
                    <div class="pill">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M2 12h20" stroke="#a1125b" stroke-width="1.5" stroke-linecap="round"/><path d="M12 6v12" stroke="#a1125b" stroke-width="1.5" stroke-linecap="round"/></svg>
                      Término previsto: ${endStr}
                    </div>
                    ${tel ? `<div class="pill"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.86 19.86 0 013 5.18 2 2 0 015 3h3l2 5-3 2a16 16 0 008 8l2-3 5 2z" stroke="#a1125b" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg> (${tel.slice(0,2)}) ${tel.slice(2)}</div>` : ``}
                    <div class="label">Serviços:</div>
                    <div class="svc-pane">
                      ${svcLines || `<div class="muted">—</div>`}
                    </div>
                    <div class="label">Funcionários:</div>
                    <div>${workers.length ? workers.map(w => `<span class="worker-pill">${w}</span>`).join(" ") : `<span class="muted">—</span>`}</div>
                    <div class="total-row"><div class="t">Valor Total:</div><div class="v">${total}</div></div>
                  </div>
                  <div class="action-rail">
                    <button class="abtn" data-act="view" title="Visualizar">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>
                    </button>
                    <button class="abtn" data-act="edit" title="Editar">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="currentColor" stroke-width="1.6"/></svg>
                    </button>
                    ${st !== "done" ? `<button class="abtn success" data-act="done" title="Concluir">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>` : ``}
                    <button class="abtn danger" data-act="del" title="Excluir">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                    </button>
                  </div>
                </div>
              </article>
            `;
          }

          page.innerHTML = `
            <style>
              .ag-hero h1 { margin: 0 0 6px; font-size: 28px; color: var(--bella-800); font-weight: 900; letter-spacing: .2px; }
              .ag-hero p { margin: 0; color:#9d3a69; font-weight: 600; }
              .ag-toolbar { display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin:10px 0; }
              .btn { border-radius:12px; padding:10px 14px; border:1px solid #f1e6ee; background:#fff; font-weight:900; color:#a1125b; box-shadow: var(--shadow); }
              .btn.primary { background:linear-gradient(90deg,var(--bella-500),var(--bella-400)); color:#fff; border:0; }
              .date-nav { display:flex; align-items:center; gap:8px; }
              .date-nav .arrow { width:40px; height:40px; display:grid; place-items:center; border-radius:12px; border:1px solid #f3c6d9; color:#a1125b; background:#fff; }
              .date-nav input { border:1px solid #f3c6d9; padding:10px; border-radius:12px; font-weight:700; color:#a1125b; }
              .kpi-mini { display:grid; gap:12px; margin:14px 0; }
              .kpi-mini .item { background:#fff; border:1px solid #f3c6d9; border-radius:18px; padding:14px; display:flex; align-items:center; justify-content:space-between; box-shadow: var(--shadow); }
              .kpi-mini .title { color:#a1125b; font-weight:900; }
              .kpi-mini .val { font-size:22px; font-weight:900; color:#a1125b; }
              .list { margin-top:10px; }
              .appt { position:relative; border-radius:24px; padding:14px; box-shadow: var(--shadow); border:3px solid #f3c6d9; margin-bottom:16px; overflow:hidden; background: linear-gradient(180deg,#f7fee7,#ffffff); }
              .appt.in-progress { border-color:#f59e0b; background: linear-gradient(180deg,#fef9c3,#fff7ed); }
              .appt.scheduled { border-color:#059669; background:#ecfdf5; }
              .appt.canceled { border-color:#b91c1c; background:#fee2e2; }
              .appt .inner { position:relative; z-index:2; display:grid; grid-template-columns: 1fr 84px; gap: 12px; }
              .appt .header { display:flex; align-items:center; justify-content:space-between; gap:12px; }
              .appt .left-head { display:flex; align-items:center; gap:12px; }
              .appt .ava { width:56px; height:56px; border-radius:999px; display:grid; place-items:center; background:#f472b6; color:#fff; font-weight:900; font-size:20px; }
              .appt .name { font-weight:900; color:#7a0f3f; font-size:22px; line-height:1.05; }
              .appt .status { background:#fde68a; color:#7c2d12; padding:10px 14px; border-radius:18px; font-weight:900; border:1px solid #f59e0b; }
              .appt.scheduled .status { background:#dbeafe; color:#1e40af; border-color:#93c5fd; }
              .appt .pill { display:flex; align-items:center; justify-content:center; gap:8px; background:#fff; border:1px solid #e5e7eb; color:#a1125b; font-weight:800; padding:12px; border-radius:16px; margin-top:10px; }
              .appt .label { color:#7a0f3f; font-weight:900; margin: 10px 0 6px; }
              .appt .svc-pane { background:#eef2ff; border:1px solid #c7d2fe; border-radius:16px; padding:10px; }
              .appt.scheduled .svc-pane { background:#d1fae5; border-color:#a7f3d0; }
              .appt.in-progress .svc-pane { background:#dbeafe; border-color:#93c5fd; }
              .appt .svc-line { display:flex; align-items:center; justify-content:space-between; gap:10px; font-weight:900; color:#7a0f3f; }
              .appt .svc-line .svc-name { color:#7a0f3f; font-weight:900; }
              .appt .svc-line .svc-pro { color:#475569; font-weight:800; display:inline-flex; align-items:center; gap:6px; margin-left:10px; }
              .appt .total-row { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:12px; display:flex; align-items:center; justify-content:space-between; margin-top:10px; }
              .appt .total-row .v { color:#16a34a; font-weight:900; }
              .appt .action-rail { display:grid; gap:10px; background:#fff7fb; border-left:1px solid #f3c6d9; padding:10px; border-radius:16px; }
              .appt .action-rail .abtn { width:48px; height:48px; display:grid; place-items:center; border-radius:14px; background:#fff; border:1px solid #f1e6ee; color:#a1125b; box-shadow: 0 1px 4px rgba(173,24,94,.08); }
              .appt .action-rail .abtn.danger { color:#b91c1c; border-color:#fecaca; }
              .appt .action-rail .abtn.success { color:#065f46; border-color:#a7f3d0; }
              .chip-box { background:#e6f4ff; border:1px solid #cfe2ff; padding:10px 12px; border-radius:14px; display:flex; align-items:center; justify-content:space-between; }
              .worker-pill { display:inline-flex; align-items:center; gap:8px; background:#def7ec; border:1px solid #a7f3d0; color:#065f46; padding:8px 10px; border-radius:14px; font-weight:800; margin-right:6px; }
              .progress-fill { position:absolute; left:0; top:0; bottom:0; width:0; background: linear-gradient(90deg, rgba(16,185,129,.25), rgba(16,185,129,.08)); }
              .colorbar { position:absolute; left:0; top:0; bottom:0; width:10px; border-top-left-radius:inherit; border-bottom-left-radius:inherit; pointer-events:none; z-index:3; }
              .appt.min { padding:10px; border-width:2px; }
              .appt.min .pill, .appt.min .label, .appt.min .svc-pane, .appt.min .worker-pill, .appt.min .total-row { display:none; }
              .appt.min .name { font-size:18px; }
              .appt.min .action-rail .abtn { width:40px; height:40px; }
            </style>

            <div class="ag-hero">
              <h1>Agenda</h1>
              <p>Agendamentos reais (salvos no navegador)</p>
            </div>

            <div class="ag-toolbar">
              <div class="date-nav">
                <button class="arrow" id="agPrev" aria-label="Anterior">‹</button>
                <input type="date" id="agDate" value="${agSelectedDate}">
                <button class="arrow" id="agNext" aria-label="Próximo">›</button>
              </div>
              <div style="display:flex; gap:8px;">
                <button class="btn primary" id="agNovo">+ Novo Agendamento</button>
                <button class="btn" id="agAtualizar">Atualizar</button>
              </div>
            </div>

            <div class="kpi-mini">
              <div class="item"><div><div class="title">Total do dia</div><div class="val">${counts.total}</div></div></div>
              <div class="item"><div><div class="title">Agendados</div><div class="val">${counts.scheduled}</div></div></div>
              <div class="item"><div><div class="title">Em andamento</div><div class="val">${counts.inprog}</div></div></div>
              <div class="item"><div><div class="title">Concluídos</div><div class="val">${counts.done}</div></div></div>
              <div class="item"><div><div class="title">Cancelados</div><div class="val">${counts.canceled}</div></div></div>
            </div>

            <section class="list" id="agList">
              ${items.length ? items.map(card).join("") : `<div class="empty">Nenhum agendamento para ${agSelectedDate}. Clique em “Novo Agendamento”.</div>`}
            </section>
          `;

          // Wire events
          const by = (id) => page.querySelector("#"+id);
          by("agPrev").addEventListener("click", () => { setSelectedDate(shiftYmd(agSelectedDate, -1)); renderAgendaUI(); });
          by("agNext").addEventListener("click", () => { setSelectedDate(shiftYmd(agSelectedDate, +1)); renderAgendaUI(); });
          by("agDate").addEventListener("change", (e) => { setSelectedDate(e.target.value || agSelectedDate); renderAgendaUI(); });
          by("agNovo").addEventListener("click", () => showAgendamentoModal());
          by("agAtualizar").addEventListener("click", () => renderAgendaUI());

          // delegate actions
          const list = by("agList");
          list.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-act]");
            if (!btn) return;
            const act = btn.getAttribute("data-act");
            const id = btn.closest(".appt")?.getAttribute("data-id");
            if (!id) return;
            const ag = getAgenda();
            const idx = (ag.items||[]).findIndex(x=>String(x.id)===String(id));
            const it = idx>=0 ? ag.items[idx] : null;
            if (!it) return;
            if (act === "edit") {
              showAgendamentoModal([], it);
            } else if (act === "done") {
              it.status = "done";
              setAgenda(ag);
              renderAgendaUI();
            } else if (act === "cancel") {
              it.status = "canceled";
              setAgenda(ag);
              renderAgendaUI();
            } else if (act === "del") {
              if (confirm("Excluir este agendamento?")) {
                ag.items.splice(idx,1);
                setAgenda(ag);
                renderAgendaUI();
              }
            } else if (act === "wa") {
              const nome = it.cliente || "";
              const start = new Date(it.inicio);
              const text = encodeURIComponent(`Olá ${nome}! Seu agendamento está para ${start.toLocaleDateString("pt-BR")} às ${fmtHourMin(start)} no Espaço Bella's.`);
              const raw = onlyDigitsAg(it.telefone);
              const url = raw ? `https://wa.me/55${raw}?text=${text}` : `https://wa.me/?text=${text}`;
              window.open(url, "_blank");
            }
          });
        }

        function showAgendamentoModal(preselectIds = [], existingItem = null) {
          const modals = document.getElementById("modals");
          const modal = modals.querySelector(".modal");
          const svcStore = getSvcStore();
          const services = (svcStore.items || []);
          const clStore = getClientsStore();
          const clients = (clStore.clients || []).slice().sort((a,b) => (a.name || "").localeCompare((b.name || "")));
          const users = (getUsersStore().users || []);
          const isEditing = !!existingItem;
          const startDefault = isEditing ? dtLocalStr(new Date(existingItem.inicio)) : dtLocalStr(new Date());

          // Build client datalist for suggestions
          const clientOptions = clients.map(c => `<option value="${(c.name || "").replace(/"/g, "&quot;")}"></option>`).join("");

          modal.innerHTML = `
            <style>
              .amodal h3 { margin:0 0 12px; font-weight:900; color:var(--bella-800); }
              .amodal .grid2 { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
              .amodal .field { display:grid; gap:8px; }
              .amodal label { color:#a1125b; font-weight:900; }
              .amodal input, .amodal select { border:2px solid #f3c6d9; border-radius:14px; padding:10px; font-weight:700; color:#a1125b; background:#fff; }
              .srows { display:grid; gap:8px; margin-top:6px; }
              .srow { display:grid; grid-template-columns: 1fr 100px 110px 160px 42px; gap:8px; align-items:center; background:#fff; border:1.5px solid #f3c6d9; border-radius:12px; padding:8px; }
              .srow .del { justify-self:end; border:1px solid #f3c6d9; border-radius:10px; background:#fff; padding:8px; color:#a1125b; }
              .footer { display:flex; justify-content:space-between; gap:8px; margin-top:10px; }
              .btn { border-radius:12px; padding:10px 14px; border:1px solid #f1e6ee; background:#fff; font-weight:900; color:#a1125b; box-shadow: var(--shadow); }
              .btn.primary { background:linear-gradient(90deg,var(--bella-500),var(--bella-400)); color:#fff; border:0; }
              @media(max-width:640px){ .amodal .grid2 { grid-template-columns: 1fr; } .srow { grid-template-columns: 1fr 100px 110px 42px; } }
              .muted { color:#6b7280; font-weight:700; }
              .sum { display:flex; align-items:center; justify-content:space-between; background:#fff7fb; border:1px solid #f3c6d9; padding:10px; border-radius:12px; font-weight:900; color:#a1125b; }
            </style>
            <div class="amodal">
              <h3>${isEditing ? "Editar Agendamento" : "Novo Agendamento"}</h3>

              <div class="grid2">
                <div class="field">
                  <label>Cliente (existente)</label>
                  <select id="agCliSel">
                    <option value="">Selecionar</option>
                    ${clients.map(c => `<option value="${(c.name || "").replace(/"/g,"&quot;")}" data-phone="${(c.phone || "").replace(/"/g,"&quot;")}" data-prefname="${(c.prefUserName || "").replace(/"/g,"&quot;")}" data-pid="${(c.prefUserId || "").replace(/"/g,"&quot;")}">${c.name || ""}</option>`).join("")}
                  </select>
                </div>
                <div class="field">
                  <label>Nome do Cliente *</label>
                  <input id="agCli" placeholder="Nome do cliente" value="${isEditing ? (existingItem.cliente || "") : ""}">
                </div>
              </div>

              <div class="grid2">
                <div class="field">
                  <label>Início *</label>
                  <input id="agIni" type="datetime-local" value="${startDefault}">
                </div>
                <div class="field">
                  <label>Término previsto</label>
                  <input id="agFim" type="time" readonly>
                </div>
              </div>

              <div class="field">
                <label>Serviços *</label>
                <div class="srows" id="agRows"></div>
                <button class="btn" id="agAdd" type="button">+ Adicionar serviço</button>
              </div>

              <div class="sum" id="agResumo">
                <div>Total: R$ 0,00</div>
                <div>Duração: 0min</div>
              </div>

              <div class="footer">
                <button class="btn" data-close>Cancelar</button>
                <button class="btn primary" id="agSalvar">${isEditing ? "Salvar alterações" : "Salvar"}</button>
              </div>
            </div>
          `;
          modals.style.display = "flex";
          const $m = (sel)=>modal.querySelector(sel);
          let selectedClientPhone = isEditing ? (existingItem.telefone || "") : "";
          const cliSel = $m("#agCliSel");
          if (cliSel) cliSel.addEventListener("change", (ev) => {
            const opt = ev.target.selectedOptions && ev.target.selectedOptions[0];
            const name = ev.target.value || "";
            const phone = opt ? (opt.getAttribute("data-phone") || "") : "";
            const ip = $m("#agCli");
            if (ip) ip.value = name;
            selectedClientPhone = phone;
          });

          function svcSelectHtml() {
            const opts = services.map(s => `<option value="${s.id}" data-preco="${s.preco}" data-dur="${s.duracao_min}">${s.nome}</option>`).join("");
            return `<select class="s-sel">${opts}</select>`;
          }

          function addRow(defaultId, preset = null) {
            const row = document.createElement("div");
            row.className = "srow";
            row.innerHTML = `
              ${svcSelectHtml()}
              <input class="s-preco" type="number" step="0.01" min="0" placeholder="Preço">
              <input class="s-dur" type="number" step="5" min="5" placeholder="Min">
              <select class="s-prof">
                <option value="">Profissional</option>
                ${users.map(u => `<option value="${(u.nome || "").replace(/"/g,"&quot;")}">${u.nome || ""}</option>`).join("")}
              </select>
              <button class="del" title="Remover">✕</button>
            `;
            const sel = row.querySelector(".s-sel");
            const ipP = row.querySelector(".s-preco");
            const ipD = row.querySelector(".s-dur");
            const ipPro = row.querySelector(".s-prof");
            sel.value = defaultId || (services[0]?.id || "");
            function fillBySvc() {
              const svc = services.find(s => s.id === sel.value);
              if (svc) {
                ipP.value = String(svc.preco ?? 0);
                ipD.value = String(svc.duracao_min ?? 60);
              } else {
                ipP.value = "";
                ipD.value = "";
              }
              recalc();
            }
            sel.addEventListener("change", fillBySvc);
            row.querySelector(".del").addEventListener("click", () => { row.remove(); recalc(); });
            [$m("#agIni"), ipP, ipD].forEach(inp => inp.addEventListener("input", recalc));
            $m("#agRows").appendChild(row);
            if (preset) {
              if (preset.servico_id) sel.value = preset.servico_id;
              ipP.value = String(preset.preco ?? 0);
              ipD.value = String(preset.duracao_min ?? 60);
              if (preset.profissional) ipPro.value = preset.profissional;
              recalc();
            } else {
              fillBySvc();
            }
          }

          function recalc() {
            const start = parseDT($m("#agIni").value);
            const rows = Array.from($m("#agRows").children);
            const total = rows.reduce((acc,r)=>acc+(parseFloat(r.querySelector(".s-preco").value||"0")||0),0);
            const dur = rows.reduce((acc,r)=>acc+(parseInt(r.querySelector(".s-dur").value||"0",10)||0),0);
            const end = start ? addMinutes(start, dur) : null;
            $m("#agResumo").children[0].textContent = "Total: " + moneyBR(total);
            $m("#agResumo").children[1].textContent = "Duração: " + (dur?minsTxt(dur):"0min");
            $m("#agFim").value = end ? fmtHourMin(end) : "";
          }

          // Inicializa linhas
          if (isEditing && Array.isArray(existingItem.servicos) && existingItem.servicos.length) {
            existingItem.servicos.forEach(sv => addRow(sv.servico_id || (services[0]?.id || ""), sv));
          } else if (Array.isArray(preselectIds) && preselectIds.length) {
            preselectIds.forEach(id => addRow(id));
          } else {
            addRow();
          }
          recalc();
          // Wire + Adicionar serviço (fix: ensure works on all devices)
          modal.addEventListener("click", (ev) => {
            const trg = ev.target.closest("#agAdd");
            if (trg) { ev.preventDefault(); ev.stopPropagation(); addRow(); }
          });

          function hasConflict(start, end, ignoreId) {
            try {
              const dayItems = itemsForDate(agSelectedDate);
              return dayItems.some(it => String(it.id) !== String(ignoreId || "") && (start < new Date(it.fim)) && (end > new Date(it.inicio)));
            } catch { return false; }
          }

          $m("#agSalvar").addEventListener("click", () => {
            const nome = ($m("#agCli").value || "").trim();
            if (!nome) { alert("Informe o cliente"); return; }
            const ini = parseDT($m("#agIni").value);
            if (!ini) { alert("Informe o início"); return; }
            const rows = Array.from($m("#agRows").children).map(r => {
              const sel = r.querySelector(".s-sel").value;
              const svc = services.find(s=>s.id===sel) || {};
              return {
                servico_id: sel,
                nome: svc.nome || "",
                preco: parseFloat(r.querySelector(".s-preco").value || "0") || 0,
                duracao_min: parseInt(r.querySelector(".s-dur").value || "0", 10) || 0,
                profissional: (r.querySelector(".s-prof")?.value || "").trim(),
              };
            });
            if (!rows.length) { alert("Adicione pelo menos um serviço"); return; }
            const total = rows.reduce((a,b)=>a+b.preco,0);
            const dur = rows.reduce((a,b)=>a+b.duracao_min,0);
            const fim = addMinutes(ini, dur);

            if (hasConflict(ini, fim, isEditing ? existingItem.id : null)) {
              if (!confirm("Existe outro agendamento que conflita com este horário. Deseja salvar mesmo assim?")) {
                return;
              }
            }

            const ag = getAgenda();
            if (isEditing) {
              const idx = (ag.items||[]).findIndex(x => String(x.id) === String(existingItem.id));
              if (idx >= 0) {
                const prev = ag.items[idx];
                ag.items[idx] = {
                  ...prev,
                  cliente: nome,
                  telefone: selectedClientPhone,
                  inicio: ini.toISOString(),
                  fim: fim.toISOString(),
                  servicos: rows,
                  total,
                  duracao_min: dur,
                };
              }
            } else {
              ag.items.push({
                id: "ag-" + Date.now(),
                cliente: nome,
                telefone: selectedClientPhone,
                inicio: ini.toISOString(),
                fim: fim.toISOString(),
                servicos: rows,
                total,
                duracao_min: dur,
                status: "scheduled",
                created_at: new Date().toISOString(),
              });
            }
            setAgenda(ag);
            modals.style.display = "none";
            renderAgendaUI();
          });

          modal.addEventListener("click", (e)=>{ if (e.target.hasAttribute("data-close")) modals.style.display = "none"; });
        }

        // Renderiza UI dinâmica da Agenda (substitui o mock)
        renderAgendaUI();

        // Atualização automática de status e progresso (30s)
        function __applyAutoStatusTransitions() {
          const ag = getAgenda();
          let changed = false;
          (ag.items || []).forEach((it) => {
            const prev = it.status || "scheduled";
            const next = statusFor(it);
            if (prev !== next) { it.status = next; changed = true; }
          });
          if (changed) setAgenda(ag);
          renderAgendaUI();
        }
        if (window.__agendaTimer) clearInterval(window.__agendaTimer);
        window.__agendaTimer = setInterval(__applyAutoStatusTransitions, 30000);
        // disparo inicial
        __applyAutoStatusTransitions();

        // Intercepta o botão padrão e abre o modal integrado
        page.querySelectorAll("[data-open='agendamento']").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.preventDefault(); e.stopImmediatePropagation();
            showAgendamentoModal();
          });
        });

        // Se veio de /servicos com ?addservice=ID, abre direto com o serviço pré-selecionado
        try {
          const p = new URLSearchParams(location.hash.split("?")[1] || "");
          const id = p.get("addservice");
          if (id) showAgendamentoModal([id]);
        } catch {}
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

        // Histórico de fechamentos de caixa (salvos)
          function saveDayToHistory(ymd) {
            try {
              const h = getHistory();
              const snap = snapshot(ymd);
              const store = getStore();
              const day = getDay(store, ymd);
              h.days[ymd] = {
                closedAt: new Date().toISOString(),
                resumo: {
                  totalPix: snap.totalPix,
                  totalCartao: snap.totalCartao,
                  totalDinheiro: snap.totalDinheiro,
                  totalDebitos: snap.totalDebitos,
                  totalDespesas: snap.totalDespesas,
                  totalDespesasCaixa: snap.totalDespesasCaixa,
                  entradas: snap.entradas,
                  dinheiroInformado: snap.dinheiroInformado,
                  dinheiroCalculado: snap.dinheiroCalculado,
                },
                atendimentos: (day.atendimentos || []).slice(),
                despesas: (day.despesas || []).slice(),
              };
              setHistory(h);
              return true;
            } catch {
              return false;
            }
          }

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
          const hist = getHistory();
          const closed = !!(hist.days && hist.days[selectedDate]);
         
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
              <button class="btn" id="btnFechar">${closed ? "Atualizar fechamento" : "Fechar caixa do dia"}</button>
              <button class="btn" id="btnHistorico">Histórico</button>
              <button class="btn" id="btnRelatorios">Relatórios</button>
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
            const v = localStorage.getItem("bella_export_legible");
            if (v === null) localStorage.setItem("bella_export_legible", "1"); // padrão: LIGADO
            expL.checked = (localStorage.getItem("bella_export_legible") || "1") === "1";
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
          byId("btnAtendimento").addEventListener("click", () => showAtendimentoModalV2());
          byId("btnDespesa").addEventListener("click", () => showDespesaModal());
          const recBtn = byId("btnRecibo");
          if (recBtn) recBtn.addEventListener("click", () => showReciboModal());
          const pdfBtn = byId("btnPdf");
          if (pdfBtn) pdfBtn.addEventListener("click", () => exportPDF());
          const imgBtn = byId("btnImg");
          if (imgBtn) imgBtn.addEventListener("click", () => exportImage());

          const fecharBtn = byId("btnFechar");
          if (fecharBtn) fecharBtn.addEventListener("click", () => {
            const had = !!(getHistory().days && getHistory().days[selectedDate]);
            const ok = saveDayToHistory(selectedDate);
            if (ok) {
              alert(had ? "Fechamento atualizado no histórico." : "Fechamento salvo no histórico.");
            } else {
              alert("Falha ao salvar no histórico.");
            }
            renderCaixa();
          });

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
              showAtendimentoModalV2(att);
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

          // ======== Atendimento Manual V2 (cliente real + serviços do catálogo + mensal) ========
          function showAtendimentoModalV2(existing) {
            ensureSvcDefaults();
            ensureUsersDefaults();
            const modals = document.getElementById("modals");
            const modal = modals.querySelector(".modal");

            const svcStore = getSvcStore();
            const services = (svcStore.items || []).slice().sort((a,b)=> (a.nome||"").localeCompare(b.nome||""));
            const users = (getUsersStore().users || []).slice().sort((a,b)=> (a.nome||"").localeCompare(b.nome||""));
            const clStore = getClientsStore();
            const clients = (clStore.clients || []).slice().sort((a,b)=> (a.name||"").localeCompare(b.name||""));

            const isEditing = !!existing;
            const attId = existing?.id || ("att-" + Date.now());

            function svcOptions(selectedId) {
              return services.map(s => `<option value="${s.id}" ${String(selectedId||"")===String(s.id)?"selected":""}>${s.nome}</option>`).join("");
            }
            function userOptions(selName) {
              const nm = (selName || "").toLowerCase();
              return ['<option value="">Profissional</option>'].concat(users.map(u => {
                const sel = String(u.nome||"").toLowerCase() === nm ? "selected" : "";
                return `<option value="${(u.nome||"").replace(/"/g,"&quot;")}" ${sel}>${u.nome||""}</option>`;
              })).join("");
            }
            function clientOptions(selId) {
              return ['<option value="">Selecionar</option>'].concat(
                clients.map(c => `<option value="${c.id}" ${String(selId||"")===String(c.id)?"selected":""}>${(c.name||"")}${c.isMonthly?" • Mensal":""}</option>`)
              ).join("");
            }

            modal.innerHTML = `
              <style>
                .cx h3 { margin:0 0 12px; font-weight:900; color:var(--bella-800); }
                .cx .grid2 { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
                .cx .field { display:grid; gap:6px; }
                .cx label { color:#a1125b; font-weight:900; font-size:13px; }
                .cx input, .cx select { border:2px solid #f3c6d9; border-radius:14px; padding:10px; font-weight:700; color:#a1125b; background:#fff; width:100%; min-width:0; }
                .cx .rows { display:grid; gap:8px; margin-top:6px; }
                .cx .row { display:grid; grid-template-columns: 1fr 110px 160px 140px 42px; gap:8px; align-items:center; border:1.5px solid #f3c6d9; border-radius:12px; padding:8px; background:#fff; }
                .cx .del { justify-self:end; border:1px solid #f3c6d9; border-radius:10px; background:#fff; padding:8px; color:#a1125b; }
                .cx .sum { display:flex; align-items:center; justify-content:space-between; background:#fff7fb; border:1px solid #f3c6d9; padding:10px; border-radius:12px; font-weight:900; color:#a1125b; margin-top:8px; }
                .cx .btn { border:1px solid #f1e6ee; border-radius:12px; padding:10px 12px; font-weight:900; color:#a1125b; background:#fff; }
                .cx .btn.primary { background:linear-gradient(90deg,var(--bella-500),var(--bella-400)); color:#fff; border:0; }
                @media(max-width:640px){
                  .cx .grid2 { grid-template-columns: 1fr; }
                  .cx .row { grid-template-columns: 1fr 110px 140px 42px; }
                }
              </style>

              <div class="cx">
                <h3>${isEditing ? "Editar Atendimento" : "Novo Atendimento Manual"}</h3>

                <div class="grid2">
                  <div class="field">
                    <label>Cliente (existente)</label>
                    <select id="cxCliSel">${clientOptions(existing?.cliente_id)}</select>
                  </div>
                  <div class="field">
                    <label>Nome do Cliente *</label>
                    <input id="cxCliNome" placeholder="Nome" value="${(existing?.cliente || "").replace(/"/g,"&quot;")}">
                  </div>
                </div>

                <div class="field">
                  <label>Observação</label>
                  <input id="cxObs" placeholder="Opcional" value="${(existing?.obs || "").replace(/"/g,"&quot;")}">
                </div>

                <div class="field">
                  <label>Serviços *</label>
                  <div class="rows" id="cxRows"></div>
                  <button class="btn" id="cxAdd" type="button">+ Adicionar serviço</button>
                </div>

                <div class="sum" id="cxSum">
                  <div>Total: R$ 0,00</div>
                  <div>Serviços: 0</div>
                </div>

                <div style="display:flex; justify-content:space-between; gap:8px; margin-top:10px;">
                  <button class="btn" data-close>Cancelar</button>
                  <button class="btn primary" id="cxSalvar">${isEditing ? "Salvar alterações" : "Salvar atendimento"}</button>
                </div>
              </div>
            `;
            modals.style.display = "flex";
            const $m = (sel)=>modal.querySelector(sel);

            // Sync client select -> name
            const cliSel = $m("#cxCliSel");
            cliSel?.addEventListener("change", () => {
              const id = cliSel.value || "";
              const c = clients.find(x => String(x.id)===String(id));
              if (c) $m("#cxCliNome").value = c.name || "";
            });

            function addRow(preset = null) {
              const row = document.createElement("div");
              row.className = "row";
              const svcSelId = preset?.servico_id || services[0]?.id || "";
              row.innerHTML = `
                <select class="svc">${svcOptions(svcSelId)}</select>
                <input class="preco" type="number" step="0.01" min="0" placeholder="Preço">
                <select class="prof">${userOptions(preset?.profissional || "")}</select>
                <select class="pay">
                  <option value="dinheiro">Dinheiro</option>
                  <option value="pix">PIX</option>
                  <option value="cartao">Cartão</option>
                  <option value="mensal">Mensal</option>
                </select>
                <button class="del" type="button" title="Remover">✕</button>
              `;
              const sel = row.querySelector(".svc");
              const ipP = row.querySelector(".preco");
              const ipPro = row.querySelector(".prof");
              const ipPay = row.querySelector(".pay");
              function fillBySvc() {
                const svc = services.find(s=>s.id===sel.value);
                ipP.value = String(svc?.preco ?? 0);
                recalc();
              }
              sel.addEventListener("change", fillBySvc);
              row.querySelector(".del").addEventListener("click", ()=>{ row.remove(); recalc(); });
              [ipP, ipPro, ipPay].forEach(inp => inp.addEventListener("input", recalc));
              $m("#cxRows").appendChild(row);

              if (preset) {
                if (preset.servico_id) sel.value = preset.servico_id;
                ipP.value = String(preset.preco ?? preset.valor ?? 0);
                if (preset.profissional) ipPro.value = preset.profissional;
                if (preset.pagamento) ipPay.value = preset.pagamento;
                recalc();
              } else {
                fillBySvc();
              }
            }

            function recalc() {
              const rows = Array.from($m("#cxRows").children);
              const total = rows.reduce((acc,r)=> acc + (parseFloat(r.querySelector(".preco").value||"0")||0),0);
              $m("#cxSum").children[0].textContent = "Total: " + (Number(total)||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
              $m("#cxSum").children[1].textContent = "Serviços: " + rows.length;
            }

            // Init rows
            if (isEditing && Array.isArray(existing.servicos) && existing.servicos.length) {
              existing.servicos.forEach(sv => {
                // try match by name -> id
                const match = services.find(s => (s.nome||"").toLowerCase() === String(sv.nome||"").toLowerCase());
                addRow({ servico_id: match?.id || services[0]?.id || "", preco: sv.preco ?? sv.valor ?? 0, profissional: sv.profissional || "", pagamento: sv.pagamento || "" });
              });
            } else {
              addRow();
            }
            recalc();

            // wire + add
            modal.addEventListener("click", (ev) => {
              const trg = ev.target.closest("#cxAdd");
              if (trg) { ev.preventDefault(); ev.stopPropagation(); addRow(); }
            });

            function ymFromYmd(ymd) { try { const [y,m] = ymd.split("-"); return `${y}-${m}`; } catch { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; } }

            function getMonthlyStore() {
              try { return JSON.parse(localStorage.getItem("bella_monthly_v1") || '{"clients":{}}'); } catch { return { clients: {} }; }
            }
            function setMonthlyStore(s) { localStorage.setItem("bella_monthly_v1", JSON.stringify(s)); }
            function getLedger(clientId, ym) {
              const st = getMonthlyStore();
              return (st.clients?.[clientId]?.[ym]) || { items: [], payments: [], closed: false };
            }
            function setLedger(clientId, ym, ledger) {
              const st = getMonthlyStore();
              if (!st.clients[clientId]) st.clients[clientId] = {};
              st.clients[clientId][ym] = ledger;
              setMonthlyStore(st);
            }

            $m("#cxSalvar").addEventListener("click", () => {
              const nome = ($m("#cxCliNome").value || "").trim();
              if (!nome) { alert("Informe o nome do cliente."); return; }
              const cliId = ($m("#cxCliSel").value || "").trim();

              const rows = Array.from($m("#cxRows").children).map(r => {
                const svcId = r.querySelector(".svc").value;
                const svc = services.find(s => s.id === svcId) || {};
                const preco = parseFloat(r.querySelector(".preco").value || "0") || 0;
                const profissional = (r.querySelector(".prof").value || "").trim();
                const pagamento = (r.querySelector(".pay").value || "dinheiro");
                return {
                  servico_id: svcId,
                  nome: svc.nome || "",
                  valor: preco,
                  profissional,
                  pagamento
                };
              });
              if (!rows.length) { alert("Adicione pelo menos um serviço."); return; }

              // Se existe alguma linha mensal, força cliente existente selecionado
              const hasMensal = rows.some(r => r.pagamento === "mensal");
              if (hasMensal && !cliId) {
                alert("Para lançar em Clientes Mensais selecione um cliente existente.");
                return;
              }

              const total = rows.reduce((a,b)=>a + (Number(b.valor)||0), 0);
              const uniquePays = Array.from(new Set(rows.map(r => r.pagamento)));
              const pagamentoTop = uniquePays.length === 1 ? uniquePays[0] : "misto";
              const obs = ($m("#cxObs").value || "").trim();

              const store = getStore();
              const day = getDay(store, selectedDate);

              // Persist in Caixa
              if (isEditing) {
                const idx = (day.atendimentos || []).findIndex(a => String(a.id) === String(existing.id));
                if (idx >= 0) {
                  day.atendimentos[idx] = {
                    ...day.atendimentos[idx],
                    id: attId,
                    data: selectedDate,
                    cliente: nome,
                    cliente_id: cliId || undefined,
                    pagamento: pagamentoTop,
                    valor: total,
                    servicos: rows,
                    obs
                  };
                }
              } else {
                day.atendimentos = (day.atendimentos || []).concat({
                  id: attId,
                  data: selectedDate,
                  cliente: nome,
                  cliente_id: cliId || undefined,
                  pagamento: pagamentoTop,
                  valor: total,
                  servicos: rows,
                  obs
                });
              }
              setStore(store);

              // Sync Mensal ledger (for lines with pagamento === 'mensal')
              if (hasMensal && cliId) {
                const ym = ymFromYmd(selectedDate);
                const led = getLedger(cliId, ym);
                // remove previous items of this attendance if editing
                led.items = (led.items || []).filter(it => String(it.att_id || "") !== String(attId));
                // add new items for mensal rows
                rows.forEach((r, idx) => {
                  if (r.pagamento !== "mensal") return;
                  const svc = services.find(s => s.id === r.servico_id) || {};
                  led.items.push({
                    id: "mi-" + Date.now() + "-" + idx,
                    att_id: attId,
                    date: selectedDate,
                    serviceId: r.servico_id,
                    serviceName: r.nome || svc.nome || "",
                    professional: r.profissional || "",
                    value: Number(r.valor) || 0,
                    image: svc.foto || ""
                  });
                });
                setLedger(cliId, ym, led);
              }

              modals.style.display = "none";
              renderCaixa();
            });

            modal.addEventListener("click", (e)=>{ if (e.target.hasAttribute("data-close")) modals.style.display = "none"; });
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
            const compact = localStorage.getItem("bella_export_compact") === "1";
            const legible = localStorage.getItem("bella_export_legible") === "1";
            const legibleCompact = localStorage.getItem("bella_export_legible_compact") === "1";
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

              const padHead = isCompact ? "10px 12px" : "14px 16px";
              const padBody = isCompact ? "10px" : "12px";
              const padCell = isCompact ? "8px 10px" : "10px 12px";
              const fsTitle = isCompact ? "18px" : "20px";
              const rowGap = isCompact ? 6 : 8;

              let html = "";
              entries.forEach(([cliente, data]) => {
                const items = (data?.items)||[];
                if (!items.length) return;
                const total = items.reduce((s,it)=>s+(Number(it.valor)||0),0);
                const ps = paySummary(items);
                const showPay = !ps.uniform;

                const obsLine = (data?.obs?.length)
                  ? `<div style="padding:${isCompact ? "8px 12px" : "10px 14px"}; background:#fffbea; border-bottom:1px solid #fde68a; color:#0f172a; font-weight:900;">🧾 Observações: ${data.obs.map(String).join(" • ")}</div>`
                  : "";

                html += `
                  <div style="border:2px solid #e5e7eb; border-radius:16px; overflow:hidden; background:#fff; margin:${isCompact ? "8px 0" : "10px 0"};">
                    <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; background:#fff; padding:${padHead}; border-bottom:1px solid #e5e7eb;">
                      <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                        <div style="width:5px; height:${isCompact ? "20px":"22px"}; background:#2563eb; border-radius:999px;"></div>
                        <div style="font-weight:900; color:#0f172a; font-size:${fsTitle}; letter-spacing:.2px;">${cliente}</div>
                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                          <span style="display:inline-flex;align-items:center;gap:8px;background:#f1f5f9;border:1px solid #e2e8f0;color:#0f172a;padding:${isCompact ? "5px 8px":"6px 10px"};border-radius:999px;font-weight:900;">Total ${money(total)}</span>
                          <span style="display:inline-flex;align-items:center;gap:8px;background:#f1f5f9;border:1px solid #e2e8f0;color:#0f172a;padding:${isCompact ? "5px 8px":"6px 10px"};border-radius:999px;font-weight:900;">${items.length} serviços</span>
                          <span style="display:inline-flex;align-items:center;gap:8px;background:#f1f5f9;border:1px solid #e2e8f0;color:#0f172a;padding:${isCompact ? "5px 8px":"6px 10px"};border-radius:999px;font-weight:900;">${ps.uniform ? (ps.unique[0]||"").toUpperCase() : ps.label}</span>
                        </div>
                      </div>
                    </div>
                    ${obsLine}
                    <div style="padding:${padBody};">
                      <table style="width:100%; border-collapse:separate; border-spacing:0 ${rowGap}px;">
                        <thead>
                          <tr>
                            <th style="text-align:left; color:#0f172a; font-weight:900; font-size:${isCompact ? "13px":"14px"};">Serviço</th>
                            <th style="text-align:left; color:#0f172a; font-weight:900; font-size:${isCompact ? "13px":"14px"};">Profissional</th>
                            ${showPay ? `<th style="text-align:left; color:#0f172a; font-weight:900; font-size:${isCompact ? "13px":"14px"};">Pagamento</th>` : ``}
                            <th style="text-align:right; color:#0f172a; font-weight:900; font-size:${isCompact ? "13px":"14px"};">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${items.map(it => `
                            <tr>
                              <td style="padding:${padCell}; border:1px solid #e5e7eb; background:#fff; color:#0f172a; font-weight:900; font-size:${isCompact ? "13px":"14px"};">${it.servico || "-"}</td>
                              <td style="padding:${padCell}; border:1px solid #e5e7eb; background:#fff; color:#0f172a; font-weight:800; font-size:${isCompact ? "13px":"14px"};">${it.profissional || "-"}</td>
                              ${showPay ? `<td style="padding:${padCell}; border:1px solid #e5e7eb; background:#fff; color:#0f172a; font-weight:800; font-size:${isCompact ? "13px":"14px"};">${(it.pagamento||"").toUpperCase()}</td>` : ``}
                              <td style="padding:${padCell}; border:1px solid #e5e7eb; background:#fff; text-align:right; color:#0f172a; font-weight:900; font-size:${isCompact ? "14px":"15px"};">${money(it.valor)}</td>
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

            // Painel destacado de Caixa (legível): Calculado, Informado, Diferença
            const diffVal = s2.dinheiroCalculado - s2.dinheiroInformado;
            const diffClass = diffVal === 0 ? "ok" : (diffVal > 0 ? "pos" : "neg");
            const cashHighlightHTML = `
              <div class="cx-highlight">
                <div class="cx-big calc">
                  <div class="t">Dinheiro em Caixa (Calculado)</div>
                  <div class="v">${money(s2.dinheiroCalculado)}</div>
                </div>
                <div class="cx-big info">
                  <div class="t">Dinheiro em Caixa (Informado)</div>
                  <div class="v">${money(s2.dinheiroInformado)}</div>
                </div>
                <div class="cx-big diff ${diffClass}">
                  <div class="t">Diferença</div>
                  <div class="v">${money(diffVal)}</div>
                </div>
              </div>
            `;

            const gridClass = useCompact ? "client-grid grid2" : "client-grid";

            const container = document.createElement("div");
            container.id = "report-capture";
            container.style.position = "fixed";
            container.style.left = "-10000px";
            container.style.top = "0";
            // Ajuste para exportar em Full HD (largura 1920px com scale 2 sobre 960px)
            container.style.width = "960px";
            container.style.background = "#fff";
            container.style.color = "#0f172a";
            container.style.padding = "20px";
            container.style.fontFamily = "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";

            container.innerHTML = `
              <style>
                .r-title { font-weight:900; font-size:26px; color:#9d174d; margin-bottom:4px; }
                .r-sub { color:#475569; font-weight:700; }
                .r-grid { display:grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap:10px; margin:12px 0 6px; }
                /* Destaque do Caixa (legível) */
                .cx-highlight { display:grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap:12px; margin:12px 0; }
                .cx-big { border:2px solid #e5e7eb; border-radius:14px; padding:12px; background:#fff; }
                .cx-big .t { color:#334155; font-weight:900; font-size:13px; }
                .cx-big .v { color:#0f172a; font-weight:900; font-size:${legible ? 32 : 28}px; margin-top:4px; }
                .cx-big.calc { border-color:#059669; }
                .cx-big.info { border-color:#334155; }
                .cx-big.diff.ok { border-color:#16a34a; }
                .cx-big.diff.pos { border-color:#16a34a; }
                .cx-big.diff.neg { border-color:#dc2626; }
                .r-card { border:2px solid #f1e6ee; border-radius:12px; padding:10px; }
                .r-card.green { border-color:#10b981; }
                .r-card.blue { border-color:#2563eb; }
                .r-card.purple { border-color:#7c3aed; }
                .r-card.amber { border-color:#d97706; }
                .r-card.red { border-color:#dc2626; }
                .r-card .t { color:#475569; font-weight:800; font-size:12px; }
                .r-card .v { color:#0f172a; font-weight:900; font-size:18px; margin-top:4px; }
                .sec { margin-top:14px; }
                .sec h3 { margin: 0 0 6px; color:#0f172a; font-size:16px; }
                .client-grid { display:block; }
                .client-grid.grid2 { display:grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap:8px; }
                table { width:100%; border-collapse:separate; border-spacing:0 ${compact ? 4 : 6}px; font-size:13px; }
                th { text-align:left; color:#0f172a; font-weight:80_code                td, th { padding:${compact ? "6px 8px" : "8px 10px"}; border:1px solid #f1e6ee; background:#fff; }
                td.num { text-align:right; font-weight:900; }
                .muted { color:#64748b; }
                .sm { font-size:12px; }
                .foot { margin-top: 8px; color:#64748b; font-size:12px; }
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
              ${legible ? cashHighlightHTML : ""}

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

            // Build a brand-new LEGIBLE layout (full redesign) when enabled
            function buildLegibleHTML() {
              // Determine compact mode for legible (from localStorage, fallback)
              let useCompact = false;
              try {
                const a = localStorage.getItem("bella_export_legible_compact");
                if (a === "1" || a === "true") useCompact = true;
              } catch {}
              const grouped = groupAttsByClient(s2.atts || []);
              const entries = Object.entries(grouped);
              const diffVal = (Number(s2.dinheiroCalculado) || 0) - (Number(s2.dinheiroInformado) || 0);

              // Aggregates
              const pix = Number((payAgg && payAgg.sums && payAgg.sums.pix) || 0);
              const cartao = Number((payAgg && payAgg.sums && payAgg.sums.cartao) || 0);
              const dinheiro = Number((payAgg && payAgg.sums && payAgg.sums.dinheiro) || 0);
              const mensal = Number((payAgg && payAgg.sums && payAgg.sums.mensal) || 0);
              const receitaDia = pix + cartao + dinheiro;
              const despesas = (s2.deps || []).reduce((acc, d) => acc + (Number(d.valor) || 0), 0);
              const saldoDia = receitaDia - despesas;
              const attsCount = (s2.atts || []).length;
              const servicosCount = entries.reduce((acc, [,data]) => acc + (((data && data.items) || []).length), 0);

              const chipForPay = (p) => {
                const k = (p || "").toLowerCase();
                if (k === "pix") return `<span class="nx-chip pix">PIX</span>`;
                if (k === "cartao" || k === "cartão") return `<span class="nx-chip cartao">CARTÃO</span>`;
                if (k === "dinheiro") return `<span class="nx-chip dinheiro">DINHEIRO</span>`;
                if (k === "mensal") return `<span class="nx-chip mensal">MENSAL</span>`;
                return "";
              };

              // Clients
              const clientCards = entries.map(([cliente, data]) => {
                const items = (data && data.items) || [];
                if (!items.length) return "";
                const total = items.reduce((acc, it) => acc + (Number(it.valor) || 0), 0);

                // payment summary
                const pays = {};
                items.forEach(it => { const p = (it.pagamento || "").toLowerCase(); if (!pays[p]) pays[p] = 0; pays[p]++; });
                const usedPays = Object.entries(pays)
                  .filter(([,v]) => v > 0)
                  .map(([k,v]) => k.toUpperCase() + (v>1?` ${v}`:""))
                  .join(" • ");

                const obsLine = (data && data.obs && data.obs.length)
                  ? `<div class="nx-obs">🧾 ${data.obs.map(String).join(" • ")}</div>`
                  : "";

                const rows = items.map(it => `
                  <div class="nx-row">
                    <div class="left">
                      <div class="svc">${it.servico || "-"}</div>
                      <div class="meta">
                        ${it.profissional ? `<span class="nx-pill">${it.profissional}</span>` : ``}
                        ${chipForPay(it.pagamento)}
                      </div>
                    </div>
                    <div class="right val">${money(it.valor)}</div>
                  </div>
                `).join("");

                return `
                  <article class="nx-client">
                    <header class="nx-head">
                      <div class="stripe"></div>
                      <div class="title">${cliente}</div>
                      <div class="badges">
                        <span class="nx-badge">${items.length} serviços</span>
                        <span class="nx-badge">Total ${money(total)}</span>
                        ${usedPays ? `<span class="nx-badge">${usedPays}</span>` : ``}
                      </div>
                    </header>
                    ${obsLine}
                    <section class="nx-body">
                      ${rows}
                    </section>
                  </article>
                `;
              }).join("");

              // Expenses rows
              const depRows = (s2.deps || []).map(d => {
                const proof = d.qr_text ? `<img class="qrimg" src="${qrImgFor(d.qr_text)}" alt="QR da nota">` : `<span class="muted">—</span>`;
                return `
                  <tr>
                    <td>${d.descricao}</td>
                    <td>${d.origem === "caixa" ? "Retirada do Caixa" : "Outro"}</td>
                    <td class="qr-cell">${proof}</td>
                    <td class="num">${money(d.valor)}</td>
                  </tr>
                `;
              }).join("");

              // Payment by method cards
              const payCards = `
                <div class="nx-cards four">
                  <div class="nx-card teals">
                    <div class="t">PIX</div>
                    <div class="v">${money(pix)}</div>
                    <div class="s">(${(payAgg && payAgg.cnt && payAgg.cnt.pix) || 0} itens)</div>
                  </div>
                  <div class="nx-card indigo">
                    <div class="t">Cartão</div>
                    <div class="v">${money(cartao)}</div>
                    <div class="s">(${(payAgg && payAgg.cnt && payAgg.cnt.cartao) || 0} itens)</div>
                  </div>
                  <div class="nx-card emerald">
                    <div class="t">Dinheiro</div>
                    <div class="v">${money(dinheiro)}</div>
                    <div class="s">(${(payAgg && payAgg.cnt && payAgg.cnt.dinheiro) || 0} itens)</div>
                  </div>
                  <div class="nx-card amber">
                    <div class="t">Mensal (Débito)</div>
                    <div class="v">${money(mensal)}</div>
                    <div class="s">(${(payAgg && payAgg.cnt && payAgg.cnt.mensal) || 0} itens)</div>
                  </div>
                </div>
              `;

              // Full HTML
              return `
                <style>
                  .nx-wrap { font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color:#0f172a; }
                  .nx-brand { height:6px; background:linear-gradient(90deg,#10b981,#6366f1); border-radius:8px; margin-bottom:10px; }
                  .nx-headline { display:flex; align-items:flex-end; justify-content:space-between; gap:16px; padding-bottom:8px; border-bottom:2px solid #e5e7eb; }
                  .nx-title { font-size:30px; font-weight:900; letter-spacing:.2px; }
                  .nx-day { font-size:22px; font-weight:900; color:#111827; }
                  .nx-meta { text-align:right; color:#475569; font-weight:800; }

                  /* HERO PANELS — Caixa visível já de cara */
                  .nx-hero { display:grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap:12px; margin:14px 0; }
                  .nx-card.hero { border:2px solid #e5e7eb; border-radius:14px; padding:12px; background:#fff; }
                  .nx-card.hero .t { color:#334155; font-weight:900; font-size:13px; }
                  .nx-card.hero .v { color:#0f172a; font-weight:900; font-size:38px; margin-top:6px; }
                  .nx-card.hero.calc { border-color:#0ea5a1; }
                  .nx-card.hero.info { border-color:#475569; }
                  .nx-card.hero.diff.ok { border-color:#16a34a; }
                  .nx-card.hero.diff.pos { border-color:#16a34a; }
                  .nx-card.hero.diff.neg { border-color:#dc2626; }

                  /* SECOND ROW PANELS — Resumo financeiro do dia */
                  .nx-summary { display:grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap:12px; margin:8px 0 14px; }
                  .nx-card.sum { border:2px solid #e5e7eb; border-radius:14px; padding:12px; background:#fff; }
                  .nx-card.sum .t { color:#334155; font-weight:900; font-size:13px; }
                  .nx-card.sum .v { color:#0f172a; font-weight:900; font-size:32px; margin-top:6px; }
                  .nx-card.sum.in { border-color:#0284c7; }  /* Entradas */
                  .nx-card.sum.out { border-color:#ef4444; } /* Despesas */
                  .nx-card.sum.balance { border-color:#10b981; } /* Saldo */

                  /* Payment cards */
                  .nx-cards.four { display:grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap:10px; margin:10px 0 16px; }
                  .nx-card { border:2px solid #e5e7eb; border-radius:12px; padding:10px; background:#fff; }
                  .nx-card .t { color:#334155; font-weight:900; font-size:13px; }
                  .nx-card .v { color:#0f172a; font-weight:900; font-size:22px; margin-top:4px; }
                  .nx-card .s { color:#64748b; font-weight:700; font-size:12px; }
                  .nx-card.teals { border-color:#0ea5a1; }
                  .nx-card.indigo { border-color:#4f46e5; }
                  .nx-card.emerald { border-color:#10b981; }
                  .nx-card.amber { border-color:#d97706; }

                  .nx-section { margin-top:16px; }
                  .nx-section h3 { margin:0 0 8px; color:#0f172a; font-size:20px; font-weight:900; }

                  .nx-grid { display:block; }
                  .nx-grid.two { display:grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap:12px; }

                  /* Client card */
                  .nx-client { border:2px solid #e5e7eb; border-radius:16px; overflow:hidden; background:#fff; }
                  .nx-head { display:flex; align-items:center; gap:12px; flex-wrap:wrap; padding:12px 14px; border-bottom:1px solid #e5e7eb; }
                  .nx-head .stripe { width:6px; height:26px; background:#10b981; border-radius:999px; }
                  .nx-head .title { font-weight:900; font-size:22px; color:#0f172a; flex:1; }
                  .nx-head .badges { display:flex; gap:8px; flex-wrap:wrap; }
                  .nx-badge { display:inline-flex; align-items:center; gap:8px; background:#f1f5f9; border:1px solid #e2e8f0; color:#0f172a; padding:6px 10px; border-radius:999px; font-weight:900; }

                  .nx-obs { padding:10px 14px; background:#f3f4f6; border-bottom:1px solid #e5e7eb; color:#0f172a; font-weight:900; }

                  .nx-body { padding:12px; display:grid; gap:10px; }
                  .nx-row { display:grid; grid-template-columns: 1fr 220px; gap:12px; align-items:center; }
                  .nx-row .svc { font-weight:900; font-size:16px; color:#0f172a; }
                  .nx-row .meta { margin-top:6px; display:flex; gap:8px; flex-wrap:wrap; }
                  .nx-pill { display:inline-flex; align-items:center; gap:6px; background:#e5e7eb; border:1px solid #cbd5e1; color:#0f172a; padding:5px 10px; border-radius:999px; font-weight:800; font-size:12px; }
                  .nx-chip { display:inline-flex; align-items:center; gap:6px; padding:5px 10px; border-radius:999px; font-weight:900; font-size:12px; border:1px solid transparent; }
                  .nx-chip.pix { background:#ecfeff; border-color:#a5f3fc; color:#155e75; }
                  .nx-chip.cartao { background:#eef2ff; border-color:#c7d2fe; color:#3730a3; }
                  .nx-chip.dinheiro { background:#ecfdf5; border-color:#a7f3d0; color:#065f46; }
                  .nx-chip.mensal { background:#fffbeb; border-color:#fde68a; color:#92400e; }
                  .nx-row .val { text-align:right; font-weight:900; font-size:18px; color:#0f172a; }

                  /* Tables */
                  table { width:100%; border-collapse:separate; border-spacing:0 8px; font-size:16px; }
                  th { text-align:left; color:#0f172a; font-weight:900; }
                  td, th { padding:10px 12px; border:1px solid #e5e7eb; background:#fff; }
                  td.num { text-align:right; font-weight:900; }
                  .qrimg { width:${useCompact ? 105 : 120}px; height:${useCompact ? 105 : 120}px; object-fit:contain; border:1px solid #e5e7eb; border-radius:8px; background:#fff; }
                  .qr-cell { text-align:center; }

                  .nx-foot { margin-top: 10px; color:#64748b; font-size:12px; }
                </style>

                <div class="nx-wrap">
                  <div class="nx-brand"></div>
                  <div class="nx-headline">
                    <div>
                      <div class="nx-title">Relatório do Caixa — Espaço Bella's</div>
                      <div class="nx-day">Dia: <strong>${brDate}</strong> • ${attsCount} atendimentos • ${servicosCount} serviços</div>
                    </div>
                    <div class="nx-meta">Gerado em: ${genStr}</div>
                  </div>

                  <!-- Primeiro: estado do dinheiro no caixa -->
                  <div class="nx-hero">
                    <div class="nx-card hero calc">
                      <div class="t">Dinheiro em Caixa (Calculado)</div>
                      <div class="v">${money(s2.dinheiroCalculado)}</div>
                    </div>
                    <div class="nx-card hero info">
                      <div class="t">Dinheiro em Caixa (Informado)</div>
                      <div class="v">${money(s2.dinheiroInformado)}</div>
                    </div>
                    <div class="nx-card hero diff ${diffVal === 0 ? "ok" : (diffVal > 0 ? "pos" : "neg")}">
                      <div class="t">Diferença</div>
                      <div class="v">${money(diffVal)}</div>
                    </div>
                  </div>

                  <!-- Segundo: resumo financeiro do dia -->
                  <div class="nx-summary">
                    <div class="nx-card sum in">
                      <div class="t">Entradas do Dia (Pix+Cartão+Dinheiro)</div>
                      <div class="v">${money(receitaDia)}</div>
                    </div>
                    <div class="nx-card sum out">
                      <div class="t">Despesas</div>
                      <div class="v">${money(despesas)}</div>
                    </div>
                    <div class="nx-card sum balance">
                      <div class="t">Saldo do Dia (Entradas − Despesas)</div>
                      <div class="v">${money(saldoDia)}</div>
                    </div>
                  </div>

                  <!-- Entradas por forma de pagamento -->
                  ${payCards}

                  <!-- Clientes e atendimentos -->
                  <div class="nx-section">
                    <h3>Atendimentos por Cliente</h3>
                    <div class="nx-grid ${useCompact ? "two" : ""}">
                      ${clientCards || `<div class="muted">Sem atendimentos para esta data</div>`}
                    </div>
                  </div>

                  <!-- Despesas -->
                  <div class="nx-section">
                    <h3>Despesas</h3>
                    ${(s2.deps || []).length
                      ? `<table>
                          <thead><tr><th>Descrição</th><th>Origem</th><th>Comprovante</th><th>Valor</th></tr></thead>
                          <tbody>${depRows}</tbody>
                        </table>`
                      : `<div class="muted">Sem despesas para esta data</div>`}
                  </div>

                  <div class="nx-foot">
                    <div style="margin-bottom:4px;">CNPJ: 30.504.701/0001-29 • Endereço: R. Rezende, 229 - Iputinga, Recife - PE, 50680-200 • Tel: (81) 98628-8749</div>
                    <div>Gerado em ${genStr}</div>
                  </div>
                </div>
              `;
            }

            // Build brand-new V2 layout (completely different visual identity)
            function buildUltraLegibleHTML() {
              // Compact?
              let useCompact = false;
              try {
                const a = localStorage.getItem("bella_export_legible_compact");
                if (a === "1" || a === "true") useCompact = true;
              } catch {}
              // Aggregates from snapshot
              const pix = Number(s2.totalPix || 0);
              const cartao = Number(s2.totalCartao || 0);
              const dinheiro = Number(s2.totalDinheiro || 0);
              const mensal = Number(s2.totalDebitos || 0);
              const entradas = Number(s2.entradas || (pix + cartao + dinheiro));
              const despesas = Number(s2.totalDespesas || 0);
              const calc = Number(s2.dinheiroCalculado || 0);
              const informado = Number(s2.dinheiroInformado || 0);
              const diffVal = calc - informado;
              const atts = Array.isArray(s2.atts) ? s2.atts : [];
              const attsCount = atts.length;

              // Derivatives
              let servicosCount = 0;
              const sumsPro = {};
              const sumsSvc = {};
              atts.forEach(a => {
                const lines = (Array.isArray(a.servicos) && a.servicos.length)
                  ? a.servicos
                  : [{ nome: a.servico, valor: a.valor, profissional: a.profissional, pagamento: a.pagamento }];
                lines.forEach(sv => {
                  const v = Number(sv.valor) || 0;
                  servicosCount++;
                  const pro = (sv.profissional || a.profissional || "-").trim() || "-";
                  const sn = (sv.nome || a.servico || "-").trim() || "-";
                  sumsPro[pro] = (sumsPro[pro] || 0) + v;
                  sumsSvc[sn] = (sumsSvc[sn] || 0) + v;
                });
              });
              const topPro = Object.entries(sumsPro).sort((a,b)=>b[1]-a[1]).slice(0,3);
              const topSvc = Object.entries(sumsSvc).sort((a,b)=>b[1]-a[1]).slice(0,5);

              const ticketAtt = attsCount ? entradas / attsCount : 0;
              const ticketSvc = servicosCount ? entradas / servicosCount : 0;
              const pct = (v, base) => base > 0 ? Math.round((v / base) * 100) : 0;
              const pixPct = pct(pix, entradas);
              const cartaoPct = pct(cartao, entradas);
              const dinheiroPct = pct(dinheiro, entradas);

              // Group by client for cards
              const grouped = groupAttsByClient(atts);
              const entries = Object.entries(grouped);

              const renderClients = () => {
                const rows = entries.map(([cliente, data]) => {
                  const items = (data?.items) || [];
                  if (!items.length) return "";
                  const total = items.reduce((s,it)=>s + (Number(it.valor)||0), 0);
                  const obs = (data?.obs?.length) ? `<div class="lx-note">🧾 ${data.obs.map(String).join(" • ")}</div>` : "";
                  return `
                    <article class="lx-client">
                      <header class="lx-chead">
                        <div class="lx-cbar"></div>
                        <div class="lx-ctitle">${cliente}</div>
                        <div class="lx-cbadges">
                          <span class="lx-badge">Total ${money(total)}</span>
                          <span class="lx-badge">${items.length} serviços</span>
                        </div>
                      </header>
                      ${obs}
                      <section class="lx-cbody">
                        ${items.map(it => `
                          <div class="lx-row">
                            <div class="lx-left">
                              <div class="lx-svc">${it.servico || "-"}</div>
                              <div class="lx-meta">
                                ${it.profissional ? `<span class="lx-pill">${it.profissional}</span>` : ``}
                                ${it.pagamento ? `<span class="lx-chip ${(it.pagamento||"").toLowerCase()}">${(it.pagamento||"").toUpperCase()}</span>` : ``}
                              </div>
                            </div>
                            <div class="lx-val">${money(it.valor)}</div>
                          </div>
                        `).join("")}
                      </section>
                    </article>
                  `;
                }).join("");
                return rows || `<div class="lx-muted">Sem atendimentos para esta data</div>`;
              };

              // Expenses table
              const depTable = (s2.deps || []).length ? `
                <table class="lx-table">
                  <thead><tr><th>Descrição</th><th>Origem</th><th>Comprovante</th><th class="num">Valor</th></tr></thead>
                  <tbody>
                    ${(s2.deps || []).map(d => {
                      const proof = d.qr_text ? `<img class="lx-qr" src="${qrImgFor(d.qr_text)}" alt="QR da nota">` : `<span class="lx-muted">—</span>`;
                      return `<tr>
                        <td>${d.descricao}</td>
                        <td>${d.origem === "caixa" ? "Retirada do Caixa" : "Outro"}</td>
                        <td class="lx-qrc">${proof}</td>
                        <td class="num">${money(d.valor)}</td>
                      </tr>`;
                    }).join("")}
                  </tbody>
                </table>
              ` : `<div class="lx-muted">Sem despesas para esta data</div>`;

              // Bars for payment distribution (only over Entradas)
              const bar = (pct, cls, label, val) => `
                <div class="lx-bar">
                  <div class="lx-barlabel ${cls}">${label} • ${money(val)} (${pct}%)</div>
                  <div class="lx-track"><div class="lx-fill ${cls}" style="width:${Math.max(4, pct)}%;"></div></div>
                </div>
              `;

              // Top lists
              const topList = (rows) => rows.length
                ? rows.map(([k,v]) => `<div class="lx-toprow"><span>${k}</span><span class="num">${money(v)}</span></div>`).join("")
                : `<div class="lx-muted">—</div>`;

              // New identity + layout (no pink)
              return `
                <style>
                  .lx-wrap { font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color:#0f172a; }
                  .lx-header { display:flex; align-items:flex-end; justify-content:space-between; gap:16px; padding-bottom:10px; border-bottom:2px solid #e5e7eb; }
                  .lx-brand { height:6px; background:linear-gradient(90deg,#0ea5a1,#4f46e5); border-radius:999px; margin-bottom:10px; }
                  .lx-title { font-size:28px; font-weight:900; letter-spacing:.25px; color:#0f172a; text-transform:uppercase; }
                  .lx-sub { color:#475569; font-weight:800; }
                  .lx-meta { text-align:right; color:#475569; font-weight:800; }
                  
                  .lx-hero { display:grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap:12px; margin:12px 0; }
                  .lx-panel { border:2px solid #e5e7eb; border-radius:14px; padding:12px; background:#fff; }
                  .lx-panel .t { color:#334155; font-weight:900; font-size:13px; }
                  .lx-panel .v { color:#0f172a; font-weight:900; font-size:36px; margin-top:6px; }
                  .lx-panel.calc { border-color:#0ea5a1; }
                  .lx-panel.info { border-color:#475569; }
                  .lx-panel.pos { border-color:#16a34a; }
                  .lx-panel.neg { border-color:#dc2626; }

                  .lx-kpi { display:grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap:10px; margin:10px 0 14px; }
                  .lx-kcard { border:2px solid #e5e7eb; border-radius:12px; padding:10px; background:#fff; }
                  .lx-kcard .t { color:#334155; font-weight:900; font-size:12px; }
                  .lx-kcard .v { color:#0f172a; font-weight:900; font-size:24px; margin-top:4px; }
                  .lx-kcard.em { border-color:#0ea5a1; }
                  .lx-kcard.dp { border-color:#ef4444; }
                  .lx-kcard.tk { border-color:#4f46e5; }

                  .lx-bars { display:grid; grid-template-columns: 2fr 1fr; gap:12px; margin:6px 0 12px; }
                  .lx-bar { margin-bottom:8px; }
                  .lx-barlabel { font-weight:900; font-size:12px; margin-bottom:4px; }
                  .lx-barlabel.pix { color:#0369a1; }
                  .lx-barlabel.cartao { color:#4338ca; }
                  .lx-barlabel.dinheiro { color:#065f46; }
                  .lx-track { height:10px; background:#f1f5f9; border:1px solid #e2e8f0; border-radius:999px; overflow:hidden; }
                  .lx-fill { height:100%; border-radius:999px; }
                  .lx-fill.pix { background:#93c5fd; }
                  .lx-fill.cartao { background:#c7d2fe; }
                  .lx-fill.dinheiro { background:#a7f3d0; }

                  .lx-side { border:2px solid #e5e7eb; border-radius:12px; padding:10px; background:#fff; }
                  .lx-side h4 { margin:0 0 8px; font-size:14px; color:#334155; font-weight:900; }
                  .lx-toprow { display:flex; align-items:center; justify-content:space-between; border-bottom:1px dashed #e5e7eb; padding:6px 0; }
                  .lx-toprow:last-child { border-bottom:0; }
                  .num { text-align:right; font-weight:900; }

                  .lx-section { margin-top:14px; }
                  .lx-section h3 { margin:0 0 8px; color:#0f172a; font-weight:900; font-size:18px; }

                  .lx-grid { display:block; }
                  .lx-grid.two { display:grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap:12px; }

                  .lx-client { border:2px solid #e5e7eb; border-radius:16px; overflow:hidden; background:#fff; }
                  .lx-chead { display:flex; align-items:center; gap:12px; padding:12px 14px; border-bottom:1px solid #e5e7eb; background:#f8fafc; }
                  .lx-cbar { width:6px; height:26px; background:#0ea5a1; border-radius:999px; }
                  .lx-ctitle { font-weight:900; font-size:20px; color:#0f172a; flex:1; }
                  .lx-cbadges { display:flex; gap:8px; flex-wrap:wrap; }
                  .lx-badge { display:inline-flex; align-items:center; gap:8px; background:#f1f5f9; border:1px solid #e2e8f0; color:#0f172a; padding:6px 10px; border-radius:999px; font-weight:900; }

                  .lx-note { padding:10px 14px; background:#fffbea; border-bottom:1px solid #fde68a; color:#0f172a; font-weight:900; }

                  .lx-cbody { padding:12px; display:grid; gap:10px; }
                  .lx-row { display:grid; grid-template-columns: 1fr 200px; gap:12px; align-items:center; }
                  .lx-svc { font-weight:900; font-size:16px; color:#0f172a; }
                  .lx-meta { margin-top:6px; display:flex; gap:8px; flex-wrap:wrap; }
                  .lx-pill { display:inline-flex; align-items:center; gap:6px; background:#e5e7eb; border:1px solid #cbd5e1; color:#0f172a; padding:5px 10px; border-radius:999px; font-weight:800; font-size:12px; }
                  .lx-chip { display:inline-flex; align-items:center; gap:6px; padding:5px 10px; border-radius:999px; font-weight:900; font-size:12px; border:1px solid transparent; }
                  .lx-chip.pix { background:#ecfeff; border-color:#a5f3fc; color:#155e75; }
                  .lx-chip.cartao { background:#eef2ff; border-color:#c7d2fe; color:#3730a3; }
                  .lx-chip.dinheiro { background:#ecfdf5; border-color:#a7f3d0; color:#065f46; }
                  .lx-chip.mensal { background:#fffbeb; border-color:#fde68a; color:#92400e; }
                  .lx-val { text-align:right; font-weight:900; font-size:18px; color:#0f172a; }

                  .lx-table { width:100%; border-collapse:separate; border-spacing:0 8px; font-size:15px; }
                  .lx-table th { text-align:left; color:#0f172a; font-weight:900; }
                  .lx-table td, .lx-table th { padding:10px 12px; border:1px solid #e5e7eb; background:#fff; }
                  .lx-qr { width:${useCompact ? 100 : 120}px; height:${useCompact ? 100 : 120}px; object-fit:contain; border:1px solid #e5e7eb; border-radius:8px; background:#fff; }
                  .lx-qrc { text-align:center; }

                  .lx-muted { color:#64748b; }

                  .lx-foot { margin-top:10px; color:#64748b; font-size:12px; }
                </style>

                <div class="lx-wrap">
                  <div class="lx-brand"></div>
                  <div class="lx-header">
                    <div>
                      <div class="lx-title">Relatório Diário do Caixa</div>
                      <div class="lx-sub">Dia: <strong>${brDate}</strong> • ${attsCount} atendimentos • ${servicosCount} serviços</div>
                    </div>
                    <div class="lx-meta">Gerado em: ${genStr}</div>
                  </div>

                  <!-- Status do Caixa -->
                  <div class="lx-hero">
                    <div class="lx-panel calc">
                      <div class="t">Dinheiro em Caixa (Calculado)</div>
                      <div class="v">${money(calc)}</div>
                    </div>
                    <div class="lx-panel info">
                      <div class="t">Dinheiro em Caixa (Informado)</div>
                      <div class="v">${money(informado)}</div>
                    </div>
                    <div class="lx-panel ${diffVal >= 0 ? "pos" : "neg"}">
                      <div class="t">Diferença</div>
                      <div class="v">${money(diffVal)}</div>
                    </div>
                  </div>

                  <!-- Indicadores -->
                  <div class="lx-kpi">
                    <div class="lx-kcard em">
                      <div class="t">Entradas (Pix+Cartão+Dinheiro)</div>
                      <div class="v">${money(entradas)}</div>
                    </div>
                    <div class="lx-kcard">
                      <div class="t">Atendimentos</div>
                      <div class="v">${attsCount}</div>
                    </div>
                    <div class="lx-kcard tk">
                      <div class="t">Ticket médio por atendimento</div>
                      <div class="v">${money(ticketAtt)}</div>
                    </div>
                    <div class="lx-kcard tk">
                      <div class="t">Ticket médio por serviço</div>
                      <div class="v">${money(ticketSvc)}</div>
                    </div>
                  </div>

                  <!-- Distribuição das Entradas + Destaques -->
                  <div class="lx-bars">
                    <div>
                      ${bar(pixPct, "pix", "PIX", pix)}
                      ${bar(cartaoPct, "cartao", "Cartão", cartao)}
                      ${bar(dinheiroPct, "dinheiro", "Dinheiro", dinheiro)}
                      <div class="lx-muted" style="margin-top:6px;">Mensal (débito não pago): ${money(mensal)}</div>
                    </div>
                    <div class="lx-side">
                      <h4>Top profissionais</h4>
                      ${topList(topPro)}
                      <h4 style="margin-top:10px;">Top serviços</h4>
                      ${topList(topSvc)}
                    </div>
                  </div>

                  <!-- Clientes -->
                  <div class="lx-section">
                    <h3>Atendimentos por Cliente</h3>
                    <div class="lx-grid ${useCompact ? "two" : ""}">
                      ${renderClients()}
                    </div>
                  </div>

                  <!-- Despesas -->
                  <div class="lx-section">
                    <h3>Despesas</h3>
                    ${depTable}
                  </div>

                  <div class="lx-foot">
                    <div style="margin-bottom:4px;">CNPJ: 30.504.701/0001-29 • Endereço: R. Rezende, 229 - Iputinga, Recife - PE, 50680-200 • Tel: (81) 98628-8749</div>
                    <div>Gerado em ${genStr}</div>
                  </div>
                </div>
              `;
            }

            // Build brand-new layout when legible is enabled
            if (legible) {
              container.innerHTML = buildUltraLegibleHTML();
            }

            document.body.appendChild(container);
            const targetWidth = 960; // px in DOM
            const targetScale = 2;   // 960 * 2 = 1920 (Full HD width)
            const canvas = await html2canvas(container, {
              backgroundColor: "#ffffff",
              scale: targetScale,
              useCORS: true,
              windowWidth: targetWidth,
              windowHeight: container.scrollHeight
            });
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