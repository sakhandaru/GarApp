'use client'

import React from 'react'
import { 
  Home, 
  ListTodo, 
  Calendar, 
  Activity, 
  Briefcase,
  Target,
  Plus,
  Search,
  Settings,
  Cpu,
  Hash
} from 'lucide-react'
import { cn } from '../_lib/utils'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onOpenAdd: () => void
  onOpenSearch: () => void
}

export function Sidebar({ activeTab, onTabChange, onOpenAdd, onOpenSearch }: SidebarProps) {
  const menuItems = [
    { id: 'home', label: 'Terminal', icon: Home },
    { id: 'tasks', label: 'Actionable', icon: ListTodo },
    { id: 'projects', label: 'Nodes', icon: Briefcase },
    { id: 'habit', label: 'Protocol', icon: Activity },
    { id: 'calendar', label: 'Timeline', icon: Calendar },
    { id: 'focus', label: 'Core', icon: Target },
  ]

  return (
    <div className="w-[280px] h-screen bg-white border-r-2 border-black flex flex-col p-6 relative">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 bg-black flex items-center justify-center rounded-none">
          <Cpu className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-black">GARAPP</h1>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400">SYS_V2.0.4</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-4 transition-all group relative",
              activeTab === item.id 
                ? "bg-black text-white" 
                : "text-black hover:bg-black/5"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-transform",
              activeTab === item.id ? "text-white" : "text-black"
            )} />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="space-y-3 mt-auto">
        <button 
          onClick={onOpenSearch}
          className="w-full flex items-center gap-4 px-4 py-4 text-black border-2 border-black hover:bg-black hover:text-white transition-all group"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Search_Cmd+K</span>
        </button>

        <button 
          onClick={onOpenAdd}
          className="w-full bg-black text-white flex items-center justify-center gap-3 py-5 font-black uppercase tracking-[0.3em] text-[11px] hover:bg-zinc-800 transition-all active:invert"
        >
          <Plus className="w-5 h-5" />
          Quick_Entry
        </button>
      </div>
    </div>
  )
}
