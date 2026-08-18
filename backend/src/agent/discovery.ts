import { GoogleGenAI } from '@google/genai';
import Source from '../models/Source';
import { env } from '../config/env.config';

const SEARCH_PROMPTS = [
  'Search the web for 5 new, active research grants for 2026. Return ONLY a valid JSON array of their official URL strings.',
  'Search the web for 5 upcoming tech hackathons for researchers. Return ONLY a valid JSON array of their official URL strings.',
  'Search the web for 5 active undergraduate research scholarships. Return ONLY a valid JSON array of their official URL strings.',
  'Search the web for 5 current call for papers in computer science. Return ONLY a valid JSON array of their official URL strings.'
];

let currentGeminiKeyIndex = 0;

export const runDiscovery = async () => {
  console.log('🌍 [Discovery Agent] Starting Gemini AI web search for new sources...');
  
  const prompt = SEARCH_PROMPTS[Math.floor(Math.random() * SEARCH_PROMPTS.length)];
  console.log(`🌍 [Discovery Agent] Prompt: "${prompt}"`);

  let attempt = 0;
  const maxRetries = Math.max(3, env.GEMINI_KEYS.length);

  while (attempt <= maxRetries) {
    try {
      const apiKey = env.GEMINI_KEYS[currentGeminiKeyIndex % env.GEMINI_KEYS.length];
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: env.LLM_MODEL || 'gemini-3.6-flash',
        contents: prompt,
        config: {
           tools: [{ googleSearch: {} }],
           responseMimeType: 'application/json',
        }
      });

      const rawJson = response.text || '[]';
      const urls: string[] = JSON.parse(rawJson);
      
      if (!urls || urls.length === 0) {
        console.log('🌍 [Discovery Agent] AI found no URLs.');
        return;
      }

      let addedCount = 0;

      for (const url of urls) {
        // Skip very generic or unwanted domains
        if (
          url.includes('wikipedia.org') || 
          url.includes('youtube.com') ||
          url.includes('facebook.com')
        ) {
          continue;
        }

        // Check if URL is already in Sources
        const existing = await Source.findOne({ url });
        
        if (!existing) {
          try {
            await Source.create({
              name: 'Auto-Discovered by AI',
              url: url,
              isActive: true,
              createdBy: null, // Indicates system created
            });
            addedCount++;
            console.log(`   ✅ [Discovery Agent] Added new source: ${url}`);
          } catch (err: any) {
             console.warn(`   ⚠️ [Discovery Agent] Failed to save source ${url}: ${err.message}`);
          }
        }
      }
      
      console.log(`🌍 [Discovery Agent] Finished. Added ${addedCount} new sources.`);
      return; // Success, exit loop

    } catch (error: any) {
      attempt++;
      
      const isRateLimit = error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED');
      
      if (isRateLimit) {
        currentGeminiKeyIndex++;
        console.warn(`🔄 Gemini API key rate limited. Switching to key index ${currentGeminiKeyIndex % env.GEMINI_KEYS.length}...`);
      } else {
        console.warn(`🌍 [Discovery Agent] Search failed, retrying (${attempt}/${maxRetries})...: ${error.message}`);
      }

      if (attempt > maxRetries) {
        console.error(`🌍 [Discovery Agent] Failed after ${maxRetries} retries.`);
        return;
      }
      
      await new Promise(res => setTimeout(res, 2000 * attempt));
    }
  }
};
