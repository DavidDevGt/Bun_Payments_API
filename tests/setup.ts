import { sql } from "drizzle-orm/sql";
import * as schema from "../src/db/schema";
import { db } from "../src/db";

let testDb = db;

export function getTestDB() {
  return testDb;
}

export async function cleanupTestDB() {
  // Delete all data in reverse order of dependencies
  await db.delete(schema.paymentsTable);
  await db.delete(schema.servicesTable);
}

export async function setupTestDB() {
  testDb = db;

  // Create schema using raw SQL to ensure tables exist
  // This is safe to run multiple times (IF NOT EXISTS)
  db.run(sql.raw(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      amount REAL NOT NULL,
      due_date INTEGER NOT NULL,
      category TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `));

  db.run(sql.raw(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'overdue')),
      payment_method TEXT,
      payment_date INTEGER,
      due_date INTEGER NOT NULL,
      month TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `));

  db.run(sql.raw(`
    CREATE INDEX IF NOT EXISTS idx_services_category ON services(category)
  `));

  db.run(sql.raw(`
    CREATE INDEX IF NOT EXISTS idx_payments_service_id ON payments(service_id)
  `));

  db.run(sql.raw(`
    CREATE INDEX IF NOT EXISTS idx_payments_month ON payments(month)
  `));

  db.run(sql.raw(`
    CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)
  `));

  return testDb;
}

export async function seedTestData() {
  // Clear existing data first
  await cleanupTestDB();

  // Insert services using raw SQL
  db.run(sql.raw(`
    INSERT INTO services (name, amount, due_date, category, created_at, updated_at)
    VALUES ('Internet', 49.99, 10, 'Utilities', unixepoch(), unixepoch())
  `));

  db.run(sql.raw(`
    INSERT INTO services (name, amount, due_date, category, created_at, updated_at)
    VALUES ('Netflix', 12.99, 5, 'Entertainment', unixepoch(), unixepoch())
  `));

  db.run(sql.raw(`
    INSERT INTO services (name, amount, due_date, category, created_at, updated_at)
    VALUES ('Electricity', 150.0, 15, 'Utilities', unixepoch(), unixepoch())
  `));

  const services = db.all(sql.raw("SELECT * FROM services"));

  return { services: services as unknown[] };
}
