import axiosInstance from './axiosInstance'

export const getCsrfToken = async () => {
  const response = await axiosInstance.get('/api/v1/auth/csrf/')
  return response.data.csrf_token
}

export const loginUser = async (username, password) => {
  await getCsrfToken()
  const response = await axiosInstance.post('/api/v1/auth/login/', {
    username,
    password
  })
  return response.data
}

export const logoutUser = async () => {
  const response = await axiosInstance.post('/api/v1/auth/logout/')
  return response.data
}

export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/auth/me/')
    return response.data.user
  } catch (error) {
    if (error.response?.status === 401) {
      return null
    }
    throw error
  }
}