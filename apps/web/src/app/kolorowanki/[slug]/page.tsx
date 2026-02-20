import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getColoringPageBySlug, getCategoryBySlug } from '@/lib/mock-data';

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

  const category = getCategoryBySlug(page.categorySlug);

  return (
    <div className="page">
      <div className="breadcrumbs">
        <Link href="/">Strona główna</Link>
        <span className="separator">›</span>
        <Link href="/kategorie">Kategorie</Link>
        <span className="separator">›</span>
        {category && (
          <>
            <Link href={`/kategorie/${category.slug}`}>{category.name}</Link>
            <span className="separator">›</span>
          </>
        )}
        <span className="current">{page.title}</span>
      </div>

      <article className="coloring-page">
        <header>
          <h1>{page.title}</h1>
          <p className="coloring-description">{page.description}</p>
        </header>

        <div className="coloring-preview">
          <div className="coloring-placeholder-large">{page.title.charAt(0)}</div>
          <p className="placeholder-note">
            [Tu będzie obraz kolorowanki - placeholder do zastąpienia]
          </p>
        </div>

        <div className="coloring-meta">
          <div className="meta-item">
            <span className="meta-label">Poziom trudności:</span>
            <span className={`difficulty difficulty-${page.difficulty}`}>
              {page.difficulty === 'easy'
                ? 'Łatwe'
                : page.difficulty === 'medium'
                  ? 'Średnie'
                  : 'Trudne'}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Język:</span>
            <span>{page.language === 'pl' ? 'Polski' : 'Angielski'}</span>
          </div>
          {category && (
            <div className="meta-item">
              <span className="meta-label">Kategoria:</span>
              <Link href={`/kategorie/${category.slug}`}>{category.name}</Link>
            </div>
          )}
        </div>

        <div className="coloring-actions">
          <button className="btn btn-primary" disabled>
            Drukuj kolorowankę (wkrótce)
          </button>
          <button className="btn btn-secondary" disabled>
            Pobierz PDF (wkrótce)
          </button>
        </div>
      </article>
    </div>
  );
}
