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
