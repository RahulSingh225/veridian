import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Footer from "@/components/Footer";
import Link from "next/link";
import Script from "next/script";
import AdBanner from "@/components/AdSense";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Veridian - Productivity Tools & Converters",
  description:
    "Free online tools and converters for productivity: unit converters, PDF tools, image editors, and more.",
  keywords: [
    "productivity tools",
    "unit converter",
    "pdf converter",
    "image editor",
  ],
  openGraph: {
    title: "Veridian Productivity Tools",
    description: "Boost your workflow with free converters and tools.",
    images: "/og-image.png", // Add a 1200x630 image in /public
    url: "https://veridian.buzz",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@veridianbuzz", // Update with your handle
  },
};

const themelist = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const randomValue = themelist[Math.floor(Math.random() * themelist.length)];
  return (
    <html lang="en" suppressHydrationWarning data-theme={randomValue}>
      <head>
        <Script
          id="adsense"
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <header className="navbar bg-base-100 shadow-lg px-4">
          <div className="navbar-start">
            <div className="dropdown">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost lg:hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h8m-8 6h16"
                  />
                </svg>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <Link href="/tools">Tools</Link>
                </li>
                <li>
                  <Link href="/about">About</Link>
                </li>
              </ul>
            </div>
            <Link href="/" className="btn btn-ghost text-xl">
              Veridian
            </Link>
          </div>
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
              <li>
                <Link href="/tools">Tools</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
            </ul>
          </div>
        </header>

        <main className="flex-grow">{children}</main>

        <Footer />

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
