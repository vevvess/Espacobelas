import React, { createContext, useContext, useEffect, useState } from "react";
import { SYSTEM_UUIDS, isValidUUID } from "../lib/uuid";
import {
  authenticateUser,
  initializeUsersTable,
  UserSimple,
} from "../services/userService";

export interface SimpleUser {
  id: string;
  username: string;
  nome: string;
  is_admin: boolean;
  can_edit_all?: boolean; // Permite ao funcionário ter acesso total à agenda
  ativo: boolean;
  created_at: string;
  updated_at?: string;
}

interface SimpleAuthContextType {
  user: SimpleUser | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<SimpleUser | null>;
  signOut: () => void;
  error: string | null;
  clearError: () => void;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(
  undefined,
);

export const useAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a SimpleAuthProvider");
  }
  return context;
};

interface SimpleAuthProviderProps {
  children: React.ReactNode;
}

export const SimpleAuthProvider: React.FC<SimpleAuthProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Inicializar tabela de usuários e carregar usuário do localStorage
  useEffect(() => {
    const initialize = () => {
      console.log("🔄 Iniciando autenticação...");

      // Verificar se há usuário salvo no localStorage (DIRETO, sem await)
      console.log("💾 Verificando localStorage...");
      try {
        const savedUser = localStorage.getItem("simple_auth_user");
        if (savedUser) {
          console.log("👤 Usuário encontrado no localStorage");
          const userData = JSON.parse(savedUser);

          // Validar se o ID é um UUID válido
          if (!isValidUUID(userData.id)) {
            console.log("❌ UUID inválido, removendo usuário");
            localStorage.removeItem("simple_auth_user");
          } else {
            console.log("✅ Usuário válido carregado:", userData.username);
            // Garantir que o usuário tenha o campo can_edit_all
            if (userData.can_edit_all === undefined) {
              userData.can_edit_all = false;
            }
            setUser(userData);
          }
        } else {
          console.log("📭 Nenhum usuário no localStorage");
        }
      } catch (err) {
        console.log("❌ Erro ao ler localStorage:", err);
        localStorage.removeItem("simple_auth_user");
      }

      console.log("🏁 Finalizando loading da autenticação");
      setLoading(false);
    };

    initialize();

    // Safety timeout para evitar loading infinito
    const safetyTimeout = setTimeout(() => {
      console.log("⚠️ Timeout de segurança ativado - forçando loading = false");
      setLoading(false);
    }, 200);

    return () => clearTimeout(safetyTimeout);
  }, []);

  const signIn = async (
    username: string,
    password: string,
  ): Promise<SimpleUser | null> => {
    try {
      setError(null);
      setLoading(true);

      // Inicializar tabela apenas quando necessário (durante login)
      console.log("📊 Inicializando tabela para login...");
      try {
        await initializeUsersTable();
        console.log("✅ Tabela inicializada para login");
      } catch (err) {
        console.log(
          "⚠️ Erro na inicialização da tabela, usando fallback:",
          err,
        );
      }

      // Primeiro, tentar autenticação hardcoded para admin (fallback)
      if (username === "Weslley" && password === "1808741") {
        const adminUser: SimpleUser = {
          id: SYSTEM_UUIDS.ADMIN_USER,
          username: "Weslley",
          nome: "Weslley Administrador",
          is_admin: true,
          can_edit_all: true, // Admin sempre tem acesso total
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setUser(adminUser);
        localStorage.setItem("simple_auth_user", JSON.stringify(adminUser));
        return adminUser;
      }

      // Tentar autenticação no banco de dados
      const authenticatedUser = await authenticateUser(username, password);

      if (authenticatedUser) {
        const userForState: SimpleUser = {
          id: authenticatedUser.id,
          username: authenticatedUser.username,
          nome: authenticatedUser.nome,
          is_admin: authenticatedUser.is_admin,
          can_edit_all: authenticatedUser.can_edit_all || false,
          ativo: authenticatedUser.ativo,
          created_at: authenticatedUser.created_at.toISOString(),
        };

        setUser(userForState);
        localStorage.setItem("simple_auth_user", JSON.stringify(userForState));
        return userForState;
      }

      // Se chegou aqui, credenciais incorretas
      throw new Error("Usuário ou senha incorretos");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao fazer login";
      console.error("Erro no signIn:", errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("simple_auth_user");
  };

  const value: SimpleAuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    error,
    clearError,
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
};
