import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Aboreto } from "next/font/google";
import { HeroCursorTrail } from "@/components/home/HeroCursorTrail";
import { HeroElasticGrid } from "@/components/home/HeroElasticGrid";
import { HeroImageSequence } from "@/components/home/HeroImageSequence";
import { HeroEmojiBurst } from "@/components/home/HeroEmojiBurst";
import { IntroScaleBlock } from "@/components/home/IntroScaleBlock";
import { IntroSpaceStage } from "@/components/home/IntroSpaceStage";
import { LiveLocalTime } from "@/components/layout/LiveLocalTime";
import { StylizeFooterPanels, StylizeImageSection } from "@/components/home/StylizeImageSection";
import { HomeMotion } from "@/components/motion/HomeMotion";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { VerticalCutRevealLine } from "@/components/ui/vertical-cut-reveal";
import { ProjectIndexWithDrawer } from "@/components/work/ProjectIndexWithDrawer";
import { getProjects } from "@/lib/projects";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

const markItems = [
  { letter: "p", src: "/images/home/portfolio-letters/p.svg", width: 96, height: 68 },
  { letter: "o", src: "/images/home/portfolio-letters/o.svg", width: 71, height: 68 },
  { letter: "r", src: "/images/home/portfolio-letters/r.svg", width: 101, height: 68 },
  { letter: "t", src: "/images/home/portfolio-letters/t.svg", width: 56, height: 68 },
  { letter: "f", src: "/images/home/portfolio-letters/f.svg", width: 170, height: 68 },
  { letter: "o", src: "/images/home/portfolio-letters/o-1.svg", width: 68, height: 68 },
  { letter: "l", src: "/images/home/portfolio-letters/l.svg", width: 138, height: 68 },
  { letter: "i", src: "/images/home/portfolio-letters/i.svg", width: 105, height: 105 },
  { letter: "o", src: "/images/home/portfolio-letters/o-2.svg", width: 102, height: 68 },
] as const;

const aboreto = Aboreto({
  subsets: ["latin"],
  weight: "400",
});

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const projects = getProjects();
  const localized = locale as "zh" | "en";
  const t = await getTranslations({ locale, namespace: "home" });
  const projectIndexGroups = [
    {
      number: "01",
      title: "Art Design of Interior Display",
      items: [
        {
          label: localized === "zh" ? "爱达魔都号陈设设计" : "Adora Magic City",
          href: "/work/adora-magic-city",
        },
      ],
    },
    {
      number: "02",
      title: "Visual Identity",
      items: [
        { label: "Dokie", href: "/work/dokie" },
        { label: "Fabrie", href: "/work/fabrie" },
        { label: localized === "zh" ? "黎感" : "Leefon", href: "/work/leefon" },
        { label: "NLA" },
        { label: "Dormie" },
      ],
    },
    {
      number: "03",
      title: "Motions & others",
      items: [
        {
          label: localized === "zh" ? "饿了么 TVC" : "Ele.me TVC",
          href: "/work/eleme-motion",
        },
      ],
    },
    {
      number: "04",
      title: "PPPP",
      items: [
        { label: localized === "zh" ? "皇家赌场" : "Royal Casino", href: "/work/royal-casino" },
        { label: "Glimpse", href: "/work/glimpse" },
        { label: "The Space", href: "/work/the-space" },
        { label: localized === "zh" ? "道阻且长" : "Long Road", href: "/work/long-road" },
        { label: localized === "zh" ? "去看看这个世界" : "To See The World", href: "/work/see-the-world" },
        { label: "E.I.G.B.A", href: "/work/eigba" },
        { label: "Invisible String", href: "/work/invisible-string" },
        { label: "Square", href: "/work/square" },
      ],
    },
  ];

  return (
    <HomeMotion>
      <div className="site-dot-field" aria-hidden="true" />
      <TopTelemetry />
      <div className="hero-red-field" data-hero-red-field aria-hidden="true" />
      <HeroIntroTitle />
      <SmoothScroll>
        <main className="home-canvas min-h-screen text-foreground">
          <section className="relative z-40 w-full">
          <div className="relative z-40 h-[300svh]" data-hero-scroll>
            <div className="hero-stage relative z-40 flex items-start justify-center overflow-visible" data-hero-stage>
              <HeroGallery />
            </div>
          </div>
          </section>

          <IntroSection title={t("title")} />

          <div className="home-projects-surface relative z-30 px-5 sm:px-8 lg:px-12">
          <section
            className="relative mt-0 min-h-[calc(100svh-76px)] overflow-visible pb-20 pt-[clamp(38px,5.8svh,72px)] xl:pt-[clamp(56px,6.4svh,90px)] 2xl:pt-[clamp(68px,7.2svh,108px)]"
            data-home-section
          >
            <div
              className="relative z-10 grid min-h-[calc(100svh-92px)] content-start gap-1 px-0 xl:gap-3 2xl:gap-4"
              data-featured-pin
            >
            <div
              className="relative z-[90] text-center"
              data-featured-heading
            >
              <h2 className="font-[Helvetica,Arial,sans-serif] text-base font-medium tracking-normal text-[#fff4e4]">
                Some Projects
              </h2>
            </div>

            <div className="mt-6 projects-horizontal-viewport md:mt-7 xl:mt-8 2xl:mt-10" data-projects-horizontal-viewport>
              <div className="projects-horizontal-track" data-projects-horizontal-track>
            <div
              className="projects-horizontal-panel projects-horizontal-featured-panel relative z-10 flex min-h-0 items-center justify-center py-2 sm:py-3"
              data-featured-stage
            >
              <div className="featured-project-frame relative mx-auto" data-featured-frame>
                <button
                  type="button"
                  className="featured-project-scale group block text-left text-[#202020]"
                  data-featured-card
                >
                  <article className="featured-project-canvas relative overflow-visible">
                <div
                  className="absolute left-[6.8%] top-[calc(-0.5%_-_50px)] z-[6] h-[118.8%] w-[50.9%] mix-blend-screen"
                  data-trapezoid-piece
                  data-trapezoid-light
                >
                  <svg
                    viewBox="0 0 764 772"
                    className="h-full w-full"
                    aria-hidden="true"
                  >
                    <path
                      data-trapezoid-light-path
                      d="M492.5 742.5H587L763.5 0H309.5L0 81.5L430 771.5L492.5 742.5Z"
                      fill="url(#trapezoid-light-gradient)"
                    />
                    <path
                      data-trapezoid-light-collapsed
                      d="M492.5 742.5H587L492.5 771.5H430Z"
                      className="hidden"
                    />
                    <defs>
                      <linearGradient
                        id="trapezoid-light-gradient"
                        x1="80"
                        x2="500"
                        y1="48"
                        y2="778.5"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0" stopColor="white" stopOpacity="0" />
                        <stop offset="0.32" stopColor="#7F5A55" stopOpacity="0.55" />
                        <stop offset="0.72" stopColor="#FE3B2E" />
                        <stop offset="1" stopColor="#3E3E3E" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div
                  className="absolute left-[6.8%] top-[calc(-0.5%_-_50px)] z-[7] h-[12.5%] w-[51.4%]"
                  data-trapezoid-piece
                  data-trapezoid-top
                >
                  <svg
                    viewBox="0 0 771 81"
                    className="h-full w-full"
                    aria-hidden="true"
                  >
                    <path
                      data-trapezoid-top-path
                      d="M766.713 0.5L456.191 79.542H3.99023L314.512 0.5H766.713Z"
                      fill="#222222"
                      stroke="#D9D9D9"
                    />
                  </svg>
                </div>
                <div
                  className="absolute left-[35.45%] top-[calc(122.6%_-_105px)] z-[8] h-[4.6%] w-[10.46%]"
                  data-trapezoid-piece
                  data-trapezoid-bottom
                >
                  <svg
                    viewBox="0 0 161 30"
                    className="h-full w-full"
                    aria-hidden="true"
                  >
                    <path
                      d="M157.931 0.5L95.9463 29.2295H2.26855L64.2529 0.5H157.931Z"
                      fill="#2F1F1D"
                      stroke="#FE3B2E"
                    />
                  </svg>
                </div>
                <StartLinesLayer />
                <StartRedRayLayer />

                <div
                  className="absolute left-[2.6%] top-[calc(12%_-_24px)] z-0 h-[55%] w-[58%]"
                  data-featured-part
                  data-featured-grid
                  data-from-x="2"
                  data-from-y="-16"
                  data-from-scale="1"
                  data-from-width="35.5%"
                  data-from-height="26.3%"
                >
                  <div
                    className="absolute inset-0 border border-[#7ef3f0]/90 bg-[linear-gradient(rgba(126,243,240,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(126,243,240,0.7)_1px,transparent_1px)] bg-[size:19px_19px]"
                    data-featured-entry-lag
                    data-featured-lag="0.22"
                  />
                </div>

                <div
                  className="absolute right-[0%] top-[2%] z-30 h-[55%] w-[72.8%]"
                  data-featured-part
                  data-featured-red
                  data-from-x="8"
                  data-from-y="15"
                  data-from-scale="0.82"
                >
                  <div className="absolute inset-0" data-featured-entry-lag data-featured-lag="0.16">
                    <Image
                      src="/images/home/projects/art-display.svg"
                      alt=""
                      fill
                      className="object-fill"
                      sizes="1080px"
                      aria-hidden="true"
                    />
                    <div className="absolute right-6 top-6 w-[48%] overflow-hidden text-right text-[#202020]">
                      <p
                        className={`${aboreto.className} text-[clamp(1.05rem,1.72vw,32px)] font-normal leading-[0.96]`}
                      >
                        Art Design of
                        <br />
                        Interior Display
                      </p>
                      <p className="mt-2 font-['Helvetica_Neue_Condensed_Bold','Helvetica_Neue',Helvetica,Arial,sans-serif] text-[clamp(2.2rem,3.4vw,64px)] font-black leading-none">
                        01
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="absolute bottom-[calc(24%+72px)] right-[calc(4.6%+52px)] z-40 h-[32%] w-[55%]"
                  data-featured-part
                  data-featured-black
                  data-from-x="-15"
                  data-from-y="107"
                  data-from-scale="1"
                >
                  <div className="absolute inset-0" data-featured-entry-lag data-featured-lag="0.14">
                    <Image
                      src="/images/home/projects/visual.svg"
                      alt=""
                      fill
                      className="z-20 object-fill"
                      sizes="830px"
                      aria-hidden="true"
                    />
                    <div className="absolute right-6 top-6 z-30 w-[48%] overflow-hidden text-right">
                      <p className="font-['Times_New_Roman',Times,serif] text-[clamp(1.7rem,2.4vw,42px)] italic leading-[0.95] text-[#fe3b2e]">
                        Visual
                        <br />
                        Identity
                      </p>
                      <p className="mt-2 font-['Helvetica_Neue_Condensed_Bold','Helvetica_Neue',Helvetica,Arial,sans-serif] text-[clamp(2.2rem,3.4vw,64px)] font-black leading-none text-[#fff4e4]">
                        02
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="absolute left-[calc(34.5%_-_108px)] top-[calc(23%_-_56px)] z-50 h-[17.5%] aspect-[206/113]"
                  data-featured-part
                  data-from-x="17"
                  data-from-y="-72"
                  data-from-scale="1"
                >
                  <div className="absolute inset-0" data-featured-entry-lag data-featured-lag="0.18">
                    <Image
                      src="/images/home/projects/motion-03.svg"
                      alt=""
                      fill
                      className="object-contain"
                      sizes="210px"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div
                  className="absolute bottom-[calc(5.2%_+_48px)] left-[4.6%] z-[72] h-[24%] aspect-square"
                  data-featured-part
                  data-featured-green
                  data-from-x="752"
                  data-from-y="-135"
                  data-from-scale="0.5"
                >
                  <Image
                    src="/images/home/projects/shape-green-circle.svg"
                    alt=""
                    fill
                    className="object-contain"
                    sizes="130px"
                    aria-hidden="true"
                  />
                </div>
                <div
                  className="absolute bottom-[calc(14.5%_+_48px)] left-[9.8%] z-10 h-[12.8%] w-[29.4%]"
                  data-featured-part
                  data-featured-ray-target="purple"
                  data-from-x="172"
                  data-from-y="374"
                  data-from-scale="0.55"
                >
                  <div className="absolute inset-0" data-featured-entry-lag data-featured-lag="0.32">
                    <Image
                      src="/images/home/projects/shape-purple-pill.svg"
                      alt=""
                      fill
                      className="object-fill"
                      sizes="390px"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div
                  className="absolute bottom-[calc(24.7%_+_48px)] left-[8.2%] z-30 h-[10.8%] w-[25.6%]"
                  data-featured-part
                  data-from-x="48"
                  data-from-y="353"
                  data-from-scale="0.65"
                >
                  <div className="absolute inset-0" data-featured-entry-lag data-featured-lag="0.26">
                    <Image
                      src="/images/home/projects/shape-yellow-bar.svg"
                      alt=""
                      fill
                      className="object-fill"
                      sizes="390px"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div
                  className="absolute bottom-[calc(27.8%_+_48px)] left-[13.3%] z-[66] h-[20.5%] aspect-square"
                  data-featured-part
                  data-from-x="27"
                  data-from-y="-127"
                  data-from-scale="0.84"
                >
                  <div className="absolute inset-0" data-featured-entry-lag data-featured-lag="0.2">
                    <Image
                      src="/images/home/projects/shape-blue-badge.svg"
                      alt=""
                      fill
                      className="object-contain"
                      sizes="140px"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div
                  className="absolute bottom-[calc(27.4%_+_48px)] left-[26.6%] z-[74] h-[17.2%] aspect-[123/107]"
                  data-featured-part
                  data-from-x="-7"
                  data-from-y="90"
                  data-from-scale="0.9"
                >
                  <div className="absolute inset-0" data-featured-entry-lag data-featured-lag="0.28">
                    <Image
                      src="/images/home/projects/shape-blue-star.svg"
                      alt=""
                      fill
                      className="object-contain"
                      sizes="130px"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div
                  className="absolute bottom-[calc(15.6%_+_48px)] left-[21.8%] z-[70] h-[14.2%] aspect-square"
                  data-featured-part
                  data-featured-ray-target="heart"
                  data-from-x="923"
                  data-from-y="281"
                  data-from-scale="1.1"
                >
                  <div className="absolute inset-0" data-featured-entry-lag data-featured-lag="0.36">
                    <Image
                      src="/images/home/projects/burning-heart.svg"
                      alt=""
                      fill
                      className="object-contain"
                      sizes="140px"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div
                  className="absolute bottom-[calc(17.2%_+_48px)] left-[32.9%] z-[76] h-[21.6%] aspect-[76/66]"
                  data-featured-part
                  data-featured-ray-target="triangle"
                  data-from-x="453"
                  data-from-y="2"
                  data-from-scale="0.62"
                >
                  <div className="absolute inset-0" data-featured-entry-lag data-featured-lag="0.3">
                    <Image
                      src="/images/home/projects/triangle.svg"
                      alt=""
                      fill
                      className="object-contain"
                      sizes="90px"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div
                  className="absolute bottom-[calc(25%_+_64px)] left-[3.7%] z-[62] h-[12.5%] aspect-[147/71]"
                  data-featured-part
                  data-from-x="52"
                  data-from-y="245"
                  data-from-scale="0.75"
                >
                  <div className="absolute inset-0" data-featured-entry-lag data-featured-lag="0.24">
                    <Image
                      src="/images/home/projects/shape-pink-04.svg"
                      alt=""
                      fill
                      className="object-contain"
                      sizes="160px"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                  </article>
                </button>
              </div>
            </div>
                <StylizeImageSection showFooter={false} variant="panel" />
              </div>
            </div>

            <ProjectIndexWithDrawer
              groups={projectIndexGroups}
              locale={localized}
              projects={projects}
            />
            </div>
          </section>

          <StylizeFooterPanels />
          </div>
          <BottomTelemetry />
        </main>
      </SmoothScroll>
    </HomeMotion>
  );
}

function IntroSection({ title }: { title: string }) {
  return (
    <section className="intro-swipe-section relative z-40" data-intro-swipe>
      <div className="intro-underlay absolute inset-x-0" data-intro-underlay aria-hidden="true">
        <div className="intro-underlay-grid absolute inset-0" />
        <div className="intro-underlay-inner">
          <p className="intro-underlay-copy" data-intro-underlay-copy>
            HELLO
          </p>
        </div>
      </div>
      <div
        className="intro-swipe-card sticky top-0 flex min-h-[100svh] flex-col overflow-hidden bg-[#fff8ef] text-[#20201f]"
        data-intro-card
      >
        <div className="intro-paper-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <p className="intro-watermark pointer-events-none absolute" aria-hidden="true">
          LLLSPACE
        </p>

        <div
          className="intro-card-body relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden"
          data-intro-body
        >
          <div className="intro-body-track intro-figma-body flex min-h-full flex-col" data-intro-body-track>
            <h1 className="sr-only">{title}</h1>

            <div className="intro-life-slot">
              <IntroScaleBlock fitMode="width" minScale={0.4} maxScale={2.4}>
                <div
                  className="intro-life-copy font-[Helvetica,Arial,sans-serif] font-normal tracking-normal"
                  data-intro-copy-line
                >
                  <VerticalCutRevealLine
                    as="div"
                    className="intro-life-line"
                    maskClassName="intro-life-line-mask"
                    revealGroup="top"
                  >
                    <span className="intro-phrase text-[#fe3b2e]">Hey, there! I&apos;m</span>{" "}
                    <span className="intro-phrase">
                      <strong className="font-bold text-[#20201f]">Liang</strong>{" "}
                      <span className="font-normal text-[#20201f]">戴亮</span>{" "}
                      <span className="font-normal text-[#fe3b2e]">♁,</span>
                    </span>{" "}
                    <span className="intro-phrase font-normal text-[#fe3b2e]">
                      a visual artist who is
                    </span>{" "}
                    <span className="intro-phrase">
                      <span className="font-light text-[#fe3b2e]">living</span>
                      <span className="intro-emoji">💆🏻‍♂️</span>
                      <span className="intro-emoji">🪴</span>
                    </span>
                  </VerticalCutRevealLine>
                  <VerticalCutRevealLine
                    as="div"
                    className="intro-life-line"
                    maskClassName="intro-life-line-mask"
                    revealGroup="top"
                  >
                    <span className="intro-phrase">
                      <span className="font-bold text-[#6e6d6d]">working</span>
                      <span className="intro-emoji">💻</span>
                    </span>{" "}
                    <span className="intro-phrase">
                      <em className="font-normal italic text-[#fe3b2e]">drawing</em>,
                    </span>{" "}
                    <span className="intro-phrase">
                      <span className="font-black text-[#8cfffd]">creating</span>
                      <span className="intro-emoji">🪄</span>,
                    </span>{" "}
                    <span className="intro-phrase">
                      <em className="font-light italic text-[#fe3b2e]">posting @LLLDay at</em>
                      <span className="intro-emoji">🤳🏻</span>
                      <span className="intro-app-badge" aria-hidden="true">
                        <Image
                          src="/images/home/xiaohongshu.svg"
                          alt=""
                          width={200}
                          height={200}
                          className="intro-app-badge-icon"
                        />
                      </span>,
                    </span>
                  </VerticalCutRevealLine>
                  <VerticalCutRevealLine
                    as="div"
                    className="intro-life-line"
                    maskClassName="intro-life-line-mask"
                    revealGroup="top"
                  >
                    <span className="intro-phrase">
                      <span className="intro-emoji">🕵🏻‍♂️</span>
                      <strong className="text-[#20201f]">exploring</strong>
                      <span className="intro-emoji intro-search">🔍</span>,
                    </span>{" "}
                    <span className="intro-phrase">
                      <em className="font-light italic text-[#fe3b2e]">hanging ☼</em>,
                    </span>{" "}
                    <span className="intro-phrase">
                      <span className="font-semibold text-[#fe3b2e]">hugging</span>
                      <span className="intro-emoji">🙆🏻‍♂️</span>,
                    </span>{" "}
                    <span className="intro-phrase">
                      <em className="font-black italic text-[#ff2875]">loving</em>,
                    </span>{" "}
                    <span className="intro-phrase">
                      <span className="intro-emoji">❤️🩷🧡🩵❤️‍🔥</span>
                    </span>
                  </VerticalCutRevealLine>
                  <VerticalCutRevealLine
                    as="div"
                    className="intro-life-line"
                    maskClassName="intro-life-line-mask"
                    revealGroup="top"
                  >
                    <span className="intro-phrase">
                      <span className="intro-emoji">💃🏼</span>
                      <em className="font-light italic text-[#fe3b2e]">dancing</em>
                      <span className="intro-emoji">🕺🏻</span>
                    </span>{" "}
                    <span className="intro-phrase">
                      <span className="text-[#fe3b2e]">and </span>
                      <em className="font-light italic text-[#fe3b2e]">singing🎤</em>
                    </span>{" "}
                    <span className="intro-phrase">
                      <span className="text-[#fe3b2e]">in </span>
                      <strong className="text-[#20201f]">Shanghai⚲</strong>.
                    </span>
                  </VerticalCutRevealLine>
                </div>
              </IntroScaleBlock>
            </div>
            <IntroSpaceStage />

            <div className="intro-about-slot">
              <IntroScaleBlock
                anchor="bottom"
                className="intro-about-scale"
                designWidth={1900}
                fitMode="width"
                lockDesignWidth
                maxScale={1.48}
                minScale={0.46}
              >
                <div className="intro-about-copy font-[Helvetica,Arial,sans-serif]" data-intro-lower>
                  <VerticalCutRevealLine
                    as="p"
                    className="intro-about-line"
                    maskClassName="intro-about-line-mask"
                    revealGroup="bottom"
                  >
                    <span className="intro-about-group">I design things, for brands, for AI systems,</span>
                    <span className="intro-about-mark-slot" aria-hidden="true">
                      <Image
                        src="/images/home/intro-marks/1.svg"
                        alt=""
                        width={48}
                        height={15}
                        className="intro-inline-mark"
                      />
                    </span>
                    <span className="intro-about-group">and sometimes just to figure out why something looks off</span>
                    <span className="intro-about-mark-slot" aria-hidden="true">
                      <Image
                        src="/images/home/intro-marks/6.svg"
                        alt=""
                        width={62}
                        height={16}
                        className="intro-frame-mark"
                      />
                    </span>
                    <em className="intro-about-group">(or why it looks</em>
                  </VerticalCutRevealLine>
                  <VerticalCutRevealLine
                    as="p"
                    className="intro-about-line"
                    maskClassName="intro-about-line-mask"
                    revealGroup="bottom"
                  >
                    <em className="intro-about-group">surprisingly right.)</em>
                    <span className="intro-about-mark-slot" aria-hidden="true">
                      <Image
                        src="/images/home/intro-marks/2.svg"
                        alt=""
                        width={45}
                        height={13}
                        className="intro-toggle-mark"
                      />
                    </span>
                    <span className="intro-about-group">
                      Currently building <strong>AI-powered</strong>{" "}
                      <strong>
                        <em>Creative tools</em>
                      </strong>{" "}
                      in Shanghai,
                    </span>
                    <span className="intro-about-mark-slot" aria-hidden="true">
                      <Image
                        src="/images/home/intro-marks/3.svg"
                        alt=""
                        width={49}
                        height={14}
                        className="intro-machine-mark"
                      />
                    </span>
                    <span className="intro-about-group">
                      teaching machines how to have
                    </span>
                  </VerticalCutRevealLine>
                  <VerticalCutRevealLine
                    as="p"
                    className="intro-about-line"
                    maskClassName="intro-about-line-mask"
                    revealGroup="bottom"
                  >
                    <span className="intro-about-group">taste.</span>
                    <span className="intro-about-mark-slot" aria-hidden="true">
                      <Image
                        src="/images/home/intro-marks/4.svg"
                        alt=""
                        width={115}
                        height={15}
                        className="intro-plant-mark"
                      />
                    </span>
                    <span className="intro-about-group">
                      By night I&apos;m probably{" "}
                      <strong>
                        <em>repotting plants</em>
                      </strong>{" "}
                      or shaking a cocktail.
                    </span>
                    <span className="intro-about-mark-slot intro-about-mark-slot-double" aria-hidden="true">
                      <Image
                        src="/images/home/intro-marks/5.svg"
                        alt=""
                        width={56}
                        height={23}
                        className="intro-splash-mark"
                      />
                      <Image
                        src="/images/home/intro-marks/5b.svg"
                        alt=""
                        width={56}
                        height={23}
                        className="intro-splash-mark"
                      />
                    </span>
                    <span className="intro-about-group">Either way, always designing something.</span>
                  </VerticalCutRevealLine>
                </div>
              </IntroScaleBlock>
            </div>
          </div>
        </div>

        <IntroSymbolStrip />
      </div>
    </section>
  );
}

function IntroSymbolStrip() {
  const renderItems = (group: string) =>
    markItems.map((item, index) => (
      <Image
        key={`${group}-${item.letter}-${index}`}
        src={item.src}
        alt=""
        width={item.width}
        height={item.height}
        className="h-[clamp(30px,2.95vw,48px)] w-auto shrink-0 object-contain"
        aria-hidden="true"
        data-mark-letter
      />
    ));

  return (
    <div className="intro-symbol-strip relative z-10 bg-[#fe3b2e]" data-mark-strip>
      <div className="portfolio-letter-strip min-h-[var(--intro-strip-height)] overflow-hidden">
        <div
          className="portfolio-letter-track flex min-h-[var(--intro-strip-height)] w-max items-center"
          data-portfolio-letter-track
        >
          <div className="portfolio-letter-group flex items-center">{renderItems("primary")}</div>
          <div className="portfolio-letter-group flex items-center" aria-hidden="true">
            {renderItems("loop")}
          </div>
        </div>
      </div>
    </div>
  );
}

function BottomTelemetry() {
  return (
    <div
      className="top-telemetry bottom-telemetry"
      data-bottom-telemetry
    >
      <div className="top-telemetry-inner">
        <Image className="top-telemetry-logo" src="/images/home/name.svg" alt="Liang Dai" width={140} height={26} />
        <span className="top-telemetry-dot" aria-hidden="true" />
        <p aria-hidden="true" className="top-telemetry-title">
          The necessity
          <br />
          to Create
        </p>
        <span className="top-telemetry-dot" aria-hidden="true" />
        <div className="top-telemetry-location">
          <LiveLocalTime compact />
        </div>
      </div>
    </div>
  );
}

function TopTelemetry() {
  return (
    <div
      className="top-telemetry fixed inset-x-0 top-0 z-50"
      data-top-telemetry
    >
      <div className="top-telemetry-inner">
        <Image className="top-telemetry-logo" src="/images/home/name.svg" alt="Liang Dai" width={140} height={26} priority />
        <span className="top-telemetry-dot" aria-hidden="true" />
        <p aria-hidden="true" className="top-telemetry-title" />
        <span className="top-telemetry-dot" aria-hidden="true" />
        <div className="top-telemetry-location">
          <LiveLocalTime compact />
        </div>
      </div>
    </div>
  );
}

function HeroIntroTitle() {
  return (
    <p
      className="pointer-events-none fixed left-1/2 top-1/2 z-[70] w-max max-w-none -translate-x-1/2 -translate-y-1/2 text-center font-[Helvetica,Arial,sans-serif] text-[clamp(4rem,11vw,13rem)] font-semibold leading-[1] tracking-normal text-white"
      data-hero-intro-title
    >
      <span
        className="block pb-[0.02em]"
        data-hero-intro-scramble-line
        data-scramble-text="The necessity"
      >
        The necessity
      </span>
      <span
        className="block"
        data-hero-intro-scramble-line
        data-scramble-text="to Create"
      >
        to Create
      </span>
    </p>
  );
}

function HeroGallery() {
  return (
    <section
      className="hero-gallery relative mx-auto aspect-[1920/1120] max-w-none"
      data-hero-gallery
    >
      <div
        className="absolute left-[8%] top-[11.25%] h-[18.93%] w-[15.63%]"
        data-hero-asset="liang-card"
        data-hero-row="1"
      >
        <Image
          src="/images/home/hero-card-liang.svg"
          alt="Liang Dai 2025 graphic card"
          fill
          className="hero-liang-card-image object-contain drop-shadow-[8px_8px_10px_rgba(0,0,0,0.34)]"
          sizes="300px"
        />
        <HeroEmojiBurst label="Burst emoji from Liang Dai graphic card" />
      </div>

      <div
        className="absolute left-[30.8%] top-[10%] h-[21.25%] w-[13.02%]"
        data-hero-asset="portfolio-card"
        data-hero-row="1"
      >
        <Image
          src="/images/home/hero-card-portfolio.svg"
          alt="Portfolio graphic card"
          fill
          className="object-contain drop-shadow-[0_0_18px_rgba(126,243,240,0.28)]"
          sizes="250px"
        />
        <HeroCursorTrail bounds={{ left: 0, top: 0, width: 100, height: 100 }} />
      </div>

      <div
        className="absolute left-[50%] top-[8.21%] h-[25.8%] w-[21.88%]"
        data-hero-asset="calendar"
        data-hero-row="1"
      >
        <Image
          src="/images/home/hero-calendar-frame-5.svg"
          alt="Portfolio 2025 calendar graphic"
          fill
          className="object-contain"
          sizes="420px"
        />
        <HeroElasticGrid bounds={{ left: 2.58, top: 33.08, width: 87.98, height: 54.23 }} />
      </div>

      <div
        className="absolute left-[71.98%] top-[7.32%] h-[50.18%] w-[26.04%]"
        data-hero-asset="portfolio-arrow"
        data-hero-row="1"
      >
        <Image
          src="/images/home/hero-arrow-portfolio.svg"
          alt="Portfolio arrow graphic"
          fill
          className="object-contain"
          sizes="500px"
        />
      </div>

      <div
        className="absolute left-[25%] top-[35%] h-[28.48%] w-[27.08%]"
        data-hero-asset="soft-arrow"
        data-hero-row="2"
      >
        <HeroImageSequence
          alt="Works collection arrow graphic"
          basePath="/images/home/hero-motion/soft-arrow-sequence"
          frameCount={128}
        />
      </div>

      <div
        className="absolute left-[58.02%] top-[39.82%] h-[17.59%] w-[10.94%]"
        data-hero-asset="disc"
        data-hero-row="2"
      >
        <Image
          src="/images/home/hero-disc.svg"
          alt="Portfolio disc graphic"
          fill
          className="object-contain"
          sizes="210px"
        />
      </div>

      <div
        className="absolute left-[72.24%] top-[57.5%] h-[21.25%] w-[18.75%]"
        data-hero-asset="wire-box"
        data-hero-row="3"
      >
        <Image
          src="/images/home/hero-wire-box-frame-8.svg"
          alt="Portfolio wireframe box graphic"
          fill
          className="object-contain drop-shadow-[10px_10px_0_rgba(0,0,0,0.25)]"
          sizes="360px"
        />
      </div>

      <div
        className="absolute left-[40.99%] top-[59.82%] h-[35.89%] w-[22.92%]"
        data-hero-asset="gradient-ticket"
        data-hero-row="3"
      >
        <Image
          src="/images/home/hero-gradient-ticket-frame-7.svg"
          alt="Liang Dai gradient ticket graphic"
          fill
          className="object-contain"
          sizes="440px"
        />
      </div>

      <div
        className="absolute left-[6.98%] top-[57.86%] h-[22.32%] w-[26.04%]"
        data-hero-asset="info-panel"
        data-hero-row="3"
      >
        <Image
          src="/images/home/hero-info-panel-frame-6.svg"
          alt="Portfolio information panel graphic"
          fill
          className="object-contain"
          sizes="500px"
        />
      </div>

    </section>
  );
}

function StartLinesLayer() {
  return (
    <svg
      className="pointer-events-none absolute left-1/2 top-1/2 z-[38] h-[166%] w-auto -translate-x-1/2 -translate-y-1/2 overflow-visible"
      viewBox="0 0 1280 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      data-start-lines-layer
    >
      <defs>
        <mask id="start-white-ray-trim-mask" maskUnits="userSpaceOnUse">
          <path
            data-start-dot-mask-line
            data-start-ray-target="triangle"
            d="M630.234 632.899L1149.63 616.924"
            stroke="white"
            strokeLinecap="butt"
            strokeWidth="4"
          />
        </mask>
        <mask id="start-yellow-ray-trim-mask" maskUnits="userSpaceOnUse">
          <path
            data-start-dot-mask-line
            data-start-ray-target="heart"
            d="M630.234 632.899L1129.94 951.659"
            stroke="white"
            strokeLinecap="butt"
            strokeWidth="4"
          />
        </mask>
        <mask id="start-purple-ray-trim-mask" maskUnits="userSpaceOnUse">
          <path
            data-start-dot-mask-line
            data-start-ray-target="purple"
            d="M630.234 632.899L885.213 986.82"
            stroke="white"
            strokeLinecap="butt"
            strokeWidth="4"
          />
        </mask>
      </defs>
      <g data-start-line-capsule>
        <path
          d="M71.9655 457.502H63.071C58.6625 457.502 55.0886 465.349 55.0886 475.03C55.0886 484.71 58.6625 492.558 63.071 492.558H71.9655V457.502Z"
          fill="#8CFFFD"
          stroke="#FE3B2E"
        />
        <ellipse
          cx="72.0571"
          cy="475.03"
          rx="7.98242"
          ry="17.528"
          fill="#FE3B2E"
          stroke="#FE3B2E"
        />
      </g>
      <path
        data-start-line
        data-motion-path
        d="M71.5586 475.683L630.234 632.899"
        stroke="#8CFFFD"
      />
      <path
        data-start-dot-line
        data-start-ray-target="triangle"
        d="M630.234 632.899L1149.63 616.924"
        stroke="white"
        strokeLinecap="butt"
        strokeDasharray="8 8"
        mask="url(#start-white-ray-trim-mask)"
      />
      <path
        data-start-dot-line
        data-start-ray-target="heart"
        d="M630.234 632.899L1129.94 951.659"
        stroke="#F4EE45"
        strokeLinecap="butt"
        strokeDasharray="8 8"
        mask="url(#start-yellow-ray-trim-mask)"
      />
      <path
        data-start-dot-line
        data-start-ray-target="purple"
        d="M630.234 632.899L885.213 986.82"
        stroke="#CE64FF"
        strokeLinecap="butt"
        strokeDasharray="8 8"
        mask="url(#start-purple-ray-trim-mask)"
      />
      <path
        data-start-orbit-line
        data-motion-path
        data-green-orbit-path
        d="M575.747 512.847C727.489 467.046 869.407 440.688 976.185 435.089C1029.58 432.29 1074.16 434.683 1106.77 442.417C1139.43 450.16 1159.91 463.209 1165.45 481.562C1170.99 499.915 1161.15 522.117 1138.23 546.635C1115.34 571.123 1079.53 597.78 1033.5 624.988C941.458 679.401 808.656 735.962 656.914 781.762C505.172 827.562 363.254 853.921 256.475 859.519C203.083 862.319 158.505 859.925 125.887 852.192C93.2291 844.449 72.7464 831.4 67.2068 813.048C61.6673 794.695 71.5101 772.492 94.4308 747.973C117.323 723.485 153.133 696.829 199.158 669.621C291.203 615.208 424.005 558.647 575.747 512.847Z"
        stroke="#8CFFFD"
      />
    </svg>
  );
}

function StartRedRayLayer() {
  return (
    <svg
      className="pointer-events-none absolute left-1/2 top-1/2 z-[39] h-[166%] w-auto -translate-x-1/2 -translate-y-1/2 overflow-visible"
      viewBox="0 0 1280 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      data-start-red-ray-layer
    >
      <defs>
        <mask id="start-red-ray-trim-mask" maskUnits="userSpaceOnUse">
          <path
            data-start-dot-mask-line
            d="M630.234 632.899L948.529 742.343"
            stroke="white"
            strokeLinecap="butt"
            strokeWidth="4"
          />
        </mask>
      </defs>
      <path
        data-start-dot-line
        d="M630.234 632.899L948.529 742.343"
        stroke="#FE3B2E"
        strokeLinecap="butt"
        strokeDasharray="8 8"
        mask="url(#start-red-ray-trim-mask)"
      />
    </svg>
  );
}
