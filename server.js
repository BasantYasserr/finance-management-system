import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './DB/connection.js'
import authRoutes from './src/routes/auht.js'
import bonusRoutes from './src/routes/bonus.js'
import userRoutes from './src/routes/user.js'
import reportRoutes from './src/routes/report.js'
import paymentRoutes from './src/routes/payment.js'
import attachmentRoutes from './src/routes/attachment.js'
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));


dotenv.config();

const app = express();

// Connect to MongoDB
await connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bonus', bonusRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/attachment', attachmentRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});