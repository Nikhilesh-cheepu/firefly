import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Bebas_Neue, DM_Sans, Geist_Mono, Manrope } from "next/font/google";
import Script from "next/script";
import { BassikChatEmbed } from "@/components/BassikChatEmbed";
import { BassikChatFabLoader } from "@/components/BassikChatFabLoader";
import { FacebookPixelHead } from "@/components/FacebookPixel";
import { FacebookPixelPageView } from "@/components/FacebookPixelPageView";
import { EnsurePageScrollable } from "@/components/EnsurePageScrollable";
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
      className={`${display.variable} ${dmSans.variable} ${geistMono.variable} ${manrope.variable} min-h-dvh bg-ff-hero-void antialiased`}
    >
      <head>
        <FacebookPixelHead />
      </head>
      <body className="min-h-dvh [overflow-anchor:none] bg-ff-hero-void text-zinc-50">
        <Script id="firefly-scroll-bootstrap" strategy="beforeInteractive">
          {`(function(){try{function unlock(){var h=document.documentElement,b=document.body;if(b.style.position==='fixed'){var t=Math.abs(parseInt(b.style.top||'0',10))||0;b.style.position='';b.style.top='';b.style.left='';b.style.right='';b.style.width='';if(t)scrollTo(0,t)}h.style.removeProperty('overflow');b.style.removeProperty('overflow')}function isHome(){var p=location.pathname||'';return p==='/'||p===''}function stripHash(){if(location.hash)history.replaceState(null,'',location.pathname+(location.search||''))}function run(){unlock();if(isHome())stripHash();else if(location.hash==='#book')stripHash();else if(location.hash)return;if('scrollRestoration'in history)history.scrollRestoration='manual';scrollTo(0,0);document.documentElement.scrollTop=0;document.documentElement.scrollLeft=0;document.body.scrollTop=0;document.body.scrollLeft=0}run();addEventListener('pageshow',function(){unlock();if(isHome())stripHash();else if(location.hash==='#book')stripHash();else if(location.hash)return;if('scrollRestoration'in history)history.scrollRestoration='manual';scrollTo(0,0);document.documentElement.scrollTop=0;document.documentElement.scrollLeft=0;document.body.scrollTop=0;document.body.scrollLeft=0});window.addEventListener('message',function(e){if(e.data&&e.data.type==='bassik-chat-close')setTimeout(unlock,0)})}catch(_){}})();`}
        </Script>
        <EnsurePageScrollable />
        <RestoreScrollOnLoad />
        <FacebookPixelPageView />
        {children}
        <BassikChatEmbed />
        <BassikChatFabLoader />
        <Analytics />
      </body>
    </html>
  );
}
