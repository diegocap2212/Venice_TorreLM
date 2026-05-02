import { isSharePointSyncEnabled, getSharePointConfig } from '@/config/sharepoint-config';
import { startPollingInterval, setupGracefulShutdown } from './polling-service';

let initialized = false;

export async function initializeSharePointSync(): Promise<void> {
  // Prevent double initialization
  if (initialized) {
    return;
  }

  try {
    if (!isSharePointSyncEnabled()) {
      console.log('[SharePointSync] Sync is disabled via SYNC_ENABLED environment variable');
      return;
    }

    // Validate configuration
    const config = getSharePointConfig();
    console.log('[SharePointSync] Configuration loaded successfully');
    console.log(`[SharePointSync] Polling interval: ${config.pollIntervalMs}ms`);
    console.log(`[SharePointSync] Max retries: ${config.maxRetries}`);
    console.log(`[SharePointSync] Batch size: ${config.batchSize}`);

    // Start polling interval
    startPollingInterval();
    setupGracefulShutdown();

    initialized = true;
    console.log('[SharePointSync] Initialization complete');
  } catch (error) {
    console.error('[SharePointSync] Initialization failed:', error);
    initialized = false;
    throw error;
  }
}

export function isInitialized(): boolean {
  return initialized;
}

export function resetInitialization(): void {
  initialized = false;
}
