/**
 * Database Connection - Połączenie z bazą danych
 * 
 * Użycie:
 * import { db } from '@colouring-pages/shared';
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

// Connection string z zmiennej środowiskowej
const connectionString = process.env.DATABASE_URL || 
  'postgresql://devuser:devpassword@localhost:5432/colouring_dev';

// Tworzenie klienta PostgreSQL
const client = postgres(connectionString, { 
  max: 1, // Dla serverless - minimalne połączenia
});

// Tworzenie instancji Drizzle
export const db = drizzle(client, { schema });

// Eksport schema
export { schema };

// Eksport typów
export type Database = typeof db;
