'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  CheckSquare, 
  RefreshCw, 
  Trash2,
  AlertCircle
} from 'lucide-react'
import { useAppContext, toggleTugas, deleteTugas } from '../_context/AppContext'
import { cn } from '../_lib/utils'

export function TaskList() {
  const { state, dispatch } = useAppContext()
  const { tugas } = state
  const [filter, setFilter] = useState<'semua' | 'aktif' | 'selesai'>('semua')
  const [search, setSearch] = useState('')

  const filteredTasks = tugas.filter(t => {
    const matchesSearch = t.judul.toLowerCase().includes(search.toLowerCase())
    if (filter === 'aktif') return !t.isSelesai && matchesSearch
    if (filter === 'selesai') return t.isSelesai && matchesSearch
    return matchesSearch
  })

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <header className="p-8 md:p-12 pb-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight">Semua Tugas</h2>
          <div className="flex gap-2">
            <button className="p-2 glass-morphism rounded-xl text-muted-foreground hover:text-foreground transition-all">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Cari tugas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass py-3 pl-12 pr-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex p-1 glass rounded-2xl w-fit">
            {(['semua', 'aktif', 'selesai'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                  filter === f ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-32 space-y-3">
        {filteredTasks.map((task, i) => (
          <motion.div 
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass p-5 rounded-ios flex items-center gap-5 group hover:bg-white/5 transition-all"
          >
            <button 
              onClick={() => toggleTugas(dispatch, task.id, task.isSelesai)}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                task.isSelesai ? "bg-green-500/10 text-green-500" : (task.isHabit ? "bg-orange-500/10 text-orange-500" : "bg-primary/10 text-primary")
              )}
            >
              {task.isSelesai ? <CheckSquare className="w-6 h-6" /> : (task.isHabit ? <RefreshCw className="w-6 h-6" /> : <div className="w-6 h-6 rounded-md border-2 border-current opacity-20" />)}
            </button>
            
            <div className="flex-1">
              <h4 className={cn(
                "font-bold text-lg tracking-tight transition-all",
                task.isSelesai && "line-through text-muted-foreground opacity-50"
              )}>
                {task.judul}
              </h4>
              <div className="flex items-center gap-3 mt-1">
                {task.prioritas !== 'none' && (
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                    task.prioritas === 'tinggi' ? "bg-red-500/10 text-red-500" : 
                    task.prioritas === 'sedang' ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"
                  )}>
                    {task.prioritas}
                  </span>
                )}
                {task.isHabit && <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Habit</span>}
              </div>
            </div>

            <button 
              onClick={() => deleteTugas(dispatch, task.id)}
              className="p-3 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </motion.div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4">
            <AlertCircle className="w-12 h-12 opacity-20" />
            <p className="italic font-medium">Tidak ada tugas yang ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  )
}
