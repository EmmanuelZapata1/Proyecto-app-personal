import { Router } from 'express';

import { requireAuth } from '../auth';
import { pool, type HabitRow } from '../db';

export const habitsRouter = Router();

habitsRouter.use(requireAuth);

// El cliente envía su fecha local (YYYY-MM-DD) para que "hoy" respete su zona horaria.
function dayFrom(value: unknown) {
  const day = String(value || '');
  if (/^\d{4}-\d{2}-\d{2}$/.test(day) && !Number.isNaN(new Date(`${day}T00:00:00Z`).getTime())) return day;
  const now = new Date();
  return `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}-${`${now.getDate()}`.padStart(2, '0')}`;
}

habitsRouter.get('/', async (req, res, next) => {
  try {
    const day = dayFrom(req.query.day);
    const result = await pool.query<HabitRow & { done: boolean }>(
      `SELECT h.id, h.name, h.created_at, (c.habit_id IS NOT NULL) AS done
       FROM habits h
       LEFT JOIN habit_completions c ON c.habit_id = h.id AND c.day = $2
       WHERE h.user_id = $1
       ORDER BY h.created_at ASC`,
      [req.userId, day],
    );
    res.json({
      habits: result.rows.map((row) => ({ id: row.id, name: row.name, doneToday: row.done })),
    });
  } catch (error) {
    next(error);
  }
});

habitsRouter.post('/', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Escribe un hábito antes de guardarlo.' });
    const id = `hab_${crypto.randomUUID()}`;
    await pool.query('INSERT INTO habits (id, user_id, name) VALUES ($1, $2, $3)', [id, req.userId, name]);
    res.status(201).json({ habit: { id, name, doneToday: false } });
  } catch (error) {
    next(error);
  }
});

habitsRouter.post('/:id/toggle', async (req, res, next) => {
  try {
    const day = dayFrom(req.body?.day);
    const owned = await pool.query('SELECT id FROM habits WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!owned.rowCount) return res.status(404).json({ error: 'Ese hábito ya no existe.' });

    const removed = await pool.query('DELETE FROM habit_completions WHERE habit_id = $1 AND day = $2', [req.params.id, day]);
    const doneToday = removed.rowCount === 0;
    if (doneToday) {
      await pool.query('INSERT INTO habit_completions (habit_id, day) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.params.id, day]);
    }
    res.json({ id: req.params.id, doneToday });
  } catch (error) {
    next(error);
  }
});

habitsRouter.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM habits WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
