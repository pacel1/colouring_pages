import { Metadata } from 'next';
import Link from 'next/link';
import { db, jobs, items, categories, sql, eq, and, gte } from '@colouring-pages/shared';

export const metadata: Metadata = {
  title: 'Admin - Dashboard - colouring-Pages',
  robots: 'noindex, nofollow',
};

// Helper to verify admin secret
function verifyAdminSecret(secret: string | null | undefined): boolean {
  if (!secret) return false;
  
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return secret.length > 0;
  }
  
  return secret === adminSecret;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ secret?: string }>
}) {
  const params = await searchParams;
  
  // Verify admin secret
  if (!verifyAdminSecret(params.secret)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">🔐 Admin Access</h1>
          <p className="text-gray-600 mb-6">Please provide admin secret to access dashboard.</p>
          <form>
            <input 
              type="password" 
              name="secret" 
              placeholder="Enter admin secret" 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button 
              type="submit" 
              className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Get stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [
    totalJobs,
    pendingJobs,
    processingJobs,
    failedJobs,
    completedToday,
    totalItems,
    publishedItems,
    totalCategories,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(jobs),
    db.select({ count: sql<number>`count(*)` }).from(jobs).where(eq(jobs.status, 'pending')),
    db.select({ count: sql<number>`count(*)` }).from(jobs).where(eq(jobs.status, 'processing')),
    db.select({ count: sql<number>`count(*)` }).from(jobs).where(eq(jobs.status, 'failed')),
    db.select({ count: sql<number>`count(*)` }).from(jobs).where(
      and(
        eq(jobs.status, 'completed'),
        gte(jobs.completedAt, today)
      )
    ),
    db.select({ count: sql<number>`count(*)` }).from(items),
    db.select({ count: sql<number>`count(*)` }).from(items).where(eq(items.isPublished, true)),
    db.select({ count: sql<number>`count(*)` }).from(categories),
  ]);

  const secretParam = params.secret ? `?secret=${params.secret}` : '';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your colouring pages system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pending Jobs */}
        <Link href={`/admin/jobs${secretParam}&status=pending`} className="block">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Jobs</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingJobs[0]?.count || 0}</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>
        </Link>

        {/* Processing Jobs */}
        <Link href={`/admin/jobs${secretParam}&status=processing`} className="block">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Processing</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{processingJobs[0]?.count || 0}</p>
              </div>
              <div className="text-4xl">⚙️</div>
            </div>
          </div>
        </Link>

        {/* Completed Today */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed Today</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{completedToday[0]?.count || 0}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        {/* Failed Jobs */}
        <Link href={`/admin/jobs${secretParam}&status=failed`} className="block">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Failed Jobs</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{failedJobs[0]?.count || 0}</p>
              </div>
              <div className="text-4xl">❌</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Jobs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Jobs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalJobs[0]?.count || 0}</p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </div>

        {/* Published Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Published Pages</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{publishedItems[0]?.count || 0}</p>
              <p className="text-xs text-gray-400 mt-1">of {totalItems[0]?.count || 0} total</p>
            </div>
            <div className="text-4xl">🎨</div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Categories</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{totalCategories[0]?.count || 0}</p>
            </div>
            <div className="text-4xl">📁</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">⚡ Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/admin/jobs${secretParam}&status=failed`}
            className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
          >
            ❌ View Failed Jobs
          </Link>
          <Link
            href={`/admin/jobs${secretParam}`}
            className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            📋 View All Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
