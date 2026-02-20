import { Metadata } from 'next';
import Link from 'next/link';
import { db, jobs, desc } from '@colouring-pages/shared';

export const metadata: Metadata = {
  title: 'Admin - Jobs - colouring-Pages',
  robots: 'noindex, nofollow',
};

// Valid statuses
const VALID_STATUSES = ['pending', 'processing', 'completed', 'failed'];

function verifyAdminSecret(secret: string | null | undefined): boolean {
  if (!secret) return false;
  
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    // In development, allow any secret
    return secret.length > 0;
  }
  
  return secret === adminSecret;
}

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ secret?: string; status?: string }>
}) {
  const params = await searchParams;
  
  // Verify admin secret
  if (!verifyAdminSecret(params.secret)) {
    return (
      <div className="admin-page">
        <h1>Access Denied</h1>
        <p>Please provide a valid admin secret.</p>
        <form>
          <input 
            type="password" 
            name="secret" 
            placeholder="Enter admin secret" 
            required 
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }

  const statusFilter = params.status;
  
  // Fetch all jobs - we'll filter in JS
  const allJobs = await db.query.jobs.findMany({
    orderBy: [desc(jobs.createdAt)],
    limit: 100,
  });
  
  // Filter by status if provided
  const jobList = statusFilter && VALID_STATUSES.includes(statusFilter)
    ? allJobs.filter(j => j.status === statusFilter)
    : allJobs;

  return (
    <div className="admin-page">
      <h1>Jobs</h1>
      
      {/* Filters */}
      <div className="admin-filters">
        <Link href={`/admin/jobs?secret=${params.secret || ''}`} className={!statusFilter ? 'active' : ''}>
          All
        </Link>
        {VALID_STATUSES.map((status) => (
          <Link
            key={status}
            href={`/admin/jobs?secret=${params.secret || ''}&status=${status}`}
            className={statusFilter === status ? 'active' : ''}
          >
            {status}
          </Link>
        ))}
      </div>

      {/* Jobs Table */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Attempts</th>
            <th>Created</th>
            <th>Started</th>
            <th>Completed</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          {jobList.length === 0 ? (
            <tr>
              <td colSpan={9}>No jobs found</td>
            </tr>
          ) : (
            jobList.map((job) => (
              <tr key={job.id}>
                <td className="job-id">{job.id.slice(0, 8)}...</td>
                <td>{job.jobType}</td>
                <td>
                  <span className={`status status-${job.status}`}>
                    {job.status}
                  </span>
                </td>
                <td>{job.priority}</td>
                <td>{job.attempts}/{job.maxAttempts}</td>
                <td>{job.createdAt?.toISOString().slice(0, 19)}</td>
                <td>{job.startedAt?.toISOString().slice(0, 19) || '-'}</td>
                <td>{job.completedAt?.toISOString().slice(0, 19) || '-'}</td>
                <td className="error-cell">
                  {job.lastError ? (
                    <span title={job.lastError}>
                      {job.lastError.slice(0, 50)}...
                    </span>
                  ) : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
