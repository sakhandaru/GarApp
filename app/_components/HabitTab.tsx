'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  RefreshCw, 
  Flame, 
  ChevronRight, 
  Calendar,
  CheckCircle2,
  Circle
} from 'lucide-react'
import { useAppContext, toggleTugas } from '../_context/AppContext'
import { cn } from '../_lib/utils'

export function HabitTab() {
  const { state, dispatch } = useAppContext()
  const habits = state.tugas.filter(t => t.isHabit)

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <header className="p-8 md:p-12 pb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight">Habit & Rutinitas</h2>
          <div className="flex items-center gap-2 bg-orange-500/10 text-orange-500 px-4 py-2 rounded-full">
            <Flame className="w-5 h-5 fill-current" />
            <span className="font-bold text-sm">12 Hari Streak</span>
          </div>
        </div>
        <p className="text-muted-foreground font-medium">Konsistensi adalah kunci dari produktivitas yang berkelanjutan.</p>
      </header>

      <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-32 space-y-8">
        {/* Weekly Progress Overview */}
        <section className="glass p-6 rounded-ios space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Progress Minggu Ini
            </h3>
          </div>
          <div className="flex justify-between items-end h-32 gap-3 px-2">
            {[40, 70, 45, 90, 65, 80, 30].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <div className="w-full bg-white/5 rounded-full relative overflow-hidden flex items-end h-full border border-white/5">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    className={cn(
                      "w-full transition-all group-hover:brightness-125 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.2)]",
                      height > 70 ? "bg-linear-to-t from-primary to-blue-400" : "bg-linear-to-t from-zinc-600 to-zinc-400"
                    )}
                  />
                </div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">{['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][i]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Habit List */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold tracking-tight px-2">Daftar Habit</h3>
          <div className="grid grid-cols-1 gap-4">
            {habits.map((habit, i) => (
              <motion.div 
                key={habit.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-6 rounded-ios flex items-center justify-between group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                    <RefreshCw className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg leading-tight">{habit.judul}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{habit.recurrence || 'harian'}</span>
                      <div className="w-1 h-1 rounded-full bg-zinc-700" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">85% Sukses</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex -space-x-1">
                    {[1, 1, 1, 0, 1].map((done, idx) => (
                      <div 
                        key={idx} 
                        className={cn(
                          "w-3 h-3 rounded-full border-2 border-background",
                          done ? "bg-green-500" : "bg-zinc-800"
                        )} 
                      />
                    ))}
                  </div>
                  <button 
                    onClick={() => toggleTugas(dispatch, habit.id, habit.isSelesai)}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                      habit.isSelesai 
                        ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                        : "glass hover:bg-white/10 text-muted-foreground"
                    )}
                  >
                    {habit.isSelesai ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </button>
                </div>
              </motion.div>
            ))}
            
            {habits.length === 0 && (
              <div className="py-20 text-center glass rounded-ios border-dashed">
                <p className="text-muted-foreground italic">Belum ada habit yang ditambahkan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
