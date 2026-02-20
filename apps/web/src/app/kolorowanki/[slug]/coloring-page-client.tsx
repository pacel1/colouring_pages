'use client';

import { useState } from 'react';
import Link from 'next/link';
import { generateAndDownloadPdf } from '@/lib/pdf-generator';
import type { Category, ColoringPage } from '@/lib/mock-data';

interface ColoringPageClientProps {
  page: ColoringPage;
  category: Category | null;
}

export function ColoringPageClient({ page, category }: ColoringPageClientProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      await generateAndDownloadPdf(page.title, page.description);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Wystąpił błąd podczas generowania PDF. Spróbuj ponownie.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

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
          <button
            className="btn btn-primary"
            onClick={handlePrint}
          >
            Drukuj kolorowankę
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? 'Generowanie PDF...' : 'Pobierz PDF'}
          </button>
        </div>
      </article>
    </div>
  );
}
