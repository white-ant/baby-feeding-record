import { Router } from 'express';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permission.js';

const router = Router({ mergeParams: true });

router.get('/', auth, requirePermission('view', 'record'), async (req, res) => {
  const { babyId } = req.params;
  const { date } = req.query;

  try {
    let query =
      'SELECT id, baby_id, user_id, milk_amount, feeding_time, created_at, updated_at FROM feeding_records WHERE baby_id = ?';
    const params = [babyId];

    if (date) {
      query += ' AND DATE(feeding_time) = ?';
      params.push(date);
    }

    query += ' ORDER BY feeding_time DESC';
    const [records] = await pool.execute(query, params);

    res.json({ code: 0, message: 'success', data: records });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.post(
  '/',
  auth,
  requirePermission('record'),
  async (req, res) => {
    const { babyId } = req.params;
    const userId = req.user.id;
    const { milk_amount, feeding_time } = req.body;

    if (milk_amount === undefined || !feeding_time) {
      return res
        .status(400)
        .json({ code: 1, message: '奶量和喂奶时间不能为空' });
    }

    try {
      const [result] = await pool.execute(
        'INSERT INTO feeding_records (baby_id, user_id, milk_amount, feeding_time) VALUES (?, ?, ?, ?)',
        [babyId, userId, milk_amount, feeding_time]
      );

      const [records] = await pool.execute(
        'SELECT id, baby_id, user_id, milk_amount, feeding_time, created_at, updated_at FROM feeding_records WHERE id = ?',
        [result.insertId]
      );

      res.json({ code: 0, message: 'success', data: records[0] });
    } catch (err) {
      res.status(500).json({ code: 1, message: err.message });
    }
  }
);

router.delete('/:id', auth, async (req, res) => {
  const recordId = req.params.id;
  const userId = req.user.id;

  try {
    const [records] = await pool.execute(
      'SELECT fr.baby_id, fr.user_id AS record_user_id, b.user_id AS owner_user_id FROM feeding_records fr JOIN babies b ON fr.baby_id = b.id WHERE fr.id = ?',
      [recordId]
    );

    if (records.length === 0) {
      return res.status(404).json({ code: 1, message: '记录不存在' });
    }

    const record = records[0];

    if (record.owner_user_id === userId || record.record_user_id === userId) {
      await pool.execute('DELETE FROM feeding_records WHERE id = ?', [recordId]);
      return res.json({ code: 0, message: 'success', data: null });
    }

    const [shares] = await pool.execute(
      'SELECT permission FROM baby_shares WHERE baby_id = ? AND shared_user_id = ?',
      [record.baby_id, userId]
    );

    if (shares.length === 0) {
      return res.status(403).json({ code: 1, message: '无权限删除此记录' });
    }

    return res.status(403).json({ code: 1, message: '无权限删除此记录' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

export default router;
