import { z } from 'zod';

export const SyncLogsQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 50))
    .pipe(z.number().int().min(1).max(100)),
  offset: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 0))
    .pipe(z.number().int().min(0)),
  resource: z
    .string()
    .optional()
    .refine(val => !val || ['SharePointSync', 'Colaborador'].includes(val), {
      message: 'Invalid resource type',
    }),
  action: z
    .string()
    .optional()
    .refine(
      val =>
        !val ||
        [
          'SYNC_START',
          'SYNC_SUCCESS',
          'SYNC_ERROR',
          'COLABORADOR_CREATE',
          'COLABORADOR_UPDATE',
          'COLABORADOR_SKIP',
          'VALIDATION_ERROR',
          'TRANSFORMATION_ERROR',
        ].includes(val),
      { message: 'Invalid action type' }
    ),
});

export type SyncLogsQuery = z.infer<typeof SyncLogsQuerySchema>;

export const SyncTriggerBodySchema = z.object({
  force: z.boolean().optional().default(false),
  dryRun: z.boolean().optional().default(false),
});

export type SyncTriggerBody = z.infer<typeof SyncTriggerBodySchema>;

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: z.ZodError['errors']
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateSyncLogsQuery(
  params: Record<string, string | string[] | undefined>
): SyncLogsQuery {
  try {
    return SyncLogsQuerySchema.parse({
      limit: params.limit,
      offset: params.offset,
      resource: params.resource,
      action: params.action,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid query parameters', error.errors);
    }
    throw error;
  }
}

export function validateSyncTriggerBody(body: unknown): SyncTriggerBody {
  try {
    return SyncTriggerBodySchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid request body', error.errors);
    }
    throw error;
  }
}
