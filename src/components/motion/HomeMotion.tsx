"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function HomeMotion() {
  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        gsap.set(
          [
            "[data-hero-gallery] > *",
            "[data-home-intro]",
            "[data-mark-strip] > *",
            "[data-featured-card]",
            "[data-project-note]",
            "[data-polaroids] > *",
            "[data-contact-panel]",
          ],
          { autoAlpha: 1, clearProps: "transform,clipPath" },
        );
        return;
      }

      const hero = gsap.timeline({ defaults: { ease: "power4.out" } });

      hero
        .from("[data-hero-gallery] > *", {
          y: 42,
          rotate: 0,
          scale: 0.94,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.045,
        })
        .from(
          "[data-home-intro]",
          {
            y: 32,
            autoAlpha: 0,
            duration: 0.72,
            stagger: 0.1,
          },
          "-=0.46",
        )
        .from(
          "[data-mark-strip] > *",
          {
            y: 22,
            autoAlpha: 0,
            duration: 0.5,
            stagger: 0.045,
          },
          "-=0.36",
        );

      gsap.from("[data-featured-card]", {
        y: 54,
        autoAlpha: 0,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-featured-card]",
          start: "top 82%",
          once: true,
        },
      });

      gsap.from("[data-project-note]", {
        y: 26,
        autoAlpha: 0,
        duration: 0.65,
        stagger: 0.06,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-project-note]",
          start: "top 86%",
          once: true,
        },
      });

      gsap.from("[data-polaroids] > *", {
        y: 46,
        rotate: 0,
        autoAlpha: 0,
        duration: 0.75,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-polaroids]",
          start: "top 82%",
          once: true,
        },
      });

      gsap.from("[data-contact-panel]", {
        y: 34,
        autoAlpha: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-contact-panel]",
          start: "top 86%",
          once: true,
        },
      });

      ScrollTrigger.refresh();
    },
    [],
  );

  return null;
}
