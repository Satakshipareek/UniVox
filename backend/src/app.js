import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import api from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';
import { connectDatabase } from './config/db.js';
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:4200' }));
app.use(express.json({ limit:'20kb' }));
app.use('/api', rateLimit({ windowMs: 60_000, limit: 120, standardHeaders:'draft-7', legacyHeaders:false }));
app.use('/api', async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch {
    console.error('MongoDB connection failed while handling an API request.');
    res.status(503).json({ success: false, error: 'Database unavailable.' });
  }
});
app.use('/api', api);
app.use((req,res) => res.status(404).json({ success:false, error:'Route not found.' }));
app.use(errorHandler);
export default app;
