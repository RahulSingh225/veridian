import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: 'Veridian - Productivity Tools & Converters',
  description: 'Free online tools and converters for productivity: unit converters, PDF tools, image editors, and more.',
  keywords: ['productivity tools', 'unit converter', 'pdf converter', 'image editor'],
  openGraph: {
    title: 'Veridian Productivity Tools',
    description: 'Boost your workflow with free converters and tools.',
    images: '/og-image.png',  // Add a 1200x630 image in /public
    url: 'https://veridian.buzz',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@veridianbuzz',  // Update with your handle
  },
};
const themelist = [      'light',
      'dark',
      'cupcake',
      'bumblebee',
      'emerald',
      'corporate',
      'synthwave',
      'retro',
      'cyberpunk',
      'valentine',
      'halloween',
      'garden',
      'forest',
      'aqua',
      'lofi',
      'pastel',
      'fantasy',
      'wireframe',
      'black',
      'luxury',
      'dracula',
      'cmyk',
      'autumn',
      'business',
      'acid',
      'lemonade',
      'night',
      'coffee',
      'winter']
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
const randomValue = themelist[Math.floor(Math.random() * themelist.length)];
  
  return (
    <html lang="en" data-theme={randomValue}>
      <SpeedInsights/>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        {children}
      </body>
      <Analytics mode="production" />
    </html>
  );
}
