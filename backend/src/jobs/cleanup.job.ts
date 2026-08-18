import cron from 'node-cron';
import Opportunity from '../models/Opportunity';

export const startCleanupJob = () => {
  // Run once a week on Sunday at 3:00 AM (0 3 * * 0)
  cron.schedule('0 3 * * 0', async () => {
    console.log('🧹 [Cron] Running scheduled Database Cleanup Job...');
    try {
      // Find all opportunities where the deadline is older than 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await Opportunity.deleteMany({
        deadline: { $lt: thirtyDaysAgo }
      });

      console.log(`✅ [Cleanup Job] Deleted ${result.deletedCount} expired opportunities to save database space.`);
    } catch (error) {
      console.error('❌ [Cleanup Job] failed:', error);
    }
  });

  console.log('✅ Cleanup Job scheduled (runs weekly)');
};
