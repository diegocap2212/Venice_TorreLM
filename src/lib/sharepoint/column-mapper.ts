export interface ColumnMappingConfig {
  sharePointColumn: string;
  prismaField: string;
  dataType: 'string' | 'date' | 'number' | 'boolean' | 'enum';
  required: boolean;
  transform?: (value: any) => any;
  enumValues?: string[];
}

export interface ColumnMappingProfile {
  [key: string]: ColumnMappingConfig;
}

// Default mapping configuration for Colaborador data
export const DEFAULT_COLUMN_MAPPING: ColumnMappingProfile = {
  nome: {
    sharePointColumn: 'Colaborador',
    prismaField: 'nome',
    dataType: 'string',
    required: true,
  },
  email: {
    sharePointColumn: 'Email',
    prismaField: 'email',
    dataType: 'string',
    required: false,
    transform: (value: string) => {
      if (!value) return null;
      return value.toLowerCase().trim();
    },
  },
  cargo: {
    sharePointColumn: 'Cargo',
    prismaField: 'cargo',
    dataType: 'string',
    required: true,
  },
  status: {
    sharePointColumn: 'Status',
    prismaField: 'status',
    dataType: 'enum',
    required: false,
    enumValues: ['Ativo', 'Inativo', 'Licença', 'Afastamento'],
    transform: (value: string) => {
      if (!value) return 'Ativo';
      return value.trim();
    },
  },
  torre: {
    sharePointColumn: 'Torre',
    prismaField: 'torre',
    dataType: 'string',
    required: false,
  },
  squad: {
    sharePointColumn: 'Squad',
    prismaField: 'squad',
    dataType: 'string',
    required: false,
  },
  cpf: {
    sharePointColumn: 'CPF',
    prismaField: 'cpf_hash',
    dataType: 'string',
    required: false,
  },
  telefone: {
    sharePointColumn: 'Telefone',
    prismaField: 'telefone',
    dataType: 'string',
    required: false,
  },
  linkedin: {
    sharePointColumn: 'LinkedIn',
    prismaField: 'linkedin',
    dataType: 'string',
    required: false,
  },
  data_admissao: {
    sharePointColumn: 'Data Admissão',
    prismaField: 'data_admissao',
    dataType: 'date',
    required: true,
  },
  data_nascimento: {
    sharePointColumn: 'Data Nascimento',
    prismaField: 'data_nascimento',
    dataType: 'date',
    required: true,
  },
  tipo_contrato: {
    sharePointColumn: 'Tipo Contrato',
    prismaField: 'tipo_contrato',
    dataType: 'enum',
    required: false,
    enumValues: ['CLT', 'PJ', 'Terceirizado', 'Prestador', 'Consultor'],
  },
  regime: {
    sharePointColumn: 'Regime',
    prismaField: 'regime',
    dataType: 'enum',
    required: false,
    enumValues: ['Integral', 'Meio Período', 'Horista'],
  },
  salario: {
    sharePointColumn: 'Salário',
    prismaField: 'salario',
    dataType: 'number',
    required: false,
    transform: (value: any) => {
      if (!value) return null;
      const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.,]/g, '').replace(',', '.'));
      return isNaN(num) ? null : num;
    },
  },
  centro_custo: {
    sharePointColumn: 'Centro Custo',
    prismaField: 'centro_custo',
    dataType: 'string',
    required: false,
  },
  data_desligamento: {
    sharePointColumn: 'Data Desligamento',
    prismaField: 'data_desligamento',
    dataType: 'date',
    required: false,
  },
  motivo_desligamento: {
    sharePointColumn: 'Motivo Desligamento',
    prismaField: 'motivo_desligamento',
    dataType: 'string',
    required: false,
  },
  informacoes_internas: {
    sharePointColumn: 'Informações Internas',
    prismaField: 'informacoes_internas',
    dataType: 'string',
    required: false,
  },
};

export function getColumnMapping(customMapping?: ColumnMappingProfile): ColumnMappingProfile {
  return customMapping || DEFAULT_COLUMN_MAPPING;
}

export function findColumnIndex(headers: string[], columnName: string): number {
  if (!headers || headers.length === 0) {
    return -1;
  }

  const normalizedName = columnName.toLowerCase().trim();
  return headers.findIndex(h => h?.toLowerCase().trim() === normalizedName);
}

export function extractFieldFromRow(
  row: any[],
  headers: string[],
  columnName: string
): any {
  const index = findColumnIndex(headers, columnName);
  if (index === -1) {
    return undefined;
  }
  return row[index];
}
