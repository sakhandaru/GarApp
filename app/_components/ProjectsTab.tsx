'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Briefcase, 
  ChevronRight,
  Plus,
  Target
} from 'lucide-react'
import { useAppContext } from '../_context/AppContext'
import { cn } from '../_lib/utils'

interface ProjectsTabProps {
  onOpenAdd: () => void
}

export function ProjectsTab({ onOpenAdd }: ProjectsTabProps) {
  const { state, dispatch } = useAppContext()
  const { tasks } = state

  const handleProjectClick = (id: string) => {
    dispatch({ type: 'SET_ACTIVE_PROJECT', payload: id })
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'kanban' })
  }

  // Filter tasks that act as projects (tasks with subtasks)
  const projectTasks = tasks.filter(t => !t.parentTaskId && tasks.some(sub => sub.parentTaskId === t.id))

  return (
    <div className="flex-1 flex flex-col p-8 md:p-16 overflow-y-auto">
      <header className="mb-12">
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Pusat Management Proyek</h2>
        <p className="text-zinc-500 text-lg font-medium">Klik pada proyek untuk masuk ke Kanban Board.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {projectTasks.length === 0 ? (
          <div className="col-span-full py-20 text-center glass rounded-[32px] border border-dashed border-white/10">
            <Briefcase className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-500 font-bold">Belum ada proyek aktif.</p>
            <p className="text-zinc-600 text-sm mt-2">Buat tugas lalu tambahkan subtask untuk menjadikannya proyek.</p>
          </div>
        ) : (
          projectTasks.map((project, i) => {
            const subtasks = tasks.filter(t => t.parentTaskId === project.id)
            const completed = subtasks.filter(t => t.isSelesai).length
            const progress = Math.round((completed / (subtasks.length || 1)) * 100)

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleProjectClick(project.id)}
                className="glass-dark p-8 rounded-[40px] border border-white/5 transition-all relative overflow-hidden h-fit group hover:border-primary/40 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <div className="p-3 glass rounded-full opacity-0 group-hover:opacity-100 transition-all">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>

                <h3 className="text-2xl font-black mb-2 group-hover:text-primary transition-colors">{project.judul}</h3>
                
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">
                  <span>{completed} / {subtasks.length} Actionable Items</span>
                  <span className="text-primary font-black">{progress}%</span>
                </div>

                <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-6">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "circOut" }}
                    className="h-full bg-linear-to-r from-primary to-blue-500 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                  />
                </div>

                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                  <Target className="w-3 h-3" />
                  <span>Open Kanban Board</span>
                </div>
              </motion.div>
            )
          })
        )}

        <button 
          onClick={onOpenAdd} 
          className="p-12 rounded-[40px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 text-zinc-600 hover:text-primary hover:border-primary/30 transition-all group bg-white/1"
        >
          <div className="w-16 h-16 rounded-full border-2 border-current flex items-center justify-center group-hover:scale-110 transition-transform bg-white/5">
            <Plus className="w-8 h-8" />
          </div>
          <div className="text-center">
            <p className="font-black text-lg">Mulai Proyek Baru</p>
            <p className="text-sm opacity-60">Pecah tugas besar menjadi langkah kecil.</p>
          </div>
        </button>
      </div>
    </div>
  )
}
