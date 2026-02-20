import { getAllCategories } from '@/lib/mock-data';

const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

/**
 * Categories sitemap
 */
export function GET(): Response {
  const categories = getAllCategories();
  const now = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${categories.map((category) => `  <url>
    <loc>${siteUrl}/kategorie/${category.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
