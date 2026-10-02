import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth/server";
import { signOut } from "@/lib/actions/auth-actions";

export const metadata: Metadata = {
  robots: { index: false },
};

// Server Components that call auth.getSession() must render dynamically —
// otherwise Next could cache a signed-in header for a signed-out visitor.
export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = await auth.getSession();

  return (
    <div className="min-h-screen bg-paper text-text">
      {session?.user && (
        <header className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <nav className="flex items-center gap-6 text-sm font-medium">
            <span className="font-semibold text-ink">Paistudio Internal</span>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/cms">Blog CMS</Link>
            <Link href="/cms/work">Work CMS</Link>
            <Link href="/internal">Internal</Link>
          </nav>
          <form action={signOut} className="flex items-center gap-3">
            <span className="text-sm text-muted">{session.user.name}</span>
            <button type="submit" className="text-sm text-muted hover:text-text">
              Sign out
            </button>
          </form>
        </header>
      )}
      <main className="p-6">{children}</main>
    </div>
  );
}
