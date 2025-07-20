import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

export interface QueryResult {
    columns: string[];
    rows: Record<string, any>[];
}

let db: Awaited<ReturnType<typeof open>> | null = null;

async function getDb() {
    if (!db) {
        // In a serverless environment, the filesystem is ephemeral.
        // We'll use an in-memory database if the file doesn't exist.
        // In a real-world scenario, you'd want to ensure your DB file is deployed with your app.
        const dbPath = path.join(process.cwd(), 'db', 'ecom.db');
        
        try {
            await require('fs').promises.mkdir(path.dirname(dbPath), { recursive: true });
            db = await open({
                filename: dbPath,
                driver: sqlite3.Database,
            });
            console.log("Successfully connected to SQLite database at", dbPath);
        } catch (error) {
            console.error("Failed to open SQLite database, falling back to in-memory DB.", error);
            // Fallback to in-memory DB if the file can't be opened
            db = await open({
                filename: ':memory:',
                driver: sqlite3.Database,
            });
            console.log("Connected to in-memory SQLite database.");
        }
    }
    return db;
}


export async function query(sql: string): Promise<QueryResult> {
    const db = await getDb();
    
    // Basic validation to prevent multiple statements
    if (sql.split(';').length > 2 && !sql.trim().endsWith(';')) {
        throw new Error("Only single SQL statements are allowed.");
    }

    try {
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
