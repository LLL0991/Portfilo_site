"use client";

import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import type { ReactNode } from "react";

gsap.registerPlugin(
  DrawSVGPlugin,
  MorphSVGPlugin,
  MotionPathPlugin,
  ScrambleTextPlugin,
  ScrollTrigger,
  ScrollSmoother,
);

type HomeMotionProps = {
  children: ReactNode;
};

export function HomeMotion({ children }: HomeMotionProps) {
  useEffect(() => {
    const documentElement = document.documentElement;
    const { pathname, search } = window.location;
    documentElement.dataset.homeMotion = "ready";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const initialHash = window.location.hash;
    const hasInitialHash = initialHash !== "";
    const REVEAL_INPUT_ARM_DELAY_MS = 220;
    const INTRO_SCRAMBLE_CUE_DELAY_MS = 2300;
    let heroScroll = document.querySelector<HTMLElement>("[data-hero-scroll]");
    let heroStage = document.querySelector<HTMLElement>("[data-hero-stage]");
    let heroGallery = document.querySelector<HTMLElement>("[data-hero-gallery]");
    let heroRedField = document.querySelector<HTMLElement>("[data-hero-red-field]");
    let heroIntroTitle = document.querySelector<HTMLElement>("[data-hero-intro-title]");
    let topTelemetry = document.querySelector<HTMLElement>("[data-top-telemetry]");
    let projectsSurface = document.querySelector<HTMLElement>(".home-projects-surface");
    let portfolioLetterTrack = document.querySelector<HTMLElement>("[data-portfolio-letter-track]");
    let portfolioLetterGroup = portfolioLetterTrack?.querySelector<HTMLElement>(".portfolio-letter-group");
    let featuredPin = document.querySelector<HTMLElement>("[data-featured-pin]");
    let featuredFrame = document.querySelector<HTMLElement>("[data-featured-frame]");
    let featuredCard = document.querySelector<HTMLElement>("[data-featured-card]");
    let featuredGrid = document.querySelector<HTMLElement>("[data-featured-grid]");
    let featuredRed = document.querySelector<HTMLElement>("[data-featured-red]");
    let featuredBlack = document.querySelector<HTMLElement>("[data-featured-black]");
    let trapezoidLight = document.querySelector<HTMLElement>("[data-trapezoid-light]");
    let trapezoidBottom = document.querySelector<HTMLElement>("[data-trapezoid-bottom]");
    let heroAssets = gsap.utils.toArray<HTMLElement>("[data-hero-asset]");
    let heroIntroScrambleLines = gsap.utils.toArray<HTMLElement>("[data-hero-intro-scramble-line]");
    let heroIntroBaseFontSize = 0;
    documentElement.classList.add("entry-intro-title-pending");

    const resolveHeroElements = () => {
      heroScroll ??= document.querySelector<HTMLElement>("[data-hero-scroll]");
      heroStage ??= document.querySelector<HTMLElement>("[data-hero-stage]");
      heroGallery ??= document.querySelector<HTMLElement>("[data-hero-gallery]");
      heroRedField ??= document.querySelector<HTMLElement>("[data-hero-red-field]");
      heroIntroTitle ??= document.querySelector<HTMLElement>("[data-hero-intro-title]");
      topTelemetry ??= document.querySelector<HTMLElement>("[data-top-telemetry]");
      projectsSurface ??= document.querySelector<HTMLElement>(".home-projects-surface");
      portfolioLetterTrack ??= document.querySelector<HTMLElement>("[data-portfolio-letter-track]");
      portfolioLetterGroup ??= portfolioLetterTrack?.querySelector<HTMLElement>(".portfolio-letter-group");
      featuredPin ??= document.querySelector<HTMLElement>("[data-featured-pin]");
      featuredFrame ??= document.querySelector<HTMLElement>("[data-featured-frame]");
      featuredCard ??= document.querySelector<HTMLElement>("[data-featured-card]");
      featuredGrid ??= document.querySelector<HTMLElement>("[data-featured-grid]");
      featuredRed ??= document.querySelector<HTMLElement>("[data-featured-red]");
      featuredBlack ??= document.querySelector<HTMLElement>("[data-featured-black]");
      trapezoidLight ??= document.querySelector<HTMLElement>("[data-trapezoid-light]");
      trapezoidBottom ??= document.querySelector<HTMLElement>("[data-trapezoid-bottom]");

      if (heroAssets.length === 0) {
        heroAssets = gsap.utils.toArray<HTMLElement>("[data-hero-asset]");
        gsap.set(heroAssets, {
          autoAlpha: 0,
          scale: 0.96,
          transformOrigin: "50% 50%",
        });
      }

      if (heroIntroScrambleLines.length === 0) {
        heroIntroScrambleLines = gsap.utils.toArray<HTMLElement>("[data-hero-intro-scramble-line]");
      }

      if (heroIntroTitle) {
        gsap.set(heroIntroTitle, {
          transformOrigin: "50% 50%",
        });
      }
    };

    if (reduceMotion) {
      gsap.set("[data-hero-intro-title]", { autoAlpha: 0 });
      gsap.set("[data-hero-red-field]", { autoAlpha: 0 });
      gsap.set("[data-trapezoid-piece]", { autoAlpha: 0 });
      gsap.set("[data-start-lines-layer]", { autoAlpha: 0 });
      gsap.set("[data-start-red-ray-layer]", { autoAlpha: 0 });
      gsap.set(
        [
          "[data-hero-asset]",
          "[data-hero-gallery]",
          "[data-top-telemetry]",
          "[data-intro-card]",
          "[data-intro-copy-line]",
          "[data-vertical-cut-line]",
          "[data-intro-meta]",
          "[data-intro-lower]",
          "[data-mark-letter]",
          "[data-featured-part]",
          "[data-project-note]",
          "[data-polaroids] > *",
          "[data-contact-panel]",
        ],
        { autoAlpha: 1, clearProps: "transform,clipPath" },
      );
      gsap.set("[data-hero-intro-title]", { autoAlpha: 1, visibility: "visible" });
      return undefined;
    }

    gsap.set(heroAssets, {
      autoAlpha: 0,
      scale: 0.96,
      transformOrigin: "50% 50%",
    });

    if (heroIntroTitle) {
      const previousInlineFontSize = heroIntroTitle.style.fontSize;
      heroIntroTitle.style.fontSize = "";
      const baseFontSize = parseFloat(getComputedStyle(heroIntroTitle).fontSize) || heroIntroBaseFontSize;
      heroIntroTitle.style.fontSize = previousInlineFontSize;
      heroIntroBaseFontSize = baseFontSize;
      const initialIntroScale = getIntroOverscale();

      gsap.set(heroIntroTitle, {
        autoAlpha: 1,
        visibility: "visible",
        color: "#ffffff",
        transformOrigin: "50% 50%",
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
        scale: 1,
        fontSize: `${baseFontSize * initialIntroScale}px`,
      });
    }

    if (heroRedField) {
      gsap.set(heroRedField, {
        autoAlpha: 1,
        "--hero-red-radius": "32px",
      });
    }

    if (topTelemetry) {
      const headerHeight = topTelemetry.offsetHeight || 54;
      gsap.set(topTelemetry, {
        autoAlpha: 0,
        y: -headerHeight,
      });
    }

    let frame = 0;
    let loopFrame = 0;
    let introRevealFrame = 0;
    let heroLoopStarted = false;
    let heroLoopStarting = false;
    let introRevealPlayed = false;
    let introScramblePlayed = false;
    let introScrambleTween: gsap.core.Timeline | null = null;
    let introReadyForScrollAt = 0;
    let portfolioLetterOffset = 0;
    let hashUrlRestored = !hasInitialHash;
    const getScrollTop = () => ScrollSmoother.get()?.scrollTop() ?? window.scrollY;
    let lastScrollY = getScrollTop();
    const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);
    const smoothstep = (value: number) => value * value * (3 - 2 * value);
    const easeInQuart = (value: number) => value ** 4;
    const segment = (progress: number, start: number, end: number) =>
      smoothstep(clamp((progress - start) / (end - start)));
    const easeInSegment = (progress: number, start: number, end: number) =>
      easeInQuart(clamp((progress - start) / (end - start)));
    function getIntroOverscale() {
      return gsap.utils.clamp(1.85, 3.1, window.innerWidth / 720);
    }

    const syncHeroIntroBaseFontSize = () => {
      if (!heroIntroTitle) {
        return 0;
      }

      const previousInlineFontSize = heroIntroTitle.style.fontSize;
      heroIntroTitle.style.fontSize = "";
      heroIntroBaseFontSize = parseFloat(getComputedStyle(heroIntroTitle).fontSize) || heroIntroBaseFontSize;
      heroIntroTitle.style.fontSize = previousInlineFontSize;

      return heroIntroBaseFontSize;
    };

    const restoreInitialHashUrl = () => {
      if (!hasInitialHash || hashUrlRestored) {
        return;
      }

      window.history.replaceState(window.history.state, "", `${pathname}${search}${initialHash}`);
      hashUrlRestored = true;
    };

    if (hasInitialHash) {
      window.history.replaceState(window.history.state, "", `${pathname}${search}`);
    }
    const syncStartRayTargets = () => {
      if (!featuredCard) {
        return false;
      }

      const rayPaths = gsap.utils.toArray<SVGPathElement>("[data-start-ray-target]");
      if (rayPaths.length === 0) {
        return false;
      }

      const rayStartX = 630.234;
      const rayStartY = 632.899;
      const formatPoint = (value: number) => Number(value.toFixed(3));
      let didSync = false;

      rayPaths.forEach((path) => {
        const targetName = path.dataset.startRayTarget;
        const target = targetName
          ? featuredCard?.querySelector<HTMLElement>(`[data-featured-ray-target="${targetName}"]`)
          : null;
        const svg = path.ownerSVGElement;
        const screenMatrix = svg?.getScreenCTM();

        if (!target || !svg || !screenMatrix) {
          return;
        }

        const article = target.closest<HTMLElement>("article");

        if (!article) {
          return;
        }

        const articleRect = article.getBoundingClientRect();
        const articleScale =
          article.offsetWidth > 0 ? articleRect.width / article.offsetWidth : 1;
        const fromX = Number(target.dataset.fromX ?? 0);
        const fromY = Number(target.dataset.fromY ?? 0);
        const point = svg.createSVGPoint();
        point.x =
          articleRect.left +
          (target.offsetLeft +
            target.offsetWidth / 2 +
            (target.offsetWidth * fromX) / 100) *
            articleScale;
        point.y =
          articleRect.top +
          (target.offsetTop +
            target.offsetHeight / 2 +
            (target.offsetHeight * fromY) / 100) *
            articleScale;
        const svgPoint = point.matrixTransform(screenMatrix.inverse());

        path.setAttribute(
          "d",
          `M${rayStartX} ${rayStartY}L${formatPoint(svgPoint.x)} ${formatPoint(svgPoint.y)}`,
        );
        didSync = true;
      });

      return didSync;
    };
    let shouldSyncStartRays = true;

    const updateHero = () => {
      frame = 0;
      resolveHeroElements();
      if (shouldSyncStartRays) {
        shouldSyncStartRays = !syncStartRayTargets();
      }

      const scrollTop = getScrollTop();
      const scrollDelta = scrollTop - lastScrollY;
      lastScrollY = scrollTop;

      if (projectsSurface) {
        const rect = projectsSurface.getBoundingClientRect();

        projectsSurface.style.setProperty("--projects-dot-x", `${-rect.left}px`);
        projectsSurface.style.setProperty("--projects-dot-y", `${-rect.top}px`);
      }

      if (portfolioLetterTrack && portfolioLetterGroup) {
        const groupWidth = portfolioLetterGroup.scrollWidth;
        if (groupWidth > 0) {
          portfolioLetterOffset =
            ((portfolioLetterOffset + scrollDelta * 0.7) % groupWidth + groupWidth) % groupWidth;

          gsap.set(portfolioLetterTrack, {
            x: -portfolioLetterOffset,
          });
        }
      }

      if (featuredCard && featuredRed && featuredBlack) {
        const featuredAssemblyProgress = clamp(Number(featuredCard.dataset.featuredProgress ?? 0));
        const magnetProgress = segment(featuredAssemblyProgress, 0.28, 0.42);
        const redGridAnchorX = featuredRed.offsetLeft;
        const redGridAnchorY = featuredRed.offsetTop + featuredRed.offsetHeight * (53.824 / 312);
        const redAnchorX = featuredRed.offsetLeft + featuredRed.offsetWidth * (448.659 / 867);
        const redAnchorY = featuredRed.offsetTop + featuredRed.offsetHeight * (208.43 / 312);
        const blackAnchorX = featuredBlack.offsetLeft + featuredBlack.offsetWidth * (395.194 / 771);
        const blackAnchorY = featuredBlack.offsetTop + featuredBlack.offsetHeight * (15.984 / 194);
        const joinNudgeX = -4;
        const joinNudgeY = -6;

        gsap.set(featuredBlack, {
          x: (redAnchorX - blackAnchorX + joinNudgeX) * magnetProgress,
          y: (redAnchorY - blackAnchorY + joinNudgeY) * magnetProgress,
        });

        if (featuredGrid) {
          const gridSize = 19;
          const gridCellIndex = 21;
          const gridLineX = featuredGrid.offsetLeft + (gridCellIndex - 1) * gridSize;
          const gridLineY =
            featuredGrid.offsetTop +
            Math.round((redGridAnchorY - featuredGrid.offsetTop) / gridSize) * gridSize;

          gsap.set(featuredGrid, {
            x: (redGridAnchorX - gridLineX) * magnetProgress,
            y: (redGridAnchorY - gridLineY) * magnetProgress,
          });
        }

        if (trapezoidLight && trapezoidBottom && featuredAssemblyProgress < 0.74) {
          const lightLeftAnchor =
            trapezoidLight.offsetLeft + trapezoidLight.offsetWidth * (430 / 764);
          const lightTopAnchor =
            trapezoidLight.offsetTop + trapezoidLight.offsetHeight * (771.5 / 772);
          const lightRightAnchor =
            trapezoidLight.offsetLeft + trapezoidLight.offsetWidth * (587 / 764);
          const desiredBottomWidth =
            (lightRightAnchor - lightLeftAnchor) / ((157.931 - 2.26855) / 161);
          const bottomLeftAnchor =
            trapezoidBottom.offsetLeft + desiredBottomWidth * (2.26855 / 161);
          const bottomTopAnchor = trapezoidBottom.offsetTop + trapezoidBottom.offsetHeight * (29.2295 / 30);

          gsap.set(trapezoidBottom, {
            transformOrigin: "0% 100%",
            width: desiredBottomWidth,
            x: lightLeftAnchor - bottomLeftAnchor,
            y: lightTopAnchor - bottomTopAnchor,
          });
        }
      }

      if (!heroScroll || !heroIntroTitle) {
        return;
      }

      const headerHeight = topTelemetry?.offsetHeight || 54;
      const topOffset = headerHeight;
      const start = heroScroll.offsetTop - topOffset;
      const distance = Math.max(heroScroll.offsetHeight - window.innerHeight, 1);
      const progress = clamp((scrollTop - start) / distance);
      const heroMotionEnd = 0.78;
      const heroMotionProgress = clamp(progress / heroMotionEnd);
      const heroPanProgress = segment(progress, heroMotionEnd, 1);
      const introOverscale = getIntroOverscale();
      const introSettleProgress = segment(heroMotionProgress, 0.0, 0.22);
      const titleProgress = segment(heroMotionProgress, 0.22, 0.62);
      const headerProgress = segment(heroMotionProgress, 0.12, 0.5);
      const redFieldProgress = easeInSegment(heroMotionProgress, 0.005, 0.68);
      const redFieldFade = segment(heroMotionProgress, 0.68, 0.84);
      const navFontSize = topTelemetry ? parseFloat(getComputedStyle(topTelemetry).fontSize) : 14;
      const baseFontSize = heroIntroBaseFontSize || syncHeroIntroBaseFontSize() || navFontSize;
      const targetY = headerHeight / 2 - window.innerHeight / 2;
      const initialFontSize = baseFontSize * introOverscale;
      const settledFontSize = gsap.utils.interpolate(initialFontSize, baseFontSize, introSettleProgress);
      const navFontTween = gsap.utils.interpolate(baseFontSize, navFontSize, titleProgress);
      const nextFontSize = heroMotionProgress < 0.22 ? settledFontSize : navFontTween;

      gsap.set(heroIntroTitle, {
        autoAlpha: 1,
        visibility: "visible",
        color: gsap.utils.interpolate("#ffffff", "#6e6d6d", titleProgress),
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: targetY * titleProgress,
        scale: 1,
        fontSize: `${nextFontSize}px`,
      });

      if (heroRedField) {
        gsap.set(heroRedField, {
          autoAlpha: 1 - redFieldFade,
          "--hero-red-radius": `${gsap.utils.interpolate(32, 1, redFieldProgress)}px`,
        });
      }

      if (topTelemetry) {
        gsap.set(topTelemetry, {
          autoAlpha: headerProgress,
          y: -headerHeight * (1 - headerProgress),
        });
      }

      const commonAssetEnd = 0.98;
      const assetStartsByName: Record<string, number> = {
        "portfolio-arrow": 0.04,
        calendar: 0.05,
        "soft-arrow": 0.06,
        disc: 0.07,
        "liang-card": 0.08,
        "info-panel": 0.09,
        "portfolio-card": 0.11,
        "gradient-ticket": 0.13,
        "wire-box": 0.15,
      };

      const assetStartDirections: Record<string, [number, number]> = {
        "liang-card": [-1, -0.72],
        "portfolio-card": [-0.28, -1],
        calendar: [0.22, -1],
        "portfolio-arrow": [1, -0.46],
        "soft-arrow": [-1, 0.32],
        disc: [1, 0.26],
        "info-panel": [-1, 0.82],
        "gradient-ticket": [0.12, 1],
        "wire-box": [1, 0.82],
      };

      const getOffscreenStart = (asset: HTMLElement, direction: [number, number]) => {
        const gallery = asset.closest<HTMLElement>("[data-hero-gallery]");
        const galleryRect = gallery?.getBoundingClientRect();
        const finalLeft = (galleryRect?.left ?? 0) + asset.offsetLeft;
        const finalTop = (galleryRect?.top ?? 0) + asset.offsetTop;
        const finalRight = finalLeft + asset.offsetWidth;
        const finalBottom = finalTop + asset.offsetHeight;
        const margin = Math.max(28, Math.min(window.innerWidth, window.innerHeight) * 0.055);
        const [dx, dy] = direction;
        let distance = 1;

        if (dx < 0) {
          distance = Math.max(distance, (finalRight + margin) / Math.abs(dx));
        } else if (dx > 0) {
          distance = Math.max(distance, (window.innerWidth - finalLeft + margin) / dx);
        }

        if (dy < 0) {
          distance = Math.max(distance, (finalBottom + margin) / Math.abs(dy));
        } else if (dy > 0) {
          distance = Math.max(distance, (window.innerHeight - finalTop + margin) / dy);
        }

        return [dx * distance, dy * distance] as const;
      };

      const getHeroPanDistance = () => {
        if (!heroGallery || heroAssets.length === 0) {
          return 0;
        }

        const currentGalleryY = Number(gsap.getProperty(heroGallery, "y")) || 0;
        const contentBottom = heroAssets.reduce((bottom, asset) => {
          const rect = asset.getBoundingClientRect();

          return Math.max(bottom, rect.bottom - currentGalleryY);
        }, heroGallery.getBoundingClientRect().bottom - currentGalleryY);
        const bottomSafeArea = 44;
        const visibleBottom = window.innerHeight - headerHeight;

        return Math.max(0, contentBottom - (visibleBottom - bottomSafeArea));
      };

      heroAssets.forEach((asset, index) => {
        const assetName = asset.dataset.heroAsset ?? "";
        const fallbackStart = 0.08 + index * 0.035;
        const assetStart = assetStartsByName[assetName] ?? fallbackStart;
        const rawAssetProgress = clamp(
          (heroMotionProgress - assetStart) / (commonAssetEnd - assetStart),
        );
        const assetProgress =
          rawAssetProgress < 0.5
            ? 2 * rawAssetProgress * rawAssetProgress
            : 1 - (-2 * rawAssetProgress + 2) ** 2 / 2;
        const direction = assetStartDirections[assetName] ?? [1, 0.42];
        const [startX, startY] = getOffscreenStart(asset, direction);

        gsap.set(asset, {
          autoAlpha: 1,
          x: startX * (1 - assetProgress),
          y: startY * (1 - assetProgress),
          scale: 0.96 + 0.04 * assetProgress,
        });

        const sequenceImage = asset.querySelector<HTMLImageElement>("[data-hero-image-sequence]");
        if (sequenceImage) {
          const frameCount = Number(sequenceImage.dataset.heroSequenceCount ?? 1);
          const sequenceStart = 0.7;
          const sequenceEnd = 0.98;
          const sequenceProgress = clamp(
            (assetProgress - sequenceStart) / (sequenceEnd - sequenceStart),
          );
          const frameIndex = Math.round((frameCount - 1) * sequenceProgress);
          const nextSrc = `/images/home/hero-motion/soft-arrow-sequence/frame_${String(frameIndex).padStart(5, "0")}.png`;

          if (sequenceImage.dataset.heroSequenceFrame !== String(frameIndex)) {
            sequenceImage.dataset.heroSequenceFrame = String(frameIndex);
            sequenceImage.src = nextSrc;
          }
        }
      });

      if (heroGallery) {
        gsap.set(heroGallery, {
          y: -getHeroPanDistance() * heroPanProgress,
        });
      }
    };

    const requestHeroUpdate = () => {
      if (!heroLoopStarted) {
        return;
      }

      if (!frame) {
        frame = window.requestAnimationFrame(updateHero);
      }
    };

    const syncFeaturedScale = () => {
      resolveHeroElements();

      if (!featuredFrame || !featuredCard) {
        return;
      }

      featuredCard.style.setProperty(
        "--featured-scale",
        String(featuredFrame.getBoundingClientRect().width / 1500),
      );
    };

    const waitForLoadingReveal = (onReady: () => void) => {
      if (document.documentElement.classList.contains("entry-loading-active")) {
        introRevealFrame = window.requestAnimationFrame(() => waitForLoadingReveal(onReady));
        return;
      }

      onReady();
    };

    const waitForIntroScrambleCue = (onReady: () => void) => {
      const runAfterCueDelay = () => {
        const timeout = window.setTimeout(onReady, INTRO_SCRAMBLE_CUE_DELAY_MS);
        motionCleanups.push(() => {
          window.clearTimeout(timeout);
        });
      };

      if (!document.documentElement.classList.contains("entry-loading-active")) {
        onReady();
        return;
      }

      if (
        document.documentElement.classList.contains("entry-loading-settle-active")
      ) {
        runAfterCueDelay();
        return;
      }

      const handleSettleStart = () => {
        window.removeEventListener("entry-loading-settle-start", handleSettleStart);
        runAfterCueDelay();
      };

      window.addEventListener("entry-loading-settle-start", handleSettleStart);
      motionCleanups.push(() => {
        window.removeEventListener("entry-loading-settle-start", handleSettleStart);
      });
    };

    const scrambleChars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" +
      "创造的必要性" +
      "lanecesidaddecrear" +
      "lanecessitedecreer" +
      "創造する必要性" +
      "창조의필요성" +
      "!<>-_\\/[]{}=+*^?#";

    const getScrambleSeed = (text: string) => {
      const chars = scrambleChars;

      return Array.from(text, (character, index) => {
        if (character === " ") {
          return " ";
        }

        return chars[(index * 13 + text.length * 7) % chars.length];
      }).join("");
    };

    const playIntroScramble = (onComplete: () => void) => {
      resolveHeroElements();

      if (introScramblePlayed || heroIntroScrambleLines.length === 0) {
        documentElement.classList.remove("entry-intro-title-pending");
        onComplete();
        return;
      }

      introScramblePlayed = true;
      introScrambleTween?.kill();
      documentElement.classList.add("entry-intro-scramble-active");
      documentElement.classList.remove("entry-intro-title-pending");
      heroIntroScrambleLines.forEach((line) => {
        const targetText = line.dataset.scrambleText ?? line.textContent ?? "";
        line.textContent = getScrambleSeed(targetText);
      });

      introScrambleTween = gsap.timeline({
        defaults: {
          ease: "none",
        },
        onComplete: () => {
          heroIntroScrambleLines.forEach((line) => {
            line.textContent = line.dataset.scrambleText ?? line.textContent;
          });
          documentElement.classList.remove("entry-intro-scramble-active");
          onComplete();
        },
      });

      heroIntroScrambleLines.forEach((line, index) => {
        const targetText = line.dataset.scrambleText ?? line.textContent ?? "";

        introScrambleTween?.to(
          line,
          {
            duration: 1.15,
            scrambleText: {
              text: targetText,
              chars: scrambleChars,
              revealDelay: 0.08,
              speed: 0.32,
              tweenLength: false,
            },
          },
          index * 0.14,
        );
      });
    };

    const heroLoop = () => {
      updateHero();
      loopFrame = window.requestAnimationFrame(heroLoop);
    };

    const handleResize = () => {
      syncHeroIntroBaseFontSize();
      shouldSyncStartRays = true;
      syncFeaturedScale();
      requestHeroUpdate();
    };

    const finalizeHeroLoopStart = () => {
      if (heroLoopStarted || heroLoopStarting) {
        return;
      }

      heroLoopStarting = true;
      heroLoopStarted = true;
      heroLoopStarting = false;
      syncFeaturedScale();
      updateHero();
      loopFrame = window.requestAnimationFrame(heroLoop);
      window.addEventListener("scroll", requestHeroUpdate, { passive: true });
      window.addEventListener("resize", handleResize);
      requestHeroUpdate();
    };

    const resetStartupViewport = () => {
      window.scrollTo(0, 0);
      const smoother = ScrollSmoother.get();

      if (smoother) {
        smoother.scrollTo(0, false, "top top");
      }
    };

    const waitForUserScrollToStartHero = () => {
      const cleanupFns: Array<() => void> = [];

      const startFromUserInput = () => {
        if (window.performance.now() < introReadyForScrollAt) {
          return;
        }

        restoreInitialHashUrl();
        cleanupFns.forEach((cleanup) => cleanup());
        finalizeHeroLoopStart();
      };

      const handleWheel = () => {
        startFromUserInput();
      };

      const handleTouchMove = () => {
        startFromUserInput();
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === "ArrowDown" ||
          event.key === "PageDown" ||
          event.key === " " ||
          event.key === "Spacebar"
        ) {
          startFromUserInput();
        }
      };

      window.addEventListener("wheel", handleWheel, { passive: true });
      cleanupFns.push(() => window.removeEventListener("wheel", handleWheel));

      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      cleanupFns.push(() => window.removeEventListener("touchmove", handleTouchMove));

      window.addEventListener("keydown", handleKeyDown);
      cleanupFns.push(() => window.removeEventListener("keydown", handleKeyDown));

      motionCleanups.push(() => {
        cleanupFns.forEach((cleanup) => cleanup());
      });
    };

    const startHeroLoop = () => {
      if (heroLoopStarted || heroLoopStarting || introRevealPlayed) {
        return;
      }

      introRevealPlayed = true;

      if (hasInitialHash) {
        waitForIntroScrambleCue(() => {
          resetStartupViewport();
          window.requestAnimationFrame(() => {
            resetStartupViewport();
          });
          window.requestAnimationFrame(() => {
            resetStartupViewport();
            playIntroScramble(() => {
              waitForLoadingReveal(() => {
                resetStartupViewport();
                introReadyForScrollAt =
                  window.performance.now() + REVEAL_INPUT_ARM_DELAY_MS;
                waitForUserScrollToStartHero();
              });
            });
          });
        });
        return;
      }

      waitForIntroScrambleCue(() => {
        playIntroScramble(() => {
          waitForLoadingReveal(() => {
            waitForUserScrollToStartHero();
          });
        });
      });
    };

    const motionCleanups: Array<() => void> = [];

    const context = gsap.context(() => {
      if (heroScroll && heroStage) {
        ScrollTrigger.create({
          trigger: heroScroll,
          start: () => `top top+=${topTelemetry?.offsetHeight || 54}`,
          endTrigger: "[data-intro-swipe]",
          end: "top top",
          pin: heroStage,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });

        gsap.fromTo(
          heroStage,
          { y: 0 },
          {
            y: () => -(window.innerHeight - (topTelemetry?.offsetHeight || 54)),
            ease: "none",
            scrollTrigger: {
              trigger: "[data-mark-strip]",
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      const introCard = document.querySelector<HTMLElement>("[data-intro-card]");
      if (introCard) {
        const introUnderlay = document.querySelector<HTMLElement>("[data-intro-underlay]");
        const introUnderlayCopy = document.querySelector<HTMLElement>("[data-intro-underlay-copy]");
        const introCopyLine = document.querySelector<HTMLElement>("[data-intro-copy-line]");
        const introMeta = document.querySelector<HTMLElement>("[data-intro-meta]");
        const introLower = document.querySelector<HTMLElement>("[data-intro-lower]");
        const introTopCutLines =
          gsap.utils.toArray<HTMLElement>('[data-vertical-cut-line="top"]');
        const introBottomCutLines =
          gsap.utils.toArray<HTMLElement>('[data-vertical-cut-line="bottom"]');
        const introRevealItems = [introCopyLine, introMeta, introLower].filter(
          Boolean,
        ) as HTMLElement[];
        gsap.set(introUnderlay, { autoAlpha: 0 });
        gsap.set(introUnderlayCopy, { yPercent: 12, autoAlpha: 1 });
        gsap.set(introCard, {
          yPercent: 18,
          clipPath: "inset(10% 0% 0% 0%)",
          transformOrigin: "50% 100%",
        });
        gsap.set(introRevealItems, { autoAlpha: 1 });
        gsap.set(introCopyLine, { y: 44 });
        gsap.set(introMeta, { y: 96 });
        gsap.set(introLower, { y: 136 });
        gsap.set([...introTopCutLines, ...introBottomCutLines], { yPercent: 104 });

        if (introUnderlay) {
          gsap.fromTo(
            introUnderlay,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              ease: "none",
              scrollTrigger: {
                trigger: "[data-intro-swipe]",
                start: "top 135%",
                end: "top bottom",
                scrub: 0.5,
                invalidateOnRefresh: true,
              },
            },
          );
        }

        if (introUnderlayCopy) {
          const helloEase = gsap.parseEase("power3.out");
          ScrollTrigger.create({
            trigger: "[data-intro-swipe]",
            start: "top 135%",
            end: "top 18%",
            scrub: 0.4,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const easedProgress = helloEase(self.progress);
              const nextY = gsap.utils.interpolate(12, -4, easedProgress);
              gsap.set(introUnderlayCopy, { yPercent: nextY });
            },
          });
        }

        const introReveal = gsap.timeline({
          scrollTrigger: {
            trigger: "[data-intro-swipe]",
            start: "top bottom-=10%",
            end: "top top+=10%",
            scrub: 0.72,
            invalidateOnRefresh: true,
          },
        });

        introReveal
          .to(
            introCard,
            {
              yPercent: 0,
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "none",
              duration: 1,
            },
            0,
          )
          .to(
            introCopyLine,
            {
              y: 0,
              ease: "power3.out",
              duration: 0.68,
            },
            0.38,
          )
          .to(
            introTopCutLines,
            {
              yPercent: 0,
              ease: "none",
              duration: 0.28,
              stagger: 0.08,
            },
            0.34,
          )
          .to(
            introMeta,
            {
              y: 0,
              ease: "power3.out",
              duration: 0.78,
            },
            0.66,
          )
          .to(
            introLower,
            {
              y: 0,
              ease: "power3.out",
              duration: 0.82,
            },
            0.92,
          )
          .to(
            introBottomCutLines,
            {
              yPercent: 0,
              ease: "none",
              duration: 0.34,
              stagger: 0.11,
            },
            1.14,
          );
      }

      gsap.from("[data-mark-letter]", {
        y: 12,
        autoAlpha: 0,
        duration: 0.42,
        stagger: 0.045,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-mark-strip]",
          start: "top 98%",
          once: true,
        },
      });

      const featuredParts = gsap
        .utils
        .toArray<HTMLElement>("[data-featured-part]")
        .filter((part) => !part.matches("[data-featured-green]"));
      const featuredLagParts = gsap.utils.toArray<HTMLElement>("[data-featured-entry-lag]");
      const featuredGreen = document.querySelector<HTMLElement>("[data-featured-green]");
      const featuredStage = document.querySelector<HTMLElement>("[data-featured-stage]");
      const startLines = gsap.utils.toArray<SVGPathElement>("[data-start-line]");
      const startOrbitLines = gsap.utils.toArray<SVGPathElement>("[data-start-orbit-line]");
      const startDotMaskLines = gsap.utils.toArray<SVGPathElement>("[data-start-dot-mask-line]");
      const greenOrbitPath = document.querySelector<SVGPathElement>("[data-green-orbit-path]");
      const featuredAssemblyTrigger = featuredPin ?? featuredCard;
      const featuredHeading = document.querySelector<HTMLElement>("[data-featured-heading]");
      const projectIndex = document.querySelector<HTMLElement>("[data-project-index]");
      const projectIndexLine = document.querySelector<HTMLElement>("[data-project-index-line]");
      const projectIndexTitle = document.querySelector<HTMLElement>("[data-project-index-title]");
      const projectIndexTitleWrap = document.querySelector<HTMLElement>("[data-project-index-title-wrap]");
      const projectIndexGroups = gsap.utils.toArray<HTMLElement>("[data-project-index-group]");
      const projectIndexRowTextMasks = gsap.utils.toArray<HTMLElement>("[data-project-index-row-text-mask]");
      const projectIndexRowTexts = gsap.utils.toArray<HTMLElement>("[data-project-index-row-text]");
      const projectIndexRowMarkMasks = gsap.utils.toArray<HTMLElement>("[data-project-index-row-mark-mask]");
      const projectIndexRowMarks = gsap.utils.toArray<HTMLElement>("[data-project-index-row-mark]");
      const trapezoidTop = document.querySelector<HTMLElement>("[data-trapezoid-top]");
      const trapezoidLight = document.querySelector<HTMLElement>("[data-trapezoid-light]");
      const trapezoidBottom = document.querySelector<HTMLElement>("[data-trapezoid-bottom]");
      const trapezoidLightPath =
        document.querySelector<SVGPathElement>("[data-trapezoid-light-path]");
      const trapezoidLightCollapsed = document.querySelector<SVGPathElement>(
        "[data-trapezoid-light-collapsed]",
      );
      const trapezoidTopPath =
        document.querySelector<SVGPathElement>("[data-trapezoid-top-path]");
      const projectsHorizontalViewport = document.querySelector<HTMLElement>(
        "[data-projects-horizontal-viewport]",
      );
      const projectsHorizontalTrack = document.querySelector<HTMLElement>(
        "[data-projects-horizontal-track]",
      );
      let horizontalScrollLength = 0;
      let stylizeHoldScrollLength = 0;
      const refreshHorizontalGallery = () => {
        if (!projectsHorizontalViewport || !projectsHorizontalTrack) {
          horizontalScrollLength = 0;
          stylizeHoldScrollLength = 0;
          return;
        }

        horizontalScrollLength = Math.max(
          projectsHorizontalTrack.scrollWidth - projectsHorizontalViewport.clientWidth,
          0,
        );
        stylizeHoldScrollLength = gsap.utils.clamp(
          48 * 12,
          48 * 18,
          Math.round(window.innerHeight * 0.92),
        );
      };
      refreshHorizontalGallery();
      ScrollTrigger.addEventListener("refreshInit", refreshHorizontalGallery);
      motionCleanups.push(() => {
        ScrollTrigger.removeEventListener("refreshInit", refreshHorizontalGallery);
      });

        if (featuredCard && featuredAssemblyTrigger && featuredParts.length > 0) {
          const activeFeaturedCard = featuredCard;

          activeFeaturedCard.dataset.featuredProgress = "0";
        featuredLagParts.forEach((part, index) => {
          const lag = Number(part.dataset.featuredLag ?? 0.18 + index * 0.018);
          const entryX = Number(part.dataset.entryX ?? (index % 2 === 0 ? -18 : 18));
          const entryY = Number(part.dataset.entryY ?? 80 + lag * 120);

          gsap.fromTo(
            part,
            {
              x: entryX,
              y: entryY,
            },
            {
              x: 0,
              y: 0,
              ease: "none",
              immediateRender: false,
              scrollTrigger: {
                trigger: featuredAssemblyTrigger,
                start: "top 92%",
                end: "top 36%",
                scrub: 0.32 + lag * 1.15,
                invalidateOnRefresh: true,
                onLeave: () => {
                  gsap.set(part, { x: 0, y: 0 });
                },
                onLeaveBack: () => {
                  gsap.set(part, { x: entryX, y: entryY });
                },
              },
            },
          );
        });

        const featuredAssembly = gsap.timeline({
          scrollTrigger: {
            trigger: featuredAssemblyTrigger,
            start: () => `top top+=${(topTelemetry?.offsetHeight || 56) + 48}`,
            end: () => `+=${2450 + horizontalScrollLength + stylizeHoldScrollLength}`,
            scrub: 0.75,
            pin: featuredAssemblyTrigger,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: refreshHorizontalGallery,
            onUpdate: (self) => {
              activeFeaturedCard.dataset.featuredProgress = String(self.progress);
              const horizontalActive =
                projectsHorizontalTrack &&
                Math.abs(Number(gsap.getProperty(projectsHorizontalTrack, "x")) || 0) > 4;

              activeFeaturedCard.style.pointerEvents = horizontalActive ? "none" : "";

              requestHeroUpdate();
            },
          },
        });
        if (featuredStage) {
          gsap.set(featuredStage, {
            y: 34,
          });

          featuredAssembly.to(
            featuredStage,
            {
              y: 0,
              ease: "none",
              duration: 0.82,
            },
            0,
          );
        }

        if (featuredHeading) {
          gsap.set(featuredHeading, {
            y: 0,
            autoAlpha: 1,
          });

          featuredAssembly.to(
            featuredHeading,
            {
              y: -86,
              autoAlpha: 0,
              ease: "none",
              duration: 0.28,
            },
            0.92,
          );
        }

        if (startLines.length > 0) {
          gsap.set(startLines, {
            drawSVG: "0% 100%",
          });
          gsap.set("[data-start-lines-layer]", {
            autoAlpha: 1,
          });

          featuredAssembly.to(
            startLines,
            {
              drawSVG: "0% 0%",
              ease: "none",
              stagger: 0.025,
              duration: 0.3,
            },
            0.82,
          );
        }

        if (startOrbitLines.length > 0) {
          gsap.set(startOrbitLines, {
            drawSVG: "0% 100%",
          });

          featuredAssembly.to(
            startOrbitLines,
            {
              drawSVG: "100% 100%",
              ease: "none",
              duration: 0.72,
            },
            0.08,
          );
        }

        if (startDotMaskLines.length > 0) {
          gsap.set(startDotMaskLines, {
            drawSVG: "0% 100%",
          });

          featuredAssembly.to(
            startDotMaskLines,
            {
              drawSVG: "0% 0%",
              ease: "none",
              stagger: 0.025,
              duration: 0.72,
            },
            0.08,
          );
        }

        if (featuredGreen && greenOrbitPath) {
          gsap.set(featuredGreen, {
            zIndex: 72,
            scale: Number(featuredGreen.dataset.fromScale ?? 0.5),
          });

          featuredAssembly.to(
            featuredGreen,
            {
              motionPath: {
                path: greenOrbitPath,
                align: greenOrbitPath,
                alignOrigin: [0.5, 0.5],
                autoRotate: false,
                start: 0.24,
                end: 0.74,
              },
              keyframes: [
                { scale: 1.5, duration: 0.5 },
                { scale: 1, duration: 0.5 },
              ],
              ease: "none",
              duration: 0.86,
            },
            0,
          );

          featuredAssembly.to(
            featuredGreen,
            {
              xPercent: 0,
              yPercent: 0,
              x: 0,
              y: 0,
              scale: 1,
              ease: "none",
              duration: 0.14,
            },
            0.86,
          );

          featuredAssembly.set(
            featuredGreen,
            {
              zIndex: 20,
            },
            0.86,
          );
        }

        featuredParts.forEach((part) => {
          const fromX = Number(part.dataset.fromX ?? 0);
          const fromY = Number(part.dataset.fromY ?? 0);
          const fromScale = Number(part.dataset.fromScale ?? 1);
          const isFeaturedGrid = part.matches("[data-featured-grid]");
          const fromWidth = part.dataset.fromWidth;
          const fromHeight = part.dataset.fromHeight;

          featuredAssembly.fromTo(
            part,
            {
              xPercent: fromX,
              yPercent: fromY,
              scale: isFeaturedGrid ? 1 : fromScale,
              width: isFeaturedGrid ? fromWidth : undefined,
              height: isFeaturedGrid ? fromHeight : undefined,
            },
            {
              xPercent: 0,
              yPercent: 0,
              scale: 1,
              width: isFeaturedGrid ? "58%" : undefined,
              height: isFeaturedGrid ? "55%" : undefined,
              ease: "none",
              duration: 1,
            },
            0,
          );
        });

        if (trapezoidTop && trapezoidLight && trapezoidBottom) {
          gsap.set(trapezoidTop, {
            autoAlpha: 1,
            transformOrigin: "0% 0%",
          });
          gsap.set(trapezoidLight, {
            autoAlpha: 0.74,
            transformOrigin: "0% 0%",
          });
          gsap.set(trapezoidBottom, {
            autoAlpha: 1,
            transformOrigin: "50% 50%",
          });
          gsap.set(trapezoidBottom, { scale: 1 });

          featuredAssembly
            .to(
              trapezoidTop,
              {
                x: () =>
                  trapezoidBottom.getBoundingClientRect().left -
                  trapezoidTop.getBoundingClientRect().left,
                y: () =>
                  trapezoidBottom.getBoundingClientRect().top -
                  trapezoidTop.getBoundingClientRect().top,
                scaleX: () =>
                  trapezoidBottom.getBoundingClientRect().width /
                  trapezoidTop.getBoundingClientRect().width,
                scaleY: () =>
                  trapezoidBottom.getBoundingClientRect().height /
                  trapezoidTop.getBoundingClientRect().height,
                ease: "none",
                duration: 0.58,
              },
              0.08,
            )
            .to(
              trapezoidBottom,
              {
                yPercent: 0,
                ease: "none",
                duration: 0.58,
              },
              0.08,
            );

          if (trapezoidLightPath && trapezoidLightCollapsed && trapezoidTopPath) {
            const topSvg = trapezoidTopPath.ownerSVGElement;
            const lightSvg = trapezoidLightPath.ownerSVGElement;
            const lightShape = { progress: 0 };
            const formatPoint = (value: number) => Number(value.toFixed(3));
            const mapTopPointToLight = (x: number, y: number) => {
              const topMatrix = topSvg?.getScreenCTM();
              const lightMatrix = lightSvg?.getScreenCTM();

              if (!topSvg || !lightSvg || !topMatrix || !lightMatrix) {
                return { x, y };
              }

              const point = topSvg.createSVGPoint();
              point.x = x;
              point.y = y;
              const screenPoint = point.matrixTransform(topMatrix);
              const lightPoint = screenPoint.matrixTransform(lightMatrix.inverse());

              return {
                x: formatPoint(lightPoint.x),
                y: formatPoint(lightPoint.y),
              };
            };
            const syncLightShape = () => {
              const topRight = mapTopPointToLight(766.713, 0.5);
              const topLeft = mapTopPointToLight(314.512, 0.5);
              const lowerLeft = mapTopPointToLight(3.99023, 79.542);
              const baseLeftX = 430;
              const baseLeftY = 771.5;
              const baseMidX = 492.5;
              const baseMidY = 742.5;
              const baseRightX = 587;

              trapezoidLightPath.setAttribute(
                "d",
                [
                  `M${baseMidX} ${baseMidY}`,
                  `H${baseRightX}`,
                  `L${topRight.x} ${topRight.y}`,
                  `L${topLeft.x} ${topLeft.y}`,
                  `L${lowerLeft.x} ${lowerLeft.y}`,
                  `L${baseLeftX} ${baseLeftY}`,
                  `L${baseMidX} ${baseMidY}`,
                  "Z",
                ].join(""),
              );
            };

            syncLightShape();
            featuredAssembly.to(
              lightShape,
              {
                progress: 1,
                ease: "none",
                duration: 0.58,
                onUpdate: syncLightShape,
              },
              0.08,
            );
          }

          featuredAssembly.set([trapezoidTop, trapezoidLight], { autoAlpha: 0 }, 0.66);
          featuredAssembly.to(
            trapezoidBottom,
            {
              scale: 0,
              ease: "none",
              duration: 0.14,
            },
            0.66,
          );
        }

        if (projectIndex && projectIndexLine && projectIndexGroups.length > 0) {
          gsap.set(projectIndex, {
            y: 0,
          });
          gsap.set(projectIndexLine, {
            "--project-index-line-scale": 0,
          });
          if (projectIndexTitleWrap) {
            gsap.set(projectIndexTitleWrap, {
              "--project-index-divider-scale": 0,
            });
          }
          gsap.set(projectIndexGroups, {
            "--project-index-row-line-scale": 0,
          });
          gsap.set(projectIndexRowTextMasks, {
            clipPath: "inset(100% 0 0 0)",
          });
          gsap.set(projectIndexRowTexts, {
            y: 18,
          });
          gsap.set(projectIndexRowMarkMasks, {
            clipPath: "inset(100% 0 0 0)",
          });
          gsap.set(projectIndexRowMarks, {
            y: 18,
          });
          if (projectIndexTitle) {
            gsap.set(projectIndexTitle, {
              y: 34,
              autoAlpha: 0,
            });
          }

          if (featuredStage) {
            featuredAssembly.to(
              featuredStage,
              {
                y: -64,
                ease: "none",
                duration: 0.56,
              },
              0.78,
            );
          }

          featuredAssembly.to(
            projectIndexLine,
            {
              "--project-index-line-scale": 1,
              ease: "none",
              duration: 0.34,
            },
            1.34,
          );

          if (projectIndexTitle) {
            featuredAssembly.to(
              projectIndexTitle,
              {
                y: 0,
                autoAlpha: 1,
                ease: "none",
                duration: 0.42,
              },
              3.52,
            );
          }

          const projectIndexReveal = gsap.timeline({
            scrollTrigger: {
              trigger: projectIndex,
              start: () => (featuredAssembly.scrollTrigger?.end ?? 0) + 1,
              end: () =>
                (featuredAssembly.scrollTrigger?.end ?? 0) +
                Math.min(720, window.innerHeight * 0.7),
              scrub: 0.35,
              invalidateOnRefresh: true,
            },
          });

          if (projectIndexTitleWrap) {
            projectIndexReveal.to(
              projectIndexTitleWrap,
              {
                "--project-index-divider-scale": 1,
                ease: "none",
                duration: 0.18,
              },
              0,
            );
          }

          projectIndexGroups.forEach((group, index) => {
            const rowTextMask = projectIndexRowTextMasks[index];
            const rowText = projectIndexRowTexts[index];
            const rowMarkMask = projectIndexRowMarkMasks[index];
            const rowMark = projectIndexRowMarks[index];
            const rowStart = 0.2 + index * 0.36;

            if (rowTextMask && rowText) {
              projectIndexReveal.to(
                rowTextMask,
                {
                  clipPath: "inset(0% 0 0 0)",
                  ease: "none",
                  duration: 0.1,
                },
                rowStart,
              );
              projectIndexReveal.to(
                rowText,
                {
                  y: 0,
                  ease: "none",
                  duration: 0.1,
                },
                rowStart,
              );
            }

            if (rowMarkMask && rowMark) {
              projectIndexReveal.to(
                rowMarkMask,
                {
                  clipPath: "inset(0% 0 0 0)",
                  ease: "none",
                  duration: 0.1,
                },
                rowStart + 0.1,
              );
              projectIndexReveal.to(
                rowMark,
                {
                  y: 0,
                  ease: "none",
                  duration: 0.1,
                },
                rowStart + 0.1,
              );
            }

            projectIndexReveal.to(
              group,
              {
                "--project-index-row-line-scale": 1,
                ease: "none",
                duration: 0.12,
              },
              rowStart + 0.2,
            );
          });
        }

        if (projectsHorizontalTrack) {
          featuredAssembly.fromTo(
            projectsHorizontalTrack,
            {
              x: 0,
            },
            {
              x: () => -horizontalScrollLength,
              ease: "none",
              duration: 1.08,
              immediateRender: false,
            },
            2.62,
          );
        }

        // Hold the camera stage in place after the horizontal handoff so the
        // user gets a stable interaction window before the page continues.
        featuredAssembly.to(
          {},
          {
            duration: 0.2,
          },
        );
      }

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

      startHeroLoop();
    });

    return () => {
      delete documentElement.dataset.homeMotion;
      window.removeEventListener("scroll", requestHeroUpdate);
      window.removeEventListener("resize", handleResize);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      if (loopFrame) {
        window.cancelAnimationFrame(loopFrame);
      }
      if (introRevealFrame) {
        window.cancelAnimationFrame(introRevealFrame);
      }
      introScrambleTween?.kill();
      documentElement.classList.remove("entry-intro-scramble-active");
      documentElement.classList.remove("entry-intro-title-pending");
      window.removeEventListener("scroll", requestHeroUpdate);
      window.removeEventListener("resize", handleResize);
      context.revert();
      motionCleanups.forEach((cleanup) => {
        cleanup();
      });
    };
  }, []);

  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 h-px w-px opacity-0"
        data-home-motion-root
      />
      {children}
    </>
  );
}
