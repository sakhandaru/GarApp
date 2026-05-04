'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Trash2, 
  Clock, 
  AlertCircle,
  ChevronDown,
  Plus,
  Calendar,
  Briefcase
} from 'lucide-react'
import { useAppContext, toggleTask, deleteTask } from '../_context/AppContext'
import { cn } from '../_lib/utils'
import { supabase } from '../_lib/supabase'
import { Task } from '../_lib/types'

export function TaskList() {
  const { state, dispatch } = useAppContext()
  const { tasks, projects, activeTab } = state
  const [search, setSearch] = useState('')
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

  // ... (getFilteredTasks and other logic remain same)

  // Filter logic based on activeTab
  const getFilteredTasks = () => {
    let filtered = tasks

    // Filter by Active Tab (Smart Lists or Projects)
    const today = new Date().toISOString().slice(0, 10)
    
    if (activeTab === 'today') {
      filtered = filtered.filter(t => t.tanggal === today)
    } else if (activeTab === 'tomorrow') {
      const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
      filtered = filtered.filter(t => t.tanggal === tomorrow)
    } else if (activeTab === 'overdue') {
      filtered = filtered.filter(t => t.tanggal < today && !t.isSelesai)
    } else if (activeTab === 'next7') {
      const next7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
      filtered = filtered.filter(t => {
        return t.tanggal >= today && t.tanggal <= next7
      })
    } else if (activeTab === 'inbox') {
      filtered = filtered.filter(t => !t.proyekId)
    } else if (activeTab.startsWith('project-')) {
      const pid = activeTab.replace('project-', '')
      filtered = filtered.filter(t => t.proyekId === pid)
    }

    // Apply Search
    if (search.trim()) {
      filtered = filtered.filter(t => 
        t.judul.toLowerCase().includes(search.toLowerCase())
      )
    }

    // NEW PHILOSOPHY: Show only actionable tasks (standalone tasks or subtasks)
    // Hide "Projects" (tasks that have children) from this list
    return filtered.filter(t => {
      const isParent = tasks.some(child => child.parentTaskId === t.id)
      const isSubtask = !!t.parentTaskId
      
      // Show if it's a subtask OR it's a standalone task (not a parent)
      return isSubtask || !isParent
    })
  }

  const filteredTasks = getFilteredTasks()
  const activeTitle = () => {
    if (activeTab === 'today') return 'Hari Ini'
    if (activeTab === 'tomorrow') return 'Besok'
    if (activeTab === 'overdue') return 'Terlambat'
    if (activeTab === 'next7') return '7 Hari Ke Depan'
    if (activeTab === 'inbox') return 'Inbox'
    if (activeTab.startsWith('project-')) {
      const p = projects.find(p => p.id === activeTab.replace('project-', ''))
      return p ? p.nama : 'Proyek'
    }
    return 'Semua Tugas'
  }

  const handleAddSubtask = async (parentId: string) => {
    if (!newSubtaskTitle.trim()) return

    const { data, error } = await supabase.from('tasks').insert({
      judul: newSubtaskTitle.trim(),
      parent_task_id: parentId,
      is_selesai: false,
    }).select().single()

    if (error) {
      console.error('Error adding subtask:', error)
      return
    }

    const subtask: Task = {
      id: data.id,
      judul: data.judul,
      isSelesai: data.is_selesai,
      status: data.status || 'backlog',
      parentTaskId: data.parent_task_id,
      prioritas: 'low',
      tanggal: data.tanggal,
      isRecurring: false,
      dibuatPada: data.dibuat_pada
    }

    dispatch({ type: 'ADD_TASK', payload: subtask })
    setNewSubtaskTitle('')
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <header className="p-8 md:p-12 pb-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-black tracking-tighter">{activeTitle()}</h2>
          <div className="flex gap-2">
            <button className="p-3 glass rounded-xl text-zinc-400 hover:text-foreground transition-all">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Cari tugas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass py-4 pl-12 pr-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-32 space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-600">
            <CheckCircle2 className="w-12 h-12 mb-4 opacity-10" />
            <p className="font-bold">Tidak ada tugas ditemukan</p>
          </div>
        ) : (
          filteredTasks.map((task, i) => {
            const subtasks = tasks.filter(t => t.parentTaskId === task.id)
            const completedSubtasks = subtasks.filter(t => t.isSelesai).length
            const isExpanded = expandedTaskId === task.id

            return (
              <div key={task.id} className="flex flex-col gap-2">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "glass p-5 rounded-ios flex items-center gap-5 group hover:bg-white/5 transition-all cursor-pointer",
                    isExpanded && "ring-1 ring-primary/20 bg-white/5"
                  )}
                  onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleTask(dispatch, task.id, task.isSelesai, task)
                    }}
                    className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                      task.isSelesai 
                        ? "bg-green-500/10 text-green-500" 
                        : "bg-white/5 text-zinc-600 group-hover:text-primary group-hover:bg-primary/5"
                    )}
                  >
                    {task.isSelesai ? <CheckCircle2 className="w-6 h-6" /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    {task.parentTaskId && (
                      <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary mb-1 opacity-70">
                        <Briefcase className="w-2.5 h-2.5" />
                        <span>{tasks.find(t => t.id === task.parentTaskId)?.judul}</span>
                      </div>
                    )}
                    <h4 className={cn(
                      "font-bold text-lg tracking-tight transition-all truncate",
                      task.isSelesai && "line-through text-zinc-500 opacity-50"
                    )}>
                      {task.judul}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-black uppercase tracking-widest flex-wrap">
                      <div className={cn(
                        "px-2 py-0.5 rounded-full",
                        task.prioritas === 'high' ? "bg-red-500/10 text-red-500" : 
                        task.prioritas === 'medium' ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"
                      )}>
                        {task.prioritas}
                      </div>
                      
                      {/* Project Tag */}
                      {task.proyekId && (
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: projects.find(p => p.id === task.proyekId)?.warna }} />
                          <span>{projects.find(p => p.id === task.proyekId)?.nama}</span>
                        </div>
                      )}

                      {/* Date Tag */}
                      <div className="flex items-center gap-1 text-zinc-500">
                        <Calendar className="w-3 h-3" />
                        <span>{task.tanggal === new Date().toISOString().slice(0, 10) ? 'Hari Ini' : task.tanggal}</span>
                      </div>

                      {subtasks.length > 0 && (
                        <span className="text-zinc-500 font-black">{completedSubtasks}/{subtasks.length} ✓</span>
                      )}
                      {task.waktu && <span className="text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {task.waktu.slice(0, 5)}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteTask(dispatch, task.id)
                      }}
                      className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <ChevronDown className={cn("w-4 h-4 text-zinc-700 transition-transform", isExpanded && "rotate-180")} />
                  </div>
                </motion.div>

                {/* Subtask Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="ml-15 space-y-2 overflow-hidden"
                    >
                      {subtasks.map((sub) => (
                        <div key={sub.id} className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 rounded-xl group transition-all">
                          <button 
                            onClick={() => toggleTask(dispatch, sub.id, sub.isSelesai, sub)}
                            className={cn(
                              "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                              sub.isSelesai ? "bg-primary border-primary text-white" : "border-zinc-700 text-transparent"
                            )}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                          </button>
                          <span className={cn(
                            "text-sm font-bold flex-1",
                            sub.isSelesai && "text-zinc-500 line-through"
                          )}>
                            {sub.judul}
                          </span>
                          <button 
                            onClick={() => deleteTask(dispatch, sub.id)}
                            className="p-1 text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      <div className="flex items-center gap-3 px-4 py-2">
                        <Plus className="w-4 h-4 text-zinc-500" />
                        <input
                          type="text"
                          placeholder="Tambah subtask..."
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask(task.id)}
                          className="bg-transparent text-sm font-bold outline-none placeholder:text-zinc-700 flex-1"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
