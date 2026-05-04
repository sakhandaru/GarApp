'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Inbox, 
  Calendar, 
  AlertCircle, 
  Clock, 
  ChevronDown,
  CornerDownLeft,
  RefreshCw,
  Hash
} from 'lucide-react'
import { useAppContext } from '../_context/AppContext'
import { Prioritas, Task } from '../_lib/types'
import { cn } from '../_lib/utils'
import { supabase } from '../_lib/supabase'
import { parseNLP } from '../_lib/nlp'

interface QuickAddProps {
  isOpen: boolean
  onClose: () => void
}

export function QuickAdd({ isOpen, onClose }: QuickAddProps) {
  const { state, dispatch } = useAppContext()
  const [judul, setJudul] = useState('')
  const [prioritas, setPrioritas] = useState<Prioritas>('low')
  const [proyekId, setProyekId] = useState<string | null>(null)
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10))
  const [waktu, setWaktu] = useState<string | undefined>(undefined)
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringType, setRecurringType] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  
  const [nlpParsed, setNlpParsed] = useState<any>(null)
  
  const [showProjectMenu, setShowProjectMenu] = useState(false)
  const [showDateMenu, setShowDateMenu] = useState(false)
  const [showPriorityMenu, setShowPriorityMenu] = useState(false)
  const [showRecurringMenu, setShowRecurringMenu] = useState(false)
  const [showTimeMenu, setShowTimeMenu] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // NLP Effect
  useEffect(() => {
    if (judul.trim()) {
      const result = parseNLP(judul, state.projects)
      setNlpParsed(result)
      
      // Auto-update fields if NLP finds something
      if (result.prioritas) setPrioritas(result.prioritas)
      if (result.tanggal) setTanggal(result.tanggal)
      if (result.waktu) setWaktu(result.waktu)
      if (result.proyekNama) {
        const p = state.projects.find(p => p.nama === result.proyekNama)
        if (p) setProyekId(p.id)
      }
    } else {
      setNlpParsed(null)
    }
  }, [judul, state.projects])

  const handleSimpan = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!judul.trim()) return

    const judulFinal = nlpParsed?.judul || judul.trim()

    const { data, error } = await supabase.from('tasks').insert({
      judul: judulFinal,
      prioritas,
      proyek_id: proyekId,
      tanggal,
      waktu: waktu || null,
      is_selesai: false,
      is_recurring: isRecurring,
      recurring_type: isRecurring ? recurringType : null,
    }).select().single()

    if (error) {
      console.error('Error saving task:', error)
      return
    }

    const taskBaru: Task = {
      id: data.id,
      judul: data.judul,
      prioritas: data.prioritas,
      tanggal: data.tanggal,
      waktu: data.waktu,
      proyekId: data.proyek_id,
      isSelesai: data.is_selesai,
      status: data.status || 'backlog',
      isRecurring: data.is_recurring,
      recurringType: data.recurring_type,
      dibuatPada: data.dibuat_pada,
    }

    dispatch({ type: 'ADD_TASK', payload: taskBaru })
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setJudul('')
    setPrioritas('low')
    setProyekId(null)
    setTanggal(new Date().toISOString().slice(0, 10))
    setWaktu(undefined)
    setIsRecurring(false)
    setRecurringType('daily')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl z-101 px-4"
          >
            <div className="glass rounded-[32px] border border-white/10 shadow-2xl premium-glow">
              <form onSubmit={handleSimpan} className="p-8">
                {/* ... (rest of input and NLP) */}
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Apa yang ingin dikerjakan? (Ketik tugas...)"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full bg-transparent text-2xl font-bold outline-none placeholder:text-zinc-600 mb-6"
                />

                {/* NLP Preview */}
                {nlpParsed && (judul.includes('!') || judul.includes('#') || judul.includes('besok') || judul.includes('lusa') || judul.includes('hari ini') || judul.includes('jam')) && (
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mr-1">Mendeteksi:</span>
                    {nlpParsed.tanggal && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold border border-orange-500/20">
                        <Calendar className="w-3 h-3" />
                        <span>{nlpParsed.tanggal === new Date().toISOString().slice(0, 10) ? 'Hari Ini' : nlpParsed.tanggal}</span>
                      </div>
                    )}
                    {nlpParsed.waktu && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-500/20">
                        <Clock className="w-3 h-3" />
                        <span>{nlpParsed.waktu.slice(0, 5)}</span>
                      </div>
                    )}
                    {nlpParsed.prioritas && (
                      <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                        nlpParsed.prioritas === 'high' ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                        nlpParsed.prioritas === 'medium' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      )}>
                        <AlertCircle className="w-3 h-3" />
                        <span className="capitalize">{nlpParsed.prioritas}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 relative">
                  {/* Tag Selector */}
                  <div className="relative">
                    <button type="button" onClick={() => setShowProjectMenu(!showProjectMenu)} className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/10 transition-all text-sm font-bold">
                      <Hash className="w-4 h-4 text-zinc-400" />
                      <span>{proyekId ? state.projects.find(p => p.id === proyekId)?.nama : 'Inbox'}</span>
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                    <AnimatePresence>{showProjectMenu && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full mt-2 left-0 w-48 glass rounded-2xl overflow-hidden z-110 border border-white/10 shadow-xl">
                        <button type="button" onClick={() => { setProyekId(null); setShowProjectMenu(false) }} className="w-full px-4 py-3 text-left hover:bg-white/10 text-sm font-bold flex items-center gap-2"><Inbox className="w-4 h-4 text-zinc-400" /> Inbox</button>
                        {state.projects.map(p => (
                          <button key={p.id} type="button" onClick={() => { setProyekId(p.id); setShowProjectMenu(false) }} className="w-full px-4 py-3 text-left hover:bg-white/10 text-sm font-bold flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.warna }} /> {p.nama}
                          </button>
                        ))}
                      </motion.div>
                    )}</AnimatePresence>
                  </div>

                  {/* Date Selector */}
                  <div className="relative">
                    <button type="button" onClick={() => setShowDateMenu(!showDateMenu)} className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/10 transition-all text-sm font-bold">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span>{tanggal === new Date().toISOString().slice(0, 10) ? 'Hari Ini' : tanggal === new Date(Date.now() + 86400000).toISOString().slice(0, 10) ? 'Besok' : tanggal}</span>
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                    <AnimatePresence>{showDateMenu && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full mt-2 left-0 w-48 glass rounded-2xl overflow-hidden z-110 border border-white/10 shadow-xl">
                        <button type="button" onClick={() => { setTanggal(new Date().toISOString().slice(0, 10)); setShowDateMenu(false) }} className="w-full px-4 py-3 text-left hover:bg-white/10 text-sm font-bold">Hari Ini</button>
                        <button type="button" onClick={() => { setTanggal(new Date(Date.now() + 86400000).toISOString().slice(0, 10)); setShowDateMenu(false) }} className="w-full px-4 py-3 text-left hover:bg-white/10 text-sm font-bold">Besok</button>
                        <div className="p-2 border-t border-white/5">
                          <input type="date" value={tanggal} onChange={(e) => { setTanggal(e.target.value); setShowDateMenu(false) }} className="w-full bg-white/5 p-2 rounded-lg text-xs font-bold outline-none" />
                        </div>
                      </motion.div>
                    )}</AnimatePresence>
                  </div>

                  {/* Recurring Selector */}
                  <div className="relative">
                    <button 
                      type="button" 
                      onClick={() => setShowRecurringMenu(!showRecurringMenu)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl glass transition-all text-sm font-bold",
                        isRecurring ? "text-green-500 border border-green-500/20 bg-green-500/5" : "text-zinc-400 hover:bg-white/10"
                      )}
                    >
                      <RefreshCw className={cn("w-4 h-4", isRecurring && "animate-spin-slow")} />
                      <span className="capitalize">{isRecurring ? `Ulang ${recurringType}` : 'Sekali'}</span>
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                    <AnimatePresence>{showRecurringMenu && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full mt-2 left-0 w-48 glass rounded-2xl overflow-hidden z-110 border border-white/10 shadow-xl">
                        <button type="button" onClick={() => { setIsRecurring(false); setShowRecurringMenu(false) }} className="w-full px-4 py-3 text-left hover:bg-white/10 text-sm font-bold">Sekali</button>
                        {(['daily', 'weekly', 'monthly'] as const).map(type => (
                          <button key={type} type="button" onClick={() => { setIsRecurring(true); setRecurringType(type); setShowRecurringMenu(false) }} className="w-full px-4 py-3 text-left hover:bg-white/10 text-sm font-bold capitalize">Ulang {type}</button>
                        ))}
                      </motion.div>
                    )}</AnimatePresence>
                  </div>

                  {/* Time Selector */}
                  <div className="relative">
                    <button 
                      type="button" 
                      onClick={() => setShowTimeMenu(!showTimeMenu)}
                      className={cn(
                        "p-2 rounded-xl glass hover:bg-white/10 transition-all flex items-center gap-2",
                        waktu ? "text-blue-400 border border-blue-400/20 bg-blue-400/5" : "text-zinc-400"
                      )}
                    >
                      <Clock className="w-4 h-4" />
                      {waktu && <span className="text-sm font-bold">{waktu.slice(0, 5)}</span>}
                    </button>
                    <AnimatePresence>{showTimeMenu && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full mt-2 left-0 w-48 glass rounded-2xl overflow-hidden z-110 border border-white/10 shadow-xl">
                        <button type="button" onClick={() => { setWaktu(undefined); setShowTimeMenu(false) }} className="w-full px-4 py-3 text-left hover:bg-white/10 text-sm font-bold">Tanpa Waktu</button>
                        <button type="button" onClick={() => { setWaktu('09:00:00'); setShowTimeMenu(false) }} className="w-full px-4 py-3 text-left hover:bg-white/10 text-sm font-bold">Pagi (09:00)</button>
                        <button type="button" onClick={() => { setWaktu('13:00:00'); setShowTimeMenu(false) }} className="w-full px-4 py-3 text-left hover:bg-white/10 text-sm font-bold">Siang (13:00)</button>
                        <button type="button" onClick={() => { setWaktu('19:00:00'); setShowTimeMenu(false) }} className="w-full px-4 py-3 text-left hover:bg-white/10 text-sm font-bold">Malam (19:00)</button>
                        <div className="p-2 border-t border-white/5">
                          <input type="time" value={waktu || ''} onChange={(e) => { setWaktu(e.target.value); setShowTimeMenu(false) }} className="w-full bg-white/5 p-2 rounded-lg text-xs font-bold outline-none" />
                        </div>
                      </motion.div>
                    )}</AnimatePresence>
                  </div>

                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-[10px] font-black text-zinc-500 flex items-center gap-1 uppercase tracking-widest">
                      <CornerDownLeft className="w-3 h-3" /> ENTER UNTUK SIMPAN
                    </span>
                    <button type="submit" className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all">Simpan</button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
