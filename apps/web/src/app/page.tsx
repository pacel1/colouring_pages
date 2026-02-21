import Link from 'next/link';
import { getAllCategories } from '@/lib/mock-data';
import { AdBannerPlaceholder, AdInFeedPlaceholder } from '@/components/AdPlaceholder';

export default async function Home() {
  // Użyj mock danych
  const categoryList = getAllCategories();

  return (
    <main>
      <h1>Witamy w colouring-Pages!</h1>
      <p>Programmatic SEO portal z kolorowankami dla dzieci.</p>
      
      {/* AdPlaceholder - Banner pod nagłówkiem */}
      <AdBannerPlaceholder />
      
      <section>
        <h2>Kategorie</h2>
        {categoryList.length > 0 ? (
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
        ) : (
          <p>Brak kategorii do wyświetlenia.</p>
        )}
      </section>

      {/* AdPlaceholder - Banner pod kategoriami */}
      <AdBannerPlaceholder />
    </main>
  );
}
