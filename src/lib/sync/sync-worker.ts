import { getWorkbookInfo, getWorksheetData } from '@/lib/sharepoint/client';
import { DataTransformer, TransformedColaborador } from '@/lib/sharepoint/transformer';
import { upsertBatch, summarizeUpsertResults } from './upsert-service';
import { auditSyncStart, auditSyncSuccess, auditSyncError, auditValidationError } from './sync-audit';
import { startSyncRun, endSyncRun, getSyncState, scheduleNextSync } from './sync-state';
import { retryWithBackoff, SyncHandlerError } from './error-handler';
import { getSharePointConfig } from '@/config/sharepoint-config';

export interface SyncRunResult {
  status: 'success' | 'failed' | 'partial';
  startTime: Date;
  endTime: Date;
  duration: number;
  stats: {
    processed: number;
    created: number;
    updated: number;
    skipped: number;
    errors: number;
  };
  errors: Array<{ type: string; message: string }>;
  message: string;
}

export class SharePointSyncWorker {
  private worksheetName: string = 'Colaboradores';
  private transformer: DataTransformer;

  constructor() {
    this.transformer = new DataTransformer();
  }

  async runSync(): Promise<SyncRunResult> {
    const startTime = new Date();
    startSyncRun();

    try {
      console.log('[Sync] Starting SharePoint sync run');
      await auditSyncStart();

      // Step 1: Get workbook info
      console.log('[Sync] Fetching workbook info');
      const workbookInfo = await retryWithBackoff(() => getWorkbookInfo());
      console.log(`[Sync] Workbook: ${workbookInfo.name}`);

      // Step 2: Fetch worksheet data
      console.log(`[Sync] Fetching worksheet data from "${this.worksheetName}"`);
      const worksheetData = await retryWithBackoff(() =>
        getWorksheetData(this.worksheetName)
      );

      if (!worksheetData.values || worksheetData.values.length === 0) {
        throw new Error('No data found in worksheet');
      }

      const headers = worksheetData.values[0];
      if (!headers || headers.length === 0) {
        throw new Error('No headers found in worksheet');
      }

      console.log(`[Sync] Found ${worksheetData.values.length - 1} rows of data`);

      // Step 3: Transform data
      console.log('[Sync] Transforming data');
      const transformResult = this.transformer.transformBatch(worksheetData.values, headers);

      if (transformResult.errors.length > 0) {
        console.log(`[Sync] Transformation completed with ${transformResult.errors.length} errors`);

        // Log validation errors
        for (const error of transformResult.errors.slice(0, 10)) {
          // Log first 10
          if (error.severity === 'error') {
            await auditValidationError(error.rowIndex, error.field, error.error);
          }
        }

        if (transformResult.errors.length > 10) {
          console.log(`[Sync] Additional ${transformResult.errors.length - 10} errors not logged`);
        }
      }

      if (transformResult.success.length === 0) {
        throw new Error(
          `No valid data to sync. Processed ${transformResult.skipped} rows with errors`
        );
      }

      console.log(`[Sync] Transformed ${transformResult.success.length} valid records`);

      // Step 4: Upsert to database
      console.log('[Sync] Upserting records to database');
      const upsertResults = await retryWithBackoff(
        () => upsertBatch(transformResult.success),
        1 // Single retry for upsert
      );

      const summary = summarizeUpsertResults(upsertResults);
      console.log(`[Sync] Upsert summary:`, summary);

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      const stats = {
        processed: summary.total,
        created: summary.created,
        updated: summary.updated,
        skipped: summary.skipped,
        errors: summary.errors,
      };

      // Determine overall status
      let status: 'success' | 'partial' | 'failed' = 'success';
      if (summary.errors > 0) {
        status = 'partial';
      }

      endSyncRun(status, {
        processed: stats.processed,
        created: stats.created,
        updated: stats.updated,
        skipped: stats.skipped,
      });

      scheduleNextSync(getSharePointConfig().pollIntervalMs);

      await auditSyncSuccess({ ...stats, duration });

      return {
        status,
        startTime,
        endTime,
        duration,
        stats,
        errors: summary.errorDetails.map(e => ({
          type: 'upsert',
          message: e.error || 'Unknown error',
        })),
        message: `Sync completed: ${stats.created} created, ${stats.updated} updated, ${stats.skipped} skipped`,
      };
    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      const syncError = error instanceof SyncHandlerError ? error : new SyncHandlerError(
        'unknown',
        error instanceof Error ? error.message : String(error),
        true
      );

      console.error('[Sync] Error during sync:', syncError.message);

      endSyncRun('failed', {
        processed: 0,
        created: 0,
        updated: 0,
        skipped: 0,
      });

      await auditSyncError(syncError.message, {
        type: syncError.type,
        retryable: syncError.retryable,
        details: syncError.details,
      });

      scheduleNextSync(getSharePointConfig().pollIntervalMs);

      return {
        status: 'failed',
        startTime,
        endTime,
        duration,
        stats: {
          processed: 0,
          created: 0,
          updated: 0,
          skipped: 0,
          errors: 1,
        },
        errors: [
          {
            type: syncError.type,
            message: syncError.message,
          },
        ],
        message: `Sync failed: ${syncError.message}`,
      };
    }
  }

  setWorksheetName(name: string): void {
    this.worksheetName = name;
  }
}

// Singleton instance
let workerInstance: SharePointSyncWorker | null = null;

export function getSyncWorker(): SharePointSyncWorker {
  if (!workerInstance) {
    workerInstance = new SharePointSyncWorker();
  }
  return workerInstance;
}

export async function runSync(): Promise<SyncRunResult> {
  const worker = getSyncWorker();
  return worker.runSync();
}
