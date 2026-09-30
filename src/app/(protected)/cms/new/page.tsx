import { getDistinctAuthors } from "@/lib/data/cms-blog-posts";
import { PostForm } from "@/components/cms/PostForm";

export default async function NewPostPage() {
  const authors = await getDistinctAuthors();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-ink">New Post</h1>
      <PostForm authors={authors} />
    </div>
  );
}
