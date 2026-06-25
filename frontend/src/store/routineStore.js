import { create } from 'zustand'

export const useRoutineStore = create(set => ({
  activeSemester: null,
  filters: {
    batch: '',
    teacher: '',
    day: ''
  },

  setActiveSemester: (semester) => set({ activeSemester: semester }),
  setFilter: (key, value) => set(state => ({
    filters: { ...state.filters, [key]: value }
  })),
  clearFilters: () => set({ filters: { batch: '', teacher: '', day: '' } })
}))
