import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB, isMongoConnected } from './config/db';
import { connectRedis, isRedisConnected } from './config/redis';
import { socketService } from './services/socketService';
import { initQueue } from './queues/generateQueue';
import { initWorker } from './queues/generateWorker';
import assignmentRoutes from './routes/assignment';
import teacherRoutes from './routes/teacher';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/** Default 100kb is too small for profile avatars (base64) and large JSON payloads */
const BODY_LIMIT = '15mb';

app.use(cors());
app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: BODY_LIMIT }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/teachers', teacherRoutes);
app.use('/api/assignments', assignmentRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    mongodb: {
      connected: isMongoConnected(),
      database: mongoose.connection.db?.databaseName,
    },
    redis: {
      connected: isRedisConnected(),
    },
    queue: 'BullMQ',
  });
});

app.use(
  (
    err: Error & { type?: string; status?: number },
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err.type === 'entity.too.large' || err.status === 413) {
      return res.status(413).json({
        error:
          'Request body too large. Use images under 10MB for assignments, or a smaller profile photo.',
      });
    }
    next(err);
  }
);

const server = createServer(app);

async function startServer() {
  console.log('🏁 VedaAI: Bootstrapping backend (MongoDB + Redis + BullMQ)...');

  await connectDB();
  await connectRedis();

  initQueue();
  initWorker();

  socketService.initSocketServer(server);

  server.listen(PORT, () => {
    console.log(`\n🚀 =======================================================`);
    console.log(`🚀 VedaAI backend is running on http://localhost:${PORT}`);
    console.log(`🚀 API: http://localhost:${PORT}/api/assignments`);
    console.log(`🚀 Health: http://localhost:${PORT}/health`);
    console.log(`🚀 =======================================================\n`);
  });
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('⚠️ Uncaught Exception thrown:', error);
});

startServer();
