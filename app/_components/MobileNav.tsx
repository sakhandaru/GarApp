'use client'

import React from 'react'
import { 
  Home, 
  ListTodo, 
  Briefcase, 
  Activity, 
  Plus,
  Search,
  Cpu
} from 'lucide-react'
import { cn } from '../_lib/utils'

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onOpenAdd: () => void
  onOpenSearch: () => void
}

export function MobileNav({ activeTab, onTabChange, onOpenAdd, onOpenSearch }: MobileNavProps) {
  const items = [
    { id: 'home', icon: Home },
    { id: 'tasks', icon: ListTodo },
    { id: 'projects', icon: Briefcase },
    { id: 'habit', icon: Activity },
  ]

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[100] flex items-center justify-between pointer-events-none sm:hidden">
      {/* Menu Bar */}
      <div className="bg-black/90 backdrop-blur-xl p-2 rounded-full border border-white/20 flex items-center gap-1 pointer-events-auto shadow-2xl">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all",
              activeTab === item.id ? "bg-white text-black" : "text-white/40 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      {/* Add Button */}
      <button
        onClick={onOpenAdd}
        className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white border-2 border-black shadow-2xl pointer-events-auto active:scale-90 transition-transform"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  )
}
