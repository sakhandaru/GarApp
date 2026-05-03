'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Home, 
  Inbox, 
  RefreshCw, 
  Flame, 
  Folder, 
  Tag as TagIcon, 
  Settings,
  Plus
} from 'lucide-react'
import { cn } from '@/app/_lib/utils'

interface SidebarProps {
  activeTab: 'home' | 'tugas' | 'habit' | 'streak'
  onTabChange: (tab: 'home' | 'tugas' | 'habit' | 'streak') => void
  onOpenAdd: () => void
}

export function Sidebar({ activeTab, onTabChange, onOpenAdd }: SidebarProps) {
  const menuItems = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'tugas', label: 'Tugas', icon: Inbox },
    { id: 'habit', label: 'Habit', icon: RefreshCw },
    { id: 'streak', label: 'Streak', icon: Flame },
  ]

  return (
    <aside className="w-72 h-screen glass border-r flex flex-col p-6 gap-8 sticky top-0">
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <span className="font-black text-xl">G</span>
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none">Garapp</h1>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Premium</span>
        </div>
      </div>

      <button 
        onClick={onOpenAdd}
        className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
      >
        <Plus className="w-5 h-5" />
        Tambah Tugas
      </button>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id as any)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group",
              activeTab === item.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {activeTab === item.id && (
              <motion.div 
                layoutId="sidebar-active"
                className="absolute inset-0 bg-primary/10 rounded-xl"
              />
            )}
            <item.icon className="w-5 h-5 relative z-10" />
            <span className="font-semibold relative z-10">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Koleksi</div>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground transition-all">
          <Folder className="w-5 h-5" />
          <span className="font-semibold">Proyek</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground transition-all">
          <TagIcon className="w-5 h-5" />
          <span className="font-semibold">Tag</span>
        </button>
      </div>

      <button className="mt-auto flex items-center gap-3 px-3 py-3 text-muted-foreground hover:text-foreground transition-all">
        <Settings className="w-5 h-5" />
        <span className="font-semibold">Pengaturan</span>
      </button>
    </aside>
  )
}
