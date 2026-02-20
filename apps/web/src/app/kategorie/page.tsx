import { Metadata } from 'next';
import Link from 'next/link';
import { getAllCategories } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Kategorie kolorowanek - colouring-Pages',
  description:
    'Wybierz kategorię kolorowanek dla swojego dziecka. Zwierzęta, samochody, bajki i wiele więcej.',
};

export default function CategoriesPage() {
  const categories = getAllCategories();

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
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/kategorie/${category.slug}`}
            className="category-card"
          >
            <div className="category-image">
              <div className="category-placeholder">{category.name.charAt(0)}</div>
            </div>
            <div className="category-info">
              <h2>{category.name}</h2>
              <p>{category.description}</p>
              <span className="item-count">{category.itemCount} kolorowanek</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
