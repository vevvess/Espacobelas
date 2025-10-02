import { useState, useEffect } from "react";
import { testConnection } from "../lib/neon";

export interface NetworkStatus {
  isOnline: boolean;
  isDatabaseConnected: boolean;
  lastChecked: Date | null;
  error: string | null;
}

export const useNetworkStatus = () => {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isDatabaseConnected: true,
    lastChecked: null,
    error: null,
  });

  const checkDatabaseConnection = async () => {
    try {
      const result = await testConnection();
      setStatus((prev) => ({
        ...prev,
        isDatabaseConnected: result.success,
        lastChecked: new Date(),
        error: result.success ? null : result.error || "Erro de conexão",
      }));
      return result.success;
    } catch (error: any) {
      setStatus((prev) => ({
        ...prev,
        isDatabaseConnected: false,
        lastChecked: new Date(),
        error: error.message || "Erro de conexão",
      }));
      return false;
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setStatus((prev) => ({ ...prev, isOnline: true }));
      checkDatabaseConnection();
    };

    const handleOffline = () => {
      setStatus((prev) => ({
        ...prev,
        isOnline: false,
        isDatabaseConnected: false,
        error: "Sem conexão com a internet",
      }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Verificar conexão inicial
    checkDatabaseConnection();

    // Verificar periodicamente (a cada 30 segundos quando offline)
    const interval = setInterval(() => {
      if (!status.isDatabaseConnected) {
        checkDatabaseConnection();
      }
    }, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [status.isDatabaseConnected]);

  return {
    ...status,
    checkDatabaseConnection,
  };
};
