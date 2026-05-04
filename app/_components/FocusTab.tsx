'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target, 
  ArrowLeft,
  Zap,
  Coffee,
  Check
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
    <div className="flex-1 flex flex-col bg-[#F5F5F5] h-screen overflow-hidden relative">
      {/* Back Button */}
      <button 
        onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'home' })}
        className="absolute top-12 left-6 p-4 bg-white rounded-2xl shadow-sm border border-zinc-100 active:scale-90 transition-all z-20"
      >
        <ArrowLeft className="w-6 h-6 text-zinc-400" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full relative z-10">
        <header className="text-center mb-16 tracking-tighter">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm border border-zinc-100"
          >
            <Target className="text-zinc-900 w-8 h-8" />
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-[44px] font-bold leading-none text-zinc-900 mb-4"
          >
            Core Focus
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-[18px] font-bold"
          >
            {pendingTasks.length > 0 
              ? `${pendingTasks.length} nodes remaining today.` 
              : "All nodes cleared. Time for stasis. ☕"}
          </motion.p>
        </header>

        <div className="w-full space-y-4">
          <AnimatePresence mode="popLayout">
            {pendingTasks.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <Coffee className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                <p className="text-zinc-400 font-bold tracking-tighter text-lg uppercase">Core Rest Mode</p>
              </motion.div>
            ) : (
              pendingTasks.slice(0, 3).map((task, i) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => toggleTask(dispatch, task.id, task.isSelesai, task)}
                  className="bg-white p-8 rounded-[32px] flex items-center gap-6 group cursor-pointer active:scale-[0.98] transition-all border border-zinc-50 shadow-[0_20px_50px_rgba(0,0,0,0.03)]"
                >
                  <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:bg-[#007AFF] group-hover:text-white transition-all">
                    <Check className="w-7 h-7" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-[22px] font-bold tracking-tighter leading-tight text-zinc-900 truncate">
                      {task.judul}
                    </h3>
                    {task.proyekId && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: state.projects.find(p => p.id === task.proyekId)?.warna || '#007AFF' }} />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-300">
                          {state.projects.find(p => p.id === task.proyekId)?.nama}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {completedCount > 0 && pendingTasks.length > 0 && (
          <footer className="mt-16 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#2CFE4D]" />
            <span className="text-zinc-300 text-[12px] font-bold uppercase tracking-widest">
              {completedCount} Nodes Synchronized
            </span>
          </footer>
        )}
      </div>

      {/* Aesthetic Background Text */}
      <div className="absolute bottom-[-40px] left-[-40px] opacity-[0.03] pointer-events-none select-none">
         <h1 className="text-[200px] font-black tracking-tighter text-black">FOCUS</h1>
      </div>
    </div>
  )
}
