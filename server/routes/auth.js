import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';

dotenv.config({ path: new URL('../../.env', import.meta.url) });

const router = Router();

router.post('/register', async (req, res) => {
  const { username, password, nickname } = req.body;

  if (!username || !password) {
    return res.status(400).json({ code: 1, message: '用户名和密码不能为空' });
  }

  try {
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      return res.status(409).json({ code: 1, message: '用户名已存在' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (username, password_hash, nickname) VALUES (?, ?, ?)',
      [username, passwordHash, nickname || '']
    );

    const token = jwt.sign(
      { id: result.insertId, username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      code: 0,
      message: 'success',
      data: {
        token,
        user: {
          id: result.insertId,
          username,
          nickname: nickname || '',
        },
      },
    });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ code: 1, message: '用户名和密码不能为空' });
  }

  try {
    const [users] = await pool.execute(
      'SELECT id, username, password_hash, nickname FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ code: 1, message: '用户名或密码错误' });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ code: 1, message: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      code: 0,
      message: 'success',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.post('/logout', (req, res) => {
  res.json({ code: 0, message: 'success', data: null });
});

router.get('/me', auth, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, nickname, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ code: 1, message: '用户不存在' });
    }

    const user = users[0];
    res.json({
      code: 0,
      message: 'success',
      data: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

export default router;
