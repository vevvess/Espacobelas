import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/SimpleAuthContext";
import { FiShield, FiLock } from "react-icons/fi";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  allowedRoles?: ("admin" | "staff")[];
  redirectTo?: string;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  allowedRoles = ["admin", "staff"],
  redirectTo,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Determinar redirect padrão baseado no role do usuário
  const defaultRedirect = user?.is_admin ? "/dashboard" : "/agenda";
  const finalRedirectTo = redirectTo || defaultRedirect;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bella-50 to-bella-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-bella-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-bella-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar se o usuário tem permissão baseada no role
  const userRole = user.is_admin ? "admin" : "staff";
  const hasPermission = allowedRoles.includes(userRole);

  // Debug temporário
  console.log(
    "RoleProtectedRoute - user:",
    user,
    "userRole:",
    userRole,
    "allowedRoles:",
    allowedRoles,
    "hasPermission:",
    hasPermission,
    "requireAdmin:",
    requireAdmin,
    "path:",
    location.pathname,
  );

  // Se requer admin explicitamente
  if (requireAdmin && !user.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bella-50 to-bella-100">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <FiShield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-bella-800 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-bella-600 mb-4">
            Apenas administradores podem acessar esta página.
          </p>
          <button
            onClick={() => navigate(finalRedirectTo)}
            className="bella-button"
          >
            {user?.is_admin ? "Voltar ao Dashboard" : "Ir para Agenda"}
          </button>
        </div>
      </div>
    );
  }

  // Se não tem permissão baseada no role
  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bella-50 to-bella-100">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
            <FiLock className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold text-bella-800 mb-2">
            Acesso Negado
          </h2>
          <p className="text-bella-600 mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <button
            onClick={() => navigate(finalRedirectTo)}
            className="bella-button"
          >
            {user?.is_admin ? "Voltar ao Dashboard" : "Ir para Agenda"}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Hook para verificar permissões
export const useRolePermissions = () => {
  const { user } = useAuth();

  const isAdmin = user?.is_admin || false;
  const canEditAll = user?.can_edit_all || false;
  const isStaff = !isAdmin;
  const hasFullAccess = isAdmin || canEditAll; // Admin ou funcionário com acesso total

  const canEdit = hasFullAccess;
  const canView = true; // Todos podem visualizar (com restrições de dados)
  const canManageUsers = isAdmin; // Apenas admin pode gerenciar usuários
  const canAccessFullReports = hasFullAccess;
  const canEditCommissions = hasFullAccess;
  const canViewAllValues = hasFullAccess; // Pode ver valores apenas se tiver acesso total

  return {
    isAdmin,
    isStaff,
    canEdit,
    canView,
    canManageUsers,
    canAccessFullReports,
    canEditCommissions,
    canViewAllValues,
    canEditAll,
    hasFullAccess,
    user,
  };
};
