"use client";

import type { CSSProperties, PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type HeroElasticGridProps = {
  bounds: {
    height: number;
    left: number;
    top: number;
    width: number;
  };
};

type PointerState = {
  active: boolean;
  movedAt: number;
  x: number;
  y: number;
};

const COLUMNS = 16;
const ROWS = 7;

function warpPoint(x: number, y: number, pointer: PointerState, now: number) {
  const elapsed = Math.max(0, (now - pointer.movedAt) / 1000);
  const strength = pointer.active ? Math.max(0, 1 - elapsed / 0.95) : Math.max(0, 1 - elapsed / 0.5);
  const dx = x - pointer.x;
  const dy = y - pointer.y;
  const distance = Math.hypot(dx, dy);
  const radius = 0.42;
  const falloff = Math.max(0, 1 - distance / radius);
  const ripple = Math.sin(distance * 28 - elapsed * 16) * falloff * falloff * strength;
  const normal = distance > 0 ? 1 / distance : 0;
  const amount = ripple * 0.045;

  return {
    x: x + dx * normal * amount,
    y: y + dy * normal * amount,
  };
}

function linePath(points: Array<{ x: number; y: number }>) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(4)} ${point.y.toFixed(4)}`)
    .join(" ");
}

export function HeroElasticGrid({ bounds }: HeroElasticGridProps) {
  const [now, setNow] = useState(0);
  const [pointerState, setPointerState] = useState<PointerState>({
    active: false,
    movedAt: 0,
    x: 0.5,
    y: 0.5,
  });
  const pointerRef = useRef<PointerState>({
    active: false,
    movedAt: 0,
    x: 0.5,
    y: 0.5,
  });
  const frameRef = useRef<number | null>(null);

  function start() {
    if (frameRef.current) {
      return;
    }

    const tick = (timestamp: number) => {
      const pointer = pointerRef.current;
      const elapsed = Math.max(0, (timestamp - pointer.movedAt) / 1000);
      const stillVisible = pointer.active || elapsed < 0.6;

      setNow(timestamp);

      if (stillVisible) {
        frameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      frameRef.current = null;
      setNow(0);
    };

    frameRef.current = window.requestAnimationFrame(tick);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      active: true,
      movedAt: performance.now(),
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
    setPointerState(pointerRef.current);
    start();
  }

  function handlePointerLeave() {
    pointerRef.current = {
      ...pointerRef.current,
      active: false,
      movedAt: performance.now(),
    };
    setPointerState(pointerRef.current);
    start();
  }

  const paths = useMemo(() => {
    const isResting = now === 0 && !pointerState.active;
    const timestamp = now || pointerState.movedAt;
    const vertical = Array.from({ length: COLUMNS + 1 }, (_, column) => {
      const x = column / COLUMNS;
      const points = Array.from({ length: ROWS * 5 + 1 }, (_, index) => {
        const y = index / (ROWS * 5);
        return isResting ? { x, y } : warpPoint(x, y, pointerState, timestamp);
      });
      return linePath(points);
    });
    const horizontal = Array.from({ length: ROWS + 1 }, (_, row) => {
      const y = row / ROWS;
      const points = Array.from({ length: COLUMNS * 5 + 1 }, (_, index) => {
        const x = index / (COLUMNS * 5);
        return isResting ? { x, y } : warpPoint(x, y, pointerState, timestamp);
      });
      return linePath(points);
    });

    return [...vertical, ...horizontal];
  }, [now, pointerState]);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <div
      className="hero-elastic-grid"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        {
          height: `${bounds.height}%`,
          left: `${bounds.left}%`,
          top: `${bounds.top}%`,
          width: `${bounds.width}%`,
        } as CSSProperties
      }
    >
      <svg className="hero-elastic-grid-svg" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
        <rect x="0" y="0" width="1" height="1" className="hero-elastic-grid-fill" />
        {paths.map((path, index) => (
          <path className="hero-elastic-grid-line" d={path} key={index} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
    </div>
  );
}
