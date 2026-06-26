// routine.js

import axiosInstance from './axiosInstance'

export const getActiveRoutine = async (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.batch) params.append('batch', filters.batch)
  if (filters.teacher) params.append('teacher', filters.teacher)
  if (filters.day) params.append('day', filters.day)

  const response = await axiosInstance.get(`/api/v1/routine/active/?${params}`)
  return response.data
}

export const getBatchSchedule = async (batchName) => {
  const response = await axiosInstance.get(`/api/v1/routine/batch/${batchName}/`)
  return response.data
}

export const getTeacherSchedule = async (teacherCode) => {
  const response = await axiosInstance.get(`/api/v1/routine/teacher/${teacherCode}/`)
  return response.data
}

export const getSemesters = async () => {
  const response = await axiosInstance.get('/api/v1/semesters/')
  return response.data
}

export const createSemester = async (data) => {
  const response = await axiosInstance.post('/api/v1/semesters/', data)
  return response.data
}

export const updateSemester = async (id, data) => {
  const response = await axiosInstance.put(`/api/v1/semesters/${id}/`, data)
  return response.data
}

export const deleteSemester = async (id) => {
  const response = await axiosInstance.delete(`/api/v1/semesters/${id}/`)
  return response.data
}

export const activateSemester = async (id) => {
  const response = await axiosInstance.post(`/api/v1/semesters/${id}/activate/`)
  return response.data
}

export const publishSemester = async (id) => {
  const response = await axiosInstance.post(`/api/v1/semesters/${id}/publish/`)
  return response.data
}

export const unpublishSemester = async (id) => {
  const response = await axiosInstance.post(`/api/v1/semesters/${id}/unpublish/`)
  return response.data
}

export const cloneSemester = async (id, newName) => {
  const response = await axiosInstance.post(`/api/v1/semesters/${id}/clone/`, {
    new_semester_name: newName
  })
  return response.data
}

export const getSemesterSlots = async (semId) => {
  const response = await axiosInstance.get(`/api/v1/semesters/${semId}/slots/`)
  return response.data
}

export const createSlot = async (semId, data) => {
  const response = await axiosInstance.post(`/api/v1/semesters/${semId}/slots/`, data)
  return response.data
}

export const updateSlot = async (semId, slotId, data) => {
  const response = await axiosInstance.put(
    `/api/v1/semesters/${semId}/slots/${slotId}/`,
    data
  )
  return response.data
}

export const deleteSlot = async (semId, slotId) => {
  const response = await axiosInstance.delete(`/api/v1/semesters/${semId}/slots/${slotId}/`)
  return response.data
}

export const checkConflicts = async (semId, data) => {
  const response = await axiosInstance.post(
    `/api/v1/semesters/${semId}/slots/check-conflicts/`,
    data
  )
  return response.data
}

export const getTeachers = async () => {
  const response = await axiosInstance.get('/api/v1/teachers/')
  return response.data
}

export const getActiveCourses = async () => {
  const response = await axiosInstance.get('/api/v1/courses/')
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
