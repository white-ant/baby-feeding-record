import { Router } from 'express';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';
import { requireOwner } from '../middleware/permission.js';

const router = Router();

router.get('/', auth, async (req, res) => {
  const userId = req.user.id;

  try {
    const [ownBabies] = await pool.execute(
      'SELECT id, user_id, name, gender, birthday, avatar, created_at, updated_at FROM babies WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    const [sharedBabies] = await pool.execute(
      `SELECT b.id, b.user_id, b.name, b.gender, b.birthday, b.avatar, b.created_at, b.updated_at,
              s.permission AS share_permission
       FROM babies b
       JOIN baby_shares s ON b.id = s.baby_id
       WHERE s.shared_user_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );

    const own = ownBabies.map((b) => ({ ...b, permission: 'owner' }));
    const shared = sharedBabies.map((b) => ({
      ...b,
      permission: b.share_permission,
      share_permission: undefined,
    }));

    res.json({
      code: 0,
      message: 'success',
      data: [...own, ...shared],
    });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const userId = req.user.id;
  const { name, gender, birthday, avatar } = req.body;

  if (!name) {
    return res.status(400).json({ code: 1, message: '宝宝名字不能为空' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO babies (user_id, name, gender, birthday, avatar) VALUES (?, ?, ?, ?, ?)',
      [userId, name, gender || '', birthday || null, avatar || '']
    );

    const [babies] = await pool.execute(
      'SELECT id, user_id, name, gender, birthday, avatar, created_at, updated_at FROM babies WHERE id = ?',
      [result.insertId]
    );

    res.json({
      code: 0,
      message: 'success',
      data: { ...babies[0], permission: 'owner' },
    });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.put('/:id', auth, requireOwner, async (req, res) => {
  const babyId = req.params.id;
  const { name, gender, birthday, avatar } = req.body;

  try {
    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name);
    }
    if (gender !== undefined) {
      fields.push('gender = ?');
      values.push(gender);
    }
    if (birthday !== undefined) {
      fields.push('birthday = ?');
      values.push(birthday);
    }
    if (avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(avatar);
    }

    if (fields.length === 0) {
      return res.status(400).json({ code: 1, message: '没有需要更新的字段' });
    }

    values.push(babyId);
    await pool.execute(
      `UPDATE babies SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const [babies] = await pool.execute(
      'SELECT id, user_id, name, gender, birthday, avatar, created_at, updated_at FROM babies WHERE id = ?',
      [babyId]
    );

    res.json({
      code: 0,
      message: 'success',
      data: { ...babies[0], permission: 'owner' },
    });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.delete('/:id', auth, requireOwner, async (req, res) => {
  const babyId = req.params.id;

  try {
    await pool.execute('DELETE FROM baby_shares WHERE baby_id = ?', [babyId]);
    await pool.execute('DELETE FROM feeding_records WHERE baby_id = ?', [babyId]);
    await pool.execute('DELETE FROM babies WHERE id = ?', [babyId]);

    res.json({ code: 0, message: 'success', data: null });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

export default router;
