import { prisma } from '@/lib/prisma';
import { FieldDiff } from './change-detector';

export type SyncAuditAction =
  | 'SYNC_START'
  | 'SYNC_SUCCESS'
  | 'SYNC_ERROR'
  | 'COLABORADOR_CREATE'
  | 'COLABORADOR_UPDATE'
  | 'COLABORADOR_SKIP'
  | 'VALIDATION_ERROR'
  | 'TRANSFORMATION_ERROR';

export interface SyncAuditRecord {
  acao: SyncAuditAction;
  recurso: string;
  recurso_id?: string;
  detalhes?: string;
  metadata?: Record<string, any>;
}

export async function auditSyncEvent(
  acao: SyncAuditAction,
  recurso: string,
  recurso_id?: string,
  detalhes?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    let fullDetalhes = detalhes;

    // Include metadata in detalhes if provided
    if (metadata) {
      const metadataStr = JSON.stringify(metadata);
      fullDetalhes = detalhes ? `${detalhes} | ${metadataStr}` : metadataStr;
    }

    await prisma.auditLog.create({
      data: {
        user_email: 'sharepoint-sync',
        acao,
        recurso,
        recurso_id,
        detalhes: fullDetalhes,
        ip: 'internal-sync-service',
      },
    });
  } catch (err) {
    console.error('[SyncAudit] Failed to log audit event:', err);
  }
}

export async function auditColaboradorSync(
  action: 'CREATE' | 'UPDATE' | 'SKIP',
  colaboradorId: string,
  colaboradorName: string,
  changes?: FieldDiff[] | null
): Promise<void> {
  const actionMap: Record<string, SyncAuditAction> = {
    CREATE: 'COLABORADOR_CREATE',
    UPDATE: 'COLABORADOR_UPDATE',
    SKIP: 'COLABORADOR_SKIP',
  };

  const metadata: Record<string, any> = {
    action,
    name: colaboradorName,
  };

  if (changes && changes.length > 0) {
    metadata.changes = changes.map(c => ({
      field: c.field,
      old: c.oldValue,
      new: c.newValue,
    }));
  }

  await auditSyncEvent(
    actionMap[action],
    'Colaborador',
    colaboradorId,
    `Colaborador ${action.toLowerCase()} via SharePoint sync`,
    metadata
  );
}

export async function auditSyncStart(): Promise<void> {
  await auditSyncEvent('SYNC_START', 'SharePointSync', undefined, 'Starting SharePoint sync run');
}

export async function auditSyncSuccess(stats: {
  processed: number;
  created: number;
  updated: number;
  skipped: number;
  duration: number;
}): Promise<void> {
  await auditSyncEvent(
    'SYNC_SUCCESS',
    'SharePointSync',
    undefined,
    'SharePoint sync completed successfully',
    stats
  );
}

export async function auditSyncError(error: string, metadata?: Record<string, any>): Promise<void> {
  await auditSyncEvent('SYNC_ERROR', 'SharePointSync', undefined, `Sync error: ${error}`, metadata);
}

export async function auditValidationError(
  rowIndex: number,
  field: string,
  error: string
): Promise<void> {
  await auditSyncEvent(
    'VALIDATION_ERROR',
    'SharePointSync',
    undefined,
    `Row ${rowIndex}, field ${field}: ${error}`,
    { rowIndex, field }
  );
}

export async function auditTransformationError(
  rowIndex: number,
  error: string
): Promise<void> {
  await auditSyncEvent(
    'TRANSFORMATION_ERROR',
    'SharePointSync',
    undefined,
    `Row ${rowIndex}: ${error}`,
    { rowIndex }
  );
}
