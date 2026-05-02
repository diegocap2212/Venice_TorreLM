interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

interface RequestLog {
  timestamp: number;
  count: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
};

// In-memory store for rate limiting
const requestLogs = new Map<string, RequestLog>();

export class RateLimitError extends Error {
  constructor(
    public retryAfterSeconds: number,
    message: string = 'Rate limit exceeded'
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export function checkRateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): { allowed: boolean; remainingRequests: number; resetTime: Date } {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const now = Date.now();
  const windowStart = now - finalConfig.windowMs;

  let log = requestLogs.get(identifier);

  // Create new log if doesn't exist or window has passed
  if (!log || log.timestamp < windowStart) {
    log = { timestamp: now, count: 1 };
    requestLogs.set(identifier, log);
    return {
      allowed: true,
      remainingRequests: finalConfig.maxRequests - 1,
      resetTime: new Date(now + finalConfig.windowMs),
    };
  }

  // Update log
  log.count++;
  const allowed = log.count <= finalConfig.maxRequests;
  const remainingRequests = Math.max(0, finalConfig.maxRequests - log.count);
  const resetTime = new Date(log.timestamp + finalConfig.windowMs);

  return { allowed, remainingRequests, resetTime };
}

export function enforceRateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): void {
  const { allowed, resetTime } = checkRateLimit(identifier, config);

  if (!allowed) {
    const retryAfterSeconds = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
    throw new RateLimitError(retryAfterSeconds);
  }
}

// Cleanup old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 minutes

  for (const [key, log] of requestLogs.entries()) {
    if (now - log.timestamp > maxAge) {
      requestLogs.delete(key);
    }
  }
}, 5 * 60 * 1000);
