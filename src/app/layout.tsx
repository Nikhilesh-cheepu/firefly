import type { Metadata, Viewport } from "next";
import { Bebas_Neue, DM_Sans, Geist_Mono } from "next/font/google";
import { RestoreScrollOnLoad } from "@/components/RestoreScrollOnLoad";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Firefly — Telugu club",
  description: "Food, daily DJs, and parties. Tollywood nights under the glow.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#040a12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${dmSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col [overflow-anchor:none] bg-ff-hero-void text-zinc-50">
        <RestoreScrollOnLoad />
        {children}
      </body>
    </html>
  );
}
