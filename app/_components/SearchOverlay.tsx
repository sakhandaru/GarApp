'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  X, 
  Hash, 
  CheckCircle2, 
  Calendar,
  Command,
  ArrowRight
} from 'lucide-react'
import { useAppContext, toggleTask } from '../_context/AppContext'
import { cn } from '../_lib/utils'

export function SearchOverlay({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { state, dispatch } = useAppContext()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Search logic
  const filteredTasks = query.trim() === '' ? [] : state.tasks.filter(t => 
    t.judul.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5)

  const filteredProjects = query.trim() === '' ? [] : state.projects.filter(p => 
    p.nama.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3)

  const handleTaskClick = (task: any) => {
    // Logic to navigate to task's project or just toggle it
    toggleTask(dispatch, task.id, task.isSelesai, task)
    onClose()
  }

  const handleProjectClick = (projectId: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: `project-${projectId}` })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-200 flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Search Box */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-2xl glass-dark border border-white/10 rounded-[32px] shadow-2xl overflow-hidden relative z-10"
          >
            <div className="p-6 flex items-center gap-4 border-bottom border-white/5 bg-white/5">
              <Search className="w-6 h-6 text-primary" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Cari tugas, proyek, atau perintah..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-xl font-bold placeholder:text-zinc-600"
              />
              <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] font-black text-zinc-500 uppercase">
                <Command className="w-3 h-3" /> ESC
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
              {query.trim() === '' ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-zinc-700" />
                  </div>
                  <p className="text-zinc-500 font-bold">Ketik sesuatu untuk mencari...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredTasks.length > 0 && (
                    <div>
                      <h3 className="px-4 text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Tugas</h3>
                      {filteredTasks.map(task => (
                        <button
                          key={task.id}
                          onClick={() => handleTaskClick(task)}
                          className="w-full p-4 hover:bg-white/5 rounded-2xl flex items-center gap-4 transition-all group text-left"
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                            task.isSelesai ? "bg-primary border-primary text-white" : "border-zinc-700 text-transparent"
                          )}>
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                          <div className="flex-1">
                            <span className={cn("font-bold block", task.isSelesai && "line-through text-zinc-500")}>{task.judul}</span>
                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">
                              {task.tanggal} • {state.projects.find(p => p.id === task.proyekId)?.nama || 'Inbox'}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredProjects.length > 0 && (
                    <div>
                      <h3 className="px-4 text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Proyek</h3>
                      {filteredProjects.map(project => (
                        <button
                          key={project.id}
                          onClick={() => handleProjectClick(project.id)}
                          className="w-full p-4 hover:bg-white/5 rounded-2xl flex items-center gap-4 transition-all group text-left"
                        >
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.warna }} />
                          <span className="flex-1 font-bold">{project.nama}</span>
                          <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredTasks.length === 0 && filteredProjects.length === 0 && (
                    <div className="py-12 text-center text-zinc-500 font-bold">
                      Tidak menemukan hasil untuk "{query}"
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between text-[10px] font-black text-zinc-600 uppercase tracking-widest">
              <span>Sat Set Search v1.0</span>
              <div className="flex gap-4">
                <span>↑↓ Pilih</span>
                <span>↵ Masuk</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
