export interface SyncState {
  lastSyncAt?: Date;
  lastSyncStatus: 'pending' | 'success' | 'failed' | 'partial';
  nextScheduledSyncAt?: Date;
  lastCheckAt?: Date;
  totalRunsCompleted: number;
  successfulRuns: number;
  failedRuns: number;
  totalColaboradoresProcessed: number;
  totalCreated: number;
  totalUpdated: number;
  totalSkipped: number;
  lastErrors: SyncError[];
  isRunning: boolean;
}

export interface SyncError {
  timestamp: Date;
  type: 'auth' | 'network' | 'validation' | 'database' | 'unknown';
  message: string;
  details?: any;
  retryable: boolean;
}

// In-memory state management
let syncState: SyncState = {
  lastSyncStatus: 'pending',
  totalRunsCompleted: 0,
  successfulRuns: 0,
  failedRuns: 0,
  totalColaboradoresProcessed: 0,
  totalCreated: 0,
  totalUpdated: 0,
  totalSkipped: 0,
  lastErrors: [],
  isRunning: false,
};

export function getSyncState(): SyncState {
  return { ...syncState };
}

export function startSyncRun(): void {
  syncState.isRunning = true;
  syncState.lastCheckAt = new Date();
  syncState.lastErrors = [];
}

export function endSyncRun(
  status: 'success' | 'failed' | 'partial',
  stats: {
    processed: number;
    created: number;
    updated: number;
    skipped: number;
  }
): void {
  syncState.isRunning = false;
  syncState.lastSyncAt = new Date();
  syncState.lastSyncStatus = status;
  syncState.totalRunsCompleted++;

  if (status === 'success' || status === 'partial') {
    syncState.successfulRuns++;
  } else {
    syncState.failedRuns++;
  }

  syncState.totalColaboradoresProcessed += stats.processed;
  syncState.totalCreated += stats.created;
  syncState.totalUpdated += stats.updated;
  syncState.totalSkipped += stats.skipped;

  // Schedule next sync
  if (typeof window === 'undefined') {
    // Server-side: scheduling happens in polling service
  }
}

export function recordSyncError(error: SyncError): void {
  syncState.lastErrors.push(error);
  // Keep only last 10 errors
  if (syncState.lastErrors.length > 10) {
    syncState.lastErrors = syncState.lastErrors.slice(-10);
  }
}

export function scheduleNextSync(intervalMs: number): void {
  const now = new Date();
  syncState.nextScheduledSyncAt = new Date(now.getTime() + intervalMs);
}

export function resetState(): void {
  syncState = {
    lastSyncStatus: 'pending',
    totalRunsCompleted: 0,
    successfulRuns: 0,
    failedRuns: 0,
    totalColaboradoresProcessed: 0,
    totalCreated: 0,
    totalUpdated: 0,
    totalSkipped: 0,
    lastErrors: [],
    isRunning: false,
  };
}
