/**
 * Content Types - Typy dla treści (kategorie, itemy, warianty)
 * 
 * Definicje języków, formatów i typów treści.
 */

export type ContentLanguage = 'pl' | 'en';

export type ContentFormat = 'svg' | 'png' | 'html';

export type Difficulty = 1 | 2 | 3;

export interface Category {
  id: string;
  slug: string;
  namePl: string;
  nameEn: string;
  descriptionPl?: string;
  descriptionEn?: string;
  parentId?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  slug: string;
  titlePl: string;
  titleEn: string;
  categoryId: string;
  prompt?: string;
  keywords?: string[];
  ageMin: number;
  ageMax: number;
  difficulty: Difficulty;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Variant {
  id: string;
  itemId: string;
  locale: ContentLanguage;
  format: ContentFormat;
  title: string;
  description?: string;
  canonicalUrl: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  createdAt: Date;
}

export const SUPPORTED_LANGUAGES: ContentLanguage[] = ['pl', 'en'];

export const SUPPORTED_FORMATS: ContentFormat[] = ['svg', 'png', 'html'];

export const LANGUAGE_LABELS: Record<ContentLanguage, string> = {
  pl: 'Polski',
  en: 'English',
};

export const FORMAT_LABELS: Record<ContentFormat, string> = {
  svg: 'SVG (Vector)',
  png: 'PNG (Raster)',
  html: 'HTML (Interactive)',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: 'Łatwy',
  2: 'Średni',
  3: 'Trudny',
};
