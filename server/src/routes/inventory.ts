import { Router } from 'express';

import { requireAuth } from '../auth';
import { pool, type InventoryRow } from '../db';

export const inventoryRouter = Router();

inventoryRouter.use(requireAuth);

const kinds = ['proyecto', 'hardware', 'software', 'servicio'];

type InventoryInput = { kind?: unknown; name?: unknown; detail?: unknown; renewsOn?: unknown };

function normalize(input: InventoryInput) {
  const kind = String(input.kind || '');
  if (!kinds.includes(kind)) throw Object.assign(new Error('Ese tipo no es válido.'), { status: 400 });
  const name = String(input.name || '').trim();
  if (!name) throw Object.assign(new Error('Escribe un nombre antes de guardar.'), { status: 400 });
  const detail = String(input.detail || '').trim() || null;
  const renewsOn = String(input.renewsOn || '').trim() || null;
  return { kind: kind as InventoryRow['kind'], name, detail, renewsOn };
}

inventoryRouter.get('/', async (req, res, next) => {
  try {
    const result = await pool.query<InventoryRow>(
      'SELECT id, kind, name, detail, renews_on, created_at FROM inventory WHERE user_id = $1 ORDER BY renews_on ASC NULLS LAST, created_at DESC',
      [req.userId],
    );
    res.json({
      items: result.rows.map((row) => ({
        id: row.id,
        kind: row.kind,
        name: row.name,
        detail: row.detail,
        renewsOn: row.renews_on ? row.renews_on.toISOString().slice(0, 10) : null,
      })),
    });
  } catch (error) {
    next(error);
  }
});

inventoryRouter.post('/', async (req, res, next) => {
  try {
    const value = normalize(req.body);
    const id = `inv_${crypto.randomUUID()}`;
    await pool.query('INSERT INTO inventory (id, user_id, kind, name, detail, renews_on) VALUES ($1, $2, $3, $4, $5, $6)', [
      id,
      req.userId,
      value.kind,
      value.name,
      value.detail,
      value.renewsOn,
    ]);
    res.status(201).json({ item: { id, ...value } });
  } catch (error) {
    next(error);
  }
});

inventoryRouter.patch('/:id', async (req, res, next) => {
  try {
    const value = normalize(req.body);
    const result = await pool.query(
      'UPDATE inventory SET kind = $1, name = $2, detail = $3, renews_on = $4 WHERE id = $5 AND user_id = $6',
      [value.kind, value.name, value.detail, value.renewsOn, req.params.id, req.userId],
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Ese registro ya no existe.' });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

inventoryRouter.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM inventory WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
