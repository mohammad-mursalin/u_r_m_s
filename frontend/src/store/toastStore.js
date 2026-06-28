import { create } from 'zustand';

/**
 * toastStore — global state for toast notifications
 * Uses Zustand for lightweight state management
 */

const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: (message, type = 'info', duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id,
          message,
          type,
          duration,
          timestamp: Date.now()
        }
      ]
    }));
    // Auto-remove after duration (except for error toasts which stay until dismissed)
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    })),

  showSuccess: (message) => get().addToast(message, 'success', 3000),

  showError: (message) => get().addToast(message, 'error', 0),

  showWarning: (message) => get().addToast(message, 'warning', 5000),

  showInfo: (message) => get().addToast(message, 'info', 3000)
}));

export default useToastStore;