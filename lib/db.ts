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
  ]
  for (const sql of alterCols) {
    try { db.exec(sql) } catch {}
  }

  // Seed availability if empty
  const availCount = (db.prepare('SELECT COUNT(*) as cnt FROM availability').get() as { cnt: number }).cnt
  if (availCount === 0) {
    seedAvailability(db)
  }

  return db
}

function seedAvailability(db: Database.Database) {
  const insert = db.prepare(
    'INSERT INTO availability (date, time_slot, duration) VALUES (?, ?, ?)'
  )

  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
  const durations = [30, 45, 30, 45, 30, 45] // alternating pattern

  const now = new Date()
  const insertMany = db.transaction(() => {
    let slotCounter = 0
    for (let week = 0; week < 4; week++) {
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(now)
        date.setDate(now.getDate() + week * 7 + dayOffset + 1)
        const dayOfWeek = date.getDay() // 0=Sun, 6=Sat

        // Mon-Sat only (1-6)
        if (dayOfWeek === 0) continue

        const dateStr = date.toISOString().split('T')[0]

        for (let i = 0; i < timeSlots.length; i++) {
          const duration = durations[(slotCounter + i) % durations.length]
          insert.run(dateStr, timeSlots[i], duration)
        }
        slotCounter++
      }
    }
  })

  insertMany()
}
