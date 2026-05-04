'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target, 
  CheckCircle2, 
  ArrowLeft,
  Zap,
  Coffee
} from 'lucide-react'
import { useAppContext, toggleTask } from '../_context/AppContext'
import { cn } from '../_lib/utils'

export function FocusTab() {
  const { state, dispatch } = useAppContext()
  const { tasks } = state

  const today = new Date().toISOString().slice(0, 10)
  const todayTasks = tasks.filter(t => t.tanggal === today && !t.parentTaskId)
  const pendingTasks = todayTasks.filter(t => !t.isSelesai)
  const completedCount = todayTasks.filter(t => t.isSelesai).length

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full h-full">
      <header className="text-center mb-16">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-primary/20"
        >
          <Target className="text-primary w-10 h-10" />
        </motion.div>
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-5xl font-black tracking-tighter mb-4"
        >
          Zona Fokus
        </motion.h2>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-500 text-xl font-bold"
        >
          {pendingTasks.length > 0 
            ? `Selesaikan ${pendingTasks.length} tugas lagi untuk hari ini.` 
            : "Semua beres! Waktunya istirahat. ☕"}
        </motion.p>
      </header>

      <div className="w-full space-y-6">
        <AnimatePresence mode="popLayout">
          {pendingTasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <Coffee className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-600 font-bold text-lg">Pekerjaan hari ini sudah tuntas.</p>
              <button 
                onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'home' })}
                className="mt-6 text-primary font-black uppercase tracking-widest text-xs flex items-center gap-2 mx-auto hover:gap-3 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
              </button>
            </motion.div>
          ) : (
            pendingTasks.map((task, i) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => toggleTask(dispatch, task.id, task.isSelesai, task)}
                className="glass-dark p-8 rounded-[40px] flex items-center gap-6 group cursor-pointer hover:scale-[1.02] transition-all border border-white/5 premium-glow shadow-2xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-700 group-hover:text-primary group-hover:bg-primary/10 transition-all border border-white/5">
                  <div className="w-6 h-6 rounded-full border-4 border-current" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-black tracking-tight">{task.judul}</h3>
                  {task.proyekId && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: state.projects.find(p => p.id === task.proyekId)?.warna }} />
                      <span className="text-xs font-black uppercase tracking-widest text-zinc-600">
                        {state.projects.find(p => p.id === task.proyekId)?.nama}
                      </span>
                    </div>
                  )}
                </div>
                <Zap className="w-6 h-6 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {completedCount > 0 && pendingTasks.length > 0 && (
        <footer className="mt-16 text-zinc-600 text-sm font-bold">
          {completedCount} tugas sudah selesai hari ini. Keep it up!
        </footer>
      )}
      
      <button 
        onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'home' })}
        className="fixed top-12 left-12 p-4 glass rounded-2xl hover:bg-white/10 transition-all group"
      >
        <ArrowLeft className="w-6 h-6 text-zinc-500 group-hover:text-foreground transition-colors" />
      </button>
    </div>
  )
}
