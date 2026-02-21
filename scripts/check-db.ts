import 'dotenv/config';
import { db, categories, items, variants, assets } from '../packages/shared/src/index.js';

async function main() {
  const cats = await db.query.categories.findMany({});
  const itms = await db.query.items.findMany({});
  const vars = await db.query.variants.findMany({});
  
  console.log('=== Categories:', cats.length);
  cats.forEach(c => console.log(' -', c.id, c.slug, c.namePl));
  
  console.log('\n=== Items:', itms.length);
  itms.forEach(i => console.log(' -', i.id, i.slug, i.titlePl));
  
  console.log('\n=== Variants:', vars.length);
  
  process.exit(0);
}

main();
