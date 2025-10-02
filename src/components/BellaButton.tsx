import React from "react";
import { FiLoader } from "react-icons/fi";

interface BellaButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function BellaButton({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: BellaButtonProps) {
  const baseClasses =
    "font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-bella-500 focus:ring-offset-2 hover-lift tap-scale relative overflow-hidden";

  const variants = {
    primary:
      "bg-gradient-to-r from-bella-500 to-bella-400 text-white hover:from-bella-600 hover:to-bella-500 shadow-lg hover:shadow-xl",
    secondary:
      "bg-bella-100 text-bella-800 hover:bg-bella-200 border-2 border-bella-200 hover:border-bella-300",
    outline:
      "border-2 border-bella-500 text-bella-600 hover:bg-bella-50 hover:border-bella-600",
    ghost: "text-bella-600 hover:bg-bella-50 hover:text-bella-700",
    danger:
      "bg-gradient-to-r from-red-500 to-red-400 text-white hover:from-red-600 hover:to-red-500 shadow-lg hover:shadow-xl",
    success:
      "bg-gradient-to-r from-green-500 to-green-400 text-white hover:from-green-600 hover:to-green-500 shadow-lg hover:shadow-xl",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {/* Hover effect overlay */}
      {variant === "primary" && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      )}

      <span className="relative z-10 flex items-center justify-center space-x-2">
        {loading ? (
          <FiLoader className={`${iconSizes[size]} animate-spin`} />
        ) : (
          icon &&
          iconPosition === "left" && (
            <span className={iconSizes[size]}>{icon}</span>
          )
        )}

        <span>{children}</span>

        {!loading && icon && iconPosition === "right" && (
          <span className={iconSizes[size]}>{icon}</span>
        )}
      </span>
    </button>
  );
}

// Shorthand components
export function PrimaryButton(props: Omit<BellaButtonProps, "variant">) {
  return <BellaButton variant="primary" {...props} />;
}

export function SecondaryButton(props: Omit<BellaButtonProps, "variant">) {
  return <BellaButton variant="secondary" {...props} />;
}

export function OutlineButton(props: Omit<BellaButtonProps, "variant">) {
  return <BellaButton variant="outline" {...props} />;
}

export function DangerButton(props: Omit<BellaButtonProps, "variant">) {
  return <BellaButton variant="danger" {...props} />;
}

export function SuccessButton(props: Omit<BellaButtonProps, "variant">) {
  return <BellaButton variant="success" {...props} />;
}

// Icon-only button
export function IconButton({
  icon,
  variant = "ghost",
  size = "md",
  ...props
}: Omit<BellaButtonProps, "children"> & { icon: React.ReactNode }) {
  const padding = {
    sm: "p-2",
    md: "p-3",
    lg: "p-4",
  };

  return (
    <BellaButton
      variant={variant}
      size={size}
      className={`${padding[size]} !px-0`}
      {...props}
    >
      {icon}
    </BellaButton>
  );
}
