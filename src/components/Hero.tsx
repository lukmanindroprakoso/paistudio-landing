import Image from "next/image";

export function Hero() {
  return (
    <section className="relative z-1 flex min-h-screen flex-col items-center justify-end gap-12 overflow-visible pt-[148px] [scroll-snap-align:start]">
      <div
        data-fade="1"
        data-para="0.08"
        className="pai-hero-row pai-container relative z-1 mx-auto flex w-full items-end gap-5 px-10 max-[900px]:flex-col max-[900px]:items-start max-[900px]:px-7 max-[560px]:px-5 max-[560px]:pt-0"
      >
        <h1 className="pai-hero-h1 m-0 w-full text-[100px] leading-none font-bold tracking-[-1px] text-white text-balance max-[900px]:text-[clamp(40px,9vw,72px)] max-[560px]:text-[clamp(32px,10vw,48px)]">
          Your AI-Empowered Product Team To Launch&nbsp;
          <span className="text-brand underline decoration-[3px] underline-offset-[10px]">5× faster.</span>
        </h1>
        <p className="m-0 max-w-[400px] text-[18px] leading-[1.4] font-normal text-white/82 max-[900px]:max-w-full">
          We help founders launch SaaS, marketplaces, automations, internal tools, and AI
          products&nbsp;faster using AI and no-code, shipped in weeks, not months.
        </p>
      </div>

      <div data-fade="1" className="static z-1 flex w-full justify-center pointer-events-none pb-[52px]">
        <div className="pai-stats-row pai-container flex w-full items-center border-t border-white/18 px-10 pt-6 max-[900px]:flex-wrap max-[900px]:px-7 max-[560px]:px-5">
          <div className="flex-1 pr-[34px] max-[900px]:flex-[1_1_45%] max-[900px]:border-l-0 max-[900px]:px-4 max-[900px]:pb-4 max-[560px]:flex-[1_1_100%] max-[560px]:px-0 max-[560px]:pb-4">
            <div className="mb-[9px] flex h-[30px] items-center">
              <Image
                src="/brand/upwork-logo.png"
                alt="Upwork"
                width={78}
                height={22}
                className="block h-[22px] w-auto opacity-85 brightness-0 invert"
              />
            </div>
            <div className="text-[12px] font-normal tracking-[0.1em] text-white/78">TOP RATED+ ON UPWORK</div>
          </div>
          <div className="flex-1 border-l border-white/18 px-[34px] max-[900px]:flex-[1_1_45%] max-[900px]:border-l-0 max-[900px]:px-4 max-[900px]:pb-4 max-[560px]:flex-[1_1_100%] max-[560px]:border-l-0 max-[560px]:px-0 max-[560px]:pb-4">
            <div className="mb-[9px] flex h-[30px] items-center">
              <Image
                src="/brand/bubble-logo.png"
                alt="Bubble.io"
                width={79}
                height={22}
                className="block h-[22px] w-auto opacity-85 brightness-0 invert"
              />
            </div>
            <div className="text-[12px] font-normal tracking-[0.1em] text-white/78">VERIFIED BUBBLE.IO AGENCY</div>
          </div>
          <div className="flex-1 border-l border-white/18 px-[34px] max-[900px]:flex-[1_1_45%] max-[900px]:border-l-0 max-[900px]:px-4 max-[900px]:pb-4 max-[560px]:flex-[1_1_100%] max-[560px]:border-l-0 max-[560px]:px-0 max-[560px]:pb-4">
            <div className="mb-[9px] flex h-[30px] items-center text-[18px] font-semibold text-white">2 weeks</div>
            <div className="text-[12px] font-normal tracking-[0.1em] text-white/78">AVG. FIRST RELEASE</div>
          </div>
          <div className="flex-1 border-l border-white/18 pl-[34px] max-[900px]:flex-[1_1_45%] max-[900px]:border-l-0 max-[900px]:px-4 max-[900px]:pb-4 max-[560px]:flex-[1_1_100%] max-[560px]:border-l-0 max-[560px]:px-0 max-[560px]:pb-4">
            <div className="mb-[9px] flex h-[30px] items-center text-[18px] font-semibold text-white uppercase">50+</div>
            <div className="text-[12px] font-normal tracking-[0.1em] text-white/78">PROJECTS COMPLETED</div>
          </div>
        </div>
      </div>
    </section>
  );
}
