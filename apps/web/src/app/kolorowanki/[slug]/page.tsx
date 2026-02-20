import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getColoringPageBySlug, getCategoryBySlug } from '@/lib/mock-data';
import { ColoringPageClient } from './coloring-page-client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getColoringPageBySlug(slug);

  if (!page) {
    return {
      title: 'Kolorowanka nie znaleziona - colouring-Pages',
    };
  }

  return {
    title: `${page.title} - Kolorowanka do druku - colouring-Pages`,
    description: page.description,
  };
}

export default async function ColoringPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getColoringPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const category = getCategoryBySlug(page.categorySlug) ?? null;

  return (
    <ColoringPageClient
      page={page}
      category={category}
    />
  );
}
