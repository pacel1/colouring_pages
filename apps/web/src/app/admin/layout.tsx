import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - colouring-Pages',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      <nav className="admin-nav">
        <a href="/admin/jobs">Jobs</a>
      </nav>
      {children}
    </div>
  );
}
