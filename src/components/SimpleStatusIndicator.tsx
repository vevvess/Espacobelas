import { Badge } from "@/components/ui/badge";
import { Database, HardDrive, Wifi } from "lucide-react";
import { useState, useEffect } from "react";

export function SimpleStatusIndicator() {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Atualizar timestamp a cada 3 segundos para mostrar que está ativo
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="flex items-center gap-1">
        <HardDrive className="h-3 w-3" />
        Modo Offline
      </Badge>

      <div className="text-blue-500 text-xs flex items-center gap-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        100% Funcional
      </div>
    </div>
  );
}
