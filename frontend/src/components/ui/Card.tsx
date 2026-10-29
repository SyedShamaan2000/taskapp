import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevated = false,
  className = '',
  style,
  ...props
}) => {
  return (
    <div
      className={`card-tranquil ${className}`}
      style={{
        backgroundColor: elevated ? 'var(--color-card-elevated)' : 'var(--color-card)',
        padding: '24px',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
