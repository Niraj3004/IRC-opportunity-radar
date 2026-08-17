import { ISource } from '../../models/Source';
import { fetchRss } from './rss.fetcher';
import { fetchHtml } from './html.fetcher';
import { fetchApi } from './api.fetcher';

export interface FetchResult {
  items?: any[];
  html?: string;
  hash: string;
}

export const fetchSourceContent = async (source: ISource): Promise<FetchResult> => {
  switch (source.type) {
    case 'rss':
      return fetchRss(source);
    case 'html':
      return fetchHtml(source);
    case 'api':
      return fetchApi(source);
    case 'browser':
      throw new Error('Browser fetcher not yet implemented');
    default:
      throw new Error(`Unsupported source type: ${source.type}`);
  }
};
