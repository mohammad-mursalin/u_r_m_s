import { create } from 'zustand'
import { loginUser, logoutUser, getCurrentUser } from '../api/auth'

const useAuthStore = create((set) => ({
  isLoggedIn: false,
  user: null,
  isLoading: true,
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
      return { success: false, error: error.response?.data?.message || 'Login failed' }
    }
  },

  logout: async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      set({ isLoggedIn: false, user: null })
    }
  },

  initAuth: async () => {
    set({ isLoading: true })
    try {
      const data = await getCurrentUser()
      set({
        isLoggedIn: true,
        user: data.user,
        isLoading: false       
      })
    } catch (error) {
      set({
        isLoggedIn: false,
        user: null,
        isLoading: false       
      })
    }
  }
}))

export { useAuthStore }