// Creates a Neon Auth user account directly (no browser, no public sign-up
// page — this app deliberately doesn't ship one, since /cms is an
// invite-only tool for a fixed 2-4 person team; access is just "has a
// session," no roles involved). Run this yourself for each teammate
// rather than sharing it — you're choosing their initial password, so
// this is credential handling that belongs to you, not to an automated
// script run on your behalf.
//
// Usage:
//   node scripts/auth-create-user.mjs "you@company.com" "a-strong-password" "Your Name"
//
// Reads NEON_AUTH_BASE_URL / NEON_AUTH_COOKIE_SECRET from .env.local.

process.loadEnvFile(new URL("../.env.local", import.meta.url));

const [, , email, password, name] = process.argv;
if (!email || !password || !name) {
  console.error('Usage: node scripts/auth-create-user.mjs "<email>" "<password>" "<name>"');
  process.exit(1);
}

const { createAuthServer } = await import("@neondatabase/auth/server");

const auth = createAuthServer({
  baseUrl: process.env.NEON_AUTH_BASE_URL,
  cookieSecret: process.env.NEON_AUTH_COOKIE_SECRET,
  context: () => ({
    getCookies: () => "",
    setCookie: () => {},
    getHeader: () => null,
    getOrigin: () => "http://localhost:3000",
    getFramework: () => "node-script",
  }),
});

const { data, error } = await auth.signUp.email({ email, password, name });

if (error) {
  console.error("Failed to create account:", error.message);
  process.exit(1);
}

console.log(`Account created: ${data.user?.email} (id: ${data.user?.id})`);
console.log("They can sign in at /sign-in immediately with the email and password above.");
process.exit(0);
