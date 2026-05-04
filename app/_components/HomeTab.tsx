'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue, animate, PanInfo, useTransform } from 'framer-motion'
import { useAppContext, toggleTask } from '../_context/AppContext'
import { 
  format, 
  isSameDay, 
  isSameWeek, 
  isSameMonth, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  eachWeekOfInterval, 
  startOfYear, 
  eachMonthOfInterval, 
  addDays 
} from 'date-fns'
import { 
  Check, 
  RefreshCw, 
  Sprout, 
  Folder, 
  ChevronUp,
  Filter
} from 'lucide-react'
import { cn } from '../_lib/utils'
import { Task } from '../_lib/types'

// --- 1. COMPONENT HEADING ---
function HomeHeading({ opacity }: { opacity: any }) {
  const now = new Date()
  const month = format(now, 'MMMM')
  const year = format(now, 'yyyy')

  return (
    <motion.div style={{ opacity }} className="flex justify-between items-center mb-10 px-6 pt-16">
      <div className="tracking-tighter">
        <h1 className="text-[40px] font-bold leading-[0.95] text-zinc-900">
          Productivity<br />Statistics
        </h1>
      </div>
      <div className="text-right tracking-tighter">
        <p className="text-[40px] font-bold text-zinc-400 leading-[0.95]">{month}</p>
        <p className="text-[40px] font-bold text-zinc-400 leading-[0.95]">{year}</p>
      </div>
    </motion.div>
  )
}

// --- 2. COMPONENT GRAPH SLIDER ---
function HomeGraphSlider({ opacity }: { opacity: any }) {
  const [activeGraph, setActiveGraph] = useState<'grid' | 'circle'>('circle')
  const days = Array.from({ length: 30 }, (_, i) => ({ val: Math.floor(Math.random() * 5) }))
  
  const percentage = 70
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <motion.div style={{ opacity }} className="px-6 pb-4">
      <motion.div 
        className="relative h-[280px] w-full cursor-grab active:cursor-grabbing flex items-center justify-center"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, info) => {
          if (Math.abs(info.offset.x) > 50) {
            setActiveGraph(prev => prev === 'grid' ? 'circle' : 'grid')
          }
        }}
      >
        <AnimatePresence mode="wait">
          {activeGraph === 'grid' ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="grid grid-cols-7 gap-2"
            >
              {days.map((day, i) => (
                <div key={i} className={cn("w-9 h-9 rounded-sm transition-colors duration-500", day.val === 0 ? "bg-white" : "bg-[#2CFE4D]")} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="circle"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative flex items-center justify-center"
            >
              <div className="relative w-72 h-72 flex items-center justify-center">
                <svg className="absolute w-full h-full -rotate-90">
                  <circle cx="144" cy="144" r={radius} fill="none" stroke="rgba(240, 240, 240, 0.8)" strokeWidth="1.5" />
                  <motion.circle
                    cx="144" cy="144" r={radius} fill="none" stroke="#2CFE4D" strokeWidth="1.5"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute top-2 w-[1.5px] h-4 bg-zinc-200" />
                <div className="absolute bottom-2 w-[1.5px] h-4 bg-zinc-200" />
                <div className="absolute left-2 w-4 h-[1.5px] bg-zinc-200" />
                <div className="absolute right-2 w-4 h-[1.5px] bg-zinc-200" />
                <div className="absolute w-[200px] h-[200px] bg-white rounded-full shadow-[0_15px_45px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center z-20">
                  <span className="text-[72px] font-bold tracking-tighter text-zinc-900 leading-none">{percentage}%</span>
                  <span className="text-[26px] font-bold text-zinc-300 tracking-tighter mt-1">So Good</span>
                </div>
                <div className="absolute w-8 h-8 bg-[#2CFE4D] rounded-full border-[6px] border-white z-30 shadow-md" style={{ top: '45px', right: '35px' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <div className="flex justify-center mt-4 gap-2.5">
        <div className={cn("w-1.5 h-1.5 rounded-full transition-all", activeGraph === 'circle' ? "bg-zinc-800 w-5" : "bg-zinc-200")} />
        <div className={cn("w-1.5 h-1.5 rounded-full transition-all", activeGraph === 'grid' ? "bg-zinc-800 w-5" : "bg-zinc-200")} />
      </div>
    </motion.div>
  )
}

// --- 3. COMPONENT TANGGAL DINAMIS ---
type ViewType = 'Daily' | 'Weekly' | 'Monthly'

function HomeDateScroller({ view, setView, selectedDate, setSelectedDate }: { 
  view: ViewType, 
  setView: (v: ViewType) => void,
  selectedDate: Date,
  setSelectedDate: (d: Date) => void
}) {
  const items = useMemo(() => {
    if (view === 'Daily') {
      const start = startOfMonth(selectedDate)
      const end = endOfMonth(selectedDate)
      return eachDayOfInterval({ start, end }).map(d => ({ label: format(d, 'dd'), date: d }))
    } else if (view === 'Weekly') {
      const start = startOfMonth(selectedDate)
      const end = endOfMonth(selectedDate)
      return eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }).map((d, i) => ({ label: `0${i + 1}`, date: d }))
    } else {
      const start = startOfYear(selectedDate)
      const end = endOfMonth(addDays(startOfYear(selectedDate), 364))
      return eachMonthOfInterval({ start, end }).map(d => ({ label: format(d, 'MM'), date: d }))
    }
  }, [view, selectedDate])

  const toggleView = () => {
    if (view === 'Daily') setView('Weekly')
    else if (view === 'Weekly') setView('Monthly')
    else setView('Daily')
  }

  return (
    <div className="w-full mb-4 flex items-center px-6 overflow-hidden relative">
      <button onClick={toggleView} className="text-[18px] font-bold text-zinc-400 tracking-tighter mr-5 transition-colors active:opacity-50">
        {view}
      </button>
      <div className="flex-1 relative overflow-hidden flex items-center">
        <div className="flex gap-2 overflow-x-auto no-scrollbar snap-x pr-20">
          {items.map((item, i) => {
            const isSelected = view === 'Daily' ? isSameDay(item.date, selectedDate) : view === 'Weekly' ? isSameWeek(item.date, selectedDate, { weekStartsOn: 1 }) : isSameMonth(item.date, selectedDate)
            return (
              <button key={i} onClick={() => setSelectedDate(item.date)} className={cn("flex flex-col items-center min-w-[32px] snap-center transition-all", isSelected ? "opacity-100" : "opacity-30")}>
                <div className={cn("w-7 h-7 flex items-center justify-center text-[16px] font-bold text-zinc-400 tracking-tighter transition-all", isSelected && "bg-white rounded-full text-zinc-500 shadow-sm")}>
                  {item.label}
                </div>
              </button>
            )
          })}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-[#F5F5F5] to-transparent pointer-events-none z-10" />
      </div>
    </div>
  )
}

// --- 4. COMPONENT MODAL CARD ---
function HomeTaskModal({ tasks, view, setView, selectedDate, setSelectedDate, sheetY }: { 
  tasks: Task[], 
  view: ViewType, 
  setView: (v: ViewType) => void,
  selectedDate: Date,
  setSelectedDate: (d: Date) => void,
  sheetY: any
}) {
  const { state, dispatch } = useAppContext()
  const [sheetState, setSheetState] = useState<'half' | 'full'>('half')
  const [activeFilter, setActiveFilter] = useState<{ type: 'prio' | 'tag' | 'project', value: string } | null>(null)
  
  const isFull = sheetState === 'full'

  const availableTags = useMemo(() => Array.from(new Set(tasks.flatMap(t => t.tags || []))), [tasks])
  const availableProjects = useMemo(() => state.projects.map(p => ({ id: p.id, nama: p.nama })), [state.projects])

  const filteredTasks = useMemo(() => {
    let result = tasks.filter(t => {
      const taskDate = new Date(t.tanggal)
      if (view === 'Daily') return isSameDay(taskDate, selectedDate)
      if (view === 'Weekly') return isSameWeek(taskDate, selectedDate, { weekStartsOn: 1 })
      return isSameMonth(taskDate, selectedDate)
    })

    if (activeFilter) {
      if (activeFilter.type === 'prio') {
        result = result.filter(t => t.prioritas === activeFilter.value)
      } else if (activeFilter.type === 'tag') {
        result = result.filter(t => t.tags?.includes(activeFilter.value))
      } else if (activeFilter.type === 'project') {
        result = result.filter(t => t.proyekId === activeFilter.value)
      }
    }

    return result
  }, [tasks, view, selectedDate, activeFilter])

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y < -50) {
      setSheetState('full')
      animate(sheetY, -450, { type: 'spring', damping: 30, stiffness: 300 })
    } else if (info.offset.y > 50) {
      setSheetState('half')
      animate(sheetY, 0, { type: 'spring', damping: 30, stiffness: 300 })
    } else {
      animate(sheetY, isFull ? -450 : 0, { type: 'spring', damping: 30, stiffness: 300 })
    }
  }

  const FilterChip = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-full text-[13px] font-bold tracking-tighter transition-all shrink-0",
        active ? "bg-zinc-900 text-white" : "bg-zinc-50 text-zinc-400 hover:bg-zinc-100"
      )}
    >
      {label}
    </button>
  )

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: -450, bottom: 0 }}
      dragElastic={0.05}
      onDragEnd={handleDragEnd}
      style={{ y: sheetY }}
      className="absolute bottom-[-380px] left-0 right-0 h-[85vh] z-50 flex flex-col items-center"
    >
      <HomeDateScroller view={view} setView={setView} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

      <div className="w-[calc(100%-32px)] bg-white rounded-[28px] shadow-[0_40px_80px_rgba(0,0,0,0.04)] flex flex-col h-full overflow-hidden relative">
        {/* Handle */}
        <div className="w-full flex justify-center py-4">
           <ChevronUp className="w-5 h-5 text-zinc-100" />
        </div>

        {/* Filter Bar */}
        <div className="px-6 mb-2 overflow-x-auto no-scrollbar flex items-center gap-2 pb-2">
          <FilterChip label="All" active={activeFilter === null} onClick={() => setActiveFilter(null)} />
          <FilterChip label="High" active={activeFilter?.type === 'prio' && activeFilter.value === 'high'} onClick={() => setActiveFilter({ type: 'prio', value: 'high' })} />
          {availableProjects.map(p => (
            <FilterChip key={p.id} label={p.nama} active={activeFilter?.type === 'project' && activeFilter.value === p.id} onClick={() => setActiveFilter({ type: 'project', value: p.id })} />
          ))}
          {availableTags.map(tag => (
            <FilterChip key={tag} label={`#${tag}`} active={activeFilter?.type === 'tag' && activeFilter.value === tag} onClick={() => setActiveFilter({ type: 'tag', value: tag })} />
          ))}
        </div>

        <div className="flex-1 relative overflow-hidden flex flex-col">
          {/* Top Fade Overlay - Extended for butter-smooth transition */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-linear-to-b from-white to-transparent z-20 pointer-events-none" />
          
          <div className="flex-1 overflow-y-auto px-6 pb-40 relative no-scrollbar pt-16">
            <motion.div layout className="flex flex-col">
              <AnimatePresence mode="popLayout">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map(task => (
                    <motion.div key={task.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="group">
                      <div className="flex items-center gap-3.5 py-3">
                        <button onClick={() => toggleTask(dispatch, task.id, task.isSelesai, task)} className={cn("w-[18px] h-[18px] rounded-sm border-2 flex items-center justify-center transition-all shrink-0", task.isSelesai ? "bg-[#007AFF] border-[#007AFF]" : "border-zinc-200")}>
                          {task.isSelesai && <Check className="w-3 h-3 text-white stroke-4" />}
                        </button>
                        <div className="flex-1 flex items-center overflow-hidden">
                          <div className="flex items-center gap-2">
                            <h4 className={cn("text-[18px] font-bold tracking-tighter transition-all leading-[1.2]", task.isSelesai ? "text-zinc-200" : (task.prioritas === 'high' ? "text-[#FF3B30]" : "text-zinc-900"))}>
                              {task.judul}
                            </h4>
                            <div className="flex items-center gap-1.5">
                              {task.isRecurring && <RefreshCw className={cn("w-3.5 h-3.5", task.isSelesai ? "text-zinc-100" : "text-zinc-400")} />}
                              <Sprout className={cn("w-3.5 h-3.5", task.isSelesai ? "text-zinc-100" : "text-zinc-400")} />
                            </div>
                          </div>
                          <div className="flex-1 border-b border-dotted border-zinc-100 mb-1.5 mx-2" />
                          <span className={cn("text-[12px] font-bold tabular-nums tracking-tighter shrink-0", task.isSelesai ? "text-zinc-100" : "text-zinc-300")}>{task.waktu || '14.00'}</span>
                        </div>
                      </div>
                      <div className="w-full border-b border-dotted border-zinc-100" />
                    </motion.div>
                  ))
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center opacity-20">
                    <p className="text-lg font-bold">No tasks</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// --- MAIN HOME TAB ---
export function HomeTab() {
  const { state } = useAppContext()
  const [view, setView] = useState<ViewType>('Daily')
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  const sheetY = useMotionValue(0)
  const contentOpacity = useTransform(sheetY, [-300, 0], [0, 1])

  return (
    <div className="flex-1 h-screen bg-[#F5F5F5] overflow-hidden relative selection:bg-black selection:text-white text-zinc-900">
      <HomeHeading opacity={contentOpacity} />
      <HomeGraphSlider opacity={contentOpacity} />
      
      <HomeTaskModal 
        tasks={state.tasks} 
        view={view} 
        setView={setView}
        selectedDate={selectedDate} 
        setSelectedDate={setSelectedDate}
        sheetY={sheetY}
      />

      {/* Global Bottom Fade Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#F5F5F5] via-[#F5F5F5]/80 to-transparent pointer-events-none z-100 backdrop-blur-[2px]" />

      <div className="absolute top-[40%] right-[-50px] opacity-[0.015] pointer-events-none -rotate-90">
         <h1 className="text-[120px] font-black tracking-tight text-black">GARAPP</h1>
      </div>
    </div>
  )
}
