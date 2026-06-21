import { Router } from 'express';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permission.js';

const router = Router({ mergeParams: true });

router.get(
  '/',
  auth,
  requirePermission('view', 'record'),
  async (req, res) => {
    const { babyId } = req.params;
    const { type } = req.query;
    const statsType = type || 'day';

    try {
      if (statsType === 'day') {
        const [rows] = await pool.execute(
          `SELECT DATE(feeding_time) AS date,
                  SUM(milk_amount) AS total_milk,
                  COUNT(*) AS feeding_count,
                  MIN(feeding_time) AS first_feeding,
                  MAX(feeding_time) AS last_feeding
           FROM feeding_records
           WHERE baby_id = ?
             AND feeding_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
           GROUP BY DATE(feeding_time)
           ORDER BY date DESC`,
          [babyId]
        );
        return res.json({ code: 0, message: 'success', data: rows });
      }

      if (statsType === 'week') {
        const [rows] = await pool.execute(
          `SELECT YEARWEEK(feeding_time, 1) AS year_week,
                  MIN(DATE(feeding_time)) AS week_start,
                  MAX(DATE(feeding_time)) AS week_end,
                  SUM(milk_amount) AS total_milk,
                  COUNT(*) AS feeding_count
           FROM feeding_records
           WHERE baby_id = ?
             AND feeding_time >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
           GROUP BY YEARWEEK(feeding_time, 1)
           ORDER BY year_week DESC`,
          [babyId]
        );
        return res.json({ code: 0, message: 'success', data: rows });
      }

      if (statsType === 'month') {
        const [rows] = await pool.execute(
          `SELECT DATE_FORMAT(feeding_time, '%Y-%m') AS month,
                  SUM(milk_amount) AS total_milk,
                  COUNT(*) AS feeding_count,
                  ROUND(AVG(milk_amount)) AS avg_milk
           FROM feeding_records
           WHERE baby_id = ?
             AND feeding_time >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)
           GROUP BY DATE_FORMAT(feeding_time, '%Y-%m')
           ORDER BY month DESC`,
          [babyId]
        );
        return res.json({ code: 0, message: 'success', data: rows });
      }

      return res.status(400).json({ code: 1, message: '无效的统计类型' });
    } catch (err) {
      res.status(500).json({ code: 1, message: err.message });
    }
  }
);

export default router;
