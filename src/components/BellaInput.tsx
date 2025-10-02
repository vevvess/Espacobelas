import React from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface BellaInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export function BellaInput({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  className = "",
  type = "text",
  ...props
}: BellaInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const inputType = showPasswordToggle
    ? showPassword
      ? "text"
      : "password"
    : type;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-bella-800">
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bella-400">
            {leftIcon}
          </div>
        )}

        <input
          type={inputType}
          className={`
            w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none
            ${leftIcon ? "pl-12" : ""}
            ${rightIcon || showPasswordToggle ? "pr-12" : ""}
            ${
              error
                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : isFocused
                  ? "border-bella-400 focus:border-bella-500 focus:ring-2 focus:ring-bella-500/20"
                  : "border-bella-200 hover:border-bella-300"
            }
            placeholder-bella-400 text-bella-800
            ${className}
          `}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />

        {(rightIcon || showPasswordToggle) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {showPasswordToggle ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-bella-400 hover:text-bella-600 transition-colors p-1 rounded-lg hover:bg-bella-50"
              >
                {showPassword ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="text-bella-400">{rightIcon}</div>
            )}
          </div>
        )}

        {/* Focus ring animation */}
        {isFocused && (
          <div className="absolute inset-0 rounded-xl border-2 border-bella-500 animate-pulse-soft pointer-events-none"></div>
        )}
      </div>

      {(error || helperText) && (
        <div className="text-sm">
          {error ? (
            <p className="text-red-600 font-medium animate-slide-up">{error}</p>
          ) : (
            <p className="text-bella-600">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Textarea component
interface BellaTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function BellaTextarea({
  label,
  error,
  helperText,
  className = "",
  ...props
}: BellaTextareaProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-bella-800">
          {label}
        </label>
      )}

      <div className="relative">
        <textarea
          className={`
            w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none resize-none
            ${
              error
                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : isFocused
                  ? "border-bella-400 focus:border-bella-500 focus:ring-2 focus:ring-bella-500/20"
                  : "border-bella-200 hover:border-bella-300"
            }
            placeholder-bella-400 text-bella-800
            ${className}
          `}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />

        {/* Focus ring animation */}
        {isFocused && (
          <div className="absolute inset-0 rounded-xl border-2 border-bella-500 animate-pulse-soft pointer-events-none"></div>
        )}
      </div>

      {(error || helperText) && (
        <div className="text-sm">
          {error ? (
            <p className="text-red-600 font-medium animate-slide-up">{error}</p>
          ) : (
            <p className="text-bella-600">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Select component
interface BellaSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}

export function BellaSelect({
  label,
  error,
  helperText,
  options,
  className = "",
  ...props
}: BellaSelectProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-bella-800">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          className={`
            w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none appearance-none bg-white
            ${
              error
                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : isFocused
                  ? "border-bella-400 focus:border-bella-500 focus:ring-2 focus:ring-bella-500/20"
                  : "border-bella-200 hover:border-bella-300"
            }
            text-bella-800
            ${className}
          `}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-bella-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {(error || helperText) && (
        <div className="text-sm">
          {error ? (
            <p className="text-red-600 font-medium animate-slide-up">{error}</p>
          ) : (
            <p className="text-bella-600">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
}
