import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupTerminal } from './terminalHandler.js';

// Import Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import labRoutes from './routes/labs.js';
import sessionRoutes from './routes/sessions.js';
import computeRoutes from './routes/compute.js';
import ideRoutes from './routes/ide.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Request Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/lab-sessions', sessionRoutes);
app.use('/api/compute', computeRoutes);
app.use('/api/files', ideRoutes); 
app.use('/api', ideRoutes); 

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running', timestamp: new Date() });
});

// Setup Terminal WebSocket
setupTerminal(io);

httpServer.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
