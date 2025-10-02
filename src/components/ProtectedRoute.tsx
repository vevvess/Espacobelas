import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/SimpleAuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

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

  if (requireAdmin && !user.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bella-50 to-bella-100">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-bella-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-bella-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-bella-800 mb-2">
            Acesso Negado
          </h2>
          <p className="text-bella-600">
            Apenas administradores podem acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
