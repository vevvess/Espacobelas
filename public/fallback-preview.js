(function () {
  window.__runFallbackPreview = function (root) {
    const html = `
      <style>
        :root { color-scheme: light dark; }
        html, body, #root { height: 100%; margin: 0; }
        body { background: #fafafa; color: #111827; }
        .container {
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
          padding: 24px;
          line-height: 1.6;
          max-width: 1000px;
          margin: 0 auto;
        }
        .brand { color: #ec4899; font-weight: 800; font-size: 18px; letter-spacing: .3px; }
        h1 { font-size: 22px; margin: 16px 0 8px; }
        h3 { margin: 0 0 8px; font-size: 18px; }
        p { margin: 8px 0; }
        .muted { color: #6b7280; }
        .card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          margin-top: 16px;
          background: #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,.06);
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
          margin-top: 8px;
        }
        .pill {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 999px;
          background: #fce7f3;
          color: #831843;
          font-weight: 600;
          font-size: 12px;
        }
        .btn {
          display: inline-block;
          background: #ec4899;
          color: #fff;
          padding: 10px 14px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 700;
          margin-top: 8px;
        }
        @media (prefers-color-scheme: dark) {
          body { background: #0b0b0b; color: #e5e7eb; }
          .card { background: #111827; border-color: #374151; box-shadow: none; }
          .muted { color: #9ca3af; }
        }
      </style>

      <div class="container">
        <div class="brand">Bella App — Preview Estático</div>
        <p class="muted">Este preview permite visualizar uma casca estática do app dentro deste ambiente. Para o app completo (React + Vite), rode localmente com <code>npm run dev</code>.</p>

        <div class="card">
          <h3>Rotas e seções principais</h3>
          <div class="grid">
            <div>
              <div class="pill">Dashboard</div>
              <div class="muted">Resumo e gráficos</div>
            </div>
            <div>
              <div class="pill">Agenda</div>
              <div class="muted">Agendamentos e calendário</div>
            </div>
            <div>
              <div class="pill">Clientes</div>
              <div class="muted">Cadastro, consulta e ficha</div>
            </div>
            <div>
              <div class="pill">Serviços</div>
              <div class="muted">Catálogo, preços e duração</div>
            </div>
            <div>
              <div class="pill">Caixa</div>
              <div class="muted">Movimentações e pagamentos</div>
            </div>
            <div>
              <div class="pill">Usuários</div>
              <div class="muted">Times, permissões e perfis</div>
            </div>
            <div>
              <div class="pill">Relatórios</div>
              <div class="muted">Métricas e indicadores</div>
            </div>
            <div>
              <div class="pill">Configurações</div>
              <div class="muted">Preferências do sistema</div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>Como iniciar o app completo localmente</h3>
          <ol>
            <li>npm install</li>
            <li>Copie <code>.env.example</code> para <code>.env</code> e ajuste <code>VITE_DATABASE_URL</code></li>
            <li>npm run dev (abre em http://localhost:8080)</li>
          </ol>
          <p class="muted">No deploy, gere o build com <code>npm run build</code> e sirva o conteúdo de <code>dist/</code>.</p>
          <a class="btn" href="#" onclick="alert('Abra o README no repositório para mais detalhes.'); return false;">Ver README</a>
        </div>
      </div>
    `;
    root.innerHTML = html;
  };
})();