import cron from 'node-cron';
import Opportunity from '../models/Opportunity';

export const startCleanupJob = () => {
  // Run every Sunday at 3:00 AM
  cron.schedule('0 3 * * 0', async () => {
    console.log('🧹 Cleanup: Waking up database cleaner...');
    try {
      // Calculate the date exactly 14 days ago
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      // Find all opportunities where the deadline passed more than 14 days ago
      const expiredOpps = await Opportunity.find({
        deadline: { $lt: twoWeeksAgo }
      });

      if (expiredOpps.length === 0) {
        console.log('🧹 Cleanup: Database is already clean. No old grants found.');
        return;
      }

      console.log(`🧹 Cleanup: Found ${expiredOpps.length} expired grants older than 2 weeks. Deleting...`);

      // Delete them
      const result = await Opportunity.deleteMany({
        deadline: { $lt: twoWeeksAgo }
      });

      console.log(`   ✅ Cleanup Complete: Deleted ${result.deletedCount} old grants from the database.`);
    } catch (error) {
      console.error('❌ Cleanup: Failed to run database cleanup:', error);
    }
  });
};
