import { Router } from 'express';

import { requireAuth } from '../auth';
import { pool, type NoteRow } from '../db';

export const notesRouter = Router();

notesRouter.use(requireAuth);

notesRouter.get('/', async (req, res, next) => {
  try {
    const result = await pool.query<NoteRow>(
      'SELECT id, body, created_at, updated_at FROM notes WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.userId],
    );
    res.json({
      notes: result.rows.map((row) => ({
        id: row.id,
        body: row.body,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),
      })),
    });
  } catch (error) {
    next(error);
  }
});

notesRouter.post('/', async (req, res, next) => {
  try {
    const body = String(req.body.body || '').trim();
    if (!body) return res.status(400).json({ error: 'Escribe algo antes de guardar la nota.' });
    const id = `not_${crypto.randomUUID()}`;
    await pool.query('INSERT INTO notes (id, user_id, body) VALUES ($1, $2, $3)', [id, req.userId, body]);
    const now = new Date().toISOString();
    res.status(201).json({ note: { id, body, createdAt: now, updatedAt: now } });
  } catch (error) {
    next(error);
  }
});

notesRouter.patch('/:id', async (req, res, next) => {
  try {
    const body = String(req.body.body || '').trim();
    if (!body) return res.status(400).json({ error: 'Una nota no puede quedar vacía.' });
    const result = await pool.query('UPDATE notes SET body = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3', [
      body,
      req.params.id,
      req.userId,
    ]);
    if (!result.rowCount) return res.status(404).json({ error: 'Esa nota ya no existe.' });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

notesRouter.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM notes WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
