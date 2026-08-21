import { createClient } from 'redis';

import { env } from '../../config/env.js';

const CACHE_VERSION_KEY = 'eventos:version';
const CACHE_TTL_SECONDS = 60;

const redisClient = createClient({
  url: env.REDIS_URL,
  socket: {
    connectTimeout: 2000,
    reconnectStrategy: false,
  },
});

redisClient.on('error', (error: Error) => {
  console.warn(`Redis no disponible: ${error.message}`);
});

let connectionPromise: Promise<void> | undefined;

async function getClient() {
  if (redisClient.isReady) {
    return redisClient;
  }

  connectionPromise ??= redisClient.connect().then(() => undefined);

  try {
    await connectionPromise;
  } finally {
    connectionPromise = undefined;
  }

  return redisClient;
}

async function withFallback<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await operation();
  } catch {
    return fallback;
  }
}

async function getVersion(): Promise<string> {
  return withFallback(async () => {
    const client = await getClient();
    return (await client.get(CACHE_VERSION_KEY)) ?? '0';
  }, '0');
}

export const eventoCache = {
  async listKey(
    page: number,
    limit: number,
    cantonId?: number,
    categoriaId?: number,
  ): Promise<string> {
    const version = await getVersion();

    return (
      `eventos:v${version}:list:` +
      `page=${page}:limit=${limit}:` +
      `canton=${cantonId ?? 'all'}:` +
      `categoria=${categoriaId ?? 'all'}`
    );
  },

  async detailKey(id: string): Promise<string> {
    const version = await getVersion();
    return `eventos:v${version}:detail:${id}`;
  },

  async get<T>(key: string): Promise<T | null> {
    return withFallback<T | null>(async () => {
      const client = await getClient();
      const cachedValue = await client.get(key);

      if (cachedValue === null) {
        return null;
      }

      const parsedValue: unknown = JSON.parse(cachedValue);
      return parsedValue as T;
    }, null);
  },

  async set<T>(key: string, value: T): Promise<void> {
    await withFallback(async () => {
      const client = await getClient();

      await client.set(key, JSON.stringify(value), {
        EX: CACHE_TTL_SECONDS,
      });
    }, undefined);
  },

  async invalidate(): Promise<void> {
    await withFallback(async () => {
      const client = await getClient();
      await client.incr(CACHE_VERSION_KEY);
    }, undefined);
  },

  async close(): Promise<void> {
    if (redisClient.isOpen) {
      await redisClient.close();
    }
  },
};
