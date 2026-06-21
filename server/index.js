import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import babiesRoutes from './routes/babies.js';
import recordsRoutes from './routes/records.js';
import statsRoutes from './routes/stats.js';
import sharesRoutes from './routes/shares.js';

dotenv.config({ path: new URL('.env', import.meta.url) });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/babies', babiesRoutes);
app.use('/api/babies/:babyId/records', recordsRoutes);
app.use('/api/babies/:babyId/stats', statsRoutes);
app.use('/api', sharesRoutes);

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ code: 1, message: err.message || '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
