import { InputHTMLAttributes, useState, forwardRef } from "react"
import { Eye, EyeOff } from "lucide-react"

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, type = "text", id, className = "", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)
    const isPassword = type === "password"
    const computedType = isPassword ? (showPassword ? "text" : "password") : type

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: "13.5px",
              fontWeight: 500,
              color: "var(--color-text-main)",
              letterSpacing: "0.01em",
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: "relative", width: "100%" }}>
          <input
            ref={ref}
            id={inputId}
            type={computedType}
            className={`input-tranquil ${className}`}
            aria-invalid={Boolean(error)}
            style={{
              paddingRight: isPassword ? "42px" : "14px",
              borderColor: error ? "var(--color-error)" : undefined,
            }}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: "4px",
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          )}
        </div>
        {error && (
          <p
            style={{
              fontSize: "12.5px",
              color: "var(--color-error)",
              margin: "2px 0 0",
            }}
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            style={{
              fontSize: "12px",
              color: "var(--color-text-muted)",
              margin: "2px 0 0",
            }}
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"
