/**
 * PostgreSQL Connection Test
 * Run: npx tsx scripts/test-db.ts
 */
import 'dotenv/config';
import postgres from 'postgres';

async function testPostgres() {
  console.log('🧪 Testing PostgreSQL Connection...\n');

  const databaseUrl = process.env.DATABASE_URL;
  console.log('Database URL:', databaseUrl?.replace(/:[^:@]+@/, ':****@'));
  console.log('');

  try {
    const sql = postgres(databaseUrl!);
    
    console.log('1. Testing connection...');
    const result = await sql`SELECT version()`;
    console.log('   ✅ Connected!');
    console.log('   PostgreSQL version:', result[0].version.split(' ')[0], result[0].version.split(' ')[1]);
    console.log('');

    // Test query
    console.log('2. Testing query (SELECT 1)...');
    const testResult = await sql`SELECT 1 as test`;
    console.log('   ✅ Query successful:', testResult[0].test);
    console.log('');

    // List tables
    console.log('3. Listing tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    const tableNames = tables.map((t: any) => t.table_name);
    console.log('   ✅ Found tables:', tableNames.length > 0 ? tableNames.join(', ') : '(none)');
    console.log('   Raw result:', JSON.stringify(tables));
    console.log('');

    // List schemas using pg_catalog
    console.log('4. Listing schemas (pg_catalog)...');
    const schemas = await sql`
      SELECT schema_name 
      FROM pg_catalog.pg_namespace 
      WHERE nspname NOT LIKE 'pg_%' AND nspname NOT LIKE 'information_%'
    `;
    console.log('   Schemas:', JSON.stringify(schemas));
    console.log('');
    
    // Try direct table listing
    console.log('5. Listing tables via pg_catalog...');
    const tables2 = await sql`
      SELECT tablename, schemaname 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
    `;
    console.log('   Tables (pg_catalog):', JSON.stringify(tables2));
    console.log('');

    await sql.end();
    console.log('🎉 PostgreSQL test passed!');
  } catch (error: any) {
    console.error('❌ PostgreSQL test failed:', error.message);
    console.error('Code:', error.code);
    process.exit(1);
  }
}

testPostgres();
