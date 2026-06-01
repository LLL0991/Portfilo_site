import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { HomeMotion } from "@/components/motion/HomeMotion";
import { getFeaturedProjects } from "@/lib/projects";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

const markItems = [
  "chip",
  "pill",
  "ticket",
  "bolt",
  "tag",
  "disk",
  "panel",
  "bubble",
] as const;

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const featured = getFeaturedProjects();
  const localized = locale as "zh" | "en";
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <>
      <HomeMotion />
      <main className="home-canvas min-h-screen overflow-hidden bg-background text-foreground">
        <TopTelemetry />
        <section className="mx-auto w-full max-w-[1280px] px-5 pb-16 pt-12 sm:px-8 lg:px-12">
          <HeroGallery />

          <section className="mt-14 grid gap-8 lg:grid-cols-[0.68fr_0.32fr] lg:items-end">
            <div data-home-intro>
              <h1 className="sr-only">{t("title")}</h1>
              <p className="max-w-[920px] text-[clamp(2.1rem,5.2vw,5.2rem)] font-semibold leading-[0.98] tracking-normal text-[#ff382e]">
                Hey, there! I&apos;m{" "}
                <span className="text-[#fff4e4]">Liang 戴亮</span>{" "}
                <span className="text-[#ff382e]">♨</span>
                <br />
                a visual artist who is living 🌿
                <br />
                working✍{" "}
                <em className="font-serif font-normal text-[#fff4e4]">drawing</em>,
                creating🌀,
                <br />
                posting@LLLDay at 🧧, exploring🔍,
                <br />
                hanging☀, hugging🫂,{" "}
                <em className="font-serif font-normal text-[#fff4e4]">loving</em>
                ❤️🧡🤍💖,
                <br />
                dancing🕺and singing! in Shanghai..
              </p>
            </div>

            <aside
              className="grid max-w-sm grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs uppercase tracking-normal text-foreground/50 lg:justify-self-end"
              data-home-intro
            >
              <span className="text-[#ff382e]">status</span>
              <span>Currently in Shanghai, China</span>
              <span className="text-[#7ef3f0]">field</span>
              <span>Visual art / Brand / Motion / Display</span>
              <span className="text-[#d9fb5a]">year</span>
              <span>2025 portfolio</span>
            </aside>
          </section>

          <MarkStrip />

          <section className="mt-14" data-home-section>
            <div className="mb-8 text-center">
              <h2 className="text-base font-medium tracking-normal text-[#fff4e4]">
                Some Projects
              </h2>
            </div>

            <Link
              href="/work"
              className="group block overflow-hidden rounded-[6px] border border-[#ff382e]/80 bg-[#ff382e] text-[#202020] shadow-[0_0_0_1px_rgba(126,243,240,0.45)]"
              data-featured-card
            >
              <article className="grid min-h-[300px] md:grid-cols-[0.42fr_0.58fr]">
                <div className="relative min-h-[220px] border-b border-[#1f2222] bg-[#111] md:border-b-0 md:border-r">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(126,243,240,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(126,243,240,0.45)_1px,transparent_1px)] bg-[size:19px_19px]" />
                  <div className="absolute bottom-0 left-0 h-24 w-44 rounded-t-full bg-[#274dff]" />
                  <div className="absolute bottom-0 left-4 h-16 w-56 rounded-full bg-[#ff61ce]" />
                  <div className="absolute bottom-[-28px] left-0 h-28 w-28 rounded-full bg-[#9cff3b]" />
                  <div className="absolute bottom-12 left-20 h-12 w-24 rotate-[-18deg] bg-[#7ef3f0]" />
                  <div className="absolute left-4 top-4 border border-[#7ef3f0] px-2 py-1 text-xs text-[#7ef3f0]">
                    Portfolio
                  </div>
                  <div className="absolute right-4 top-8 text-right">
                    <p className="text-5xl font-black leading-none text-[#ff382e]">
                      03
                    </p>
                    <p className="bg-[#fff4e4] px-2 py-1 text-xs text-[#ff382e]">
                      Motion & more
                    </p>
                  </div>
                  <p className="absolute bottom-10 left-1 text-4xl font-black text-[#ff382e]">
                    04
                  </p>
                </div>

                <div className="relative min-h-[300px] overflow-hidden p-5">
                  <div className="absolute left-0 top-0 h-16 w-[45%] bg-[#202020]" />
                  <div className="absolute bottom-0 left-[22%] h-24 w-[34%] rounded-t-[16px] bg-[#202020]" />
                  <div className="absolute bottom-0 right-0 h-[36%] w-[38%] bg-[#202020]" />
                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between gap-6">
                      <p className="max-w-[18rem] text-lg font-medium text-[#202020]">
                        Art Design of Interior Display
                      </p>
                      <p className="text-5xl font-black leading-none text-[#202020]">
                        01
                      </p>
                    </div>
                    <div className="self-end text-right font-serif text-2xl italic leading-none text-[#ff382e]">
                      <p>Visual</p>
                      <p>Identity</p>
                      <p className="font-sans text-4xl not-italic text-[#fff4e4]">
                        02
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            </Link>

            <div className="mt-11 grid gap-6 text-[11px] leading-relaxed text-foreground/54 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((project, index) => (
                <Link
                  key={project.slug}
                  href="/work"
                  className="group grid gap-2 border-t border-foreground/18 pt-3 transition-colors hover:text-[#ff382e]"
                  data-project-note
                >
                  <p className="font-mono text-foreground/40">
                    0{index + 1} / Liang portfolio
                  </p>
                  <h3 className="text-[#fff4e4] transition-colors group-hover:text-[#ff382e]">
                    {project.title[localized]}
                  </h3>
                  <p>{project.summary[localized]}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-14 grid gap-8 lg:grid-cols-[0.52fr_0.48fr] lg:items-end">
            <div className="relative mx-auto h-[360px] w-full max-w-[610px]" data-polaroids>
              {featured.slice(0, 3).map((project, index) => (
                <div
                  key={project.slug}
                  className={[
                    "absolute h-[250px] w-[200px] bg-[#d8d8d8] p-4 shadow-[0_12px_0_rgba(0,0,0,0.35)]",
                    index === 0 ? "left-[8%] top-16 rotate-[-9deg]" : "",
                    index === 1 ? "left-[34%] top-4 rotate-[8deg]" : "",
                    index === 2 ? "right-[9%] top-20 rotate-[-5deg]" : "",
                  ].join(" ")}
                >
                  <div className="relative h-[176px] w-full overflow-hidden bg-[#222]">
                    <Image
                      src={project.cover}
                      alt={project.title[localized]}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div
              className="border border-[#ff382e]/70 p-5 text-sm text-foreground/64 [clip-path:polygon(0_0,100%_0,80%_18%,80%_67%,100%_84%,100%_100%,0_100%)]"
              data-contact-panel
            >
              <p className="mb-8 text-[#ff382e]">Meet & Hang Out</p>
              <p>hey@lll-day.com</p>
              <p>LiangyDai</p>
              <p>LiangyDai</p>
              <p className="mt-10 text-foreground/42">Shanghai, China</p>
            </div>
          </section>
        </section>
        <BottomTelemetry />
      </main>
    </>
  );
}

function TopTelemetry() {
  return (
    <div className="fixed inset-x-0 top-0 z-40 hidden h-6 border-b border-[#ff382e]/60 bg-[#20201f]/90 text-[10px] text-[#7ef3f0] backdrop-blur md:block">
      <div className="mx-auto grid h-full max-w-[1280px] grid-cols-4 items-center px-3">
        <span>L!ang dai</span>
        <span className="text-center text-[#ff382e]">0</span>
        <span className="text-center text-foreground/46">Total Time 12.16 min</span>
        <span className="text-right">Shanghai 31.16C</span>
      </div>
    </div>
  );
}

function BottomTelemetry() {
  return (
    <div className="border-y border-[#ff382e]/60 bg-[#20201f] text-[10px] text-[#7ef3f0]">
      <div className="mx-auto grid h-7 max-w-[1280px] grid-cols-4 items-center px-3">
        <span>L!ang dai</span>
        <span className="text-center text-[#ff382e]">0</span>
        <span className="text-center text-foreground/46">Currently in Shanghai, China</span>
        <span className="text-right">Local Time 11.34 PM</span>
      </div>
    </div>
  );
}

function HeroGallery() {
  return (
    <section
      className="relative min-h-[560px] border-t border-[#ff382e]/50 pt-8 md:mt-6"
      data-hero-gallery
    >
      <p className="absolute left-0 top-8 max-w-[780px] text-[clamp(3.7rem,10vw,9.7rem)] font-black leading-[0.78] tracking-normal text-foreground/34">
        The necessity
        <br />
        after...
      </p>

      <div className="absolute left-[6%] top-[78px] h-[82px] w-[120px] bg-[#ff382e] p-2 text-[10px] font-medium text-[#fff4e4] shadow-[8px_8px_0_rgba(0,0,0,0.38)]">
        Liang dai
        <br />
        2025
      </div>

      <div className="absolute left-[32%] top-[78px] h-[150px] w-[140px] rounded-[24px] border border-[#7ef3f0] bg-[#161616] p-3 shadow-[0_0_18px_rgba(126,243,240,0.35)]">
        <div className="h-full rounded-[16px] border border-[#ff382e]/60 bg-[#050505]" />
        <span className="absolute bottom-4 right-3 text-sm text-[#fff4e4]">Portfolio</span>
      </div>

      <div className="absolute left-[51%] top-[70px] h-[174px] w-[250px] border-4 border-[#ff382e] bg-[#151515] p-2">
        <div className="h-full bg-[linear-gradient(rgba(126,243,240,0.72)_1px,transparent_1px),linear-gradient(90deg,rgba(126,243,240,0.72)_1px,transparent_1px)] bg-[size:18px_18px]" />
        <p className="absolute left-2 top-[-20px] text-xs text-[#ff382e]">
          Portfolio 2025
        </p>
        <div className="absolute right-[-18px] top-[-16px] h-14 w-14 border-y-4 border-[#ff382e]" />
      </div>

      <div className="absolute right-[4%] top-[72px] h-[210px] w-[155px] rotate-[28deg] bg-[#ff382e] p-3 text-2xl font-black text-[#fff4e4]">
        Portfolio
        <div className="absolute bottom-[-94px] left-10 h-[116px] w-20 bg-[#ff382e]" />
      </div>

      <div className="absolute left-[17%] top-[245px] h-[122px] w-[215px] rotate-[7deg] rounded-[2px] bg-[#ff5d4d] shadow-[12px_14px_0_rgba(0,0,0,0.32)] [clip-path:polygon(0_0,88%_0,100%_58%,0_100%)]">
        <p className="p-4 text-sm font-semibold text-[#fff4e4]">作品陈列 · 图形系统</p>
      </div>

      <div className="absolute left-[58%] top-[260px] grid h-[160px] w-[160px] place-items-center rounded-full bg-[#ff382e]">
        <div className="grid h-[102px] w-[102px] place-items-center rounded-full border-[18px] border-[#1e1e1e] bg-[#7ef3f0]">
          <div className="h-8 w-8 rounded-full bg-[#fff4e4]" />
        </div>
      </div>

      <div className="absolute right-[3%] top-[395px] h-[130px] w-[225px] rotate-[8deg] border border-[#ff382e] bg-[#0d0d0d] [clip-path:polygon(0_0,100%_25%,88%_100%,0_75%)]">
        <div className="absolute inset-6 border border-[#7ef3f0]/70" />
        <p className="absolute left-8 top-5 text-xs text-[#ff382e]">L!ang Dai</p>
      </div>

      <div className="absolute bottom-8 left-[4%] h-[140px] w-[300px] border border-[#7ef3f0]/70 p-3 text-xs text-foreground/70 [clip-path:polygon(0_0,100%_0,82%_26%,82%_100%,0_72%)]">
        <span className="border border-[#7ef3f0] px-1 text-[#7ef3f0]">Portfolio</span>
        <span className="ml-2 border border-[#fff4e4]/70 px-1">作品集</span>
        <p className="mt-7 text-[#ff382e]">L!ang dai * visual art</p>
        <p className="mt-4">
          <span className="mr-4 border border-[#ff382e] px-1 text-[#d9fb5a]">
            2025
          </span>
          <span className="border border-[#7ef3f0] px-1 text-[#7ef3f0]">
            CODES
          </span>
        </p>
      </div>

      <div className="absolute bottom-2 left-[37%] h-[200px] w-[300px] rotate-[-12deg] bg-[#ff382e] shadow-[12px_15px_0_rgba(0,0,0,0.35)] [clip-path:polygon(0_21%,85%_0,100%_82%,18%_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_16%,#7ef3f0_0_34px,transparent_35px)]" />
        <p className="absolute left-20 top-8 text-xs text-[#202020]">Liang Dai</p>
        <span className="absolute bottom-1 right-2 bg-[#ff382e] px-1 text-xs text-[#fff4e4]">
          2025
        </span>
      </div>
    </section>
  );
}

function MarkStrip() {
  return (
    <div className="mt-16 grid grid-cols-4 gap-4 sm:grid-cols-8" data-mark-strip>
      {markItems.map((item) => (
        <span
          key={item}
          className={`portfolio-mark portfolio-mark-${item}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
