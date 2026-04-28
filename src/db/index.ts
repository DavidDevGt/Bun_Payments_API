import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema";

const isTest = process.env.NODE_ENV === "test" || process.env.BUN_ENV === "test";
const dbFile = isTest ? ":memory:" : "sqlite.db";

const sqlite = new Database(dbFile);
sqlite.exec("PRAGMA journal_mode = WAL;");

export const db = drizzle(sqlite, { schema });
export type DB = typeof db;
