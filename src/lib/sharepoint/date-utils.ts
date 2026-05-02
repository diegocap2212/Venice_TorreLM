export class DateParsingError extends Error {
  constructor(message: string, public originalValue: any) {
    super(message);
    this.name = 'DateParsingError';
  }
}

// Excel epoch is January 1, 1900, but there's an off-by-one error for leap year 1900
const EXCEL_EPOCH = new Date(1899, 11, 30);

export function parseExcelDate(excelSerialNumber: number): Date {
  if (typeof excelSerialNumber !== 'number' || excelSerialNumber <= 0) {
    throw new DateParsingError(
      `Invalid Excel serial number: ${excelSerialNumber}`,
      excelSerialNumber
    );
  }

  const days = Math.floor(excelSerialNumber);
  const fractionOfDay = excelSerialNumber % 1;

  const date = new Date(EXCEL_EPOCH);
  date.setDate(date.getDate() + days);

  const ms = Math.round(fractionOfDay * 24 * 60 * 60 * 1000);
  date.setMilliseconds(date.getMilliseconds() + ms);

  return date;
}

export function parseBRDate(dateString: string): Date {
  if (!dateString || typeof dateString !== 'string') {
    throw new DateParsingError('Invalid date string', dateString);
  }

  const trimmed = dateString.trim();

  // Try DD/MM/YYYY format
  const brMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    if (isNaN(date.getTime())) {
      throw new DateParsingError('Invalid date values in DD/MM/YYYY format', dateString);
    }

    return date;
  }

  throw new DateParsingError('Date does not match DD/MM/YYYY format', dateString);
}

export function parseISODate(dateString: string): Date {
  if (!dateString || typeof dateString !== 'string') {
    throw new DateParsingError('Invalid date string', dateString);
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new DateParsingError('Invalid ISO date string', dateString);
  }

  return date;
}

export function parseDate(value: any, format?: 'excel' | 'br' | 'iso' | 'auto'): Date {
  if (value instanceof Date) {
    if (isNaN(value.getTime())) {
      throw new DateParsingError('Invalid Date object', value);
    }
    return value;
  }

  const targetFormat = format || 'auto';

  if (targetFormat === 'excel' || targetFormat === 'auto') {
    if (typeof value === 'number') {
      try {
        return parseExcelDate(value);
      } catch (error) {
        if (targetFormat === 'excel') throw error;
      }
    }
  }

  if (typeof value === 'string') {
    // Try ISO first (most reliable)
    if (targetFormat === 'iso' || targetFormat === 'auto') {
      try {
        const isoDate = parseISODate(value);
        if (isoDate) return isoDate;
      } catch (error) {
        if (targetFormat === 'iso') throw error;
      }
    }

    // Try Brazilian format
    if (targetFormat === 'br' || targetFormat === 'auto') {
      try {
        return parseBRDate(value);
      } catch (error) {
        if (targetFormat === 'br') throw error;
      }
    }
  }

  throw new DateParsingError(
    `Could not parse date value in format ${targetFormat}`,
    value
  );
}

export function validateDateRange(
  date: Date,
  minDate?: Date,
  maxDate?: Date
): boolean {
  if (minDate && date < minDate) return false;
  if (maxDate && date > maxDate) return false;
  return true;
}

export function formatDateForDB(date: Date): Date {
  // Ensure the date is at the start of the day in UTC
  const utcDate = new Date(date);
  utcDate.setUTCHours(0, 0, 0, 0);
  return utcDate;
}
