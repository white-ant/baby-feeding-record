import pool from '../db.js';

export function requirePermission(...allowed) {
  return async (req, res, next) => {
    const babyId = req.params.babyId || req.params.id;
    const userId = req.user.id;

    try {
      const [babies] = await pool.execute(
        'SELECT user_id FROM babies WHERE id = ?',
        [babyId]
      );

      if (babies.length === 0) {
        return res.status(404).json({ code: 1, message: '宝宝不存在' });
      }

      if (babies[0].user_id === userId) {
        req.babyPermission = 'owner';
        return next();
      }

      const [shares] = await pool.execute(
        'SELECT permission FROM baby_shares WHERE baby_id = ? AND shared_user_id = ?',
        [babyId, userId]
      );

      if (shares.length === 0) {
        return res.status(403).json({ code: 1, message: '无权限访问' });
      }

      const perm = shares[0].permission;
      req.babyPermission = perm;

      if (allowed.includes(perm)) {
        return next();
      }

      return res.status(403).json({ code: 1, message: '权限不足' });
    } catch (err) {
      return res.status(500).json({ code: 1, message: err.message });
    }
  };
}

export function requireOwner(req, res, next) {
  const babyId = req.params.babyId || req.params.id;
  const userId = req.user.id;

  pool
    .execute('SELECT user_id FROM babies WHERE id = ?', [babyId])
    .then(([babies]) => {
      if (babies.length === 0) {
        return res.status(404).json({ code: 1, message: '宝宝不存在' });
      }
      if (babies[0].user_id !== userId) {
        return res.status(403).json({ code: 1, message: '仅宝宝所有者可操作' });
      }
      req.babyPermission = 'owner';
      next();
    })
    .catch((err) => {
      res.status(500).json({ code: 1, message: err.message });
    });
}
