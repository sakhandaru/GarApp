'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppContext } from './_context/AppContext'
import { Sidebar } from './_components/Sidebar'
import { MobileNav } from './_components/MobileNav'
import { HomeTab } from './_components/HomeTab'
import { TaskList } from './_components/TaskList'
import { QuickAdd } from './_components/QuickAdd'
import { FocusTab } from './_components/FocusTab'
import { CalendarTab } from './_components/CalendarTab'
import { HabitTab } from './_components/HabitTab'
import { ProjectsTab } from './_components/ProjectsTab'
import { KanbanView } from './_components/KanbanView'
import { SearchOverlay } from './_components/SearchOverlay'
import { cn } from './_lib/utils'

export default function Page() {
  const { state, dispatch } = useAppContext()
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const activeTab = state.activeTab
  const setActiveTab = (tab: string) => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab })
  const isFocusMode = activeTab === 'focus'
  const isKanbanMode = activeTab === 'kanban'

  const renderContent = () => {
    if (activeTab === 'home') return <HomeTab />
    if (activeTab === 'projects') return <ProjectsTab onOpenAdd={() => setIsQuickAddOpen(true)} />
    if (activeTab === 'kanban') return <KanbanView />
    if (activeTab === 'focus') return <FocusTab />
    if (activeTab === 'calendar') return <CalendarTab />
    if (activeTab === 'habit') return <HabitTab />
    
    return <TaskList />
  }

  return (
    <div className="flex min-h-screen bg-white overflow-hidden relative selection:bg-black selection:text-white">
      <div className="scanline" />

      {/* Desktop Sidebar */}
      {!isFocusMode && !isKanbanMode && (
        <div className="hidden sm:flex z-10">
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            onOpenAdd={() => setIsQuickAddOpen(true)} 
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden relative z-10"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Navigation */}
      {/* Mobile Navigation */}
      {!isFocusMode && !isKanbanMode && (
        <MobileNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onOpenAdd={() => setIsQuickAddOpen(true)} 
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      )}

      <QuickAdd 
        isOpen={isQuickAddOpen} 
        onClose={() => setIsQuickAddOpen(false)} 
      />

      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </div>
  )
}
