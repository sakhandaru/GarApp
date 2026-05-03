'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Flame, 
  Trophy, 
  Target, 
  Zap, 
  Award,
  ChevronRight,
  Star,
  Crown
} from 'lucide-react'
import { cn } from '../_lib/utils'

export function StreakTab() {
  const stats = [
    { label: 'Streak Saat Ini', value: '12 Hari', icon: Flame, color: 'text-orange-500' },
    { label: 'Streak Terpanjang', value: '45 Hari', icon: Trophy, color: 'text-yellow-500' },
    { label: 'Tugas Selesai', value: '128', icon: Target, color: 'text-primary' },
    { label: 'Efisiensi', value: '94%', icon: Zap, color: 'text-purple-500' },
  ]

  const badges = [
    { name: 'Early Bird', desc: 'Selesaikan tugas sebelum jam 8 pagi', icon: Star, unlocked: true },
    { name: 'Consistency King', desc: 'Pertahankan 30 hari streak', icon: Crown, unlocked: true },
    { name: 'Task Crusher', desc: 'Selesaikan 100 tugas', icon: Zap, unlocked: true },
    { name: 'Zen Master', desc: 'Selesaikan semua agenda hari ini', icon: Target, unlocked: false },
    { name: 'Weekend Warrior', desc: 'Tetap produktif di akhir pekan', icon: Award, unlocked: false },
  ]

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <header className="p-8 md:p-12 pb-6 space-y-4 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 glass-morphism rounded-full mb-4"
        >
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Profil Produktivitas</span>
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Level 14 — <span className="text-primary italic">Elite</span></h2>
        <div className="max-w-md mx-auto space-y-2">
          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              className="h-full bg-linear-to-r from-primary to-blue-400"
            />
          </div>
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <span>2,450 XP</span>
            <span>550 XP lagi untuk Level 15</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-32 space-y-12">
        {/* Key Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 rounded-ios text-center space-y-2"
            >
              <div className={cn("w-10 h-10 rounded-xl mx-auto flex items-center justify-center bg-white/5", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black tracking-tight">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Badges Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-bold tracking-tight">Koleksi Lencana</h3>
            <button className="text-primary text-sm font-bold">Semua</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {badges.map((badge, i) => (
              <motion.div 
                key={badge.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "glass p-5 rounded-ios flex items-center gap-5 transition-all",
                  !badge.unlocked && "grayscale opacity-40"
                )}
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner",
                  badge.unlocked ? "bg-primary/10 text-primary" : "bg-white/5 text-muted-foreground"
                )}>
                  <badge.icon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg leading-none mb-1">{badge.name}</h4>
                  <p className="text-xs text-muted-foreground font-medium">{badge.desc}</p>
                </div>
                {badge.unlocked ? (
                  <div className="text-[10px] font-black text-green-500 uppercase">Buka</div>
                ) : (
                  <div className="text-[10px] font-black text-muted-foreground uppercase">Terkunci</div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Milestone Chart Placeholder */}
        <section className="glass p-8 rounded-[40px] text-center space-y-6">
           <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto premium-glow">
              <Trophy className="w-10 h-10" />
           </div>
           <div className="space-y-2">
              <h3 className="text-2xl font-bold">Menuju Grandmaster</h3>
              <p className="text-muted-foreground max-w-xs mx-auto text-sm">Anda telah berada di 5% pengguna paling produktif bulan ini. Pertahankan!</p>
           </div>
           <button className="px-8 py-3 bg-white text-black font-bold rounded-full text-sm hover:scale-105 active:scale-95 transition-all">
              Lihat Ranking
           </button>
        </section>
      </div>
    </div>
  )
}
