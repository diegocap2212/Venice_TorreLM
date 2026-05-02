// Padrões para dados sensíveis
const SENSITIVE_PATTERNS = {
  cpf: /(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})/g,
  email: /([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
  phone: /(\(?[0-9]{2}\)?[\s-]?9?[0-9]{4}-?[0-9]{4})/g,
  uuid: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
  token: /(Bearer|Token|Authorization)\s+([a-zA-Z0-9._\-]+)/gi,
  sharePointId: /item[Id]*:?\s*'?([a-zA-Z0-9\-_]{36})'?/gi,
  password: /password\s*[:=]\s*'?([^'\s,}]+)'?/gi,
  secret: /secret\s*[:=]\s*'?([^'\s,}]+)'?/gi,
  clientSecret: /client[_-]?secret\s*[:=]\s*'?([^'\s,}]+)'?/gi,
  salary: /sal[aá]rio\s*[:=]\s*(\d+[.,]\d{2})/gi,
};

const SENSITIVE_FIELDS = [
  'cpf',
  'cpf_hash',
  'cpf_masked',
  'salario',
  'password',
  'clientSecret',
  'client_secret',
  'token',
  'accessToken',
  'refreshToken',
];

export function sanitizeValue(value: any, fieldName?: string): any {
  if (typeof value !== 'string') {
    return value;
  }

  let sanitized = value;

  // Check if field name indicates sensitive data
  if (fieldName) {
    const fieldLower = fieldName.toLowerCase();
    if (SENSITIVE_FIELDS.some(f => fieldLower.includes(f))) {
      return '[REDACTED]';
    }
  }

  // Apply pattern-based sanitization
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.cpf, '***.***.***-**');
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.email, '[EMAIL]');
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.phone, '[PHONE]');
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.token, '$1 [TOKEN]');
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.sharePointId, 'item:[REDACTED]');
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.password, 'password:[REDACTED]');
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.secret, 'secret:[REDACTED]');
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.clientSecret, 'client_secret:[REDACTED]');
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.salary, 'salário:[REDACTED]');

  return sanitized;
}

export function sanitizeObject(obj: any, depth: number = 0): any {
  if (depth > 10) {
    return '[DEEP_OBJECT]';
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeValue(obj);
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value, depth + 1);

      // Also check field name
      if (SENSITIVE_FIELDS.some(f => key.toLowerCase().includes(f))) {
        sanitized[key] = '[REDACTED]';
      }
    }
    return sanitized;
  }

  return obj;
}

export function sanitizeError(error: any): string {
  if (error instanceof Error) {
    return sanitizeValue(error.message);
  }
  return sanitizeValue(String(error));
}

export class StructuredLogger {
  private context: Record<string, any> = {};

  setContext(context: Record<string, any>) {
    this.context = sanitizeObject(context);
  }

  private formatLog(level: string, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message: sanitizeValue(message),
      context: this.context,
      ...(data && { data: sanitizeObject(data) }),
    };

    console.log(JSON.stringify(logEntry));
  }

  debug(message: string, data?: any) {
    this.formatLog('DEBUG', message, data);
  }

  info(message: string, data?: any) {
    this.formatLog('INFO', message, data);
  }

  warn(message: string, data?: any) {
    this.formatLog('WARN', message, data);
  }

  error(message: string, error?: any) {
    this.formatLog('ERROR', message, {
      error: error instanceof Error ? sanitizeError(error) : error,
    });
  }
}

export const logger = new StructuredLogger();
