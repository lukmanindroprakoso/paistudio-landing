import Link from "next/link";
import { getAllBlogPostsForCms } from "@/lib/data/cms-blog-posts";
import { formatPublishedDate } from "@/lib/data/blog-db";
import { DeletePostButton } from "@/components/cms/DeletePostButton";

export const revalidate = 0;

export default async function CmsPage() {
  const posts = await getAllBlogPostsForCms();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">CMS</h1>
        <Link
          href="/cms/new"
          className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper"
        >
          New Post
        </Link>
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink/10 text-left text-muted">
            <th className="py-2 pr-4 font-medium">Title</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 pr-4 font-medium">Tag</th>
            <th className="py-2 pr-4 font-medium">Date</th>
            <th className="py-2 pr-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.slug} className="border-b border-ink/10">
              <td className="py-3 pr-4 text-text">{post.title}</td>
              <td className="py-3 pr-4">
                <span
                  className={
                    post.status === "published"
                      ? "rounded-full bg-mint/30 px-2 py-0.5 text-xs font-medium text-deep"
                      : "rounded-full bg-cream px-2 py-0.5 text-xs font-medium text-muted"
                  }
                >
                  {post.status === "published" ? "Published" : "Draft"}
                </span>
              </td>
              <td className="py-3 pr-4 text-muted">{post.tag}</td>
              <td className="py-3 pr-4 text-muted">{formatPublishedDate(post.published_at)}</td>
              <td className="py-3 pr-4">
                <Link href={`/cms/${post.slug}/edit`} className="mr-3 text-brand">
                  Edit
                </Link>
                <DeletePostButton slug={post.slug} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
