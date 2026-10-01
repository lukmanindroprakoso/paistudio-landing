import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});

/** A page-level auth.middleware() gate (proxy.ts's route matcher) does not
 * extend to Server Actions defined within a gated page — they're reachable
 * via a direct POST that bypasses middleware entirely — so every write path
 * re-checks here. Throws rather than redirecting: Server Actions run inside
 * a try/catch in most call sites and a thrown error is the right signal for
 * "reject this request," not a client-side navigation. */
export async function requireSession() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}
