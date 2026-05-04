'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion'
import { useAppContext, toggleTask } from '../_context/AppContext'
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import { id } from 'date-fns/locale'
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  ChevronRight,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Plus
} from 'lucide-react'
import { cn } from '../_lib/utils'

// --- Sub-components ---

function HorizontalCalendar({ selectedDate, onDateSelect }: { selectedDate: Date, onDateSelect: (d: Date) => void }) {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start, end: addDays(start, 13) }) // 2 weeks

  return (
    <div className="flex gap-4 overflow-x-auto py-8 px-8 no-scrollbar">
      {days.map((day) => {
        const isSelected = isSameDay(day, selectedDate)
        const isToday = isSameDay(day, new Date())
        
        return (
          <button
            key={day.toString()}
            onClick={() => onDateSelect(day)}
            className={cn(
              "flex flex-col items-center min-w-[50px] transition-all",
              isSelected ? "scale-110" : "opacity-30"
            )}
          >
            <span className="text-[10px] font-black uppercase tracking-widest mb-2">
              {format(day, 'eee')}
            </span>
            <div className={cn(
              "w-10 h-10 flex items-center justify-center text-lg font-black",
              isSelected && "bg-black text-white rounded-none",
              isToday && !isSelected && "text-black border-b-2 border-black"
            )}>
              {format(day, 'd')}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// --- Main HomeTab ---

export function HomeTab() {
  const { state, dispatch } = useAppContext()
  const { user, tasks } = state
  
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  
  const dragY = useMotionValue(0)
  const sheetY = useTransform(dragY, [0, -500], [0, -500])

  const today = new Date()
  const formattedDay = format(today, 'eee')
  const formattedDate = format(today, 'MMMM d, yyyy')

  const filteredTasks = tasks.filter(t => isSameDay(new Date(t.tanggal), selectedDate))

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y < -100) {
      setIsSheetOpen(true)
      animate(dragY, -600, { type: 'spring', damping: 25, stiffness: 200 })
    } else if (info.offset.y > 100) {
      setIsSheetOpen(false)
      animate(dragY, 0, { type: 'spring', damping: 25, stiffness: 200 })
    } else {
      animate(dragY, isSheetOpen ? -600 : 0, { type: 'spring', damping: 25, stiffness: 200 })
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 15) return 'Good afternoon'
    if (hour < 18) return 'Good evening'
    return 'Good night'
  }

  return (
    <div className="flex-1 h-screen bg-white overflow-hidden relative selection:bg-black selection:text-white">
      {/* Background Greeting Layer */}
      <div className="p-10 pt-20 md:p-20 space-y-12">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <h1 className="text-7xl font-black tracking-tighter">{formattedDay}</h1>
            <div className="w-3 h-3 bg-black rounded-full mt-4" />
          </div>
          <p className="text-right text-zinc-400 font-black uppercase tracking-[0.2em] leading-tight pt-4">
            {formattedDate}
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-light tracking-tight leading-tight text-black max-w-[280px]">
            {getGreeting()}, <span className="font-black">{user.nama}</span>.<br />
            <span className="opacity-30">You have {tasks.filter(t => !t.isSelesai).length} tasks pending today.</span>
          </h2>
          
          <div className="flex gap-8 pt-8">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-black rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">4.7K Steps</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-black rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">7.3 Hours</span>
             </div>
          </div>
        </div>
      </div>

      {/* Swipable Bottom Sheet */}
      <motion.div
        drag="y"
        dragConstraints={{ top: -600, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ y: dragY }}
        className="absolute top-[70%] left-0 right-0 bottom-[-600px] bg-white hairline-t shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.1)] z-50 overflow-hidden"
      >
        {/* Drag Handle */}
        <div className="w-full flex justify-center py-4">
          <div className="w-12 h-1 bg-zinc-100 rounded-full" />
        </div>

        {/* Content of Sheet */}
        <div className="h-full flex flex-col">
          <HorizontalCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
          
          <div className="flex-1 overflow-y-auto px-8 pb-40 space-y-px bg-zinc-50">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div key={task.id} className="bg-white p-8 flex items-center justify-between hairline-b group hover:bg-black transition-colors duration-500">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => toggleTask(dispatch, task.id, task.isSelesai, task)}
                      className="w-6 h-6 border hairline-border group-hover:border-white/20 transition-colors flex items-center justify-center"
                    >
                      {task.isSelesai && <CheckCircle2 className="w-4 h-4 text-black group-hover:text-white" />}
                    </button>
                    <div>
                      <h4 className={cn("text-xl font-light tracking-tighter uppercase group-hover:text-white transition-colors", task.isSelesai && "line-through opacity-20")}>
                        {task.judul}
                      </h4>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 group-hover:text-white transition-colors">
                        {task.prioritas}_PRIORITY
                      </p>
                    </div>
                  </div>
                  {task.waktu && (
                    <span className="text-sm font-light tracking-tighter group-hover:text-white transition-colors">
                      {task.waktu}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="py-20 flex flex-col items-center justify-center opacity-10">
                <Clock className="w-12 h-12 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">No_Events_Scheduled</p>
              </div>
            )}

            <button className="w-full py-10 bg-white hairline-t flex items-center justify-center gap-4 hover:bg-black hover:text-white transition-all group">
               <Plus className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Initialize_Node</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Sheet Peeking Hint Overlay (Optional but nice) */}
      {!isSheetOpen && (
        <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none">
          <p className="text-[9px] font-black uppercase tracking-[0.6em] opacity-10">Swipe_Up_To_Explore</p>
        </div>
      )}
    </div>
  )
}
