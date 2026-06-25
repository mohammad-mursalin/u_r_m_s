import axiosInstance from './axiosInstance'

export const getTeachers = async () => {
  const response = await axiosInstance.get('/api/v1/teachers/')
  return response.data
}

export const createTeacher = async (data) => {
  const response = await axiosInstance.post('/api/v1/teachers/', data)
  return response.data
}

export const updateTeacher = async (id, data) => {
  const response = await axiosInstance.put(`/api/v1/teachers/${id}/`, data)
  return response.data
}

export const deleteTeacher = async (id) => {
  const response = await axiosInstance.delete(`/api/v1/teachers/${id}/`)
  return response.data
}

export const getCourses = async () => {
  const response = await axiosInstance.get('/api/v1/courses/')
  return response.data
}

export const createCourse = async (data) => {
  const response = await axiosInstance.post('/api/v1/courses/', data)
  return response.data
}

export const updateCourse = async (id, data) => {
  const response = await axiosInstance.put(`/api/v1/courses/${id}/`, data)
  return response.data
}

export const deleteCourse = async (id) => {
  const response = await axiosInstance.delete(`/api/v1/courses/${id}/`)
  return response.data
}

export const getRooms = async () => {
  const response = await axiosInstance.get('/api/v1/rooms/')
  return response.data
}

export const createRoom = async (data) => {
  const response = await axiosInstance.post('/api/v1/rooms/', data)
  return response.data
}

export const updateRoom = async (id, data) => {
  const response = await axiosInstance.put(`/api/v1/rooms/${id}/`, data)
  return response.data
}

export const deleteRoom = async (id) => {
  const response = await axiosInstance.delete(`/api/v1/rooms/${id}/`)
  return response.data
}

export const getBatches = async () => {
  const response = await axiosInstance.get('/api/v1/batches/')
  return response.data
}

export const createBatch = async (data) => {
  const response = await axiosInstance.post('/api/v1/batches/', data)
  return response.data
}

export const updateBatch = async (id, data) => {
  const response = await axiosInstance.put(`/api/v1/batches/${id}/`, data)
  return response.data
}

export const deleteBatch = async (id) => {
  const response = await axiosInstance.delete(`/api/v1/batches/${id}/`)
  return response.data
}

export const getTimeSlots = async () => {
  const response = await axiosInstance.get('/api/v1/timeslots/')
  return response.data
}

export const createTimeSlot = async (data) => {
  const response = await axiosInstance.post('/api/v1/timeslots/', data)
  return response.data
}

export const updateTimeSlot = async (id, data) => {
  const response = await axiosInstance.put(`/api/v1/timeslots/${id}/`, data)
  return response.data
}

export const deleteTimeSlot = async (id) => {
  const response = await axiosInstance.delete(`/api/v1/timeslots/${id}/`)
  return response.data
}
