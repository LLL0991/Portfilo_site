"use client";

import gsap from "gsap";
import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

type SmoothScrollProps = {
  children: React.ReactNode;
};

export function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    const { documentElement } = document;
    delete documentElement.dataset.pendingHashScroll;
    delete documentElement.dataset.hashScrollReady;

    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.35,
      smoothTouch: 0.12,
      effects: true,
      normalizeScroll: true,
    });

    return () => {
      delete documentElement.dataset.pendingHashScroll;
      delete documentElement.dataset.hashScrollReady;
      smoother.kill();
    };
  }, []);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}
