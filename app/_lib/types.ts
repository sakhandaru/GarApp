export type Prioritas = 'low' | 'medium' | 'high'
export type RecurringType = 'daily' | 'weekly' | 'monthly'

export interface Project {
  id: string
  nama: string
  warna: string
  urutan: number
  dibuatPada: string
}

export interface Task {
  id: string
  judul: string
  catatan?: string
  prioritas: Prioritas
  tanggal: string // YYYY-MM-DD
  waktu?: string // HH:mm:ss
  proyekId?: string // null = Inbox
  isSelesai: boolean
  status: 'backlog' | 'ready' | 'progress' | 'selesai'
  isRecurring: boolean
  recurringType?: RecurringType
  recurringDays?: number[]
  parentTaskId?: string // untuk subtask
  subtasks?: Task[] // computed field untuk UI
  dibuatPada: string
  selesaiPada?: string
}

export interface Habit {
  id: string
  nama: string
  deskripsi?: string
  warna: string
  frekuensi: 'harian' | 'mingguan'
  hariMingguan?: number[]
  dibuatPada: string
}

export interface HabitLog {
  id: string
  habitId: string
  tanggal: string
  dicatatPada: string
}

export interface AppState {
  user: {
    nama: string
  }
  tasks: Task[]
  projects: Project[]
  habits: Habit[]
  habitLogs: HabitLog[]
  isLoading: boolean
  activeTab: string
  activeProjectId: string | null
}
