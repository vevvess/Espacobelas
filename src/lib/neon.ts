import { neon, neonConfig } from "@neondatabase/serverless";
import { networkDetector } from "./networkDetection";
import { connectionMonitor } from "./connectionMonitor";
import {
  handleNetworkError,
  handleNetworkSuccess,
  emergencyOfflineMode,
} from "@/utils/emergencyOfflineMode";

// Configurar Neon para usar WebSocket seguro no browser (evita CORS/proxy)
neonConfig.useSecureWebSocket = true;
neonConfig.forceWebSocket = true;
// Usar o WebSocket nativo do navegador (com guarda para ambientes sem DOM)
if (typeof WebSocket !== "undefined") {
  neonConfig.webSocketConstructor = WebSocket;
}

// Connection string para o Neon Database
const DATABASE_URL =
  import.meta.env.VITE_DATABASE_URL ||
  "postgresql://neondb_owner:npg_XiMhD30dyHsj@ep-winter-term-a8165fiy-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";

// Validate connection string format
if (!DATABASE_URL.startsWith("postgresql://")) {
  console.error(
    "❌ Invalid DATABASE_URL format. Must start with postgresql://",
  );
}

// Validate and log connection info (without credentials)
const validateAndLogConnection = () => {
  const isEnvVar = !!import.meta.env.VITE_DATABASE_URL;
  const urlParts = DATABASE_URL.split("@");

  if (urlParts.length > 1) {
    const hostPart = urlParts[1];
    const endpoint = hostPart.split("/")[0];
    if (import.meta.env.MODE !== "production")
      console.log(
        `🔗 Neon connection: ${endpoint} ${isEnvVar ? "(from env)" : "(fallback)"}`,
      );

    // Check if using fallback credentials (security warning)
    if (!isEnvVar) {
      if (import.meta.env.MODE !== "production")
        console.warn(
          "⚠️ Using fallback DATABASE_URL! Set VITE_DATABASE_URL in environment for production.",
        );
    }

    return { endpoint, isEnvVar, valid: true };
  } else {
    console.error("❌ Invalid DATABASE_URL format!");
    return { endpoint: "unknown", isEnvVar, valid: false };
  }
};

const connectionInfo = validateAndLogConnection();

// Perform initial connectivity test (non-blocking)
if (typeof window !== "undefined") {
  setTimeout(async () => {
    try {
      if (import.meta.env.MODE !== "production")
        console.log("🔄 Performing initial connectivity test...");
      const result = await testConnection();
      if (result.success) {
        if (import.meta.env.MODE !== "production")
          console.log("✅ Initial connectivity test passed");
      } else {
        if (import.meta.env.MODE !== "production")
          console.warn("⚠️ Initial connectivity test failed:", result.error);
      }
    } catch (error) {
      if (import.meta.env.MODE !== "production")
        console.warn(
          "⚠️ Initial connectivity test error (will retry later):",
          error?.message || "Unknown error",
        );
    }
  }, 2000); // Wait 2 seconds after page load
}

// Cliente SQL para executar queries com configuração otimizada
const sqlClient = neon(DATABASE_URL, {
  fetchConnectionCache: true,
  fullResults: false,
  arrayMode: false,
});

// Circuit breaker para controlar tentativas de conexão
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold = 5; // Aumentar threshold para ser menos agressivo
  private readonly resetTimeout = 120000; // 2 minutos para reset

  isOpen(): boolean {
    if (this.failureCount >= this.failureThreshold) {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.reset();
        return false;
      }
      return true;
    }
    return false;
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (import.meta.env.MODE !== "production")
      console.warn(
        `Circuit breaker: ${this.failureCount}/${this.failureThreshold} falhas`,
      );
  }

  recordSuccess(): void {
    if (this.failureCount > 0) {
      if (import.meta.env.MODE !== "production")
        console.log("Circuit breaker: conexão restaurada");
      this.reset();
    }
  }

  private reset(): void {
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }

  public manualReset(): void {
    if (import.meta.env.MODE !== "production")
      console.log("🔄 Circuit breaker: manual reset");
    this.reset();
  }

  getStatus(): { isOpen: boolean; failureCount: number; timeToReset?: number } {
    const isOpen = this.isOpen();
    return {
      isOpen,
      failureCount: this.failureCount,
      timeToReset: isOpen
        ? Math.max(0, this.resetTimeout - (Date.now() - this.lastFailureTime))
        : undefined,
    };
  }
}

const circuitBreaker = new CircuitBreaker();

// Function to categorize fetch errors for better debugging
const categorizeFetchError = (errorMessage: string, error: any): string => {
  const msg = errorMessage.toLowerCase();

  if (msg.includes("failed to fetch")) {
    if (msg.includes("net::")) return "Erro de rede (NET)";
    if (msg.includes("cors")) return "Erro CORS";
    if (msg.includes("timeout")) return "Timeout de conexão";
    return "Falha na requisição (Failed to fetch)";
  }

  if (msg.includes("network")) return "Erro de rede";
  if (msg.includes("connection")) return "Erro de conexão";
  if (msg.includes("timeout")) return "Timeout";
  if (msg.includes("abort")) return "Requisição cancelada";

  return "Erro de fetch desconhecido";
};

// Emergency reset function for debugging
export const resetDatabaseSystems = () => {
  console.log("🔄 Resetting database emergency systems...");
  emergencyOfflineMode.reset();
  circuitBreaker.manualReset();
  console.log("✅ Database systems reset complete");
};

// System health check function
export const checkSystemHealth = async () => {
  const health = {
    network: networkDetector.getStatus(),
    offlineMode: emergencyOfflineMode.shouldBlockNetworkRequests(),
    circuitBreaker: circuitBreaker.getStatus(),
    connectionMonitor: connectionMonitor.getConnectionHealth(),
    timestamp: new Date().toISOString(),
  };

  console.log("🏥 System Health Check:", JSON.stringify(health, null, 2));
  return health;
};

// Make functions globally available for debugging
if (typeof window !== "undefined") {
  (window as any).resetDB = resetDatabaseSystems;
  (window as any).testDBConnection = async () => {
    console.log("🔍 Testando conexão com banco de dados...");
    try {
      const result = await testConnection();
      console.log("📊 Resultado do teste:", result);
      return result;
    } catch (error) {
      console.error("❌ Erro no teste de conexão:", {
        message: error?.message || error?.toString() || "Unknown error",
        type: error?.constructor?.name || typeof error,
      });
      return { success: false, error: error?.message || "Erro no teste" };
    }
  };
  (window as any).checkSystemHealth = checkSystemHealth;
  (window as any).diagnoseDatabaseIssues = async () => {
    console.log("🔍 Running comprehensive database diagnostics...");

    const diagnostics = {
      environment: {
        hasEnvVar: !!import.meta.env.VITE_DATABASE_URL,
        connectionValid: connectionInfo.valid,
        endpoint: connectionInfo.endpoint,
      },
      connectivity: await testConnection(),
      systemHealth: await checkSystemHealth(),
      timestamp: new Date().toISOString(),
    };

    console.log(
      "📋 Full Diagnostics Report:",
      JSON.stringify(diagnostics, null, 2),
    );

    // Provide recommendations
    if (!diagnostics.connectivity.success) {
      console.log("💡 Recommendations:");
      console.log("  1. Check internet connection");
      console.log("  2. Verify VITE_DATABASE_URL environment variable");
      console.log("  3. Try window.resetDB() to reset systems");
      console.log(
        "  4. Try window.emergencyDBRecovery() for aggressive recovery",
      );
      console.log(
        "  5. Check Neon database status at https://neon.tech/status",
      );
    }

    return diagnostics;
  };

  (window as any).emergencyDBRecovery = async () => {
    console.log("🚨 EMERGENCY DATABASE RECOVERY STARTING...");

    try {
      // Step 1: Reset all systems
      console.log("🔄 Step 1: Resetting all emergency systems...");
      emergencyOfflineMode.reset();
      circuitBreaker.manualReset();

      // Step 2: Wait for stabilization
      console.log("⏱��� Step 2: Waiting for system stabilization...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 3: Test with minimal config
      console.log("🔄 Step 3: Testing with minimal configuration...");
      const emergencyClient = neon(DATABASE_URL, {
        fetchConnectionCache: false,
      });
      const result =
        await emergencyClient`SELECT 1 as emergency_test, NOW() as timestamp`;

      console.log("✅ EMERGENCY RECOVERY SUCCESSFUL!", result[0]);
      return { success: true, result: result[0] };
    } catch (error) {
      console.error("❌ EMERGENCY RECOVERY FAILED:", error?.message);
      return { success: false, error: error?.message };
    }
  };

  console.log("🔧 Database Debug Commands Available:");
  console.log("  - window.resetDB() - Reset database systems");
  console.log("  - window.testDBConnection() - Test database connectivity");
  console.log("  - window.checkSystemHealth() - Check overall system health");
  console.log(
    "  - window.diagnoseDatabaseIssues() - Comprehensive diagnostics",
  );
  console.log(
    "  - window.emergencyDBRecovery() - Emergency recovery procedure",
  );
  console.log("");
  console.log('💡 If experiencing "Failed to fetch" errors, try:');
  console.log("   1. window.emergencyDBRecovery()");
  console.log("   2. If that fails, window.diagnoseDatabaseIssues()");
  console.log("   3. Check browser network tab for specific error details");
}

// Sistema de conectividade sempre online
import { alwaysOnlineConnector } from "./alwaysOnlineConnector";

// Ativa AlwaysOnline por padrão. Desative explicitamente com VITE_ENABLE_ALWAYS_ONLINE=0
const DISABLE_ALWAYS_ONLINE =
  (import.meta.env as any).VITE_ENABLE_ALWAYS_ONLINE === "0";

// Backoff durável para AlwaysOnline após falhas recorrentes
let aoBackoffUntil = 0;
let aoFailureCount = 0;

// Wrapper principal - sempre tentar conexão online
export const sql = async (strings: TemplateStringsArray, ...values: any[]) => {
  // Se desativado por flag ou em backoff, usar diretamente o caminho estável
  if (DISABLE_ALWAYS_ONLINE || Date.now() < aoBackoffUntil) {
    if (!DISABLE_ALWAYS_ONLINE && import.meta.env.MODE !== "production") {
      const secs = Math.ceil((aoBackoffUntil - Date.now()) / 1000);
      if (secs > 0)
        console.warn(`⛔ AlwaysOnline em backoff. Pulando por ${secs}s`);
    }
    return sqlLegacy(strings, ...values);
  }

  try {
    // Usar o sistema sempre online como prioridade
    const result = await alwaysOnlineConnector.sql(strings, ...values);

    // Resetar estado de falhas do AlwaysOnline
    aoFailureCount = 0;
    aoBackoffUntil = 0;

    // Atualizar sistemas legados em caso de sucesso
    circuitBreaker.recordSuccess();
    handleNetworkSuccess();
    connectionMonitor.addEvent(
      "success",
      "Conexão bem-sucedida via AlwaysOnline",
      1,
    );

    return result;
  } catch (error) {
    let errMsg = "";
    if (error instanceof Error) errMsg = error.message;
    else if (typeof error === "string") errMsg = error;
    else if (error && typeof (error as any).message === "string")
      errMsg = (error as any).message;
    else if (error && (error as any).isTrusted)
      errMsg = "evento de navegador (isTrusted)";
    else errMsg = "erro desconhecido";

    const isTimeout = (errMsg || "").toLowerCase().includes("timeout");
    const logFn = isTimeout ? console.warn : console.error;
    logFn("🚨 AlwaysOnline falhou, tentando fallback legado:", errMsg);

    // Registrar falha e ativar backoff se for timeout recorrente
    aoFailureCount += 1;
    if (isTimeout && aoFailureCount >= 2) {
      aoBackoffUntil = Date.now() + 5 * 60 * 1000; // 5 minutos
      console.warn(
        "🛑 Desativando AlwaysOnline por 5 minutos devido a timeouts recorrentes.",
      );
    }

    if (!networkDetector.getStatus()) {
      throw new Error("Sem conexão com o banco (offline)");
    }

    // Garantir que continuamos forçando WebSocket após falhas
    try {
      neonConfig.forceWebSocket = true as any;
    } catch {}
    return sqlLegacy(strings, ...values);
  }
};

// Sistema legado como fallback (renomeado)
const sqlLegacy = async (strings: TemplateStringsArray, ...values: any[]) => {
  const circuitStatus = circuitBreaker.getStatus();
  if (circuitStatus.isOpen) {
    const timeToReset = circuitStatus.timeToReset
      ? Math.ceil(circuitStatus.timeToReset / 1000)
      : 0;
    throw new Error(
      `Banco de dados temporariamente indisponível. Tentativa em ${timeToReset}s.`,
    );
  }

  // Sempre manter WebSocket forçado; nunca alternar para fetch
  const attempts = [
    { cache: true, timeout: 9000 },
    { cache: false, timeout: 12000 },
    { cache: false, timeout: 15000 }, // tentativa extra mais longa
  ];

  let lastError: any = null;

  for (let i = 0; i < attempts.length; i++) {
    const s = attempts[i];
    try {
      const client = neon(DATABASE_URL, {
        fetchConnectionCache: s.cache,
        fullResults: false,
        arrayMode: false,
      });
      const result = await Promise.race([
        client(strings, ...values),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(`Timeout na conexão (${s.timeout}ms)`)),
            s.timeout,
          ),
        ),
      ]);

      circuitBreaker.recordSuccess();
      handleNetworkSuccess();
      connectionMonitor.addEvent(
        "success",
        `Conexão legada bem-sucedida (tentativa ${i + 1})`,
        i + 1,
      );
      return result;
    } catch (error: any) {
      lastError = error;
      connectionMonitor.addEvent("error", error?.message || "erro", i + 1);
      if (i < attempts.length - 1) await new Promise((r) => setTimeout(r, 500));
    }
  }

  circuitBreaker.recordFailure();
  const raw = lastError?.message || "Falha de conexão (fallback)";
  try {
    handleNetworkError(lastError instanceof Error ? lastError : new Error(raw));
  } catch {}
  const friendly = (raw || "").includes("Failed to fetch")
    ? "Problemas de conectividade com o banco. Tentando novamente em instantes."
    : raw;
  throw new Error(friendly);
};

// Types para as entidades do banco de dados
export interface User {
  id: string;
  firebase_uid: string;
  email: string;
  name?: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export interface Cliente {
  id: string;
  user_id?: string; // Manter para compatibilidade
  user_simple_id?: string; // Nova coluna
  nome: string;
  telefone?: string;
  email?: string;
  data_nascimento?: Date;
  endereco?: string;
  observacoes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Servico {
  id: string;
  user_id?: string; // Manter para compatibilidade
  user_simple_id?: string; // Nova coluna
  nome: string;
  descricao?: string;
  preco: number;
  duracao_minutos: number;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AgendamentoServico {
  id: string;
  agendamento_id: string;
  servico_id: string;
  funcionario_id?: string;
  preco: number;
  created_at: Date;
  // Dados relacionados
  servico?: Servico;
  funcionario?: {
    id: string;
    nome: string;
    username: string;
  };
}

export interface AgendamentoPagamento {
  id: string;
  agendamento_id: string;
  forma_pagamento: string;
  valor: number;
  observacoes?: string;
  created_at: Date;
}

export interface Agendamento {
  id: string;
  user_id?: string; // Manter para compatibilidade
  user_simple_id?: string; // Nova coluna
  cliente_id: string;
  data_hora: Date;
  status: string;
  observacoes?: string;
  valor_total?: number;
  created_at: Date;
  updated_at: Date;
  // Dados relacionados (joins)
  cliente?: Cliente;
  servicos?: AgendamentoServico[];
  pagamentos?: AgendamentoPagamento[];
}

export interface Transacao {
  id: string;
  user_id?: string; // Manter para compatibilidade
  user_simple_id?: string; // Nova coluna
  agendamento_id?: string;
  tipo: string;
  valor: number;
  descricao?: string;
  data_transacao: Date;
  created_at: Date;
  // Dados relacionados
  agendamento?: Agendamento;
}

// Helper para queries de teste (desenvolvimento)
export async function testConnection(): Promise<{
  success: boolean;
  error?: string;
  details?: any;
  circuitBreakerStatus?: any;
}> {
  try {
    console.log("🔍 Testando conexão com o banco de dados...");
    console.log("🔗 Endpoint:", DATABASE_URL.replace(/:[^:@]*@/, ":***@"));

    const startTime = Date.now();

    // Test with direct Neon client to avoid wrapper recursion
    const emergencyClient = neon(DATABASE_URL, { fetchConnectionCache: false });
    const result =
      await emergencyClient`SELECT 1 as test, NOW() as current_time, version() as pg_version`;

    const responseTime = Date.now() - startTime;
    console.log(
      `✅ Teste de conexão bem-sucedido em ${responseTime}ms:`,
      result[0],
    );

    return {
      success: result.length > 0,
      details: {
        ...result[0],
        responseTimeMs: responseTime,
        connectionCached: result.length > 0,
      },
      circuitBreakerStatus: circuitBreaker.getStatus(),
      connectionInfo: {
        responseTime: `${responseTime}ms`,
        endpoint: DATABASE_URL.split("@")[1]?.split("/")[0] || "unknown",
      },
    };
  } catch (error: any) {
    console.error("Erro detalhado ao testar conexão:", {
      message: error.message || "Unknown error",
      code: error.code || "No code",
      name: error.name || "Unknown error type",
      stack:
        typeof error.stack === "string"
          ? error.stack.split("\n")[0]
          : "No stack available",
    });

    return {
      success: false,
      error: error.message || "Erro desconhecido",
      details: {
        message: error.message || "Unknown error",
        type: error.constructor?.name || typeof error,
        code: error.code || "No code",
      },
      circuitBreakerStatus: circuitBreaker.getStatus(),
    };
  }
}

// Helper para obter status do circuit breaker
export function getCircuitBreakerStatus() {
  return circuitBreaker.getStatus();
}

// Helper para inserir/atualizar com timestamp automático
export function addTimestamps(data: Record<string, any>, isUpdate = false) {
  const now = new Date().toISOString();
  if (!isUpdate) {
    data.created_at = now;
  }
  data.updated_at = now;
  return data;
}
