import React, { useEffect } from "react";
import { useAuth } from "../contexts/SimpleAuthContext";
import { useNavigate } from "react-router-dom";

export function AuthDebug() {
  const { user, loading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("=== AUTH DEBUG ===");
    console.log("Loading:", loading);
    console.log("User:", user);
    console.log("Error:", error);
    console.log("==================");
  }, [loading, user, error]);

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded p-4 shadow-lg z-50 max-w-sm">
      <h3 className="font-bold text-sm mb-2">Auth Debug</h3>
      <div className="text-xs space-y-1">
        <p>
          <strong>Loading:</strong> {String(loading)}
        </p>
        <p>
          <strong>User:</strong> {user ? user.username : "null"}
        </p>
        <p>
          <strong>Is Admin:</strong> {user?.is_admin ? "true" : "false"}
        </p>
        <p>
          <strong>Error:</strong> {error || "none"}
        </p>
        <p>
          <strong>LocalStorage:</strong>{" "}
          {localStorage.getItem("simple_auth_user") ? "present" : "empty"}
        </p>
      </div>

      <div className="mt-3 space-y-1">
        <button
          onClick={() => navigate("/agenda")}
          className="w-full bg-blue-500 text-white text-xs py-1 px-2 rounded hover:bg-blue-600"
        >
          Ir para Agenda
        </button>
        <button
          onClick={() => navigate("/clientes")}
          className="w-full bg-green-500 text-white text-xs py-1 px-2 rounded hover:bg-green-600"
        >
          Ir para Clientes
        </button>
        <button
          onClick={() => (window.location.href = "/agenda")}
          className="w-full bg-red-500 text-white text-xs py-1 px-2 rounded hover:bg-red-600"
        >
          Force Reload (/agenda)
        </button>
      </div>
    </div>
  );
}
