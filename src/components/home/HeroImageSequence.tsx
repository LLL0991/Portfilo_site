"use client";

import { useEffect, useMemo, useRef } from "react";

type HeroImageSequenceProps = {
  alt?: string;
  basePath: string;
  frameCount: number;
};

export function HeroImageSequence({
  alt,
  basePath,
  frameCount,
}: HeroImageSequenceProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frames = useMemo(
    () =>
      Array.from(
        { length: frameCount },
        (_, index) => `${basePath}/frame_${String(index).padStart(5, "0")}.png`,
      ),
    [basePath, frameCount],
  );

  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement || frames.length === 0) {
      return undefined;
    }

    let cancelled = false;
    const images = frames.map((src) => {
      const image = new Image();
      image.decoding = "async";
      image.src = src;
      return image;
    });

    imagesRef.current = images;

    imageElement.src = frames[0];
    images[0]?.decode?.().catch(() => undefined).then(() => {
      if (cancelled) {
        return;
      }

      window.dispatchEvent(new CustomEvent("hero-sequence-ready"));
    });

    images.slice(1).forEach((image) => {
      void image.decode?.().catch(() => undefined);
    });

    return () => {
      cancelled = true;
    };
  }, [frames]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imageRef}
      alt={alt ?? ""}
      className="hero-image-sequence object-contain"
      data-hero-image-sequence
      data-hero-sequence-base={basePath}
      data-hero-sequence-count={frameCount}
      data-hero-sequence-frame="0"
      draggable={false}
      src={frames[0]}
    />
  );
}
