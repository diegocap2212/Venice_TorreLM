import {
  DEFAULT_COLUMN_MAPPING,
  ColumnMappingProfile,
  extractFieldFromRow,
  findColumnIndex,
} from './column-mapper';
import { parseDate, DateParsingError } from './date-utils';
import { hashCPF, maskCPF, validateCPF } from '@/lib/cpf-utils';

export interface TransformError {
  rowIndex: number;
  field: string;
  value: any;
  error: string;
  severity: 'warning' | 'error';
}

export interface TransformedColaborador {
  nome: string;
  cargo: string;
  status: string;
  data_admissao: Date;
  data_nascimento: Date;
  email?: string | null;
  torre?: string | null;
  squad?: string | null;
  cpf_hash?: string | null;
  cpf_masked?: string | null;
  telefone?: string | null;
  linkedin?: string | null;
  tipo_contrato?: string | null;
  regime?: string | null;
  salario?: number | null;
  centro_custo?: string | null;
  data_desligamento?: Date | null;
  motivo_desligamento?: string | null;
  informacoes_internas?: string | null;
}

export interface TransformResult {
  success: TransformedColaborador[];
  errors: TransformError[];
  skipped: number;
}

export class DataTransformer {
  private columnMapping: ColumnMappingProfile;

  constructor(columnMapping?: ColumnMappingProfile) {
    this.columnMapping = columnMapping || DEFAULT_COLUMN_MAPPING;
  }

  private addError(
    rowIndex: number,
    field: string,
    value: any,
    message: string,
    severity: 'warning' | 'error' = 'error'
  ): TransformError {
    return {
      rowIndex,
      field,
      value,
      error: message,
      severity,
    };
  }

  private transformField(
    field: string,
    value: any,
    mapping: any,
    rowIndex: number,
    errors: TransformError[]
  ): [any, boolean] {
    if (!value && value !== 0 && value !== false) {
      if (mapping.required) {
        errors.push(
          this.addError(rowIndex, field, value, `Required field is empty`, 'error')
        );
        return [null, false];
      }
      return [null, true];
    }

    try {
      let transformedValue = value;

      if (mapping.transform) {
        transformedValue = mapping.transform(value);
      }

      if (transformedValue === null || transformedValue === undefined) {
        if (mapping.required) {
          errors.push(
            this.addError(rowIndex, field, value, `Field transformation resulted in null`, 'error')
          );
          return [null, false];
        }
        return [null, true];
      }

      // Validate enum values
      if (mapping.dataType === 'enum' && mapping.enumValues) {
        if (!mapping.enumValues.includes(transformedValue)) {
          errors.push(
            this.addError(
              rowIndex,
              field,
              value,
              `Invalid enum value. Expected one of: ${mapping.enumValues.join(', ')}`
            )
          );
          if (mapping.required) return [null, false];
          return [null, true];
        }
      }

      return [transformedValue, true];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(
        this.addError(rowIndex, field, value, errorMessage, mapping.required ? 'error' : 'warning')
      );
      return [null, !mapping.required];
    }
  }

  transformRow(
    row: any[],
    headers: string[],
    rowIndex: number
  ): [TransformedColaborador | null, TransformError[]] {
    const errors: TransformError[] = [];
    const data: any = {};

    // Skip header row and empty rows
    if (rowIndex === 0 || !row || row.length === 0 || row.every(cell => !cell)) {
      return [null, errors];
    }

    // Special handling for CPF
    let cpfValue: string | null = null;

    for (const [fieldKey, mapping] of Object.entries(this.columnMapping)) {
      const value = extractFieldFromRow(row, headers, mapping.sharePointColumn);

      if (fieldKey === 'cpf') {
        // Handle CPF separately
        if (value) {
          cpfValue = String(value).replace(/\D/g, '');
          if (cpfValue.length !== 11) {
            errors.push(
              this.addError(
                rowIndex,
                'cpf',
                value,
                'CPF must have 11 digits',
                'warning'
              )
            );
            cpfValue = null;
          } else if (!validateCPF(cpfValue)) {
            errors.push(
              this.addError(
                rowIndex,
                'cpf',
                value,
                'Invalid CPF (failed validation)',
                'warning'
              )
            );
            cpfValue = null;
          }
        }
        continue;
      }

      // Handle dates specially
      if (mapping.dataType === 'date') {
        if (!value && !mapping.required) {
          data[mapping.prismaField] = null;
          continue;
        }

        try {
          const parsedDate = parseDate(value, 'auto');
          data[mapping.prismaField] = parsedDate;
        } catch (error) {
          const errorMessage = error instanceof DateParsingError
            ? error.message
            : 'Failed to parse date';
          errors.push(
            this.addError(rowIndex, fieldKey, value, errorMessage, mapping.required ? 'error' : 'warning')
          );
          if (mapping.required) {
            return [null, errors];
          }
          data[mapping.prismaField] = null;
        }
        continue;
      }

      // Handle other fields
      const [transformedValue, isValid] = this.transformField(
        fieldKey,
        value,
        mapping,
        rowIndex,
        errors
      );

      if (!isValid && mapping.required) {
        return [null, errors];
      }

      data[mapping.prismaField] = transformedValue;
    }

    // Add CPF hash and masked
    if (cpfValue) {
      data.cpf_hash = hashCPF(cpfValue);
      data.cpf_masked = maskCPF(cpfValue);
    }

    // Check required fields
    const requiredFields = ['nome', 'cargo', 'data_admissao', 'data_nascimento', 'status'];
    for (const field of requiredFields) {
      if (!data[field]) {
        errors.push(
          this.addError(rowIndex, field, null, `Required field is missing or empty`, 'error')
        );
        return [null, errors];
      }
    }

    const transformed: TransformedColaborador = {
      nome: data.nome,
      cargo: data.cargo,
      status: data.status,
      data_admissao: data.data_admissao,
      data_nascimento: data.data_nascimento,
      email: data.email ?? null,
      torre: data.torre ?? null,
      squad: data.squad ?? null,
      cpf_hash: data.cpf_hash ?? null,
      cpf_masked: data.cpf_masked ?? null,
      telefone: data.telefone ?? null,
      linkedin: data.linkedin ?? null,
      tipo_contrato: data.tipo_contrato ?? null,
      regime: data.regime ?? null,
      salario: data.salario ?? null,
      centro_custo: data.centro_custo ?? null,
      data_desligamento: data.data_desligamento ?? null,
      motivo_desligamento: data.motivo_desligamento ?? null,
      informacoes_internas: data.informacoes_internas ?? null,
    };

    return [transformed, errors];
  }

  transformBatch(
    rows: any[][],
    headers: string[]
  ): TransformResult {
    const success: TransformedColaborador[] = [];
    const allErrors: TransformError[] = [];
    let skipped = 0;

    // Process each row starting from 1 (skip header at index 0)
    for (let i = 1; i < rows.length; i++) {
      const [transformed, errors] = this.transformRow(rows[i], headers, i);

      if (errors.length > 0) {
        allErrors.push(...errors);
      }

      if (transformed) {
        success.push(transformed);
      } else if (!errors.length || errors.some(e => e.severity === 'error')) {
        skipped++;
      }
    }

    return {
      success,
      errors: allErrors,
      skipped,
    };
  }
}
