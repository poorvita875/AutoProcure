"use client";

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface TubesBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  colors?: string[];
  lightColors?: string[];
  enableClickInteraction?: boolean;
  onClick?: () => void;
}

/**
 * TubesBackground - Interactive 3D neon tube background
 * Features:
 * - 🖱️ Cursor-following 3D tubes
 * - 🎨 Dynamic color randomization on click
 * - ⚡ High-performance WebGL rendering
 * - 📱 Responsive design
 */
export const TubesBackground = React.forwardRef<
  HTMLCanvasElement,
  TubesBackgroundProps
>(({
  children,
  className,
  colors = ["#63b3ed", "#9f7aea", "#4fd1c5"],
  lightColors = ["#63b3ed", "#9f7aea", "#4fd1c5", "#f687b3"],
  enableClickInteraction = true,
  onClick
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tubesRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper for random colors
  const randomColors = (count: number) => {
    return new Array(count)
      .fill(0)
      .map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
  };

  // Initialize 3D tubes background
  useEffect(() => {
    let mounted = true;

    const initTubes = async () => {
      if (!canvasRef.current) return;

      try {
        // Dynamic import of threejs-components library (ignore webpack to fetch from CDN at runtime)
        const module = await import(
          /* webpackIgnore: true */
          'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js'
        );
        const TubesCursor = module.default;

        if (!mounted) return;

        // Initialize the tubes with custom colors
        const app = TubesCursor(canvasRef.current, {
          tubes: {
            colors,
            lights: {
              intensity: 200,
              colors: lightColors
            }
          }
        });

        tubesRef.current = app;
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load TubesBackground:", error);
      }
    };

    initTubes();

    return () => {
      mounted = false;
    };
  }, [colors, lightColors]);

  const handleClick = (e: React.MouseEvent) => {
    if (enableClickInteraction && tubesRef.current) {
      tubesRef.current.tubes.setColors(randomColors(3));
      tubesRef.current.tubes.setLightsColors(randomColors(4));
    }
    onClick?.();
  };

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden",
        className
      )}
      onClick={handleClick}
    >
      {/* Canvas Layer - 3D Rendering */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block touch-none"
      />

      {/* Gradient Overlay - Visual Polish */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020818]/60 pointer-events-none" />

      {/* Content Overlay */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        {children}
      </div>
    </div>
  );
});

TubesBackground.displayName = 'TubesBackground';

export default TubesBackground;
