import { GoogleGenAI } from '@google/genai';
import Source from '../models/Source';
import DiscoveryLog from '../models/DiscoveryLog';
import { env } from '../config/env.config';

const SEARCH_PROMPTS = [
  // Global & General Research
  'Search the web for 5 new, active international research grants for 2026. Return ONLY a valid JSON array of their official URL strings.',
  'Search the web for 5 upcoming tech hackathons for researchers. Return ONLY a valid JSON array of their official URL strings.',
  'Search the web for 5 active undergraduate research scholarships. Return ONLY a valid JSON array of their official URL strings.',
  
  // Nepal Specific
  'Search the web for 5 upcoming research funding opportunities or grants specifically in Nepal. Return ONLY a valid JSON array of their official URL strings.',
  'Search the web for 5 upcoming tech hackathons happening in Nepal. Return ONLY a valid JSON array of their official URL strings.',
  'Search the web for 5 active university research projects in Nepal or international collaborative projects involving Nepal. Return ONLY a valid JSON array of their official URL strings.',
  
  // NGOs, INGOs & UNO
  'Search the web for 5 active grants or funding opportunities from NGOs, INGOs, or the UN (UNO) for development projects. Return ONLY a valid JSON array of their official URL strings.',
  
  // Startups & Software Development
  'Search the web for 5 active startup funding opportunities or grants for software development projects (like building apps/websites). Return ONLY a valid JSON array of their official URL strings.'
];

let currentGeminiKeyIndex = 0;

export const runDiscovery = async () => {
  console.log('🌍 [Discovery Agent] Starting Gemini AI web search for new sources...');
  
  const prompt = SEARCH_PROMPTS[Math.floor(Math.random() * SEARCH_PROMPTS.length)];
  console.log(`🌍 [Discovery Agent] Prompt: "${prompt}"`);

  let attempt = 0;
  const maxRetries = Math.max(3, env.GEMINI_KEYS.length);
  const startedAt = new Date();

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
        await DiscoveryLog.create({
          runAt: startedAt,
          promptUsed: prompt,
          urlsDiscovered: [],
          urlsAdded: [],
        });
        return;
      }

      const urlsAdded: string[] = [];

      for (const url of urls) {
        // Expanded Blacklist
        if (
          url.includes('wikipedia.org') || 
          url.includes('youtube.com') ||
          url.includes('facebook.com') ||
          url.includes('linkedin.com') ||
          url.includes('twitter.com') ||
          url.includes('x.com') ||
          url.includes('instagram.com') ||
          url.includes('reddit.com') ||
          url.includes('tiktok.com')
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
              type: 'html',
              fetchFrequency: '0 */4 * * *',
              enabled: true,
            });
            urlsAdded.push(url);
            console.log(`   ✅ [Discovery Agent] Added new source: ${url}`);
          } catch (err: any) {
             console.warn(`   ⚠️ [Discovery Agent] Failed to save source ${url}: ${err.message}`);
          }
        }
      }
      
      console.log(`🌍 [Discovery Agent] Finished. Added ${urlsAdded.length} new sources.`);
      
      await DiscoveryLog.create({
        runAt: startedAt,
        promptUsed: prompt,
        urlsDiscovered: urls,
        urlsAdded: urlsAdded,
      });

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
        await DiscoveryLog.create({
          runAt: startedAt,
          promptUsed: prompt,
          urlsDiscovered: [],
          urlsAdded: [],
          error: error.message,
        });
        return;
      }
      
      await new Promise(res => setTimeout(res, 2000 * attempt));
    }
  }
};
