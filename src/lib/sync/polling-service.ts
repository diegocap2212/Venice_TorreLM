import { getSharePointConfig, isSharePointSyncEnabled } from '@/config/sharepoint-config';
import { runSync } from './sync-worker';
import { getSyncState } from './sync-state';
import { withDistributedLock, DistributedLockError } from './distributed-lock';
import { logger } from './log-sanitizer';

type PollingStateStatus = 'idle' | 'running' | 'stopped';

interface PollingState {
  status: PollingStateStatus;
  intervalHandle?: NodeJS.Timeout;
  lastRunTime?: Date;
  nextRunTime?: Date;
  lockId?: string;
}

let pollingState: PollingState = {
  status: 'stopped',
};

export function isPollingActive(): boolean {
  return pollingState.status === 'running';
}

export function getPollingStatus() {
  return {
    ...pollingState,
    syncState: getSyncState(),
  };
}

export async function triggerSync(dryRun: boolean = false): Promise<void> {
  if (!isSharePointSyncEnabled()) {
    logger.info('[Polling] SharePoint sync is disabled');
    return;
  }

  // Use distributed lock to prevent concurrent syncs across instances
  try {
    await withDistributedLock(async () => {
      pollingState.lastRunTime = new Date();
      logger.info('[Polling] Triggering sync', { dryRun });
      await runSync(dryRun);
    }, 5 * 60 * 1000); // 5 minute timeout
  } catch (error) {
    if (error instanceof DistributedLockError) {
      logger.info('[Polling] Could not acquire lock, another instance is syncing');
    } else {
      logger.error('[Polling] Error during sync', error);
    }
  }
}

async function pollingSyncLoop(): Promise<void> {
  if (!isSharePointSyncEnabled()) {
    logger.info('[Polling] SharePoint sync is disabled, stopping polling');
    stopPollingInterval();
    return;
  }

  try {
    await triggerSync();
  } catch (error) {
    logger.error('[Polling] Error during sync loop', error);
  }

  // Schedule next run
  if (pollingState.status === 'running') {
    const config = getSharePointConfig();
    pollingState.nextRunTime = new Date(Date.now() + config.pollIntervalMs);
  }
}

export function startPollingInterval(): void {
  if (pollingState.status === 'running') {
    logger.info('[Polling] Polling already active');
    return;
  }

  if (!isSharePointSyncEnabled()) {
    logger.info('[Polling] SharePoint sync is disabled, not starting polling');
    return;
  }

  try {
    const config = getSharePointConfig();

    pollingState.status = 'running';
    pollingState.nextRunTime = new Date(Date.now() + config.pollIntervalMs);

    // Run first sync immediately
    logger.info('[Polling] Starting polling service');
    triggerSync().catch(err => {
      logger.error('[Polling] Error in initial sync', err);
    });

    // Setup recurring interval
    pollingState.intervalHandle = setInterval(
      () => {
        pollingSyncLoop().catch(err => {
          logger.error('[Polling] Error in polling loop', err);
        });
      },
      config.pollIntervalMs
    );

    logger.info('[Polling] Polling started', {
      intervalMs: config.pollIntervalMs,
    });
  } catch (error) {
    logger.error('[Polling] Failed to start polling', error);
    pollingState.status = 'stopped';
  }
}

export function stopPollingInterval(): void {
  if (pollingState.status === 'stopped') {
    logger.info('[Polling] Polling is not running');
    return;
  }

  if (pollingState.intervalHandle) {
    clearInterval(pollingState.intervalHandle);
    pollingState.intervalHandle = undefined;
  }

  pollingState.status = 'stopped';
  logger.info('[Polling] Polling stopped');
}

export function restartPollingInterval(): void {
  stopPollingInterval();
  startPollingInterval();
}

// Graceful shutdown handler
export function setupGracefulShutdown(): void {
  const shutdown = () => {
    logger.info('[Polling] Shutting down polling service');
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
}
