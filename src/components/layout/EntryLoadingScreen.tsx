"use client";

import { useEffect, useRef, useState } from "react";
import { DottedSurface } from "@/components/ui/dotted-surface";

type LoadingPhase = "visible" | "done";

const MIN_VISIBLE_MS = 1600;
const MAX_VISIBLE_MS = 6800;
const PROGRESS_MS = 2400;
const SETTLE_MS = 2400;
const GROW_MS = 340;
const GROW_START_THRESHOLD = 0.8;
const BACKDROP_BRIDGE_MAX_MS = 1800;

const getInitialPhase = (): LoadingPhase => {
  if (typeof window === "undefined") {
    return "visible";
  }

  const searchParams = new URLSearchParams(window.location.search);

  return searchParams.get("skipLoading") === "1" ? "done" : "visible";
};

export function EntryLoadingScreen() {
  const [phase, setPhase] = useState<LoadingPhase>(getInitialPhase);
  const [progress, setProgress] = useState(0);
  const [settleProgress, setSettleProgress] = useState(0);
  const [growProgress, setGrowProgress] = useState(0);
  const displayProgress =
    phase === "visible" && settleProgress === 0 ? progress : null;
  const progressDoneResolverRef = useRef<(() => void) | null>(null);
  const settleDoneResolverRef = useRef<(() => void) | null>(null);
  const growDoneResolverRef = useRef<(() => void) | null>(null);
  const settleStartedRef = useRef(false);
  const growStartedRef = useRef(false);

  useEffect(() => {
    if (phase === "done") {
      document.documentElement.classList.remove("entry-loading-active");
      document.documentElement.classList.remove("entry-loading-settle-active");
      return;
    }

    document.documentElement.classList.add("entry-loading-active");

    return () => {
      document.documentElement.classList.remove("entry-loading-active");
      document.documentElement.classList.remove("entry-loading-settle-active");
    };
  }, [phase]);

  useEffect(() => {
    let cancelled = false;
    let minimumTimer = 0;
    let maximumTimer = 0;
    let cleanupWindowLoad: (() => void) | null = null;
    const waitForFonts = document.fonts?.ready ?? Promise.resolve();
    const waitForWindowLoad =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            const handleLoad = () => resolve();
            window.addEventListener("load", handleLoad, { once: true });
            cleanupWindowLoad = () => {
              window.removeEventListener("load", handleLoad);
            };
          });
    const minimumDelay = new Promise<void>((resolve) => {
      minimumTimer = window.setTimeout(resolve, MIN_VISIBLE_MS);
    });
    const progressDone = new Promise<void>((resolve) => {
      progressDoneResolverRef.current = resolve;
    });
    const settleDone = new Promise<void>((resolve) => {
      settleDoneResolverRef.current = resolve;
    });
    const growDone = new Promise<void>((resolve) => {
      growDoneResolverRef.current = resolve;
    });
    const maximumDelay = new Promise<void>((resolve) => {
      maximumTimer = window.setTimeout(() => {
        setProgress(100);
        setSettleProgress(1);
        setGrowProgress(1);
        resolve();
      }, MAX_VISIBLE_MS);
    });

    const waitForHomeBackdropReady = () =>
      new Promise<void>((resolve) => {
        const start = window.performance.now();

        const check = () => {
          if (cancelled) {
            resolve();
            return;
          }

          const homeMotionReady = document.documentElement.dataset.homeMotion === "ready";
          const heroRedField = document.querySelector<HTMLElement>("[data-hero-red-field]");
          const siteDotField = document.querySelector<HTMLElement>(".site-dot-field");
          const heroRedStyle = heroRedField ? window.getComputedStyle(heroRedField) : null;
          const siteDotStyle = siteDotField ? window.getComputedStyle(siteDotField) : null;
          const heroRedVisible =
            !!heroRedField &&
            heroRedStyle?.display !== "none" &&
            heroRedStyle?.visibility !== "hidden" &&
            Number(heroRedStyle?.opacity ?? "0") > 0.96;
          const siteDotsVisible =
            !!siteDotField &&
            siteDotStyle?.display !== "none" &&
            siteDotStyle?.visibility !== "hidden";

          if (homeMotionReady && heroRedVisible && siteDotsVisible) {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
            return;
          }

          if (window.performance.now() - start >= BACKDROP_BRIDGE_MAX_MS) {
            resolve();
            return;
          }

          requestAnimationFrame(check);
        };

        check();
      });

    const startExit = async () => {
      if (cancelled) {
        return;
      }

      await waitForHomeBackdropReady();

      if (!cancelled) {
        setPhase("done");
      }
    };

    Promise.race([
      Promise.all([
        minimumDelay,
        waitForFonts,
        waitForWindowLoad,
        progressDone,
        settleDone,
        growDone,
      ]).then(
        startExit,
      ),
      maximumDelay.then(startExit),
    ]).then(
      () => {
        if (cancelled) {
          return;
        }
      },
    );

    return () => {
      cancelled = true;
      cleanupWindowLoad?.();
      if (minimumTimer) {
        window.clearTimeout(minimumTimer);
      }
      if (maximumTimer) {
        window.clearTimeout(maximumTimer);
      }
      progressDoneResolverRef.current = null;
      settleDoneResolverRef.current = null;
      growDoneResolverRef.current = null;
      settleStartedRef.current = false;
      growStartedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (phase !== "visible") {
      return;
    }

    let frame = 0;
    const start = window.performance.now();
    const duration = PROGRESS_MS;

    const update = (now: number) => {
      const elapsed = now - start;
      const ratio = Math.max(0, Math.min(1, elapsed / duration));
      const eased = 1 - (1 - ratio) * (1 - ratio);
      const nextProgress = Math.round(eased * 100);
      setProgress(nextProgress);

      if (ratio >= 1) {
        progressDoneResolverRef.current?.();
        progressDoneResolverRef.current = null;
      }

      if (ratio < 1) {
        frame = window.requestAnimationFrame(update);
      }
    };

    frame = window.requestAnimationFrame(update);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "visible" || progress < 100 || settleStartedRef.current) {
      return;
    }

    settleStartedRef.current = true;
    document.documentElement.classList.add("entry-loading-settle-active");
    window.dispatchEvent(new CustomEvent("entry-loading-settle-start"));
    let settleFrame = 0;
    let growFrame = 0;
    const settleStart = window.performance.now();

    const startGrow = () => {
      if (growStartedRef.current) {
        return;
      }

      growStartedRef.current = true;
      const growStart = window.performance.now();

      const growUpdate = (now: number) => {
        const elapsed = now - growStart;
        const ratio = Math.max(0, Math.min(1, elapsed / GROW_MS));
        const eased = ratio * ratio * (3 - 2 * ratio);
        setGrowProgress(eased);

        if (ratio >= 1) {
          growDoneResolverRef.current?.();
          growDoneResolverRef.current = null;
          return;
        }

        growFrame = window.requestAnimationFrame(growUpdate);
      };

      growFrame = window.requestAnimationFrame(growUpdate);
    };

    const settleUpdate = (now: number) => {
      const elapsed = now - settleStart;
      const ratio = Math.max(0, Math.min(1, elapsed / SETTLE_MS));
      const eased = ratio * ratio * (3 - 2 * ratio);
      setSettleProgress(eased);

      if (eased >= GROW_START_THRESHOLD) {
        startGrow();
      }

      if (ratio >= 1) {
        setSettleProgress(1);
        settleDoneResolverRef.current?.();
        settleDoneResolverRef.current = null;
        startGrow();
        return;
      }

      settleFrame = window.requestAnimationFrame(settleUpdate);
    };

    settleFrame = window.requestAnimationFrame(settleUpdate);

    return () => {
      if (settleFrame) {
        window.cancelAnimationFrame(settleFrame);
      }
      if (growFrame) {
        window.cancelAnimationFrame(growFrame);
      }
    };
  }, [phase, progress]);

  if (phase === "done") {
    return null;
  }

  return (
    <div
      className="entry-loading-screen"
      aria-hidden="true"
    >
      <DottedSurface
        className="entry-loading-surface-wrap"
        settleProgress={settleProgress}
        growProgress={growProgress}
      >
        <div className="entry-loading-copy">
          {displayProgress !== null ? (
            <p
              className="entry-loading-title entry-loading-progress"
              style={{ color: "#fff" }}
            >
              {displayProgress}%
            </p>
          ) : null}
        </div>
      </DottedSurface>
    </div>
  );
}
