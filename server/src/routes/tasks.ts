import { Router } from 'express';

import { requireAuth } from '../auth';
import { pool, type TaskRow } from '../db';

export const tasksRouter = Router();

tasksRouter.use(requireAuth);

tasksRouter.get('/', async (req, res, next) => {
  try {
    const result = await pool.query<TaskRow>(
      'SELECT id, title, tag, due_at, completed, created_at FROM tasks WHERE user_id = $1 ORDER BY completed ASC, created_at DESC',
      [req.userId],
    );
    res.json({
      tasks: result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        tag: row.tag,
        dueAt: row.due_at ? row.due_at.toISOString() : null,
        completed: row.completed,
      })),
    });
  } catch (error) {
    next(error);
  }
});

tasksRouter.post('/', async (req, res, next) => {
  try {
    const title = String(req.body.title || '').trim();
    if (!title) return res.status(400).json({ error: 'Escribe una tarea antes de guardarla.' });
    const tag = String(req.body.tag || 'Personal');
    const dueAt = req.body.dueAt ? new Date(String(req.body.dueAt)) : null;
    const id = `tsk_${crypto.randomUUID()}`;
    await pool.query('INSERT INTO tasks (id, user_id, title, tag, due_at) VALUES ($1, $2, $3, $4, $5)', [
      id,
      req.userId,
      title,
      tag,
      dueAt && !Number.isNaN(dueAt.getTime()) ? dueAt : null,
    ]);
    res.status(201).json({
      task: { id, title, tag, dueAt: dueAt && !Number.isNaN(dueAt.getTime()) ? dueAt.toISOString() : null, completed: false },
    });
  } catch (error) {
    next(error);
  }
});

tasksRouter.patch('/:id', async (req, res, next) => {
  try {
    if (typeof req.body.completed === 'boolean') {
      const result = await pool.query('UPDATE tasks SET completed = $1 WHERE id = $2 AND user_id = $3', [
        req.body.completed,
        req.params.id,
        req.userId,
      ]);
      if (!result.rowCount) return res.status(404).json({ error: 'Esa tarea ya no existe.' });
    }
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

tasksRouter.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
