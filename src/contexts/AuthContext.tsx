import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  UserCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, USE_MOCK_AUTH } from "../lib/firebase";
import {
  mockUsers,
  mockSignInWithEmailAndPassword,
  mockSignOut,
  mockOnAuthStateChanged,
  setMockAuthUser,
  type MockUser,
} from "../lib/mockAuth";
import { createOrUpdateUser, getUserByFirebaseUid } from "../services/database";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "admin" | "professional" | "receptionist";
  createdAt: Date;
  lastLogin: Date;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const signIn = async (
    email: string,
    password: string,
  ): Promise<UserCredential> => {
    try {
      setError(null);

      if (USE_MOCK_AUTH) {
        // Use mock authentication directly

        const mockResult = await mockSignInWithEmailAndPassword(
          email,
          password,
        );
        const mockUser = mockUsers.find((u) => u.email === email);

        if (mockUser) {
          // Set mock user in localStorage
          setMockAuthUser(mockResult.user as MockUser);

          // Create a UserCredential-like object
          return {
            user: mockResult.user as any,
            operationType: "signIn" as any,
            providerId: "mock" as any,
          };
        }

        throw new Error("auth/invalid-credential");
      } else {
        // Use Firebase authentication
        const result = await signInWithEmailAndPassword(auth, email, password);

        // Update last login
        if (result.user) {
          try {
            const userRef = doc(db, "users", result.user.uid);
            await setDoc(
              userRef,
              {
                lastLogin: new Date(),
                email: result.user.email,
              },
              { merge: true },
            );
          } catch (dbError) {
            console.warn("Could not update last login:", dbError);
            // Don't fail login if we can't update the database
          }
        }

        return result;
      }
    } catch (error: any) {
      console.error("Sign in error:", error.code || error.message);

      const errorMessages: { [key: string]: string } = {
        "auth/user-not-found": "Usuário não encontrado",
        "auth/wrong-password": "Senha incorreta",
        "auth/invalid-email": "Email inválido",
        "auth/user-disabled": "Usuário desabilitado",
        "auth/too-many-requests":
          "Muitas tentativas. Tente novamente mais tarde",
        "auth/network-request-failed":
          "Erro de conexão. Verifique sua internet",
        "auth/invalid-credential":
          "Credenciais inválidas. Verifique email e senha",
      };

      // Handle specific errors for mock auth
      if (USE_MOCK_AUTH && error.message === "auth/invalid-credential") {
        setError(
          "Credenciais inválidas. Use uma das contas de demonstração disponíveis.",
        );
      } else {
        setError(
          errorMessages[error.code] ||
            errorMessages[error.message] ||
            "Erro ao fazer login. Tente novamente.",
        );
      }
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setError(null);

      if (USE_MOCK_AUTH) {
        await mockSignOut();
        setMockAuthUser(null);
      } else {
        await firebaseSignOut(auth);
      }

      setUser(null);
      setProfile(null);
    } catch (error: any) {
      setError("Erro ao fazer logout");
      throw error;
    }
  };

  const loadUserProfile = async (user: User) => {
    try {
      // Sempre sincroniza com o Neon Database
      const neonUser = await createOrUpdateUser({
        firebase_uid: user.uid,
        email: user.email!,
        name: user.displayName || user.email!.split("@")[0],
        role: "professional", // Default role
      });

      setProfile({
        id: user.uid,
        email: neonUser.email,
        name: neonUser.name || user.email!.split("@")[0],
        role: neonUser.role as "admin" | "professional" | "receptionist",
        createdAt: neonUser.created_at,
        lastLogin: new Date(),
      });

      // Também atualiza o Firestore se não for mock auth
      if (!USE_MOCK_AUTH) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          const defaultProfile = {
            name: neonUser.name || user.email!.split("@")[0],
            role: neonUser.role,
            createdAt: neonUser.created_at,
            lastLogin: new Date(),
            email: user.email!,
          };

          await setDoc(userRef, defaultProfile);
        } else {
          // Atualiza last login
          await setDoc(
            userRef,
            {
              lastLogin: new Date(),
            },
            { merge: true },
          );
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error);

      // Fallback para perfil local se houver erro no banco
      setProfile({
        id: user.uid,
        email: user.email!,
        name: user.displayName || user.email!.split("@")[0],
        role: "professional",
        createdAt: new Date(),
        lastLogin: new Date(),
      });
    }
  };

  useEffect(() => {
    let unsubscribe: () => void;

    const initializeAuth = async () => {
      if (USE_MOCK_AUTH) {
        // Use mock auth state listener
        unsubscribe = mockOnAuthStateChanged(async (mockUser) => {
          if (mockUser) {
            setUser(mockUser as any);
            const foundUser = mockUsers.find((u) => u.email === mockUser.email);
            if (foundUser) {
              setProfile({
                id: mockUser.uid,
                email: mockUser.email!,
                name: foundUser.profile.name,
                role: foundUser.profile.role,
                createdAt: foundUser.profile.createdAt,
                lastLogin: new Date(),
              });
            }
          } else {
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        });
      } else {
        // Use Firebase auth state listener
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          setUser(user);

          if (user) {
            await loadUserProfile(user);
          } else {
            setProfile(null);
          }

          setLoading(false);
        });
      }
    };

    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []); // Empty dependency array since USE_MOCK_AUTH is constant

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
