"use client";

import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { createPortal } from "react-dom";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  getIntroPreviewIndexFromPoint,
  INTRO_PREVIEW_COLUMNS,
  INTRO_PREVIEW_IMAGES,
  INTRO_PREVIEW_ROWS,
} from "@/lib/introPreviewImages";

function getWheelDeltaY(event: WheelEvent) {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return event.deltaY * 16;
  }

  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return event.deltaY * window.innerHeight;
  }

  return event.deltaY;
}

export function IntroSpaceStage() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const galleryScrollRef = useRef<HTMLDivElement | null>(null);
  const lastScrollTopRef = useRef(0);
  const lastScrollTimeRef = useRef(0);
  const [galleryStartIndex, setGalleryStartIndex] = useState<number | null>(null);
  const [previewActive, setPreviewActive] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewPosition, setPreviewPosition] = useState({ x: "78%", y: "46%" });
  const [galleryReady, setGalleryReady] = useState(false);
  const [overlayBounds, setOverlayBounds] = useState<{
    height: number;
    left: number;
    top: number;
    width: number;
  } | null>(null);

  const galleryOpen = galleryStartIndex !== null;
  const galleryLoopImages = useMemo(
    () =>
      Array.from({ length: 3 }, (_, copyIndex) =>
        INTRO_PREVIEW_IMAGES.map((src, imageIndex) => ({
          copyIndex,
          imageIndex,
          src,
        })),
      ).flat(),
    [],
  );

  useLayoutEffect(() => {
    if (!galleryOpen) {
      return undefined;
    }

    const stage = stageRef.current;
    const introCard = stage?.closest<HTMLElement>("[data-intro-card]");
    const strip = introCard?.querySelector<HTMLElement>("[data-mark-strip]");
    if (!introCard) {
      return undefined;
    }

    const smoother = ScrollSmoother.get();
    const wasPaused = smoother?.paused() ?? false;
    const lockedScrollY = smoother?.scrollTop() ?? window.scrollY;
    const galleryScroll = galleryScrollRef.current;
    const skewTargets = Array.from(
      galleryScroll?.querySelectorAll<HTMLElement>(".skewElem") ?? [],
    );
    const skewProxy = { skew: 0 };
    const skewSetter = gsap.quickSetter(skewTargets, "skewY", "deg");
    const clampSkew = gsap.utils.clamp(-20, 20);
    let touchLastY: number | null = null;

    const updateBounds = () => {
      const cardRect = introCard.getBoundingClientRect();
      const stripHeight = strip?.offsetHeight ?? 0;
      setOverlayBounds({
        left: cardRect.left,
        top: cardRect.top,
        width: cardRect.width,
        height: Math.max(cardRect.height - stripHeight, 0),
      });
    };

    updateBounds();
    smoother?.scrollTop(lockedScrollY);
    smoother?.paused(true);
    gsap.set(skewTargets, { transformOrigin: "right center", force3D: true });

    const syncLoopPosition = () => {
      const scrollEl = galleryScrollRef.current;
      if (!scrollEl) {
        return false;
      }

      const sequenceHeight = scrollEl.scrollHeight / 3;
      if (!sequenceHeight) {
        return false;
      }

      if (scrollEl.scrollTop < sequenceHeight * 0.5) {
        scrollEl.scrollTop += sequenceHeight;
        return true;
      }

      if (scrollEl.scrollTop > sequenceHeight * 1.5) {
        scrollEl.scrollTop -= sequenceHeight;
        return true;
      }

      return false;
    };

    const updateSkew = () => {
      const scrollEl = galleryScrollRef.current;
      if (!scrollEl) {
        return;
      }

      const now = performance.now();
      const currentScrollTop = scrollEl.scrollTop;
      const delta = currentScrollTop - lastScrollTopRef.current;
      const elapsed = Math.max(now - lastScrollTimeRef.current, 16);
      const velocity = (delta / elapsed) * 1000;
      const skew = clampSkew(velocity / -300);

      if (Math.abs(skew) > Math.abs(skewProxy.skew)) {
        skewProxy.skew = skew;
        gsap.to(skewProxy, {
          skew: 0,
          duration: 0.8,
          ease: "power3",
          overwrite: true,
          onUpdate: () => skewSetter(skewProxy.skew),
        });
      }

      lastScrollTopRef.current = currentScrollTop;
      lastScrollTimeRef.current = now;
    };

    const onGalleryScroll = () => {
      const recentered = syncLoopPosition();
      if (recentered) {
        lastScrollTopRef.current = galleryScrollRef.current?.scrollTop ?? 0;
        lastScrollTimeRef.current = performance.now();
        return;
      }

      updateSkew();
    };

    const onWheel = (event: WheelEvent) => {
      const scrollEl = galleryScrollRef.current;
      if (!scrollEl) {
        return;
      }

      event.preventDefault();
      scrollEl.scrollTop += getWheelDeltaY(event);
    };

    const onTouchStart = (event: TouchEvent) => {
      touchLastY = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      const scrollEl = galleryScrollRef.current;
      const currentY = event.touches[0]?.clientY ?? null;
      if (!scrollEl || touchLastY === null || currentY === null) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      scrollEl.scrollTop += touchLastY - currentY;
      touchLastY = currentY;
    };

    const onTouchEnd = () => {
      touchLastY = null;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewActive(false);
        setGalleryStartIndex(null);
      }
    };

    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(introCard);
    if (strip) {
      resizeObserver.observe(strip);
    }

    const centerInitialGallery = () => {
      const scrollEl = galleryScrollRef.current;
      const targetIndex = galleryStartIndex;
      const target = scrollEl?.querySelector<HTMLElement>(
        `[data-gallery-copy="1"][data-gallery-image-index="${targetIndex}"]`,
      );
      if (!scrollEl || !target || targetIndex === null) {
        return false;
      }

      scrollEl.scrollTop = target.offsetTop - (scrollEl.clientHeight - target.clientHeight) / 2;
      lastScrollTopRef.current = scrollEl.scrollTop;
      lastScrollTimeRef.current = performance.now();
      return true;
    };

    centerInitialGallery();

    const setupFrame = window.requestAnimationFrame(() => {
      centerInitialGallery();
      window.requestAnimationFrame(() => {
        centerInitialGallery();
        setGalleryReady(true);
      });
    });

    galleryScroll?.addEventListener("scroll", onGalleryScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("resize", updateBounds);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(setupFrame);
      resizeObserver.disconnect();
      galleryScroll?.removeEventListener("scroll", onGalleryScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", updateBounds);
      window.removeEventListener("keydown", onKeyDown);
      smoother?.paused(wasPaused);
      smoother?.scrollTop(lockedScrollY);
      gsap.killTweensOf(skewProxy);
    };
  }, [galleryOpen, galleryStartIndex]);

  const openGalleryAtPointer = (clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const stageRect = stage.getBoundingClientRect();
    const introCard = stage.closest<HTMLElement>("[data-intro-card]");
    const strip = introCard?.querySelector<HTMLElement>("[data-mark-strip]");
    setGalleryReady(false);
    if (introCard) {
      const cardRect = introCard.getBoundingClientRect();
      const stripHeight = strip?.offsetHeight ?? 0;
      setOverlayBounds({
        left: cardRect.left,
        top: cardRect.top,
        width: cardRect.width,
        height: Math.max(cardRect.height - stripHeight, 0),
      });
    }

    setPreviewActive(false);
    setGalleryStartIndex(getIntroPreviewIndexFromPoint(stageRect, clientX, clientY));
  };

  const closeGalleryIfBackdropClick = (event: ReactMouseEvent<HTMLElement>) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest(".intro-gallery-card")) {
      return;
    }

    setPreviewActive(false);
    setGalleryStartIndex(null);
  };

  const updatePreviewFromPointer = (clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const stageRect = stage.getBoundingClientRect();
    const nextIndex = getIntroPreviewIndexFromPoint(stageRect, clientX, clientY);
    const gridX = nextIndex % INTRO_PREVIEW_COLUMNS;
    const gridY = Math.floor(nextIndex / INTRO_PREVIEW_COLUMNS);
    const x = ((gridX + 0.5) / INTRO_PREVIEW_COLUMNS) * stageRect.width;
    const y = ((gridY + 0.5) / INTRO_PREVIEW_ROWS) * stageRect.height;

    setPreviewIndex(nextIndex);
    setPreviewPosition({ x: `${x}px`, y: `${y}px` });
    setPreviewActive(true);
    const previewImage = stage.querySelector<HTMLImageElement>("[data-intro-preview-image]");
    if (previewImage) {
      previewImage.dataset.previewIndex = String(nextIndex + 1);
    }
  };

  return (
    <>
      <div
        ref={stageRef}
        className="intro-space-stage relative flex-1"
        data-intro-meta
        data-intro-preview-zone
        data-preview-active={previewActive ? "true" : undefined}
        style={
          {
            "--intro-preview-x": previewPosition.x,
            "--intro-preview-y": previewPosition.y,
          } as CSSProperties
        }
        onPointerEnter={(event) => {
          if (event.pointerType === "touch" || galleryOpen) {
            return;
          }

          updatePreviewFromPointer(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (event.pointerType === "touch" || galleryOpen) {
            return;
          }

          updatePreviewFromPointer(event.clientX, event.clientY);
        }}
        onPointerLeave={() => {
          setPreviewActive(false);
        }}
        onClick={(event) => {
          if (galleryOpen) {
            return;
          }

          openGalleryAtPointer(event.clientX, event.clientY);
        }}
      >
        <p className="intro-space-latin" aria-hidden="true">
          LLL SPACE
        </p>
        <p className="intro-space-chinese" aria-hidden="true">
          亮の空间
        </p>
        <div className="intro-photo-card" data-intro-preview aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={INTRO_PREVIEW_IMAGES[previewIndex]}
            alt="Liang Dai portfolio visual"
            className="intro-photo-card-image"
            data-intro-preview-image
          />
        </div>
      </div>

      {galleryOpen && overlayBounds
        ? createPortal(
            <div className="intro-gallery-overlay" aria-modal="true" role="dialog">
              <div
                className="intro-gallery-shell"
                style={overlayBounds}
                onClick={closeGalleryIfBackdropClick}
              >
                <div
                  ref={galleryScrollRef}
                  className="intro-gallery-scroll"
                  data-ready={galleryReady ? "true" : "false"}
                  onClick={closeGalleryIfBackdropClick}
                >
                  <div className="intro-gallery-track">
                    {galleryLoopImages.map((image) => (
                      <figure
                        key={`${image.copyIndex}-${image.imageIndex}-${image.src}`}
                        className="intro-gallery-card skewElem"
                        data-gallery-copy={image.copyIndex}
                        data-gallery-image-index={image.imageIndex}
                        data-gallery-seq-index={image.imageIndex}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.src} alt="" />
                      </figure>
                    ))}
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
