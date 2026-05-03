'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  CheckSquare, 
  RefreshCw, 
  Clock, 
  ChevronRight,
  Star
} from 'lucide-react'
import { useAppContext, toggleTugas } from '@/app/_context/AppContext'
import { cn } from '@/app/_lib/utils'

export function HomeTab() {
  const { state, dispatch } = useAppContext()
  const { tugas, user } = state

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  const dayName = today.toLocaleDateString('id-ID', { weekday: 'long' })
  const dateStr = today.toLocaleDateString('id-ID', { month: 'long', day: '2-digit', year: 'numeric' })

  const tugasHariIni = tugas.filter(t => t.tanggalJatuhTempo === todayStr && !t.isSelesai)
  const meetingCount = tugasHariIni.filter(t => t.tagIds.includes('t1')).length
  const habitCount = tugasHariIni.filter(t => t.isHabit).length
  const regularCount = tugasHariIni.length - meetingCount - habitCount

  return (
    <div className="flex-1 overflow-y-auto p-8 md:p-12 max-w-5xl mx-auto w-full space-y-12 pb-32">
      <header className="space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <span className="text-primary font-bold tracking-widest uppercase text-[10px]">Ringkasan Harian</span>
          <div className="h-px flex-1 bg-primary/10" />
        </motion.div>
        
        <div className="space-y-2">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {dayName}, <span className="text-muted-foreground font-medium">{dateStr}</span>
          </h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl font-medium text-muted-foreground leading-relaxed"
          >
            Selamat pagi, <span className="text-foreground font-bold">{user.nama}</span>. 
            Anda memiliki <span className="text-primary">{meetingCount} meeting</span>, 
            <span className="text-foreground"> {regularCount} tugas</span> dan 
            <span className="text-orange-500"> {habitCount} habit</span> hari ini.
          </motion.p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="glass p-8 rounded-ios space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Star className="w-4 h-4" /> Status
          </h3>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
               <p className="text-2xl font-bold">mostly free</p>
               <p className="text-xs text-muted-foreground">Setelah jam 16:00 hari ini</p>
            </div>
            <div className="w-12 h-12 glass rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
          </div>
        </section>

        <section className="glass p-8 rounded-ios flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all">
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Streak</h3>
            <p className="text-2xl font-bold text-orange-500">🔥 12 Hari</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </section>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-bold tracking-tight">Agenda Hari Ini</h3>
          <button className="text-primary text-sm font-bold">Semua</button>
        </div>
        
        <div className="space-y-3">
          {tugasHariIni.map((task, i) => (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => toggleTugas(dispatch, task.id, task.isSelesai)}
              className="glass p-5 rounded-ios flex items-center gap-5 group cursor-pointer hover:bg-white/5 transition-all"
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                task.isSelesai ? "bg-green-500/10 text-green-500" : (task.isHabit ? "bg-orange-500/10 text-orange-500" : "bg-primary/10 text-primary")
              )}>
                {task.isSelesai ? <CheckSquare className="w-6 h-6" /> : (task.isHabit ? <RefreshCw className="w-6 h-6" /> : <CheckSquare className="w-6 h-6 opacity-40" />)}
              </div>
              <div className="flex-1">
                <h4 className={cn(
                  "font-bold text-lg tracking-tight transition-all",
                  task.isSelesai && "line-through text-muted-foreground opacity-50"
                )}>
                  {task.judul}
                </h4>
                <p className="text-sm text-muted-foreground font-medium">
                  {task.waktuPengingat ? new Date(task.waktuPengingat).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sepanjang hari'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
            </motion.div>
          ))}
          {tugasHariIni.length === 0 && (
            <p className="text-center py-10 text-muted-foreground italic glass rounded-ios border-dashed">
              Tidak ada agenda hari ini.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
