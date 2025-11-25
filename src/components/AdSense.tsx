"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

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

export default function AdBanner({
  slot,
  format = "auto",
  layout,
  style,
}: AdBannerProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Push ad to queue after mount and on route change
    try {
      (window as Window & { adsbygoogle?: unknown[] }).adsbygoogle =
        (window as Window & { adsbygoogle?: unknown[] }).adsbygoogle || [];
      (window as Window & { adsbygoogle?: unknown[] }).adsbygoogle!.push({});
    } catch (e) {
      // Swallow errors to avoid breaking the app when ads aren't allowed
      // console.debug('AdSense push error:', e);
    }
  }, [pathname]);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", ...style }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
      {...(layout && { "data-ad-layout": layout })}
    />
  );
}
