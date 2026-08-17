import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const getGeminiKeys = () => {
  const keys: string[] = [];
  for (let i = 1; i <= 20; i++) {
    if (process.env[`GEMINI_API_KEY_${i}`]) {
      keys.push(process.env[`GEMINI_API_KEY_${i}`] as string);
    }
  }
  return keys.length > 0 ? keys : (process.env.LLM_API_KEY ? [process.env.LLM_API_KEY] : []);
};

const envSchema = z.object({
  PORT: z.string().default('3000'),
  MONGODB_URI: z.string(),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  CLIENT_URL: z.string(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  LLM_PROVIDER: z.enum(['gemini', 'groq', 'ollama', 'none']).default('none'),
  LLM_API_KEY: z.string().optional(),
  LLM_MODEL: z.string().optional(),
  LLM_BASE_URL: z.string().optional(),
  FETCH_USER_AGENT: z.string().default('OpportunityRadarBot/1.0'),
  MAX_LLM_CALLS_PER_RUN: z.string().default('10'),
  AUTO_PUBLISH_THRESHOLD: z.string().default('0.8'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = {
  ...parsed.data,
  GEMINI_KEYS: getGeminiKeys(),
};
