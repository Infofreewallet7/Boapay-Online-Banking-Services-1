import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Lazy initialization pattern to improve startup time
let _pool: Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

// Get pool instance - lazy initialization
export const getPool = () => {
  if (!_pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
      );
    }
    _pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return _pool;
};

// Get db instance - lazy initialization
export const getDb = () => {
  if (!_db) {
    _db = drizzle({ client: getPool(), schema });
  }
  return _db;
};

// For backward compatibility with existing code
export const pool = getPool();
export const db = getDb();
