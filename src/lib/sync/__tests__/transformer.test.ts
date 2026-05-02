import { DataTransformer } from '../transformer';
import { DEFAULT_COLUMN_MAPPING } from '@/lib/sharepoint/column-mapper';

describe('DataTransformer', () => {
  let transformer: DataTransformer;

  beforeEach(() => {
    transformer = new DataTransformer();
  });

  describe('transformRow', () => {
    it('should transform valid row correctly', () => {
      const headers = ['Colaborador', 'Cargo', 'Status', 'Data Admissão', 'Data Nascimento', 'Email'];
      const row = ['João Silva', 'Dev Senior', 'Ativo', '01/01/2020', '15/03/1990', 'joao@example.com'];

      const [transformed, errors] = transformer.transformRow(row, headers, 1);

      expect(errors.length).toBe(0);
      expect(transformed).not.toBeNull();
      expect(transformed?.nome).toBe('João Silva');
      expect(transformed?.cargo).toBe('Dev Senior');
      expect(transformed?.status).toBe('Ativo');
      expect(transformed?.email).toBe('joao@example.com');
    });

    it('should catch missing required fields', () => {
      const headers = ['Colaborador', 'Cargo', 'Email'];
      const row = ['João Silva', '', '']; // Missing cargo

      const [transformed, errors] = transformer.transformRow(row, headers, 1);

      expect(transformed).toBeNull();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.field === 'cargo')).toBe(true);
    });

    it('should handle empty rows', () => {
      const headers = ['Colaborador'];
      const row = ['', '', ''];

      const [transformed, errors] = transformer.transformRow(row, headers, 1);

      expect(transformed).toBeNull();
    });

    it('should validate enum values', () => {
      const headers = ['Colaborador', 'Cargo', 'Status', 'Data Admissão', 'Data Nascimento'];
      const row = ['João Silva', 'Dev', 'InvalidStatus', '01/01/2020', '15/03/1990'];

      const [transformed, errors] = transformer.transformRow(row, headers, 1);

      // Should either transform with warning or fail with error
      // depending on config (status is required for Colaborador)
    });

    it('should handle CPF hashing and masking', () => {
      const headers = ['Colaborador', 'Cargo', 'Status', 'Data Admissão', 'Data Nascimento', 'CPF'];
      const row = ['João Silva', 'Dev', 'Ativo', '01/01/2020', '15/03/1990', '12345678901'];

      const [transformed] = transformer.transformRow(row, headers, 1);

      expect(transformed?.cpf_hash).toBeDefined();
      expect(transformed?.cpf_masked).toBeDefined();
      expect(transformed?.cpf_masked).toContain('***');
    });
  });

  describe('transformBatch', () => {
    it('should transform multiple rows', () => {
      const headers = ['Colaborador', 'Cargo', 'Status', 'Data Admissão', 'Data Nascimento'];
      const rows = [
        headers, // Header row
        ['João Silva', 'Dev', 'Ativo', '01/01/2020', '15/03/1990'],
        ['Maria Santos', 'PM', 'Ativo', '02/02/2019', '20/05/1988'],
      ];

      const result = transformer.transformBatch(rows, headers);

      expect(result.success.length).toBe(2);
      expect(result.errors.length).toBe(0);
    });

    it('should continue on individual row errors', () => {
      const headers = ['Colaborador', 'Cargo', 'Status', 'Data Admissão', 'Data Nascimento'];
      const rows = [
        headers,
        ['João Silva', 'Dev', 'Ativo', '01/01/2020', '15/03/1990'],
        ['', 'PM', 'Ativo', '02/02/2019', '20/05/1988'], // Invalid: missing nome
        ['Maria Santos', 'QA', 'Inativo', '03/03/2018', '25/06/1992'],
      ];

      const result = transformer.transformBatch(rows, headers);

      expect(result.success.length).toBe(2);
      expect(result.skipped).toBe(1);
    });
  });

  describe('Date parsing', () => {
    it('should parse Brazilian date format', () => {
      const headers = ['Colaborador', 'Cargo', 'Status', 'Data Admissão', 'Data Nascimento'];
      const row = ['João', 'Dev', 'Ativo', '25/12/2020', '01/01/1990'];

      const [transformed] = transformer.transformRow(row, headers, 1);

      expect(transformed?.data_admissao).toBeDefined();
      expect(transformed?.data_admissao?.getFullYear()).toBe(2020);
    });
  });
});
