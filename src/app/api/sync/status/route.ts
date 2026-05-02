import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getSyncState } from '@/lib/sync/sync-state';
import { getPollingStatus } from '@/lib/sync/polling-service';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const syncState = getSyncState();
    const pollingStatus = getPollingStatus();

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        sync: {
          lastSyncAt: syncState.lastSyncAt,
          lastSyncStatus: syncState.lastSyncStatus,
          nextScheduledSyncAt: syncState.nextScheduledSyncAt,
          isRunning: syncState.isRunning,
          pollingActive: pollingStatus.status === 'running',
        },
        stats: {
          totalRunsCompleted: syncState.totalRunsCompleted,
          successfulRuns: syncState.successfulRuns,
          failedRuns: syncState.failedRuns,
          totalColaboradoresProcessed: syncState.totalColaboradoresProcessed,
          totalCreated: syncState.totalCreated,
          totalUpdated: syncState.totalUpdated,
          totalSkipped: syncState.totalSkipped,
        },
        lastErrors: syncState.lastErrors.slice(0, 5), // Return last 5 errors
        polling: {
          status: pollingStatus.status,
          lastRunTime: pollingStatus.lastRunTime,
          nextRunTime: pollingStatus.nextRunTime,
        },
      }
    );
  } catch (error) {
    console.error('[API] Error getting sync status:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
