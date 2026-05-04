'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Briefcase, 
  ChevronRight,
  Plus,
  Target,
  Folder
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
    <div className="flex-1 flex flex-col bg-[#F5F5F5] overflow-y-auto no-scrollbar pb-32">
      {/* 1. HEADING - Home Style */}
      <div className="flex justify-between items-start px-6 pt-16 mb-12">
        <div className="tracking-tighter">
          <h1 className="text-[40px] font-bold leading-[0.95] text-zinc-900">
            Active<br />Projects
          </h1>
        </div>
        <div className="text-right tracking-tighter">
          <p className="text-[40px] font-bold text-zinc-400 leading-[0.95]">{projectTasks.length}</p>
          <p className="text-[40px] font-bold text-zinc-400 leading-[0.95]">Nodes</p>
        </div>
      </div>

      {/* 2. PROJECTS LIST */}
      <div className="px-4 space-y-4">
        {projectTasks.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[28px] shadow-sm border border-zinc-100 mx-2">
            <Folder className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
            <p className="text-zinc-400 font-bold tracking-tighter text-lg">No active nodes.</p>
            <button 
              onClick={onOpenAdd}
              className="mt-4 text-[13px] font-bold uppercase tracking-widest text-[#007AFF]"
            >
              Initialize New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectTasks.map((project) => {
              const subtasks = tasks.filter(t => t.parentTaskId === project.id)
              const completed = subtasks.filter(t => t.isSelesai).length
              const progress = Math.round((completed / (subtasks.length || 1)) * 100)

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleProjectClick(project.id)}
                  className="bg-white p-7 rounded-[28px] shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-zinc-50 flex flex-col relative group cursor-pointer active:scale-[0.98] transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-900 group-hover:bg-[#007AFF] group-hover:text-white transition-all">
                      <Folder className="w-6 h-6" />
                    </div>
                    <div className="p-2 bg-zinc-50 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                      <ChevronRight className="w-5 h-5 text-zinc-400" />
                    </div>
                  </div>

                  <h3 className="text-[22px] font-bold tracking-tighter leading-tight mb-1 text-zinc-900 group-hover:text-[#007AFF] transition-colors">
                    {project.judul}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-[12px] font-bold text-zinc-300 tracking-tighter uppercase">
                      {completed} / {subtasks.length} Completed
                    </span>
                    <div className="flex-1 border-b border-dotted border-zinc-100 mb-1" />
                    <span className="text-[12px] font-bold text-zinc-900 tracking-tighter">
                      {progress}%
                    </span>
                  </div>

                  {/* Ultra-thin Progress Bar */}
                  <div className="h-[2px] w-full bg-zinc-50 rounded-full overflow-hidden mb-6">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.2, ease: "circOut" }}
                      className="h-full bg-[#007AFF]"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                    <Target className="w-3 h-3" />
                    <span>View Kanban System</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Global Bottom Padding for Nav */}
      <div className="h-20" />
    </div>
  )
}
