import { LRUCache } from "lru-cache";

const windowMs = 60 * 1000;

const cache = new LRUCache<string, { hits: number; firstHit: number; }>({
  max: 1000
});

type RateLimitResult = { success: true } | { success: false; retryAfterMs: number };

export function rateLimit({
  key,
  limit
}: {
  key: string;
  limit: number;
}): RateLimitResult {
  const now = Date.now();
  const entry = cache.get(key);

  if (!entry) {
    cache.set(key, { hits: 1, firstHit: now });
    return { success: true };
  }

  if (now - entry.firstHit > windowMs) {
    cache.set(key, { hits: 1, firstHit: now });
    return { success: true };
  }

  if (entry.hits + 1 > limit) {
    return { success: false, retryAfterMs: windowMs - (now - entry.firstHit) };
  }

  entry.hits += 1;
  cache.set(key, entry);
  return { success: true };
}
