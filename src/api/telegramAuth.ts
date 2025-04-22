import { retrieveRawInitData } from '@telegram-apps/sdk';
import { api } from '../lib/api';

/**
 * Configures the application's API instance with Telegram authentication headers
 * Adds the Telegram Mini App init data to the requests
 */
export function setupTelegramAuth() {
  // Add an interceptor to add the Telegram auth header to all non-GET requests
  api.interceptors.request.use((config) => {
    // Skip auth for GET requests
    if (config.method?.toLowerCase() === 'get') {
      return config;
    }

    try {
      const initDataRaw = retrieveRawInitData();
      if (initDataRaw) {
        // Set the Authorization header with the tma prefix
        config.headers.Authorization = `tma ${initDataRaw}`;
      }
    } catch (error) {
      console.error('Error retrieving Telegram init data:', error);
    }

    return config;
  });
}

export default setupTelegramAuth; 