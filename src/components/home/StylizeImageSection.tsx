"use client";

/* eslint-disable @next/next/no-img-element */

import type { CSSProperties, MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { STYLIZE_STYLES, type StylizeStyle } from "@/lib/stylizeStyles";

type MiniStatus = "idle" | "ready" | "stylizing" | "done";

type ArchivedPaper = {
  id: number;
  rotation: number;
  scale: number;
  src: string;
  startScale: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
};

const MINI_STYLES: StylizeStyle[] = STYLIZE_STYLES;
const DEBUG_SOURCE_IMAGE = "/images/home/stylize/styles/IS001/image.jpg";
const DEBUG_RESULT_IMAGE = "/images/home/stylize/styles/IS001/example.png";
const PAPER_EJECT_DELAY_MS = 3200;
const PROGRESS_LABELS = ["WIP", "PROCESSING", "DEVELOPING", "RENDERING", "PRINTING"];
const MAX_PENDING_PROGRESS = 92;

const DEBUG_ARCHIVE_POSITIONS = [
  { rotation: -9, scale: 0.98, x: 23, y: 76 },
  { rotation: 7, scale: 0.92, x: 34, y: 70 },
  { rotation: -3, scale: 1.02, x: 48, y: 80 },
];

type FileSystemWritable = {
  close: () => Promise<void>;
  write: (data: Blob) => Promise<void>;
};

type FileSystemHandle = {
  createWritable: () => Promise<FileSystemWritable>;
};

type SavePickerWindow = Window &
  typeof globalThis & {
    showSaveFilePicker?: (options: {
      suggestedName?: string;
      types?: Array<{
        accept: Record<string, string[]>;
        description: string;
      }>;
    }) => Promise<FileSystemHandle>;
  };

const readStylizePayload = async (response: Response) => {
  const text = await response.text();

  if (!text) {
    return {
      error: response.ok ? "Stylize API returned an empty response" : `Stylize API returned ${response.status} with no body`,
    };
  }

  try {
    return JSON.parse(text) as { image?: string; error?: string };
  } catch {
    return {
      error: text.slice(0, 220),
    };
  }
};

const createDebugArchivedPapers = (count: number): ArchivedPaper[] =>
  Array.from({ length: count }, (_, index) => {
    const position = DEBUG_ARCHIVE_POSITIONS[index % DEBUG_ARCHIVE_POSITIONS.length];

    return {
      id: index + 1,
      rotation: position.rotation,
      scale: position.scale,
      src: DEBUG_RESULT_IMAGE,
      startScale: 2.05,
      startX: 34,
      startY: 51,
      x: position.x,
      y: position.y,
    };
  });

type StylizeImageSectionProps = {
  showFooter?: boolean;
  variant?: "section" | "panel";
};

export function StylizeImageSection({
  showFooter = true,
  variant = "section",
}: StylizeImageSectionProps = {}) {
  const [activeStyle, setActiveStyle] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerStaging, setDrawerStaging] = useState(false);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [archivedPapers, setArchivedPapers] = useState<ArchivedPaper[]>([]);
  const [awaitingCameraReset, setAwaitingCameraReset] = useState(false);
  const [paperDeveloped, setPaperDeveloped] = useState(false);
  const [paperPrinting, setPaperPrinting] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [progressTick, setProgressTick] = useState(0);
  const [fileName, setFileName] = useState("lll-space-image");
  const [status, setStatus] = useState<MiniStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputFileRef = useRef<File | null>(null);
  const printPaperRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const styleScrollRef = useRef<HTMLDivElement | null>(null);
  const archiveIdRef = useRef(0);
  const sourceUrlRef = useRef<string | null>(null);
  const drawerTimerRef = useRef<number | null>(null);
  const printTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (drawerTimerRef.current) {
        window.clearTimeout(drawerTimerRef.current);
      }

      if (printTimerRef.current) {
        window.clearTimeout(printTimerRef.current);
      }

      if (sourceUrlRef.current) {
        URL.revokeObjectURL(sourceUrlRef.current);
      }
    };
  }, []);

  const openDrawer = (staged = true) => {
    if (drawerOpen) {
      return;
    }

    if (drawerTimerRef.current) {
      window.clearTimeout(drawerTimerRef.current);
      drawerTimerRef.current = null;
    }

    if (!staged) {
      setDrawerStaging(false);
      setDrawerOpen(true);
      return;
    }

    setDrawerStaging(true);
    drawerTimerRef.current = window.setTimeout(() => {
      setDrawerOpen(true);
      setDrawerStaging(false);
      drawerTimerRef.current = null;
    }, 420);
  };

  useEffect(() => {
    if (!["127.0.0.1", "localhost"].includes(window.location.hostname)) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const archiveCount = Math.min(Math.max(Number(params.get("debugArchive") ?? 0), 0), 8);

    if (params.get("debugPrint") !== "1" && archiveCount === 0) {
      return;
    }

    const timers: number[] = [];
    const scrollToDebugSection = () => {
      const section = document.querySelector<HTMLElement>("[data-stylize-section]");

      if (!section) {
        return;
      }

      void import("gsap/ScrollSmoother")
        .then(({ ScrollSmoother }) => {
          const smoother = ScrollSmoother.get();

          if (smoother) {
            smoother.scrollTo(section, false, "top 88px");
            return;
          }

          section.scrollIntoView({ block: "start" });
        })
        .catch(() => {
          section.scrollIntoView({ block: "start" });
        });
    };

    const frame = window.requestAnimationFrame(() => {
      setDrawerStaging(false);
      setDrawerOpen(true);
      setActiveStyle(0);
      setSourceUrl(DEBUG_SOURCE_IMAGE);
      setResultUrl(archiveCount > 0 ? null : DEBUG_RESULT_IMAGE);
      setArchivedPapers(createDebugArchivedPapers(archiveCount));
      setAwaitingCameraReset(false);
      setPaperPrinting(false);
      setProgressValue(0);
      setFileName("debug-print-preview");
      setError(null);
      setStatus("ready");
      timers.push(window.setTimeout(scrollToDebugSection, 320));
      timers.push(window.setTimeout(scrollToDebugSection, 900));
      if (archiveCount > 0) {
        return;
      }

      timers.push(
        window.setTimeout(() => {
          setProgressValue(8);
          setStatus("stylizing");
          timers.push(window.setTimeout(() => setPaperPrinting(true), PAPER_EJECT_DELAY_MS));
        }, 760),
      );
    });

    return () => {
      window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const list = target.closest<HTMLElement>(".stylize-style-scroll");

      if (!list || list !== styleScrollRef.current || list.scrollHeight <= list.clientHeight) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      list.scrollTop += event.deltaY;
    };

    window.addEventListener("wheel", onWheel, { capture: true, passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true });
    };
  }, []);

  useEffect(() => {
    if (!resultUrl || !paperPrinting) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setPaperDeveloped(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [paperPrinting, resultUrl]);

  useEffect(() => {
    if (status !== "stylizing") {
      return;
    }

    const timer = window.setInterval(() => {
      setProgressTick((tick) => tick + 1);
    }, 1600);

    return () => {
      window.clearInterval(timer);
    };
  }, [status]);

  useEffect(() => {
    if (status !== "stylizing") {
      return;
    }

    const timer = window.setInterval(() => {
      setProgressValue((value) => {
        if (value >= MAX_PENDING_PROGRESS) {
          return MAX_PENDING_PROGRESS;
        }

        return Math.min(MAX_PENDING_PROGRESS, value + 3);
      });
    }, 1200);

    return () => {
      window.clearInterval(timer);
    };
  }, [status]);

  const active = MINI_STYLES[activeStyle] ?? MINI_STYLES[0];
  const previewStyle = active;
  const previewBackground = useMemo(
    () => ({
      "--stylize-active-tint": previewStyle.tint,
      "--stylize-active-secondary": previewStyle.secondary,
      "--stylize-active-bg": previewStyle.background,
    }) as CSSProperties,
    [previewStyle.background, previewStyle.secondary, previewStyle.tint],
  );
  const stageState = status === "stylizing" ? "printing" : status === "done" ? "done" : sourceUrl ? "loaded" : "idle";

  const getArchiveStart = () => {
    const paper = printPaperRef.current;
    const stage = stageRef.current;

    if (!paper || !stage) {
      return { startScale: 2.05, startX: 34, startY: 51 };
    }

    const paperRect = paper.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const archiveBaseWidth = Math.min(Math.max(126, window.innerWidth * 0.135), 186);

    return {
      startScale: Number((paperRect.width / archiveBaseWidth).toFixed(3)),
      startX: Number((((paperRect.left + paperRect.width / 2 - stageRect.left) / stageRect.width) * 100).toFixed(3)),
      startY: Number((((paperRect.top + paperRect.height / 2 - stageRect.top) / stageRect.height) * 100).toFixed(3)),
    };
  };

  const createArchivedPaper = (src: string): ArchivedPaper => {
    archiveIdRef.current += 1;
    const start = getArchiveStart();

    return {
      id: archiveIdRef.current,
      rotation: Math.round(-12 + Math.random() * 24),
      scale: Number((0.9 + Math.random() * 0.16).toFixed(2)),
      src,
      startScale: start.startScale,
      startX: start.startX,
      startY: start.startY,
      x: Math.round(15 + Math.random() * 35),
      y: Math.round(64 + Math.random() * 16),
    };
  };

  const archivePrintedResult = () => {
    if (!resultUrl || (!paperPrinting && status !== "done")) {
      return false;
    }

    setArchivedPapers((papers) => [...papers, createArchivedPaper(resultUrl)]);
    setResultUrl(null);
    setPaperDeveloped(false);
    setPaperPrinting(false);
    setProgressValue(100);
    setAwaitingCameraReset(true);
    setError(null);
    return true;
  };

  const resetCameraForNextRound = () => {
    setAwaitingCameraReset(false);
    setProgressValue(0);
    setStatus(sourceUrl ? "ready" : "idle");
    setError(null);
  };

  const handleStudioClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (!drawerOpen) {
      openDrawer();
      return;
    }

    if (target.closest("[data-stylize-drawer], [data-stylize-camera], button, input, label, a")) {
      return;
    }

    if (awaitingCameraReset) {
      resetCameraForNextRound();
      return;
    }

    archivePrintedResult();
  };

  const openDrawerBeforeUpload = (event: MouseEvent<HTMLElement>) => {
    if (drawerOpen) {
      return false;
    }

    event.preventDefault();
    event.stopPropagation();
    openDrawer();
    return true;
  };

  const processFile = async (file: File) => {
    inputFileRef.current = file;
    setError(null);
    setResultUrl(null);
    setAwaitingCameraReset(false);
    setPaperDeveloped(false);
    setPaperPrinting(false);
    setProgressValue(0);
    setActiveStyle(0);
    openDrawer(false);
    setStatus("ready");
    setFileName(file.name.replace(/\.[^.]+$/, "") || "lll-space-image");

    if (sourceUrlRef.current) {
      URL.revokeObjectURL(sourceUrlRef.current);
    }

    const nextUrl = URL.createObjectURL(file);
    sourceUrlRef.current = nextUrl;
    setSourceUrl(nextUrl);
  };

  const generate = async () => {
    const inputFile = inputFileRef.current;

    if (!inputFile) {
      fileInputRef.current?.click();
      return;
    }

    if (!active) {
      openDrawer();
      setError("PICK A STYLE FIRST");
      return;
    }

    setError(null);
    setResultUrl(null);
    setPaperDeveloped(false);
    setPaperPrinting(false);
    setProgressValue(8);
    setProgressTick(0);
    setAwaitingCameraReset(false);
    setStatus("stylizing");

    if (printTimerRef.current) {
      window.clearTimeout(printTimerRef.current);
    }

    printTimerRef.current = window.setTimeout(() => {
      setPaperPrinting(true);
      printTimerRef.current = null;
    }, PAPER_EJECT_DELAY_MS);

    try {
      const formData = new FormData();
      formData.append("image", inputFile, inputFile.name || `${fileName}.png`);
      formData.append("styleId", active.id);
      formData.append("quality", "high");

      const response = await fetch("/api/stylize", {
        body: formData,
        method: "POST",
      });
      const payload = await readStylizePayload(response);

      if (!response.ok || !payload.image) {
        throw new Error(payload.error ?? "Image edit failed");
      }

      const nextResult = payload.image;

      setResultUrl(nextResult);
      setProgressValue(100);
      setStatus("done");
    } catch (apiError) {
      if (printTimerRef.current) {
        window.clearTimeout(printTimerRef.current);
        printTimerRef.current = null;
      }

      setError(apiError instanceof Error ? apiError.message : "STYLE FAILED");
      setResultUrl(null);
      setPaperDeveloped(false);
      setPaperPrinting(false);
      setProgressValue(0);
      setStatus(sourceUrl ? "ready" : "idle");
    }
  };

  const downloadResult = async () => {
    if (!downloadHref) {
      return;
    }

    setError(null);
    const suggestedName = `${fileName}-${active?.id ?? "style"}.png`;

    try {
      const savePicker = (window as SavePickerWindow).showSaveFilePicker;
      const fileHandle = savePicker
        ? await savePicker({
            suggestedName,
            types: [
              {
                accept: { "image/png": [".png"] },
                description: "PNG image",
              },
            ],
          })
        : null;
      const response = await fetch(downloadHref);

      if (!response.ok) {
        throw new Error(`Download failed with ${response.status}`);
      }

      const blob = await response.blob();

      if (fileHandle) {
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        archivePrintedResult();
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = suggestedName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      archivePrintedResult();
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "DOWNLOAD FAILED");
    }
  };

  const styleTitle = `${String(activeStyle + 1).padStart(2, "0")} ${active.label}`;
  const resultFileName = `${fileName}-${active?.id ?? "style"}.png`;
  const resultIsRemote = Boolean(resultUrl && /^https?:\/\//.test(resultUrl));
  const resultProxyUrl =
    resultUrl && resultIsRemote
      ? `/api/stylize/download?url=${encodeURIComponent(resultUrl)}&filename=${encodeURIComponent(resultFileName)}`
      : resultUrl;
  const downloadHref = resultProxyUrl;
  const resultDisplayUrl = resultProxyUrl && resultIsRemote ? `${resultProxyUrl}&inline=true` : resultProxyUrl;
  const cameraScreenUrl = sourceUrl;
  const printPaperUrl = resultDisplayUrl;
  const displayedProgress = status === "stylizing" ? progressValue : status === "done" || awaitingCameraReset ? 100 : 0;
  const progressLabel = `${PROGRESS_LABELS[progressTick % PROGRESS_LABELS.length]}${".".repeat((progressTick % 3) + 1)}`;
  const statusLabel =
    awaitingCameraReset
      ? "CLICK TO RESET"
      : status === "stylizing"
      ? progressLabel
      : status === "done"
        ? "YESS!!"
        : sourceUrl && active
          ? "READY TO STYLE"
          : sourceUrl
            ? "PICK A STYLE"
            : "UPLOAD AN IMAGE";
  const canStylize = Boolean(sourceUrl && active && status !== "stylizing" && !awaitingCameraReset);
  const rootClassName =
    variant === "panel"
      ? "projects-horizontal-panel projects-horizontal-stylize-panel"
      : "stylize-section relative";
  const isPanel = variant === "panel";
  const RootTag = isPanel ? "div" : "section";

  return (
    <RootTag
      id={isPanel ? undefined : "stylize-image"}
      className={rootClassName}
      data-stylize-section={isPanel ? undefined : true}
    >
      <div
        className={`stylize-studio stylize-mini-studio relative mx-auto overflow-hidden rounded-[24px] ${
          drawerOpen ? "is-drawer-open" : "is-drawer-closed"
        } is-${stageState} ${paperPrinting ? "is-paper-printing" : ""} ${
          awaitingCameraReset ? "is-awaiting-reset" : ""
        } ${paperDeveloped ? "is-paper-developed" : ""} ${drawerStaging ? "is-drawer-staging" : ""}`}
        data-stylize-panel
        onClick={handleStudioClick}
        style={previewBackground}
      >
        <div className="stylize-mini-workbench">
          <div ref={stageRef} className="stylize-mini-stage" data-stylize-stage>
            <div className="stylize-print-archive" aria-hidden="true">
              {archivedPapers.map((paper, index) => (
                <div
                  key={paper.id}
                  className="stylize-archive-paper"
                  style={
                    {
                      "--archive-index": index,
                      "--archive-rotation": `${paper.rotation}deg`,
                      "--archive-scale": paper.scale,
                      "--archive-start-scale": paper.startScale,
                      "--archive-start-x": `${paper.startX}%`,
                      "--archive-start-y": `${paper.startY}%`,
                      "--archive-x": `${paper.x}%`,
                      "--archive-y": `${paper.y}%`,
                    } as CSSProperties
                  }
                >
                  <img src={paper.src} alt="" />
                </div>
              ))}
            </div>

            <div className="stylize-camera-wrap stylize-mini-camera-wrap" data-stylize-camera>
              <img src="/images/home/stylize/camera.svg" alt="" className="stylize-camera-image" />
              <label
                className="stylize-camera-hit stylize-camera-screen"
                aria-label="Upload image from camera screen"
                onClick={(event) => {
                  openDrawerBeforeUpload(event);
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void processFile(file);
                    }
                  }}
                />
                {cameraScreenUrl ? (
                  <img src={cameraScreenUrl} alt="" />
                ) : (
                  <span className="stylize-camera-upload-prompt" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path d="M12 15V4" />
                      <path d="M7.5 8.5 12 4l4.5 4.5" />
                      <path d="M5 14v4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V14" />
                    </svg>
                    <span>Upload your photo here</span>
                  </span>
                )}
              </label>
              <button
                type="button"
                className="stylize-camera-hit stylize-camera-plus"
                aria-label="Upload image"
                onClick={(event) => {
                  if (openDrawerBeforeUpload(event)) {
                    return;
                  }

                  fileInputRef.current?.click();
                }}
              />
              <button
                type="button"
                className="stylize-camera-hit stylize-camera-shutter"
                aria-label="Stylize image"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();

                  if (status === "stylizing") {
                    return;
                  }

                  if (!sourceUrl) {
                    fileInputRef.current?.click();
                    return;
                  }

                  if (!active) {
                    openDrawer();
                    setError("PICK A STYLE FIRST");
                    return;
                  }

                  void generate();
                }}
              />
            </div>

            <div className="stylize-print-bay" data-stylize-print>
              <div ref={printPaperRef} className="stylize-print-paper">
                {printPaperUrl ? <img src={printPaperUrl} alt="" /> : null}
                <span className="stylize-print-developer" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div
            className="stylize-drawer"
            data-stylize-drawer
            onClick={() => {
              if (!drawerOpen) {
                openDrawer();
              }
            }}
          >
            <div className="stylize-mini-console">
              <div className="stylize-console-main">
                <div className="stylize-mini-status">
                  <span>{styleTitle}</span>
                </div>
                <div className="stylize-style-hero">
                  <img
                    src={`/images/home/stylize/styles/${previewStyle.id}/example.png`}
                    alt=""
                  />
                </div>
                <div className="stylize-mini-copy">
                  <p>-{error ?? statusLabel}</p>
                  <div className="stylize-mini-controls">
                    <div
                      className="stylize-mini-progress"
                      aria-label="Stylize generation progress"
                      aria-valuemax={100}
                      aria-valuemin={0}
                      aria-valuenow={displayedProgress}
                      role="progressbar"
                    >
                      <div className="stylize-mini-progress-track" aria-hidden="true">
                        <span style={{ width: `${displayedProgress}%` }} />
                      </div>
                      <span className="stylize-mini-progress-value">{displayedProgress}%</span>
                    </div>
                    <div className="stylize-mini-actions">
                      <button
                        className={canStylize ? "is-action-ready" : ""}
                        type="button"
                        onClick={() => void generate()}
                        disabled={!canStylize}
                      >
                        {status === "stylizing" ? "Wait" : "Stylize"}
                      </button>
                      <button
                        className={resultUrl ? "is-action-ready is-download-ready" : ""}
                        aria-disabled={!resultUrl}
                        type="button"
                        disabled={!resultUrl}
                        onClick={(event) => {
                          if (!resultUrl) {
                            event.preventDefault();
                            return;
                          }
                          void downloadResult();
                        }}
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside
              className="stylize-tool-rail stylize-mini-rail"
              aria-label="Style presets"
              data-stylize-rail
              onClick={() => {
                if (!drawerOpen) {
                  setDrawerOpen(true);
                }
              }}
            >
              <button
                type="button"
                className="stylize-drawer-peek"
                aria-label={drawerOpen ? "Close style drawer" : "Open style drawer"}
                onClick={() => {
                  if (drawerOpen) {
                    if (drawerTimerRef.current) {
                      window.clearTimeout(drawerTimerRef.current);
                      drawerTimerRef.current = null;
                    }
                    setDrawerOpen(false);
                    setDrawerStaging(false);
                    return;
                  }

                  openDrawer();
                }}
              >
                <span>{drawerOpen ? "Close" : "01 Name"}</span>
              </button>
              <div ref={styleScrollRef} className="stylize-style-scroll">
                {MINI_STYLES.map((style, index) => (
                  <button
                    key={style.id}
                    type="button"
                    aria-label={style.label}
                    aria-pressed={activeStyle === index}
                    className={`stylize-style-thumb stylize-mini-style-thumb ${
                      style.id === "IS043" ? "is-fill-thumbnail" : ""
                    }`}
                    style={
                      {
                        "--style-tint": style.tint,
                        "--style-secondary": style.secondary,
                        "--style-bg": style.background,
                      } as CSSProperties
                    }
                    onClick={() => {
                      openDrawer();
                      setActiveStyle(index);
                      setError(null);
                      if (resultUrl) {
                        setResultUrl(null);
                        setPaperPrinting(false);
                        setStatus(sourceUrl ? "ready" : "idle");
                      }
                    }}
                  >
                    {style.id === "IS043" ? (
                      <span className="stylize-style-thumb-frame">
                        <img src={`/images/home/stylize/styles/${style.id}/example.png`} alt="" />
                      </span>
                    ) : (
                      <img src={`/images/home/stylize/styles/${style.id}/example.png`} alt="" />
                    )}
                  </button>
                ))}
                <div className="stylize-style-thumb-spacer" aria-hidden="true" />
              </div>
              <span className="stylize-style-more-indicator" aria-hidden="true" />
            </aside>
          </div>
        </div>
      </div>

      {showFooter ? <StylizeFooterPanels /> : null}
    </RootTag>
  );
}

export function StylizeFooterPanels() {
  return (
    <div className="stylize-footer-panels" data-contact-panel>
      <div className="stylize-contact-panel">
        <svg
          className="stylize-contact-shape"
          viewBox="0 0 542 265"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M362.566 0.5L298.767 49.8506L298.573 50.001V191.224L298.99 191.294L540.809 231.964V264.312H0.5V0.5H362.566Z"
            fill="#2B2B2B"
            stroke="#FE3B2E"
          />
        </svg>
        <div className="stylize-contact-content">
          <div className="stylize-contact-main">
            <p className="stylize-contact-title">Meet &amp; Hang Out</p>
            <div className="stylize-contact-links">
              <p>
                <span aria-hidden="true">📮</span>
                <span>：liangisrhys@gmail.com</span>
              </p>
              <p>
                <span aria-hidden="true">📕</span>
                <span>：Liangday01</span>
              </p>
              <p>
                <span aria-hidden="true">📸</span>
                <span>：Liangday01</span>
              </p>
            </div>
          </div>
          <p className="stylize-contact-location">Shanghai, China</p>
        </div>
      </div>

      <div className="stylize-download-panel" aria-label="Download">
        <svg
          className="stylize-contact-shape"
          viewBox="0 0 529 265"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M366.427 0.5L462.252 29.9463L528 86.2295V180.827L462.256 238.548L366.432 264.312H0.5V0.5H366.427Z"
            fill="#2B2B2B"
            stroke="#FE3B2E"
          />
        </svg>
        <div className="stylize-download-content">
          <p className="stylize-contact-title">Download</p>
          <div className="stylize-contact-links">
            <p>
              <span aria-hidden="true">📑</span>
              <span>：Resume</span>
            </p>
            <p>
              <span aria-hidden="true">📒</span>
              <span>：Portfolio</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
