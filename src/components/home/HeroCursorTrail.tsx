"use client";

import type { CSSProperties, PointerEvent } from "react";
import { useEffect, useRef } from "react";

type HeroCursorTrailProps = {
  bounds: {
    height: number;
    left: number;
    top: number;
    width: number;
  };
};

type TrailParticle = {
  age: number;
  life: number;
  radius: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function resizeCanvas(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const rect = canvas.getBoundingClientRect();

  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));

  const context = canvas.getContext("2d");
  context?.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function HeroCursorTrail({ bounds }: HeroCursorTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const particlesRef = useRef<TrailParticle[]>([]);

  function draw() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      frameRef.current = null;
      return;
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    context.clearRect(0, 0, width, height);

    const particles = particlesRef.current;
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];
      particle.age += 1;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.94;
      particle.vy *= 0.94;

      const alpha = Math.max(0, 1 - particle.age / particle.life);
      if (alpha <= 0) {
        particles.splice(index, 1);
        continue;
      }

      const radius = particle.radius * (0.45 + alpha * 0.65);
      const gradient = context.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, radius * 3.2);
      gradient.addColorStop(0, `rgba(140, 255, 253, ${alpha * 0.86})`);
      gradient.addColorStop(0.42, `rgba(140, 255, 253, ${alpha * 0.22})`);
      gradient.addColorStop(1, "rgba(140, 255, 253, 0)");

      context.fillStyle = gradient;
      context.beginPath();
      context.arc(particle.x, particle.y, radius * 3.2, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = `rgba(140, 255, 253, ${alpha})`;
      context.beginPath();
      context.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
      context.fill();
    }

    if (particles.length > 0) {
      frameRef.current = window.requestAnimationFrame(draw);
      return;
    }

    frameRef.current = null;
  }

  function addParticles(event: PointerEvent<HTMLDivElement>) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const particles = particlesRef.current;

    for (let index = 0; index < 4; index += 1) {
      particles.push({
        age: 0,
        life: randomBetween(24, 42),
        radius: randomBetween(1.4, 3.8),
        vx: randomBetween(-0.7, 0.7),
        vy: randomBetween(-0.7, 0.7),
        x: x + randomBetween(-4, 4),
        y: y + randomBetween(-4, 4),
      });
    }

    if (!frameRef.current) {
      frameRef.current = window.requestAnimationFrame(draw);
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    resizeCanvas(canvas);

    const observer = new ResizeObserver(() => {
      resizeCanvas(canvas);
    });
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <div
      className="hero-cursor-trail-area"
      style={
        {
          height: `${bounds.height}%`,
          left: `${bounds.left}%`,
          top: `${bounds.top}%`,
          width: `${bounds.width}%`,
        } as CSSProperties
      }
      onPointerEnter={addParticles}
      onPointerMove={addParticles}
    >
      <canvas ref={canvasRef} className="hero-cursor-trail-canvas" aria-hidden="true" />
    </div>
  );
}
