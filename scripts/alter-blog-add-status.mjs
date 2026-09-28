// One-off migration: adds draft/published status to blog_posts so the
// CMS can save a post without it going live immediately. Run with:
//   node scripts/alter-blog-add-status.mjs
// Reads POSTGRES_URL from .env.local (gitignored, not committed).
//
// The column is added with DEFAULT 'published' so ADD COLUMN backfills
// every existing row in the same statement (nothing already live
// disappears), then the default is switched to 'draft' for rows created
// from here on. Deliberately NOT a blanket `UPDATE ... SET status =
// 'published'` after the column exists — that statement is only safe to
// re-run before the CMS has ever saved a real draft; re-running it after
// would silently publish every draft in the database, which is exactly
// what the spec says must never happen. Both statements below stay safe
// to re-run indefinitely: ADD COLUMN IF NOT EXISTS is a no-op once the
// column exists (its DEFAULT is not re-applied to existing rows), and
// SET DEFAULT is idempotent regardless of the column's current state.

process.loadEnvFile(new URL("../.env.local", import.meta.url));

const { sql } = await import("@vercel/postgres");

await sql`
  ALTER TABLE blog_posts
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published'
      CHECK (status IN ('draft', 'published'));
`;
console.log("status column ready (existing rows backfilled to published via column default).");

await sql`ALTER TABLE blog_posts ALTER COLUMN status SET DEFAULT 'draft';`;
console.log("New rows now default to draft; existing rows untouched.");

process.exit(0);
