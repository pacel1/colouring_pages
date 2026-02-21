'use client';

import { useState } from 'react';
import Link from 'next/link';
import { generateAndDownloadPdf } from '@/lib/pdf-generator';
import { AdBannerPlaceholder } from '@/components/AdPlaceholder';

interface ColoringPageClientProps {
  page: {
    slug: string;
    title: string;
    description: string;
    imageUrl: string;
    categorySlug: string;
    difficulty: 'easy' | 'medium' | 'hard';
    language: 'pl' | 'en';
  };
  category: {
    slug: string;
    name: string;
    description: string;
    itemCount: number;
    imageUrl: string;
  } | null;
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
        {/* AdPlaceholder - Banner przed kolorowanką */}
        <AdBannerPlaceholder />

        <header>
          <h1>{page.title}</h1>
          <p className="coloring-description">{page.description}</p>
        </header>

        {/* AdSense - Banner pod tytułem */}
        <AdBannerPlaceholder />

        <div className="coloring-preview">
          {page.imageUrl ? (
            <img 
              src={page.imageUrl} 
              alt={page.title}
              className="coloring-image"
            />
          ) : (
            <div className="coloring-placeholder-large">{page.title.charAt(0)}</div>
          )}
        </div>

        <div className="coloring-meta">
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
