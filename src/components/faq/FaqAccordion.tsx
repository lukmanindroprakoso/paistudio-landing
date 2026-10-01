"use client";

import { useState } from "react";
import type { FaqEntry } from "@/lib/content/faq";
import { FaqAccordionItem } from "./FaqAccordionItem";

type FaqAccordionProps = {
  entries: FaqEntry[];
};

/** Single-open accordion — opening one entry closes whichever was open.
 * Keyboard support (Enter/Space to toggle, focus outline) comes for free
 * from using a real `<button>` per row (see FaqAccordionItem), no extra
 * key handling needed. */
export function FaqAccordion({ entries }: FaqAccordionProps) {
  const [openSlug, setOpenSlug] = useState<string | null>(entries[0]?.slug ?? null);

  return (
    <div className="flex flex-col">
      {entries.map((entry) => (
        <FaqAccordionItem
          key={entry.slug}
          entry={entry}
          isOpen={entry.slug === openSlug}
          onToggle={() => setOpenSlug((current) => (current === entry.slug ? null : entry.slug))}
        />
      ))}
    </div>
  );
}
