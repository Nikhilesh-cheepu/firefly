import type { Metadata, Viewport } from "next";
import { Bebas_Neue, DM_Sans, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { RestoreScrollOnLoad } from "@/components/RestoreScrollOnLoad";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  adjustFontFallback: true,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
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
        <Script id="firefly-scroll-bootstrap" strategy="beforeInteractive">
          {`(function(){try{function stripBook(){if(location.hash==='#book'){history.replaceState(null,'',location.pathname+(location.search||''));return true}return false}function otherHash(){return location.hash&&location.hash!=='#book'}if(otherHash())return;stripBook();if('scrollRestoration'in history)history.scrollRestoration='manual';function s(){scrollTo(0,0);document.documentElement.scrollTop=0;document.documentElement.scrollLeft=0;document.body.scrollTop=0;document.body.scrollLeft=0;}s();addEventListener('pageshow',function(){if(otherHash())return;stripBook();if('scrollRestoration'in history)history.scrollRestoration='manual';s();});}catch(_){}})();`}
        </Script>
        <RestoreScrollOnLoad />
        {children}
      </body>
    </html>
  );
}
