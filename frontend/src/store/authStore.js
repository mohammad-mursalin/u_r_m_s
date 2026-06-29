import { create } from 'zustand'
import { loginUser, logoutUser, getCurrentUser } from '../api/auth'
import axiosInstance from '../api/axiosInstance'

const useAuthStore = create((set) => ({
  isLoggedIn: false,
  user: null,
  isLoading: true,
  isLoggingIn: false,

login: async (email, password) => {
     set({ isLoggingIn: true })
     try {
       const data = await loginUser(email, password)
       set({
         isLoggedIn: true,
         user: data.user,
         isLoggingIn: false
       })
       return { success: true }
     } catch (error) {
       set({ isLoggingIn: false })
       const responseData = error.response?.data
       return {
         success: false,
         error: responseData?.message || 'Login failed',
         fields: responseData?.fields || {}
       }
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
       await axiosInstance.get('/api/v1/auth/csrf/')
       const user = await getCurrentUser()
       if (user) {
         set({ isLoggedIn: true, user: user, isLoading: false })
       } else {
         set({ isLoggedIn: false, user: null, isLoading: false })
       }
     } catch (error) {
       set({ isLoggedIn: false, user: null, isLoading: false })
     }
   }
}))

export { useAuthStore }