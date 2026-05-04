'use client'

import React from 'react'
import { 
  Home, 
  Activity, 
  Briefcase, 
  Calendar,
  Search,
  Plus
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../_lib/utils'

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onOpenAdd: () => void
  onOpenSearch: () => void
}

export function MobileNav({ activeTab, onTabChange, onOpenAdd, onOpenSearch }: MobileNavProps) {
  const items = [
    { id: 'home', icon: Home, label: 'Terminal' },
    { id: 'habit', icon: Activity, label: 'Protocol' },
    { id: 'projects', icon: Briefcase, label: 'Nodes' },
    { id: 'calendar', icon: Calendar, label: 'Timeline' },
  ]

  return (
    <div className="fixed bottom-10 left-0 right-0 z-[120] flex justify-center px-6 sm:hidden pointer-events-none">
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Liquid Glass Nav Bar */}
        <nav className="bg-white/40 backdrop-blur-[40px] border border-white/60 shadow-[0_15px_50px_rgba(0,0,0,0.06),inset_0_0_20px_rgba(255,255,255,0.2)] rounded-[32px] px-2 py-2 flex items-center gap-1.5 transition-all">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="relative p-3 rounded-full transition-all active:scale-90"
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/60 shadow-inner rounded-full"
                  transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                />
              )}
              <item.icon className={cn(
                "w-6 h-6 relative z-10 transition-all duration-300",
                activeTab === item.id ? "text-zinc-950 scale-110" : "text-zinc-400"
              )} />
            </button>
          ))}
          
          <div className="w-px h-6 bg-white/30 mx-1" />

          <button
            onClick={onOpenSearch}
            className="p-3 rounded-full text-zinc-400 active:scale-90 transition-all hover:text-zinc-600"
          >
            <Search className="w-6 h-6" />
          </button>
        </nav>

        {/* Liquid Glass Add Button */}
        <button
          onClick={onOpenAdd}
          className="w-14 h-14 bg-zinc-900/90 backdrop-blur-xl text-white rounded-full flex items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.2),inset_0_0_10px_rgba(255,255,255,0.1)] active:scale-90 active:rotate-90 transition-all duration-300 border border-white/10"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>
    </div>
  )
}
