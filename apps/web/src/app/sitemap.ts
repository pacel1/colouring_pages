import { MetadataRoute } from 'next';
import { getAllCategories, getAllColoringPages } from '@/lib/mock-data';

const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

/**
 * Sitemap configuration
 *
 * Generates sitemap.xml with all available pages
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/kategorie`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Dynamic pages from categories
  const categories = getAllCategories();
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/kategorie/${category.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic pages from colouring pages
  const coloringPages = getAllColoringPages();
  const coloringPageUrls: MetadataRoute.Sitemap = coloringPages.map((page) => ({
    url: `${siteUrl}/kolorowanki/${page.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...coloringPageUrls];
}
