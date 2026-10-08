import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { pool, type UserRow } from './db';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || '';
const TOKEN_TTL = '30d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET es obligatorio. Defínelo antes de arrancar el servidor.');
}

export async function register(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail.includes('@')) throw new HttpError(400, 'El correo no parece válido.');
  if (password.length < 8) throw new HttpError(400, 'La contraseña necesita al menos 8 caracteres.');

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
  if (existing.rowCount) throw new HttpError(409, 'Ese correo ya tiene una cuenta.');

  const user: UserRow = {
    id: `usr_${crypto.randomUUID()}`,
    email: normalizedEmail,
    password_hash: await bcrypt.hash(password, 12),
    created_at: new Date(),
  };
  await pool.query('INSERT INTO users (id, email, password_hash, created_at) VALUES ($1, $2, $3, $4)', [
    user.id,
    user.email,
    user.password_hash,
    user.created_at,
  ]);
  return { token: sign(user.id), user: { id: user.id, email: user.email } };
}

export async function login(email: string, password: string) {
  const result = await pool.query<UserRow>('SELECT id, email, password_hash, created_at FROM users WHERE email = $1', [
    email.trim().toLowerCase(),
  ]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new HttpError(401, 'Correo o contraseña incorrectos.');
  }
  return { token: sign(user.id), user: { id: user.id, email: user.email } };
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Falta el token de sesión.' });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: 'Tu sesión expiró. Inicia sesión otra vez.' });
  }
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function sign(userId: string) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}
