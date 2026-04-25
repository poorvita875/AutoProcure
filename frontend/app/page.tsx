"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, Hexagon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TubesBackground from '@/components/TubesBackground';

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState<'landing' | 'login' | 'signup'>('landing');

  const handleNavigateToDashboard = () => {
    router.push("/dashboard");
  };

  // --- UI Layouts ---

  return (
    <TubesBackground 
      className="w-full h-screen overflow-hidden bg-[#020818] flex items-center justify-center"
      colors={["#63b3ed", "#9f7aea", "#4fd1c5"]}
      lightColors={["#63b3ed", "#9f7aea", "#4fd1c5", "#f687b3"]}
    >
      {/* Content Overlay */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          
          {/* LANDING STATE */}
          {view === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="text-center flex flex-col items-center pointer-events-none"
            >
              <motion.div
                className="relative mb-14 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              >
                {/* Rotating Outer Ring */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute w-32 h-32 border border-dashed border-blue-500/20 rounded-full"
                />

                {/* Subtle Pulse Waves */}
                <motion.div 
                  animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
                  className="absolute w-20 h-20 border border-blue-400/40 rounded-full"
                />
                
                {/* Floating Core */}
                <motion.div
                  animate={{ 
                    y: [0, -12, 0],
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{ 
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 10, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="w-22 h-22 rounded-[2rem] bg-gradient-to-br from-white/10 via-blue-500/5 to-purple-500/10 border border-white/20 flex items-center justify-center backdrop-blur-2xl shadow-[0_0_60px_rgba(59,130,246,0.25)] relative z-10"
                >
                  {/* Internal Glow Flare */}
                  <div className="absolute inset-4 rounded-full bg-blue-400/10 blur-2xl animate-pulse"></div>
                  
                  <Hexagon className="text-white w-10 h-10 filter drop-shadow-[0_0_15px_rgba(96,165,250,1)] relative z-20" />
                </motion.div>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-5xl md:text-7xl mb-8 flex flex-col md:flex-row items-center gap-0 md:gap-4"
              >
                <span className="font-[family-name:var(--font-syncopate)] font-light tracking-[0.4em] bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
                  SUPPLY
                </span>
                <span className="font-[family-name:var(--font-outfit)] font-black tracking-tighter bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(59,130,246,0.4)]">
                  MIND
                </span>
              </motion.h1>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="flex items-center gap-8 mb-12"
              >
                <div className="h-px w-8 bg-blue-500/20"></div>
                <p className="text-blue-300/40 text-[9px] md:text-xs tracking-[0.8em] uppercase font-bold font-[family-name:var(--font-outfit)]">
                  Autonomous Procurement Intelligence
                </p>
                <div className="h-px w-8 bg-blue-500/20"></div>
              </motion.div>
              
              <div className="flex flex-col sm:flex-row gap-4 pointer-events-auto">
                <button 
                  onClick={(e) => { e.stopPropagation(); setView('signup'); }}
                  className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all flex items-center gap-2 group"
                >
                  GET STARTED <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setView('login'); }}
                  className="px-10 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold transition-all"
                >
                  LOG IN
                </button>
              </div>
            </motion.div>
          )}

          {/* LOGIN/SIGNUP CARD */}
          {(view === 'login' || view === 'signup') && (
            <motion.div 
              key="auth-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md p-8 rounded-[2rem] bg-slate-950/80 backdrop-blur-2xl border border-white/10 shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setView('landing')} 
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Home
              </button>

              <h2 className="text-3xl font-bold text-white mb-2">
                {view === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-slate-400 text-sm mb-8">
                {view === 'login' ? 'Sign in to manage your procurement pipeline.' : 'Join the fleet of autonomous supply chains.'}
              </p>

              <div className="space-y-4">
                {view === 'signup' && (
                  <input type="text" placeholder="Full Name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                )}
                <input type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                <input type="password" placeholder="Password" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 transition-colors" />
              </div>

              <button 
                onClick={handleNavigateToDashboard}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold mt-8 transition-all flex items-center justify-center gap-2"
              >
                {view === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'} <ArrowRight className="w-4 h-4" />
              </button>
              
              <div className="mt-6 text-center text-sm">
                <span className="text-slate-500">
                  {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button 
                  onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                  className="text-blue-400 font-semibold hover:underline"
                >
                  {view === 'login' ? 'Sign up' : 'Log in'}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </TubesBackground>
  );
}