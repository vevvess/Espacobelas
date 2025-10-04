import React, { useState, useEffect, startTransition } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/SimpleAuthContext";
import {
  FiHome,
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiSettings,
  FiMenu,
  FiX,
  FiHeart,
  FiLogOut,
  FiMessageCircle,
  FiFileText,
  FiTrendingUp,
  FiUserCheck,
  FiShield,
  FiBarChart,
  FiTool,
  FiPackage,
} from "react-icons/fi";
import { SystemStatusIndicator } from "./SystemMonitor";
import { prefetchAgendamentos } from "@/hooks/useAgendamentosSimple";

// Prefetch route chunks to speed up navigation
const prefetchers: Record<string, () => Promise<unknown>> = {
  "/dashboard": () => import("../pages/Dashboard"),
  "/agenda": () => import("../pages/Agenda"),
  "/clientes": () => import("../pages/Clientes"),
  "/ficha-cliente": () => import("../pages/FichaCliente"),
  "/clientes-mensais": () => import("../pages/ClientesMensais"),
  "/servicos": () => import("../pages/Servicos"),
  "/caixa": () => import("../pages/Caixa"),
  "/estoque": () => import("../pages/Estoque"),
  "/usuarios": () => import("../pages/Usuarios"),
  "/configuracoes": () => import("../pages/ConfiguracoesSistema"),
  "/relatorios": () => import("../pages/Relatorios"),
};

interface LayoutProps {
  children: React.ReactNode;
}

// Navegação para administradores (acesso completo)
const adminNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: FiHome },
  { name: "Agenda", href: "/agenda", icon: FiCalendar },
  { name: "Clientes", href: "/clientes", icon: FiUsers },
  { name: "Ficha Cliente", href: "/ficha-cliente", icon: FiFileText },
  { name: "Clientes Mensais", href: "/clientes-mensais", icon: FiCalendar },
  { name: "Serviços", href: "/servicos", icon: FiSettings },
  { name: "Caixa", href: "/caixa", icon: FiDollarSign },
  { name: "Estoque", href: "/estoque", icon: FiPackage },
  // Relatórios mantido visível porém desativado temporariamente
  { name: "Relatórios", href: "/relatorios", icon: FiBarChart, disabled: true },
];

// Navegação para funcionários (agenda, chat e ficha cliente)
const staffNavigation = [
  { name: "Agenda", href: "/agenda", icon: FiCalendar },
  { name: "Ficha Cliente", href: "/ficha-cliente", icon: FiFileText },
];

const adminOnlyNavigation = [
  { name: "Usuários", href: "/usuarios", icon: FiShield },
  { name: "Configurações", href: "/configuracoes", icon: FiTool },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const getTodayRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { start, end };
  };

  // Prefetch commonly used routes and Agenda data on mount (idle)
  useEffect(() => {
    const id = (window as any).requestIdleCallback?.(() => {
      prefetchers["/agenda"]?.();
      prefetchers["/dashboard"]?.();
      if (user?.id) {
        const { start, end } = getTodayRange();
        prefetchAgendamentos(user.id, start, end);
      }
    }, { timeout: 1500 });
    return () => {
      if (id && (window as any).cancelIdleCallback) (window as any).cancelIdleCallback(id);
    };
  }, [user?.id]);

  // Função para fechar sidebar garantindo que sempre funcione
  const closeSidebar = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setSidebarOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      startTransition(() => navigate("/login"));
    } catch (error: any) {
      console.error("Error signing out:", error?.message || error);
    }
  };

  const isActive = (href: string) => location.pathname === href;

  // Determinar navegação baseada no role do usuário
  const navigation = user?.is_admin ? adminNavigation : staffNavigation;

  return (
    <div className="min-h-screen bg-gradient-to-br from-bella-50 via-white to-bella-25 flex overflow-hidden">
      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={closeSidebar}
          style={{ touchAction: "manipulation" }}
          aria-label="Fechar menu lateral"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-72 sm:w-64 bg-white shadow-2xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:shadow-lg
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 bg-gradient-to-r from-bella-500 to-bella-400 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-bella-600/20 to-transparent animate-pulse-soft"></div>
          <div className="flex items-center space-x-2 sm:space-x-3 relative z-10">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover-glow">
              <FiHeart className="w-4 h-4 sm:w-6 sm:h-6 text-white animate-pulse-soft" />
            </div>
            <span className="text-white font-bold text-lg sm:text-xl tracking-wide">
              Bella's
            </span>
          </div>
          <button
            onClick={(e) => closeSidebar(e)}
            onTouchEnd={(e) => {
              e.preventDefault();
              closeSidebar(e);
            }}
            className="lg:hidden text-white hover:text-bella-200 transition-all duration-200 p-3 rounded-lg hover:bg-white/10 touch-button sidebar-close-btn min-w-[44px] min-h-[44px] flex items-center justify-center relative z-50 cursor-pointer"
            style={{
              touchAction: "manipulation",
              WebkitTapHighlightColor: "rgba(255, 255, 255, 0.2)",
              userSelect: "none",
            }}
            aria-label="Fechar menu"
            type="button"
          >
            <FiX className="w-6 h-6 pointer-events-none" />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* User Profile */}
          <div className="p-3 sm:p-4 border-b border-bella-100 animate-slide-up">
            <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-xl bg-gradient-to-r from-bella-50 to-transparent hover:from-bella-100 transition-all duration-300">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-bella-400 to-bella-300 rounded-full flex items-center justify-center hover-glow transition-all duration-300 hover:scale-105">
                  {user?.is_admin ? (
                    <FiShield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  ) : (
                    <FiUserCheck className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1">
                  <div className="status-online w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full border border-white"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-bella-800 truncate">
                  {user?.nome || "Usuário"}
                </p>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <p className="text-xs text-bella-600 capitalize">
                    {user?.is_admin ? "Admin" : "Staff"}
                  </p>
                  {user?.is_admin && (
                    <span className="bg-bella-200 text-bella-800 text-xs px-1 sm:px-2 py-0.5 rounded-full font-medium">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 sm:px-3 py-4 sm:py-6 space-y-1 sm:space-y-2 overflow-y-auto">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const isReadonly = "readonly" in item && item.readonly;
              const isDisabled = "disabled" in item && item.disabled;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onMouseEnter={() => {
                    prefetchers[item.href]?.();
                    if (item.href === "/agenda" && user?.id) {
                      const { start, end } = getTodayRange();
                      prefetchAgendamentos(user.id, start, end);
                    }
                  }}
                  onFocus={() => {
                    prefetchers[item.href]?.();
                    if (item.href === "/agenda" && user?.id) {
                      const { start, end } = getTodayRange();
                      prefetchAgendamentos(user.id, start, end);
                    }
                  }}
                  onTouchStart={() => {
                    prefetchers[item.href]?.();
                    if (item.href === "/agenda" && user?.id) {
                      const { start, end } = getTodayRange();
                      prefetchAgendamentos(user.id, start, end);
                    }
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isDisabled) {
                      startTransition(() => {
                        navigate(item.href);
                        closeSidebar();
                      });
                    }
                  }}
                  aria-disabled={isDisabled ? true : undefined}
                  className={`
                    group flex items-center px-3 sm:px-4 py-2 sm:py-3 text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-300 relative overflow-hidden touch-button
                    ${
                      isDisabled
                        ? "text-bella-400 bg-bella-50 cursor-not-allowed opacity-60"
                        : isActive(item.href)
                        ? "bg-gradient-to-r from-bella-100 to-bella-50 text-bella-800 shadow-md border-l-2 sm:border-l-4 border-bella-500 hover-lift"
                        : "text-bella-600 hover:bg-bella-50 hover:text-bella-800 hover:shadow-sm hover-lift"
                    }
                  `}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                  title={isDisabled ? "Em breve" : undefined}
                >
                  {isActive(item.href) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-bella-500/10 to-transparent animate-pulse-soft"></div>
                  )}

                  <div
                    className={`
                    w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center mr-2 sm:mr-3 transition-all duration-300
                    ${
                      isActive(item.href)
                        ? "bg-bella-500 text-white shadow-lg"
                        : "bg-transparent group-hover:bg-bella-100"
                    }
                  `}
                  >
                    <Icon
                      className={`
                      w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300
                      ${isActive(item.href) ? "text-white" : "text-bella-400 group-hover:text-bella-600"}
                    `}
                    />
                  </div>

                  <span className="flex-1 font-medium">{item.name}</span>

                  {isDisabled && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">Desativado</span>
                  )}

                  {isReadonly && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium animate-bounce-subtle">
                      Visualização
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Admin Section */}
            {user?.is_admin && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-bella-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs font-semibold text-bella-500 uppercase tracking-wider">
                      Administração
                    </span>
                  </div>
                </div>
                {adminOnlyNavigation.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(item.href);
                        closeSidebar();
                      }}
                      className={`
                        group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 hover-lift tap-scale relative overflow-hidden
                        ${
                          isActive(item.href)
                            ? "bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 shadow-md border-l-4 border-purple-500"
                            : "text-bella-600 hover:bg-purple-50 hover:text-purple-800 hover:shadow-sm"
                        }
                      `}
                      style={{
                        animationDelay: `${(navigation.length + index) * 100}ms`,
                      }}
                    >
                      {isActive(item.href) && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent animate-pulse-soft"></div>
                      )}

                      <div
                        className={`
                        w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-300
                        ${
                          isActive(item.href)
                            ? "bg-purple-500 text-white shadow-lg"
                            : "bg-transparent group-hover:bg-purple-100"
                        }
                      `}
                      >
                        <Icon
                          className={`
                          w-4 h-4 transition-all duration-300
                          ${isActive(item.href) ? "text-white" : "text-purple-400 group-hover:text-purple-600"}
                        `}
                        />
                      </div>

                      <span className="flex-1 font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t border-bella-100 animate-slide-up">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-300 group hover-lift tap-scale relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 bg-transparent group-hover:bg-red-100 transition-all duration-300">
                <FiLogOut className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-all duration-300" />
              </div>

              <span className="flex-1 font-medium">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b border-bella-100 animate-slide-down mobile-safe-top">
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-6 overflow-x-hidden">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden touch-button text-bella-600 hover:text-bella-800 transition-all duration-200 p-2 rounded-lg hover:bg-bella-100 flex-shrink-0"
              >
                <FiMenu className="w-5 h-5" />
              </button>
              <div className="animate-fade-in flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-bella-800 tracking-tight truncate">
                  {navigation.find((item) => isActive(item.href))?.name ||
                    adminOnlyNavigation.find((item) => isActive(item.href))
                      ?.name ||
                    "Espaço Bella's"}
                </h1>
                <div className="w-8 sm:w-12 h-0.5 sm:h-1 bg-gradient-to-r from-bella-500 to-bella-300 rounded-full mt-1 animate-scale-in"></div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {/* System Status */}
              <div className="hidden sm:block">
                <SystemStatusIndicator />
              </div>

              <div className="hidden md:block text-right animate-slide-up">
                <p className="text-xs sm:text-sm font-semibold text-bella-800 truncate max-w-[120px] sm:max-w-none">
                  {user?.nome || "Usuário"}
                </p>
                <p className="text-xs text-bella-600 font-medium hidden lg:block">
                  {new Date().toLocaleDateString("pt-BR", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-bella-400 to-bella-300 rounded-full flex items-center justify-center shadow-md">
                {user?.is_admin ? (
                  <FiShield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                ) : (
                  <FiUserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-bella-50 via-white to-bella-50 relative mobile-safe-bottom">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-5 hidden sm:block">
            <div className="absolute top-20 left-10 w-32 sm:w-64 h-32 sm:h-64 bg-bella-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-48 sm:w-96 h-48 sm:h-96 bg-bella-300 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 mobile-container">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
