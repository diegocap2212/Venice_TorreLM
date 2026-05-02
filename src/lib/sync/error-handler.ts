import { SyncError, recordSyncError } from './sync-state';
import { GraphApiError } from '@/lib/sharepoint/client';

export class SyncHandlerError extends Error {
  constructor(
    public type: SyncError['type'],
    message: string,
    public retryable: boolean = true,
    public details?: any
  ) {
    super(message);
    this.name = 'SyncHandlerError';
  }
}

export function handleError(error: unknown): SyncHandlerError {
  if (error instanceof SyncHandlerError) {
    return error;
  }

  if (error instanceof GraphApiError) {
    const retryable = error.statusCode >= 500 || error.statusCode === 429 || error.retryable;
    const syncError = new SyncHandlerError(
      'network',
      `Graph API error: ${error.message}`,
      retryable,
      { code: error.code, statusCode: error.statusCode }
    );
    recordSyncError({
      timestamp: new Date(),
      type: 'network',
      message: error.message,
      retryable,
      details: { code: error.code, statusCode: error.statusCode },
    });
    return syncError;
  }

  if (error instanceof Error) {
    const message = error.message;

    // Determine error type and retryability based on message
    let type: SyncError['type'] = 'unknown';
    let retryable = true;

    if (message.includes('auth') || message.includes('unauthorized') || message.includes('credentials')) {
      type = 'auth';
      retryable = false;
    } else if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      type = 'network';
      retryable = true;
    } else if (message.includes('validation') || message.includes('invalid')) {
      type = 'validation';
      retryable = false;
    } else if (message.includes('database') || message.includes('prisma')) {
      type = 'database';
      retryable = true;
    }

    const syncError = new SyncHandlerError(type, message, retryable);
    recordSyncError({
      timestamp: new Date(),
      type,
      message,
      retryable,
    });
    return syncError;
  }

  const unknownError = new SyncHandlerError('unknown', String(error), true);
  recordSyncError({
    timestamp: new Date(),
    type: 'unknown',
    message: String(error),
    retryable: true,
  });
  return unknownError;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const syncError = handleError(error);

      if (!syncError.retryable || attempt === maxRetries) {
        throw syncError;
      }

      lastError = syncError;

      // Exponential backoff
      const delayMs = initialDelayMs * Math.pow(2, attempt);
      console.log(`[Sync] Retry attempt ${attempt + 1}/${maxRetries} after ${delayMs}ms`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw lastError || new SyncHandlerError('unknown', 'Max retries exceeded', false);
}

export function isRetryable(error: unknown): boolean {
  if (error instanceof SyncHandlerError) {
    return error.retryable;
  }
  if (error instanceof GraphApiError) {
    return error.retryable;
  }
  return true;
}
