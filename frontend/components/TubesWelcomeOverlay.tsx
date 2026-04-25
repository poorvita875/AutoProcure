"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TubesBackground from '@/components/TubesBackground';
import { ArrowRight, X } from 'lucide-react';

/**
 * Example: Tubes Background as an Overlay Modal
 * 
 * This demonstrates how to use TubesBackground as a welcome overlay
 * that can be dismissed to show content beneath it.
 * 
 * Usage: Import and use in any page where you want a dramatic entrance
 */

interface WelcomeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export function TubesWelcomeOverlay({
  isOpen,
  onClose,
  title,
  description,
  actionLabel,
  onAction
}: WelcomeOverlayProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
    >
      <TubesBackground 
        className="w-full h-screen"
        colors={["#f967fb", "#53bc28", "#6958d5"]}
        lightColors={["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"]}
      >
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4">
          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={onClose}
            className="absolute top-8 right-8 p-2 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </motion.button>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl"
          >
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 drop-shadow-lg">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-12">
              {description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAction}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full font-bold flex items-center gap-2 transition-all"
              >
                {actionLabel} <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full font-bold transition-all"
              >
                Maybe Later
              </motion.button>
            </div>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute bottom-12 text-white/40 text-sm"
          >
            ✨ Click anywhere to interact with the background ✨
          </motion.div>
        </div>
      </TubesBackground>
    </motion.div>
  );
}

/**
 * Example Page using the Welcome Overlay
 */
export default function ExamplePageWithOverlay() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <div className="w-full h-screen bg-slate-950">
      {/* Your page content would go here */}
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Main Page Content</h1>
          <p className="text-white/60">The welcome overlay should appear on top</p>
          <button
            onClick={() => setShowWelcome(true)}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Show Welcome
          </button>
        </div>
      </div>

      {/* Welcome Overlay */}
      <TubesWelcomeOverlay
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        title="Welcome!"
        description="Experience the power of AI-driven procurement with our advanced automation platform."
        actionLabel="Get Started"
        onAction={() => {
          setShowWelcome(false);
          // Navigate or perform action
        }}
      />
    </div>
  );
}
