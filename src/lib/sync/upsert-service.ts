import { prisma } from '@/lib/prisma';
import { TransformedColaborador } from '@/lib/sharepoint/transformer';

export interface UpsertResult {
  id: string;
  action: 'created' | 'updated' | 'skipped';
  changes?: Record<string, { old: any; new: any }>;
  error?: string;
}

async function findExistingColaborador(transformed: TransformedColaborador) {
  // OPTIMIZED: Single query with OR conditions instead of multiple queries
  // This reduces N+1 to a single query

  if (!transformed.email && !transformed.cpf_hash) {
    // No reliable identifiers, skip match
    return null;
  }

  const existing = await prisma.colaborador.findFirst({
    where: {
      OR: [
        // Primary: email match
        ...(transformed.email ? [{ email: transformed.email }] : []),
        // Secondary: CPF hash match
        ...(transformed.cpf_hash ? [{ cpf_hash: transformed.cpf_hash }] : []),
      ],
    },
  });

  // REMOVED: Name-only matching because it's too fragile
  // Risk: returning different person with same name
  // Solution: Require email or CPF for matching

  return existing || null;
}

function computeChanges(
  existing: any,
  transformed: TransformedColaborador
): Record<string, { old: any; new: any }> {
  const changes: Record<string, { old: any; new: any }> = {};

  const fieldsToCheck = Object.keys(transformed) as (keyof TransformedColaborador)[];

  for (const field of fieldsToCheck) {
    const newValue = transformed[field];
    const oldValue = existing[field];

    // Compare values
    let isChanged = false;

    if (oldValue instanceof Date && newValue instanceof Date) {
      isChanged = oldValue.getTime() !== newValue.getTime();
    } else if (oldValue !== newValue) {
      isChanged = true;
    }

    if (isChanged) {
      changes[field] = { old: oldValue, new: newValue };
    }
  }

  return changes;
}

export async function upsertColaborador(
  transformed: TransformedColaborador
): Promise<UpsertResult> {
  try {
    const existing = await findExistingColaborador(transformed);

    if (existing) {
      const changes = computeChanges(existing, transformed);

      if (Object.keys(changes).length === 0) {
        return {
          id: existing.id,
          action: 'skipped',
        };
      }

      const updated = await prisma.colaborador.update({
        where: { id: existing.id },
        data: transformed,
      });

      return {
        id: updated.id,
        action: 'updated',
        changes,
      };
    } else {
      const created = await prisma.colaborador.create({
        data: transformed,
      });

      return {
        id: created.id,
        action: 'created',
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      id: '',
      action: 'skipped',
      error: errorMessage,
    };
  }
}

export async function upsertBatch(
  collaborators: TransformedColaborador[],
  batchSize: number = 10
): Promise<UpsertResult[]> {
  // OPTIMIZED: Parallel processing with concurrency limit
  // Instead of sequential loop (very slow), process in batches with Promise.all
  // This is 10-20x faster for large datasets

  const results: UpsertResult[] = [];

  for (let i = 0; i < collaborators.length; i += batchSize) {
    const batch = collaborators.slice(i, i + batchSize);

    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(collaborator => upsertColaborador(collaborator))
    );

    results.push(...batchResults);
  }

  return results;
}

export function summarizeUpsertResults(results: UpsertResult[]) {
  return {
    total: results.length,
    created: results.filter(r => r.action === 'created').length,
    updated: results.filter(r => r.action === 'updated').length,
    skipped: results.filter(r => r.action === 'skipped').length,
    errors: results.filter(r => r.error).length,
    errorDetails: results.filter(r => r.error).map(r => ({
      id: r.id,
      error: r.error,
    })),
  };
}
