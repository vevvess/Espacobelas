import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/SimpleAuthContext";
import {
  ChatMessage,
  getChatMessages,
  sendChatMessage,
  sendChatImageMessage,
  editChatMessage,
  deleteChatMessage,
  getActiveUsers,
  initializeChatTable,
} from "@/services/chatService";
import { toast } from "@/hooks/use-toast";

export function useChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeUsers, setActiveUsers] = useState<
    Array<{
      id: string;
      nome: string;
      username: string;
      is_admin: boolean;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar mensagens
  const loadMessages = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Inicializar tabela se necessário
      await initializeChatTable();

      const [messagesData, usersData] = await Promise.all([
        getChatMessages(100), // Últimas 100 mensagens
        getActiveUsers(),
      ]);

      setMessages(messagesData);
      setActiveUsers(usersData);
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
  }, [user?.id]);

  // Enviar mensagem
  const sendMessage = async (message: string): Promise<boolean> => {
    if (!user?.id || !message.trim()) return false;

    try {
      setSending(true);
      const newMessage = await sendChatMessage(user.id, message);

      if (newMessage) {
        setMessages((prev) => [...prev, newMessage]);
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

  // Enviar imagem
  const sendImageMessage = async (
    file: File,
    message: string = "",
  ): Promise<boolean> => {
    if (!user?.id || !file) return false;

    // Verificar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione apenas imagens",
        variant: "destructive",
      });
      return false;
    }

    // Verificar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 5MB",
        variant: "destructive",
      });
      return false;
    }

    try {
      setSending(true);

      // Converter para base64
      const reader = new FileReader();
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const newMessage = await sendChatImageMessage(
        user.id,
        message,
        imageDataUrl,
        file.name,
      );

      if (newMessage) {
        setMessages((prev) => [...prev, newMessage]);
        toast({
          title: "Imagem enviada",
          description: "Imagem enviada com sucesso",
        });
        return true;
      } else {
        throw new Error("Falha ao enviar imagem");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao enviar imagem";
      toast({
        title: "Erro ao enviar imagem",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setSending(false);
    }
  };

  // Editar mensagem
  const editMessage = async (
    messageId: string,
    newMessage: string,
  ): Promise<boolean> => {
    if (!user?.id || !newMessage.trim()) return false;

    try {
      const success = await editChatMessage(
        messageId,
        newMessage,
        user.id,
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
  const deleteMessage = async (messageId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const success = await deleteChatMessage(
        messageId,
        user.id,
        user.is_admin,
      );

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

  // Recarregar mensagens periodicamente (polling simples)
  useEffect(() => {
    if (!user?.id) return;

    loadMessages();

    // Recarregar a cada 30 segundos para evitar interferência na interação
    const interval = setInterval(loadMessages, 30000);

    return () => clearInterval(interval);
  }, [user?.id, loadMessages]);

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

  return {
    messages,
    activeUsers,
    loading,
    sending,
    error,
    sendMessage,
    sendImageMessage,
    editMessage,
    deleteMessage,
    canModifyMessage,
    formatMessageTime,
    reloadMessages: loadMessages,
  };
}
