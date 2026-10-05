import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Preloader } from "@/components/Preloader";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import "./globals.css";

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
        <GoogleAnalytics />
      </body>
    </html>
  );
}
