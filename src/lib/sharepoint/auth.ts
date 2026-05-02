import { getSharePointConfig } from '@/config/sharepoint-config';

interface AccessTokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: AccessTokenCache | null = null;

async function getAccessToken(): Promise<string> {
  const config = getSharePointConfig();
  const now = Date.now();

  if (tokenCache && tokenCache.expiresAt > now + 60000) {
    return tokenCache.token;
  }

  try {
    const response = await fetch(
      `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials',
        }).toString(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Azure auth failed: ${error.error_description || error.error}`);
    }

    const data = await response.json();
    const expiresIn = data.expires_in * 1000;

    tokenCache = {
      token: data.access_token,
      expiresAt: now + expiresIn,
    };

    return data.access_token;
  } catch (error) {
    tokenCache = null;
    throw error;
  }
}

export async function getGraphApiHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export function clearTokenCache(): void {
  tokenCache = null;
}
