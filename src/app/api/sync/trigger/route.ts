import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { triggerSync } from '@/lib/sync/polling-service';
import { withDistributedLock } from '@/lib/sync/distributed-lock';
import { validateSyncTriggerBody, ValidationError } from '@/lib/sync/api-validators';
import { checkRateLimit, RateLimitError } from '@/lib/sync/rate-limiter';
import { logger } from '@/lib/sync/log-sanitizer';
import { prisma } from '@/lib/prisma';
import { getSyncState } from '@/lib/sync/sync-state';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      logger.warn('Unauthorized sync trigger attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user?.email || 'unknown';

    // Check authorization (only BP_ADMIN)
    if (session.user?.role !== 'BP_ADMIN') {
      logger.warn('Forbidden: User without BP_ADMIN role tried to trigger sync', {
        user: userEmail,
        role: session.user?.role,
      });
      return NextResponse.json(
        { error: 'Forbidden: Only BP_ADMIN can trigger sync' },
        { status: 403 }
      );
    }

    // Rate limiting: max 5 sync triggers per hour per user
    try {
      checkRateLimit(`sync:trigger:${userEmail}`, {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 5,
      });
    } catch (error) {
      if (error instanceof RateLimitError) {
        logger.warn('Rate limit exceeded for sync trigger', {
          user: userEmail,
          retryAfter: error.retryAfterSeconds,
        });
        return NextResponse.json(
          {
            error: 'Too many requests',
            retryAfter: error.retryAfterSeconds,
          },
          {
            status: 429,
            headers: { 'Retry-After': String(error.retryAfterSeconds) },
          }
        );
      }
      throw error;
    }

    // Validate request body
    let body: any = {};
    try {
      body = await request.json().catch(() => ({}));
      validateSyncTriggerBody(body);
    } catch (error) {
      if (error instanceof ValidationError) {
        logger.warn('Invalid sync trigger request', { errors: error.errors });
        return NextResponse.json(
          {
            error: 'Invalid request body',
            details: error.errors.map(e => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Check if sync is already running
    const syncState = getSyncState();
    if (syncState.isRunning) {
      logger.info('Sync already running, request rejected', {
        user: userEmail,
        lastSync: syncState.lastSyncAt,
      });
      return NextResponse.json(
        {
          status: 'already_running',
          message: 'Sync is already in progress',
          startedAt: syncState.lastSyncAt,
        },
        { status: 409 }
      );
    }

    logger.info('Sync trigger requested', { user: userEmail, dryRun: body.dryRun });

    // Trigger sync with distributed lock
    const syncPromise = withDistributedLock(
      () => triggerSync(body.dryRun),
      5 * 60 * 1000 // 5 minute timeout
    );

    // Don't wait for sync to complete, return immediately
    syncPromise.catch(err => {
      logger.error('Error in background sync', err);
    });

    const duration = Date.now() - startTime;
    return NextResponse.json(
      {
        status: 'triggered',
        message: 'Sync has been triggered',
        timestamp: new Date().toISOString(),
        durationMs: duration,
      },
      { status: 202 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error in sync trigger endpoint', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        durationMs: duration,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      {
        message: 'Use POST method to trigger a sync',
        endpoint: '/api/sync/trigger',
        method: 'POST',
        requires: 'BP_ADMIN role',
        rateLimit: '5 requests per hour',
      }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
