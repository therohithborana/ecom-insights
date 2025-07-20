import {open} from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

export interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
}

let db: any = null;

async function getDb() {
  if (db) {
    return db;
  }
  const dbPath = path.resolve(process.cwd(), 'db/ecom.db');
  
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    console.log('Successfully connected to the database at', dbPath);
    return db;
  } catch (error) {
    console.error('Failed to open database at', dbPath, error);
    throw new Error(`Failed to open database: ${(error as Error).message}`);
  }
}

export async function query(sql: string): Promise<QueryResult> {
  const db = await getDb();
  
  console.log(`Executing query: ${sql}`);
  
  try {
    // Basic validation to prevent multiple statements
    if (sql.split(';').length > 2 && !sql.trim().endsWith(';')) {
        throw new Error("Only single SQL statements are allowed.");
    }
    
    // Using `all` to get all rows.
    const rows = await db.all(sql);
    
    if (rows.length === 0) {
        return { columns: [], rows: [] };
    }

    const columns = Object.keys(rows[0]);
    
    return { columns, rows };

  } catch (error) {
    console.error(`Error executing query: ${sql}`, error);
    const message = error instanceof Error ? error.message : "An unknown database error occurred";
    throw new Error(`Database query failed: ${message}`);
  }
}
