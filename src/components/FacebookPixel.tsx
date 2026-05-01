import Script from "next/script";

function getFacebookPixelId(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_META_PIXEL_ID ??
    process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID ??
    "943240848701865";
  const id = raw.replace(/\D/g, "");
  return id.length > 0 ? id : null;
}

/**
 * Meta Pixel base code for `<head>` (init + `PageView` on full load).
 * Client navigations: add `<FacebookPixelPageView />` in `<body>`.
 */
export function FacebookPixelHead() {
  const pixelId = getFacebookPixelId();
  if (!pixelId) return null;

  const inline =
    "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');" +
    `fbq('init', '${pixelId}');fbq('track','PageView');`;

  return (
    <>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: inline }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          height={1}
          width={1}
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
