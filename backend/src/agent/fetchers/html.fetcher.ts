import robotsParser from 'robots-parser';
import { ISource } from '../../models/Source';
import { FetchResult } from './index';
import { contentHash } from '../../utils/contentHash';
import { env } from '../../config/env.config';

export const fetchHtml = async (source: ISource): Promise<FetchResult> => {
  try {
    const urlObj = new URL(source.url);
    const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;

    // Fetch and honor robots.txt
    let isAllowed = true;
    try {
      const robotsResponse = await fetch(robotsUrl, { headers: { 'User-Agent': env.FETCH_USER_AGENT } });
      if (robotsResponse.ok) {
        const robotsTxt = await robotsResponse.text();
        const parser = robotsParser(robotsUrl, robotsTxt);
        isAllowed = parser.isAllowed(source.url, env.FETCH_USER_AGENT) ?? true;
      }
    } catch (err) {
      console.warn(`Could not fetch robots.txt for ${urlObj.host}, proceeding anyway`);
    }

    if (!isAllowed) {
      throw new Error('Access blocked by robots.txt');
    }

    const response = await fetch(source.url, {
      headers: {
        'User-Agent': env.FETCH_USER_AGENT,
        'Accept': 'text/html',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const hash = contentHash(html);

    return { html, hash };
  } catch (error: any) {
    throw new Error(`Failed to fetch HTML: ${error.message}`);
  }
};
