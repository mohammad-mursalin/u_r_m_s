export const DAYS_OF_WEEK = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday']

export const TIME_SLOTS = [
  { id: 1, label: '9:00–10:00', start: '09:00', end: '10:00', isBreak: false },
  { id: 2, label: '10:00–11:00', start: '10:00', end: '11:00', isBreak: false },
  { id: 3, label: '11:00–12:00', start: '11:00', end: '12:00', isBreak: false },
  { id: 4, label: '12:00–1:00', start: '12:00', end: '13:00', isBreak: false },
  { id: 5, label: 'Prayer & Lunch Break', isBreak: true },
  { id: 6, label: '2:00–3:00', start: '14:00', end: '15:00', isBreak: false },
  { id: 7, label: '3:00–4:00', start: '15:00', end: '16:00', isBreak: false },
  { id: 8, label: '4:00–5:00', start: '16:00', end: '17:00', isBreak: false },
]

export const WEEK_TYPES = ['all', 'odd', 'even']

export const BATCH_COLORS = {
  'MSc': 'bg-purple-100 text-purple-800 border-purple-300',
  '13B': 'bg-blue-100 text-blue-800 border-blue-300',
  '14B': 'bg-green-100 text-green-800 border-green-300',
  '15B': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  '16B': 'bg-orange-100 text-orange-800 border-orange-300',
  '17B': 'bg-red-100 text-red-800 border-red-300',
}

export const DEFAULT_BATCH_COLOR = 'bg-gray-100 text-gray-800 border-gray-300'
