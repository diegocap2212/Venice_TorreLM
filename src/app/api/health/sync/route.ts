import { NextResponse } from 'next/server';
import { getSyncState } from '@/lib/sync/sync-state';
import { getPollingStatus } from '@/lib/sync/polling-service';
import { isSharePointSyncEnabled } from '@/config/sharepoint-config';

export async function GET() {
  try {
    const isEnabled = isSharePointSyncEnabled();
    const syncState = getSyncState();
    const pollingStatus = getPollingStatus();

    const isHealthy =
      isEnabled &&
      pollingStatus.status === 'running' &&
      (!syncState.lastSyncAt || new Date().getTime() - syncState.lastSyncAt.getTime() < 15 * 60 * 1000);

    return NextResponse.json(
      {
        service: 'sharepoint-sync',
        healthy: isHealthy,
        status: pollingStatus.status,
        enabled: isEnabled,
        lastSync: syncState.lastSyncAt,
        nextSync: syncState.nextScheduledSyncAt,
        recentErrors: syncState.lastErrors.length,
      },
      { status: isHealthy ? 200 : 503 }
    );
  } catch (error) {
    console.error('[Health Check] Error:', error);
    return NextResponse.json(
      {
        service: 'sharepoint-sync',
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
