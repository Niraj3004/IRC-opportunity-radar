import { ISource } from '../../models/Source';
import { FetchResult } from './index';
import { contentHash } from '../../utils/contentHash';
import { env } from '../../config/env.config';

export const fetchApi = async (source: ISource): Promise<FetchResult> => {
  try {
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': env.FETCH_USER_AGENT,
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check if source config specifies a path to the array
    let items = Array.isArray(data) ? data : [];
    const config: any = source.config;
    if (config && config.dataPath) {
        items = config.dataPath.split('.').reduce((acc: any, part: string) => acc && acc[part], data) || [];
    }
    
    if (!Array.isArray(items)) {
        throw new Error('API response did not contain an array of items');
    }

    const hash = contentHash(JSON.stringify(items));

    return { items, hash };
  } catch (error: any) {
    throw new Error(`Failed to fetch API endpoint: ${error.message}`);
  }
};
