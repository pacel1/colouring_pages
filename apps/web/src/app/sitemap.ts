import { MetadataRoute } from 'next';

const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

/**
 * Sitemap Index
 *
 * Points to individual sitemap chunks for better organization
 * and to handle large numbers of URLs
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteUrl}/sitemap/static.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/sitemap/categories.xml`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/sitemap/pages.xml`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];
}
