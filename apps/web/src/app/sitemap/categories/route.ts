import { db, categories, eq, asc } from '@colouring-pages/shared';

const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

// Max URLs per sitemap (Google recommends max 50k, but 1k is safer for performance)
const MAX_URLS_PER_SITEMAP = 1000;

/**
 * Categories sitemap - fetches from DB
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

  // Fetch only active categories from DB
  const categoryList = await db.query.categories.findMany({
    where: eq(categories.isActive, true),
    orderBy: asc(categories.displayOrder),
    limit: MAX_URLS_PER_SITEMAP,
  });

  const now = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${categoryList.map((category) => `  <url>
    <loc>${siteUrl}/kategorie/${category.slug}</loc>
    <lastmod>${category.updatedAt?.toISOString() || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
