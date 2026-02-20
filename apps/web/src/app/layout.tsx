import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'colouring-Pages - Kolorowanki dla dzieci',
    template: '%s | colouring-Pages',
  },
  description:
    'Programmatic SEO portal z kolorowankami dla dzieci. Darmowe kolorowanki do druku.',
  robots: {
    index: process.env.NODE_ENV === 'production',
    follow: process.env.NODE_ENV === 'production',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="logo">
              colouring-Pages
            </Link>
            <nav className="main-nav">
              <Link href="/">Strona główna</Link>
              <Link href="/kategorie">Kategorie</Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          <div className="container">
            <p>&copy; 2026 colouring-Pages - Darmowe kolorowanki dla dzieci</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
