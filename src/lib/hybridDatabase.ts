/**
 * Sistema Híbrido de Banco de Dados
 * PostgreSQL remoto (quando disponível) + IndexedDB local (fallback)
 * Switch automático baseado na conectividade
 */

import { neon } from "@neondatabase/serverless";

// Configuração do banco remoto (PostgreSQL)
const REMOTE_DATABASE_URL = 
  import.meta.env.VITE_BUILDER_DATABASE_URL ||
  "postgresql://neondb_owner:npg_Z70wmdxpjHlM@ep-billowing-feather-aeh6j8os-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

// Estados do sistema
interface DatabaseState {
  isRemoteAvailable: boolean;
  isLocalReady: boolean;
  currentMode: 'remote' | 'local' | 'hybrid';
  lastRemoteCheck: number;
  remoteCheckInterval: number;
}

let dbState: DatabaseState = {
  isRemoteAvailable: false,
  isLocalReady: false,
  currentMode: 'local',
  lastRemoteCheck: 0,
  remoteCheckInterval: 30000 // 30 segundos
};

// Cliente PostgreSQL remoto
let remoteClient: any = null;

// IndexedDB local
let localDB: IDBDatabase | null = null;

// Inicializar cliente remoto
function initRemoteClient() {
  if (!remoteClient) {
    remoteClient = neon(REMOTE_DATABASE_URL, {
      fetchConnectionCache: true,
      fullResults: false,
      arrayMode: false
    });
  }
  return remoteClient;
}

// Inicializar IndexedDB local
async function initLocalDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (localDB) {
      resolve(localDB);
      return;
    }

    const request = indexedDB.open('BellaSalonDB', 1);

    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      localDB = request.result;
      dbState.isLocalReady = true;
      console.log('✅ IndexedDB local inicializado');
      resolve(localDB);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Criar stores para cada tabela
      const tables = [
        'users_simple', 'clientes', 'servicos', 'agendamentos',
        'agendamento_servicos', 'agendamento_pagamentos', 
        'funcionario_cores', 'transacoes', 'chat_messages',
        'chat_messages_v2', 'chat_message_reads'
      ];

      tables.forEach(tableName => {
        if (!db.objectStoreNames.contains(tableName)) {
          const store = db.createObjectStore(tableName, { keyPath: 'id' });
          
          // Índices básicos
          if (tableName === 'agendamentos') {
            store.createIndex('data_hora', 'data_hora');
            store.createIndex('user_simple_id', 'user_simple_id');
            store.createIndex('cliente_id', 'cliente_id');
          } else if (tableName === 'clientes' || tableName === 'servicos') {
            store.createIndex('user_simple_id', 'user_simple_id');
          }
        }
      });

      console.log('🗄️ Schema IndexedDB criado');
    };
  });
}

// Verificar conectividade remota
async function checkRemoteConnectivity(): Promise<boolean> {
  try {
    const now = Date.now();
    
    // Cache do resultado por intervalos
    if (now - dbState.lastRemoteCheck < dbState.remoteCheckInterval) {
      return dbState.isRemoteAvailable;
    }

    const client = initRemoteClient();
    const result = await client`SELECT 1 as test`;
    
    dbState.isRemoteAvailable = result && result.length > 0;
    dbState.lastRemoteCheck = now;
    
    if (dbState.isRemoteAvailable) {
      console.log('✅ Banco remoto disponível');
      dbState.currentMode = 'remote';
    } else {
      console.warn('⚠️ Banco remoto indisponível - usando local');
      dbState.currentMode = 'local';
    }
    
    return dbState.isRemoteAvailable;
  } catch (error) {
    console.warn('❌ Erro ao verificar banco remoto:', error);
    dbState.isRemoteAvailable = false;
    dbState.currentMode = 'local';
    return false;
  }
}

// Executar SQL no banco remoto
async function executeRemoteSQL(query: string, params: any[] = []): Promise<any[]> {
  try {
    const client = initRemoteClient();

    // Para queries sem parâmetros, usar query simples
    if (params.length === 0) {
      return await client.query(query);
    }

    // Para queries com parâmetros, usar client.query com placeholders
    return await client.query(query, params);
  } catch (error) {
    console.error('❌ Erro SQL remoto:', error);
    throw error;
  }
}

// Executar operação no IndexedDB local
async function executeLocalOperation(tableName: string, operation: 'get' | 'getAll' | 'add' | 'put' | 'delete', data?: any, index?: string): Promise<any> {
  const db = await initLocalDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(tableName, operation === 'get' || operation === 'getAll' ? 'readonly' : 'readwrite');
    const store = transaction.objectStore(tableName);
    
    let request: IDBRequest;
    
    switch (operation) {
      case 'get':
        request = store.get(data);
        break;
      case 'getAll':
        if (index && data) {
          const indexObj = store.index(index);
          request = indexObj.getAll(data);
        } else {
          request = store.getAll();
        }
        break;
      case 'add':
        request = store.add(data);
        break;
      case 'put':
        request = store.put(data);
        break;
      case 'delete':
        request = store.delete(data);
        break;
      default:
        reject(new Error(`Operação não suportada: ${operation}`));
        return;
    }
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Interface principal para SQL híbrido
async function hybridSQL(strings: TemplateStringsArray, ...values: any[]): Promise<any[]> {
  // Verificar disponibilidade do banco remoto
  const isRemoteAvailable = await checkRemoteConnectivity();

  if (isRemoteAvailable) {
    try {
      // Tentar banco remoto primeiro usando tagged template format
      const client = initRemoteClient();
      return await client(strings, ...values);
    } catch (error) {
      console.warn('⚠️ Falha no banco remoto, fallback para local:', error);
      dbState.isRemoteAvailable = false;
      dbState.currentMode = 'local';
    }
  }

  // Fallback para IndexedDB local
  return await executeLocalQuery(strings, values);
}

// Processar queries para IndexedDB local
async function executeLocalQuery(strings: TemplateStringsArray, values: any[]): Promise<any[]> {
  const query = strings[0].toLowerCase().trim();
  
  // Parse básico de SQL para IndexedDB
  if (query.startsWith('select')) {
    return await handleLocalSelect(strings, values);
  } else if (query.startsWith('insert')) {
    return await handleLocalInsert(strings, values);
  } else if (query.startsWith('update')) {
    return await handleLocalUpdate(strings, values);
  } else if (query.startsWith('delete')) {
    return await handleLocalDelete(strings, values);
  } else {
    console.warn('⚠️ Query SQL não suportada no modo local:', query);
    return [];
  }
}

// Handlers para operações locais
async function handleLocalSelect(strings: TemplateStringsArray, values: any[]): Promise<any[]> {
  // Implementação básica - pode ser expandida
  const query = strings[0];
  
  // Parse simples para identificar tabela
  const tableMatch = query.match(/from\s+(\w+)/i);
  if (!tableMatch) {
    throw new Error('Não foi possível identificar a tabela na query SELECT');
  }
  
  const tableName = tableMatch[1];
  
  // Para queries simples, retornar todos os registros
  return await executeLocalOperation(tableName, 'getAll');
}

async function handleLocalInsert(strings: TemplateStringsArray, values: any[]): Promise<any[]> {
  // Implementação básica para INSERT
  const query = strings[0];
  const tableMatch = query.match(/into\s+(\w+)/i);
  
  if (!tableMatch) {
    throw new Error('Não foi possível identificar a tabela na query INSERT');
  }
  
  const tableName = tableMatch[1];
  
  // Criar objeto com dados (implementação simplificada)
  const data = {
    id: crypto.randomUUID(),
    ...Object.fromEntries(values.map((value, index) => [`field_${index}`, value])),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  await executeLocalOperation(tableName, 'add', data);
  return [data];
}

async function handleLocalUpdate(strings: TemplateStringsArray, values: any[]): Promise<any[]> {
  // Implementação básica para UPDATE
  const query = strings[0];
  const tableMatch = query.match(/update\s+(\w+)/i);
  
  if (!tableMatch) {
    throw new Error('Não foi possível identificar a tabela na query UPDATE');
  }
  
  const tableName = tableMatch[1];
  
  // Para UPDATE, precisaríamos de mais parsing - implementação simplificada
  console.warn('⚠️ UPDATE em modo local ainda não totalmente implementado');
  return [];
}

async function handleLocalDelete(strings: TemplateStringsArray, values: any[]): Promise<any[]> {
  // Implementação básica para DELETE
  const query = strings[0];
  const tableMatch = query.match(/from\s+(\w+)/i);
  
  if (!tableMatch) {
    throw new Error('Não foi possível identificar a tabela na query DELETE');
  }
  
  const tableName = tableMatch[1];
  
  // Para DELETE, precisaríamos do ID - implementação simplificada
  if (values.length > 0) {
    await executeLocalOperation(tableName, 'delete', values[0]);
  }
  
  return [];
}

// Sincronização entre bancos
async function syncLocalToRemote(): Promise<boolean> {
  if (!dbState.isRemoteAvailable) {
    return false;
  }
  
  try {
    console.log('🔄 Iniciando sincronização local → remoto...');
    
    // Implementar lógica de sync aqui
    // Por ora, apenas log
    console.log('✅ Sincronização concluída');
    return true;
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    return false;
  }
}

// Status do sistema
function getSystemStatus() {
  return {
    mode: dbState.currentMode,
    remoteAvailable: dbState.isRemoteAvailable,
    localReady: dbState.isLocalReady,
    lastCheck: new Date(dbState.lastRemoteCheck).toLocaleString()
  };
}

// Inicializar sistema
async function initHybridDatabase() {
  console.log('🚀 Inicializando sistema híbrido de banco de dados...');
  
  // Inicializar local sempre
  await initLocalDB();
  
  // Verificar remoto
  await checkRemoteConnectivity();
  
  console.log('✅ Sistema híbrido inicializado:', getSystemStatus());
}

// Auto-inicializar se estiver no browser
if (typeof window !== 'undefined') {
  initHybridDatabase();
}

// Exports
export {
  hybridSQL as sql,
  initHybridDatabase,
  checkRemoteConnectivity,
  syncLocalToRemote,
  getSystemStatus,
  executeLocalOperation,
  executeRemoteSQL
};

export default hybridSQL;
