// COSINE_APP_SENTINEL: BELLA-APP-V1 (Estoque + Caixa + UI nova)
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Debug: Forçar login do admin se não houver usuário logado
if (typeof window !== 'undefined') {
  const savedUser = localStorage.getItem('simple_auth_user');
  if (!savedUser) {
    console.log('🔧 DEBUG: Forçando login do admin...');
    const adminUser = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      username: "Weslley",
      nome: "Weslley Raphael",
      is_admin: true,
      can_edit_all: true,
      ativo: true,
      created_at: new Date().toISOString()
    };

    localStorage.setItem('simple_auth_user', JSON.stringify(adminUser));
    console.log('✅ Admin logado automaticamente:', adminUser);
  } else {
    console.log('👤 Usuário já logado:', JSON.parse(savedUser));
  }
}

createRoot(document.getElementById("root")!).render(<App />);
