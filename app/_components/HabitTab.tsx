'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Flame, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Check
} from 'lucide-react'
import { useAppContext, addHabit, deleteHabit, toggleHabitLog } from '../_context/AppContext'
import { cn } from '../_lib/utils'
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns'
import { id as localeID } from 'date-fns/locale'

export function HabitTab() {
  const { state, dispatch } = useAppContext()
  const { habits, habitLogs } = state
  const [newHabitNama, setNewHabitNama] = useState('')

  const today = new Date()
  const last30Days = eachDayOfInterval({
    start: subDays(today, 29),
    end: today
  })

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newHabitNama.trim()) {
      addHabit(dispatch, newHabitNama.trim())
      setNewHabitNama('')
    }
  }

  return (
    <div className="flex-1 p-10 h-screen flex flex-col overflow-y-auto">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Habit Tracker</h2>
          <p className="text-zinc-500 font-bold">Konsistensi dalam 30 hari terakhir.</p>
        </div>
        <form onSubmit={handleAddHabit} className="flex items-center gap-2 glass p-1.5 rounded-2xl">
          <input 
            type="text" 
            placeholder="Habit baru..." 
            value={newHabitNama}
            onChange={(e) => setNewHabitNama(e.target.value)}
            className="bg-transparent px-4 py-2 text-sm font-bold outline-none placeholder:text-zinc-600 w-48"
          />
          <button type="submit" className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5" />
          </button>
        </form>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {habits.map((habit) => {
          const logs = habitLogs.filter(l => l.habitId === habit.id)
          const isTodayDone = logs.some(l => l.tanggal === format(today, 'yyyy-MM-dd'))

          return (
            <motion.div 
              key={habit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6 rounded-[32px] flex flex-col gap-6 group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: habit.warna, color: habit.warna }} />
                  <h3 className="text-xl font-black tracking-tight truncate">{habit.nama}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => deleteHabit(dispatch, habit.id)}
                    className="p-2 rounded-xl bg-white/5 text-zinc-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => toggleHabitLog(dispatch, habit.id, format(today, 'yyyy-MM-dd'), isTodayDone)}
                    className={cn(
                      "px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
                      isTodayDone ? "bg-zinc-800 text-zinc-500" : "bg-primary text-white"
                    )}
                  >
                    {isTodayDone ? 'Selesai' : 'Check-in'}
                  </button>
                </div>
              </div>

              {/* Monthly Heatmap (Small Squares) */}
              <div className="flex flex-wrap gap-1.5 p-4 bg-black/20 rounded-2xl">
                {last30Days.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const isDone = logs.some(l => l.tanggal === dateStr)
                  const isTday = isSameDay(day, today)

                  return (
                    <div 
                      key={dateStr}
                      onClick={() => toggleHabitLog(dispatch, habit.id, dateStr, isDone)}
                      className={cn(
                        "w-6 h-6 rounded-md transition-all cursor-pointer border",
                        isDone 
                          ? "border-transparent" 
                          : "border-white/5 hover:border-white/20 bg-white/5",
                        isTday && !isDone && "border-primary/50"
                      )}
                      style={{ backgroundColor: isDone ? habit.warna : undefined }}
                      title={format(day, 'd MMM yyyy')}
                    />
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </div>

      {habits.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
          <Flame className="w-16 h-16 mb-4 text-zinc-800" />
          <h3 className="text-xl font-bold">Belum ada habit</h3>
          <p className="text-sm">Mulai bangun kebiasaan baru sekarang.</p>
        </div>
      )}
    </div>
  )
}
