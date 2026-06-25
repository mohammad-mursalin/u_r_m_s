/**
 * Admin login page
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { isLoggedIn, isLoading, login } = useAuthStore()

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/admin/dashboard')
    }
  }, [isLoggedIn, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const email = e.target.email.value.trim()
    const password = e.target.password.value.trim()

    if (!email || !password) {
      alert('Email and password are required.')
      return
    }

    try {
      const result = await login(email, password)
      if (result.success) {
        navigate('/admin/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert(error.response?.data?.message || 'Login failed. Please try again.')
    }
  }

  const { isLoggingIn } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Logging in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-600 mt-1">ICE Department — PUST</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="admin@pust.ac.bd"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Logging in...
              </>
            ) : (
              <>
                <LogIn size={16} />
                Login
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Contact the administrator to reset your password
        </div>
      </div>
    </div>
  )
}
