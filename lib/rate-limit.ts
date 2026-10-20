/**
 * Minimal fixed-window rate limiter.
 *
 * Counters live in module scope, so they are shared between requests handled by
 * the same server instance, reset on deploy, and are NOT shared across
 * instances. That is enough to stop accidental request loops and casual abuse;
 * if the app is ever scaled horizontally, swap the Map for a shared store
 * (Redis/Upstash) behind the same `rateLimit` signature.
 */

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();
const MAX_KEYS = 5_000;

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
  /** Whole seconds until the window resets (0 when the request was allowed). */
  retryAfter: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  // Keep the map from growing without bound if keys are never revisited.
  if (windows.size > MAX_KEYS) {
    for (const [k, w] of windows) {
      if (now >= w.resetAt) windows.delete(k);
    }
    if (windows.size > MAX_KEYS) {
      for (const k of windows.keys()) {
        windows.delete(k);
        if (windows.size <= MAX_KEYS) break;
      }
    }
  }

  const current = windows.get(key);

  if (!current || now >= current.resetAt) {
    const resetAt = now + windowMs;
    windows.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt, retryAfter: 0 };
  }

  if (current.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      resetAt: current.resetAt,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return {
    ok: true,
    remaining: limit - current.count,
    resetAt: current.resetAt,
    retryAfter: 0,
  };
}
