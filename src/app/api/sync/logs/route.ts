import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { validateSyncLogsQuery, ValidationError } from '@/lib/sync/api-validators';
import { checkRateLimit, RateLimitError } from '@/lib/sync/rate-limiter';
import { logger } from '@/lib/sync/log-sanitizer';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      logger.warn('Unauthorized sync logs access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user?.email || 'unknown';

    // Rate limiting: max 30 log requests per hour per user
    try {
      checkRateLimit(`sync:logs:${userEmail}`, {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 30,
      });
    } catch (error) {
      if (error instanceof RateLimitError) {
        logger.warn('Rate limit exceeded for logs endpoint', {
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

    // Validate and parse query parameters
    let query;
    try {
      const params: Record<string, string | string[] | undefined> = {};
      request.nextUrl.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      query = validateSyncLogsQuery(params);
    } catch (error) {
      if (error instanceof ValidationError) {
        logger.warn('Invalid sync logs query', { errors: error.errors, user: userEmail });
        return NextResponse.json(
          {
            error: 'Invalid query parameters',
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

    // Build where clause
    const where: any = {
      user_email: 'sharepoint-sync',
    };

    if (query.resource) {
      where.recurso = query.resource;
    }

    if (query.action) {
      where.acao = query.action;
    }

    // Fetch total count
    const total = await prisma.auditLog.count({ where });

    // Fetch logs
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: query.offset,
      take: query.limit,
    });

    const duration = Date.now() - startTime;
    logger.info('Sync logs retrieved', {
      user: userEmail,
      limit: query.limit,
      offset: query.offset,
      total,
      durationMs: duration,
    });

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        pagination: {
          limit: query.limit,
          offset: query.offset,
          total,
          hasMore: query.offset + query.limit < total,
        },
        logs: logs.map(log => ({
          id: log.id,
          timestamp: log.created_at,
          action: log.acao,
          resource: log.recurso,
          resourceId: log.recurso_id,
          details: log.detalhes,
        })),
        durationMs: duration,
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error getting sync logs', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        durationMs: duration,
      },
      { status: 500 }
    );
  }
}
