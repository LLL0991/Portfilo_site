"use client";

import type { CSSProperties, ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";

type IntroScaleBlockProps = {
  anchor?: "top" | "bottom";
  children: ReactNode;
  className?: string;
  designWidth?: number;
  fitMode?: "width" | "contain";
  lockDesignWidth?: boolean;
  maxScale?: number;
  minScale?: number;
  absolute?: boolean;
};

export function IntroScaleBlock({
  anchor = "top",
  children,
  className,
  designWidth,
  fitMode = "width",
  lockDesignWidth = false,
  maxScale = 2,
  minScale = 0.4,
  absolute = true,
}: IntroScaleBlockProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [metrics, setMetrics] = useState({ height: 0, scale: 1, width: designWidth ?? 0 });

  useLayoutEffect(() => {
    const shell = shellRef.current;
    const inner = innerRef.current;

    if (!shell || !inner) {
      return undefined;
    }

    let frame = 0;

    const measure = () => {
      frame = 0;
      const availableWidth = shell.clientWidth;
      const availableHeight = shell.clientHeight;
      const naturalWidth =
        lockDesignWidth && designWidth
          ? designWidth
          : Math.max(designWidth ?? 0, inner.scrollWidth);
      const naturalHeight = inner.scrollHeight;

      if (!availableWidth || !naturalWidth || !naturalHeight) {
        return;
      }

      const widthScale = availableWidth / naturalWidth;
      const heightScale = availableHeight > 0 ? availableHeight / naturalHeight : Number.POSITIVE_INFINITY;
      const rawScale = fitMode === "contain" ? Math.min(widthScale, heightScale) : widthScale;
      const nextScale = Math.min(maxScale, Math.max(minScale, rawScale));
      const nextHeight = naturalHeight * nextScale;

      setMetrics((current) => {
        if (
          Math.abs(current.scale - nextScale) < 0.001 &&
          Math.abs(current.height - nextHeight) < 0.5 &&
          Math.abs(current.width - naturalWidth) < 0.5
        ) {
          return current;
        }

        return {
          scale: nextScale,
          height: nextHeight,
          width: naturalWidth,
        };
      });
    };

    const scheduleMeasure = () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      frame = window.requestAnimationFrame(measure);
    };

    scheduleMeasure();

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(shell);

    window.addEventListener("resize", scheduleMeasure);
    document.fonts?.ready.then(scheduleMeasure).catch(() => undefined);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [designWidth, fitMode, lockDesignWidth, maxScale, minScale]);

  return (
    <div
      ref={shellRef}
      className={`intro-scale-shell ${className ?? ""}`.trim()}
      data-anchor={anchor}
      style={{ height: fitMode === "contain" ? "100%" : metrics.height || undefined }}
    >
      <div
        ref={innerRef}
        className="intro-scale-inner"
        style={
          {
            "--intro-scale-factor": metrics.scale,
            "--intro-scale-position": absolute ? "absolute" : "relative",
            width: metrics.width ? `${metrics.width}px` : undefined,
          } as CSSProperties
        }
      >
        {children}
      </div>
    </div>
  );
}
