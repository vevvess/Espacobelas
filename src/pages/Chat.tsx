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
  FiImage,
  FiPaperclip,
} from "react-icons/fi";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/services/chatService";

export default function Chat() {
  const { user } = useAuth();
  const {
    messages,
    activeUsers,
    loading,
    sending,
    sendMessage,
    sendImageMessage,
    editMessage,
    deleteMessage,
    canModifyMessage,
    formatMessageTime,
    reloadMessages,
  } = useChat();

  const [newMessage, setNewMessage] = useState("");
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll para o final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focar input quando sair do modo de edição
  useEffect(() => {
    if (!editingMessage && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (sending) return;

    // Se há imagem selecionada, enviar como imagem
    if (selectedImage) {
      const success = await sendImageMessage(selectedImage, newMessage);
      if (success) {
        setNewMessage("");
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
      return;
    }

    // Senão, enviar como texto normal
    if (!newMessage.trim()) return;

    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage("");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar se é imagem
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione apenas imagens");
      return;
    }

    // Verificar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB");
      return;
    }

    setSelectedImage(file);

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleStartEdit = (message: ChatMessage) => {
    setEditingMessage(message.id);
    setEditText(message.message);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText("");
  };

  const handleSaveEdit = async (messageId: string) => {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleEditKeyPress = (e: React.KeyboardEvent, messageId: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit(messageId);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-bella-800">Chat Interno</h1>
            <p className="text-bella-600">Comunicação entre a equipe</p>
          </div>
        </div>

        <div className="bella-card min-h-96 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <FiLoader className="w-8 h-8 text-bella-500 animate-spin" />
            <p className="text-bella-600">Carregando chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-spacing animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
        <div className="animate-slide-up">
          <h1 className="text-3xl sm:text-4xl font-bold text-bella-800 mb-2">
            Chat Interno 💬
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-lg text-bella-600">
              Comunicação entre a equipe • {activeUsers.length} usuários
            </p>
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
              <div className="status-online"></div>
              <span className="text-xs font-medium text-green-700">
                Tempo real (5s)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 animate-slide-up">
          <button
            onClick={reloadMessages}
            className="flex items-center space-x-2 px-4 py-3 text-sm border-2 border-bella-300 rounded-xl hover:bg-bella-50 hover:border-bella-400 transition-all duration-200 font-medium hover-lift tap-scale"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Lista de usuários ativos */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bella-card h-fit animate-slide-up hover-glow">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-400 rounded-xl flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-bella-800 text-lg">
                Equipe ({activeUsers.length})
              </h3>
            </div>

            <div className="space-y-3">
              {activeUsers.map((activeUser, index) => (
                <div
                  key={activeUser.id}
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-bella-50 transition-all duration-200 hover-lift group"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-bella-400 to-bella-300 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      {activeUser.is_admin ? (
                        <FiShield className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-white text-sm font-bold">
                          {activeUser.nome.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {activeUser.id === user?.id && (
                      <div className="absolute -bottom-1 -right-1">
                        <div className="status-online"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-bella-800 truncate">
                      {activeUser.nome}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-bella-600">
                        {activeUser.is_admin ? "Admin" : "Funcionário"}
                      </p>
                      {activeUser.is_admin && (
                        <span className="bg-bella-200 text-bella-800 text-xs px-2 py-0.5 rounded-full font-medium">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat principal */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div
            className="bella-card flex flex-col hover-glow animate-scale-in"
            style={{ height: "650px" }}
          >
            {/* Header do chat */}
            <div className="flex items-center justify-between p-4 border-b border-bella-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-bella-500 to-bella-400 rounded-xl flex items-center justify-center">
                  <FiMessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-bella-800">Chat da Equipe</h3>
                  <p className="text-xs text-bella-600">
                    Última atualização: agora
                  </p>
                </div>
              </div>
              <div className="status-online"></div>
            </div>

            {/* Área de mensagens */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-bella-50/30 to-transparent">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-bella-100 rounded-full flex items-center justify-center mb-4">
                    <FiMessageCircle className="w-8 h-8 text-bella-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-bella-800 mb-2">
                    Nenhuma mensagem ainda
                  </h3>
                  <p className="text-bella-600 mb-4">
                    Seja o primeiro a enviar uma mensagem!
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.user_id === user?.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                        message.user_id === user?.id
                          ? "bg-bella-500 text-white"
                          : "bg-gray-100 text-gray-800"
                      } rounded-lg px-4 py-3 relative group`}
                    >
                      {/* Header da mensagem */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium opacity-75">
                            {message.user_name}
                          </span>
                          {message.is_admin && (
                            <FiShield className="w-3 h-3 opacity-75" />
                          )}
                        </div>

                        <div className="flex items-center space-x-1">
                          <span className="text-xs opacity-50">
                            {formatMessageTime(message.created_at)}
                          </span>
                          {message.edited && (
                            <span className="text-xs opacity-50">
                              (editada)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Conteúdo da mensagem */}
                      {editingMessage === message.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => handleEditKeyPress(e, message.id)}
                            className="w-full p-2 text-sm border border-gray-300 rounded text-gray-800 resize-none"
                            rows={2}
                            autoFocus
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleSaveEdit(message.id)}
                              className="p-1 text-green-500 hover:text-green-700"
                            >
                              <FiCheck className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Conteúdo da mensagem - texto ou imagem */}
                          {message.message_type === "image" &&
                          message.image_url ? (
                            <div className="space-y-2">
                              {message.message &&
                                message.message !== "Imagem" && (
                                  <p className="text-sm whitespace-pre-wrap break-words">
                                    {message.message}
                                  </p>
                                )}
                              <div className="relative">
                                <img
                                  src={message.image_url}
                                  alt={message.image_name || "Imagem"}
                                  className="max-w-full max-h-60 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                                  onClick={() => {
                                    // Abrir imagem em nova aba
                                    window.open(message.image_url, "_blank");
                                  }}
                                />
                                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                  <FiImage className="w-3 h-3 inline mr-1" />
                                  {message.image_name || "Imagem"}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.message}
                            </p>
                          )}

                          {/* Botões de ação (só aparecem no hover e se pode modificar) */}
                          {canModifyMessage(message) && (
                            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex space-x-1 bg-white border border-gray-200 rounded-lg shadow-md p-1">
                                {message.message_type === "text" && (
                                  <button
                                    onClick={() => handleStartEdit(message)}
                                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                    title="Editar"
                                  >
                                    <FiEdit2 className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    handleDeleteMessage(message.id)
                                  }
                                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                  title="Deletar"
                                >
                                  <FiTrash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de nova mensagem */}
            <div className="border-t border-bella-200 p-4 bg-white">
              {/* Preview da imagem selecionada */}
              {imagePreview && (
                <div className="mb-4 p-4 bg-gradient-to-r from-bella-50 to-blue-50 rounded-xl border border-bella-200 animate-slide-up">
                  <div className="flex items-start space-x-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-xl shadow-md"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-bella-800">
                        {selectedImage?.name}
                      </p>
                      <p className="text-xs text-bella-600 font-medium">
                        {selectedImage &&
                          (selectedImage.size / 1024 / 1024).toFixed(2)}{" "}
                        MB
                      </p>
                      <div className="mt-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full inline-block">
                        ✓ Pronto para enviar
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveImage}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-xl transition-all duration-200 hover-lift tap-scale"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={
                        selectedImage
                          ? "Adicione uma legenda (opcional)..."
                          : "Digite sua mensagem..."
                      }
                      className="w-full p-4 pr-14 border-2 border-bella-200 rounded-xl resize-none focus:ring-2 focus:ring-bella-500 focus:border-bella-400 transition-all duration-200 bg-white placeholder-bella-400"
                      rows={2}
                      disabled={sending}
                    />

                    {/* Botão de anexar imagem */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute right-3 top-3 p-2 text-bella-400 hover:text-bella-600 hover:bg-bella-50 rounded-xl transition-all duration-200 hover-lift tap-scale touch-button"
                      title="Anexar imagem"
                    >
                      <FiPaperclip className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !selectedImage) || sending}
                  className="px-6 py-4 bg-gradient-to-r from-bella-500 to-bella-400 text-white rounded-xl hover:from-bella-600 hover:to-bella-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2 hover-lift tap-scale font-medium shadow-lg hover:shadow-xl"
                >
                  {sending ? (
                    <FiLoader className="w-5 h-5 animate-spin" />
                  ) : selectedImage ? (
                    <FiImage className="w-5 h-5" />
                  ) : (
                    <FiSend className="w-5 h-5" />
                  )}
                  <span className="hidden sm:inline">
                    {sending
                      ? "Enviando..."
                      : selectedImage
                        ? "Enviar Imagem"
                        : "Enviar"}
                  </span>
                </button>
              </form>

              {/* Input de arquivo oculto */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              <div className="mt-3 flex items-center justify-between text-xs text-bella-500">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <span>💡</span>
                    <span>Enter para enviar, Shift+Enter para nova linha</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <FiPaperclip className="w-3 h-3" />
                    <span>Clique no clipe para anexar imagens</span>
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
