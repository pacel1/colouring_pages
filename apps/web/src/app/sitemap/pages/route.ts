import { getAllColoringPages } from '@/lib/mock-data';

const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

// Max URLs per sitemap (Google recommends max 50k, but 1k is safer for performance)
const MAX_URLS_PER_SITEMAP = 1000;

/**
 * Pages sitemap (colouring pages)
 * 
 * Supports chunking when we have more than MAX_URLS_PER_SITEMAP
 * For now, returns all pages. Later will support pagination via query params.
 */
export function GET(): Response {
  const pages = getAllColoringPages();
  const now = new Date().toISOString();

  // Slice to max URLs (for future chunking support)
  const urls = pages.slice(0, MAX_URLS_PER_SITEMAP);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((page) => `  <url>
    <loc>${siteUrl}/kolorowanki/${page.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
