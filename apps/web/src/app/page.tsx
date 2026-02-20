import Link from 'next/link';
import { db, categories, eq, asc } from '@colouring-pages/shared';

export default async function Home() {
  // Pobierz aktywne kategorie z DB
  const categoryList = await db.query.categories.findMany({
    where: eq(categories.isActive, true),
    orderBy: asc(categories.displayOrder),
    limit: 10,
  });

  return (
    <main>
      <h1>Witamy w colouring-Pages!</h1>
      <p>Programmatic SEO portal z kolorowankami dla dzieci.</p>
      <section>
        <h2>Kategorie</h2>
        {categoryList.length > 0 ? (
          <ul>
            {categoryList.map((category) => (
              <li key={category.id}>
                <Link href={`/kategorie/${category.slug}`}>
                  {category.namePl}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>Brak kategorii do wyświetlenia.</p>
        )}
      </section>
    </main>
  );
}
