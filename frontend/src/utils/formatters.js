export const formatDay = day => {
  const days = {
    saturday: 'Saturday',
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday'
  }
  return days[day] || day
}

export const formatTime = time => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export const getTeacherCodes = teachers => {
  if (!teachers || teachers.length === 0) return ''
  return teachers.map(t => t.short_code).join(' + ')
}

export const getBatchColor = batchName => {
  return BATCH_COLORS[batchName] || DEFAULT_BATCH_COLOR
}
