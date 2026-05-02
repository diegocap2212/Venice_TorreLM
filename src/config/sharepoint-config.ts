import { z } from 'zod';

const SharePointConfigSchema = z.object({
  tenantId: z.string().min(1, 'SHAREPOINT_TENANT_ID is required'),
  clientId: z.string().min(1, 'SHAREPOINT_CLIENT_ID is required'),
  clientSecret: z.string().min(1, 'SHAREPOINT_CLIENT_SECRET is required'),
  siteId: z.string().min(1, 'SHAREPOINT_SITE_ID is required'),
  driveId: z.string().min(1, 'SHAREPOINT_DRIVE_ID is required'),
  itemId: z.string().min(1, 'SHAREPOINT_ITEM_ID is required'),
  pollIntervalMs: z.number().int().positive().default(300000), // 5 minutes
  enabled: z.boolean().default(true),
  maxRetries: z.number().int().positive().default(3),
  timeoutMs: z.number().int().positive().default(30000),
  batchSize: z.number().int().positive().default(50),
  auditEnabled: z.boolean().default(true),
});

export type SharePointConfig = z.infer<typeof SharePointConfigSchema>;

function loadSharePointConfig(): SharePointConfig {
  const config = {
    tenantId: process.env.SHAREPOINT_TENANT_ID,
    clientId: process.env.SHAREPOINT_CLIENT_ID,
    clientSecret: process.env.SHAREPOINT_CLIENT_SECRET,
    siteId: process.env.SHAREPOINT_SITE_ID,
    driveId: process.env.SHAREPOINT_DRIVE_ID,
    itemId: process.env.SHAREPOINT_ITEM_ID,
    pollIntervalMs: process.env.SYNC_POLL_INTERVAL_MS ? parseInt(process.env.SYNC_POLL_INTERVAL_MS) : 300000,
    enabled: process.env.SYNC_ENABLED !== 'false',
    maxRetries: process.env.SYNC_MAX_RETRIES ? parseInt(process.env.SYNC_MAX_RETRIES) : 3,
    timeoutMs: process.env.SYNC_TIMEOUT_MS ? parseInt(process.env.SYNC_TIMEOUT_MS) : 30000,
    batchSize: process.env.SYNC_BATCH_SIZE ? parseInt(process.env.SYNC_BATCH_SIZE) : 50,
    auditEnabled: process.env.SYNC_AUDIT_ENABLED !== 'false',
  };

  const parsed = SharePointConfigSchema.safeParse(config);
  if (!parsed.success) {
    const errors = parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Error(`Invalid SharePoint configuration: ${errors}`);
  }

  return parsed.data;
}

let cachedConfig: SharePointConfig | null = null;

export function getSharePointConfig(): SharePointConfig {
  if (!cachedConfig) {
    cachedConfig = loadSharePointConfig();
  }
  return cachedConfig;
}

export function isSharePointSyncEnabled(): boolean {
  try {
    return getSharePointConfig().enabled;
  } catch {
    return false;
  }
}
