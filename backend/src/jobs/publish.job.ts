import cron from 'node-cron';
import Opportunity from '../models/Opportunity';
import { notifyMatches } from '../services/notification.service';

export const startPublishJob = () => {
  // Run every hour between 9 AM and 6 PM (Business Hours)
  cron.schedule('0 9-18 * * *', async () => {
    console.log('👔 Human-Illusion: Drip Publishing Job Waking Up...');
    try {
      // Find all approved opportunities
      const approvedOpps = await Opportunity.find({ status: 'approved' });
      
      if (approvedOpps.length === 0) {
        console.log('👔 Human-Illusion: No approved opportunities to publish right now.');
        return;
      }

      // Pick how many to publish this hour (1 or 2)
      const countToPublish = Math.random() > 0.5 ? 2 : 1;
      const actualCount = Math.min(countToPublish, approvedOpps.length);

      console.log(`👔 Human-Illusion: Selecting ${actualCount} opportunities to publish this hour...`);

      // Shuffle array to pick random ones
      const shuffled = approvedOpps.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, actualCount);

      for (const opp of selected) {
        opp.status = 'published';
        opp.publishedAt = new Date();
        await opp.save(); // Using save() to trigger any Mongoose hooks if present

        console.log(`   ✅ Published: ${opp.title}`);

        // Trigger email match notifications
        await notifyMatches(opp);
      }

      console.log('👔 Human-Illusion: Drip publishing complete for this hour.');
    } catch (error) {
      console.error('❌ Human-Illusion: Drip publish failed:', error);
    }
  });
};
