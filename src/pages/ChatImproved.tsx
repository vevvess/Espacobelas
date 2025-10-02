import React, { useState, useRef, useEffect } from "react";
import {
  FiMessageCircle,
  FiSend,
  FiUsers,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiRefreshCw,
  FiLoader,
  FiShield,
  FiUser,
  FiUserPlus,
  FiGlobe,
  FiLock,
  FiChevronLeft,
  FiMoreVertical,
} from "react-icons/fi";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useChatRealTime } from "@/hooks/useChatRealTime";
import { ChatMessage } from "@/services/chatServiceImproved";
import { ChatStatus } from "@/components/ChatStatus";

export default function ChatImproved() {
  const { user } = useAuth();
  const {
    messages,
    privateChats,
    activeUsers,
    loading,
    sending,
    error,
    currentChatType,
    currentChatUser,
    isAdmin,
    sendMessage,
    editMessage,
    deleteMessage,
    canModifyMessage,
    switchToPublicChat,
    switchToPrivateChat,
    reloadMessages,
    formatMessageTime,
    updateActivity,
  } = useChatRealTime();

  const [newMessage, setNewMessage] = useState("");
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showUserList, setShowUserList] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll para o final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focar no input quando para de editar
  useEffect(() => {
    if (!editingMessage && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const message = newMessage.trim();
    setNewMessage(""); // Limpar imediatamente para evitar duplo envio

    // Marcar atividade
    updateActivity();

    try {
      const success = await sendMessage(message);
      if (!success) {
        // Restaurar mensagem se falhou
        setNewMessage(message);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setNewMessage(message); // Restaurar mensagem em caso de erro
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editText.trim()) return;

    const success = await editMessage(messageId, editText);
    if (success) {
      setEditingMessage(null);
      setEditText("");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm("Tem certeza que deseja deletar esta mensagem?")) {
      await deleteMessage(messageId);
    }
  };

  const startEditing = (message: ChatMessage) => {
    setEditingMessage(message.id);
    setEditText(message.message);
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setEditText("");
  };

  const getCurrentChatName = () => {
    if (currentChatType === "public") {
      return "Chat Geral";
    } else if (currentChatUser) {
      const chatUser = activeUsers.find((u) => u.id === currentChatUser);
      return chatUser ? `Chat com ${chatUser.nome}` : "Chat Privado";
    }
    return "Chat";
  };

  const getCurrentChatIcon = () => {
    if (currentChatType === "public") {
      return <FiGlobe className="w-5 h-5" />;
    } else {
      return <FiLock className="w-5 h-5" />;
    }
  };

  const getUnreadCount = (chatId: string) => {
    const chat = privateChats.find((c) => c.id === chatId);
    return chat?.unread_count || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FiLoader className="w-8 h-8 animate-spin mx-auto mb-4 text-bella-500" />
          <p className="text-bella-600">Carregando chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FiMessageCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-4">Erro ao carregar chat: {error}</p>
          <button
            onClick={reloadMessages}
            className="px-4 py-2 bg-bella-500 text-white rounded-lg hover:bg-bella-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50 relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-5 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } lg:w-80 transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex flex-col ${
          sidebarOpen ? "lg:relative absolute inset-y-0 left-0 z-10" : ""
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Conversas</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-gray-500 hover:text-gray-700 lg:hidden"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Público */}
          <div
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
              currentChatType === "public"
                ? "bg-bella-100 text-bella-700"
                : "hover:bg-gray-100"
            }`}
            onClick={switchToPublicChat}
          >
            <div className="w-10 h-10 bg-bella-500 rounded-full flex items-center justify-center">
              <FiGlobe className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Chat Geral</p>
              <p className="text-sm text-gray-500">
                {activeUsers.length} usuários online
              </p>
            </div>
          </div>
        </div>

        {/* Chats Privados (só para admins) */}
        {isAdmin && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Conversas Privadas
              </h3>

              {privateChats.length > 0 ? (
                <div className="space-y-2">
                  {privateChats.map((chat) => {
                    const otherUserId = chat.participant_ids.find(
                      (id) => id !== user?.id,
                    );
                    const isActive =
                      currentChatType === "private" &&
                      currentChatUser === otherUserId;
                    const unreadCount = getUnreadCount(chat.id);

                    return (
                      <div
                        key={chat.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          isActive
                            ? "bg-bella-100 text-bella-700"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() =>
                          otherUserId && switchToPrivateChat(otherUserId)
                        }
                      >
                        <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                          <FiUser className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{chat.name}</p>
                            {unreadCount > 0 && (
                              <span className="bg-bella-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                          {chat.last_message && (
                            <p className="text-sm text-gray-500 truncate">
                              {chat.last_message.message}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Nenhuma conversa privada ainda
                </p>
              )}
            </div>
          </div>
        )}

        {/* Usuários Online */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={() => setShowUserList(!showUserList)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
          >
            <FiUsers className="w-4 h-4" />
            <span>Usuários Online ({activeUsers.length})</span>
          </button>

          {showUserList && (
            <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
              {activeUsers.map((activeUser) => (
                <div
                  key={activeUser.id}
                  className="flex items-center space-x-2"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      activeUser.is_admin
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {activeUser.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activeUser.nome}</p>
                    {activeUser.is_admin && (
                      <span className="text-xs text-yellow-600">Admin</span>
                    )}
                  </div>
                  {isAdmin && activeUser.id !== user?.id && (
                    <button
                      onClick={() => switchToPrivateChat(activeUser.id)}
                      className="p-1 text-gray-400 hover:text-bella-500"
                      title="Conversar em privado"
                    >
                      <FiMessageCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Área Principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1 text-gray-500 hover:text-gray-700 lg:hidden"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              {getCurrentChatIcon()}
              <div>
                <h1 className="text-lg font-semibold text-gray-800">
                  {getCurrentChatName()}
                </h1>
                {currentChatType === "public" && (
                  <p className="text-sm text-gray-500">
                    {activeUsers.length} usuários online
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ChatStatus
                isConnected={!error}
                lastActivity={Date.now()}
                messagesCount={messages.length}
              />

              <button
                onClick={reloadMessages}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                title="Atualizar mensagens"
              >
                <FiRefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex space-x-3 ${
                  message.user_id === user?.id ? "justify-end" : ""
                }`}
              >
                {message.user_id !== user?.id && (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      message.is_admin
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {message.user_name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div
                  className={`max-w-xs lg:max-w-md ${
                    message.user_id === user?.id
                      ? "bg-bella-500 text-white"
                      : "bg-white border border-gray-200"
                  } rounded-lg p-3 shadow-sm`}
                >
                  {message.user_id !== user?.id && (
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {message.user_name}
                      </span>
                      {message.is_admin && (
                        <FiShield className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                  )}

                  {editingMessage === message.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-gray-800 text-sm resize-none"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditMessage(message.id)}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                        >
                          <FiCheck className="w-3 h-3" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p
                        className={`text-sm ${
                          message.user_id === user?.id
                            ? "text-white"
                            : "text-gray-800"
                        }`}
                      >
                        {message.message}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span
                          className={`text-xs ${
                            message.user_id === user?.id
                              ? "text-bella-200"
                              : "text-gray-500"
                          }`}
                        >
                          {formatMessageTime(message.created_at)}
                          {message.edited && " (editada)"}
                        </span>

                        {canModifyMessage(message) && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => startEditing(message)}
                              className={`p-1 rounded ${
                                message.user_id === user?.id
                                  ? "text-bella-200 hover:text-white"
                                  : "text-gray-400 hover:text-gray-600"
                              }`}
                            >
                              <FiEdit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(message.id)}
                              className={`p-1 rounded ${
                                message.user_id === user?.id
                                  ? "text-bella-200 hover:text-white"
                                  : "text-gray-400 hover:text-gray-600"
                              }`}
                            >
                              <FiTrash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {message.user_id === user?.id && (
                  <div className="w-8 h-8 bg-bella-500 rounded-full flex items-center justify-center text-sm font-medium text-white">
                    {message.user_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <FiMessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma mensagem ainda</p>
              <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de Mensagem */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                updateActivity(); // Marcar atividade ao digitar
              }}
              placeholder={`Digite sua mensagem${
                currentChatType === "private" ? " privada" : ""
              }...`}
              className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-bella-500 focus:border-transparent"
              rows={1}
              disabled={sending}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              onFocus={() => updateActivity()}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-6 py-3 bg-bella-500 text-white rounded-lg hover:bg-bella-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {sending ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <FiSend className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
