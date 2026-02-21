'use client';

interface AdPlaceholderProps {
  type: 'banner' | 'infeed' | 'rectangle' | 'sticky';
  label?: string;
}

// Placeholder colors
const PLACEHOLDER_COLORS = {
  banner: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  infeed: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  rectangle: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  sticky: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
};

const PLACEHOLDER_HEIGHTS = {
  banner: '90px',
  infeed: '250px',
  rectangle: '250px',
  sticky: '50px',
};

export function AdPlaceholder({ type, label }: AdPlaceholderProps) {
  const height = PLACEHOLDER_HEIGHTS[type];
  const background = PLACEHOLDER_COLORS[type];
  const typeLabel = label || type.toUpperCase();

  return (
    <div
      className={`ad-placeholder ad-placeholder-${type}`}
      style={{
        height,
        background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        margin: '1.5rem 0',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '1rem',
        textTransform: 'uppercase',
        letterSpacing: '2px',
      }}
    >
      📺 Reklama {typeLabel}
    </div>
  );
}

// Banner placeholder - horizontal
export function AdBannerPlaceholder() {
  return <AdPlaceholder type="banner" label="BANNER 728x90" />;
}

// In-feed placeholder
export function AdInFeedPlaceholder() {
  return <AdPlaceholder type="infeed" label="IN-FEED" />;
}

// Rectangle placeholder
export function AdRectanglePlaceholder() {
  return <AdPlaceholder type="rectangle" label="RECTANGLE 300x250" />;
}

// Sticky placeholder
export function AdStickyPlaceholder() {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50px',
        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        zIndex: 1000,
      }}
    >
      📺 STICKY MOBILE AD
    </div>
  );
}
