import { prisma } from '@/lib/prisma';
import { getSharePointConfig } from '@/config/sharepoint-config';

const LOCK_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
const LOCK_KEY = 'sharepoint_sync';
const INSTANCE_ID = process.env.INSTANCE_ID || `instance-${process.pid}-${Date.now()}`;

export class DistributedLockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DistributedLockError';
  }
}

export async function acquireLock(): Promise<string> {
  try {
    const expiresAt = new Date(Date.now() + LOCK_TIMEOUT_MS);

    // Try to acquire lock
    const lock = await prisma.syncLock.upsert({
      where: { lock_key: LOCK_KEY },
      update: {
        // Only update if expired
        acquired_by: INSTANCE_ID,
        acquired_at: new Date(),
        expires_at: expiresAt,
        is_active: true,
        updated_at: new Date(),
      },
      create: {
        lock_key: LOCK_KEY,
        acquired_by: INSTANCE_ID,
        acquired_at: new Date(),
        expires_at: expiresAt,
        is_active: true,
      },
    });

    // Check if lock is held by this instance or expired
    if (lock.acquired_by === INSTANCE_ID) {
      console.log(`[DistributedLock] Lock acquired by ${INSTANCE_ID}`);
      return lock.id;
    }

    if (lock.expires_at < new Date()) {
      // Expired, try to steal the lock
      const updated = await prisma.syncLock.update({
        where: { id: lock.id },
        data: {
          acquired_by: INSTANCE_ID,
          acquired_at: new Date(),
          expires_at: expiresAt,
          is_active: true,
        },
      });
      console.log(`[DistributedLock] Expired lock stolen by ${INSTANCE_ID}`);
      return updated.id;
    }

    // Lock is held by another instance
    throw new DistributedLockError(
      `Lock already held by ${lock.acquired_by} until ${lock.expires_at.toISOString()}`
    );
  } catch (error) {
    if (error instanceof DistributedLockError) {
      throw error;
    }
    throw new DistributedLockError(`Failed to acquire lock: ${error}`);
  }
}

export async function releaseLock(lockId: string): Promise<void> {
  try {
    const lock = await prisma.syncLock.findUnique({
      where: { id: lockId },
    });

    if (!lock) {
      console.warn(`[DistributedLock] Lock not found: ${lockId}`);
      return;
    }

    if (lock.acquired_by !== INSTANCE_ID) {
      console.warn(
        `[DistributedLock] Lock held by different instance: ${lock.acquired_by}`
      );
      return;
    }

    await prisma.syncLock.update({
      where: { id: lockId },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    });

    console.log(`[DistributedLock] Lock released by ${INSTANCE_ID}`);
  } catch (error) {
    console.error(`[DistributedLock] Failed to release lock:`, error);
  }
}

export async function renewLock(lockId: string): Promise<void> {
  try {
    const lock = await prisma.syncLock.findUnique({
      where: { id: lockId },
    });

    if (!lock || lock.acquired_by !== INSTANCE_ID) {
      throw new DistributedLockError('Cannot renew lock not held by this instance');
    }

    const expiresAt = new Date(Date.now() + LOCK_TIMEOUT_MS);
    await prisma.syncLock.update({
      where: { id: lockId },
      data: {
        expires_at: expiresAt,
        updated_at: new Date(),
      },
    });

    console.log(`[DistributedLock] Lock renewed by ${INSTANCE_ID}`);
  } catch (error) {
    console.error(`[DistributedLock] Failed to renew lock:`, error);
    throw new DistributedLockError(`Failed to renew lock: ${error}`);
  }
}

export async function withDistributedLock<T>(
  fn: () => Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  let lockId: string | null = null;

  try {
    lockId = await acquireLock();

    // Execute with timeout
    const timeoutPromise = new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    );

    const result = await Promise.race([fn(), timeoutPromise]);
    return result;
  } finally {
    if (lockId) {
      await releaseLock(lockId);
    }
  }
}
