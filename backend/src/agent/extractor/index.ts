import { ISource } from '../../models/Source';
import { FetchResult } from '../fetchers';
import { extractWithLLM } from './llm.provider';
import { ExtractedOpportunity, opportunityExtractionSchema } from './schemas';

export const extractData = async (
  source: ISource,
  fetchResult: FetchResult
): Promise<{ extractedItems: ExtractedOpportunity[]; rawExtracts: any[] }> => {
  
  if (source.type === 'rss' || source.type === 'api') {
    // No LLM required. Map straight from feed.
    const items = fetchResult.items || [];
    const extractedItems: ExtractedOpportunity[] = [];
    const rawExtracts: any[] = [];
    
    for (const item of items) {
      try {
         // Attempt to extract fields based on common names or source.config mapping
         const mapped = {
           title: item.title || item.name || 'Unknown Title',
           type: item.type || source.category || 'scholarship',
           organization: item.organization || item.company || source.name,
           applyUrl: item.applyUrl || item.url || item.link,
           deadline: item.deadline ? new Date(item.deadline).toISOString() : undefined,
           tags: Array.isArray(item.tags) ? item.tags : (source.tags || []),
         };
         
         const validated = opportunityExtractionSchema.parse(mapped);
         extractedItems.push(validated);
         rawExtracts.push(item);
      } catch (err) {
         console.warn(`Failed to map structured item from source ${source.name}`, err);
      }
    }
    
    return { extractedItems, rawExtracts };
  }
  
  if (source.type === 'html' || source.type === 'browser') {
    if (!fetchResult.html) {
      throw new Error('No HTML content provided to extractor');
    }
    
    const validated = await extractWithLLM(fetchResult.html);
    return { 
      extractedItems: [validated], 
      rawExtracts: [fetchResult.html.substring(0, 5000)] // Store truncated raw HTML
    };
  }
  
  return { extractedItems: [], rawExtracts: [] };
};
