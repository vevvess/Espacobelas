import { sql } from "@/lib/neon";

export interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  user_name: string;
  is_admin: boolean;
  message: string;
  message_type: "text" | "image";
  image_url?: string;
  image_name?: string;
  created_at: string;
  updated_at: string;
  edited: boolean;
}

/**
 * Inicializar tabela de chat se não existir
 */
export async function initializeChatTable(): Promise<void> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users_simple(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        edited BOOLEAN DEFAULT FALSE
      )
    `;

    // Adicionar colunas para imagens se não existirem
    try {
      await sql`ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(10) DEFAULT 'text'`;
      await sql`ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS image_url TEXT`;
      await sql`ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS image_name VARCHAR(255)`;
    } catch (error) {
      // Colunas já existem, ignorar erro
      console.log("Colunas de imagem já existem ou foram adicionadas");
    }

    // Criar índices para performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at
      ON chat_messages(created_at DESC)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id
      ON chat_messages(user_id)
    `;
  } catch (error) {
    console.error("Erro ao inicializar tabela de chat:", error);
  }
}

/**
 * Buscar mensagens do chat com informações do usuário
 */
export async function getChatMessages(
  limit: number = 50,
  offset: number = 0,
): Promise<ChatMessage[]> {
  try {
    let result;

    try {
      // Tentar com colunas novas primeiro
      result = await sql`
        SELECT
          cm.id,
          cm.user_id,
          cm.message,
          COALESCE(cm.message_type, 'text') as message_type,
          cm.image_url,
          cm.image_name,
          cm.created_at,
          cm.updated_at,
          cm.edited,
          u.username,
          u.nome as user_name,
          u.is_admin
        FROM chat_messages cm
        JOIN users_simple u ON cm.user_id = u.id
        WHERE u.ativo = true
        ORDER BY cm.created_at ASC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } catch (error) {
      console.log(
        "Usando fallback para estrutura de chat - funcionalidades de imagem limitadas",
      );
      // Fallback para estrutura antiga
      result = await sql`
        SELECT
          cm.id,
          cm.user_id,
          cm.message,
          'text' as message_type,
          null as image_url,
          null as image_name,
          cm.created_at,
          cm.updated_at,
          cm.edited,
          u.username,
          u.nome as user_name,
          u.is_admin
        FROM chat_messages cm
        JOIN users_simple u ON cm.user_id = u.id
        WHERE u.ativo = true
        ORDER BY cm.created_at ASC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    }

    return result.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      username: row.username,
      user_name: row.user_name,
      is_admin: row.is_admin,
      message: row.message,
      message_type: row.message_type || "text",
      image_url: row.image_url,
      image_name: row.image_name,
      created_at: row.created_at,
      updated_at: row.updated_at,
      edited: row.edited,
    }));
  } catch (error) {
    console.error("Erro ao buscar mensagens do chat:", error);
    return [];
  }
}

/**
 * Enviar nova mensagem de texto
 */
export async function sendChatMessage(
  userId: string,
  message: string,
): Promise<ChatMessage | null> {
  try {
    if (!message.trim()) {
      throw new Error("Mensagem não pode estar vazia");
    }

    let result;
    try {
      result = await sql`
        INSERT INTO chat_messages (user_id, message, message_type)
        VALUES (${userId}, ${message.trim()}, 'text')
        RETURNING *
      `;
    } catch (error) {
      // Fallback para estrutura antiga sem message_type
      result = await sql`
        INSERT INTO chat_messages (user_id, message)
        VALUES (${userId}, ${message.trim()})
        RETURNING *
      `;
    }

    if (result.length === 0) return null;

    // Buscar dados completos da mensagem criada
    let fullMessage;
    try {
      fullMessage = await sql`
        SELECT
          cm.id,
          cm.user_id,
          cm.message,
          COALESCE(cm.message_type, 'text') as message_type,
          cm.image_url,
          cm.image_name,
          cm.created_at,
          cm.updated_at,
          cm.edited,
          u.username,
          u.nome as user_name,
          u.is_admin
        FROM chat_messages cm
        JOIN users_simple u ON cm.user_id = u.id
        WHERE cm.id = ${result[0].id}
      `;
    } catch (error) {
      // Fallback para estrutura antiga
      fullMessage = await sql`
        SELECT
          cm.id,
          cm.user_id,
          cm.message,
          'text' as message_type,
          null as image_url,
          null as image_name,
          cm.created_at,
          cm.updated_at,
          cm.edited,
          u.username,
          u.nome as user_name,
          u.is_admin
        FROM chat_messages cm
        JOIN users_simple u ON cm.user_id = u.id
        WHERE cm.id = ${result[0].id}
      `;
    }

    return fullMessage[0] as ChatMessage;
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return null;
  }
}

/**
 * Enviar mensagem com imagem
 */
export async function sendChatImageMessage(
  userId: string,
  message: string,
  imageDataUrl: string,
  imageName: string,
): Promise<ChatMessage | null> {
  try {
    let result;
    try {
      result = await sql`
        INSERT INTO chat_messages (user_id, message, message_type, image_url, image_name)
        VALUES (${userId}, ${message.trim() || "Imagem"}, 'image', ${imageDataUrl}, ${imageName})
        RETURNING *
      `;
    } catch (error) {
      // Fallback para estrutura antiga - imagem como texto normal
      result = await sql`
        INSERT INTO chat_messages (user_id, message)
        VALUES (${userId}, ${message.trim() || "Imagem (não suportada na versão atual)"})
        RETURNING *
      `;
    }

    if (result.length === 0) return null;

    // Buscar dados completos da mensagem criada
    let fullMessage;
    try {
      fullMessage = await sql`
        SELECT
          cm.id,
          cm.user_id,
          cm.message,
          COALESCE(cm.message_type, 'image') as message_type,
          cm.image_url,
          cm.image_name,
          cm.created_at,
          cm.updated_at,
          cm.edited,
          u.username,
          u.nome as user_name,
          u.is_admin
        FROM chat_messages cm
        JOIN users_simple u ON cm.user_id = u.id
        WHERE cm.id = ${result[0].id}
      `;
    } catch (error) {
      // Fallback - imagem não suportada na estrutura antiga
      fullMessage = await sql`
        SELECT
          cm.id,
          cm.user_id,
          cm.message,
          'text' as message_type,
          null as image_url,
          null as image_name,
          cm.created_at,
          cm.updated_at,
          cm.edited,
          u.username,
          u.nome as user_name,
          u.is_admin
        FROM chat_messages cm
        JOIN users_simple u ON cm.user_id = u.id
        WHERE cm.id = ${result[0].id}
      `;
    }

    return fullMessage[0] as ChatMessage;
  } catch (error) {
    console.error("Erro ao enviar imagem:", error);
    return null;
  }
}

/**
 * Editar mensagem (apenas o autor ou admin)
 */
export async function editChatMessage(
  messageId: string,
  newMessage: string,
  currentUserId: string,
  isCurrentUserAdmin: boolean,
): Promise<boolean> {
  try {
    if (!newMessage.trim()) {
      throw new Error("Mensagem não pode estar vazia");
    }

    // Verificar se o usuário pode editar esta mensagem
    const messageCheck = await sql`
      SELECT user_id FROM chat_messages WHERE id = ${messageId}
    `;

    if (messageCheck.length === 0) {
      throw new Error("Mensagem não encontrada");
    }

    const messageOwnerId = messageCheck[0].user_id;

    // Admin pode editar qualquer mensagem, usuário normal só suas próprias
    if (!isCurrentUserAdmin && messageOwnerId !== currentUserId) {
      throw new Error("Você só pode editar suas próprias mensagens");
    }

    await sql`
      UPDATE chat_messages
      SET message = ${newMessage.trim()},
          updated_at = NOW(),
          edited = true
      WHERE id = ${messageId}
    `;

    return true;
  } catch (error) {
    console.error("Erro ao editar mensagem:", error);
    return false;
  }
}

/**
 * Deletar mensagem (apenas o autor ou admin)
 */
export async function deleteChatMessage(
  messageId: string,
  currentUserId: string,
  isCurrentUserAdmin: boolean,
): Promise<boolean> {
  try {
    // Verificar se o usuário pode deletar esta mensagem
    const messageCheck = await sql`
      SELECT user_id FROM chat_messages WHERE id = ${messageId}
    `;

    if (messageCheck.length === 0) {
      throw new Error("Mensagem não encontrada");
    }

    const messageOwnerId = messageCheck[0].user_id;

    // Admin pode deletar qualquer mensagem, usuário normal só suas próprias
    if (!isCurrentUserAdmin && messageOwnerId !== currentUserId) {
      throw new Error("Você só pode deletar suas próprias mensagens");
    }

    await sql`
      DELETE FROM chat_messages WHERE id = ${messageId}
    `;

    return true;
  } catch (error) {
    console.error("Erro ao deletar mensagem:", error);
    return false;
  }
}

/**
 * Buscar usuários online (últimos 5 minutos de atividade)
 * Para futuras implementações de status online
 */
export async function getActiveUsers(): Promise<
  Array<{
    id: string;
    nome: string;
    username: string;
    is_admin: boolean;
  }>
> {
  try {
    const result = await sql`
      SELECT id, nome, username, is_admin
      FROM users_simple
      WHERE ativo = true
      ORDER BY is_admin DESC, nome ASC
    `;

    return result.map((row: any) => ({
      id: row.id,
      nome: row.nome,
      username: row.username,
      is_admin: row.is_admin,
    }));
  } catch (error) {
    console.error("Erro ao buscar usuários ativos:", error);
    return [];
  }
}
