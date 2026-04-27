import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import labRoutes from './routes/labs.js';
import sessionRoutes from './routes/sessions.js';
import computeRoutes from './routes/compute.js';
import ideRoutes from './routes/ide.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/lab-sessions', sessionRoutes);
app.use('/api/compute', computeRoutes);
app.use('/api/files', ideRoutes); // matches ideService fetchFiles/fetchFileContent
app.use('/api', ideRoutes); // for /save and /run endpoints

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
