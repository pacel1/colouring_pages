/**
 * Database Seed Script
 * 
 * Tworzy przykładowe dane dla developmentu:
 * - 10 kategorii placeholder
 * - 10 kolorowanek demo (items)
 * - Variants (PL/EN x SVG/PNG)
 * 
 * Użycie:
 * pnpm db:seed
 * 
 * Lub bezpośrednio:
 * npx tsx packages/shared/src/db/seed.ts
 */

import { db } from './index';
import { categories, items, variants } from './schema';
import { eq } from 'drizzle-orm';

// Placeholder categories
const CATEGORIES = [
  { slug: 'zwierzeta', namePl: 'Zwierzęta', nameEn: 'Animals', descriptionPl: 'Kolorowanki z zwierzętami', descriptionEn: 'Coloring pages with animals' },
  { slug: 'pojazdy', namePl: 'Pojazdy', nameEn: 'Vehicles', descriptionPl: 'Samochody, ciężarówki i inne pojazdy', descriptionEn: 'Cars, trucks and other vehicles' },
  { slug: 'bajki', namePl: 'Postacie z bajek', nameEn: 'Fairy Tale Characters', descriptionPl: 'Ulubione postacie z bajek', descriptionEn: 'Favorite fairy tale characters' },
  { slug: 'przyroda', namePl: 'Przyroda', nameEn: 'Nature', descriptionPl: 'Krajobrazy i przyroda', descriptionEn: 'Landscapes and nature' },
  { slug: 'bohaterowie-super', namePl: 'Bohaterowie super', nameEn: 'Super Heroes', descriptionPl: 'Super bohaterowie i postacie z komiksów', descriptionEn: 'Super heroes and comic characters' },
  { slug: 'jedzenie', namePl: 'Jedzenie', nameEn: 'Food', descriptionPl: 'Owoce, warzywa i jedzenie', descriptionEn: 'Fruits, vegetables and food' },
  { slug: 'dom', namePl: 'Dom i rodzina', nameEn: 'Home and Family', descriptionPl: 'Dom, rodzina i przyjaciele', descriptionEn: 'Home, family and friends' },
  { slug: 'sport', namePl: 'Sport i zabawa', nameEn: 'Sports and Play', descriptionPl: 'Sporty i zabawy dzieci', descriptionEn: 'Sports and children games' },
  { slug: 'zwierzeta-domowe', namePl: 'Zwierzęta domowe', nameEn: 'Pets', descriptionPl: 'Koty, psy i inne zwierzęta domowe', descriptionEn: 'Cats, dogs and other pets' },
  { slug: 'rosliny', namePl: 'Rośliny', nameEn: 'Plants', descriptionPl: 'Kwiaty, drzewa i rośliny', descriptionEn: 'Flowers, trees and plants' },
];

// Sample items (one per category)
const ITEMS = [
  { categorySlug: 'zwierzeta', slug: 'lew', titlePl: 'Lew', titleEn: 'Lion', prompt: 'A simple lion coloring page for children' },
  { categorySlug: 'pojazdy', slug: 'samochod-sportowy', titlePl: 'Samochód sportowy', titleEn: 'Sports car', prompt: 'A simple sports car coloring page' },
  { categorySlug: 'bajki', slug: 'ksiezniczka', titlePl: 'Księżniczka', titleEn: 'Princess', prompt: 'A simple princess coloring page' },
  { categorySlug: 'przyroda', slug: 'drzewo-z-liscami', titlePl: 'Drzewo z liśćmi', titleEn: 'Tree with leaves', prompt: 'A simple tree coloring page' },
  { categorySlug: 'bohaterowie-super', slug: 'superbohater', titlePl: 'Superbohater', titleEn: 'Superhero', prompt: 'A simple superhero coloring page' },
  { categorySlug: 'jedzenie', slug: 'jablko', titlePl: 'Jabłko', titleEn: 'Apple', prompt: 'A simple apple coloring page' },
  { categorySlug: 'dom', slug: 'dom', titlePl: 'Dom', titleEn: 'House', prompt: 'A simple house coloring page' },
  { categorySlug: 'sport', slug: 'pilka-nozna', titlePl: 'Piłka nożna', titleEn: 'Soccer ball', prompt: 'A simple soccer ball coloring page' },
  { categorySlug: 'zwierzeta-domowe', slug: 'kot', titlePl: 'Kot', titleEn: 'Cat', prompt: 'A simple cat coloring page' },
  { categorySlug: 'rosliny', slug: 'kwiatek', titlePl: 'Kwiatek', titleEn: 'Flower', prompt: 'A simple flower coloring page' },
];

// Locales and formats for variants
const LOCALES = ['pl', 'en'] as const;
const FORMATS = ['svg', 'png'] as const;

async function seed() {
  console.log('🌱 Starting database seed...\n');

  // Seed categories
  console.log('📂 Creating categories...');
  for (const cat of CATEGORIES) {
    const existing = await db.query.categories.findFirst({
      where: eq(categories.slug, cat.slug),
    });

    if (existing) {
      console.log(`  ⏭️  Skipping category: ${cat.slug} (already exists)`);
      continue;
    }

    await db.insert(categories).values({
      slug: cat.slug,
      namePl: cat.namePl,
      nameEn: cat.nameEn,
      descriptionPl: cat.descriptionPl,
      descriptionEn: cat.descriptionEn,
      isActive: true,
      displayOrder: CATEGORIES.indexOf(cat) + 1,
    });
    console.log(`  ✅ Created category: ${cat.slug}`);
  }

  // Seed items
  console.log('\n📄 Creating items...');
  for (const item of ITEMS) {
    // Find category
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, item.categorySlug),
    });

    if (!category) {
      console.log(`  ❌ Category not found: ${item.categorySlug}`);
      continue;
    }

    const existing = await db.query.items.findFirst({
      where: eq(items.slug, item.slug),
    });

    if (existing) {
      console.log(`  ⏭️  Skipping item: ${item.slug} (already exists)`);
      continue;
    }

    const [newItem] = await db.insert(items).values({
      slug: item.slug,
      titlePl: item.titlePl,
      titleEn: item.titleEn,
      categoryId: category.id,
      prompt: item.prompt,
      difficulty: 1,
      isPublished: true,
    }).returning();

    console.log(`  ✅ Created item: ${item.slug}`);

    // Create variants for each item
    for (const locale of LOCALES) {
      for (const format of FORMATS) {
        const title = locale === 'pl' ? item.titlePl : item.titleEn;
        const canonicalUrl = `https://colouring-pages.com/${locale === 'pl' ? 'kolorowanki' : 'coloring-pages'}/${item.slug}`;

        await db.insert(variants).values({
          itemId: newItem.id,
          locale,
          format,
          title: `${title} (${format.toUpperCase()})`,
          description: `${title} - ${format === 'svg' ? 'SVG' : 'PNG'} format coloring page`,
          canonicalUrl,
          metaTitle: `${title} - Kolorowanka do druku | colouring-Pages`,
          metaDescription: `Pobierz darmową kolorowankę ${title.toLowerCase()} w formacie ${format.toUpperCase()}. Idealne dla dzieci.`,
        });
        console.log(`    ✅ Created variant: ${item.slug} (${locale}/${format})`);
      }
    }
  }

  console.log('\n✨ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Categories: ${CATEGORIES.length}`);
  console.log(`   - Items: ${ITEMS.length}`);
  console.log(`   - Variants: ${ITEMS.length * LOCALES.length * FORMATS.length}`);
}

seed()
  .catch((error) => {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
