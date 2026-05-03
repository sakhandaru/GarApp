export type Prioritas = 'tinggi' | 'sedang' | 'rendah' | 'none'

export interface Subtugas {
  id: string
  judul: string
  isSelesai: boolean
}

export interface Tugas {
  id: string
  judul: string
  deskripsi?: string
  prioritas: Prioritas
  tanggalJatuhTempo?: string
  waktuPengingat?: string
  proyekId: string
  tagIds: string[]
  subtugas: Subtugas[]
  isSelesai: boolean
  isHabit: boolean // Tugas berulang (Habit)
  recurrence?: 'harian' | 'mingguan' // Pola pengulangan
  selesaiPada?: string
  dibuatPada: string
}

export interface Proyek {
  id: string
  nama: string
  warna: string
}

export interface Tag {
  id: string
  nama: string
  warna: string
}

export interface AppState {
  tugas: Tugas[]
  proyek: Proyek[]
  tag: Tag[]
  user: { nama: string }
  isLoading: boolean
}
