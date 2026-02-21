/**
 * Database queries for the web app
 * 
 * Uses Drizzle to query from Neon PostgreSQL.
 */

import { db, items, categories, variants, assets, eq, and } from '@colouring-pages/shared';
import { cache } from 'react';

/**
 * Get coloring page by slug from database
 */
export const getColoringPageBySlugFromDB = cache(async (slug: string) => {
  // Get item by slug
  const item = await db.query.items.findFirst({
    where: and(
      eq(items.slug, slug),
      eq(items.isPublished, true)
    ),
  });

  if (!item) {
    return null;
  }

  // Get category
  const category = await db.query.categories.findFirst({
    where: eq(categories.id, item.categoryId),
  });

  // Get variants (PL and EN)
  const itemVariants = await db.query.variants.findMany({
    where: eq(variants.itemId, item.id),
  });

  // Get assets for each variant
  const variantsWithAssets = await Promise.all(
    itemVariants.map(async (variant) => {
      const variantAssets = await db.query.assets.findMany({
        where: eq(assets.variantId, variant.id),
      });
      return {
        ...variant,
        assets: variantAssets,
      };
    })
  );

  // Get primary image (first asset with image/png)
  const primaryAsset = variantsWithAssets[0]?.assets?.find(
    (a) => a.mimeType === 'image/png'
  );

  return {
    id: item.id,
    slug: item.slug,
    titlePl: item.titlePl,
    titleEn: item.titleEn,
    description: variantsWithAssets[0]?.description || '',
    imageUrl: primaryAsset?.storageUrl || null,
    categorySlug: category?.slug || null,
    categoryName: category?.namePl || '',
    locale: 'pl' as const,
  };
});

/**
 * Get all published categories
 */
export const getCategoriesFromDB = cache(async () => {
  const allCategories = await db.query.categories.findMany({
    where: eq(categories.isActive, true),
    orderBy: (categories, { asc }) => [asc(categories.displayOrder)],
  });

  // Get item count for each category
  const categoriesWithCounts = await Promise.all(
    allCategories.map(async (cat) => {
      const itemCount = await db.query.items.findMany({
        where: and(
          eq(categories.id, cat.id),
          eq(items.isPublished, true)
        ),
      });
      return {
        ...cat,
        itemCount: itemCount.length,
      };
    })
  );

  return categoriesWithCounts;
});

/**
 * Get category by slug
 */
export const getCategoryBySlugFromDB = cache(async (slug: string) => {
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  });

  if (!category) {
    return null;
  }

  // Get published items in this category
  const categoryItems = await db.query.items.findMany({
    where: and(
      eq(items.categoryId, category.id),
      eq(items.isPublished, true)
    ),
  });

  return {
    ...category,
    itemCount: categoryItems.length,
    items: categoryItems,
  };
});

/**
 * Get items by category slug
 */
export const getItemsByCategoryFromDB = cache(async (categorySlug: string) => {
  const category = await getCategoryBySlugFromDB(categorySlug);
  
  if (!category) {
    return [];
  }

  // Get items with their primary assets
  const itemsWithVariants = await Promise.all(
    category.items.map(async (item) => {
      const itemVariants = await db.query.variants.findMany({
        where: eq(variants.itemId, item.id),
      });
      
      // Get first asset
      const firstVariant = itemVariants[0];
      let imageUrl = null;
      
      if (firstVariant) {
        const variantAssets = await db.query.assets.findMany({
          where: eq(assets.variantId, firstVariant.id),
        });
        imageUrl = variantAssets[0]?.storageUrl || null;
      }

      return {
        slug: item.slug,
        titlePl: item.titlePl,
        titleEn: item.titleEn,
        imageUrl,
        difficulty: item.difficulty,
      };
    })
  );

  return itemsWithVariants;
});
