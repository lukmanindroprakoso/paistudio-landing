"use client";

import { useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ImageIcon,
  ListBulletsIcon,
  PlusIcon,
  TextAlignLeftIcon,
  TextHIcon,
  VideoCameraIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { ArticleBlock } from "@/types/blog";

const BLOCK_TYPE_LABELS: Record<ArticleBlock["type"], string> = {
  heading: "Heading",
  paragraph: "Paragraph",
  list: "List",
  image: "Image",
  video: "Video",
};

const BLOCK_TYPE_ICONS: Record<ArticleBlock["type"], typeof TextHIcon> = {
  heading: TextHIcon,
  paragraph: TextAlignLeftIcon,
  list: ListBulletsIcon,
  image: ImageIcon,
  video: VideoCameraIcon,
};

function emptyBlock(type: ArticleBlock["type"]): ArticleBlock {
  switch (type) {
    case "heading":
      return { type: "heading", id: "", text: "" };
    case "paragraph":
      return { type: "paragraph", text: "" };
    case "list":
      return { type: "list", items: [""] };
    case "image":
      return { type: "image", src: "", alt: "" };
    case "video":
      return { type: "video" };
  }
}

const fieldClass =
  "w-full rounded-lg border border-ink/10 bg-paper px-3 py-2 text-sm text-text transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export function BlockEditor({ initialBlocks }: { initialBlocks: ArticleBlock[] }) {
  const [blocks, setBlocks] = useState<ArticleBlock[]>(initialBlocks.length > 0 ? initialBlocks : []);

  function updateBlock(index: number, next: ArticleBlock) {
    setBlocks((prev) => prev.map((block, i) => (i === index ? next : block)));
  }

  function removeBlock(index: number) {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setBlocks((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addBlock(type: ArticleBlock["type"]) {
    setBlocks((prev) => [...prev, emptyBlock(type)]);
  }

  return (
    <div>
      <input type="hidden" name="blocksJson" value={JSON.stringify(blocks)} />
      <div className="flex flex-col gap-3">
        {blocks.map((block, index) => {
          const TypeIcon = BLOCK_TYPE_ICONS[block.type];
          return (
            <div key={index} className="rounded-2xl border border-ink/10 bg-paper p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-medium tracking-[0.04em] text-muted uppercase">
                  <TypeIcon size={14} />
                  {BLOCK_TYPE_LABELS[block.type]}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Move block up"
                    onClick={() => moveBlock(index, -1)}
                    disabled={index === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition hover:bg-cream hover:text-text disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowUpIcon size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label="Move block down"
                    onClick={() => moveBlock(index, 1)}
                    disabled={index === blocks.length - 1}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition hover:bg-cream hover:text-text disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowDownIcon size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label="Remove block"
                    onClick={() => removeBlock(index)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition hover:bg-cream hover:text-text"
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              </div>

              {block.type === "heading" && (
                <div className="flex flex-col gap-2">
                  <input
                    aria-label="Anchor id"
                    className={fieldClass}
                    placeholder="Anchor id (e.g. the-real-failure-mode)"
                    value={block.id}
                    onChange={(e) => updateBlock(index, { ...block, id: e.target.value })}
                  />
                  <input
                    aria-label="Heading text"
                    className={fieldClass}
                    placeholder="Heading text"
                    value={block.text}
                    onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                  />
                </div>
              )}

              {block.type === "paragraph" && (
                <textarea
                  aria-label="Paragraph text"
                  className={fieldClass}
                  rows={3}
                  placeholder="Paragraph text"
                  value={block.text}
                  onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                />
              )}

              {block.type === "list" && (
                <div className="flex flex-col gap-2">
                  {block.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex gap-2">
                      <input
                        aria-label={`List item ${itemIndex + 1}`}
                        className={fieldClass}
                        value={item}
                        onChange={(e) => {
                          const nextItems = block.items.map((it, i) => (i === itemIndex ? e.target.value : it));
                          updateBlock(index, { ...block, items: nextItems });
                        }}
                      />
                      <button
                        type="button"
                        aria-label={`Remove list item ${itemIndex + 1}`}
                        onClick={() => {
                          const nextItems = block.items.filter((_, i) => i !== itemIndex);
                          updateBlock(index, { ...block, items: nextItems });
                        }}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-cream hover:text-text"
                      >
                        <XIcon size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 self-start rounded-full border border-ink/10 px-3 py-1.5 text-xs font-medium text-text transition hover:bg-cream"
                    onClick={() => updateBlock(index, { ...block, items: [...block.items, ""] })}
                  >
                    <PlusIcon size={12} />
                    Add item
                  </button>
                </div>
              )}

              {block.type === "image" && (
                <div className="flex gap-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-cream">
                    {block.src ? (
                      // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-typed path, informational preview only
                      <img
                        src={block.src}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.visibility = "hidden";
                        }}
                        onLoad={(e) => {
                          e.currentTarget.style.visibility = "visible";
                        }}
                      />
                    ) : (
                      <ImageIcon size={20} className="text-muted" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <input
                      aria-label="Image path"
                      className={fieldClass}
                      placeholder="/blog/my-image.jpg"
                      value={block.src}
                      onChange={(e) => updateBlock(index, { ...block, src: e.target.value })}
                    />
                    <input
                      aria-label="Alt text"
                      className={fieldClass}
                      placeholder="Alt text"
                      value={block.alt}
                      onChange={(e) => updateBlock(index, { ...block, alt: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {block.type === "video" && <p className="text-sm text-muted">Fixed video embed — no fields.</p>}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.keys(BLOCK_TYPE_LABELS) as ArticleBlock["type"][]).map((type) => {
          const TypeIcon = BLOCK_TYPE_ICONS[type];
          return (
            <button
              key={type}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-3.5 py-1.5 text-sm font-medium text-text transition hover:bg-cream"
              onClick={() => addBlock(type)}
            >
              <TypeIcon size={14} />
              {BLOCK_TYPE_LABELS[type]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
