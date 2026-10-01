import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { Preloader } from "@/components/Preloader";
import "./globals.css";

// Google Analytics (gtag.js) — property G-J0FLRQ51MC. `next/script` with
// `strategy="afterInteractive"` (not a plain <script> tag) is Next.js's
// own recommended pattern for third-party analytics: it loads after the
// page is interactive rather than blocking initial render/hydration.
// Both scripts live in the root layout so every route gets tracked, not
// just one page. The inline config script needs an `id` prop (Next.js
// requirement for inline `Script` bodies) — doesn't affect the emitted
// script itself.
const GA_MEASUREMENT_ID = "G-XT623RMP4L";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Paistudio — AI-Empowered Product Team for Founders",
  description:
    "Paistudio helps founders design, build, and launch AI-powered SaaS, marketplaces, and internal tools faster using Bubble, AI, and modern no-code technology.",
  metadataBase: new URL("https://paistudio.co"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "Paistudio — AI-Empowered Product Team for Founders",
    description:
      "Design, development, AI, and automation in one team. Launch your SaaS, marketplace, or internal tool in weeks, not months.",
    images: ["/logos/paistudio-logo-light.svg"],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full bg-paper font-sans text-text">
        <Preloader />
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
