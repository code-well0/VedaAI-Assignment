import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Set MONGO_URI in .env to your connection string, e.g.:
 * - Local: mongodb://127.0.0.1:27017/vedaai
 * - Atlas: mongodb+srv://user:pass@cluster.mongodb.net/vedaai?retryWrites=true&w=majority
 */
export function getMongoUri(): string {
  return process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vedaai';
}

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function connectDB(): Promise<void> {
  const mongoUri = getMongoUri();

  mongoose.set('strictQuery', true);

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB runtime error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected.');
  });

  console.log(`Connecting to MongoDB at ${mongoUri}...`);

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(
      `✅ MongoDB connected (database: ${mongoose.connection.db?.databaseName || 'vedaai'}).`
    );
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error(
      '\nStart MongoDB locally, then retry. Example:\n' +
        '  - Windows: ensure MongoDB service is running\n' +
        '  - URI in .env: MONGO_URI=mongodb://127.0.0.1:27017/vedaai\n'
    );
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
