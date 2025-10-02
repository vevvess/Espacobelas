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
  chat_type: "public" | "private";
  recipient_id?: string;
  recipient_name?: string;
}

export interface ChatRoom {
  id: string;
  type: "public" | "private";
  name: string;
  participant_ids: string[];
  last_message?: ChatMessage;
  unread_count: number;
}

/**
 * Inicializar tabelas de chat se não existirem
 */
export async function initializeChatTables(): Promise<void> {
  try {
    // Tabela principal de mensagens com suporte a chats privados
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages_v2 (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users_simple(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        message_type VARCHAR(10) DEFAULT 'text',
        image_url TEXT,
        image_name VARCHAR(255),
        chat_type VARCHAR(10) DEFAULT 'public',
        recipient_id UUID REFERENCES users_simple(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        edited BOOLEAN DEFAULT FALSE
      )
    `;

    // Tabela para controle de leitura de mensagens
    await sql`
      CREATE TABLE IF NOT EXISTS chat_message_reads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id UUID NOT NULL REFERENCES chat_messages_v2(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users_simple(id) ON DELETE CASCADE,
        read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(message_id, user_id)
      )
    `;

    // Criar índices para performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_v2_created_at
      ON chat_messages_v2(created_at DESC)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_v2_chat_type
      ON chat_messages_v2(chat_type, created_at DESC)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_v2_private
      ON chat_messages_v2(user_id, recipient_id, created_at DESC)
      WHERE chat_type = 'private'
    `;

    console.log("✅ Tabelas de chat inicializadas com sucesso");
  } catch (error) {
    console.error("❌ Erro ao inicializar tabelas de chat:", error);
    throw error;
  }
}

/**
 * Buscar mensagens do chat público
 */
export async function getPublicChatMessages(
  limit: number = 50,
): Promise<ChatMessage[]> {
  try {
    const result = await sql`
      SELECT
        cm.*,
        us.username,
        us.nome as user_name,
        us.is_admin
      FROM chat_messages_v2 cm
      JOIN users_simple us ON cm.user_id = us.id
      WHERE cm.chat_type = 'public'
      ORDER BY cm.created_at DESC
      LIMIT ${limit}
    `;

    return result
      .map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        username: row.username,
        user_name: row.user_name,
        is_admin: row.is_admin,
        message: row.message,
        message_type: row.message_type,
        image_url: row.image_url,
        image_name: row.image_name,
        created_at: row.created_at,
        updated_at: row.updated_at,
        edited: row.edited,
        chat_type: row.chat_type,
        recipient_id: row.recipient_id,
      }))
      .reverse();
  } catch (error) {
    console.error("Erro ao buscar mensagens públicas:", error);
    return [];
  }
}

/**
 * Buscar mensagens de chat privado entre dois usuários
 */
export async function getPrivateChatMessages(
  userId: string,
  otherUserId: string,
  limit: number = 50,
): Promise<ChatMessage[]> {
  try {
    const result = await sql`
      SELECT
        cm.*,
        us.username,
        us.nome as user_name,
        us.is_admin,
        recipient.nome as recipient_name
      FROM chat_messages_v2 cm
      JOIN users_simple us ON cm.user_id = us.id
      LEFT JOIN users_simple recipient ON cm.recipient_id = recipient.id
      WHERE cm.chat_type = 'private'
        AND (
          (cm.user_id = ${userId} AND cm.recipient_id = ${otherUserId})
          OR (cm.user_id = ${otherUserId} AND cm.recipient_id = ${userId})
        )
      ORDER BY cm.created_at DESC
      LIMIT ${limit}
    `;

    return result
      .map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        username: row.username,
        user_name: row.user_name,
        is_admin: row.is_admin,
        message: row.message,
        message_type: row.message_type,
        image_url: row.image_url,
        image_name: row.image_name,
        created_at: row.created_at,
        updated_at: row.updated_at,
        edited: row.edited,
        chat_type: row.chat_type,
        recipient_id: row.recipient_id,
        recipient_name: row.recipient_name,
      }))
      .reverse();
  } catch (error) {
    console.error("Erro ao buscar mensagens privadas:", error);
    return [];
  }
}

/**
 * Enviar mensagem pública
 */
export async function sendPublicMessage(
  userId: string,
  message: string,
): Promise<ChatMessage | null> {
  try {
    const result = await sql`
      INSERT INTO chat_messages_v2 (user_id, message, chat_type)
      VALUES (${userId}, ${message.trim()}, 'public')
      RETURNING *
    `;

    if (result.length > 0) {
      const messageData = result[0];

      // Buscar dados do usuário
      const userResult = await sql`
        SELECT username, nome as user_name, is_admin
        FROM users_simple
        WHERE id = ${userId}
      `;

      if (userResult.length > 0) {
        const userData = userResult[0];
        return {
          id: messageData.id,
          user_id: messageData.user_id,
          username: userData.username,
          user_name: userData.user_name,
          is_admin: userData.is_admin,
          message: messageData.message,
          message_type: messageData.message_type,
          created_at: messageData.created_at,
          updated_at: messageData.updated_at,
          edited: messageData.edited,
          chat_type: messageData.chat_type,
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Erro ao enviar mensagem pública:", error);
    return null;
  }
}

/**
 * Enviar mensagem privada
 */
export async function sendPrivateMessage(
  userId: string,
  recipientId: string,
  message: string,
): Promise<ChatMessage | null> {
  try {
    const result = await sql`
      INSERT INTO chat_messages_v2 (user_id, recipient_id, message, chat_type)
      VALUES (${userId}, ${recipientId}, ${message.trim()}, 'private')
      RETURNING *
    `;

    if (result.length > 0) {
      const messageData = result[0];

      // Buscar dados do usuário e destinatário
      const [userResult, recipientResult] = await Promise.all([
        sql`SELECT username, nome as user_name, is_admin FROM users_simple WHERE id = ${userId}`,
        sql`SELECT nome as recipient_name FROM users_simple WHERE id = ${recipientId}`,
      ]);

      if (userResult.length > 0) {
        const userData = userResult[0];
        const recipientData = recipientResult[0];

        return {
          id: messageData.id,
          user_id: messageData.user_id,
          username: userData.username,
          user_name: userData.user_name,
          is_admin: userData.is_admin,
          message: messageData.message,
          message_type: messageData.message_type,
          created_at: messageData.created_at,
          updated_at: messageData.updated_at,
          edited: messageData.edited,
          chat_type: messageData.chat_type,
          recipient_id: messageData.recipient_id,
          recipient_name: recipientData?.recipient_name,
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Erro ao enviar mensagem privada:", error);
    return null;
  }
}

/**
 * Buscar lista de chats privados para um usuário (apenas para admins)
 */
export async function getPrivateChats(
  adminUserId: string,
): Promise<ChatRoom[]> {
  try {
    // Verificar se o usuário é admin
    const adminCheck = await sql`
      SELECT is_admin FROM users_simple WHERE id = ${adminUserId}
    `;

    if (!adminCheck[0]?.is_admin) {
      return [];
    }

    // Buscar todos os funcionários (não-admins) com quem o admin pode conversar
    const users = await sql`
      SELECT
        us.id,
        us.nome as name,
        us.username,
        us.is_admin,
        COALESCE(last_msg.message, '') as last_message,
        COALESCE(last_msg.created_at, '') as last_message_time,
        COALESCE(unread.count, 0) as unread_count
      FROM users_simple us
      LEFT JOIN (
        SELECT DISTINCT ON (
          CASE
            WHEN user_id = ${adminUserId} THEN recipient_id
            ELSE user_id
          END
        )
          CASE
            WHEN user_id = ${adminUserId} THEN recipient_id
            ELSE user_id
          END as other_user_id,
          message,
          created_at
        FROM chat_messages_v2
        WHERE chat_type = 'private'
          AND (user_id = ${adminUserId} OR recipient_id = ${adminUserId})
        ORDER BY
          CASE
            WHEN user_id = ${adminUserId} THEN recipient_id
            ELSE user_id
          END,
          created_at DESC
      ) last_msg ON last_msg.other_user_id = us.id
      LEFT JOIN (
        SELECT
          user_id as other_user_id,
          COUNT(*) as count
        FROM chat_messages_v2 cm
        WHERE chat_type = 'private'
          AND recipient_id = ${adminUserId}
          AND NOT EXISTS (
            SELECT 1 FROM chat_message_reads cmr
            WHERE cmr.message_id = cm.id AND cmr.user_id = ${adminUserId}
          )
        GROUP BY user_id
      ) unread ON unread.other_user_id = us.id
      WHERE us.id != ${adminUserId} AND us.ativo = true
      ORDER BY
        CASE WHEN last_msg.created_at IS NULL THEN 1 ELSE 0 END,
        last_msg.created_at DESC,
        us.nome
    `;

    return users.map((user: any) => ({
      id: `private_${user.id}`,
      type: "private" as const,
      name: user.name,
      participant_ids: [adminUserId, user.id],
      last_message: user.last_message
        ? {
            message: user.last_message,
            created_at: user.last_message_time,
          }
        : undefined,
      unread_count: Number(user.unread_count || 0),
    }));
  } catch (error) {
    console.error("Erro ao buscar chats privados:", error);
    return [];
  }
}

/**
 * Marcar mensagens como lidas
 */
export async function markMessagesAsRead(
  userId: string,
  otherUserId: string,
): Promise<void> {
  try {
    await sql`
      INSERT INTO chat_message_reads (message_id, user_id)
      SELECT cm.id, ${userId}
      FROM chat_messages_v2 cm
      WHERE cm.chat_type = 'private'
        AND cm.user_id = ${otherUserId}
        AND cm.recipient_id = ${userId}
        AND NOT EXISTS (
          SELECT 1 FROM chat_message_reads cmr
          WHERE cmr.message_id = cm.id AND cmr.user_id = ${userId}
        )
      ON CONFLICT (message_id, user_id) DO NOTHING
    `;
  } catch (error) {
    console.error("Erro ao marcar mensagens como lidas:", error);
  }
}

/**
 * Buscar usuários ativos para chat
 */
export async function getActiveUsers(): Promise<
  Array<{
    id: string;
    nome: string;
    username: string;
    is_admin: boolean;
    online: boolean;
  }>
> {
  try {
    const result = await sql`
      SELECT
        id,
        nome,
        username,
        is_admin,
        true as online
      FROM users_simple
      WHERE ativo = true
      ORDER BY is_admin DESC, nome
    `;

    return result as any[];
  } catch (error) {
    console.error("Erro ao buscar usuários ativos:", error);
    return [];
  }
}

/**
 * Editar mensagem
 */
export async function editMessage(
  messageId: string,
  userId: string,
  newMessage: string,
  isAdmin: boolean = false,
): Promise<boolean> {
  try {
    const result = await sql`
      UPDATE chat_messages_v2
      SET message = ${newMessage.trim()}, edited = true, updated_at = NOW()
      WHERE id = ${messageId}
        AND (user_id = ${userId} ${isAdmin ? sql` OR true` : sql``})
      RETURNING id
    `;

    return result.length > 0;
  } catch (error) {
    console.error("Erro ao editar mensagem:", error);
    return false;
  }
}

/**
 * Deletar mensagem
 */
export async function deleteMessage(
  messageId: string,
  userId: string,
  isAdmin: boolean = false,
): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM chat_messages_v2
      WHERE id = ${messageId}
        AND (user_id = ${userId} ${isAdmin ? sql` OR true` : sql``})
      RETURNING id
    `;

    return result.length > 0;
  } catch (error) {
    console.error("Erro ao deletar mensagem:", error);
    return false;
  }
}

/**
 * Buscar mensagens mais recentes que uma data específica (para polling)
 */
export async function getNewMessages(
  lastMessageTime: string,
  chatType: "public" | "private" = "public",
  userId?: string,
  otherUserId?: string,
): Promise<ChatMessage[]> {
  try {
    let result;

    if (chatType === "public") {
      result = await sql`
        SELECT
          cm.*,
          us.username,
          us.nome as user_name,
          us.is_admin
        FROM chat_messages_v2 cm
        JOIN users_simple us ON cm.user_id = us.id
        WHERE cm.chat_type = 'public'
          AND cm.created_at > ${lastMessageTime}
        ORDER BY cm.created_at ASC
        LIMIT 10
      `;
    } else if (chatType === "private" && userId && otherUserId) {
      result = await sql`
        SELECT
          cm.*,
          us.username,
          us.nome as user_name,
          us.is_admin,
          recipient.nome as recipient_name
        FROM chat_messages_v2 cm
        JOIN users_simple us ON cm.user_id = us.id
        LEFT JOIN users_simple recipient ON cm.recipient_id = recipient.id
        WHERE cm.chat_type = 'private'
          AND cm.created_at > ${lastMessageTime}
          AND (
            (cm.user_id = ${userId} AND cm.recipient_id = ${otherUserId})
            OR (cm.user_id = ${otherUserId} AND cm.recipient_id = ${userId})
          )
        ORDER BY cm.created_at ASC
        LIMIT 10
      `;
    } else {
      return [];
    }

    return result.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      username: row.username,
      user_name: row.user_name,
      is_admin: row.is_admin,
      message: row.message,
      message_type: row.message_type,
      image_url: row.image_url,
      image_name: row.image_name,
      created_at: row.created_at,
      updated_at: row.updated_at,
      edited: row.edited,
      chat_type: row.chat_type,
      recipient_id: row.recipient_id,
      recipient_name: row.recipient_name,
    }));
  } catch (error) {
    console.error("Erro ao buscar novas mensagens:", error);
    return [];
  }
}
