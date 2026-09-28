// One-off migration: adds draft/published status to blog_posts so the
// CMS can save a post without it going live immediately. Existing rows
// (all currently public) are backfilled to 'published' so nothing that
// was already live disappears. Run with:
//   node scripts/alter-blog-add-status.mjs
// Reads POSTGRES_URL from .env.local (gitignored, not committed).

process.loadEnvFile(new URL("../.env.local", import.meta.url));

const { sql } = await import("@vercel/postgres");

await sql`
  ALTER TABLE blog_posts
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft'
      CHECK (status IN ('draft', 'published'));
`;
console.log("status column ready.");

await sql`UPDATE blog_posts SET status = 'published' WHERE status = 'draft';`;
console.log("Existing rows backfilled to published.");

process.exit(0);
