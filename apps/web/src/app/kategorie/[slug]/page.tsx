import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db, categories, items, eq, asc } from '@colouring-pages/shared';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  });

  if (!category) {
    return {
      title: 'Kategoria nie znaleziona - colouring-Pages',
    };
  }

  return {
    title: `${category.namePl} - Kolorowanki - colouring-Pages`,
    description: category.descriptionPl,
  };
}

export default async function CategoryPage({ 
  params,
  searchParams,
}: PageProps & {
  searchParams: Promise<{ page?: string }>
}) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  const page = parseInt(searchParamsResolved.page || '1', 10);
  const limit = 20;
  const offset = (page - 1) * limit;
  
  // Pobierz kategorię po slug
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  });

  if (!category) {
    notFound();
  }

  // Pobierz items tej kategorii
  const pages = await db.query.items.findMany({
    where: eq(items.categoryId, category.id),
    orderBy: asc(items.createdAt),
    limit,
    offset,
  });

  return (
    <div className="page">
      <div className="breadcrumbs">
        <Link href="/">Strona główna</Link>
        <span className="separator">›</span>
        <Link href="/kategorie">Kategorie</Link>
        <span className="separator">›</span>
        <span className="current">{category.namePl}</span>
      </div>

      <h1>{category.namePl}</h1>
      <p className="page-description">{category.descriptionPl}</p>

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
                <div className="coloring-placeholder">{page.titlePl.charAt(0)}</div>
              </div>
              <div className="coloring-info">
                <h3>{page.titlePl}</h3>
                <span className={`difficulty difficulty-${page.difficulty}`}>
                  {page.difficulty === 1
                    ? 'Łatwe'
                    : page.difficulty === 2
                      ? 'Średnie'
                      : 'Trudne'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {page > 1 && (
        <Link href={`/kategorie/${slug}?page=${page - 1}`} className="pagination">
          ← Poprzednia
        </Link>
      )}
      {pages.length === limit && (
        <Link href={`/kategorie/${slug}?page=${page + 1}`} className="pagination">
          Następna →
        </Link>
      )}
    </div>
  );
}
