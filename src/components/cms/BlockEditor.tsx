"use client";

import { useState } from "react";
import type { ArticleBlock } from "@/types/blog";

const BLOCK_TYPE_LABELS: Record<ArticleBlock["type"], string> = {
  heading: "Heading",
  paragraph: "Paragraph",
  list: "List",
  image: "Image",
  video: "Video",
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
      <div className="flex flex-col gap-4">
        {blocks.map((block, index) => (
          <div key={index} className="rounded-lg border border-ink/10 p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted">
              <span>{BLOCK_TYPE_LABELS[block.type]}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0}>
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(index, 1)}
                  disabled={index === blocks.length - 1}
                >
                  Down
                </button>
                <button type="button" onClick={() => removeBlock(index)} className="text-muted">
                  Remove
                </button>
              </div>
            </div>

            {block.type === "heading" && (
              <div className="flex flex-col gap-2">
                <input
                  className="rounded border border-ink/10 px-2 py-1 text-sm"
                  placeholder="Anchor id (e.g. the-real-failure-mode)"
                  value={block.id}
                  onChange={(e) => updateBlock(index, { ...block, id: e.target.value })}
                />
                <input
                  className="rounded border border-ink/10 px-2 py-1 text-sm"
                  placeholder="Heading text"
                  value={block.text}
                  onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                />
              </div>
            )}

            {block.type === "paragraph" && (
              <textarea
                className="w-full rounded border border-ink/10 px-2 py-1 text-sm"
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
                      className="flex-1 rounded border border-ink/10 px-2 py-1 text-sm"
                      value={item}
                      onChange={(e) => {
                        const nextItems = block.items.map((it, i) => (i === itemIndex ? e.target.value : it));
                        updateBlock(index, { ...block, items: nextItems });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const nextItems = block.items.filter((_, i) => i !== itemIndex);
                        updateBlock(index, { ...block, items: nextItems });
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="self-start text-sm text-brand"
                  onClick={() => updateBlock(index, { ...block, items: [...block.items, ""] })}
                >
                  Add item
                </button>
              </div>
            )}

            {block.type === "image" && (
              <div className="flex flex-col gap-2">
                <input
                  className="rounded border border-ink/10 px-2 py-1 text-sm"
                  placeholder="/blog/my-image.jpg"
                  value={block.src}
                  onChange={(e) => updateBlock(index, { ...block, src: e.target.value })}
                />
                <input
                  className="rounded border border-ink/10 px-2 py-1 text-sm"
                  placeholder="Alt text"
                  value={block.alt}
                  onChange={(e) => updateBlock(index, { ...block, alt: e.target.value })}
                />
              </div>
            )}

            {block.type === "video" && <p className="text-sm text-muted">Fixed video embed — no fields.</p>}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.keys(BLOCK_TYPE_LABELS) as ArticleBlock["type"][]).map((type) => (
          <button
            key={type}
            type="button"
            className="rounded border border-ink/10 px-3 py-1 text-sm"
            onClick={() => addBlock(type)}
          >
            + {BLOCK_TYPE_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  );
}
