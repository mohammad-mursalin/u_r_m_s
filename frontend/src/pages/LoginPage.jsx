/**
 * Admin login page
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const { login, isLoggingIn, isLoggedIn } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoggedIn) navigate('/admin/dashboard')
  }, [isLoggedIn])

  const validateForm = () => {
    const newErrors = {}
    if (!email.trim()) {
      newErrors.email = 'Email is required.'
    } else if (!/^[^@]+@[^@]+\.[^@]+$/.test(email.trim())) {
      newErrors.email = 'Enter a valid email address.'
    }
    if (!password) {
      newErrors.password = 'Password is required.'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')
    setErrors({})
    if (!validateForm()) return
    const result = await login(email.trim().toLowerCase(), password)
    if (result.success) {
      navigate('/admin/dashboard')
    } else {
      if (result.fields && Object.keys(result.fields).length > 0) {
        setErrors(result.fields)
      } else {
        setGeneralError(result.error || 'Login failed. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-1">
            ICE Department — Pabna University of Science and Technology
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
              }}
              placeholder="admin@ice.pust.ac.bd"
              autoComplete="email"
              autoFocus
              className={`w-full px-4 py-2.5 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.email
                  ? 'border-red-400 bg-red-50 focus:ring-red-400'
                  : 'border-gray-300'}`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <span>⚠</span> {errors.email}
              </p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors(prev => ({ ...prev, password: '' }))
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              className={`w-full px-4 py-2.5 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.password
                  ? 'border-red-400 bg-red-50 focus:ring-red-400'
                  : 'border-gray-300'}`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <span>⚠</span> {errors.password}
              </p>
            )}
          </div>

          {/* General error */}
          {generalError && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-3
                            flex items-start gap-2">
              <span className="text-red-500 mt-0.5">⚠</span>
              <p className="text-sm text-red-700">{generalError}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg
              hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2 font-medium transition"
          >
            {isLoggingIn && <Loader2 size={16} className="animate-spin" />}
            {isLoggingIn ? 'Signing in...' : 'Sign In'}
          </button>

        </form>
      </div>
    </div>
  )
}