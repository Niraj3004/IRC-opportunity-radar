import Parser from 'rss-parser';
import { ISource } from '../../models/Source';
import { FetchResult } from './index';
import { contentHash } from '../../utils/contentHash';
import { env } from '../../config/env.config';

const parser = new Parser({
  customFields: {
    item: ['content:encoded', 'description'],
  },
  headers: {
    'User-Agent': env.FETCH_USER_AGENT,
  },
});

export const fetchRss = async (source: ISource): Promise<FetchResult> => {
  try {
    const feed = await parser.parseURL(source.url);
    
    // Map items strictly to fields (we don't need LLM for this)
    const items = feed.items.map(item => ({
      title: item.title,
      description: item.contentSnippet || item.content || item.description,
      url: item.link,
      postedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      // Attempt to map other fields if they match opportunity fields, otherwise LLM bypass
      rawExtract: item,
    }));

    const hash = contentHash(JSON.stringify(items));

    return { items, hash };
  } catch (error: any) {
    throw new Error(`Failed to fetch RSS feed: ${error.message}`);
  }
};
