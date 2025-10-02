import React from "react";
import { FiLoader, FiHeart } from "react-icons/fi";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  showBrand?: boolean;
}

export function LoadingSpinner({
  size = "md",
  text = "Carregando...",
  showBrand = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const containerClasses = {
    sm: "space-y-2",
    md: "space-y-4",
    lg: "space-y-6",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center animate-fade-in ${containerClasses[size]}`}
    >
      {showBrand && (
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-bella-500 to-bella-400 rounded-full flex items-center justify-center animate-pulse-soft">
            <FiHeart className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-bella-800">Bella's</span>
        </div>
      )}

      <div className="relative">
        <div
          className={`${sizeClasses[size]} border-4 border-bella-200 border-t-bella-500 rounded-full animate-spin`}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`${size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : "w-3 h-3"} bg-bella-500 rounded-full animate-pulse`}
          ></div>
        </div>
      </div>

      {text && (
        <p
          className={`text-bella-600 font-medium animate-pulse-soft ${
            size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg"
          }`}
        >
          {text}
        </p>
      )}

      <div className="flex space-x-1">
        <div
          className="w-2 h-2 bg-bella-400 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-bella-400 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-bella-400 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
    </div>
  );
}

export function FullPageLoader({ text = "Carregando..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <LoadingSpinner size="lg" text={text} showBrand />
    </div>
  );
}

export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return <div className={`loading-skeleton ${className}`}></div>;
}
