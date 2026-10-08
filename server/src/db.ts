import { readFileSync } from 'fs';
import { join } from 'path';

import { Pool } from 'pg';

const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

const useSsl = process.env.DATABASE_SSL !== 'false';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

export async function migrate() {
  await pool.query(schema);
}

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
};

export type TaskRow = {
  id: string;
  title: string;
  tag: string;
  due_at: Date | null;
  completed: boolean;
  created_at: Date;
};

export type HabitRow = { id: string; name: string; created_at: Date };

export type NoteRow = {
  id: string;
  body: string;
  created_at: Date;
  updated_at: Date;
};

export type InventoryRow = {
  id: string;
  kind: 'proyecto' | 'hardware' | 'software' | 'servicio';
  name: string;
  detail: string | null;
  renews_on: Date | null;
  created_at: Date;
};
