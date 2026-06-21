import { Router } from 'express';
import crypto from 'crypto';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';
import { requireOwner } from '../middleware/permission.js';

const router = Router();

router.post(
  '/:babyId/share',
  auth,
  async (req, res, next) => {
    req.params.id = req.params.babyId;
    next();
  },
  requireOwner,
  async (req, res) => {
    const { babyId } = req.params;
    const ownerId = req.user.id;
    const { username, permission } = req.body;

    if (!username) {
      return res.status(400).json({ code: 1, message: '请指定共享用户' });
    }

    if (!permission || !['view', 'record'].includes(permission)) {
      return res
        .status(400)
        .json({ code: 1, message: '权限类型无效，仅支持 view 或 record' });
    }

    try {
      const [users] = await pool.execute(
        'SELECT id FROM users WHERE username = ?',
        [username]
      );

      if (users.length === 0) {
        return res.status(404).json({ code: 1, message: '用户不存在' });
      }

      const sharedUserId = users[0].id;

      if (sharedUserId === ownerId) {
        return res
          .status(400)
          .json({ code: 1, message: '不能共享给自己' });
      }

      const [existing] = await pool.execute(
        'SELECT id FROM baby_shares WHERE baby_id = ? AND shared_user_id = ?',
        [babyId, sharedUserId]
      );

      if (existing.length > 0) {
        return res
          .status(409)
          .json({ code: 1, message: '该用户已被共享' });
      }

      const shareToken = crypto.randomBytes(32).toString('hex');

      const [result] = await pool.execute(
        'INSERT INTO baby_shares (baby_id, owner_user_id, shared_user_id, permission, share_token, token_enabled) VALUES (?, ?, ?, ?, ?, 0)',
        [babyId, ownerId, sharedUserId, permission, shareToken]
      );

      const [shares] = await pool.execute(
        `SELECT s.id, s.baby_id, s.owner_user_id, s.shared_user_id, s.permission, s.share_token, s.token_enabled, s.created_at, s.updated_at,
                u.username AS shared_username, u.nickname AS shared_nickname
         FROM baby_shares s
         JOIN users u ON s.shared_user_id = u.id
         WHERE s.id = ?`,
        [result.insertId]
      );

      res.json({ code: 0, message: 'success', data: shares[0] });
    } catch (err) {
      res.status(500).json({ code: 1, message: err.message });
    }
  }
);

router.get(
  '/:babyId/shares',
  auth,
  async (req, res, next) => {
    req.params.id = req.params.babyId;
    next();
  },
  requireOwner,
  async (req, res) => {
    const { babyId } = req.params;

    try {
      const [shares] = await pool.execute(
        `SELECT s.id, s.baby_id, s.owner_user_id, s.shared_user_id, s.permission, s.share_token, s.token_enabled, s.created_at, s.updated_at,
                u.username AS shared_username, u.nickname AS shared_nickname
         FROM baby_shares s
         JOIN users u ON s.shared_user_id = u.id
         WHERE s.baby_id = ?
         ORDER BY s.created_at DESC`,
        [babyId]
      );

      res.json({ code: 0, message: 'success', data: shares });
    } catch (err) {
      res.status(500).json({ code: 1, message: err.message });
    }
  }
);

router.delete('/:id', auth, async (req, res) => {
  const shareId = req.params.id;
  const userId = req.user.id;

  try {
    const [shares] = await pool.execute(
      'SELECT owner_user_id FROM baby_shares WHERE id = ?',
      [shareId]
    );

    if (shares.length === 0) {
      return res.status(404).json({ code: 1, message: '共享记录不存在' });
    }

    if (shares[0].owner_user_id !== userId) {
      return res
        .status(403)
        .json({ code: 1, message: '仅宝宝所有者可操作' });
    }

    await pool.execute('DELETE FROM baby_shares WHERE id = ?', [shareId]);

    res.json({ code: 0, message: 'success', data: null });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.patch('/:id', auth, async (req, res) => {
  const shareId = req.params.id;
  const userId = req.user.id;
  const { permission, token_enabled } = req.body;

  try {
    const [shares] = await pool.execute(
      'SELECT owner_user_id FROM baby_shares WHERE id = ?',
      [shareId]
    );

    if (shares.length === 0) {
      return res.status(404).json({ code: 1, message: '共享记录不存在' });
    }

    if (shares[0].owner_user_id !== userId) {
      return res
        .status(403)
        .json({ code: 1, message: '仅宝宝所有者可操作' });
    }

    const fields = [];
    const values = [];

    if (permission !== undefined) {
      if (!['view', 'record'].includes(permission)) {
        return res
          .status(400)
          .json({ code: 1, message: '权限类型无效' });
      }
      fields.push('permission = ?');
      values.push(permission);
    }

    if (token_enabled !== undefined) {
      fields.push('token_enabled = ?');
      values.push(token_enabled ? 1 : 0);
    }

    if (fields.length === 0) {
      return res.status(400).json({ code: 1, message: '没有需要更新的字段' });
    }

    values.push(shareId);
    await pool.execute(
      `UPDATE baby_shares SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const [updated] = await pool.execute(
      `SELECT s.id, s.baby_id, s.owner_user_id, s.shared_user_id, s.permission, s.share_token, s.token_enabled, s.created_at, s.updated_at,
              u.username AS shared_username, u.nickname AS shared_nickname
       FROM baby_shares s
       JOIN users u ON s.shared_user_id = u.id
       WHERE s.id = ?`,
      [shareId]
    );

    res.json({ code: 0, message: 'success', data: updated[0] });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.get('/public/share/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const [shares] = await pool.execute(
      `SELECT s.id, s.baby_id, s.permission, s.token_enabled,
              b.name AS baby_name, b.gender, b.birthday, b.avatar
       FROM baby_shares s
       JOIN babies b ON s.baby_id = b.id
       WHERE s.share_token = ?`,
      [token]
    );

    if (shares.length === 0) {
      return res.status(404).json({ code: 1, message: '共享链接无效' });
    }

    const share = shares[0];

    if (!share.token_enabled) {
      return res.status(403).json({ code: 1, message: '共享链接已禁用' });
    }

    const [records] = await pool.execute(
      `SELECT id, milk_amount, feeding_time, created_at
       FROM feeding_records
       WHERE baby_id = ?
       ORDER BY feeding_time DESC
       LIMIT 100`,
      [share.baby_id]
    );

    res.json({
      code: 0,
      message: 'success',
      data: {
        baby: {
          id: share.baby_id,
          name: share.baby_name,
          gender: share.gender,
          birthday: share.birthday,
          avatar: share.avatar,
        },
        permission: share.permission,
        records,
      },
    });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

export default router;
