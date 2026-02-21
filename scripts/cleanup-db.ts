import 'dotenv/config';
import { db, items, eq } from '../packages/shared/src/index.js';

async function main() {
  // Delete duplicate items (keep only test-lion)
  const allItems = await db.query.items.findMany({});
  for (const item of allItems) {
    if (item.slug.startsWith('test-lion-')) {
      console.log('Deleting item:', item.slug, item.id);
      await db.delete(items).where(eq(items.id, item.id));
    }
  }

  console.log('Done');
  process.exit(0);
}

main();
