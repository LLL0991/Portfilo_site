"use client";

import type { MouseEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type HeroEmojiBurstProps = {
  label: string;
};

type BurstOrigin = {
  x: number;
  y: number;
  size: number;
};

type EmojiParticle = {
  age: number;
  alpha: number;
  decay: number;
  drift: number;
  emoji: string;
  gravity: number;
  life: number;
  rotation: number;
  size: number;
  spin: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
};

const burstEmojis = [
  "😂",
  "🤣",
  "😆",
  "😜",
  "🤩",
  "😎",
  "🤯",
  "🥳",
  "😇",
  "✨",
  "💥",
  "⭐",
  "💫",
  "🌟",
  "🔥",
  "🌈",
  "⚡",
  "🎉",
  "🎊",
  "🎯",
  "🌀",
  "💎",
  "🪩",
  "🪄",
  "👀",
  "💅",
  "🧃",
  "🫧",
  "🍒",
  "🍓",
  "🍊",
  "🍋",
  "🍇",
  "🍬",
  "🍭",
  "🧸",
  "🛸",
  "🚀",
  "🌙",
  "☀️",
  "🌸",
  "🌼",
  "🦋",
  "💐",
  "❤️",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "🖤",
  "🤍",
  "🤎",
  "🩷",
  "🩵",
  "🩶",
  "💖",
  "💗",
  "💓",
  "💞",
  "💕",
  "💘",
];

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createParticle(origin: BurstOrigin): EmojiParticle {
  const angle = randomBetween(-52, -8) * (Math.PI / 180);
  const velocity = randomBetween(origin.size * 0.042, origin.size * 0.086);

  return {
    age: 0,
    alpha: 1,
    decay: randomBetween(0.972, 0.988),
    drift: randomBetween(-0.045, 0.055),
    emoji: burstEmojis[Math.floor(Math.random() * burstEmojis.length)],
    gravity: randomBetween(0.16, 0.28),
    life: randomBetween(120, 170),
    rotation: randomBetween(-0.45, 0.45),
    size: randomBetween(origin.size * 0.052, origin.size * 0.078),
    spin: randomBetween(-0.045, 0.045),
    vx: Math.cos(angle) * velocity,
    vy: Math.sin(angle) * velocity,
    x: origin.x + randomBetween(0, origin.size * 0.05),
    y: origin.y + randomBetween(-origin.size * 0.045, origin.size * 0.045),
  };
}

function resizeCanvas(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const context = canvas.getContext("2d");
  context?.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function HeroEmojiBurst({ label }: HeroEmojiBurstProps) {
  const [active, setActive] = useState(false);
  const [burstVersion, setBurstVersion] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originRef = useRef<BurstOrigin | null>(null);
  const runIdRef = useRef(0);
  const rotateTimeoutRef = useRef<number | null>(null);

  const burst = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const asset = event.currentTarget.closest<HTMLElement>('[data-hero-asset="liang-card"]');

    if (asset) {
      asset.classList.remove("is-click-rotating");
      window.requestAnimationFrame(() => {
        asset.classList.add("is-click-rotating");
      });

      if (rotateTimeoutRef.current) {
        window.clearTimeout(rotateTimeoutRef.current);
      }

      rotateTimeoutRef.current = window.setTimeout(() => {
        asset.classList.remove("is-click-rotating");
        rotateTimeoutRef.current = null;
      }, 420);
    }

    originRef.current = {
      size: rect.width,
      x: rect.left + rect.width * 1.02,
      y: rect.top + rect.height * 0.48,
    };
    runIdRef.current += 1;
    setBurstVersion((current) => current + 1);
    setActive(true);
  }, []);

  useEffect(() => {
    return () => {
      if (rotateTimeoutRef.current) {
        window.clearTimeout(rotateTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!active) {
      return;
    }

    const canvas = canvasRef.current;
    const origin = originRef.current;

    if (!canvas || !origin) {
      return;
    }

    resizeCanvas(canvas);

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const particles: EmojiParticle[] = [];
    const runId = runIdRef.current;
    const startedAt = performance.now();
    const emitFor = 860;
    let animationFrame = 0;
    let lastFrame = startedAt;
    let emitRemainder = 0;

    const render = (now: number) => {
      const delta = Math.min(32, now - lastFrame) / 16.67;
      lastFrame = now;

      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (now - startedAt < emitFor) {
        emitRemainder += 2.35 * delta;
        while (emitRemainder >= 1) {
          particles.push(createParticle(origin));
          emitRemainder -= 1;
        }
      }

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];

        particle.vx *= particle.decay;
        particle.vy *= particle.decay;
        particle.vx += particle.drift * delta;
        particle.vy += particle.gravity * delta;
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.rotation += particle.spin * delta;
        particle.age += delta;
        particle.alpha = Math.max(0, 1 - particle.age / particle.life);

        if (particle.alpha <= 0 || particle.y > window.innerHeight + particle.size * 2) {
          particles.splice(index, 1);
          continue;
        }

        context.save();
        context.globalAlpha = Math.min(1, particle.alpha * 1.25);
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.font = `${particle.size}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(particle.emoji, 0, 0);
        context.restore();
      }

      if (particles.length > 0 || now - startedAt < emitFor) {
        animationFrame = window.requestAnimationFrame(render);
        return;
      }

      if (runIdRef.current === runId) {
        setActive(false);
      }
    };

    animationFrame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [active, burstVersion]);

  return (
    <>
      <button className="hero-emoji-burst-target" type="button" aria-label={label} onClick={burst} />
      {active && typeof document !== "undefined"
        ? createPortal(<canvas ref={canvasRef} className="hero-emoji-burst-canvas" aria-hidden="true" />, document.body)
        : null}
    </>
  );
}
