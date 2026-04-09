import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Bebas_Neue, DM_Sans, Geist_Mono, Manrope } from "next/font/google";
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

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  adjustFontFallback: true,
});

/** Brand behind browser chrome — matches `bg-ff-hero-void` (not OLED black). */
const BRAND_CHROME = "#040a12";

export const metadata: Metadata = {
  title: "Firefly — Telugu club",
  description: "Food, daily DJs, and parties. Tollywood nights under the glow.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  /** Lets the page paint behind the status bar when added to Home Screen (iOS). */
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Firefly",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
  /** Single value — better support than media-query entries on mobile Safari / Chrome iOS. */
  themeColor: BRAND_CHROME,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${dmSans.variable} ${geistMono.variable} ${manrope.variable} h-full bg-ff-hero-void antialiased`}
    >
      <body className="min-h-full flex flex-col [overflow-anchor:none] bg-ff-hero-void text-zinc-50">
        <Script id="firefly-scroll-bootstrap" strategy="beforeInteractive">
          {`(function(){try{function stripBook(){if(location.hash==='#book'){history.replaceState(null,'',location.pathname+(location.search||''));return true}return false}function otherHash(){return location.hash&&location.hash!=='#book'}if(otherHash())return;stripBook();if('scrollRestoration'in history)history.scrollRestoration='manual';function s(){scrollTo(0,0);document.documentElement.scrollTop=0;document.documentElement.scrollLeft=0;document.body.scrollTop=0;document.body.scrollLeft=0;}s();addEventListener('pageshow',function(){if(otherHash())return;stripBook();if('scrollRestoration'in history)history.scrollRestoration='manual';s();});}catch(_){}})();`}
        </Script>
        <RestoreScrollOnLoad />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
