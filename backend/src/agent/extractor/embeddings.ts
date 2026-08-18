import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env.config';

let currentGeminiKeyIndex = 0;

export const generateEmbedding = async (text: string): Promise<number[]> => {
  if (env.LLM_PROVIDER === 'none') {
    return [];
  }

  let attempt = 0;
  const maxRetries = Math.max(3, env.GEMINI_KEYS.length);

  while (attempt <= maxRetries) {
    try {
      const apiKey = env.GEMINI_KEYS[currentGeminiKeyIndex % env.GEMINI_KEYS.length];
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: text,
      });

      if (response.embeddings && response.embeddings.length > 0) {
        return response.embeddings[0].values || [];
      }
      
      return [];
    } catch (error: any) {
      attempt++;
      
      const isRateLimit = error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED');
      
      if (isRateLimit) {
        currentGeminiKeyIndex++;
        console.warn(`🔄 Embedding API rate limited. Switching to key index ${currentGeminiKeyIndex % env.GEMINI_KEYS.length}...`);
      } else {
        console.warn(`Embedding generation failed, retrying (${attempt}/${maxRetries})...: ${error.message}`);
      }

      if (attempt > maxRetries) {
        console.error(`Failed to generate embedding after ${maxRetries} retries.`);
        return [];
      }
      
      await new Promise(res => setTimeout(res, 2000 * attempt));
    }
  }
  
  return [];
};
