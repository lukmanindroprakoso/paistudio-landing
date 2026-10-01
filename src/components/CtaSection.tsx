"use client";

import Image from "next/image";
import { revealStyle, useReduceMotion, useScrollDriver } from "@/lib/scroll/useScrollDriver";
import { Marquee } from "./Marquee";

const TOOLS = [
  { src: "/brand/bubble-icon.svg", alt: "Bubble", height: 30 },
  { src: "/brand/airtable-icon.svg", alt: "Airtable", height: 32 },
  { src: "/brand/softr-icon.svg", alt: "Softr", height: 33 },
  { src: "/brand/n8n-icon.svg", alt: "n8n", height: 38 },
  { src: "/brand/lovable-icon.svg", alt: "Lovable", height: 29 },
  { src: "/brand/claude-icon.svg", alt: "Claude AI", height: 29 },
];

const CARDS = [
  {
    id: "ctaCard0",
    title: "Team depth, founder price",
    body: "Design, development, AI, and automation in one team — no agency markup, no juggling contractors.",
    tinted: true,
  },
  {
    id: "ctaCard1",
    title: "You talk to the builders",
    body: "No middlemen. The person you brief is the person building — faster decisions, better product.",
    tinted: false,
  },
  {
    id: "ctaCard2",
    title: "Ships in weeks, not months",
    body: "No bloated process or 20-page proposals. We scope, design, and ship. You're live while others are still in discovery.",
    tinted: true,
  },
];

export function CtaSection() {
  const { setCtaSectionEl, revealed } = useScrollDriver();
  const reduceMotion = useReduceMotion();

  return (
    <section
      ref={setCtaSectionEl}
      className="relative flex flex-col items-start justify-center pt-[60vh] pb-[140px] text-left"
      style={{ background: "linear-gradient(180deg, #1A1F2800, #1A1F2800, #091C26CC, #13366B, #1E90FF)" }}
    >
      <div
        className="pointer-events-none absolute -bottom-[10%] -left-[8%] z-0 h-[90%] w-[70%] blur-[24px]"
        style={{ background: "radial-gradient(50% 50% at 42% 58%, rgba(74,150,215,0.22), transparent 70%)" }}
      />

      <div className="relative z-1 mx-auto flex w-full max-w-[1240px] flex-col items-start px-10">
        <div className="mb-[18px] flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="shrink-0">
            <path
              d="M2 8L8 2M8 2H3M8 2V7"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[12px] font-medium tracking-[0.1em] text-white/60 uppercase">Why Paistudio</span>
        </div>

        <h2
          data-reveal="1"
          data-reveal-id="ctaHeadline"
          className="m-0 max-w-[760px] text-[64px] leading-[1.04] font-medium tracking-[-0.56px] text-white text-balance"
          style={revealStyle(revealed, "ctaHeadline", reduceMotion)}
        >
          We are a focused product team between a freelancer and an agency built for founders with a real idea to
          ship.
        </h2>

        <div className="pai-cta-grid mt-[72px] grid w-full grid-cols-3 gap-6 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
          {CARDS.map((card) => (
            <div
              key={card.id}
              data-reveal="1"
              data-reveal-id={card.id}
              className="flex flex-col rounded-[32px] border border-white/10 p-[30px_28px]"
              style={{
                background: card.tinted ? "rgba(255,255,255,0.04)" : "#FFFFFF0A",
                ...revealStyle(revealed, card.id, reduceMotion),
              }}
            >
              <h3 className="m-0 mb-3 text-[18px] leading-[1.3] font-medium text-white text-balance">{card.title}</h3>
              <p className="m-0 text-[14px] leading-[1.6] text-white/75">{card.body}</p>
            </div>
          ))}
        </div>

        <div
          data-reveal="1"
          data-reveal-id="ctaTools"
          className="mt-20 flex w-full flex-col items-center gap-8"
          style={revealStyle(revealed, "ctaTools", reduceMotion)}
        >
          <span className="text-[12px] font-medium tracking-[0.1em] text-white/66">TOOLS WE SPECIALIZE AT</span>
          <div
            className="relative w-full overflow-hidden"
            style={{
              maskImage: "linear-gradient(90deg, transparent 0, #000 9%, #000 91%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(90deg, transparent 0, #000 9%, #000 91%, transparent 100%)",
            }}
          >
            <Marquee direction="horizontal" className="items-center gap-[76px] pr-[76px]">
              {TOOLS.map((tool) => (
                <Image
                  key={tool.alt}
                  src={tool.src}
                  alt={tool.alt}
                  width={140}
                  height={tool.height}
                  className="block h-8 w-auto shrink-0 opacity-82"
                  style={{ height: tool.height }}
                />
              ))}
            </Marquee>
          </div>
        </div>
      </div>
    </section>
  );
}
