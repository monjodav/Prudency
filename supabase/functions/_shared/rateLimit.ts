const rateLimitMap = new Map<string, number>();

const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup(maxAgeMs: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, timestamp] of rateLimitMap) {
    if (now - timestamp > maxAgeMs) {
      rateLimitMap.delete(key);
    }
  }
}

export function checkRateLimit(
  key: string,
  windowMs: number,
): { allowed: boolean; retryAfterSeconds: number } {
  cleanup(windowMs * 2);

  const now = Date.now();
  const lastRequest = rateLimitMap.get(key);

  if (lastRequest && now - lastRequest < windowMs) {
    const retryAfterSeconds = Math.ceil((windowMs - (now - lastRequest)) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  rateLimitMap.set(key, now);
  return { allowed: true, retryAfterSeconds: 0 };
}
