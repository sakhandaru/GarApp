'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Flag, Tag as TagIcon, ArrowUp } from 'lucide-react'
import { useAppContext } from '../_context/AppContext'
import { Tugas, Prioritas } from '../_lib/types'
import { cn } from '../_lib/utils'

import { supabase } from '../_lib/supabase'

interface QuickAddProps {
  isOpen: boolean
  onClose: () => void
}

export function QuickAdd({ isOpen, onClose }: QuickAddProps) {
  const { state, dispatch } = useAppContext()
  const [judul, setJudul] = useState('')
  const [prioritas, setPrioritas] = useState<Prioritas>('none')
  const [isHabit, setIsHabit] = useState(false)
  const [recurrence, setRecurrence] = useState<'harian' | 'mingguan'>('harian')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!judul.trim()) return

    const id = Math.random().toString(36).substring(7)
    const tanggalJatuhTempo = new Date().toISOString().slice(0, 10)
    const dibuatPada = new Date().toISOString()

    const tugasBaru: Tugas = {
      id,
      judul: judul.trim(),
      prioritas,
      isHabit,
      recurrence: isHabit ? recurrence : undefined,
      isSelesai: false,
      proyekId: 'p1',
      tagIds: [],
      subtugas: [],
      tanggalJatuhTempo,
      dibuatPada
    }

    // Insert ke Supabase
    const { error } = await supabase.from('tugas').insert({
      judul: judul.trim(),
      prioritas,
      is_habit: isHabit,
      recurrence: isHabit ? recurrence : null,
      is_selesai: false,
      tanggal_jatuh_tempo: tanggalJatuhTempo,
    })

    if (error) {
      console.error('Error saving to Supabase:', error)
      return
    }

    dispatch({ type: 'ADD_TUGAS', payload: tugasBaru })
    setJudul('')
    setPrioritas('none')
    setIsHabit(false)
    setRecurrence('harian')
    onClose()
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100"
          />
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-4 right-4 md:bottom-auto md:top-1/4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl z-101"
          >
            <div className="glass p-6 rounded-[32px] shadow-2xl border-white/20">
              <form onSubmit={handleSimpan} className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ketik tugas baru..."
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    className="flex-1 bg-transparent text-xl font-bold placeholder:text-muted-foreground outline-none border-none"
                  />
                  <button 
                    type="button"
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-all text-muted-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex p-1 glass rounded-full overflow-hidden">
                    <button 
                      type="button"
                      onClick={() => setIsHabit(false)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all",
                        !isHabit ? "bg-primary text-white" : "text-muted-foreground"
                      )}
                    >
                      Sekali
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsHabit(true)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all",
                        isHabit ? "bg-orange-500 text-white" : "text-muted-foreground"
                      )}
                    >
                      Habit
                    </button>
                  </div>

                  {isHabit && (
                    <div className="flex p-1 glass rounded-full overflow-hidden">
                      {(['harian', 'mingguan'] as const).map((r) => (
                        <button 
                          key={r}
                          type="button"
                          onClick={() => setRecurrence(r)}
                          className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all",
                            recurrence === r ? "bg-zinc-700 text-white" : "text-muted-foreground"
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="h-4 w-px bg-white/10 mx-1" />

                  <PrioritasButton current={prioritas} set={setPrioritas} />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                    <button type="button" className="p-2.5 glass-morphism rounded-2xl text-muted-foreground hover:text-primary transition-all">
                      <Calendar className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2.5 glass-morphism rounded-2xl text-muted-foreground hover:text-primary transition-all">
                      <TagIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <button 
                    disabled={!judul.trim()}
                    type="submit"
                    className="h-12 px-6 bg-primary rounded-2xl text-white font-bold flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all"
                  >
                    Simpan <ArrowUp className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function PrioritasButton({ current, set }: { current: Prioritas, set: (p: Prioritas) => void }) {
  const levels: { val: Prioritas; color: string; label: string }[] = [
    { val: 'tinggi', color: 'text-red-500', label: 'Tinggi' },
    { val: 'sedang', color: 'text-orange-500', label: 'Sedang' },
    { val: 'rendah', color: 'text-blue-500', label: 'Rendah' },
    { val: 'none', color: 'text-zinc-500', label: 'None' }
  ]

  const nextIndex = (levels.findIndex(l => l.val === current) + 1) % levels.length

  return (
    <button
      type="button"
      onClick={() => set(levels[nextIndex].val)}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border",
        "bg-white/5 border-white/10",
        levels.find(l => l.val === current)?.color
      )}
    >
      <Flag className="w-3.5 h-3.5" /> {levels.find(l => l.val === current)?.label}
    </button>
  )
}
