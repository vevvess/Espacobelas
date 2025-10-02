import { useRealTimeConnection } from "@/lib/realTimeConnector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wifi, WifiOff, Database } from "lucide-react";
import { useState } from "react";

export function RealTimeStatusIndicator() {
  const { isConnected, timeSinceLastSuccess, pendingOperations, forceReconnection } = useRealTimeConnection();
  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      await forceReconnection();
    } finally {
      setIsReconnecting(false);
    }
  };

  const getStatusColor = () => {
    if (!isConnected) return "destructive";
    if (timeSinceLastSuccess > 30000) return "secondary";
    return "default";
  };

  const getStatusText = () => {
    if (!isConnected) return "Desconectado";
    if (pendingOperations > 0) return `${pendingOperations} operações pendentes`;
    if (timeSinceLastSuccess > 30000) return "Conexão instável";
    return "Online";
  };

  const getStatusIcon = () => {
    if (!isConnected) return <WifiOff className="h-3 w-3" />;
    if (pendingOperations > 0) return <RefreshCw className="h-3 w-3 animate-spin" />;
    return <Database className="h-3 w-3" />;
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getStatusColor()} className="flex items-center gap-1">
        {getStatusIcon()}
        {getStatusText()}
      </Badge>
      
      {!isConnected && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleReconnect}
          disabled={isReconnecting}
          className="h-6 px-2"
        >
          {isReconnecting ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Wifi className="h-3 w-3" />
          )}
          Reconectar
        </Button>
      )}
      
      {isConnected && timeSinceLastSuccess < 10000 && (
        <div className="text-green-500 text-xs flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Tempo Real
        </div>
      )}
    </div>
  );
}
