'use client';
import { useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdBannerProps {
  slot: string; // Your ad unit slot ID (e.g., "1234567890")
  format?: string; // e.g., "auto" or "rectangle"
  layout?: string; // e.g., "in-article"
  style?: React.CSSProperties;
}

export default function AdBanner({ slot, format = 'auto', layout, style }: AdBannerProps) {
  useEffect(() => {
    // Push ad to queue after mount
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense push error:', e);
    }
  }, []);

  return (
    <>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        {...(layout && { 'data-ad-layout': layout })}
      />
      {/* Refresh ads on route changes */}
      <Script id="adsense-route-refresh">
        {`
          import { useRouter } from 'next/router';
          const router = useRouter();
          router.events.on('routeChangeComplete', () => {
            try {
              (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {}
          });
        `}
      </Script>
    </>
  );
}