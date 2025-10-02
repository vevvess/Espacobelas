import React, { useState, useEffect } from "react";
import { testConnection } from "@/lib/neon";
import { FiCheck, FiX, FiLoader } from "react-icons/fi";

export function DatabaseTest() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const test = async () => {
      try {
        const isConnected = await testConnection();
        if (isConnected) {
          setStatus("success");
          setMessage("Conexão com Neon Database estabelecida!");
        } else {
          setStatus("error");
          setMessage("Falha na conexão com o banco de dados");
        }
      } catch (error) {
        setStatus("error");
        setMessage(
          `Erro de conexão: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        );
      }
    };

    test();
  }, []);

  const getIcon = () => {
    switch (status) {
      case "loading":
        return <FiLoader className="w-4 h-4 animate-spin" />;
      case "success":
        return <FiCheck className="w-4 h-4 text-green-600" />;
      case "error":
        return <FiX className="w-4 h-4 text-red-600" />;
    }
  };

  const getColor = () => {
    switch (status) {
      case "loading":
        return "border-blue-200 bg-blue-50 text-blue-700";
      case "success":
        return "border-green-200 bg-green-50 text-green-700";
      case "error":
        return "border-red-200 bg-red-50 text-red-700";
    }
  };

  return (
    <div
      className={`p-3 border rounded-lg flex items-center space-x-2 ${getColor()}`}
    >
      {getIcon()}
      <span className="text-sm font-medium">Database Status:</span>
      <span className="text-sm">{message}</span>
    </div>
  );
}
