import Source from '../models/Source';
import Opportunity from '../models/Opportunity';
import FetchLog from '../models/FetchLog';
import { fetchSourceContent } from './fetchers';
import { hasSourceChanged } from './changeDetection';
import { extractData } from './extractor';
import { processAndDeduplicate } from './dedupe';
import { scoreAndRoute, postSaveRouting } from './scorer';

export const processSingleSource = async (source: any) => {
  const startedAt = new Date();
  await source.save();

  try {
    // 1. Fetch
    console.log(`[PIPELINE] Fetching ${source.name}...`);
    const fetchResult = await fetchSourceContent(source);

    // 2. Change Detection
    const changed = await hasSourceChanged(source, fetchResult.hash, startedAt);
    if (!changed) {
      console.log(`[PIPELINE] No changes for ${source.name}, skipping extraction.`);
      return { success: true, message: 'No changes detected', added: 0 };
    }

    // 3. Extract
    console.log(`[PIPELINE] Extracting data from ${source.name}...`);
    const { extractedItems, rawExtracts } = await extractData(source, fetchResult);

    // 4. Deduplicate
    console.log(`[PIPELINE] Deduplicating ${extractedItems.length} items from ${source.name}...`);
    const newOpportunities = await processAndDeduplicate(extractedItems, source._id as any, rawExtracts);

    // 5. Score & Route
    console.log(`[PIPELINE] Scoring ${newOpportunities.length} new items from ${source.name}...`);
    newOpportunities.forEach(opp => scoreAndRoute(opp));

    // 6. Generate Embeddings & Save
    let itemsNew = 0;
    if (newOpportunities.length > 0) {
      console.log(`[PIPELINE] Generating embeddings for ${newOpportunities.length} items...`);
      const { generateEmbedding } = await import('./extractor/embeddings');
      
      for (const opp of newOpportunities) {
        // Construct a semantic string for the embedding
        const semanticText = `${opp.title}. Type: ${opp.type}. Tags: ${(opp.tags || []).join(', ')}. Eligibility: ${opp.eligibility || 'Any'}.`;
        opp.embedding = await generateEmbedding(semanticText);
      }

      const savedDocs = await Opportunity.insertMany(newOpportunities);
      itemsNew = savedDocs.length;

      // 7. Notify
      for (const doc of savedDocs) {
        await postSaveRouting(doc as any);
      }
    }

    // 8. Log Success
    await FetchLog.create({
      sourceId: source._id,
      startedAt,
      finishedAt: new Date(),
      status: 'success',
      itemsFound: extractedItems.length,
      itemsNew: itemsNew,
      itemsChanged: 0,
      llmCalls: source.type === 'html' ? 1 : 0,
    });

    source.lastFetchedAt = new Date();
    source.lastStatus = 'ok';
    await source.save();
    console.log(`✅ [PIPELINE] Finished ${source.name}. Added ${itemsNew} new opportunities.`);
    return { success: true, message: `Added ${itemsNew} new opportunities`, added: itemsNew };

  } catch (error: any) {
    console.error(`❌ [PIPELINE] Error processing source ${source.name}:`, error.message);
    
    await FetchLog.create({
      sourceId: source._id,
      startedAt,
      finishedAt: new Date(),
      status: 'error',
      error: error.message,
    });

    source.lastStatus = 'error';
    await source.save();
    return { success: false, message: error.message, added: 0 };
  }
};

export const runAgentPipeline = async () => {
  console.log('🚀 Starting Agent Pipeline run...');
  const activeSources = await Source.find({ isActive: true });
  console.log(`Found ${activeSources.length} active sources to process.`);

  for (const source of activeSources) {
    await processSingleSource(source);
  }
  console.log('🏁 Agent Pipeline run completed.');
};
