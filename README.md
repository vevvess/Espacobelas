# App - Guia Rápido de Desenvolvimento

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
- rewrites para SPA (React Router)

Passos:
1) Configure as variáveis no painel da Vercel (VITE_DATABASE_URL, etc.).
2) Faça o deploy pelo Git ou via CLI.

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