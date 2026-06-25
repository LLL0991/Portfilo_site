"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import type { Project } from "@/types/project";

type Locale = "zh" | "en";

type ProjectIndexItem = {
  label: string;
  href?: string;
};

type ProjectIndexGroup = {
  number: string;
  title: string;
  items: ProjectIndexItem[];
};

type DrawerProject = {
  category: string;
  client: string;
  cover: string;
  intro: string;
  images: string[];
  key: string;
  services: string[];
  summary: string;
  tags: string[];
  title: string;
  videos: NonNullable<Project["videos"]>;
  year: number | string;
};

type ProjectIndexWithDrawerProps = {
  groups: ProjectIndexGroup[];
  locale: Locale;
  projects: Project[];
};

const fallbackCovers = [
  "/images/projects/adora-field.png",
  "/images/projects/leefon-field.png",
  "/images/projects/fabrie-field.png",
  "/images/projects/eleme-field.png",
];

const hoverPreviewCovers: Record<string, string> = {
  "adora-magic-city": "/images/projects/hover-preview/adora-magic-city-custom.jpg",
  dokie: "/images/projects/hover-preview/dokie-custom.jpg",
  fabrie: "/images/projects/hover-preview/fabrie-custom.jpg",
  nla: "/images/projects/hover-preview/nla-custom.jpg",
  dormie: "/images/projects/hover-preview/dormie-custom.jpg",
  "royal-casino": "/images/projects/hover-preview/royal-casino-custom.png",
  glimpse: "/images/projects/hover-preview/glimpse-custom.png",
  "the-space": "/images/projects/hover-preview/the-space-custom.png",
  "long-road": "/images/projects/hover-preview/long-road-custom.png",
  "see-the-world": "/images/projects/hover-preview/see-the-world-custom.png",
  eigba: "/images/projects/hover-preview/eigba.jpg",
  "invisible-string": "/images/projects/hover-preview/invisible-string-custom.png",
  square: "/images/projects/hover-preview/square.jpg",
};

const hoverPreviewCoverSources = Array.from(new Set(Object.values(hoverPreviewCovers)));

const projectDetailExitMs = 1000;

function hasCjk(text: string) {
  return /[\u3400-\u9fff]/.test(text);
}

function slugFromItem(item: ProjectIndexItem) {
  return item.href?.split("/").filter(Boolean).at(-1) ?? item.label.toLowerCase().replace(/\s+/g, "-");
}

function getEventGalleryTarget(event: Event) {
  const target = event.target;
  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest<HTMLElement>(".project-detail-gallery");
}

function getWheelDeltaY(event: WheelEvent) {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return event.deltaY * 16;
  }

  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return event.deltaY * window.innerHeight;
  }

  return event.deltaY;
}

function canScrollGallery(gallery: HTMLElement, deltaY: number) {
  const maxScroll = gallery.scrollHeight - gallery.clientHeight;

  if (maxScroll <= 0 || deltaY === 0) {
    return false;
  }

  if (deltaY < 0) {
    return gallery.scrollTop > 0;
  }

  return gallery.scrollTop < maxScroll - 1;
}

export function ProjectIndexWithDrawer({
  groups,
  locale,
  projects,
}: ProjectIndexWithDrawerProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [hoverPreview, setHoverPreview] = useState<{
    height: number;
    key: string;
    width: number;
    x: number;
    y: number;
  } | null>(null);
  const [coverAspects, setCoverAspects] = useState<Record<string, number>>({});
  const [isClosing, setIsClosing] = useState(false);
  const activeKeyRef = useRef<string | null>(null);
  const isClosingRef = useRef(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const localizedProjects = useMemo(() => {
    const bySlug = new Map(projects.map((project) => [project.slug, project]));
    const flatItems = groups.flatMap((group) =>
      group.items.map((item, index) => {
        const slug = slugFromItem(item);
        const project = bySlug.get(slug);

        if (project) {
          return {
            category: project.category,
            client: project.client ?? project.title[locale],
            cover: project.cover,
            images: project.images ?? Array.from({ length: 6 }, () => project.cover),
            intro: project.detail.intro[locale],
            key: project.slug,
            services: project.services[locale],
            summary: project.summary[locale],
            tags: project.tags,
            title: project.title[locale],
            videos: project.videos ?? [],
            year: project.year,
          } satisfies DrawerProject;
        }

        return {
          category: group.title,
          client: item.label,
          cover: fallbackCovers[(Number(group.number) + index - 1) % fallbackCovers.length],
          images: Array.from({ length: 6 }, () => fallbackCovers[(Number(group.number) + index - 1) % fallbackCovers.length]),
          intro:
            locale === "zh"
              ? "项目图像、视觉系统与过程记录将在这里展开。"
              : "Project imagery, visual system, and process notes expand here.",
          key: `${group.number}-${index}-${slug}`,
          services: [group.title],
          summary:
            locale === "zh"
              ? "作品详情内容整理中。"
              : "Project detail content is being assembled.",
          tags: [item.label],
          title: item.label,
          videos: [],
          year: "2025",
        } satisfies DrawerProject;
      }),
    );

    return flatItems;
  }, [groups, locale, projects]);
  const activeProject = localizedProjects.find((project) => project.key === activeKey) ?? null;
  const hoverProject = localizedProjects.find((project) => project.key === hoverPreview?.key) ?? null;
  const hoverProjectCover = hoverProject ? (hoverPreviewCovers[hoverProject.key] ?? hoverProject.cover) : "";
  const hoverProjectAspect = hoverProject ? (coverAspects[hoverProject.key] ?? 16 / 10) : 16 / 10;
  const isOpen = Boolean(activeProject);

  useEffect(() => {
    const preloadedImages = hoverPreviewCoverSources.map((src) => {
      const image = new window.Image();
      image.decoding = "async";
      image.src = src;
      return image;
    });

    return () => {
      preloadedImages.forEach((image) => {
        image.src = "";
      });
    };
  }, []);

  const updateHoverPreview = useCallback((projectKey: string, clientX: number, clientY: number) => {
    const previewAspect = coverAspects[projectKey] ?? 16 / 10;
    const previewHeight = 212.5;
    const previewWidth = previewHeight * previewAspect;
    const x = Math.min(
      Math.max(clientX + 28, 16),
      Math.max(window.innerWidth - previewWidth - 16, 16),
    );
    const y = Math.min(
      Math.max(clientY - previewHeight * 0.42, 16),
      Math.max(window.innerHeight - previewHeight - 16, 16),
    );

    setHoverPreview({ height: previewHeight, key: projectKey, width: previewWidth, x, y });
  }, [coverAspects]);

  const openProject = useCallback((projectKey: string) => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    document.documentElement.classList.remove("project-detail-page-closing");
    document.documentElement.classList.add("project-detail-page-blurred");
    activeKeyRef.current = projectKey;
    isClosingRef.current = false;
    setIsClosing(false);
    setActiveKey(projectKey);
  }, []);

  const closeProject = useCallback(() => {
    if (!activeKeyRef.current || isClosingRef.current) {
      return;
    }

    isClosingRef.current = true;
    setIsClosing(true);
    document.documentElement.classList.add("project-detail-page-closing");
    document.documentElement.classList.remove("project-detail-page-blurred");

    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
    }

    closeTimeoutRef.current = window.setTimeout(() => {
      activeKeyRef.current = null;
      isClosingRef.current = false;
      setActiveKey(null);
      setIsClosing(false);
      closeTimeoutRef.current = null;
    }, projectDetailExitMs);
  }, []);

  useEffect(() => {
    activeKeyRef.current = activeKey;
    isClosingRef.current = isClosing;
  }, [activeKey, isClosing]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onFeaturedClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const trigger = target.closest("[data-featured-card]");
      const firstProject = localizedProjects[0];
      if (!trigger || !firstProject) {
        return;
      }

      event.preventDefault();
      openProject(firstProject.key);
    };

    document.addEventListener("click", onFeaturedClick);

    return () => {
      document.removeEventListener("click", onFeaturedClick);
    };
  }, [localizedProjects, openProject]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    document.documentElement.classList.add("project-detail-page-blurred");
    const smoother = ScrollSmoother.get();
    const wasSmootherPaused = smoother?.paused() ?? false;
    const lockedPageScrollY = smoother?.scrollTop() ?? window.scrollY;
    let restoreScrollFrame: number | null = null;
    let touchGallery: HTMLElement | null = null;
    let touchLastY: number | null = null;

    smoother?.scrollTop(lockedPageScrollY);
    smoother?.paused(true);

    const restoreBackgroundScroll = () => {
      if (Math.abs(window.scrollY - lockedPageScrollY) < 1) {
        return;
      }

      if (restoreScrollFrame !== null) {
        window.cancelAnimationFrame(restoreScrollFrame);
      }

      restoreScrollFrame = window.requestAnimationFrame(() => {
        smoother?.scrollTop(lockedPageScrollY);
        window.scrollTo(0, lockedPageScrollY);
        restoreScrollFrame = null;
      });
    };

    const lockBackgroundScroll = (event: Event) => {
      event.preventDefault();
      restoreBackgroundScroll();
    };

    const onWheel = (event: WheelEvent) => {
      const gallery = getEventGalleryTarget(event);

      if (!gallery) {
        lockBackgroundScroll(event);
        return;
      }

      const deltaY = getWheelDeltaY(event);

      if (!canScrollGallery(gallery, deltaY)) {
        lockBackgroundScroll(event);
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      gallery.scrollTop += deltaY;
    };

    const onTouchStart = (event: TouchEvent) => {
      touchGallery = getEventGalleryTarget(event);
      touchLastY = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY ?? null;

      if (!touchGallery || touchLastY === null || currentY === null) {
        lockBackgroundScroll(event);
        return;
      }

      const deltaY = touchLastY - currentY;

      if (!canScrollGallery(touchGallery, deltaY)) {
        lockBackgroundScroll(event);
        touchLastY = currentY;
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      touchGallery.scrollTop += deltaY;
      touchLastY = currentY;
    };

    const onTouchEnd = () => {
      touchGallery = null;
      touchLastY = null;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeProject();
        return;
      }

      if (["ArrowDown", "ArrowUp", "End", "Home", "PageDown", "PageUp", " "].includes(event.key)) {
        const activeElement = document.activeElement;
        const gallery =
          activeElement instanceof Element
            ? activeElement.closest<HTMLElement>(".project-detail-gallery")
            : null;

        if (gallery) {
          const keyDeltas: Record<string, number> = {
            ArrowDown: 56,
            ArrowUp: -56,
            PageDown: gallery.clientHeight * 0.84,
            PageUp: gallery.clientHeight * -0.84,
            " ": gallery.clientHeight * 0.84,
          };

          event.preventDefault();

          if (event.key === "Home") {
            gallery.scrollTop = 0;
            return;
          }

          if (event.key === "End") {
            gallery.scrollTop = gallery.scrollHeight;
            return;
          }

          gallery.scrollTop += keyDeltas[event.key] ?? 0;
          return;
        }

        event.preventDefault();
      }
    };

    const onWindowScroll = () => {
      restoreBackgroundScroll();
    };

    window.addEventListener("wheel", onWheel, { capture: true, passive: false });
    window.addEventListener("touchstart", onTouchStart, { capture: true, passive: true });
    window.addEventListener("touchmove", onTouchMove, { capture: true, passive: false });
    window.addEventListener("touchend", onTouchEnd, { capture: true });
    window.addEventListener("touchcancel", onTouchEnd, { capture: true });
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      if (restoreScrollFrame !== null) {
        window.cancelAnimationFrame(restoreScrollFrame);
      }

      document.documentElement.classList.remove("project-detail-page-blurred");
      document.documentElement.classList.remove("project-detail-page-closing");
      smoother?.scrollTop(lockedPageScrollY);
      smoother?.paused(wasSmootherPaused);
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      window.removeEventListener("touchend", onTouchEnd, { capture: true });
      window.removeEventListener("touchcancel", onTouchEnd, { capture: true });
      window.removeEventListener("scroll", onWindowScroll);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeProject, isOpen]);

  return (
    <>
      <div
        className="relative z-20 -mt-3 pt-6 font-[Helvetica,Arial,sans-serif] md:-mt-4 md:pt-6 xl:pt-9 2xl:pt-12"
        data-project-index
      >
        <div
          className="absolute left-0 top-0 h-px w-full origin-left bg-[#ff382e]"
          data-project-index-line
        />
        <div className="grid gap-y-12 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-4 lg:gap-x-16">
          {groups.map((group) => (
            <div key={group.number} className="min-w-0" data-project-index-group>
              <h3 className="project-index-heading mb-6 flex items-baseline gap-[0.08em] font-medium leading-none tracking-normal text-[#fff4e4] transition-colors">
                <span>{group.number}</span>
                <span>{group.title}</span>
              </h3>
              <div className="project-index-items grid font-medium leading-tight tracking-normal text-[#fff4e4]/32">
                {group.items.map((item, itemIndex) => {
                  const projectKey =
                    localizedProjects.find((project) => project.key === slugFromItem(item))?.key ??
                    `${group.number}-${itemIndex}-${slugFromItem(item)}`;

                  return (
                    <button
                      key={`${group.number}-${item.label}-${itemIndex}`}
                      type="button"
                      className="w-fit text-left transition-colors hover:text-[#ff382e]"
                      data-project-index-item
                      onClick={() => openProject(projectKey)}
                      onBlur={() => setHoverPreview(null)}
                      onFocus={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();

                        updateHoverPreview(projectKey, rect.right, rect.top + rect.height / 2);
                      }}
                      onPointerEnter={(event) => {
                        updateHoverPreview(projectKey, event.clientX, event.clientY);
                      }}
                      onPointerLeave={() => setHoverPreview(null)}
                      onPointerMove={(event) => {
                        updateHoverPreview(projectKey, event.clientX, event.clientY);
                      }}
                    >
                      <span className="transition-colors">
                        {String(itemIndex + 1).padStart(2, "0")}/{item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {hoverProject && hoverPreview
        ? createPortal(
            <div
              className="project-index-preview"
              style={{
                aspectRatio: String(hoverProjectAspect),
                height: `${hoverPreview.height}px`,
                transform: `translate3d(${hoverPreview.x}px, ${hoverPreview.y}px, 0)`,
                width: `${hoverPreview.width}px`,
              }}
              aria-hidden="true"
            >
              <Image
                src={hoverProjectCover}
                alt=""
                fill
                className="object-contain"
                onLoad={(event) => {
                  const image = event.currentTarget;

                  if (image.naturalWidth > 0 && image.naturalHeight > 0) {
                    const aspect = image.naturalWidth / image.naturalHeight;

                    setCoverAspects((current) =>
                      current[hoverProject.key] === aspect
                        ? current
                        : { ...current, [hoverProject.key]: aspect },
                    );
                  }
                }}
                sizes="340px"
              />
            </div>,
            document.body,
          )
        : null}

      {activeProject
        ? createPortal(
            <ProjectDetailDrawer
              activeKey={activeProject.key}
              isClosing={isClosing}
              locale={locale}
              onClose={closeProject}
              onSelect={openProject}
              projects={localizedProjects}
            />,
            document.body,
          )
        : null}
    </>
  );
}

function ProjectDetailDrawer({
  activeKey,
  isClosing,
  locale,
  onClose,
  onSelect,
  projects,
}: {
  activeKey: string;
  isClosing: boolean;
  locale: Locale;
  onClose: () => void;
  onSelect: (key: string) => void;
  projects: DrawerProject[];
}) {
  const activeProject = projects.find((project) => project.key === activeKey) ?? projects[0];
  const galleryImages =
    activeProject.images.length > 0 ? activeProject.images : activeProject.videos.length > 0 ? [] : [activeProject.cover];
  const galleryVideos = activeProject.videos;

  return (
    <div
      className="project-detail-overlay"
      data-closing={isClosing ? "true" : undefined}
      data-project-detail-open="true"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="project-detail-scrim"
        aria-label="Close project detail"
        onClick={onClose}
      />
      <div className="project-detail-grow">
        <div className="project-detail-shell">
          <div className="project-detail-rail" />

          <aside className="project-detail-sidebar">
            <button
              type="button"
              className="project-detail-close"
              aria-label="Close project detail"
              onClick={onClose}
            >
              <span />
              <span />
            </button>
            <div className="project-detail-copy">
              <h2 className="project-detail-title project-detail-trail" data-cjk={hasCjk(activeProject.title)}>
                {activeProject.title}
              </h2>
              <p className="project-detail-summary project-detail-trail">{activeProject.intro}</p>
            </div>

            <div className="project-detail-tabs" aria-label="Project list">
              {projects.slice(0, 8).map((project) => (
                <button
                  key={project.key}
                  type="button"
                  className="project-detail-tab"
                  data-active={project.key === activeKey}
                  onClick={() => onSelect(project.key)}
                >
                  <span className="project-detail-tab-shell">
                    <span className="project-detail-tab-label">{project.client || project.title}</span>
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section className="project-detail-gallery" aria-label={`${activeProject.title} media`} tabIndex={0}>
            {galleryVideos.map((video, index) => (
              <ProjectDetailVideo
                activeProjectTitle={activeProject.title}
                index={index}
                key={`${activeProject.key}-${video.src}-${index}`}
                locale={locale}
                video={video}
              />
            ))}
            {galleryImages.map((image, index) => (
              <article className="project-detail-image-row" key={`${activeProject.key}-${image}-${index}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={`${activeProject.title} ${index + 1}`}
                  className="project-detail-image"
                  loading={galleryVideos.length === 0 && index === 0 ? "eager" : "lazy"}
                />
              </article>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}

function ProjectDetailVideo({
  activeProjectTitle,
  index,
  locale,
  video,
}: {
  activeProjectTitle: string;
  index: number;
  locale: Locale;
  video: NonNullable<Project["videos"]>[number];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const syncPlaybackState = useCallback(() => {
    const videoElement = videoRef.current;
    setIsPlaying(Boolean(videoElement && !videoElement.paused && !videoElement.ended));
  }, []);

  const togglePlayback = useCallback(async () => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    if (videoElement.paused || videoElement.ended) {
      try {
        await videoElement.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    videoElement.pause();
    setIsPlaying(false);
  }, []);

  return (
    <article className="project-detail-video-row" data-playing={isPlaying ? "true" : undefined}>
      <video
        ref={videoRef}
        className="project-detail-video"
        controls
        playsInline
        preload="metadata"
        poster={video.poster}
        aria-label={video.title?.[locale] ?? `${activeProjectTitle} video ${index + 1}`}
        onEnded={syncPlaybackState}
        onPause={syncPlaybackState}
        onPlay={syncPlaybackState}
      >
        <source src={video.src} type="video/mp4" />
      </video>
      <button
        type="button"
        className="project-detail-video-play"
        aria-label={locale === "zh" ? "播放视频" : "Play video"}
        onClick={togglePlayback}
      >
        <span aria-hidden="true" />
      </button>
    </article>
  );
}
