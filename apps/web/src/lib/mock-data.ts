/**
 * Mock data for development - replace with DB queries later
 * This file provides sample categories and colouring pages for SEO routing
 */

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  itemCount: number;
  imageUrl: string;
}

export interface ColoringPage {
  id: string;
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  imageUrl: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: 'pl' | 'en';
}

// Sample categories (mock data)
export const categories: Category[] = [
  {
    id: '1',
    slug: 'zwierzeta',
    name: 'Zwierzęta',
    description: 'Kolorowanki z zwierzętami domowymi i dzikimi',
    itemCount: 25,
    imageUrl: '/images/categories/zwierzeta.jpg',
  },
  {
    id: '2',
    slug: 'samochody',
    name: 'Samochody',
    description: 'Kolorowanki z samochodami, ciężarówkami i pojazdami',
    itemCount: 18,
    imageUrl: '/images/categories/samochody.jpg',
  },
  {
    id: '3',
    slug: 'bajki',
    name: 'Postacie z bajek',
    description: 'Ulubione postacie z popularnych bajek i kreskówek',
    itemCount: 32,
    imageUrl: '/images/categories/bajki.jpg',
  },
  {
    id: '4',
    slug: 'przyroda',
    name: 'Przyroda',
    description: 'Krajobrazy, drzewa, kwiaty i elementy przyrody',
    itemCount: 20,
    imageUrl: '/images/categories/przyroda.jpg',
  },
  {
    id: '5',
    slug: 'bohaterowie-super',
    name: 'Bohaterowie super',
    description: 'Super bohaterowie i postacie z komiksów',
    itemCount: 15,
    imageUrl: '/images/categories/bohaterowie-super.jpg',
  },
];

// Sample coloring pages (mock data)
export const coloringPages: ColoringPage[] = [
  // Zwierzęta
  {
    id: '1',
    slug: 'kotek',
    title: 'Kotek',
    description: 'Ładny kotek do pokolorowania',
    categorySlug: 'zwierzeta',
    imageUrl: '/images/pages/kotek.jpg',
    difficulty: 'easy',
    language: 'pl',
  },
  {
    id: '2',
    slug: 'piesek',
    title: 'Piesek',
    description: 'Wesoły piesek do pokolorowania',
    categorySlug: 'zwierzeta',
    imageUrl: '/images/pages/piesek.jpg',
    difficulty: 'easy',
    language: 'pl',
  },
  {
    id: '3',
    slug: 'lew',
    title: 'Lew',
    description: 'Król zwierząt - lew do pokolorowania',
    categorySlug: 'zwierzeta',
    imageUrl: '/images/pages/lew.jpg',
    difficulty: 'medium',
    language: 'pl',
  },
  // Samochody
  {
    id: '4',
    slug: 'sportowy',
    title: 'Samochód sportowy',
    description: 'Szybki samochód sportowy',
    categorySlug: 'samochody',
    imageUrl: '/images/pages/sportowy.jpg',
    difficulty: 'medium',
    language: 'pl',
  },
  {
    id: '5',
    slug: 'ciezarowka',
    title: 'Ciężarówka',
    description: 'Duża ciężarówka do pokolorowania',
    categorySlug: 'samochody',
    imageUrl: '/images/pages/ciezarowka.jpg',
    difficulty: 'hard',
    language: 'pl',
  },
  // Bajki
  {
    id: '6',
    slug: 'ksiaze',
    title: 'Książę',
    description: 'Bajkowy książę w koronie',
    categorySlug: 'bajki',
    imageUrl: '/images/pages/ksiaze.jpg',
    difficulty: 'medium',
    language: 'pl',
  },
  {
    id: '7',
    slug: 'ksiezniczka',
    title: 'Księżniczka',
    description: 'Piękna księżniczka w sukience',
    categorySlug: 'bajki',
    imageUrl: '/images/pages/ksiezniczka.jpg',
    difficulty: 'medium',
    language: 'pl',
  },
  // Przyroda
  {
    id: '8',
    slug: 'drzewo',
    title: 'Drzewo',
    description: 'Duże drzewo z liśćmi',
    categorySlug: 'przyroda',
    imageUrl: '/images/pages/drzewo.jpg',
    difficulty: 'easy',
    language: 'pl',
  },
  {
    id: '9',
    slug: 'kwiat',
    title: 'Kwiat',
    description: 'Kolorowy kwiatek',
    categorySlug: 'przyroda',
    imageUrl: '/images/pages/kwiat.jpg',
    difficulty: 'easy',
    language: 'pl',
  },
  // Bohaterowie super
  {
    id: '10',
    slug: 'superbohater',
    title: 'Superbohater',
    description: 'Super bohater w pelerynie',
    categorySlug: 'bohaterowie-super',
    imageUrl: '/images/pages/superbohater.jpg',
    difficulty: 'hard',
    language: 'pl',
  },
];

/**
 * Get all categories
 */
export function getAllCategories(): Category[] {
  return categories;
}

/**
 * Get category by slug
 */
export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

/**
 * Get coloring pages by category slug
 */
export function getColoringPagesByCategory(categorySlug: string): ColoringPage[] {
  return coloringPages.filter((p) => p.categorySlug === categorySlug);
}

/**
 * Get coloring page by slug
 */
export function getColoringPageBySlug(slug: string): ColoringPage | undefined {
  return coloringPages.find((p) => p.slug === slug);
}

/**
 * Get all coloring pages
 */
export function getAllColoringPages(): ColoringPage[] {
  return coloringPages;
}
