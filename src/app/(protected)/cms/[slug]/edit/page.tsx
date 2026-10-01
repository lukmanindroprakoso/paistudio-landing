import { notFound } from "next/navigation";
import { getBlogPostForEditing, getDistinctAuthors } from "@/lib/data/cms-blog-posts";
import { PostForm } from "@/components/cms/PostForm";

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, authors] = await Promise.all([getBlogPostForEditing(slug), getDistinctAuthors()]);

  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-ink">Edit Post</h1>
      <PostForm authors={authors} initialPost={post} />
    </div>
  );
}
