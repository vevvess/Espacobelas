import { generateUUID } from "../lib/uuid";

export interface UserSimple {
  id: string;
  username: string;
  password_hash: string;
  nome: string;
  is_admin: boolean;
  can_edit_all?: boolean; // Permite ao funcionário ter acesso total à agenda
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

// IndexedDB para usuários
let userDB: IDBDatabase | null = null;

// Função para hash simples da senha (em produção, use bcrypt)
function simpleHash(password: string): string {
  // Esta é uma implementação simples para desenvolvimento
  // Em produção, use uma biblioteca como bcrypt
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// Verificar se a senha corresponde ao hash
function verifyPassword(password: string, hash: string): boolean {
  return simpleHash(password) === hash;
}

// Inicializar IndexedDB para usuários
async function initUserDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (userDB) {
      resolve(userDB);
      return;
    }

    const request = indexedDB.open('BellaSalonUsers', 1);

    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      userDB = request.result;
      console.log('✅ IndexedDB de usuários inicializado');
      resolve(userDB);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('users')) {
        const store = db.createObjectStore('users', { keyPath: 'id' });
        store.createIndex('username', 'username', { unique: true });
        store.createIndex('ativo', 'ativo');
        console.log('🗄️ Schema de usuários criado');
      }
    };
  });
}

// Executar operação no IndexedDB de usuários
async function executeUserOperation(
  operation: 'get' | 'getAll' | 'add' | 'put' | 'delete' | 'getByIndex',
  data?: any,
  index?: string
): Promise<any> {
  const db = await initUserDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('users', operation === 'get' || operation === 'getAll' || operation === 'getByIndex' ? 'readonly' : 'readwrite');
    const store = transaction.objectStore('users');
    
    let request: IDBRequest;
    
    switch (operation) {
      case 'get':
        request = store.get(data);
        break;
      case 'getAll':
        request = store.getAll();
        break;
      case 'getByIndex':
        if (index && data) {
          const indexObj = store.index(index);
          request = indexObj.get(data);
        } else {
          reject(new Error('Index e data são obrigatórios para getByIndex'));
          return;
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

// Função para garantir que a migração can_edit_all seja executada
export async function ensureCanEditAllMigration(): Promise<void> {
  try {
    console.log("✅ Migração can_edit_all verificada (IndexedDB)");
    // Com IndexedDB, não há necessidade de migração
  } catch (error) {
    console.error("Erro na verificação da migração can_edit_all:", error);
  }
}

// Inicializar tabela de usuários se não existir
export async function initializeUsersTable(): Promise<void> {
  try {
    console.log("🔄 Inicializando sistema de usuários com IndexedDB...");
    
    await initUserDB();

    // Verificar se já existe usuário admin
    const adminExists = await executeUserOperation('getByIndex', 'Weslley', 'username');

    if (!adminExists) {
      // Criar usuário admin padrão
      const adminId = generateUUID();
      const adminPasswordHash = simpleHash("1808741");

      const adminUser: UserSimple = {
        id: adminId,
        username: 'Weslley',
        password_hash: adminPasswordHash,
        nome: 'Weslley Administrador',
        is_admin: true,
        can_edit_all: true,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      await executeUserOperation('add', adminUser);
      console.log("✅ Usuário admin criado com sucesso no IndexedDB");
    } else {
      console.log("✅ Usuário admin já existe no IndexedDB");
    }
  } catch (error) {
    console.error("❌ Erro ao inicializar tabela de usuários:", error);
    // Não propagar erro para permitir fallback de autenticação
    console.warn("Sistema funcionará com autenticação de fallback");
  }
}

// Criar novo usuário
export async function createUser(userData: {
  username: string;
  password: string;
  nome: string;
  is_admin: boolean;
  can_edit_all?: boolean;
  created_by: string;
}): Promise<UserSimple> {
  try {
    const id = generateUUID();
    const passwordHash = simpleHash(userData.password);

    const user: UserSimple = {
      id,
      username: userData.username,
      password_hash: passwordHash,
      nome: userData.nome,
      is_admin: userData.is_admin,
      can_edit_all: userData.can_edit_all || false,
      ativo: true,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: userData.created_by,
    };

    await executeUserOperation('add', user);
    return user;
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error);
    if (error.name === 'ConstraintError') {
      throw new Error("Nome de usuário já existe");
    }
    throw new Error("Erro ao criar usuário");
  }
}

// Autenticar usuário
export async function authenticateUser(
  username: string,
  password: string,
): Promise<UserSimple | null> {
  try {
    console.log("🔍 Tentando autenticar usuário no IndexedDB:", username);

    const user = await executeUserOperation('getByIndex', username, 'username');

    console.log(
      "Resultado da consulta:",
      user ? "Usuário encontrado" : "Usuário não encontrado",
    );

    if (!user) {
      console.log("❌ Usuário não encontrado no banco de dados");
      return null;
    }

    if (!user.ativo) {
      console.log("❌ Usuário inativo");
      return null;
    }

    console.log("🔑 Verificando senha para usuário:", user.username);

    if (!verifyPassword(password, user.password_hash)) {
      console.log("❌ Senha incorreta para usuário:", user.username);
      return null;
    }

    console.log("✅ Autenticação bem-sucedida para:", user.username);
    return {
      ...user,
      created_at: new Date(user.created_at),
      updated_at: new Date(user.updated_at),
    } as UserSimple;
  } catch (error) {
    console.error("❌ Erro ao autenticar usuário no IndexedDB:", error);
    throw error; // Propagar erro para que o contexto possa usar fallback
  }
}

// Listar todos os usuários
export async function getAllUsers(): Promise<UserSimple[]> {
  try {
    const users = await executeUserOperation('getAll');
    
    return users
      .map((user: any) => ({
        ...user,
        created_at: new Date(user.created_at),
        updated_at: new Date(user.updated_at),
      }))
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.error("❌ Erro ao listar usuários:", error);
    return [];
  }
}

// Atualizar usuário
export async function updateUser(
  userId: string,
  userData: Partial<{
    username: string;
    password: string;
    nome: string;
    is_admin: boolean;
    can_edit_all: boolean;
    ativo: boolean;
  }>,
): Promise<UserSimple> {
  try {
    console.log("🔄 UpdateUser chamado com:", { userId, userData });

    // Primeiro, buscar o usuário atual
    const currentUser = await executeUserOperation('get', userId);

    if (!currentUser) {
      throw new Error("Usuário não encontrado");
    }

    console.log("👤 Usuário atual:", currentUser);

    // Preparar dados para atualização
    const updatedUser: UserSimple = {
      ...currentUser,
      username: userData.username || currentUser.username,
      nome: userData.nome || currentUser.nome,
      is_admin: userData.is_admin !== undefined ? userData.is_admin : currentUser.is_admin,
      can_edit_all: userData.can_edit_all !== undefined ? userData.can_edit_all : currentUser.can_edit_all || false,
      ativo: userData.ativo !== undefined ? userData.ativo : currentUser.ativo,
      updated_at: new Date(),
    };

    // Adicionar senha se fornecida
    if (userData.password) {
      updatedUser.password_hash = simpleHash(userData.password);
    }

    console.log("📝 Dados para atualização:", updatedUser);

    // Executar atualização
    await executeUserOperation('put', updatedUser);

    const result = {
      ...updatedUser,
      created_at: new Date(updatedUser.created_at),
      updated_at: new Date(updatedUser.updated_at),
    } as UserSimple;

    console.log("✅ Usuário atualizado no userService:", result);

    return result;
  } catch (error: any) {
    console.error("❌ Erro ao atualizar usuário:", error);
    if (error.name === 'ConstraintError') {
      throw new Error("Nome de usuário já existe");
    }
    throw new Error("Erro ao atualizar usuário");
  }
}

// Deletar usuário
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    await executeUserOperation('delete', userId);
    return true;
  } catch (error) {
    console.error("❌ Erro ao deletar usuário:", error);
    return false;
  }
}

// Verificar se usuário existe
export async function userExists(username: string): Promise<boolean> {
  try {
    const user = await executeUserOperation('getByIndex', username, 'username');
    return !!user;
  } catch (error) {
    console.error("❌ Erro ao verificar usuário:", error);
    return false;
  }
}
