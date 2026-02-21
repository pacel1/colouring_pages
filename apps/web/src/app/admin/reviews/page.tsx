/**
 * Admin Reviews Page
 * 
 * Lists items flagged for moderation review
 */

import { db, items, eq } from '@colouring-pages/shared';

async function getFlaggedItems() {
  'use server';
  
  try {
    const result = await db.query.items.findMany({
      where: eq(items.moderationStatus, 'needs_review'),
      orderBy: (items, { desc }) => [desc(items.updatedAt)],
    });
    return result;
  } catch (error) {
    // Table might not have the column yet
    console.error('Error fetching flagged items:', error);
    return [];
  }
}

async function approveItem(formData: FormData) {
  'use server';
  
  const id = formData.get('id') as string;
  
  try {
    await db.update(items)
      .set({ 
        moderationStatus: 'approved',
        moderationNote: 'Approved by admin',
      })
      .where(eq(items.id, id));
  } catch (error) {
    console.error('Error approving item:', error);
  }
}

async function rejectItem(formData: FormData) {
  'use server';
  
  const id = formData.get('id') as string;
  
  try {
    await db.update(items)
      .set({ 
        moderationStatus: 'rejected',
        moderationNote: 'Rejected by admin',
      })
      .where(eq(items.id, id));
  } catch (error) {
    console.error('Error rejecting item:', error);
  }
}

export const dynamic = 'force-dynamic';

export default async function ReviewsPage() {
  const flaggedItems = await getFlaggedItems();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Moderation Reviews</h1>
      
      {flaggedItems.length === 0 ? (
        <p className="text-gray-500">No items need review.</p>
      ) : (
        <div className="space-y-4">
          {flaggedItems.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 bg-white shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">{item.titlePl}</h2>
                  <p className="text-gray-600">{item.titleEn}</p>
                  {item.moderationNote && (
                    <p className="text-sm text-orange-600 mt-2">
                      Note: {item.moderationNote}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Updated: {item.updatedAt?.toLocaleString()}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <form action={approveItem}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                  </form>
                  
                  <form action={rejectItem}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
