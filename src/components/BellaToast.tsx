import React, { useEffect, useState } from "react";
import { FiCheck, FiX, FiAlertTriangle, FiInfo, FiHeart } from "react-icons/fi";

interface BellaToastProps {
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
  onClose: () => void;
}

export function BellaToast({
  type,
  title,
  description,
  duration = 5000,
  onClose,
}: BellaToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <FiCheck className="w-5 h-5" />,
    error: <FiX className="w-5 h-5" />,
    warning: <FiAlertTriangle className="w-5 h-5" />,
    info: <FiInfo className="w-5 h-5" />,
  };

  const styles = {
    success: {
      bg: "bg-gradient-to-r from-green-50 to-emerald-50",
      border: "border-green-200",
      iconBg: "bg-green-500",
      textColor: "text-green-800",
      descColor: "text-green-600",
    },
    error: {
      bg: "bg-gradient-to-r from-red-50 to-pink-50",
      border: "border-red-200",
      iconBg: "bg-red-500",
      textColor: "text-red-800",
      descColor: "text-red-600",
    },
    warning: {
      bg: "bg-gradient-to-r from-yellow-50 to-orange-50",
      border: "border-yellow-200",
      iconBg: "bg-yellow-500",
      textColor: "text-yellow-800",
      descColor: "text-yellow-600",
    },
    info: {
      bg: "bg-gradient-to-r from-blue-50 to-indigo-50",
      border: "border-blue-200",
      iconBg: "bg-blue-500",
      textColor: "text-blue-800",
      descColor: "text-blue-600",
    },
  };

  const style = styles[type];

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      <div
        className={`
          ${style.bg} ${style.border} border-2 rounded-xl p-4 shadow-xl backdrop-blur-sm
          hover:shadow-2xl transition-all duration-300 group
        `}
      >
        <div className="flex items-start space-x-3">
          <div
            className={`
              ${style.iconBg} w-10 h-10 rounded-full flex items-center justify-center text-white
              group-hover:scale-110 transition-transform duration-300
            `}
          >
            {icons[type]}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold ${style.textColor} mb-1`}>{title}</h4>
            {description && (
              <p className={`text-sm ${style.descColor}`}>{description}</p>
            )}
          </div>

          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className={`
              ${style.textColor} hover:bg-white/50 p-1 rounded-lg transition-all duration-200
              hover-lift tap-scale
            `}
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 w-full bg-white/30 rounded-full h-1 overflow-hidden">
          <div
            className={`h-full ${style.iconBg} rounded-full animate-progress`}
            style={{
              animation: `progress ${duration}ms linear forwards`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

// Success toast shorthand
export function SuccessToast({
  title,
  description,
  onClose,
}: {
  title: string;
  description?: string;
  onClose: () => void;
}) {
  return (
    <BellaToast
      type="success"
      title={title}
      description={description}
      onClose={onClose}
    />
  );
}

// Error toast shorthand
export function ErrorToast({
  title,
  description,
  onClose,
}: {
  title: string;
  description?: string;
  onClose: () => void;
}) {
  return (
    <BellaToast
      type="error"
      title={title}
      description={description}
      onClose={onClose}
    />
  );
}

// Bella's branded success toast
export function BellaSuccessToast({
  title,
  description,
  onClose,
}: {
  title: string;
  description?: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-slide-up">
      <div className="bg-gradient-to-r from-bella-500 to-bella-400 rounded-xl p-4 shadow-xl text-white">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <FiHeart className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-1">{title}</h4>
            {description && (
              <p className="text-sm text-white/90">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-all duration-200"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
