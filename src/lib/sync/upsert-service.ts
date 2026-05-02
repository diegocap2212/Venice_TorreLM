import { prisma } from '@/lib/prisma';
import { TransformedColaborador } from '@/lib/sharepoint/transformer';

export interface UpsertResult {
  id: string;
  action: 'created' | 'updated' | 'skipped';
  changes?: Record<string, { old: any; new: any }>;
  error?: string;
}

async function findExistingColaborador(transformed: TransformedColaborador) {
  // Try email match first (most reliable)
  if (transformed.email) {
    const byEmail = await prisma.colaborador.findFirst({
      where: { email: transformed.email },
    });
    if (byEmail) return byEmail;
  }

  // Try CPF hash match (secondary)
  if (transformed.cpf_hash) {
    const byCpf = await prisma.colaborador.findUnique({
      where: { cpf_hash: transformed.cpf_hash },
    });
    if (byCpf) return byCpf;
  }

  // Try name + torre + squad match (tertiary - for disambiguation)
  if (transformed.torre && transformed.squad) {
    const byNameLocation = await prisma.colaborador.findFirst({
      where: {
        nome: transformed.nome,
        torre: transformed.torre,
        squad: transformed.squad,
      },
    });
    if (byNameLocation) return byNameLocation;
  }

  // Last resort: just by name (least reliable, use only if unique)
  const byName = await prisma.colaborador.findFirst({
    where: { nome: transformed.nome },
  });

  if (byName) {
    // Only return if there's exactly one with this name
    const count = await prisma.colaborador.count({
      where: { nome: transformed.nome },
    });
    if (count === 1) return byName;
  }

  return null;
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
  collaborators: TransformedColaborador[]
): Promise<UpsertResult[]> {
  const results: UpsertResult[] = [];

  for (const collaborator of collaborators) {
    const result = await upsertColaborador(collaborator);
    results.push(result);
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
