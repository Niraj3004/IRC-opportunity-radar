import { runDiscovery } from '../src/agent/discovery';
import { connectDB } from '../src/config/db.config';
import mongoose from 'mongoose';

const test = async () => {
  console.log('🧪 Testing Auto-Discovery Agent...');
  
  try {
    await connectDB();
    await runDiscovery();
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

test();
