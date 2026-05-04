'use client'

import React, { useState } from 'react'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { id } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import { useAppContext, toggleTask, updateTask } from '../_context/AppContext'
import { cn } from '../_lib/utils'
import { motion } from 'framer-motion'
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react'

const locales = {
  'id': id,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

const DnDCalendar = withDragAndDrop(Calendar)

// Custom Event Component
const CustomEvent = ({ event }: any) => {
  const task = event.resource
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="flex flex-col h-full group"
    >
      <div className="flex items-center gap-1.5 mb-1">
        <div className={cn(
          "w-1.5 h-1.5 rounded-full",
          task.isSelesai ? "bg-white/50" : "bg-white shadow-[0_0_8px_white]"
        )} />
        <span className={cn(
          "text-[10px] font-black uppercase tracking-tighter truncate",
          task.isSelesai && "line-through opacity-50"
        )}>
          {task.judul}
        </span>
      </div>
      {task.waktu && (
        <div className="flex items-center gap-1 text-[8px] opacity-60 font-bold">
          <Clock className="w-2 h-2" />
          {task.waktu.slice(0, 5)}
        </div>
      )}
    </motion.div>
  )
}

// Custom Toolbar
const CustomToolbar = (toolbar: any) => {
  const goToBack = () => toolbar.onNavigate('PREV')
  const goToNext = () => toolbar.onNavigate('NEXT')
  const goToToday = () => toolbar.onNavigate('TODAY')

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-3xl font-black tracking-tighter">Kalender Tugas</h2>
        <p className="text-zinc-500 font-bold">{format(toolbar.date, 'MMMM yyyy', { locale: id })}</p>
      </div>
      <div className="flex items-center gap-2 glass p-1.5 rounded-2xl">
        <button onClick={goToBack} className="p-2 hover:bg-white/10 rounded-xl transition-all"><ChevronLeft className="w-5 h-5" /></button>
        <button onClick={goToToday} className="px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-white/10 rounded-xl transition-all">Hari Ini</button>
        <button onClick={goToNext} className="p-2 hover:bg-white/10 rounded-xl transition-all"><ChevronRight className="w-5 h-5" /></button>
      </div>
      <div className="flex items-center gap-1 glass p-1 rounded-2xl">
        {['month', 'week', 'day'].map((view) => (
          <button
            key={view}
            onClick={() => toolbar.onView(view)}
            className={cn(
              "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
              toolbar.view === view ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-white/5 text-zinc-500"
            )}
          >
            {view === 'month' ? 'Bulan' : view === 'week' ? 'Minggu' : 'Hari'}
          </button>
        ))}
      </div>
    </div>
  )
}

export function CalendarTab() {
  const { state, dispatch } = useAppContext()
  const { tasks, projects } = state
  const [view, setView] = useState(Views.WEEK)

  const events = tasks.map(task => {
    const start = new Date(task.tanggal)
    if (task.waktu) {
      const [h, m] = task.waktu.split(':')
      start.setHours(parseInt(h), parseInt(m))
    }
    const end = new Date(start)
    end.setHours(end.getHours() + 1)

    return {
      id: task.id,
      title: task.judul,
      start,
      end,
      resource: task
    }
  })

  const eventStyleGetter = (event: any) => {
    const task = event.resource
    const project = projects.find(p => p.id === task.proyekId)
    const color = project ? project.warna : '#3f3f46'
    
    return {
      style: {
        backgroundColor: task.isSelesai ? 'rgba(255,255,255,0.05)' : color,
        borderRadius: '14px',
        border: 'none',
        padding: '6px',
        boxShadow: task.isSelesai ? 'none' : `0 8px 20px -4px ${color}40`,
        opacity: task.isSelesai ? 0.3 : 1,
      }
    }
  }

  const handleSelectEvent = (event: any) => {
    const task = event.resource
    toggleTask(dispatch, task.id, task.isSelesai, task)
  }

  const onEventDrop = ({ event, start, end }: any) => {
    const task = event.resource
    const newTanggal = format(start as Date, 'yyyy-MM-dd')
    const newWaktu = format(start as Date, 'HH:mm:ss')
    
    // Optimistic Update
    dispatch({ 
      type: 'UPDATE_TASK', 
      payload: { ...task, tanggal: newTanggal, waktu: newWaktu } 
    })

    updateTask(dispatch, task.id, {
      tanggal: newTanggal,
      waktu: newWaktu
    })
  }

  return (
    <div className="flex-1 p-10 h-screen flex flex-col bg-[#050505]">
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor={(e: any) => e.start}
        endAccessor={(e: any) => e.end}
        view={view}
        onView={(v: any) => setView(v)}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
        onEventDrop={onEventDrop}
        resizable={false}
        draggableAccessor={() => true}
        components={{
          event: CustomEvent,
          toolbar: CustomToolbar,
        }}
        culture="id"
        className="premium-calendar-v2"
      />

      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit !important;
        }
        .rbc-month-view, .rbc-time-view {
          border: none !important;
          background: rgba(255,255,255,0.02) !important;
          border-radius: 40px !important;
          padding: 10px !important;
          border: 1px solid rgba(255,255,255,0.05) !important;
        }
        .rbc-header {
          border-bottom: none !important;
          padding: 20px 10px !important;
          font-[900] !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          font-size: 11px !important;
          color: #52525b !important;
        }
        .rbc-time-header-content {
          border-left: none !important;
        }
        .rbc-time-content {
          border-top: none !important;
        }
        .rbc-day-bg + .rbc-day-bg {
          border-left: 1px solid rgba(255,255,255,0.03) !important;
        }
        .rbc-timeslot-group {
          border-bottom: 1px solid rgba(255,255,255,0.02) !important;
          min-height: 80px !important;
        }
        .rbc-time-slot {
          font-[900] !important;
          color: #27272a !important;
          font-size: 10px !important;
        }
        .rbc-current-time-indicator {
          background-color: #007AFF !important;
          height: 2px !important;
        }
        .rbc-addons-dnd-drag-preview {
          background: var(--primary) !important;
          border-radius: 14px !important;
          opacity: 0.9 !important;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5) !important;
          transform: rotate(3deg) scale(1.05) !important;
          transition: transform 0.1s ease-out !important;
          z-index: 100 !important;
        }
        .rbc-addons-dnd-dragged-event {
          opacity: 0.2 !important;
        }
        .rbc-event {
          padding: 0 !important;
          margin: 2px !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          border: none !important;
        }
        .rbc-event:hover {
          z-index: 10 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3) !important;
        }
        /* ... rest of existing styles ... */
      `}</style>
    </div>
  )
}
