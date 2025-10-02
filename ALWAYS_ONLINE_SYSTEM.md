# Sistema Sempre Online

Este documento descreve a implementação do sistema sempre online que garante conectividade contínua e atualizações em tempo real para múltiplos usuários.

## Arquitetura

### 1. Always Online Connector (`src/lib/alwaysOnlineConnector.ts`)

**Objetivo**: Manter conectividade sempre ativa com o banco de dados Neon.

**Características**:
- Reconexão automática em caso de falhas
- Sistema de fila para queries pendentes
- Múltiplas estratégias de conexão (cliente principal + emergencial)
- Health check contínuo a cada 30 segundos
- Recovery automático após falhas

**Uso**:
```typescript
import { alwaysOnlineConnector, sql } from '@/lib/alwaysOnlineConnector';

// Executar query
const result = await sql`SELECT * FROM agendamentos WHERE user_id = ${userId}`;

// Monitorar status
const unsubscribe = alwaysOnlineConnector.onConnectionChange((connected) => {
  console.log('Conectividade:', connected);
});
```

### 2. Real Time Updater (`src/lib/realTimeUpdater.ts`)

**Objetivo**: Atualizações em tempo real com polling inteligente.

**Características**:
- Polling configurável por tipo de dados:
  - Agendamentos: 5 segundos (crítico)
  - Transações: 10 segundos
  - Dashboard: 15 segundos
  - Clientes/Serviços: 30 segundos
- Detecção automática de mudanças (comparação JSON)
- Notificação apenas quando há alterações
- Sistema de subscribers/listeners

**Uso**:
```typescript
import { useRealTimeData } from '@/lib/realTimeUpdater';

const { data, error, isLoading, refresh } = useRealTimeData(
  'agendamentos',
  () => getAgendamentos(userId),
  userId,
  { interval: 5000, enabled: true }
);
```

### 3. Smart Cache (`src/lib/smartCache.ts`)

**Objetivo**: Cache inteligente com invalidação automática.

**Características**:
- TTL configurável por tipo de dados
- Sistema de dependências e invalidação em cascata
- Regras de invalidação automática:
  - Agendamentos → invalidar dashboard/stats
  - Clientes → invalidar agendamentos (joins)
  - Serviços → invalidar agendamentos
- Limpeza automática de cache expirado
- Pré-carregamento de dados críticos

**Uso**:
```typescript
import { withCache, invalidateAfterOperation } from '@/lib/smartCache';

// Query com cache
const agendamentos = await withCache(
  `agendamentos_${userId}`,
  () => getAgendamentos(userId),
  { type: 'agendamentos', ttl: 30000 }
);

// Invalidar após operação
await createAgendamento(data);
invalidateAfterOperation('create', 'agendamentos', userId);
```

## Hooks React

### 1. useAgendamentosRealTime

Hook principal para agendamentos com:
- Updates otimistas (UI responsiva)
- Polling em tempo real
- Fallback em caso de erro
- Cache automático

```typescript
const {
  agendamentos,
  loading,
  error,
  createAgendamento,
  updateAgendamento,
  deleteAgendamento,
  refresh
} = useAgendamentosRealTime(dataInicio, dataFim);
```

### 2. useConnectionStatus

Monitoramento de conectividade:

```typescript
const {
  isConnected,
  retryAttempts,
  lastSuccessfulPing,
  pendingQueries,
  forceHealthCheck
} = useConnectionStatus();
```

## Componentes

### 1. AlwaysOnlineStatus

Indicador visual de conectividade:

```typescript
import { AlwaysOnlineStatus, AlwaysOnlineIndicator } from '@/components/AlwaysOnlineStatus';

// Indicador completo
<AlwaysOnlineStatus showDetails={true} />

// Indicador compacto
<AlwaysOnlineIndicator />
```

## Configuração

### 1. Intervalos de Polling

```typescript
// src/lib/realTimeUpdater.ts
private defaultIntervals = {
  agendamentos: 5000,    // 5 segundos - crítico
  clientes: 30000,       // 30 segundos
  servicos: 30000,       // 30 segundos  
  transacoes: 10000,     // 10 segundos
  dashboard: 15000       // 15 segundos
};
```

### 2. TTL do Cache

```typescript
// src/lib/smartCache.ts
private defaultTTL = {
  agendamentos: 30000,      // 30 segundos
  clientes: 300000,         // 5 minutos
  servicos: 300000,         // 5 minutos
  transacoes: 60000,        // 1 minuto
  dashboard: 60000,         // 1 minuto
  default: 120000           // 2 minutos
};
```

## Monitoramento e Debug

### Comandos Debug Disponíveis

```javascript
// Always Online Connector
window.alwaysOnlineConnector.getConnectionStatus()
window.alwaysOnlineConnector.forceHealthCheck()

// Real Time Updater  
window.realTimeUpdater.getPollingStatus()
window.realTimeUpdater.stopAllPolling()

// Smart Cache
window.smartCache.getStats()
window.smartCache.clear()
window.smartCache.getKeys()
```

### Logs de Sistema

O sistema gera logs detalhados:
- `🔄` Reconexões e tentativas
- `✅` Sucessos e confirmações
- `❌` Erros e falhas
- `📡` Polling e atualizações
- `💾` Cache hits/misses
- `🗑️` Invalidações

## Tratamento de Erros

### 1. Falhas de Conectividade

- Circuit breaker para evitar spam de tentativas
- Múltiplas estratégias de conexão
- Recovery automático
- Fallback para sistema legado

### 2. Updates Otimistas

- Aplicação imediata na UI
- Reversão em caso de erro
- Sincronização com dados reais
- Notificações de sucesso/erro

### 3. Cache Failures

- TTL para expiração automática
- Invalidação em cascata
- Fallback para queries diretas
- Limpeza periódica

## Migração

Para migrar componentes existentes:

1. **Substituir hooks antigos**:
```typescript
// Antes
import { useAgendamentosRealTimeOptimized } from './hooks/useAgendamentosRealTimeOptimized';

// Depois  
import { useAgendamentosRealTime } from './hooks/useAgendamentosRealTime';
```

2. **Atualizar queries**:
```typescript
// Antes
import { sql } from '@/lib/neon';

// Depois
import { sql } from '@/lib/alwaysOnlineConnector';
```

3. **Adicionar indicadores**:
```typescript
import { AlwaysOnlineIndicator } from '@/components/AlwaysOnlineStatus';

// No header ou footer
<AlwaysOnlineIndicator />
```

## Performance

### Benchmarks Esperados

- **Conectividade**: < 3s para reconexão
- **Polling**: 5s para agendamentos críticos
- **Cache Hit Rate**: > 80% para dados frequentes
- **UI Responsividade**: Updates otimistas instantâneos

### Otimizações

1. **Batch Operations**: Agrupar múltiplas queries
2. **Selective Polling**: Pausar quando aba inativa
3. **Smart Invalidation**: Invalidar apenas dados relacionados
4. **Connection Pooling**: Reutilizar conexões ativas

## Troubleshooting

### Problemas Comuns

1. **"Failed to fetch" persistente**:
   - Verificar `window.alwaysOnlineConnector.forceHealthCheck()`
   - Checar variável `VITE_DATABASE_URL`
   - Confirmar status do Neon em https://neon.tech/status

2. **Dados desatualizados**:
   - Verificar intervalos de polling
   - Checar invalidação de cache
   - Forçar refresh manual

3. **Performance lenta**:
   - Reduzir intervalos de polling
   - Aumentar TTL do cache
   - Verificar size dos dados retornados

### Logs de Debug

Para debug detalhado, ativar no console:

```javascript
// Conectividade
window.alwaysOnlineConnector.getConnectionStatus();

// Status do polling
window.realTimeUpdater.getPollingStatus();

// Estatísticas do cache
window.smartCache.getStats();
```
