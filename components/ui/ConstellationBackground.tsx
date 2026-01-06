"use client";

import React, { useEffect, useRef } from "react";

/**
 * Premium Constellation Background
 * Matches NovaTok landing page style - subtle, sophisticated, not busy
 * 
 * Features:
 * - Small soft dots with glow (cyan/light blue)
 * - Very faint short-range connections
 * - Slow drift animation (30 FPS capped)
 * - Respects prefers-reduced-motion
 * - Fixed positioning, pointer-events none
 */
export default function ConstellationBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Respect user's motion preferences
    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;

      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    // Sparse density for premium feel (not busy like the landing page)
    const area = w * h;
    const count = Math.max(50, Math.min(100, Math.floor(area / 28000)));

    // Create constellation points
    const points = Array.from({ length: count }).map(() => ({
      x: rand(0, w),
      y: rand(0, h),
      vx: rand(-0.04, 0.04), // Very slow drift
      vy: rand(-0.04, 0.04),
      r: rand(0.6, 1.4), // Small dots
      brightness: rand(0.3, 0.6), // Varying brightness
    }));

    // Connection settings - short range, limited connections
    const maxDist = 130;
    const maxLinksPerPoint = 3;

    // FPS cap at 30 for performance
    let last = 0;
    const fpsCap = 30;
    const frameInterval = 1000 / fpsCap;

    const draw = (t: number) => {
      rafRef.current = requestAnimationFrame(draw);
      
      // Skip rendering if user prefers reduced motion (draw once static)
      if (reduceMotion) {
        if (last === 0) {
          drawFrame();
          last = 1;
        }
        return;
      }

      if (t - last < frameInterval) return;
      last = t;

      drawFrame();
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, w, h);

      // Update point positions (slow drift)
      if (!reduceMotion) {
        for (const p of points) {
          p.x += p.vx;
          p.y += p.vy;

          // Wrap around edges
          if (p.x < -20) p.x = w + 20;
          if (p.x > w + 20) p.x = -20;
          if (p.y < -20) p.y = h + 20;
          if (p.y > h + 20) p.y = -20;
        }
      }

      // Draw connections (very faint cyan lines)
      ctx.lineWidth = 0.8;
      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        let links = 0;

        for (let j = i + 1; j < points.length; j++) {
          if (links >= maxLinksPerPoint) break;

          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);

          if (d < maxDist) {
            // Fade based on distance - very subtle
            const alpha = 0.08 * (1 - d / maxDist);
            ctx.strokeStyle = `rgba(100, 220, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            links++;
          }
        }
      }

      // Draw dots with soft glow
      for (const p of points) {
        // Outer glow (soft, diffused)
        const glowGradient = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.r + 3
        );
        glowGradient.addColorStop(0, `rgba(140, 230, 255, ${p.brightness * 0.15})`);
        glowGradient.addColorStop(0.5, `rgba(100, 210, 255, ${p.brightness * 0.08})`);
        glowGradient.addColorStop(1, "rgba(100, 210, 255, 0)");
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + 3, 0, Math.PI * 2);
        ctx.fill();

        // Core dot (bright center)
        ctx.fillStyle = `rgba(180, 240, 255, ${p.brightness})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="constellation-background"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.6, // Global softness - subtle premium feel
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}
