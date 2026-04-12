import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db

  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const dbPath = path.join(dataDir, 'swim.db')
  db = new Database(dbPath)

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL')

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS availability (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      duration INTEGER NOT NULL,
      is_available INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_name TEXT NOT NULL,
      parent_email TEXT NOT NULL,
      parent_phone TEXT NOT NULL,
      children TEXT NOT NULL,
      slot_ids TEXT NOT NULL,
      total_price REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_name TEXT NOT NULL,
      child_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      review_text TEXT NOT NULL,
      lesson_type TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS availability_windows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ten_packs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_name TEXT NOT NULL,
      parent_email TEXT NOT NULL,
      parent_phone TEXT NOT NULL,
      children TEXT NOT NULL DEFAULT '[]',
      lesson_type TEXT NOT NULL,
      lesson_format TEXT NOT NULL DEFAULT 'private',
      total_sessions INTEGER NOT NULL DEFAULT 10,
      sessions_used INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `)

  // Add new columns if they don't exist (SQLite doesn't support IF NOT EXISTS for columns)
  const alterCols = [
    `ALTER TABLE bookings ADD COLUMN lesson_type TEXT`,
    `ALTER TABLE bookings ADD COLUMN is_weekly_request INTEGER DEFAULT 0`,
    `ALTER TABLE bookings ADD COLUMN recurring_day TEXT`,
    `ALTER TABLE bookings ADD COLUMN recurring_time TEXT`,
    `ALTER TABLE bookings ADD COLUMN recurring_start_date TEXT`,
    `ALTER TABLE bookings ADD COLUMN recurring_end_date TEXT`,
    `ALTER TABLE bookings ADD COLUMN recurring_weeks TEXT`,
    `ALTER TABLE bookings ADD COLUMN recurring_frequency TEXT`,
    `ALTER TABLE bookings ADD COLUMN lesson_format TEXT DEFAULT 'private'`,
    `ALTER TABLE bookings ADD COLUMN booked_slots TEXT DEFAULT '[]'`,
    `ALTER TABLE bookings ADD COLUMN session_assignments TEXT DEFAULT '[]'`,
    `ALTER TABLE bookings ADD COLUMN booking_type TEXT DEFAULT 'one-time'`,
    `ALTER TABLE bookings ADD COLUMN pack_total INTEGER DEFAULT 0`,
    `ALTER TABLE bookings ADD COLUMN pack_used INTEGER DEFAULT 0`,
    `ALTER TABLE bookings ADD COLUMN ten_pack_id INTEGER`,
  ]
  for (const sql of alterCols) {
    try { db.exec(sql) } catch {}
  }

  return db
}
