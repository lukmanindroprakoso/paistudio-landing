"use client";

import Image from "next/image";
import { revealStyle, useReduceMotion, useScrollDriver } from "@/lib/scroll/useScrollDriver";
import type { ProjectImageRef, ProjectTestimonial } from "@/types/work";

type TestimonialSkillsSectionProps = {
  image: ProjectImageRef;
  /** Optional — most projects don't have a real client testimonial on
   * file (see ProjectDetail.testimonial's own comment). When absent,
   * `overview` (if provided) fills the upper slot instead — see that
   * prop's own comment — otherwise the skills list alone fills the
   * column, top-aligned instead of centered against an empty upper half. */
  testimonial?: ProjectTestimonial;
  /** Optional short project-overview paragraph, shown above "Skills &
   * deliverables" ONLY when `testimonial` is absent — added on request
   * ("untuk project yang tidak punya testimonial, berikan project
   * overview di atas skills and deliverables") so a project without a
   * real quote doesn't just show a lone skills list with a large empty
   * upper half. Ignored when `testimonial` is present (the quote already
   * fills that slot). Call sites pass the project's own real description
   * (the same text `HeroV2`'s intro already uses), not fabricated copy. */
  overview?: string;
  skills: string[];
  revealId: string;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 20 20"
          aria-hidden="true"
          fill="currentColor"
          className={i < rating ? "text-brand" : "text-ink/15"}
        >
          <path d="M10 1.5 12.6 6.9 18.5 7.6 14.2 11.7 15.2 17.6 10 14.7 4.8 17.6 5.8 11.7 1.5 7.6 7.4 6.9 10 1.5Z" />
        </svg>
      ))}
    </div>
  );
}

/** Image left, two vertically stacked text groups right: a testimonial
 * (quote + star rating + attribution) above, "Skills & deliverables"
 * pills below — same pill idiom Pricing.tsx uses for its feature tags
 * (`rounded-full bg-ink/5`), reused here for skills instead of features. */
export function TestimonialSkillsSection({ image, testimonial, overview, skills, revealId }: TestimonialSkillsSectionProps) {
  const { revealed } = useScrollDriver();
  const reduceMotion = useReduceMotion();
  const hasUpperContent = Boolean(testimonial) || Boolean(overview);

  return (
    <div
      data-reveal="1"
      data-reveal-id={revealId}
      className="pai-container mx-auto grid w-full max-w-[1240px] grid-cols-2 items-stretch gap-16 px-10 py-20 max-[900px]:grid-cols-1 max-[900px]:gap-10 max-[900px]:px-7 max-[560px]:px-5"
      style={revealStyle(revealed, revealId, reduceMotion)}
    >
      <div className="relative w-full overflow-hidden rounded-[32px]" style={{ aspectRatio: "4 / 5" }}>
        <Image src={image.src} alt={image.alt} fill className="object-cover" />
      </div>

      <div className={`flex flex-col gap-10 ${testimonial ? "justify-center" : "justify-start"}`}>
        {testimonial ? (
          <div className="flex flex-col gap-4">
            <Stars rating={testimonial.rating} />
            <p className="m-0 text-[22px] leading-[1.5] font-medium tracking-[-0.01em] text-text text-balance">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <span className="text-[14px] text-muted">
              <span className="text-text">{testimonial.author}</span> — {testimonial.role}
            </span>
          </div>
        ) : (
          overview && (
            <div className="flex flex-col gap-3">
              <span className="text-[12px] font-medium tracking-[0.1em] text-muted uppercase">Project Overview</span>
              <p className="m-0 text-[16px] leading-[1.6] text-muted">{overview}</p>
            </div>
          )
        )}

        <div className={`flex flex-col gap-3 ${hasUpperContent ? "border-t border-ink/10 pt-8" : ""}`}>
          <span className="text-[12px] font-medium tracking-[0.1em] text-muted uppercase">Skills &amp; deliverables</span>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="rounded-full bg-ink/5 px-4 py-2 text-[14px] text-text/80">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
