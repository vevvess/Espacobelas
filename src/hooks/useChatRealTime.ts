import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/SimpleAuthContext";
import {
  ChatMessage,
  ChatRoom,
  getPublicChatMessages,
  getPrivateChatMessages,
  sendPublicMessage,
  sendPrivateMessage,
  getPrivateChats,
  markMessagesAsRead,
  getActiveUsers,
  editMessage,
  deleteMessage,
  initializeChatTables,
  getNewMessages,
} from "@/services/chatServiceImproved";
import { toast } from "@/hooks/use-toast";
import {
  playNotificationSound,
  playMessageSentSound,
} from "@/utils/soundUtils";

export type ChatType = "public" | "private";

export function useChatRealTime() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [privateChats, setPrivateChats] = useState<ChatRoom[]>([]);
  const [activeUsers, setActiveUsers] = useState<
    Array<{
      id: string;
      nome: string;
      username: string;
      is_admin: boolean;
      online: boolean;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChatType, setCurrentChatType] = useState<ChatType>("public");
  const [currentChatUser, setCurrentChatUser] = useState<string | null>(null);
  const [lastMessageTime, setLastMessageTime] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);

  // Refs para controle do polling em tempo real
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);
  const lastActivityRef = useRef(Date.now());
  const retryCountRef = useRef(0);

  // Configurações de polling dinâmico
  const FAST_POLLING_INTERVAL = 800; // 0.8 segundos quando ativo
  const SLOW_POLLING_INTERVAL = 3000; // 3 segundos quando inativo
  const ACTIVITY_TIMEOUT = 30000; // 30 segundos sem atividade = polling lento

  // Detectar atividade do usuário
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Função para carregar mensagens do chat público
  const loadPublicMessages = useCallback(async () => {
    if (!user?.id) return;

    try {
      const messagesData = await getPublicChatMessages(100); // Mais mensagens no carregamento inicial
      setMessages(messagesData);

      if (messagesData.length > 0) {
        setLastMessageTime(messagesData[messagesData.length - 1].created_at);
      }
    } catch (err) {
      console.error("Erro ao carregar mensagens públicas:", err);
    }
  }, [user?.id]);

  // Função para carregar mensagens do chat privado
  const loadPrivateMessages = useCallback(
    async (otherUserId: string) => {
      if (!user?.id) return;

      try {
        const messagesData = await getPrivateChatMessages(
          user.id,
          otherUserId,
          100,
        );
        setMessages(messagesData);

        if (messagesData.length > 0) {
          setLastMessageTime(messagesData[messagesData.length - 1].created_at);
        }

        // Marcar mensagens como lidas
        await markMessagesAsRead(user.id, otherUserId);

        // Atualizar contadores de chats privados
        if (user.is_admin) {
          loadPrivateChats();
        }
      } catch (err) {
        console.error("Erro ao carregar mensagens privadas:", err);
      }
    },
    [user?.id, user?.is_admin],
  );

  // Função para carregar lista de chats privados (só para admins)
  const loadPrivateChats = useCallback(async () => {
    if (!user?.id || !user.is_admin) return;

    try {
      const chatsData = await getPrivateChats(user.id);
      setPrivateChats(chatsData);
    } catch (err) {
      console.error("Erro ao carregar chats privados:", err);
    }
  }, [user?.id, user?.is_admin]);

  // Função para carregar usuários ativos
  const loadActiveUsers = useCallback(async () => {
    try {
      const usersData = await getActiveUsers();
      setActiveUsers(usersData);
    } catch (err) {
      console.error("Erro ao carregar usuários ativos:", err);
    }
  }, []);

  // Função para carregar dados iniciais
  const loadInitialData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      retryCountRef.current = 0;

      // Inicializar tabelas
      await initializeChatTables();

      // Carregar dados em paralelo
      const promises = [loadActiveUsers()];

      if (currentChatType === "public") {
        promises.push(loadPublicMessages());
      } else if (currentChatType === "private" && currentChatUser) {
        promises.push(loadPrivateMessages(currentChatUser));
      }

      if (user.is_admin) {
        promises.push(loadPrivateChats());
      }

      await Promise.all(promises);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar chat";
      setError(errorMessage);
      toast({
        title: "Erro no chat",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    user?.id,
    currentChatType,
    currentChatUser,
    user?.is_admin,
    loadPublicMessages,
    loadPrivateMessages,
    loadPrivateChats,
    loadActiveUsers,
  ]);

  // Função para polling de novas mensagens em tempo real
  const pollForNewMessages = useCallback(async () => {
    if (!user?.id || !lastMessageTime || !isActiveRef.current) return;

    try {
      let newMessages: ChatMessage[] = [];

      if (currentChatType === "public") {
        newMessages = await getNewMessages(lastMessageTime, "public");
      } else if (currentChatType === "private" && currentChatUser) {
        newMessages = await getNewMessages(
          lastMessageTime,
          "private",
          user.id,
          currentChatUser,
        );
      }

      if (newMessages.length > 0) {
        // Filtrar mensagens que já existem no estado (prevenir duplicatas)
        setMessages((prev) => {
          const existingIds = new Set(prev.map((msg) => msg.id));
          const trulyNewMessages = newMessages.filter(
            (msg) => !existingIds.has(msg.id),
          );

          if (trulyNewMessages.length > 0) {
            // Som de notificação para novas mensagens
            if (trulyNewMessages.some((msg) => msg.user_id !== user.id)) {
              // Apenas para mensagens de outros usuários
              playNotificationSound();
            }

            return [...prev, ...trulyNewMessages];
          }
          return prev;
        });

        setLastMessageTime(newMessages[newMessages.length - 1].created_at);

        // Atualizar chats privados se necessário
        if (user.is_admin) {
          loadPrivateChats();
        }

        // Reset retry count on successful poll
        retryCountRef.current = 0;
      }
    } catch (err) {
      console.error("Erro no polling de mensagens:", err);
      retryCountRef.current++;

      // Se muitos erros, aumentar intervalo temporariamente
      if (retryCountRef.current > 3) {
        console.log(
          "Muitos erros de polling, reduzindo frequência temporariamente",
        );
      }
    }
  }, [
    user?.id,
    lastMessageTime,
    currentChatType,
    currentChatUser,
    user?.is_admin,
    loadPrivateChats,
  ]);

  // Configurar polling dinâmico baseado na atividade
  const setupDynamicPolling = useCallback(() => {
    if (!user?.id || !lastMessageTime) return;

    // Limpar polling anterior
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    if (!isActiveRef.current) return;

    // Determinar intervalo baseado na atividade recente
    const timeSinceActivity = Date.now() - lastActivityRef.current;
    const isRecentlyActive = timeSinceActivity < ACTIVITY_TIMEOUT;
    const hasErrors = retryCountRef.current > 3;

    let interval = FAST_POLLING_INTERVAL;

    if (hasErrors) {
      interval = SLOW_POLLING_INTERVAL * 2; // Muito lento se há erros
    } else if (!isRecentlyActive) {
      interval = SLOW_POLLING_INTERVAL; // Lento se inativo
    }

    // Iniciar polling com intervalo dinâmico
    pollingRef.current = setInterval(pollForNewMessages, interval);

    // Agendar próxima verificação de atividade
    setTimeout(setupDynamicPolling, 5000);
  }, [user?.id, lastMessageTime, pollForNewMessages]);

  // Detectar quando a aba fica ativa/inativa
  useEffect(() => {
    const handleVisibilityChange = () => {
      const wasActive = isActiveRef.current;
      isActiveRef.current = !document.hidden;

      if (document.hidden) {
        // Aba inativa - pausar polling
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      } else if (!wasActive) {
        // Aba ficou ativa - retomar polling agressivo
        updateActivity();
        setupDynamicPolling();

        // Buscar mensagens perdidas imediatamente
        if (user?.id && lastMessageTime) {
          pollForNewMessages();
        }
      }
    };

    const handleActivity = () => {
      updateActivity();
    };

    // Eventos de atividade
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("mousedown", handleActivity);
    document.addEventListener("keydown", handleActivity);
    document.addEventListener("touchstart", handleActivity);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("mousedown", handleActivity);
      document.removeEventListener("keydown", handleActivity);
      document.removeEventListener("touchstart", handleActivity);
    };
  }, [
    user?.id,
    lastMessageTime,
    pollForNewMessages,
    setupDynamicPolling,
    updateActivity,
  ]);

  // Enviar mensagem
  const sendMessage = async (message: string): Promise<boolean> => {
    if (!user?.id || !message.trim()) return false;

    try {
      setSending(true);
      updateActivity(); // Marcar como ativo

      let newMessage: ChatMessage | null = null;

      if (currentChatType === "public") {
        newMessage = await sendPublicMessage(user.id, message);
      } else if (currentChatType === "private" && currentChatUser) {
        newMessage = await sendPrivateMessage(
          user.id,
          currentChatUser,
          message,
        );
      }

      if (newMessage) {
        // Adicionar mensagem imediatamente (otimistic update)
        setMessages((prev) => {
          const exists = prev.some((msg) => msg.id === newMessage.id);
          if (!exists) {
            return [...prev, newMessage];
          }
          return prev;
        });

        setLastMessageTime(newMessage.created_at);

        // Atualizar chats privados se necessário
        if (user.is_admin && currentChatType === "private") {
          loadPrivateChats();
        }

        // Iniciar polling agressivo após enviar mensagem
        setupDynamicPolling();

        return true;
      } else {
        throw new Error("Falha ao enviar mensagem");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao enviar mensagem";
      toast({
        title: "Erro ao enviar",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setSending(false);
    }
  };

  // Editar mensagem
  const editChatMessage = async (
    messageId: string,
    newMessage: string,
  ): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      updateActivity();
      const success = await editMessage(
        messageId,
        user.id,
        newMessage,
        user.is_admin,
      );

      if (success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  message: newMessage.trim(),
                  edited: true,
                  updated_at: new Date().toISOString(),
                }
              : msg,
          ),
        );

        toast({
          title: "Mensagem editada",
          description: "Mensagem foi editada com sucesso",
        });
        return true;
      } else {
        throw new Error("Falha ao editar mensagem");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao editar mensagem";
      toast({
        title: "Erro ao editar",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  // Deletar mensagem
  const deleteChatMessage = async (messageId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      updateActivity();
      const success = await deleteMessage(messageId, user.id, user.is_admin);

      if (success) {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

        toast({
          title: "Mensagem deletada",
          description: "Mensagem foi removida do chat",
        });
        return true;
      } else {
        throw new Error("Falha ao deletar mensagem");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao deletar mensagem";
      toast({
        title: "Erro ao deletar",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  // Verificar se usuário pode editar/deletar mensagem
  const canModifyMessage = (message: ChatMessage): boolean => {
    if (!user) return false;
    return user.is_admin || message.user_id === user.id;
  };

  // Mudar tipo de chat
  const switchToPublicChat = () => {
    setCurrentChatType("public");
    setCurrentChatUser(null);
    setMessages([]);
    setLastMessageTime("");
    updateActivity();
  };

  // Mudar para chat privado
  const switchToPrivateChat = (otherUserId: string) => {
    if (!user?.is_admin) return;

    setCurrentChatType("private");
    setCurrentChatUser(otherUserId);
    setMessages([]);
    setLastMessageTime("");
    updateActivity();
  };

  // Formatar tempo relativo
  const formatMessageTime = (timestamp: string): string => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - messageTime.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "agora";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;

    return messageTime.toLocaleDateString("pt-BR");
  };

  // Carregar dados quando usuário ou chat muda
  useEffect(() => {
    if (user?.id) {
      loadInitialData();
    }
  }, [user?.id, loadInitialData]);

  // Iniciar polling quando dados estão prontos
  useEffect(() => {
    if (user?.id && lastMessageTime && !loading) {
      setupDynamicPolling();
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [user?.id, lastMessageTime, loading, setupDynamicPolling]);

  return {
    // Estado
    messages,
    privateChats,
    activeUsers,
    loading,
    sending,
    error,
    currentChatType,
    currentChatUser,
    isAdmin: user?.is_admin || false,
    isTyping,

    // Ações
    sendMessage,
    editMessage: editChatMessage,
    deleteMessage: deleteChatMessage,
    canModifyMessage,
    switchToPublicChat,
    switchToPrivateChat,
    reloadMessages: loadInitialData,
    updateActivity,

    // Utilidades
    formatMessageTime,
  };
}
