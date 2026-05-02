import { validateCPF } from '@/lib/cpf-utils';

export interface ValidationRule {
  name: string;
  validate: (value: any) => boolean;
  errorMessage: string;
}

export class FieldValidator {
  static validateEmail(email: string): boolean {
    if (!email) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateCPF(cpf: string): boolean {
    if (!cpf) return true; // Optional field
    return validateCPF(cpf);
  }

  static validateDate(date: any): boolean {
    if (!date) return true; // Optional field
    return date instanceof Date && !isNaN(date.getTime());
  }

  static validatePhone(phone: string): boolean {
    if (!phone) return true; // Optional field
    const phoneRegex = /^(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  static validateEnum(value: string, allowedValues: string[]): boolean {
    if (!value) return true; // Optional field
    return allowedValues.includes(value);
  }

  static validateNotEmpty(value: any): boolean {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  }

  static validateLength(value: string, minLength: number, maxLength?: number): boolean {
    if (!value) return true; // Optional field
    const len = value.length;
    if (len < minLength) return false;
    if (maxLength && len > maxLength) return false;
    return true;
  }

  static validateNumberRange(value: number, min: number, max?: number): boolean {
    if (value === null || value === undefined) return true; // Optional field
    if (value < min) return false;
    if (max && value > max) return false;
    return true;
  }

  static validateNoFutureDate(date: Date): boolean {
    if (!date) return true; // Optional field
    return date <= new Date();
  }
}

// Predefined validation rules
export const VALIDATION_RULES = {
  email: {
    name: 'email',
    validate: (value: any) => FieldValidator.validateEmail(value),
    errorMessage: 'Invalid email format',
  } as ValidationRule,

  cpf: {
    name: 'cpf',
    validate: (value: any) => FieldValidator.validateCPF(value),
    errorMessage: 'Invalid CPF',
  } as ValidationRule,

  date: {
    name: 'date',
    validate: (value: any) => FieldValidator.validateDate(value),
    errorMessage: 'Invalid date',
  } as ValidationRule,

  phone: {
    name: 'phone',
    validate: (value: any) => FieldValidator.validatePhone(value),
    errorMessage: 'Invalid phone number',
  } as ValidationRule,

  notEmpty: {
    name: 'notEmpty',
    validate: (value: any) => FieldValidator.validateNotEmpty(value),
    errorMessage: 'Field cannot be empty',
  } as ValidationRule,
};

export function createRules(...rules: ValidationRule[]) {
  return rules;
}

export function validateField(value: any, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      return rule.errorMessage;
    }
  }
  return null;
}

export function validateObject(
  obj: Record<string, any>,
  rules: Record<string, ValidationRule[]>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const error = validateField(obj[field], fieldRules);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}
