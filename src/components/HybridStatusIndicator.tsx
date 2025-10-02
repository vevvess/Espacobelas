import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Wifi, WifiOff, RefreshCw, Cloud, HardDrive, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export function HybridStatusIndicator() {
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async () => {
    if (typeof window !== 'undefined' && (window as any).hybridService) {
      const currentStatus = (window as any).hybridService.getStatus();
      setStatus(currentStatus);
    }
  };

  useEffect(() => {
    updateStatus();
    
    // Atualizar status a cada 3 segundos
    const interval = setInterval(updateStatus, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    if (typeof window !== 'undefined' && (window as any).hybridService) {
      setIsLoading(true);
      try {
        await (window as any).hybridService.syncNow();
        await updateStatus();
        console.log('✅ Sincronização manual concluída');
      } catch (error) {
        console.error('❌ Erro na sincronização:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTestConnection = async () => {
    if (typeof window !== 'undefined' && (window as any).hybridService) {
      setIsLoading(true);
      try {
        await (window as any).hybridService.testConnection();
        await updateStatus();
        console.log('✅ Teste de conexão concluído');
      } catch (error) {
        console.error('❌ Teste de conexão falhou:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!status) {
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <RefreshCw className="h-3 w-3 animate-spin" />
        Carregando...
      </Badge>
    );
  }

  const getStatusColor = () => {
    if (!status.isOnline) return "destructive";
    if (status.pendingSync > 0) return "secondary";
    return "default";
  };

  const getStatusText = () => {
    if (!status.isOnline) return "Offline";
    if (status.pendingSync > 0) return `${status.pendingSync} pendentes`;
    return "Online";
  };

  const getStatusIcon = () => {
    if (!status.isOnline) return <WifiOff className="h-3 w-3" />;
    if (status.pendingSync > 0) return <HardDrive className="h-3 w-3" />;
    return <Cloud className="h-3 w-3" />;
  };

  const getModeText = () => {
    if (status.isOnline && status.pendingSync === 0) return "Tempo Real";
    if (status.isOnline && status.pendingSync > 0) return "Sincronizando";
    return "Modo Cache";
  };

  const getModeColor = () => {
    if (status.isOnline && status.pendingSync === 0) return "text-green-500";
    if (status.isOnline && status.pendingSync > 0) return "text-orange-500";
    return "text-blue-500";
  };

  const getModeIcon = () => {
    if (status.isOnline && status.pendingSync === 0) return <Zap className="h-2 w-2" />;
    if (status.isOnline && status.pendingSync > 0) return <RefreshCw className="h-2 w-2 animate-spin" />;
    return <HardDrive className="h-2 w-2" />;
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getStatusColor()} className="flex items-center gap-1">
        {getStatusIcon()}
        {getStatusText()}
      </Badge>
      
      <div className={`text-xs flex items-center gap-1 ${getModeColor()}`}>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: 'currentColor'}} />
        {getModeText()}
      </div>

      {status.pendingSync > 0 && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleSync}
          disabled={isLoading}
          className="h-6 px-2"
        >
          {isLoading ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Database className="h-3 w-3" />
          )}
          Sync
        </Button>
      )}
      
      {!status.isOnline && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleTestConnection}
          disabled={isLoading}
          className="h-6 px-2"
        >
          {isLoading ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Wifi className="h-3 w-3" />
          )}
          Testar
        </Button>
      )}
      
      {status.cacheSize > 0 && (
        <div className="text-xs text-gray-500">
          Cache: {status.cacheSize}
        </div>
      )}
      
      <div className="text-xs text-gray-400">
        DB{status.currentClient}/{status.totalClients}
      </div>
    </div>
  );
}
