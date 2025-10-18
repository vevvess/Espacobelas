# Contexto do App — Bella's Salon (Static Preview)

Sentinel: BELLA_SALON_APP_SENTINEL::STATIC_ONLY::2025-10-18::V1
App ID: bella-app-v1
Static-only: true (preview estático é a fonte de verdade desta build)

Este app é um preview estático mobile-first do sistema de gestão do salão “Espaço Bella’s”. Foi feito para demonstrar UX, navegação e principais fluxos, sem backend. Todos os dados persistem localmente (localStorage) e podem ser exportados.

Páginas e funcionalidades:
- Dashboard: resumo do dia, KPIs e aniversariantes.
- Agenda: lista e cartões de agendamentos com estados (agendado, em andamento), destaque do item ativo no menu, modal simples para operações.
- Clientes: lista simples e botão para criar novo cliente (modal).
- Ficha Cliente: visão resumida da ficha.
- Clientes Mensais: clientes com recorrência/assinatura.
- Serviços: catálogo com preço/duração.
- Caixa:
  - Persistência local por data; cálculo de totais (PIX, cartão, dinheiro, débitos, despesas, dinheiro em caixa).
  - CRUD de atendimentos e despesas, com modais dedicados.
  - Bloqueio de retirada do caixa acima do saldo calculado.
  - Exportações: PDF (jsPDF + autotable via CDN) e imagem (html2canvas via CDN).
- Estoque:
  - CRUD local de produtos, categorias e locais.
  - Saldo por movimentos (entrada/saída/ajuste).
  - Alerts: baixo estoque, validade crítica/atenção.
  - Scanner (foto) com BarcodeDetector, compressão de imagem local e thumbnails.
  - Exportações CSV/XLSX (xlsx via CDN).
- Usuários e Configurações: listas e campos estáticos de exemplo.

Notas de arquitetura:
- O preview é desenhado e controlado por public/fallback-preview.js, injetado em index.html.
- CDN: jsPDF/autotable, html2canvas e xlsx são carregados sob demanda com cache em window.__loadedScripts.
- Sem Vercel: estamos em modo static_only=true; index.html ignora embedding de Vercel mesmo com ?vercel=1.
- Estilo: design leve com paleta “bella”, sombras suaves, componentes acessíveis e responsivos.

Integração futura (repo):
- Os metadados cosine-repo-* em index.html e o bloco “repo” nos manifests devem ser preenchidos quando o repositório for informado.
- Se o repositório for privado e for necessário push/sync automático, solicitar PAT (token) e implementar via API; caso contrário, gerar patch/ZIP.