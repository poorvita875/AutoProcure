'use client';
import { cn } from '@/lib/utils';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Store the animation frame ID in a ref so cleanup always sees the latest value
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const SEPARATION = 100;
    const AMOUNTX = 50;
    const AMOUNTY = 50;

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();

    const w = window.innerWidth;
    const h = window.innerHeight;

    const camera = new THREE.PerspectiveCamera(75, w / h, 1, 10000);
    // Tilted angle — we can see the wave ripple across the surface
    camera.position.set(0, 500, 900);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ── Particles ──────────────────────────────────────────────────────────
    const positions: number[] = [];
    const colors: number[] = [];

    // #63b3ed (site blue)
    const blue  = [99 / 255, 179 / 255, 237 / 255];
    // #e2e8f0 (soft white)
    const white = [226 / 255, 232 / 255, 240 / 255];
    // #818cf8 (indigo accent)
    const indigo = [129 / 255, 140 / 255, 248 / 255];

    const palette = [blue, white, indigo];

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
        positions.push(x, 0, z);                      // y=0 initially; animated each frame
        const col = palette[(ix + iy) % palette.length];
        colors.push(...col);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color',    new THREE.Float32BufferAttribute(colors,    3));

    const material = new THREE.PointsMaterial({
      size: 5,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // ── Animation loop ─────────────────────────────────────────────────────
    let count = 0;

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);   // always up-to-date

      const posAttr = geometry.attributes.position;
      const arr = posAttr.array as Float32Array;

      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          // Wave height: two sine waves combine for an organic ripple
          arr[i * 3 + 1] =
            Math.sin((ix + count) * 0.3) * 80 +
            Math.sin((iy + count) * 0.5) * 80;
          i++;
        }
      }

      posAttr.needsUpdate = true;
      renderer.render(scene, camera);
      count += 0.025;
    };

    animate();

    // ── Resize ────────────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // ── Cleanup ────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafRef.current);             // always cancels the latest frame
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('pointer-events-none absolute inset-0 z-[1]', className)}
      {...props}
    />
  );
}
