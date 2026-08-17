import { GoogleGenAI } from '@google/genai';
import { env } from '../src/config/env.config';

const testKeys = async () => {
  console.log(`🔍 Found ${env.GEMINI_KEYS.length} Gemini API keys to test.\n`);
  
  let successCount = 0;
  
  for (let i = 0; i < env.GEMINI_KEYS.length; i++) {
    const key = env.GEMINI_KEYS[i];
    console.log(`Testing Key ${i + 1} (${key.substring(0, 15)}...):`);
    
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: 'Reply with the word "OK"',
      });
      
      if (response.text) {
        console.log(`✅ Success! Response: ${response.text.trim()}`);
        successCount++;
      } else {
        console.log(`❌ Failed: Empty response`);
      }
    } catch (error: any) {
      console.log(`❌ Failed: ${error.message}`);
    }
    console.log('-----------------------------------');
  }
  
  console.log(`\n🎉 Results: ${successCount}/${env.GEMINI_KEYS.length} keys are working properly.`);
  process.exit(0);
};

testKeys();
