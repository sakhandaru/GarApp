'use client'

import React, { useState, useMemo } from 'react'
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragStartEvent, 
  DragOverEvent, 
  DragEndEvent,
  defaultDropAnimationSideEffects,
  useDroppable
} from '@dnd-kit/core'
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Zap, 
  ChevronRight,
  Target,
  Trash2,
  Calendar,
  Terminal,
  Cpu
} from 'lucide-react'
import { useAppContext, updateTaskStatus, deleteTask } from '../_context/AppContext'
import { cn } from '../_lib/utils'
import { Task } from '../_lib/types'
import { supabase } from '../_lib/supabase'

// --- Components ---

interface SortableTaskCardProps {
  task: Task
  isOverlay?: boolean
}

function SortableTaskCard({ task, isOverlay }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: task.id, 
    data: { type: 'Task', task } 
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  const content = (
    <div 
      className={cn(
        "bg-white p-6 rounded-none border-2 border-black cursor-grab active:cursor-grabbing group hover:bg-black hover:text-white transition-all relative overflow-hidden",
        isDragging && !isOverlay && "opacity-10",
        isOverlay && "rotate-2 scale-105 border-black shadow-2xl z-50 bg-white"
      )}
    >
      <div className="absolute top-0 left-0 w-[4px] h-0 group-hover:h-full bg-white transition-all duration-300" />
      
      <div className="flex justify-between items-start mb-4">
        <span className={cn(
          "text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 border-2 border-black group-hover:border-white",
          task.prioritas === 'high' ? "bg-black text-white group-hover:bg-white group-hover:text-black" : "text-black group-hover:text-white"
        )}>
          {task.prioritas}_PRIO
        </span>
      </div>
      <h4 className={cn("font-black text-lg leading-tight mb-6 tracking-tighter uppercase", task.isSelesai && "line-through opacity-40")}>
        {task.judul}
      </h4>
      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em] opacity-40 group-hover:opacity-60">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5" />
          <span>NODE_{task.id.slice(0, 8)}</span>
        </div>
      </div>
    </div>
  )

  if (isOverlay) return content

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {content}
    </div>
  )
}

interface KanbanColumnProps {
  id: string
  label: string
  icon: any
  color: string
  tasks: Task[]
  onAddClick: () => void
}

function KanbanColumn({ id, label, icon: Icon, color, tasks, onAddClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: { type: 'Column' }
  })

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "min-w-[320px] w-[320px] flex flex-col h-full bg-white border-2 border-black p-1 transition-all",
        isOver && "bg-black/5"
      )}
    >
      <div className="flex items-center justify-between mb-8 px-5 pt-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black rounded-none">
            <Icon className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-black uppercase tracking-[0.4em] text-[11px] text-black">{label}</h3>
          <span className="text-[11px] font-black text-black/30">[{tasks.length.toString().padStart(2, '0')}]</span>
        </div>
        <button onClick={onAddClick} className="p-1 text-black hover:scale-125 transition-transform">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar pb-20 space-y-4 min-h-[200px]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-black/10 text-black/10">
             <Icon className="w-10 h-10 mb-4" />
             <p className="text-[10px] font-black uppercase tracking-[0.5em]">Empty_Node</p>
          </div>
        )}

        <button 
          onClick={onAddClick}
          className="w-full py-5 border-2 border-dashed border-black text-black text-[11px] font-black uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all"
        >
          + Init_Data
        </button>
      </div>
    </div>
  )
}

// --- Main View ---

export function KanbanView() {
  const { state, dispatch } = useAppContext()
  const { tasks, projects, activeProjectId } = state

  const project = projects.find(p => p.id === activeProjectId)
  
  const projectTasks = useMemo(() => {
    return tasks.filter(t => t.parentTaskId === activeProjectId)
  }, [tasks, activeProjectId])

  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [addingToCol, setAddingToCol] = useState<string | null>(null)
  const [newSubtask, setNewSubtask] = useState('')

  const columns = [
    { id: 'backlog', label: 'Backlog', icon: Layers, color: 'text-black' },
    { id: 'ready', label: 'Ready', icon: Zap, color: 'text-black' },
    { id: 'progress', label: 'Process', icon: Clock, color: 'text-black' },
    { id: 'selesai', label: 'Stable', icon: CheckCircle2, color: 'text-black' },
  ] as const

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveTask(active.data.current?.task)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return
    const overData = over.data.current
    const activeData = active.data.current
    if (!activeData || activeData.type !== 'Task') return
    const activeTaskObj = activeData.task as Task
    
    let targetStatus = activeTaskObj.status
    if (overData?.type === 'Column') {
      targetStatus = over.id as any
    } else if (overData?.type === 'Task') {
      targetStatus = overData.task.status
    }

    if (targetStatus !== activeTaskObj.status) {
      dispatch({ 
        type: 'UPDATE_TASK', 
        payload: { ...activeTaskObj, status: targetStatus, isSelesai: targetStatus === 'selesai' } 
      })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return
    const task = active.data.current?.task
    if (!task) return
    updateTaskStatus(dispatch, task.id, task.status)
  }

  const handleAddSubtask = async (status: string) => {
    if (!newSubtask.trim()) return
    const { data, error } = await supabase.from('tasks').insert({
      judul: newSubtask.trim(),
      parent_task_id: activeProjectId,
      status: status,
      is_selesai: status === 'selesai',
    }).select().single()

    if (!error && data) {
      const newTask: Task = { 
        id: data.id, judul: data.judul, isSelesai: data.is_selesai, status: data.status,
        parentTaskId: data.parent_task_id, prioritas: 'low', tanggal: data.tanggal, dibuatPada: data.dibuat_pada, isRecurring: false 
      }
      dispatch({ type: 'ADD_TASK', payload: newTask })
      setNewSubtask('')
      setAddingToCol(null)
    }
  }

  const completionRate = Math.round((projectTasks.filter(t => t.isSelesai).length / (projectTasks.length || 1)) * 100)

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white relative">
      <header className="p-8 md:p-12 flex items-center justify-between border-b-4 border-black bg-white z-20">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => { dispatch({ type: 'SET_ACTIVE_TAB', payload: 'projects' }); dispatch({ type: 'SET_ACTIVE_PROJECT', payload: null }); }}
            className="w-12 h-12 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-all group"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex items-center gap-6">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-black">
              {project?.nama || 'Project'}_NODE
            </h2>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 mb-3">System_Output</span>
           <div className="flex items-center gap-6">
              <div className="w-64 h-2 bg-black/5 relative overflow-hidden border border-black/10">
                 <motion.div animate={{ width: `${completionRate}%` }} className="absolute h-full bg-black" />
              </div>
              <span className="text-3xl font-black text-black">{completionRate.toString().padStart(3, '0')}%</span>
           </div>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto p-8 md:p-12 flex gap-10 custom-scrollbar">
          {columns.map(col => (
            <KanbanColumn 
              key={col.id}
              id={col.id}
              label={col.label}
              icon={col.icon}
              color={col.color}
              tasks={projectTasks.filter(t => t.status === col.id)}
              onAddClick={() => setAddingToCol(col.id)}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeTask ? <SortableTaskCard task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      <AnimatePresence>
        {addingToCol && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="w-full max-w-xl bg-white p-12 border-4 border-black relative"
            >
              <h3 className="text-3xl font-black mb-12 flex items-center gap-4 uppercase tracking-tighter">
                <Plus className="text-black w-8 h-8" /> Add_Project_Node
              </h3>
              
              <input 
                autoFocus
                placeholder="Protocol_Label..."
                className="w-full bg-white p-8 rounded-none outline-none text-2xl font-black mb-12 border-2 border-black focus:bg-black focus:text-white transition-all placeholder:text-black/20 uppercase"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask(addingToCol)}
              />
              
              <div className="flex justify-end gap-10">
                <button onClick={() => setAddingToCol(null)} className="font-black uppercase tracking-[0.4em] text-[12px] text-black/40 hover:text-black underline underline-offset-4">Abort</button>
                <button onClick={() => handleAddSubtask(addingToCol)} className="px-12 py-5 bg-black text-white font-black uppercase tracking-[0.4em] text-[12px] hover:bg-zinc-800 transition-all shadow-[10px_10px_0_rgba(0,0,0,0.1)]">Commit_Entry</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
