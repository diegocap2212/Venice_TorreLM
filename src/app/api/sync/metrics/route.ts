import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getMetrics } from '@/lib/sync/metrics';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const metrics = getMetrics();

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        metrics,
      }
    );
  } catch (error) {
    console.error('[API] Error getting metrics:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
