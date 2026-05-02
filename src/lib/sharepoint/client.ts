import { getSharePointConfig } from '@/config/sharepoint-config';
import { getGraphApiHeaders } from './auth';

export interface WorksheetData {
  values: any[][];
  address: string;
}

export interface WorkbookInfo {
  id: string;
  name: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
}

export class GraphApiError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'GraphApiError';
  }
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (error instanceof GraphApiError && !error.retryable) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export async function getWorkbookInfo(): Promise<WorkbookInfo> {
  const config = getSharePointConfig();
  const headers = await getGraphApiHeaders();

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/sites/${config.siteId}/drives/${config.driveId}/items/${config.itemId}`,
    { headers }
  );

  if (!response.ok) {
    const error = await response.json();
    const retryable = response.status >= 500 || response.status === 429;
    throw new GraphApiError(
      error.error.code,
      response.status,
      `Failed to get workbook info: ${error.error.message}`,
      retryable
    );
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.name,
    createdDateTime: data.createdDateTime,
    lastModifiedDateTime: data.lastModifiedDateTime,
  };
}

export async function getWorksheetData(worksheetName: string = 'Sheet1'): Promise<WorksheetData> {
  return withRetry(async () => {
    const config = getSharePointConfig();
    const headers = await getGraphApiHeaders();

    const encodedName = encodeURIComponent(worksheetName);
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${config.siteId}/drives/${config.driveId}/items/${config.itemId}/workbook/worksheets/${encodedName}/usedRange`,
      { headers }
    );

    if (!response.ok) {
      const error = await response.json();
      const retryable = response.status >= 500 || response.status === 429;
      throw new GraphApiError(
        error.error.code,
        response.status,
        `Failed to get worksheet data: ${error.error.message}`,
        retryable
      );
    }

    const data = await response.json();
    return {
      values: data.values || [],
      address: data.address,
    };
  }, getSharePointConfig().maxRetries);
}

export async function getWorksheetList(): Promise<string[]> {
  return withRetry(async () => {
    const config = getSharePointConfig();
    const headers = await getGraphApiHeaders();

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${config.siteId}/drives/${config.driveId}/items/${config.itemId}/workbook/worksheets`,
      { headers }
    );

    if (!response.ok) {
      const error = await response.json();
      const retryable = response.status >= 500 || response.status === 429;
      throw new GraphApiError(
        error.error.code,
        response.status,
        `Failed to list worksheets: ${error.error.message}`,
        retryable
      );
    }

    const data = await response.json();
    return data.value.map((ws: any) => ws.name);
  }, getSharePointConfig().maxRetries);
}
