import Link from "next/link";
import { CheckCircleIcon, CircleIcon, NewspaperIcon, PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { getAllBlogPostsForCms } from "@/lib/data/cms-blog-posts";
import { formatPublishedDate } from "@/lib/data/blog-db";
import { DeletePostButton } from "@/components/cms/DeletePostButton";

export const revalidate = 0;

export default async function CmsPage() {
  const posts = await getAllBlogPostsForCms();
  const draftCount = posts.filter((post) => post.status === "draft").length;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">CMS</h1>
          <p className="mt-1 text-sm text-muted">
            {posts.length === 0
              ? "No posts yet"
              : `${posts.length} ${posts.length === 1 ? "post" : "posts"}${
                  draftCount > 0 ? ` · ${draftCount} draft${draftCount === 1 ? "" : "s"}` : ""
                }`}
          </p>
        </div>
        <Link
          href="/cms/new"
          className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink/90"
        >
          New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/15 py-16 text-center">
          <NewspaperIcon size={32} weight="thin" className="text-muted" />
          <p className="text-sm text-muted">No posts yet — create the first one.</p>
          <Link
            href="/cms/new"
            className="mt-1 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink/90"
          >
            New Post
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <li
              key={post.slug}
              className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-paper p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(3,105,161,0.06)] transition hover:shadow-[0_2px_6px_rgba(0,0,0,0.1),0_8px_24px_rgba(3,105,161,0.08)] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                {post.status === "published" ? (
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-mint/30 px-2.5 py-1 text-xs font-medium text-deep">
                    <CheckCircleIcon size={14} weight="fill" />
                    Published
                  </span>
                ) : (
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-muted">
                    <CircleIcon size={14} />
                    Draft
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium text-text">{post.title}</p>
                  <p className="text-sm text-muted">
                    {post.tag} · {formatPublishedDate(post.published_at)}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                <Link
                  href={`/cms/${post.slug}/edit`}
                  aria-label={`Edit ${post.title}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-cream hover:text-text"
                >
                  <PencilSimpleIcon size={16} />
                </Link>
                <DeletePostButton slug={post.slug} title={post.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
