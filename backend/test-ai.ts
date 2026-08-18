import mongoose from 'mongoose';
import { env } from './src/config/env.config';
import { runDiscovery } from './src/agent/discovery';
import { runAgentPipeline } from './src/agent/pipeline';

const test = async () => {
  console.log('Connecting to database...');
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected.');

  console.log('--- TEST 1: DISCOVERY AGENT ---');
  await runDiscovery();

  console.log('--- TEST 2: SCRAPER PIPELINE ---');
  await runAgentPipeline();

  console.log('Done.');
  process.exit(0);
};

test().catch(err => console.error(err));
