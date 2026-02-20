import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getColoringPagesByCategory } from '@/lib/mock-data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Kategoria nie znaleziona - colouring-Pages',
    };
  }

  return {
    title: `${category.name} - Kolorowanki - colouring-Pages`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const pages = getColoringPagesByCategory(slug);

  return (
    <div className="page">
      <div className="breadcrumbs">
        <Link href="/">Strona główna</Link>
        <span className="separator">›</span>
        <Link href="/kategorie">Kategorie</Link>
        <span className="separator">›</span>
        <span className="current">{category.name}</span>
      </div>

      <h1>{category.name}</h1>
      <p className="page-description">{category.description}</p>

      {pages.length === 0 ? (
        <p>Brak kolorowanek w tej kategorii.</p>
      ) : (
        <div className="coloring-grid">
          {pages.map((page) => (
            <Link
              key={page.id}
              href={`/kolorowanki/${page.slug}`}
              className="coloring-card"
            >
              <div className="coloring-image">
                <div className="coloring-placeholder">{page.title.charAt(0)}</div>
              </div>
              <div className="coloring-info">
                <h3>{page.title}</h3>
                <p>{page.description}</p>
                <span className={`difficulty difficulty-${page.difficulty}`}>
                  {page.difficulty === 'easy'
                    ? 'Łatwe'
                    : page.difficulty === 'medium'
                      ? 'Średnie'
                      : 'Trudne'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
