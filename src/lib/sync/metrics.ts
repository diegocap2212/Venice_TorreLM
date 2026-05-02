export interface SyncMetrics {
  totalSyncRuns: number;
  successfulSyncRuns: number;
  failedSyncRuns: number;
  averageSyncDurationMs: number;
  totalRecordsProcessed: number;
  totalRecordsCreated: number;
  totalRecordsUpdated: number;
  totalRecordsSkipped: number;
  totalErrors: number;
  successRate: number; // percentage
  errorRate: number; // percentage
  lastSyncDurationMs?: number;
}

let metricsData = {
  syncRuns: [] as Array<{
    duration: number;
    success: boolean;
    processed: number;
    created: number;
    updated: number;
    skipped: number;
    errors: number;
    timestamp: Date;
  }>,
};

export function recordSyncMetrics(
  duration: number,
  success: boolean,
  processed: number,
  created: number,
  updated: number,
  skipped: number,
  errors: number
): void {
  metricsData.syncRuns.push({
    duration,
    success,
    processed,
    created,
    updated,
    skipped,
    errors,
    timestamp: new Date(),
  });

  // Keep only last 100 runs
  if (metricsData.syncRuns.length > 100) {
    metricsData.syncRuns = metricsData.syncRuns.slice(-100);
  }
}

export function getMetrics(): SyncMetrics {
  const runs = metricsData.syncRuns;
  const total = runs.length;

  if (total === 0) {
    return {
      totalSyncRuns: 0,
      successfulSyncRuns: 0,
      failedSyncRuns: 0,
      averageSyncDurationMs: 0,
      totalRecordsProcessed: 0,
      totalRecordsCreated: 0,
      totalRecordsUpdated: 0,
      totalRecordsSkipped: 0,
      totalErrors: 0,
      successRate: 0,
      errorRate: 0,
    };
  }

  const successful = runs.filter(r => r.success).length;
  const failed = runs.filter(r => !r.success).length;
  const avgDuration = runs.reduce((sum, r) => sum + r.duration, 0) / total;
  const totalProcessed = runs.reduce((sum, r) => sum + r.processed, 0);
  const totalCreated = runs.reduce((sum, r) => sum + r.created, 0);
  const totalUpdated = runs.reduce((sum, r) => sum + r.updated, 0);
  const totalSkipped = runs.reduce((sum, r) => sum + r.skipped, 0);
  const totalErrors = runs.reduce((sum, r) => sum + r.errors, 0);

  return {
    totalSyncRuns: total,
    successfulSyncRuns: successful,
    failedSyncRuns: failed,
    averageSyncDurationMs: Math.round(avgDuration),
    totalRecordsProcessed,
    totalRecordsCreated,
    totalRecordsUpdated,
    totalRecordsSkipped,
    totalErrors,
    successRate: (successful / total) * 100,
    errorRate: failed > 0 ? (totalErrors / totalProcessed) * 100 : 0,
    lastSyncDurationMs: runs[runs.length - 1]?.duration,
  };
}

export function resetMetrics(): void {
  metricsData.syncRuns = [];
}
