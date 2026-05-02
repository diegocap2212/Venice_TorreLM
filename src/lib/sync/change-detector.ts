import { createHash } from 'crypto';
import { TransformedColaborador } from '@/lib/sharepoint/transformer';

const KEY_FIELDS = [
  'nome',
  'cargo',
  'status',
  'email',
  'torre',
  'squad',
  'data_admissao',
  'data_nascimento',
  'tipo_contrato',
  'regime',
  'salario',
  'centro_custo',
] as const;

export function computeDataHash(data: TransformedColaborador): string {
  const values = KEY_FIELDS.map(field => {
    const value = data[field as keyof TransformedColaborador];
    if (value instanceof Date) {
      return value.toISOString();
    }
    return String(value ?? '');
  }).join('|');

  return createHash('sha256').update(values).digest('hex');
}

export function hasDataChanged(oldHash: string, newHash: string): boolean {
  return oldHash !== newHash;
}

export interface FieldDiff {
  field: string;
  oldValue: any;
  newValue: any;
}

export function computeFieldDiffs(
  oldData: TransformedColaborador,
  newData: TransformedColaborador
): FieldDiff[] {
  const diffs: FieldDiff[] = [];

  const fieldsToCheck = Object.keys(newData) as (keyof TransformedColaborador)[];

  for (const field of fieldsToCheck) {
    const oldValue = oldData[field];
    const newValue = newData[field];

    let isChanged = false;

    if (oldValue instanceof Date && newValue instanceof Date) {
      isChanged = oldValue.getTime() !== newValue.getTime();
    } else {
      isChanged = oldValue !== newValue;
    }

    if (isChanged) {
      diffs.push({
        field: String(field),
        oldValue,
        newValue,
      });
    }
  }

  return diffs;
}
