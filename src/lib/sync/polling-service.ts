import { getSharePointConfig, isSharePointSyncEnabled } from '@/config/sharepoint-config';
import { runSync } from './sync-worker';
import { getSyncState } from './sync-state';

type PollingStateStatus = 'idle' | 'running' | 'stopped';

interface PollingState {
  status: PollingStateStatus;
  intervalHandle?: NodeJS.Timeout;
  lastRunTime?: Date;
  nextRunTime?: Date;
}

let pollingState: PollingState = {
  status: 'stopped',
};

let isMutexLocked = false;

async function acquireMutex(): Promise<boolean> {
  if (isMutexLocked) {
    return false;
  }
  isMutexLocked = true;
  return true;
}

function releaseMutex(): void {
  isMutexLocked = false;
}

export function isPollingActive(): boolean {
  return pollingState.status === 'running';
}

export function getPollingStatus() {
  return {
    ...pollingState,
    syncState: getSyncState(),
  };
}

export async function triggerSync(): Promise<void> {
  if (!isSharePointSyncEnabled()) {
    console.log('[Polling] SharePoint sync is disabled');
    return;
  }

  // Try to acquire mutex to prevent concurrent syncs
  const acquired = await acquireMutex();
  if (!acquired) {
    console.log('[Polling] Sync already in progress, skipping');
    return;
  }

  try {
    pollingState.lastRunTime = new Date();
    console.log('[Polling] Triggering manual sync');
    await runSync();
  } finally {
    releaseMutex();
  }
}

async function pollingSyncLoop(): Promise<void> {
  if (!isSharePointSyncEnabled()) {
    console.log('[Polling] SharePoint sync is disabled, stopping polling');
    stopPollingInterval();
    return;
  }

  if (isMutexLocked) {
    console.log('[Polling] Sync already in progress, will try next interval');
    return;
  }

  try {
    await triggerSync();
  } catch (error) {
    console.error('[Polling] Error during sync:', error);
  }

  // Schedule next run
  if (pollingState.status === 'running') {
    const config = getSharePointConfig();
    pollingState.nextRunTime = new Date(Date.now() + config.pollIntervalMs);
  }
}

export function startPollingInterval(): void {
  if (pollingState.status === 'running') {
    console.log('[Polling] Polling already active');
    return;
  }

  if (!isSharePointSyncEnabled()) {
    console.log('[Polling] SharePoint sync is disabled, not starting polling');
    return;
  }

  try {
    const config = getSharePointConfig();

    pollingState.status = 'running';
    pollingState.nextRunTime = new Date(Date.now() + config.pollIntervalMs);

    // Run first sync immediately
    console.log('[Polling] Starting polling service...');
    triggerSync().catch(err => {
      console.error('[Polling] Error in initial sync:', err);
    });

    // Setup recurring interval
    pollingState.intervalHandle = setInterval(
      () => {
        pollingSyncLoop().catch(err => {
          console.error('[Polling] Error in polling loop:', err);
        });
      },
      config.pollIntervalMs
    );

    console.log(
      `[Polling] Polling started with ${config.pollIntervalMs}ms interval`
    );
  } catch (error) {
    console.error('[Polling] Failed to start polling:', error);
    pollingState.status = 'stopped';
  }
}

export function stopPollingInterval(): void {
  if (pollingState.status === 'stopped') {
    console.log('[Polling] Polling is not running');
    return;
  }

  if (pollingState.intervalHandle) {
    clearInterval(pollingState.intervalHandle);
    pollingState.intervalHandle = undefined;
  }

  pollingState.status = 'stopped';
  console.log('[Polling] Polling stopped');
}

export function restartPollingInterval(): void {
  stopPollingInterval();
  startPollingInterval();
}

// Graceful shutdown handler
export function setupGracefulShutdown(): void {
  const shutdown = () => {
    console.log('[Polling] Shutting down polling service');
    stopPollingInterval();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

// Reset polling state (for testing)
export function resetPollingState(): void {
  stopPollingInterval();
  pollingState = {
    status: 'stopped',
  };
  isMutexLocked = false;
}
