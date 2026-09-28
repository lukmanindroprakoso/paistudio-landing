# Auth Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate three new route prefixes (`/dashboard`, `/cms`, `/internal`) behind Clerk sign-in, without touching the existing public marketing site, so the later Dashboard/CMS/Internal-Pages subsystems have somewhere authenticated to live.

**Architecture:** Clerk (Vercel Marketplace integration) provides auth. `proxy.ts` intercepts only the three protected prefixes via `clerkMiddleware` + `createRouteMatcher`; everything else passes through untouched. `ClerkProvider` and the authenticated shell live in a route-group layout (`src/app/(protected)/layout.tsx`), not the root layout, so Clerk's client bundle never ships to public pages.

**Tech Stack:** Next.js 16 (App Router, `proxy.ts`), `@clerk/nextjs` v7, Vercel Marketplace (Clerk integration), existing Tailwind setup.

**Spec:** `docs/superpowers/specs/2026-09-28-auth-foundation-design.md`

## Global Constraints

- No roles/permissions — every invited user gets identical access (per spec's Requirements section).
- No sign-up page or self-registration flow — invites happen from Clerk's own dashboard (per spec's Provider choice / Components sections).
- The auth gate must apply only to `/dashboard`, `/cms`, `/internal` — every other route (home, `/work`, `/blog`, service pages) must be byte-for-byte unaffected (per spec's Requirements and Routing sections).
- `ClerkProvider` must not wrap the root layout (`src/app/layout.tsx`) — it must be scoped to the new `(protected)` route group only (per spec's Provider scoping section).
- No automated test runner exists in this repo (`package.json` has no test script) — verification throughout this plan is manual, matching the spec's own Testing section. Do not introduce a test framework as part of this work.

## Review Focus

- A fresh clone/environment missing `CLERK_SECRET_KEY` / `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` locally should fail with a clear, attributable error, not a silent broken page — this already bit this project once with `POSTGRES_URL` (see spec's Error handling section); Task 1's verification step confirms the vars are actually present after pulling.
- Visiting `/sign-in` while already signed in should not loop or double-redirect — checked in Task 6's manual walkthrough.
- A nested, not-yet-built path under a protected prefix (e.g. `/dashboard/anything`) should still enforce the gate when signed out (matcher uses `(.*)`, not an exact match) — checked in Task 2's verification step.
- Public pages must ship with no added Clerk script/bundle in their network payload, confirming `ClerkProvider`'s scoping actually worked and didn't leak to the root layout — checked in Task 6's manual walkthrough.
- A second invited teammate (not just the first/admin account) must be able to sign in successfully — a single-account smoke test can pass while an invite-flow bug still blocks everyone else — checked in Task 6's manual walkthrough.

---

### Task 1: Install Clerk and verify environment variables

**Files:**
- Modify: `package.json` (add `@clerk/nextjs` dependency)
- Modify: `.env.local` (via `vercel env pull`, not hand-edited)

**Interfaces:**
- Produces: `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` available as environment variables for every later task to import via `@clerk/nextjs/server` and `@clerk/nextjs`.

- [ ] **Step 1: Confirm with the user before installing the Marketplace integration**

Installing a Vercel Marketplace integration changes the linked Vercel project's configuration and may have billing implications (Clerk has a free tier, but the action still touches shared account state). Ask the user to confirm before running the next step, the same way any action affecting shared/external state should be confirmed first.

- [ ] **Step 2: Install Clerk via the Vercel Marketplace**

Run:
```bash
npx vercel integration add clerk
```
Expected: CLI confirms Clerk is installed on the `paistudio-landing` project.

- [ ] **Step 3: Install the Clerk Next.js SDK**

Run:
```bash
npm install @clerk/nextjs
```
Expected: `@clerk/nextjs` appears under `dependencies` in `package.json`.

- [ ] **Step 4: Pull the newly-provisioned env vars**

Run:
```bash
npx vercel env pull .env.local --environment=development --yes
```
Expected output includes `+ CLERK_SECRET_KEY` and `+ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in the "Changes" list (same pattern used earlier in this project to pull `POSTGRES_URL`).

- [ ] **Step 5: Add the sign-in redirect env var locally and on Vercel**

Clerk's `auth.protect()` redirects to its own hosted Account Portal unless told otherwise — this project has its own `/sign-in` page (built in Task 4), so this var must exist before Task 2's gate is exercised.

Append to `.env.local`:
```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
```

Then add it to the Vercel project so Preview/Production deploys pick it up too (confirm with the user before running, since it writes to shared project config):
```bash
echo "/sign-in" | npx vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production preview --no-sensitive
echo "/sign-in" | npx vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL development --no-sensitive
```

- [ ] **Step 6: Verify the variables are actually loaded**

Run:
```bash
node -e "process.loadEnvFile('.env.local'); console.log('secret:', !!process.env.CLERK_SECRET_KEY, 'publishable:', !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, 'signInUrl:', process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL);"
```
Expected: `secret: true publishable: true signInUrl: /sign-in`. If any is `false`/blank, stop and re-run Step 4/5 rather than continuing — a later task failing on a missing key is harder to diagnose than catching it here.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add @clerk/nextjs dependency for auth foundation"
```
(`.env.local` is gitignored and must not be committed.)

---

### Task 2: Add the route gate (`proxy.ts`)

**Files:**
- Create: `proxy.ts` (repo root, next to `package.json` and `next.config.ts`)

**Interfaces:**
- Consumes: `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (from Task 1's env vars).
- Produces: request-level gating — any request under `/dashboard`, `/cms`, or `/internal` requires a valid Clerk session; every other request passes through unmodified. Later tasks (and later specs adding pages under these prefixes) rely on this gate already being in place.

- [ ] **Step 1: Write `proxy.ts`**

```ts
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

- [ ] **Step 2: Start the dev server**

Run:
```bash
npm run dev
```
Expected: server starts with no errors referencing `proxy.ts` or missing Clerk keys.

- [ ] **Step 3: Verify the gate redirects when signed out**

With the dev server running, visit `http://localhost:3000/dashboard`, `http://localhost:3000/cms`, `http://localhost:3000/internal`, and a nested path like `http://localhost:3000/dashboard/anything` in a browser with no Clerk session. Expected: all four requests redirect toward `/sign-in` (which will 404 until Task 4 — that 404 is expected and fine at this point; the important thing is the redirect happens instead of the protected page rendering).

- [ ] **Step 4: Verify public pages are unaffected**

Visit `http://localhost:3000/` and `http://localhost:3000/blog`. Expected: both render exactly as before, no redirect.

- [ ] **Step 5: Commit**

```bash
git add proxy.ts
git commit -m "Add Clerk route gate for /dashboard, /cms, /internal"
```

---

### Task 3: Add the protected layout (`ClerkProvider` + shell)

**Files:**
- Create: `src/app/(protected)/layout.tsx`

**Interfaces:**
- Consumes: `ClerkProvider`, `UserButton` from `@clerk/nextjs`.
- Produces: every page placed under `src/app/(protected)/` (Tasks 4 and 5, and any future page added by later specs) automatically gets `ClerkProvider` context and the shared header/nav — no per-page setup needed.

- [ ] **Step 1: Write the protected layout**

```tsx
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <div className="min-h-screen bg-paper text-text">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <nav className="flex items-center gap-6 text-sm font-medium">
            <span className="font-semibold text-heading">Paistudio Internal</span>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/cms">CMS</Link>
            <Link href="/internal">Internal</Link>
          </nav>
          <UserButton />
        </header>
        <main className="p-6">{children}</main>
      </div>
    </ClerkProvider>
  );
}
```

- [ ] **Step 2: Confirm it compiles**

Run:
```bash
npx tsc --noEmit -p tsconfig.json
```
Expected: no errors referencing `src/app/(protected)/layout.tsx`. (Pages under this layout don't exist yet, so this only checks the layout file itself compiles — full behavior is verified once Task 4/5 add pages.)

- [ ] **Step 3: Commit**

```bash
git add "src/app/(protected)/layout.tsx"
git commit -m "Add protected route-group layout with ClerkProvider"
```

---

### Task 4: Add the sign-in page

**Files:**
- Create: `src/app/(protected)/sign-in/[[...sign-in]]/page.tsx`

**Interfaces:**
- Consumes: `SignIn` from `@clerk/nextjs`; the `(protected)` layout from Task 3 (this page inherits it automatically via file-system nesting — route groups don't add a URL segment, so this page serves at `/sign-in`).
- Produces: a working `/sign-in` URL that Task 2's `NEXT_PUBLIC_CLERK_SIGN_IN_URL` redirect target resolves to.

- [ ] **Step 1: Write the sign-in page**

```tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
```

- [ ] **Step 2: Verify it renders**

With `npm run dev` running, visit `http://localhost:3000/sign-in`. Expected: Clerk's hosted sign-in form renders (no 404, no error).

- [ ] **Step 3: Verify the redirect from Task 2 now resolves**

Visit `http://localhost:3000/dashboard` while signed out. Expected: redirects to `/sign-in` and the form renders (this closes out the 404 noted as expected in Task 2, Step 3).

- [ ] **Step 4: Commit**

```bash
git add "src/app/(protected)/sign-in"
git commit -m "Add sign-in page for the protected route group"
```

---

### Task 5: Add placeholder pages for Dashboard, CMS, Internal

**Files:**
- Create: `src/app/(protected)/dashboard/page.tsx`
- Create: `src/app/(protected)/cms/page.tsx`
- Create: `src/app/(protected)/internal/page.tsx`

**Interfaces:**
- Consumes: the `(protected)` layout from Task 3 (inherited automatically).
- Produces: three real, navigable pages that later specs (Dashboard content, CMS authoring UI, Internal Pages content) will replace/extend in place — this task's only job is to prove the gate + shell work end-to-end.

- [ ] **Step 1: Write the dashboard placeholder**

```tsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-heading">Dashboard</h1>
      <p className="mt-2 text-muted">Coming soon.</p>
    </div>
  );
}
```

- [ ] **Step 2: Write the CMS placeholder**

```tsx
export default function CmsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-heading">CMS</h1>
      <p className="mt-2 text-muted">Coming soon.</p>
    </div>
  );
}
```

- [ ] **Step 3: Write the internal placeholder**

```tsx
export default function InternalPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-heading">Internal</h1>
      <p className="mt-2 text-muted">Coming soon.</p>
    </div>
  );
}
```

- [ ] **Step 4: Verify all three render when signed in**

Sign in at `http://localhost:3000/sign-in` using an invited Clerk account (see Task 1's confirmation step — inviting the first user from the Clerk dashboard is a manual, one-time action outside this codebase). Visit `/dashboard`, `/cms`, `/internal`. Expected: each renders its placeholder text and the shared header with working nav links and a `UserButton`.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(protected)/dashboard" "src/app/(protected)/cms" "src/app/(protected)/internal"
git commit -m "Add placeholder pages for dashboard, CMS, and internal routes"
```

---

### Task 6: End-to-end manual verification

**Files:** none (verification only).

**Interfaces:** none — this task only exercises the system built by Tasks 1-5.

- [ ] **Step 1: Invite a second teammate (manual, outside this codebase)**

From the Clerk dashboard's Invitations screen, invite a second team email address. Confirm with the user which second address to use before sending the invite, since it sends an email to a real person.

- [ ] **Step 2: Verify the second teammate can sign in**

Have the second invited person (or simulate via a second browser profile/incognito window if unavailable) visit `http://localhost:3000/sign-in`, accept the invite, and sign in. Expected: they land on `/dashboard` (or wherever they were redirected from) successfully — this is the check called out in the plan's Review Focus for invite-flow bugs that a single-account test would miss.

- [ ] **Step 3: Verify no double-redirect when already signed in**

While signed in, visit `http://localhost:3000/sign-in` directly. Expected: either the sign-in form still renders without looping, or Clerk redirects once to a protected page — not a repeated bounce between `/sign-in` and a protected route.

- [ ] **Step 4: Verify public pages ship no Clerk payload**

Open browser dev tools' Network tab, visit `http://localhost:3000/` and `http://localhost:3000/blog`. Expected: no request to a `clerk.*` domain and no Clerk JS chunk in the loaded resources — confirming `ClerkProvider`'s scoping to `(protected)` in Task 3 didn't leak into the root layout.

- [ ] **Step 5: Verify sign-out**

While signed in on any protected page, use the `UserButton` to sign out. Expected: session clears and a subsequent visit to `/dashboard` redirects back to `/sign-in`.

- [ ] **Step 6: Final full-repo check**

Run:
```bash
npx tsc --noEmit -p tsconfig.json
```
Expected: no errors anywhere in the repo (confirms Tasks 1-5 didn't introduce a type error missed by their individual per-task checks).
