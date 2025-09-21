import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database.sqlite');

export const db = new sqlite3.Database(dbPath);

export async function initDatabase() {
  try {
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '../../uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    return new Promise<void>((resolve, reject) => {
      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS images (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            originalName TEXT NOT NULL,
            mimeType TEXT NOT NULL,
            size INTEGER NOT NULL,
            width INTEGER NOT NULL,
            height INTEGER NOT NULL,
            uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            description TEXT,
            tags TEXT
          )
        `, (err) => {
          if (err) {
            console.error('Error creating images table:', err);
            reject(err);
          } else {
            console.log('✅ Database initialized successfully');
            resolve();
          }
        });
      });
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}