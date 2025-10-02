import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { SimpleAuthProvider, useAuth } from "./contexts/SimpleAuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleProtectedRoute } from "./components/RoleProtectedRoute";
import Layout from "./components/Layout";
import AuthErrorBoundary from "./components/AuthErrorBoundary";
import { NetworkStatusIndicator } from "./components/NetworkStatusIndicator";
import { OfflineModeIndicator } from "./components/OfflineModeIndicator";
import React, { Suspense, lazy } from "react";

// Detect static preview host (no server rewrites)
const isStaticHost =
  typeof window !== "undefined" &&
  (window.location.hostname.endsWith("cosine.page") || window.location.protocol === "file:");

// Choose router implementation accordingly
const RouterImpl = isStaticHost ? HashRouter : BrowserRouter;

// Pages (code-splitting)
const SimpleLogin = lazy(() => import("./pages/SimpleLogin"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Agenda = lazy(() => import("./pages/Agenda"));
const Clientes = lazy(() => import("./pages/Clientes"));
const ClientesMensais = lazy(() => import("./pages/ClientesMensais"));
const Servicos = lazy(() => import("./pages/Servicos"));
const Caixa = lazy(() => import("./pages/Caixa"));
const Comissoes = lazy(() => import("./pages/Comissoes"));
const Relatorios = lazy(() => import("./pages/Relatorios"));
const FichaCliente = lazy(() => import("./pages/FichaCliente"));
const Usuarios = lazy(() => import("./pages/Usuarios"));
const ConfiguracoesSistema = lazy(() => import("./pages/ConfiguracoesSistema"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Component to redirect based on user role
const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();

  // Mostrar loading enquanto carrega o usuário
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

  // Se não há usuário, redirecionar para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirecionar com base no role do usuário
  return user.is_admin ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/agenda" replace />
  );
};

// AppRoutes component that requires auth context
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-bella-500 border-t-transparent rounded-full animate-spin"/></div>}>
          <SimpleLogin />
        </Suspense>
      } />

      {/* Protected routes - Dashboard (Admin only) */}
      <Route
        path="/dashboard"
        element={
          <RoleProtectedRoute requireAdmin={true}>
            <Layout>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-bella-500 border-t-transparent rounded-full animate-spin"/></div>}>
                <Dashboard />
              </Suspense>
            </Layout>
          </RoleProtectedRoute>
        }
      />

      {/* Protected routes - Agenda (Admin: full access, Staff: readonly) */}
      <Route
        path="/agenda"
        element={
          <RoleProtectedRoute allowedRoles={["admin", "staff"]}>
            <Layout>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-bella-500 border-t-transparent rounded-full animate-spin"/></div>}>
                <Agenda />
              </Suspense>
            </Layout>
          </RoleProtectedRoute>
        }
      />


      {/* Protected routes - Clientes (Admin only) */}
      <Route
        path="/clientes"
        element={
          <RoleProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-bella-500 border-t-transparent rounded-full animate-spin"/></div>}>
                <Clientes />
              </Suspense>
            </Layout>
          </RoleProtectedRoute>
        }
      />

      {/* ADMIN-ONLY ROUTES */}

      {/* Protected routes - Relatórios (Admin only) */}
      <Route
        path="/relatorios"
        element={
          <RoleProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-bella-500 border-t-transparent rounded-full animate-spin"/></div>}>
                <Relatorios />
              </Suspense>
            </Layout>
          </RoleProtectedRoute>
        }
      />

      {/* Protected routes - Serviços (Admin only) */}
      <Route
        path="/servicos"
        element={
          <RoleProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-bella-500 border-t-transparent rounded-full animate-spin"/></div>}>
                <Servicos />
              </Suspense>
            </Layout>
          </RoleProtectedRoute>
        }
      />

      {/* Protected routes - Caixa (Admin only) */}
      <Route
        path="/caixa"
        element={
          <RoleProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-bella-500 border-t-transparent rounded-full animate-spin"/></div>}>
                <Caixa />
              </Suspense>
            </Layout>
          </RoleProtectedRoute>
        }
      />

      {/* Protected routes - Usuários (Admin only) */}
      <Route
        path="/usuarios"
        element={
          <RoleProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-bella-500 border-t-transparent rounded-full animate-spin"/></div>}>
                <Usuarios />
              </Suspense>
            </Layout>
          </RoleProtectedRoute>
        }
      />

      {/* Protected routes - Clientes Mensais (Admin only) */}
      <Route
        path="/clientes-mensais"
        element={
          <RoleProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-bella-500 border-t-transparent rounded-full animate-spin"/></div>}>
                <ClientesMensais />
              </Suspense>
            </Layout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/configuracoes"
        element={
          <RoleProtectedRoute requireAdmin={true}>
            <Layout>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-bella-500 border-t-transparent rounded-full animate-spin"/></div>}>
                <ConfiguracoesSistema />
              </Suspense>
            </Layout>
          </RoleProtectedRoute>
        }
      />

      {/* Protected routes - Ficha Cliente (Admin and Staff) */}
      <Route
        path="/ficha-cliente"
        element={
          <RoleProtectedRoute allowedRoles={["admin", "staff"]}>
            <Layout>
              <FichaCliente />
            </Layout>
          </RoleProtectedRoute>
        }
      />

      {/* Redirect root based on user role */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoleBasedRedirect />
          </ProtectedRoute>
        }
      />

      {/* 404 page */}
      <Route path="*" element={
        <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-bella-500 border-t-transparent rounded-full animate-spin"/></div>}>
          <NotFound />
        </Suspense>
      } />
    </Routes>
  );
};

// Main App component
const App = () => {
  return (
    <AuthErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <RouterImpl>
            <SimpleAuthProvider>
              <AppRoutes />
              <NetworkStatusIndicator />
              <OfflineModeIndicator />
            </SimpleAuthProvider>
          </RouterImpl>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthErrorBoundary>
  );
};

export default App;
