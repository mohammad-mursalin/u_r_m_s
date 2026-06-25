import { create } from 'zustand';

/**
 * toastStore — global state for toast notifications
 * Uses Zustand for lightweight state management
 */

const useToastStore = create((set) => ({
  toasts: [],

  addToast: (message, type = 'info') =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          message,
          type,
          timestamp: Date.now()
        }
      ]
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    })),

  showSuccess: (message) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          message,
          type: 'success',
          timestamp: Date.now()
        }
      ]
    })),

  showError: (message) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          message,
          type: 'error',
          timestamp: Date.now()
        }
      ]
    })),

  showWarning: (message) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          message,
          type: 'warning',
          timestamp: Date.now()
        }
      ]
    }))
}));

export default useToastStore;
