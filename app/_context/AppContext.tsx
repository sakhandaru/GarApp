'use client'

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import { AppState, Tugas, Proyek, Tag } from '../_lib/types'

import { supabase } from '../_lib/supabase'

type Action = 
  | { type: 'SET_USER_NAME'; payload: string }
  | { type: 'SET_TUGAS'; payload: Tugas[] }
  | { type: 'ADD_TUGAS'; payload: Tugas }
  | { type: 'UPDATE_TUGAS'; payload: Tugas }
  | { type: 'DELETE_TUGAS'; payload: string }
  | { type: 'TOGGLE_TUGAS'; payload: string }

const initialState: AppState = {
  user: { nama: 'Alexey' },
  tugas: [],
  proyek: [
    { id: 'p1', nama: 'Pekerjaan', warna: '#007AFF' },
    { id: 'p2', nama: 'Personal', warna: '#FF6B00' }
  ],
  tag: [
    { id: 't1', nama: 'meeting', warna: '#FF3B30' }
  ],
  isLoading: true
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<Action>
} | undefined>(undefined)

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER_NAME':
      return { ...state, user: { ...state.user, nama: action.payload } }
    case 'SET_TUGAS':
      return { ...state, tugas: action.payload, isLoading: false }
    case 'ADD_TUGAS':
      return { ...state, tugas: [action.payload, ...state.tugas] }
    case 'UPDATE_TUGAS':
      return {
        ...state,
        tugas: state.tugas.map(t => t.id === action.payload.id ? action.payload : t)
      }
    case 'DELETE_TUGAS':
      return {
        ...state,
        tugas: state.tugas.filter(t => t.id !== action.payload)
      }
    case 'TOGGLE_TUGAS':
      return {
        ...state,
        tugas: state.tugas.map(t => t.id === action.payload ? { ...t, isSelesai: !t.isSelesai } : t)
      }
    default:
      return state
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Fetch data dari Supabase saat mount
  useEffect(() => {
    async function fetchTugas() {
      const { data, error } = await supabase
        .from('tugas')
        .select('*')
        .order('dibuat_pada', { ascending: false })

      if (error) {
        console.error('Error fetching tugas:', error)
        return
      }

      const mappedTugas: Tugas[] = data.map(t => ({
        id: t.id,
        judul: t.judul,
        prioritas: t.prioritas,
        isHabit: t.is_habit,
        recurrence: t.recurrence,
        isSelesai: t.is_selesai,
        tanggalJatuhTempo: t.tanggal_jatuh_tempo,
        waktuPengingat: t.waktu_pengingat,
        proyekId: 'p1', // Mocking for now
        tagIds: [],
        subtugas: [],
        dibuatPada: t.dibuat_pada
      }))

      dispatch({ type: 'SET_TUGAS', payload: mappedTugas })
    }

    fetchTugas()
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within AppProvider')
  return context
}

// Helpers for Supabase Sync
export async function toggleTugas(dispatch: React.Dispatch<Action>, id: string, currentStatus: boolean) {
  // Optimistic update
  dispatch({ type: 'TOGGLE_TUGAS', payload: id })

  const { error } = await supabase
    .from('tugas')
    .update({ is_selesai: !currentStatus })
    .eq('id', id)

  if (error) {
    console.error('Error toggling tugas:', error)
    // Rollback if needed
    dispatch({ type: 'TOGGLE_TUGAS', payload: id })
  }
}

export async function deleteTugas(dispatch: React.Dispatch<Action>, id: string) {
  const { error } = await supabase
    .from('tugas')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting tugas:', error)
    return
  }

  dispatch({ type: 'DELETE_TUGAS', payload: id })
}
