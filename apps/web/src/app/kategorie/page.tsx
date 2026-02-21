import { Metadata } from 'next';
import Link from 'next/link';
import { getAllCategories } from '@/lib/mock-data';
import { AdBannerPlaceholder, AdInFeedPlaceholder } from '@/components/AdPlaceholder';

export const metadata: Metadata = {
  title: 'Kategorie kolorowanek - colouring-Pages',
  description:
    'Wybierz kategorię kolorowanek dla swojego dziecka. Zwierzęta, samochody, bajki i wiele więcej.',
};

export default async function CategoriesPage() {
  // Użyj mock danych
  const categoryList = getAllCategories();

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

      {/* AdSense - Banner nad kategoriami */}
      <AdBannerPlaceholder />

      <div className="category-grid">
        {categoryList.map((category, index) => (
          <>
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
              </div>
            </Link>
            {/* In-feed ad co 4 kategorie */}
            {index > 0 && index % 4 === 0 && <AdInFeedPlaceholder key={`ad-${index}`} />}
          </>
        ))}
      </div>

      {/* AdSense - Banner pod kategoriami */}
      <AdBannerPlaceholder />
    </div>
  );
}
