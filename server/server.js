import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ------------------ __dirname fix (ES module) ------------------ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ------------------ Middleware ------------------ */

// JSON body parser
app.use(express.json());

// ✅ CORS configuration (FIXED)
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://dingdongcakebake.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: false
  })
);

/* ------------------ Static assets ------------------ */
app.use('/assets', express.static(path.join(__dirname, 'assets')));

/* ------------------ MongoDB Connection ------------------ */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err));

/* ------------------ Routes ------------------ */
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

/* ------------------ Health Check ------------------ */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server running fine 🚀'
  });
});

/* ------------------ Start Server ------------------ */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
