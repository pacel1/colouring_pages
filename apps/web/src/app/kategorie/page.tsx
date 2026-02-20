import { Metadata } from 'next';
import Link from 'next/link';
import { db, categories, items, eq, asc } from '@colouring-pages/shared';

export const metadata: Metadata = {
  title: 'Kategorie kolorowanek - colouring-Pages',
  description:
    'Wybierz kategorię kolorowanek dla swojego dziecka. Zwierzęta, samochody, bajki i wiele więcej.',
};

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  // Pobierz kategorie z DB
  const categoryList = await db.query.categories.findMany({
    where: eq(categories.isActive, true),
    orderBy: asc(categories.displayOrder),
    limit,
    offset,
  });

  // Pobierz liczbę itemów dla każdej kategorii
  const categoriesWithCount = await Promise.all(
    categoryList.map(async (category) => {
      const itemsCount = await db.query.items.findFirst({
        where: eq(items.categoryId, category.id),
      });
      return { ...category };
    })
  );

  return (
    <div className="page">
      <div className="breadcrumbs">
        <Link href="/">Strona główna</Link>
        <span className="separator">›</span>
        <span className="current">Kategorie</span>
      </div>

      <h1>Kategorie kolorowanek</h1>
      <p className="page-description">
        Wybierz kategorię, aby przeglądać kolorowanki. Wszystkie obrazki są dostępne do
        darmowego druku.
      </p>

      <div className="category-grid">
        {categoriesWithCount.map((category) => (
          <Link
            key={category.id}
            href={`/kategorie/${category.slug}`}
            className="category-card"
          >
            <div className="category-image">
              <div className="category-placeholder">{category.namePl.charAt(0)}</div>
            </div>
            <div className="category-info">
              <h2>{category.namePl}</h2>
              <p>{category.descriptionPl}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {page > 1 && (
        <Link href={`/kategorie?page=${page - 1}`} className="pagination">
          ← Poprzednia
        </Link>
      )}
      <Link href={`/kategorie?page=${page + 1}`} className="pagination">
        Następna →
      </Link>
    </div>
  );
}
