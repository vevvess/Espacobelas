import React, { useState, useEffect } from "react";
import { FiWifi, FiWifiOff, FiActivity } from "react-icons/fi";

interface ChatStatusProps {
  isConnected?: boolean;
  lastActivity?: number;
  messagesCount?: number;
}

export function ChatStatus({
  isConnected = true,
  lastActivity = Date.now(),
  messagesCount = 0,
}: ChatStatusProps) {
  const [timeSinceActivity, setTimeSinceActivity] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSinceActivity(Date.now() - lastActivity);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastActivity]);

  const getStatusText = () => {
    if (!isConnected) return "Desconectado";

    const secondsAgo = Math.floor(timeSinceActivity / 1000);

    if (secondsAgo < 2) return "Tempo Real";
    if (secondsAgo < 10) return `${secondsAgo}s atrás`;
    if (secondsAgo < 60) return `${secondsAgo}s atrás`;

    const minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60) return `${minutesAgo}m atrás`;

    return "Inativo";
  };

  const getStatusColor = () => {
    if (!isConnected) return "text-red-500";

    const secondsAgo = Math.floor(timeSinceActivity / 1000);

    if (secondsAgo < 3) return "text-green-500";
    if (secondsAgo < 10) return "text-yellow-500";
    if (secondsAgo < 30) return "text-orange-500";

    return "text-red-500";
  };

  const getStatusIcon = () => {
    if (!isConnected) {
      return <FiWifiOff className="w-3 h-3" />;
    }

    const secondsAgo = Math.floor(timeSinceActivity / 1000);

    if (secondsAgo < 3) {
      return (
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      );
    }

    return <FiActivity className="w-3 h-3" />;
  };

  return (
    <div className="flex items-center space-x-2 text-xs">
      <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </div>

      {messagesCount > 0 && (
        <div className="text-gray-400">• {messagesCount} mensagens</div>
      )}
    </div>
  );
}
