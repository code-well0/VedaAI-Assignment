import Redis, { RedisOptions } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient: Redis | null = null;

/** Mask password in logs */
function safeRedisLogLabel(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}:${parsed.port || '6379'}`;
  } catch {
    return '(invalid REDIS_URL)';
  }
}

function buildRedisOptions(redisUrl: string): RedisOptions {
  const useTls = redisUrl.startsWith('rediss://') || process.env.REDIS_TLS === 'true';

  const options: RedisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    connectTimeout: 20000,
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 8) return null;
      return Math.min(times * 300, 3000);
    },
  };

  if (useTls) {
    options.tls = {
      rejectUnauthorized: process.env.REDIS_TLS_REJECT_UNAUTHORIZED !== 'false',
    };
  }

  return options;
}

export function getRedisClient(): Redis {
  if (!redisClient) {
    throw new Error('Redis is not connected. Set REDIS_URL in .env to your cloud Redis URL.');
  }
  return redisClient;
}

export function isRedisConnected(): boolean {
  return redisClient?.status === 'ready';
}

/**
 * Connect to Redis for BullMQ (background jobs + queue state).
 *
 * Set REDIS_URL in .env — use a hosted provider (not localhost), e.g.:
 * - Upstash:  rediss://default:PASSWORD@HOST:6379
 * - Redis Cloud: redis://default:PASSWORD@HOST:PORT
 */
export async function connectRedis(): Promise<void> {
  const redisUrl = (process.env.REDIS_URL || '').trim();

  if (!redisUrl) {
    console.error('❌ REDIS_URL is missing in .env');
    printRedisSetupHelp();
    process.exit(1);
  }

  if (/127\.0\.0\.1|localhost/i.test(redisUrl)) {
    console.warn(
      '⚠️  REDIS_URL points to localhost. For production-style job queues, use a cloud Redis URL (Upstash, Redis Cloud, etc.).'
    );
  }

  console.log(`Connecting to Redis (${safeRedisLogLabel(redisUrl)})...`);

  const client = new Redis(redisUrl, buildRedisOptions(redisUrl));

  client.on('error', (err) => {
    console.error('❌ Redis client error:', err.message);
  });

  try {
    await client.connect();
    const pong = await client.ping();
    if (pong !== 'PONG') {
      throw new Error(`Unexpected ping response: ${pong}`);
    }
    redisClient = client;
    console.log('✅ Redis connected (BullMQ job queue ready).');
  } catch (error: any) {
    try {
      client.disconnect();
    } catch {
      /* ignore */
    }
    console.error('❌ Redis connection failed:', error.message);
    printRedisSetupHelp();
    process.exit(1);
  }
}

function printRedisSetupHelp(): void {
  console.error(`
Add a cloud REDIS_URL to vedaai-backend/.env (recommended: Upstash — free tier):

1. Go to https://upstash.com → Create database → copy the URL
2. It looks like: rediss://default:YOUR_PASSWORD@YOUR_HOST.upstash.io:6379
3. Paste into .env:
   REDIS_URL=rediss://default:YOUR_PASSWORD@YOUR_HOST.upstash.io:6379

Other providers (Redis Cloud, Railway, etc.) also work — use the full connection URL they give you.
Use rediss:// (with double s) when the provider requires TLS.
`);
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
