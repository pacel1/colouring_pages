import { db, items, eq } from '@colouring-pages/shared';

const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

// Max URLs per sitemap (Google recommends max 50k, but 1k is safer for performance)
const MAX_URLS_PER_SITEMAP = 1000;

/**
 * Pages sitemap (colouring pages) - fetches from DB
 */
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  // Validate SITE_URL - required for production
  if (!process.env.SITE_URL) {
    console.error('SITE_URL is not configured - sitemap generation skipped');
    return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>', {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    });
  }

  // Fetch only published items from DB
  const pages = await db.query.items.findMany({
    where: eq(items.isPublished, true),
    limit: MAX_URLS_PER_SITEMAP,
  });

  const now = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url>
    <loc>${siteUrl}/kolorowanki/${page.slug}</loc>
    <lastmod>${page.publishedAt?.toISOString() || page.updatedAt?.toISOString() || now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
