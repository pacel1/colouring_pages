import 'dotenv/config';
import { db, items, eq } from '../packages/shared/src/index.js';

async function main() {
  // Find the test item
  const testItems = await db.query.items.findMany({
    where: eq(items.slug, 'test-lion-1771706545159'),
  });
  
  console.log('Found items:', testItems.length);
  
  if (testItems.length > 0) {
    const item = testItems[0];
    console.log('Item:', item.slug, 'isPublished:', item.isPublished);
    
    // Update to published
    await db.update(items)
      .set({ 
        isPublished: true,
        publishedAt: new Date()
      })
      .where(eq(items.id, item.id));
    
    console.log('Updated to published!');
  } else {
    console.log('Item not found');
  }
  
  process.exit(0);
}

main();
