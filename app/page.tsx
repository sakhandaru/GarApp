'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '@/app/_components/Sidebar'
import { MobileNav } from '@/app/_components/MobileNav'
import { HomeTab } from '@/app/_components/HomeTab'
import { TaskList } from '@/app/_components/TaskList'
import { HabitTab } from '@/app/_components/HabitTab'
import { StreakTab } from '@/app/_components/StreakTab'
import { QuickAdd } from '@/app/_components/QuickAdd'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'tugas' | 'habit' | 'streak'>('home')
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background overflow-hidden relative">
      {/* Liquid Background Blobs */}
      <div className="liquid-bg">
        <motion.div 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="blob -top-20 -left-20 bg-primary/20" 
        />
        <motion.div 
          animate={{ 
            x: [0, -100, 0], 
            y: [0, -50, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="blob bottom-0 right-0 bg-orange-500/10" 
        />
      </div>

      {/* Sidebar - Desktop/Tablet */}
      <div className="hidden sm:flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onOpenAdd={() => setIsQuickAddOpen(true)} />
      </div>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden relative pb-24 sm:pb-0">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-orange-500/5 pointer-events-none" />
        
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'tugas' && <TaskList />}
        {activeTab === 'habit' && <HabitTab />}
        {activeTab === 'streak' && <StreakTab />}
        
        {/* Placeholder untuk tab lain */}
        {activeTab !== 'home' && activeTab !== 'tugas' && activeTab !== 'habit' && activeTab !== 'streak' && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground italic p-12 text-center">
            Halaman {activeTab} sedang dalam pembangunan...
          </div>
        )}
      </main>

      {/* Mobile Nav */}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} onOpenAdd={() => setIsQuickAddOpen(true)} />

      {/* Quick Add Overlay */}
      <QuickAdd isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
    </div>
  )
}
