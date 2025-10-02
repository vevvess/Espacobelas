# Integração Neon Database - Bella's Salon Management

Este documento descreve como o sistema foi integrado com o Neon PostgreSQL para persistência de dados em tempo real.

## 🎯 Funcionalidades Implementadas

### ✅ Banco de Dados Sincronizado

- **Clientes**: Cadastro completo com informações pessoais
- **Serviços**: Catálogo de serviços com preços e durações
- **Agendamentos**: Sistema completo de agendamento com vinculação cliente-serviço
- **Transações**: Controle financeiro de receitas e despesas
- **Usuários**: Integração com autenticação Firebase

### ✅ Funcionalidades em Tempo Real

- Dados sincronizados entre dispositivos
- Atualizações automáticas do dashboard
- Persistência garantida na nuvem
- Backup automático no Neon

## 📊 Estrutura do Banco de Dados

### Tabelas Criadas:

1. **users** - Usuários do sistema

   - `id` (UUID) - Chave primária
   - `firebase_uid` (VARCHAR) - ID do Firebase Auth
   - `email` (VARCHAR) - Email do usuário
   - `name` (VARCHAR) - Nome do usuário
   - `role` (VARCHAR) - Papel no sistema
   - `created_at`, `updated_at` - Timestamps

2. **clientes** - Cadastro de clientes

   - `id` (UUID) - Chave primária
   - `user_id` (UUID) - Referência ao usuário
   - `nome` (VARCHAR) - Nome completo
   - `telefone` (VARCHAR) - Telefone de contato
   - `email` (VARCHAR) - Email (opcional)
   - `data_nascimento` (DATE) - Data de nascimento
   - `endereco` (TEXT) - Endereço completo
   - `observacoes` (TEXT) - Notas especiais
   - `created_at`, `updated_at` - Timestamps

3. **servicos** - Catálogo de serviços

   - `id` (UUID) - Chave primária
   - `user_id` (UUID) - Referência ao usuário
   - `nome` (VARCHAR) - Nome do serviço
   - `descricao` (TEXT) - Descrição detalhada
   - `preco` (DECIMAL) - Preço do serviço
   - `duracao_minutos` (INTEGER) - Duração em minutos
   - `ativo` (BOOLEAN) - Se o serviço está ativo
   - `created_at`, `updated_at` - Timestamps

4. **agendamentos** - Sistema de agendamentos

   - `id` (UUID) - Chave primária
   - `user_id` (UUID) - Referência ao usuário
   - `cliente_id` (UUID) - Referência ao cliente
   - `servico_id` (UUID) - Referência ao serviço
   - `data_hora` (TIMESTAMP) - Data e hora do agendamento
   - `status` (VARCHAR) - Status (agendado, confirmado, concluído, cancelado)
   - `observacoes` (TEXT) - Observações do agendamento
   - `valor` (DECIMAL) - Valor cobrado
   - `created_at`, `updated_at` - Timestamps

5. **transacoes** - Controle financeiro
   - `id` (UUID) - Chave primária
   - `user_id` (UUID) - Referência ao usuário
   - `agendamento_id` (UUID) - Referência ao agendamento (opcional)
   - `tipo` (VARCHAR) - Tipo (receita/despesa)
   - `valor` (DECIMAL) - Valor da transação
   - `descricao` (TEXT) - Descrição da transação
   - `data_transacao` (TIMESTAMP) - Data da transação
   - `created_at` - Timestamp de criação

## 🔧 Arquivos de Integração

### Configuração e Conexão

- `src/lib/neon.ts` - Configuração da conexão e tipos TypeScript
- `src/services/database.ts` - Funções CRUD para todas as entidades

### Hooks Personalizados

- `src/hooks/useClientes.ts` - Gestão de clientes
- `src/hooks/useServicos.ts` - Gestão de serviços
- `src/hooks/useAgendamentos.ts` - Gestão de agendamentos
- `src/hooks/useDashboard.ts` - Dados do dashboard e transações

### Páginas Integradas

- `src/pages/Dashboard.tsx` - Dashboard com dados reais
- `src/pages/Clientes.tsx` - Gestão de clientes integrada
- `src/contexts/AuthContext.tsx` - Integração auth + banco

## 🚀 Como Usar

### 1. Configuração de Ambiente

Copie `.env.example` para `.env.local` e configure:

```bash
cp .env.example .env.local
```

### 2. Variáveis de Ambiente

```env
# Neon Database
VITE_DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Desenvolvimento
VITE_USE_MOCK_AUTH=true
```

### 3. Instalação das Dependências

As dependências já estão incluídas no package.json:

- `@neondatabase/serverless` - Driver do Neon
- `drizzle-orm` - ORM TypeScript

### 4. Execução

```bash
npm run dev
```

## 📱 Funcionalidades Disponíveis

### Dashboard

- ✅ Estatísticas em tempo real
- ✅ Agendamentos do dia
- ✅ Próximos agendamentos
- ✅ Aniversariantes
- ✅ Receita mensal

### Gestão de Clientes

- ✅ Cadastro completo de clientes
- ✅ Busca por nome, telefone, email
- ✅ Edição e exclusão
- ✅ Controle de aniversários
- ✅ Histórico de agendamentos

### Sistema de Agendamentos

- ✅ Criar agendamentos vinculando cliente + serviço
- ✅ Controle de status
- ✅ Visualização por data
- ✅ Integração com transações

### Controle Financeiro

- ✅ Registrar receitas e despesas
- ✅ Relatórios mensais
- ✅ Integração com agendamentos
- ✅ Dashboard financeiro

## 🔐 Segurança

- ✅ Isolamento por usuário (todas as queries filtram por user_id)
- ✅ Validação de tipos TypeScript
- ✅ Tratamento de erros
- ✅ Conexão SSL com Neon
- ✅ Integração segura com Firebase Auth

## 📊 Informações do Projeto Neon

- **Nome**: Bellas Salon Management
- **ID**: bold-dawn-80829299
- **Branch**: main (br-tiny-glitter-a8pkg03x)
- **Database**: neondb
- **Região**: East US 2 (Azure)

## 🔄 Sincronização em Tempo Real

O sistema agora oferece:

1. **Persistência Garantida**: Todos os dados são salvos no Neon PostgreSQL
2. **Sincronização Cross-Device**: Acesse de qualquer dispositivo com dados atualizados
3. **Backup Automático**: Dados seguros na nuvem
4. **Performance**: Conexão serverless otimizada
5. **Escalabilidade**: Cresce conforme necessário

## 🆘 Suporte

Em caso de problemas:

1. Verifique as variáveis de ambiente
2. Confirme a conexão com o Neon
3. Verifique os logs do console
4. Teste a autenticação Firebase

A integração está completa e pronta para uso em produção! 🎉
