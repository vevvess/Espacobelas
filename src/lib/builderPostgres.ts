import { neon } from "@neondatabase/serverless";
import { neon } from "@neondatabase/serverless";
import { networkDetector } from "./networkDetection";
import { connectionMonitor } from "./connectionMonitor";
import { handleNetworkError, handleNetworkSuccess, emergencyOfflineMode } from '@/utils/emergencyOfflineMode';

// Connection string para o novo banco Builder PostgreSQL (Neon Migration)
const BUILDER_DATABASE_URL =
  import.meta.env.VITE_BUILDER_DATABASE_URL ||
  "postgresql://neondb_owner:npg_Z70wmdxpjHlM@ep-billowing-feather-aeh6j8os-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

// Validate connection string format
if (!BUILDER_DATABASE_URL.startsWith('postgresql://')) {
  console.error('❌ Invalid BUILDER_DATABASE_URL format. Must start with postgresql://');
}

// Validate and log connection info (without credentials)
const validateAndLogConnection = () => {
  const isEnvVar = !!import.meta.env.VITE_BUILDER_DATABASE_URL;
  const urlParts = BUILDER_DATABASE_URL.split('@');

  if (urlParts.length > 1) {
    const hostPart = urlParts[1];
    const endpoint = hostPart.split('/')[0];
    console.log(`🔗 Builder PostgreSQL connection: ${endpoint} ${isEnvVar ? '(from env)' : '(fallback)'}`);

    // Check if using fallback credentials (security warning)
    if (!isEnvVar) {
      console.warn('⚠️ Using fallback BUILDER_DATABASE_URL! Set VITE_BUILDER_DATABASE_URL in environment for production.');
    }

    return { endpoint, isEnvVar, valid: true };
  } else {
    console.error('❌ Invalid BUILDER_DATABASE_URL format!');
    return { endpoint: 'unknown', isEnvVar, valid: false };
  }
};

const connectionInfo = validateAndLogConnection();

// Perform initial connectivity test (non-blocking)
if (typeof window !== 'undefined') {
  setTimeout(async () => {
    try {
      console.log('🔄 Performing initial Builder PostgreSQL connectivity test...');
      const result = await testConnection();
      if (result.success) {
        console.log('✅ Initial Builder PostgreSQL connectivity test passed');
      } else {
        console.warn('⚠️ Initial Builder PostgreSQL connectivity test failed:', result.error);
      }
    } catch (error) {
      console.warn('⚠️ Initial Builder PostgreSQL connectivity test error (will retry later):',
        error?.message || 'Unknown error');
    }
  }, 2000); // Wait 2 seconds after page load
}

// Cliente SQL para executar queries com configuração otimizada
const sqlClient = neon(BUILDER_DATABASE_URL, {
  fetchConnectionCache: true,
  fullResults: false,
  arrayMode: false
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
    console.warn(
      `Builder PostgreSQL Circuit breaker: ${this.failureCount}/${this.failureThreshold} falhas`,
    );
  }

  recordSuccess(): void {
    if (this.failureCount > 0) {
      console.log("Builder PostgreSQL Circuit breaker: conexão restaurada");
      this.reset();
    }
  }

  private reset(): void {
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }
}

const circuitBreaker = new CircuitBreaker();

// Health check robusto com detalhes da resposta
async function healthCheck(): Promise<boolean> {
  if (circuitBreaker.isOpen()) {
    console.warn("⛔ Builder PostgreSQL Circuit breaker aberto - pulando health check");
    return false;
  }

  try {
    const start = Date.now();
    const result = await sqlClient`SELECT 1 as health_check, NOW() as server_time`;
    const elapsed = Date.now() - start;

    const isHealthy = result && result.length > 0 && result[0].health_check === 1;

    if (isHealthy) {
      console.log(`✅ Builder PostgreSQL Health check OK (${elapsed}ms)`);
      circuitBreaker.recordSuccess();
      handleNetworkSuccess();
      return true;
    } else {
      console.warn("⚠️ Builder PostgreSQL Health check retornou resultado inválido:", result);
      circuitBreaker.recordFailure();
      return false;
    }
  } catch (error: any) {
    const elapsed = Date.now();
    console.error(`�� Builder PostgreSQL Health check failed (${elapsed}ms):`, {
      message: error?.message || 'Unknown error',
      name: error?.name,
      code: error?.code,
      severity: error?.severity,
    });
    circuitBreaker.recordFailure();
    handleNetworkError(error);
    return false;
  }
}

// Test de conectividade simples
async function testConnection(): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    console.log('🔄 Testing Builder PostgreSQL connection...');
    const result = await sqlClient`SELECT version() as pg_version, current_database() as db_name, current_user as user_name`;
    
    if (result && result.length > 0) {
      const details = result[0];
      console.log('✅ Builder PostgreSQL Connection successful:', {
        database: details.db_name,
        user: details.user_name,
        version: details.pg_version?.substring(0, 50) + '...'
      });
      return { success: true, details };
    } else {
      return { success: false, error: 'No result returned' };
    }
  } catch (error: any) {
    console.error('❌ Builder PostgreSQL Connection test failed:', error);
    return { 
      success: false, 
      error: error?.message || 'Unknown error',
      details: {
        name: error?.name,
        code: error?.code,
        severity: error?.severity
      }
    };
  }
}

// Função para executar queries com retry automático
async function executeQuery<T = any>(
  query: string,
  params: any[] = [],
  retries = 3,
): Promise<T[]> {
  if (circuitBreaker.isOpen()) {
    throw new Error("Builder PostgreSQL Circuit breaker ativo - conexão temporariamente indisponível");
  }

  let lastError: any;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Builder PostgreSQL Executando query (tentativa ${attempt}/${retries})`);
      
      const result = await sqlClient.transaction(async (tx) => {
        // Usar template literal para query parametrizada
        return await tx(query as any, ...params);
      });

      circuitBreaker.recordSuccess();
      handleNetworkSuccess();
      return result as T[];
    } catch (error: any) {
      lastError = error;
      console.warn(`⚠️ Builder PostgreSQL Query failed on attempt ${attempt}:`, {
        message: error?.message,
        code: error?.code,
        severity: error?.severity,
      });

      if (attempt === retries) {
        circuitBreaker.recordFailure();
        handleNetworkError(error);
        break;
      }

      // Wait between retries (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`⏳ Builder PostgreSQL Aguardando ${delay}ms antes da próxima tentativa...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Função principal para queries SQL
const builderSql = async (strings: TemplateStringsArray, ...values: any[]): Promise<any[]> => {
  try {
    // Construir query com template literals
    let query = strings[0];
    for (let i = 0; i < values.length; i++) {
      query += `$${i + 1}${strings[i + 1]}`;
    }

    return await executeQuery(query, values);
  } catch (error: any) {
    console.error('❌ Builder PostgreSQL SQL execution failed:', {
      error: error?.message,
      code: error?.code,
      query: strings[0]?.substring(0, 100) + '...'
    });
    throw error;
  }
};

// Health monitoring com intervalo configurável
let healthMonitorInterval: NodeJS.Timeout;

function startHealthMonitoring(intervalMs = 30000) {
  if (healthMonitorInterval) {
    clearInterval(healthMonitorInterval);
  }
  
  healthMonitorInterval = setInterval(async () => {
    await healthCheck();
  }, intervalMs);
}

function stopHealthMonitoring() {
  if (healthMonitorInterval) {
    clearInterval(healthMonitorInterval);
  }
}

// Auto-start health monitoring se estivermos no browser
if (typeof window !== 'undefined') {
  startHealthMonitoring();
}

// Função para adicionar timestamps automaticamente
export function addTimestamps(data: any, isUpdate = false): any {
  const now = new Date().toISOString();
  
  if (isUpdate) {
    return {
      ...data,
      updated_at: now,
    };
  } else {
    return {
      ...data,
      created_at: now,
      updated_at: now,
    };
  }
}

// Types para as principais entidades
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
  user_id?: string;
  user_simple_id?: string;
  nome: string;
  telefone?: string;
  email?: string;
  data_nascimento?: Date;
  endereco?: string;
  observacoes?: string;
  tipo_cliente?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Servico {
  id: string;
  user_id?: string;
  user_simple_id?: string;
  nome: string;
  descricao?: string;
  preco: number;
  duracao_minutos?: number;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Agendamento {
  id: string;
  user_simple_id: string;
  cliente_id: string;
  servico_id: string;
  funcionario_id?: string;
  data_hora: Date;
  status: string;
  observacoes?: string;
  valor?: number;
  created_at: Date;
  updated_at: Date;
  cliente?: {
    nome: string;
    telefone?: string;
    tipo_cliente?: string;
  };
  servico?: {
    nome: string;
    preco: number;
    duracao_minutos?: number;
  };
  funcionario?: {
    nome: string;
    username: string;
  };
}

export interface Transacao {
  id: string;
  user_simple_id: string;
  agendamento_id?: string;
  tipo: string;
  valor: number;
  descricao?: string;
  data_transacao: Date;
  created_at: Date;
  agendamento?: {
    data_hora: Date;
    cliente: { nome: string };
    servico: { nome: string };
  };
}

// Exportar funcionalidades principais
export {
  builderSql,
  sqlClient,
  healthCheck,
  testConnection,
  executeQuery,
  startHealthMonitoring,
  stopHealthMonitoring,
  BUILDER_DATABASE_URL
};

export default builderSql;
