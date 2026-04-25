"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import TubesBackground from '@/components/TubesBackground';

/**
 * Example Splash/Intro Page
 * Demonstrates TubesBackground usage with auto-navigation
 * 
 * To use this:
 * 1. Create folder: /app/intro/
 * 2. Copy this file there as page.tsx
 * 3. Navigate to: http://localhost:3000/intro
 */

export default function IntroPage() {
  const router = useRouter();

  // Auto-navigate after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <TubesBackground 
      className="w-full h-screen"
      colors={["#00ff88", "#0fffff", "#00d4ff"]}
      lightColors={["#00ff88", "#0fffff", "#00d4ff", "#64ffda"]}
    >
      <div className="flex flex-col items-center justify-center h-full gap-8 px-4">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-7xl md:text-9xl font-black text-white mb-4 drop-shadow-lg">
            AUTOPROCURE
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-2">
            Autonomous Procurement AI
          </p>
          <p className="text-sm text-white/60">
            Intelligent supply chain management powered by AI
          </p>
        </motion.div>

        {/* Loading Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex gap-2 mt-4"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ 
                duration: 1.5, 
                delay: i * 0.15,
                repeat: Infinity 
              }}
              className="w-3 h-3 rounded-full bg-cyan-400"
            />
          ))}
        </motion.div>

        {/* Skip Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          onClick={() => router.push('/dashboard')}
          className="mt-8 px-6 py-2 text-white/60 hover:text-white border border-white/20 rounded-full text-sm transition-colors"
        >
          Skip →
        </motion.button>
      </div>
    </TubesBackground>
  );
}
