import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/types/blog";
import { BlogAuthorRow } from "./BlogAuthorRow";

type FeaturedPostCardProps = {
  post: BlogPost;
};

/** Two-column featured card: text (tag, date, heading, description, author
 * row) on one side, cover image on the other. Card shell (`bg-cream`,
 * `rounded-[32px]`) is the same two-column-card idiom used by Pricing's
 * sprint row; no new radius/padding/background introduced. Links to the
 * post's detail page. Same cursor-follow hover bubble as /work's
 * ProjectCard (see `lib/hover-bubble/HoverBubble.ts`) on the image side —
 * the page rendering this must call `useHoverBubbles()` once (see
 * BlogPageBody.tsx). */
export function FeaturedPostCard({ post }: FeaturedPostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="grid w-full grid-cols-2 items-stretch gap-14 rounded-[32px] bg-cream p-12 no-underline max-[900px]:grid-cols-1 max-[900px]:gap-8 max-[900px]:p-8"
    >
      <div className="flex flex-col items-start gap-5">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-pill px-3.5 py-1.5 text-[14px] text-text">{post.tag}</span>
          <span className="text-[12px] tracking-[0.04em] text-muted">{post.date}</span>
        </div>
        <h2 className="m-0 text-[26px] leading-[1.2] font-medium tracking-[-0.01em] text-text text-balance">
          {post.title}
        </h2>
        {/* flex-1 fills the leftover height between title and author so the
            author row sits pinned to the card's bottom edge (matching the
            image column's height) instead of floating mid-height. */}
        <p className="m-0 flex-1 text-[18px] leading-[1.6] text-muted">{post.description}</p>
        <BlogAuthorRow author={post.author} meta={post.readTime} />
      </div>

      <div className="pai-hover-card w-full rounded-[32px]" style={{ aspectRatio: "5 / 4" }}>
        <Image
          src={post.coverImage}
          alt=""
          fill
          sizes="(max-width: 900px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="pai-hover-bubble text-center text-[13px] leading-[1.2] tracking-[0.01em] text-ink">
          <span>View</span>
        </div>
      </div>
    </Link>
  );
}
