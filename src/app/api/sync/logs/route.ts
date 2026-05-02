import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const SYNC_RESOURCES = ['SharePointSync', 'Colaborador'];

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
    const resource = searchParams.get('resource');
    const action = searchParams.get('action');

    // Build where clause
    const where: any = {
      user_email: 'sharepoint-sync',
    };

    if (resource && SYNC_RESOURCES.includes(resource)) {
      where.recurso = resource;
    }

    if (action) {
      where.acao = action;
    }

    // Fetch total count
    const total = await prisma.auditLog.count({ where });

    // Fetch logs
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: offset,
      take: limit,
    });

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + limit < total,
        },
        logs: logs.map(log => ({
          id: log.id,
          timestamp: log.created_at,
          action: log.acao,
          resource: log.recurso,
          resourceId: log.recurso_id,
          details: log.detalhes,
        })),
      }
    );
  } catch (error) {
    console.error('[API] Error getting sync logs:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
