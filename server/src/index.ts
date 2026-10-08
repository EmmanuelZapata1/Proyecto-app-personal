import 'dotenv/config';

import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';

import { HttpError, login, register, requireAuth } from './auth';
import { migrate, pool } from './db';
import { habitsRouter } from './routes/habits';
import { inventoryRouter } from './routes/inventory';
import { newsRouter } from './routes/news';
import { notesRouter } from './routes/notes';
import { tasksRouter } from './routes/tasks';

const app = express();
const port = Number(process.env.PORT) || 8080;

app.use(cors());
app.use(express.json({ limit: '256kb' }));

app.get('/health', async (_req, res) => {
  res.json({ ok: true, service: 'nexo-server' });
});

app.post('/auth/register', async (req, res, next) => {
  try {
    res.status(201).json(await register(String(req.body.email || ''), String(req.body.password || '')));
  } catch (error) {
    next(error);
  }
});

app.post('/auth/login', async (req, res, next) => {
  try {
    res.json(await login(String(req.body.email || ''), String(req.body.password || '')));
  } catch (error) {
    next(error);
  }
});

app.get('/api/me', requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query<{ id: string; email: string }>('SELECT id, email FROM users WHERE id = $1', [req.userId]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Tu sesión ya no es válida.' });
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

app.use('/api/tasks', tasksRouter);
app.use('/api/habits', habitsRouter);
app.use('/api/notes', notesRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/news', newsRouter);

app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = error instanceof HttpError ? error.status : (error as { status?: number }).status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ error: status >= 500 ? 'Algo salió mal en el servidor.' : error.message });
});

async function start() {
  await migrate();
  app.listen(port, () => console.log(`nexo-server escuchando en el puerto ${port}`));
}

start().catch((error) => {
  console.error('No pudimos arrancar el servidor.', error);
  process.exit(1);
});
