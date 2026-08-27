// Lightweight in-memory rate limiter for the AI Portfolio Assistant.
//
// The Groq API key is protected server-side; this limits abuse from the public
// endpoint. Limits are stored in-memory, so they are per-serverless-instance
// (not globally persisted). That is the simplest solution that is "good enough"
// for a portfolio site. For fully persistent limits across instances, prefer
// Vercel's built-in Rate Limiter or a KV-backed store — see .env.example.

export type RateLimitResult = { allowed: boolean; retryAfterSeconds?: number };

interface Bucket {
  count: number;
  resetAt: number;
}

export class MemoryRateLimiter {
  private buckets = new Map<string, Bucket>();

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
  ) {}

  consume(key: string): RateLimitResult {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 0, resetAt: now + this.windowMs };
      this.buckets.set(key, bucket);
    }

    if (bucket.count >= this.max) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      };
    }

    bucket.count += 1;
    return { allowed: true };
  }
}

export function createLimiter(): MemoryRateLimiter {
  const max = Number(process.env.RATE_LIMIT_MAX ?? 15);
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 3_600_000); // 1 hour
  return new MemoryRateLimiter(
    Number.isFinite(max) && max > 0 ? max : 15,
    Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 3_600_000,
  );
}