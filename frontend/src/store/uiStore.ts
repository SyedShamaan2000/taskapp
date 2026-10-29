import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'error';
}

interface UiState {
  toast: Toast | null;
  showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
  hideToast: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  toast: null,
  showToast: (message: string, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set({ toast: { id, message, type } });

    setTimeout(() => {
      set((state) => (state.toast?.id === id ? { toast: null } : state));
    }, 3500);
  },
  hideToast: () => set({ toast: null }),
}));
