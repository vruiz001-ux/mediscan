// Persistent cache helper backed by Prisma `RxCache`. Falls back to
// in-memory only when the DB is unavailable — cache misses never throw.

import { prisma } from "@/lib/db/client";

const memCache = new Map<string, { value: unknown; expiresAt: number }>();

export async function cached<T>(
  key: string,
  ttlMs: number,
  producer: () => Promise<T>,
): Promise<T> {
  const now = Date.now();

  // 1. Memory hit
  const mem = memCache.get(key);
  if (mem && mem.expiresAt > now) return mem.value as T;

  // 2. DB hit
  try {
    const row = await prisma.rxCache.findUnique({ where: { key } });
    if (row && row.expiresAt.getTime() > now) {
      const parsed = JSON.parse(row.valueJson) as T;
      memCache.set(key, { value: parsed, expiresAt: row.expiresAt.getTime() });
      return parsed;
    }
  } catch {
    // DB unavailable — fall through to producer
  }

  // 3. Produce + store
  const fresh = await producer();
  const expiresAt = new Date(now + ttlMs);
  memCache.set(key, { value: fresh, expiresAt: expiresAt.getTime() });
  try {
    await prisma.rxCache.upsert({
      where: { key },
      create: { key, valueJson: JSON.stringify(fresh), expiresAt },
      update: { valueJson: JSON.stringify(fresh), expiresAt },
    });
  } catch {
    // Silently ignore DB write errors — memory cache still serves repeat hits
  }
  return fresh;
}

export const CACHE_TTL = {
  SEARCH: 24 * 60 * 60 * 1000, // 1 day
  RESOLVE: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Test-only: clear in-memory cache
export function __clearMemCache() {
  memCache.clear();
}
