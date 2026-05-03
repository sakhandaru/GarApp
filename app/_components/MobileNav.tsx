'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Home, Inbox, RefreshCw, Plus } from 'lucide-react'
import { cn } from '@/app/_lib/utils'

interface MobileNavProps {
  activeTab: 'home' | 'tugas' | 'habit' | 'streak'
  onTabChange: (tab: 'home' | 'tugas' | 'habit' | 'streak') => void
  onOpenAdd: () => void
}

export function MobileNav({ activeTab, onTabChange, onOpenAdd }: MobileNavProps) {
  return (
    <div className="md:hidden fixed bottom-10 left-0 right-0 px-8 z-50 flex items-center justify-center">
      <motion.nav 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-zinc-950/90 backdrop-blur-xl rounded-full h-14 flex items-center px-1.5 shadow-2xl border border-white/5"
      >
        <NavButton 
          active={activeTab === 'home'} 
          onClick={() => onTabChange('home')}
          icon={Home}
        />
        <NavButton 
          active={activeTab === 'tugas'} 
          onClick={() => onTabChange('tugas')}
          icon={Inbox}
        />
        <NavButton 
          active={activeTab === 'habit'} 
          onClick={() => onTabChange('habit')}
          icon={RefreshCw}
        />

        <div className="w-px h-6 bg-white/10 mx-1" />

        <button 
          onClick={onOpenAdd}
          className="w-11 h-11 bg-primary/20 rounded-full flex items-center justify-center text-primary active:scale-95 transition-all mx-1"
        >
          <Plus className="w-6 h-6 stroke-[3px]" />
        </button>
      </motion.nav>
    </div>
  )
}

function NavButton({ active, onClick, icon: Icon }: any) {
  return (
    <button 
      onClick={onClick}
      className="relative w-14 h-11 flex items-center justify-center transition-all duration-300"
    >
      {active && (
        <motion.div 
          layoutId="mobile-nav-bg"
          className="absolute inset-0 bg-zinc-800 rounded-full mx-1"
          transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
        />
      )}
      <Icon className={cn(
        "w-5 h-5 transition-all relative z-10", 
        active ? "text-white" : "text-zinc-500"
      )} />
    </button>
  )
}
