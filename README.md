# App - Guia Rápido de Desenvolvimento

## Como reabrir este app no Cosine

- Meta flag no HTML: `cosine-app-id=bella-app-v1`
- Manifesto público: `/cosine-manifest.json`
- Sentinela no código: `// COSINE_APP_SENTINEL: BELLA-APP-V1 (Estoque + Caixa + UI nova)`
- Preview de referência (Vercel): https://espaco-five.vercel.app

Como usar em um chat novo:
- “Procure por cosine-app-id=bella-app-v1. Abra o preview do app e continue a estruturar Estoque/Caixa.”
- Ou: “Carregue o app cujo manifest está em /cosine-manifest.json.”
- Ou: “Localize ‘COSINE_APP_SENTINEL: BELLA-APP-V1’ no repositório e abra o preview.”

Este repositório é um app React + Vite + TypeScript com Tailwind, React Router e React Query. Já está configurado para rodar em ambiente local e em produção (Vercel). Abaixo estão os passos para “abrir o app” e começar a editar.

## Requisitos

- Node.js 18+ (recomendado Node 20 LTS)
- npm 9+ (ou pnpm/yarn se preferir)
- Um editor à sua escolha (VS Code recomendado)

## Primeiros passos

1) Instale as dependências:
   - npm install

2) Configure as variáveis de ambiente:
   - Copie `.env.example` para `.env`
   - Preencha pelo menos `VITE_DATABASE_URL` com sua string do Neon (ou use a já presente em `.env` se ela estiver válida)

3) Rode o servidor de desenvolvimento:
   - npm run dev
   - A aplicação sobe por padrão em http://localhost:8080

Se preferir, você também pode usar:
   - npm start  (atalho para o dev)
   - npm run preview (após build) para testar o build localmente em http://localhost:8080

## Build e preview de produção

- Gerar build:
  - npm run build
- Servir o build para conferir (usa o Vite preview):
  - npm run preview
- Diretório de saída: `dist/`

## Deploy (Vercel)

O projeto já traz `vercel.json` preparado:
- buildCommand: `npm run build`
- outputDirectory: `dist`
- rewrites para SPA (React Router) com exceção de `/api/**` (funções serverless)

Passos:
1) Configure as variáveis no painel da Vercel (VITE_DATABASE_URL, etc.).
2) Faça o deploy pelo Git ou via CLI.

### Integração OAuth com Notion (real)
As rotas serverless para conectar com o Notion já estão incluídas em `api/notion/*`.

Variáveis necessárias (defina no Vercel):
- `NOTION_CLIENT_ID`
- `NOTION_CLIENT_SECRET`
- `NOTION_REDIRECT_URI` (opcional; se vazio, será inferido como `https://<seu-dominio>/api/notion/callback`)

No painel da integração do Notion (https://www.notion.so/my-integrations):
- Crie/edite sua integração “Public”.
- Cadastre o Redirect URI exatamente como `https://<seu-dominio>/api/notion/callback`.

Fluxo de uso no app (Clientes › seção “Conectar ao Notion”):
1) Clique em “Conectar” e autorize no Notion.
2) Escolha a base (database) que contém seus clientes.
3) Mapeie os campos (Nome, Telefone, Aniversário).
4) Pré-visualize e importe/atualize os clientes no app.

## Observações importantes de desenvolvimento

- Portas e Vite:
  - O Vite está configurado para rodar na porta 8080 (vite.config.ts). Altere se desejar.
- Login simples de debug:
  - Em `src/main.tsx` existe um trecho que força o login de um usuário admin em ambiente local se não houver usuário no `localStorage`. Isso facilita abrir o app sem fluxo de Auth externo. Comente/remova se não quiser esse comportamento.
- Aliases:
  - O alias `@` aponta para `./src` (vite.config.ts + tsconfig.json).
- Estilos:
  - Tailwind configurado (tailwind.config.ts), com tema de cores “bella” e animações úteis.

## Scripts disponíveis

- Desenvolvimento:
  - npm run dev  (ou npm start)
- Build/Preview:
  - npm run build
  - npm run preview
- Qualidade:
  - npm run typecheck
  - npm run format.fix
- Prisma (opcional, se você estiver usando um backend com Prisma):
  - npm run db:generate
  - npm run db:migrate
  - npm run db:seed
  - npm run db:studio
  - npm run db:reset

Obs.: A aplicação cliente pode se conectar diretamente ao Neon (serverless) via libs já presentes. O uso do Prisma faz sentido quando há um backend Node para intermediar.

## Estrutura de pastas (resumo)

- src/
  - App.tsx, main.tsx, index.css
  - components/, pages/, hooks/, lib/, services/, contexts/, utils/
- public/
- prisma/ (schema.prisma)
- vite.config.ts, tailwind.config.ts
- vercel.json

## Próximos passos sugeridos

- Me dizer se você quer:
  - Configuração de Docker/devcontainer para desenvolvimento “1‑click”
  - Integração com GitHub Codespaces ou Gitpod
  - Publicação de um preview automático (posso configurar pipeline)
  - Melhorias específicas de UI/UX, performance, ou arquitetura (me diga o foco)

Se preferir, posso também “refazer” partes do app (refatoração guiada) — por exemplo: organização de rotas, split de bundles, melhorias de acessibilidade, padronização de componentes, testes, etc. É só dizer o que priorizar.