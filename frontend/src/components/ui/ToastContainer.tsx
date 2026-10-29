import React from 'react';
import { useUiStore } from '@/store/uiStore';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toast } = useUiStore();

  if (!toast) return null;

  const iconMap = {
    success: <CheckCircle2 size={16} color="var(--color-sage)" />,
    error: <AlertCircle size={16} color="var(--color-error)" />,
    info: <Info size={16} color="var(--color-terracotta)" />,
  };

  return (
    <div
      className="toast-pill"
      role="status"
      aria-live="polite"
    >
      {iconMap[toast.type || 'info']}
      <span>{toast.message}</span>
    </div>
  );
};
