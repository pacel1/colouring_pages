import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'colouring-Pages - Kolorowanki dla dzieci',
  description: 'Programmatic SEO portal z kolorowankami dla dzieci. Darmowe kolorowanki do druku.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body>
        <header>
          <h1>colouring-Pages</h1>
        </header>
        <main>{children}</main>
        <footer>
          <p>&copy; 2026 colouring-Pages</p>
        </footer>
      </body>
    </html>
  );
}
