import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env.config';
import { opportunityExtractionSchema, ExtractedOpportunity } from './schemas';

export const extractWithLLM = async (html: string): Promise<ExtractedOpportunity> => {
  const provider = env.LLM_PROVIDER;
  
  if (provider === 'none') {
    throw new Error('LLM extraction skipped (LLM_PROVIDER=none)');
  }

  let attempt = 0;
  const maxRetries = 1;

  while (attempt <= maxRetries) {
    try {
      let rawJson = '';

      if (provider === 'gemini') {
        const ai = new GoogleGenAI({ apiKey: env.LLM_API_KEY });
        const response = await ai.models.generateContent({
          model: env.LLM_MODEL || 'gemini-1.5-flash',
          contents: `Extract the scholarship/opportunity details from the following HTML into JSON matching this schema:
{
  "title": "string",
  "type": "grant|cfp|conference|hackathon|competition|workshop|fellowship|scholarship",
  "organization": "string (optional)",
  "deadline": "ISO date string (optional)",
  "applyUrl": "URL (optional)",
  "eligibility": "string (optional)",
  "amount": "string (optional)",
  "tags": ["array of strings"]
}

HTML Content:
${html}`,
          config: {
             responseMimeType: 'application/json',
          }
        });
        rawJson = response.text || '{}';
      } else if (provider === 'groq' || provider === 'ollama') {
        // Use generic OpenAI-compatible fetch
        const baseUrl = provider === 'groq' 
            ? 'https://api.groq.com/openai/v1/chat/completions' 
            : `${env.LLM_BASE_URL}/chat/completions`;
            
        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.LLM_API_KEY}`
          },
          body: JSON.stringify({
            model: env.LLM_MODEL || 'llama3-8b-8192',
            messages: [{
              role: 'user',
              content: `Extract opportunity details into valid JSON matching this schema: title(string), type(grant|cfp|conference|hackathon|competition|workshop|fellowship|scholarship), organization(string), deadline(ISO date), applyUrl(url), eligibility(string), amount(string), tags(string[]). Return ONLY raw JSON.\n\n${html}`
            }],
            response_format: { type: 'json_object' }
          })
        });
        
        if (!response.ok) throw new Error(`LLM Error: ${response.statusText}`);
        const data = await response.json();
        rawJson = data.choices[0].message.content;
      }

      const parsed = JSON.parse(rawJson);
      const validated = opportunityExtractionSchema.parse(parsed);
      return validated;

    } catch (error: any) {
      attempt++;
      if (attempt > maxRetries) {
        throw new Error(`LLM extraction failed after ${maxRetries} retries: ${error.message}`);
      }
      console.warn(`LLM extraction failed, retrying (${attempt}/${maxRetries})...`);
    }
  }

  throw new Error('LLM extraction failed');
};
