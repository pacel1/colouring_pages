import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getColoringPagesByCategory } from '@/lib/mock-data';
import { AdBannerPlaceholder, AdInFeedPlaceholder } from '@/components/AdPlaceholder';

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

      {/* AdSense - Banner nad kolorowankami */}
      <AdBannerPlaceholder />

      {pages.length === 0 ? (
        <p>Brak kolorowanek w tej kategorii.</p>
      ) : (
        <div className="coloring-grid">
          {pages.map((pageItem, index) => (
            <>
              <Link
                key={pageItem.id}
                href={`/kolorowanki/${pageItem.slug}`}
                className="coloring-card"
              >
                <div className="coloring-image">
                  <div className="coloring-placeholder">{pageItem.title.charAt(0)}</div>
                </div>
                <div className="coloring-info">
                  <h3>{pageItem.title}</h3>
                  <span className={`difficulty difficulty-${pageItem.difficulty}`}>
                    {pageItem.difficulty === 'easy'
                      ? 'Łatwe'
                      : pageItem.difficulty === 'medium'
                        ? 'Średnie'
                        : 'Trudne'}
                  </span>
                </div>
              </Link>
              {/* In-feed ad co 6 kolorowanek */}
              {index > 0 && index % 6 === 0 && <AdInFeedPlaceholder key={`ad-${index}`} />}
            </>
          ))}
        </div>
      )}

      {/* AdSense - Banner pod kolorowankami */}
      <AdBannerPlaceholder />
    </div>
  );
}
