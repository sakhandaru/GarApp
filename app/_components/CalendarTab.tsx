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
import { Clock, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

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

const CustomEvent = ({ event }: any) => {
  const task = event.resource
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="flex flex-col h-full group p-2"
    >
      <div className="flex items-center gap-1.5 mb-1 overflow-hidden">
        <div className={cn(
          "w-1.5 h-1.5 rounded-full flex-shrink-0",
          task.isSelesai ? "bg-zinc-200" : "bg-white shadow-[0_0_8px_white]"
        )} />
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-tighter truncate leading-none",
          task.isSelesai ? "line-through text-zinc-400" : "text-white"
        )}>
          {task.judul}
        </span>
      </div>
      {task.waktu && (
        <div className={cn(
          "flex items-center gap-1 text-[9px] font-bold",
          task.isSelesai ? "text-zinc-300" : "text-white/60"
        )}>
          <Clock className="w-2.5 h-2.5" />
          {task.waktu.slice(0, 5)}
        </div>
      )}
    </motion.div>
  )
}

const CustomToolbar = (toolbar: any) => {
  const goToBack = () => toolbar.onNavigate('PREV')
  const goToNext = () => toolbar.onNavigate('NEXT')
  const goToToday = () => toolbar.onNavigate('TODAY')

  return (
    <div className="flex flex-col mb-8 gap-6">
      {/* Home Style Heading */}
      <div className="flex justify-between items-start">
        <div className="tracking-tighter">
          <h1 className="text-[40px] font-bold leading-[0.95] text-zinc-900">
            Timeline<br />Nodes
          </h1>
        </div>
        <div className="text-right tracking-tighter">
          <p className="text-[40px] font-bold text-zinc-400 leading-[0.95]">
            {format(toolbar.date, 'MM')}
          </p>
          <p className="text-[40px] font-bold text-zinc-400 leading-[0.95]">
            {format(toolbar.date, 'yyyy')}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-zinc-100 shadow-sm">
          <button onClick={goToBack} className="p-2.5 hover:bg-zinc-50 rounded-full transition-all text-zinc-400 active:scale-90"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={goToToday} className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:bg-zinc-50 rounded-full transition-all text-zinc-900">Today</button>
          <button onClick={goToNext} className="p-2.5 hover:bg-zinc-50 rounded-full transition-all text-zinc-400 active:scale-90"><ChevronRight className="w-5 h-5" /></button>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-zinc-100 shadow-sm">
          {['month', 'week', 'day'].map((view) => (
            <button
              key={view}
              onClick={() => toolbar.onView(view)}
              className={cn(
                "px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all",
                toolbar.view === view ? "bg-zinc-900 text-white shadow-md" : "hover:bg-zinc-50 text-zinc-400"
              )}
            >
              {view === 'month' ? 'Month' : view === 'week' ? 'Week' : 'Day'}
            </button>
          ))}
        </div>
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
    const color = project ? project.warna : '#007AFF'
    
    return {
      style: {
        backgroundColor: task.isSelesai ? '#F4F4F5' : color,
        borderRadius: '16px',
        border: 'none',
        padding: '0px',
        boxShadow: task.isSelesai ? 'none' : `0 4px 12px -2px ${color}30`,
        opacity: 1,
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
    <div className="flex-1 flex flex-col bg-[#F5F5F5] overflow-y-auto no-scrollbar pb-32 pt-16 px-6">
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
        className="premium-calendar-v3"
      />

      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit !important;
          flex: 1;
        }
        .rbc-month-view, .rbc-time-view {
          border: none !important;
          background: white !important;
          border-radius: 28px !important;
          padding: 10px !important;
          border: 1px solid #F4F4F5 !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.02) !important;
        }
        .rbc-header {
          border-bottom: 1px solid #F4F4F5 !important;
          padding: 15px 10px !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.15em !important;
          font-size: 10px !important;
          color: #A1A1AA !important;
        }
        .rbc-time-header-content {
          border-left: none !important;
        }
        .rbc-time-content {
          border-top: none !important;
        }
        .rbc-day-bg + .rbc-day-bg, .rbc-month-row + .rbc-month-row {
          border-left: 1px solid #F4F4F5 !important;
        }
        .rbc-month-row + .rbc-month-row {
          border-top: 1px solid #F4F4F5 !important;
        }
        .rbc-timeslot-group {
          border-bottom: 1px solid #F4F4F5 !important;
          min-height: 80px !important;
        }
        .rbc-time-slot {
          font-weight: 800 !important;
          color: #D4D4D8 !important;
          font-size: 10px !important;
        }
        .rbc-current-time-indicator {
          background-color: #007AFF !important;
          height: 2px !important;
        }
        .rbc-event {
          padding: 0 !important;
          margin: 2px !important;
          border: none !important;
          overflow: hidden !important;
        }
        .rbc-today {
          background-color: #FAFAFA !important;
        }
        .rbc-off-range-bg {
          background-color: #F8F8F8 !important;
        }
      `}</style>
    </div>
  )
}
