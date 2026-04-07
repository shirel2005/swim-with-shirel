import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import path from 'path'
import fs from 'fs'

export async function GET() {
  try {
    const cwd = process.cwd()
    const dataDir = path.join(cwd, 'data')
    const dbPath = path.join(dataDir, 'swim.db')
    const dataDirExists = fs.existsSync(dataDir)
    const dbExists = fs.existsSync(dbPath)
    const dbSize = dbExists ? fs.statSync(dbPath).size : 0

    const db = getDb()
    const today = new Date().toISOString().split('T')[0]
    const all = db.prepare('SELECT * FROM availability ORDER BY date, time_slot').all()
    const future = db.prepare('SELECT * FROM availability WHERE date >= ? ORDER BY date, time_slot').all(today)

    return NextResponse.json({
      cwd,
      dataDir,
      dbPath,
      dataDirExists,
      dbExists,
      dbSize,
      today,
      total_slots: all.length,
      future_slots: future.length,
      slots: all,
    }, {
      headers: { 'Cache-Control': 'no-store' }
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST() {
  try {
    const db = getDb()
    const today = new Date().toISOString().split('T')[0]
    db.prepare('INSERT INTO availability (date, time_slot, duration) VALUES (?, ?, ?)').run(today, '10:00', 30)
    const all = db.prepare('SELECT * FROM availability').all()
    return NextResponse.json({ inserted: true, total: all.length, slots: all }, {
      headers: { 'Cache-Control': 'no-store' }
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
