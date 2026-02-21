'use client';

import { useEffect } from 'react';

interface AdSenseProps {
  adSlot?: string;
  adClient?: string;
  adFormat?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
}

// Default AdSense config - replace with your actual credentials
const DEFAULT_AD_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-XXXXXXXXXXXXXXXXX';
const DEFAULT_AD_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT || 'XXXXXXXXXX';

export function AdSense({
  adSlot = DEFAULT_AD_SLOT,
  adClient = DEFAULT_AD_CLIENT,
  adFormat = 'auto',
  className = ''
}: AdSenseProps) {
  useEffect(() => {
    // Load AdSense script
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      document.head.removeChild(script);
    };
  }, [adClient]);

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Banner ad - horizontal (728x90 or responsive)
export function AdBanner({ adSlot }: { adSlot?: string }) {
  return (
    <AdSense
      adSlot={adSlot || 'BANNER_AD_SLOT'}
      adFormat="horizontal"
      className="ad-banner"
    />
  );
}

// In-feed ad - for between content items
export function AdInFeed({ adSlot }: { adSlot?: string }) {
  return (
    <AdSense
      adSlot={adSlot || 'INFEED_AD_SLOT'}
      adFormat="auto"
      className="ad-infeed"
    />
  );
}

// Rectangle ad - for sidebar or in-content
export function AdRectangle({ adSlot }: { adSlot?: string }) {
  return (
    <AdSense
      adSlot={adSlot || 'RECTANGLE_AD_SLOT'}
      adFormat="rectangle"
      className="ad-rectangle"
    />
  );
}

// Sticky ad for mobile (bottom of screen)
export function AdSticky({ adSlot }: { adSlot?: string }) {
  return (
    <AdSense
      adSlot={adSlot || 'STICKY_AD_SLOT'}
      adFormat="auto"
      className="ad-sticky"
    />
  );
}
