'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  Flame, 
  Activity, 
  Sparkles,
  ChevronRight,
  TrendingUp
} from 'lucide-react'
import { useAppContext, addHabit, deleteHabit, toggleHabitLog } from '../_context/AppContext'
import { cn } from '../_lib/utils'
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  subDays,
} from 'date-fns'

export function HabitTab() {
  const { state, dispatch } = useAppContext()
  const { habits, habitLogs } = state
  const [newHabitNama, setNewHabitNama] = useState('')

  const today = new Date()
  const todayKey = format(today, 'yyyy-MM-dd')
  const last30Days = eachDayOfInterval({
    start: subDays(today, 29),
    end: today
  })

  const completedTodayCount = habits.filter((habit) =>
    habitLogs.some((log) => log.habitId === habit.id && log.tanggal === todayKey)
  ).length

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newHabitNama.trim()) {
      addHabit(dispatch, {
        nama: newHabitNama.trim(),
        frekuensi: 'harian',
        warna: '#111111',
      })
      setNewHabitNama('')
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F5F5F5] overflow-y-auto no-scrollbar pb-32">
      {/* 1. HEADING - Home Style */}
      <div className="flex justify-between items-start px-6 pt-16 mb-12">
        <div className="tracking-tighter">
          <h1 className="text-[40px] font-bold leading-[0.95] text-zinc-900">
            Habit<br />Protocol
          </h1>
        </div>
        <div className="text-right tracking-tighter">
          <p className="text-[40px] font-bold text-zinc-400 leading-[0.95]">
            {completedTodayCount < 10 ? `0${completedTodayCount}` : completedTodayCount}
          </p>
          <p className="text-[40px] font-bold text-zinc-400 leading-[0.95]">Active</p>
        </div>
      </div>

      {/* 2. ADD HABIT BAR */}
      <div className="px-6 mb-8">
        <form onSubmit={handleAddHabit} className="flex gap-2">
          <input
            type="text"
            placeholder="New protocol..."
            value={newHabitNama}
            onChange={(e) => setNewHabitNama(e.target.value)}
            className="flex-1 bg-white rounded-full px-6 py-4 text-[15px] font-bold tracking-tighter outline-none border border-zinc-100 focus:border-zinc-300 transition-all shadow-sm"
          />
          <button
            type="submit"
            className="w-14 h-14 bg-zinc-900 text-white rounded-full flex items-center justify-center active:scale-90 transition-all shadow-md"
          >
            <Plus className="w-6 h-6" />
          </button>
        </form>
      </div>

      {/* 3. HABIT LIST */}
      <div className="px-4 space-y-4">
        {habits.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[28px] shadow-sm border border-zinc-100 mx-2">
            <Activity className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
            <p className="text-zinc-400 font-bold tracking-tighter text-lg">No active protocols.</p>
          </div>
        ) : (
          habits.map((habit) => {
            const logs = habitLogs.filter(l => l.habitId === habit.id)
            const isDoneToday = logs.some(l => l.tanggal === todayKey)
            const logDates = new Set(logs.map(l => l.tanggal))
            
            // Calculate streak
            let streak = 0
            for (let i = 0; i < 30; i++) {
              const d = subDays(today, i)
              if (logDates.has(format(d, 'yyyy-MM-dd'))) streak++
              else if (i > 0) break 
            }

            return (
              <motion.div 
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-7 rounded-[28px] shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-zinc-50 flex flex-col relative group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleHabitLog(dispatch, habit.id, todayKey, isDoneToday)}
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                        isDoneToday ? "bg-[#2CFE4D] text-white" : "bg-zinc-50 text-zinc-400 border border-zinc-100"
                      )}
                    >
                      <Activity className="w-6 h-6" />
                    </button>
                    <div>
                      <h3 className="text-[20px] font-bold tracking-tighter leading-tight text-zinc-900 uppercase">
                        {habit.nama}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                        <Flame className={cn("w-3 h-3", streak > 0 ? "text-[#FF3B30]" : "text-zinc-300")} />
                        <span>{streak} Day Streak</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteHabit(dispatch, habit.id)}
                    className="p-2 opacity-0 group-hover:opacity-100 transition-all text-zinc-200 hover:text-[#FF3B30]"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Micro Matrix */}
                <div className="flex justify-between items-end gap-1 mb-6">
                  {last30Days.map((day, idx) => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const isDone = logDates.has(dateStr)
                    const isTodayCell = isSameDay(day, today)
                    
                    return (
                      <div 
                        key={dateStr}
                        className={cn(
                          "flex-1 aspect-[1/2] rounded-full transition-all",
                          isDone ? "bg-[#2CFE4D]" : "bg-zinc-100",
                          isTodayCell && "ring-2 ring-zinc-900 ring-offset-2"
                        )}
                        title={format(day, 'MMM dd')}
                      />
                    )
                  })}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-[#007AFF]" />
                    <span className="text-[12px] font-bold text-zinc-900 tracking-tighter uppercase">
                      Consistency Node
                    </span>
                  </div>
                  <span className="text-[12px] font-bold text-zinc-300 tracking-tighter">
                    Last 30 Days
                  </span>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      <div className="h-20" />
    </div>
  )
}
