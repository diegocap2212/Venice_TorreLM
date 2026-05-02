'use server';

import { initializeSharePointSync, isInitialized } from '@/lib/sync/init';

// This component initializes the SharePoint sync on server startup
export async function SyncInitializer() {
  // Initialize sync on first load
  if (!isInitialized()) {
    try {
      await initializeSharePointSync();
    } catch (error) {
      console.error('[SyncInitializer] Failed to initialize sync:', error);
      // Don't throw - sync initialization failure shouldn't break the app
    }
  }

  // Render nothing - this component is only for side effects
  return null;
}
