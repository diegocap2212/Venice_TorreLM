import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { triggerSync, isPollingActive } from '@/lib/sync/polling-service';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check authorization (only BP_ADMIN)
    if (session.user?.role !== 'BP_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only BP_ADMIN can trigger sync' },
        { status: 403 }
      );
    }

    // Check if sync is already running
    if (isPollingActive()) {
      return NextResponse.json(
        {
          status: 'already_running',
          message: 'Sync is already in progress',
        },
        { status: 409 }
      );
    }

    // Trigger sync
    const syncPromise = triggerSync();

    // Don't wait for sync to complete, return immediately
    syncPromise.catch(err => {
      console.error('[API] Error in background sync:', err);
    });

    return NextResponse.json(
      {
        status: 'triggered',
        message: 'Sync has been triggered',
        timestamp: new Date().toISOString(),
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('[API] Error in sync trigger:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : String(error),
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
      }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
