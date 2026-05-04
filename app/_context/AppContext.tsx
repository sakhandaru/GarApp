'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { AppState, Task, Project, Habit, HabitLog } from '../_lib/types'
import { supabase } from '../_lib/supabase'

const initialState: AppState = {
  user: { nama: 'Alexey' },
  tasks: [],
  projects: [],
  habits: [],
  habitLogs: [],
  isLoading: true,
  activeTab: 'home',
  activeProjectId: null
}

type Action = 
  | { type: 'SET_USER'; payload: { nama: string } }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_HABITS'; payload: Habit[] }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'SET_HABIT_LOGS'; payload: HabitLog[] }
  | { type: 'ADD_HABIT_LOG'; payload: HabitLog }
  | { type: 'DELETE_HABIT_LOG'; payload: { habitId: string, tanggal: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_ACTIVE_PROJECT'; payload: string | null }

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER': return { ...state, user: action.payload }
    case 'SET_TASKS': return { ...state, tasks: action.payload }
    case 'ADD_TASK': {
      const exists = state.tasks.find(t => t.id === action.payload.id)
      if (exists) return state
      return { ...state, tasks: [action.payload, ...state.tasks] }
    }
    case 'UPDATE_TASK': return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t) }
    case 'DELETE_TASK': return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) }
    case 'SET_PROJECTS': return { ...state, projects: action.payload }
    case 'ADD_PROJECT': return { ...state, projects: [action.payload, ...state.projects] }
    case 'DELETE_PROJECT': return { ...state, projects: state.projects.filter(p => p.id !== action.payload) }
    case 'SET_HABITS': return { ...state, habits: action.payload }
    case 'ADD_HABIT': return { ...state, habits: [action.payload, ...state.habits] }
    case 'DELETE_HABIT': return { ...state, habits: state.habits.filter(h => h.id !== action.payload) }
    case 'SET_HABIT_LOGS': return { ...state, habitLogs: action.payload }
    case 'ADD_HABIT_LOG': return { ...state, habitLogs: [...state.habitLogs, action.payload] }
    case 'DELETE_HABIT_LOG': return { ...state, habitLogs: state.habitLogs.filter(l => !(l.habitId === action.payload.habitId && l.tanggal === action.payload.tanggal)) }
    case 'SET_LOADING': return { ...state, isLoading: action.payload }
    case 'SET_ACTIVE_TAB': return { ...state, activeTab: action.payload }
    case 'SET_ACTIVE_PROJECT': return { ...state, activeProjectId: action.payload }
    default: return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<Action>
} | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const [tasksRes, projectsRes, habitsRes, logsRes] = await Promise.all([
        supabase.from('tasks').select('*').order('dibuat_pada', { ascending: false }),
        supabase.from('projects').select('*').order('urutan', { ascending: true }),
        supabase.from('habits').select('*').order('dibuat_pada', { ascending: false }),
        supabase.from('habit_logs').select('*')
      ])

      if (tasksRes.data) {
        dispatch({ type: 'SET_TASKS', payload: tasksRes.data.map((t: any) => ({
          id: t.id,
          judul: t.judul,
          catatan: t.catatan,
          prioritas: t.prioritas,
          tanggal: t.tanggal,
          waktu: t.waktu,
          proyekId: t.proyek_id,
          isSelesai: t.is_selesai,
          status: t.status || (t.is_selesai ? 'selesai' : 'backlog'),
          isRecurring: t.is_recurring,
          recurringType: t.recurring_type,
          recurringDays: t.recurring_days,
          parentTaskId: t.parent_task_id,
          dibuatPada: t.dibuat_pada,
          selesaiPada: t.selesai_pada
        }))})
      }

      if (projectsRes.data) {
        dispatch({ type: 'SET_PROJECTS', payload: projectsRes.data.map((p: any) => ({
          id: p.id, nama: p.nama, warna: p.warna, urutan: p.urutan, dibuatPada: p.dibuat_pada
        }))})
      }

      if (habitsRes.data) {
        dispatch({ type: 'SET_HABITS', payload: habitsRes.data.map((h: any) => ({
          id: h.id, nama: h.nama, deskripsi: h.deskripsi, warna: h.warna, frekuensi: h.frekuensi, hariMingguan: h.hari_mingguan, dibuatPada: h.dibuat_pada
        }))})
      }

      if (logsRes.data) {
        dispatch({ type: 'SET_HABIT_LOGS', payload: logsRes.data.map((l: any) => ({
          id: l.id, habitId: l.habit_id, tanggal: l.tanggal, dicatatPada: l.dicatat_pada
        }))})
      }

      dispatch({ type: 'SET_LOADING', payload: false })
    }

    fetchData()

    // Realtime Subscriptions
    const tasksChannel = supabase.channel('tasks_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const t = payload.new as any
          dispatch({ type: 'ADD_TASK', payload: {
            id: t.id, 
            judul: t.judul, 
            catatan: t.catatan,
            prioritas: t.prioritas, 
            tanggal: t.tanggal, 
            waktu: t.waktu,
            proyekId: t.proyek_id,
            status: t.status || (t.is_selesai ? 'selesai' : 'backlog'), 
            isSelesai: t.is_selesai, 
            isRecurring: t.is_recurring,
            recurringType: t.recurring_type,
            recurringDays: t.recurring_days,
            parentTaskId: t.parent_task_id, 
            dibuatPada: t.dibuat_pada,
            selesaiPada: t.selesai_pada
          }})
        } else if (payload.eventType === 'UPDATE') {
          const t = payload.new as any
          dispatch({ type: 'UPDATE_TASK', payload: {
            id: t.id, 
            judul: t.judul, 
            catatan: t.catatan,
            prioritas: t.prioritas, 
            tanggal: t.tanggal, 
            waktu: t.waktu,
            proyekId: t.proyek_id,
            status: t.status || (t.is_selesai ? 'selesai' : 'backlog'), 
            isSelesai: t.is_selesai, 
            isRecurring: t.is_recurring,
            recurringType: t.recurring_type,
            recurringDays: t.recurring_days,
            parentTaskId: t.parent_task_id, 
            dibuatPada: t.dibuat_pada,
            selesaiPada: t.selesai_pada
          }})
        } else if (payload.eventType === 'DELETE') {
          dispatch({ type: 'DELETE_TASK', payload: payload.old.id })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(tasksChannel)
    }
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

// Global Helpers
export const toggleTask = async (dispatch: React.Dispatch<Action>, id: string, currentSelesai: boolean, task: Task) => {
  const newStatus = !currentSelesai ? 'selesai' : 'backlog'
  const { data, error } = await supabase
    .from('tasks')
    .update({ is_selesai: !currentSelesai, status: newStatus })
    .eq('id', id)
    .select()
    .single()
  
  if (!error && data) {
    dispatch({ type: 'UPDATE_TASK', payload: { ...task, isSelesai: data.is_selesai, status: data.status } })
  }
}

export const updateTask = async (dispatch: React.Dispatch<Action>, taskId: string, updates: Partial<Task>) => {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      judul: updates.judul,
      catatan: updates.catatan,
      prioritas: updates.prioritas,
      tanggal: updates.tanggal,
      waktu: updates.waktu,
      proyek_id: updates.proyekId,
      is_selesai: updates.isSelesai,
      status: updates.status,
      parent_task_id: updates.parentTaskId,
      is_recurring: updates.isRecurring,
      recurring_type: updates.recurringType,
      recurring_days: updates.recurringDays,
      selesai_pada: updates.selesaiPada
    })
    .eq('id', taskId)
    .select()
    .single()
  
  if (!error && data) {
    dispatch({ type: 'UPDATE_TASK', payload: {
      id: data.id,
      judul: data.judul,
      catatan: data.catatan,
      prioritas: data.prioritas,
      tanggal: data.tanggal,
      waktu: data.waktu,
      proyekId: data.proyek_id,
      isSelesai: data.is_selesai,
      status: data.status as any,
      isRecurring: data.is_recurring,
      recurringType: data.recurring_type,
      recurringDays: data.recurring_days,
      parentTaskId: data.parent_task_id,
      dibuatPada: data.dibuat_pada,
      selesaiPada: data.selesai_pada
    }})
  }
}

export const updateTaskStatus = async (dispatch: React.Dispatch<Action>, taskId: string, status: 'backlog' | 'ready' | 'progress' | 'selesai') => {
  const isSelesai = status === 'selesai'
  const { data, error } = await supabase
    .from('tasks')
    .update({ status, is_selesai: isSelesai })
    .eq('id', taskId)
    .select()
    .single()
  
  if (!error && data) {
    // We update the state via the reducer (or the realtime subscription will handle it)
    // To be safe and snappy, we dispatch manually
    dispatch({ type: 'UPDATE_TASK', payload: {
      id: data.id,
      judul: data.judul,
      catatan: data.catatan,
      prioritas: data.prioritas,
      tanggal: data.tanggal,
      waktu: data.waktu,
      proyekId: data.proyek_id,
      isSelesai: data.is_selesai,
      status: data.status as any,
      isRecurring: data.is_recurring,
      recurringType: data.recurring_type,
      recurringDays: data.recurring_days,
      parentTaskId: data.parent_task_id,
      dibuatPada: data.dibuat_pada,
      selesaiPada: data.selesai_pada
    }})
  }
}

export const deleteTask = async (dispatch: React.Dispatch<Action>, id: string) => {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (!error) dispatch({ type: 'DELETE_TASK', payload: id })
}

export const addProject = async (dispatch: React.Dispatch<Action>, nama: string) => {
  const { data, error } = await supabase.from('projects').insert({ nama, warna: '#FF6B00', urutan: 0 }).select().single()
  if (!error && data) dispatch({ type: 'ADD_PROJECT', payload: { id: data.id, nama: data.nama, warna: data.warna, urutan: data.urutan, dibuatPada: data.dibuat_pada } })
}

export const deleteProject = async (dispatch: React.Dispatch<Action>, id: string) => {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (!error) dispatch({ type: 'DELETE_PROJECT', payload: id })
}

export const addHabit = async (dispatch: React.Dispatch<Action>, habit: Partial<Habit>) => {
  const { data, error } = await supabase.from('habits').insert({
    nama: habit.nama, warna: habit.warna, frekuensi: habit.frekuensi, hari_mingguan: habit.hariMingguan
  }).select().single()
  if (!error && data) {
    dispatch({ type: 'ADD_HABIT', payload: { id: data.id, nama: data.nama, warna: data.warna, frekuensi: data.frekuensi, hariMingguan: data.hari_mingguan, dibuatPada: data.dibuat_pada } })
  }
}

export const deleteHabit = async (dispatch: React.Dispatch<Action>, id: string) => {
  const { error } = await supabase.from('habits').delete().eq('id', id)
  if (!error) dispatch({ type: 'DELETE_HABIT', payload: id })
}

export const toggleHabitLog = async (dispatch: React.Dispatch<Action>, habitId: string, tanggal: string, currentDone: boolean) => {
  if (currentDone) {
    await supabase.from('habit_logs').delete().eq('habit_id', habitId).eq('tanggal', tanggal)
    dispatch({ type: 'DELETE_HABIT_LOG', payload: { habitId, tanggal } })
  } else {
    const { data, error } = await supabase.from('habit_logs').insert({ habit_id: habitId, tanggal }).select().single()
    if (!error && data) dispatch({ type: 'ADD_HABIT_LOG', payload: { id: data.id, habitId: data.habit_id, tanggal: data.tanggal, dicatatPada: data.dicatat_pada } })
  }
}
