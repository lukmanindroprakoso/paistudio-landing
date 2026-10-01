# Auth Foundation — Design Spec

## Context

Paistudio's roadmap has four internal-facing pieces planned: a Dashboard,
a CMS for blog authoring, a Visitor tracker, and Internal Pages. Three of
these (Dashboard, CMS, Internal Pages) need to sit behind a login; none
of that exists yet — the project currently has zero auth (no
`next-auth`/Clerk/etc. in `package.json`, no `middleware.ts`/`proxy.ts`,
no `/dashboard` or similar routes). Rather than build a login flow three
separate times, this spec covers a single shared auth foundation that the
other three specs will build on top of.

This phase delivers the gate and an empty authenticated shell only — no
Dashboard/CMS/Internal *content*. That's each subsystem's own future spec.

## Requirements

- **Users:** a small, fixed team (2-4 people), all with identical access
  — no roles or permission tiers.
- **Sign-in only, no sign-up:** invite-only. New teammates are added by an
  admin from the auth provider's own dashboard, not through a public
  registration flow in the app.
- **Public site untouched:** the existing marketing site (home, `/work`,
  `/blog`, service pages) must see zero behavior or bundle-size change.
  The auth gate and its client-side overhead apply only to the new
  protected routes.

## Provider choice: Clerk

Clerk is a native Vercel Marketplace integration for this project (same
platform as the Neon/Postgres integration already in use) — env vars
(`CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`) are
auto-provisioned the same way `POSTGRES_URL` already is, pulled via
`vercel env pull .env.local`. It ships pre-built `<SignIn />` /
`<UserButton />` components, so there's no custom auth UI to build, and
invite-only access is a built-in dashboard feature (no self-signup code
to write or secure).

Alternatives considered: a self-rolled NextAuth + Google-OAuth allow-list
(more code to own, no material benefit for 2-4 users), and a single
shared-password middleware gate (no per-user identity, harder to revoke
one person without changing everyone's credential). Clerk was preferred
for least code and least new surface area to maintain.

## Architecture

### Routing

Three new route prefixes, gated at the request level:

- `/dashboard` — landing page for the future Dashboard subsystem
- `/cms` — landing page for the future blog CMS subsystem
- `/internal` — landing page for the future Internal Pages subsystem

`proxy.ts` (Next.js 16's request-interception file — `middleware.ts` on
older versions) uses `clerkMiddleware` + `createRouteMatcher` scoped to
exactly these three prefixes (plus their nested paths, once later specs
add pages underneath). No other route is touched.

```ts
// proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/cms(.*)",
  "/internal(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
```

### Provider scoping

`ClerkProvider` wraps a new route-group layout at
`src/app/(protected)/layout.tsx`, not the root layout at
`src/app/layout.tsx`. The public site's root layout is untouched, so
Clerk's client bundle never ships to marketing pages. Sign-in and the
three placeholder pages live inside `(protected)`.

### Components this phase adds

- `proxy.ts` — the route gate (see above)
- `src/app/(protected)/layout.tsx` — `ClerkProvider` + a minimal
  authenticated shell (nav placeholder, `<UserButton />` for sign-out)
- `src/app/(protected)/sign-in/[[...sign-in]]/page.tsx` — Clerk's hosted
  `<SignIn />`
- `src/app/(protected)/dashboard/page.tsx`,
  `src/app/(protected)/cms/page.tsx`,
  `src/app/(protected)/internal/page.tsx` — empty placeholders (e.g.
  "Dashboard — coming soon") that exist purely to prove the gate works;
  their real content is out of scope here

No sign-up page is created. Team members are invited from Clerk's own
dashboard (Invitations screen); the app has no self-registration route.

## Data flow

1. Visitor requests a path under `/dashboard`, `/cms`, or `/internal`.
2. `proxy.ts` intercepts, `clerkMiddleware` checks the session cookie.
3. No valid session → `auth.protect()` redirects to `/sign-in`.
4. Successful sign-in sets Clerk's session cookie and redirects back to
   the originally requested path.
5. Server components under `(protected)` read identity via
   `currentUser()` / `await auth()` when needed (e.g. to greet the user
   or attribute an action) — no local `users` table, since Clerk is the
   single source of truth for "who can log in" and there are no role
   distinctions to store elsewhere.

## Error handling

- Unauthenticated access to a protected prefix → redirect to sign-in
  (Clerk's default `auth.protect()` behavior).
- Public marketing routes are outside the `proxy.ts` matcher entirely, so
  they're unaffected by any Clerk failure mode.
- Missing `CLERK_SECRET_KEY` locally (e.g. forgot to re-pull env vars
  after installing the integration) surfaces as a clear startup/runtime
  error from the Clerk SDK — same class of issue as the `POSTGRES_URL`
  gap fixed earlier in this project, same fix (`vercel env pull
  .env.local --environment=development --yes`).

## Explicitly out of scope (deferred)

- Roles/permissions — all invited users get identical access; revisit
  only if a future subsystem (e.g. CMS) needs an editor-vs-admin split.
- Custom sign-up/registration flow.
- Any profile management UI beyond Clerk's built-in `<UserButton />`.
- Actual Dashboard, CMS, Visitor tracker, or Internal Pages content —
  each gets its own design/spec once this foundation lands.

## Testing

No automated test runner exists in this repo (`package.json` has no
test script). Verification for this phase is manual:

1. Log out / clear session — confirm visiting `/dashboard`, `/cms`, and
   `/internal` each redirect to `/sign-in`.
2. Sign in as an invited user — confirm all three prefixes now load
   their placeholder pages.
3. Confirm a second invited teammate can also sign in successfully.
4. Confirm public pages (`/`, `/work`, `/blog`, service pages) render
   identically to before this change, with no added Clerk script/bundle
   in their network payload.
