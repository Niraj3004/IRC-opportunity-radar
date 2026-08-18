import cron from 'node-cron';
import { runDiscovery } from '../agent/discovery';

export const startDiscoveryJob = () => {
  // Run once a day at midnight (0 0 * * *)
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ [Cron] Running scheduled Discovery Job...');
    try {
      await runDiscovery();
    } catch (error) {
      console.error('❌ [Cron] Discovery Job failed:', error);
    }
  });

  console.log('✅ Discovery Job scheduled (runs daily at midnight)');
};
