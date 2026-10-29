import React, { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'terracotta' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  let variantClass = 'btn-primary';
  if (variant === 'terracotta') variantClass = 'btn-terracotta';
  if (variant === 'ghost') variantClass = 'btn-ghost';
  if (variant === 'danger') variantClass = 'btn-ghost'; // style override below

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '6px 12px', fontSize: '13px' },
    md: { padding: '10px 18px', fontSize: '14px' },
    lg: { padding: '12px 24px', fontSize: '15.5px' },
  };

  const dangerStyle: React.CSSProperties =
    variant === 'danger'
      ? {
          color: 'var(--color-error)',
          backgroundColor: 'var(--color-error-bg)',
          border: '1px solid var(--color-error-border)',
        }
      : {};

  const outlineStyle: React.CSSProperties =
    variant === 'outline'
      ? {
          backgroundColor: '#FFFFFF',
          color: 'var(--color-text-main)',
          border: '1px solid var(--color-border)',
        }
      : {};

  return (
    <button
      className={`${variantClass} ${className}`}
      disabled={disabled || isLoading}
      style={{
        ...sizeStyles[size],
        ...dangerStyle,
        ...outlineStyle,
      }}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      ) : null}
      {children}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};
