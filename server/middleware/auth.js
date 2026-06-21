import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env', import.meta.url) });

export function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ code: 1, message: '未登录' });
  }
  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ code: 1, message: 'token无效或已过期' });
  }
}
