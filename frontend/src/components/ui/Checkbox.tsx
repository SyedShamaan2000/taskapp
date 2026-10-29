import React, { InputHTMLAttributes } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onChange,
  label,
  id,
  disabled,
  className = '',
  ...props
}) => {
  const checkboxId =
    id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label
      htmlFor={checkboxId}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        userSelect: 'none',
      }}
    >
      <input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`checkbox-circular ${className}`}
        {...props}
      />
      {label && (
        <span
          style={{
            fontSize: '14.5px',
            color: checked ? 'var(--color-text-muted)' : 'var(--color-text-main)',
            textDecoration: checked ? 'line-through' : 'none',
            transition: 'color var(--transition-fast)',
          }}
        >
          {label}
        </span>
      )}
    </label>
  );
};
