import { create } from 'zustand';
import { loginUser, getCurrentUser } from '../api/auth'

const useAuthStore = create((set) => ({
  isLoggedIn: false,
  user: null,
  isLoading: false,
  isLoggingIn: false,

  login: async (username, password) => {
    set({ isLoggingIn: true })
    try {
      const data = await loginUser(username, password)
      set({
        isLoggedIn: true,
        user: data.user,
        isLoggingIn: false
      })
      return { success: true }
    } catch (error) {
      set({ isLoggingIn: false })
      console.error('Login failed:', error)
      return { success: false, error: error.response?.data?.message || 'Login failed' }
    }
  },

  logout: () => set({ isLoggedIn: false, user: null }),

  initAuth: async () => {
    set({ isLoading: true })
    try {
      const user = await getCurrentUser()
      if (user) {
        set({ isLoggedIn: true, user, isLoading: false })
      }
    } catch (error) {
      set({ isLoading: false })
    }
  }
}));

export { useAuthStore };
