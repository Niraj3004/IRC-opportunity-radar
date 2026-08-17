import cron from 'node-cron';
import User from '../models/User';
import Opportunity from '../models/Opportunity';
import { sendEmail } from '../services/email.service';
import { getDailyDigestEmail } from '../templates/emailTemplates';
import { env } from '../config/env.config';

export const startDigestJob = () => {
  // Run daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running daily digest job...');
    
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // We only care about users who want a daily digest
      const users = await User.find({ status: 'active', 'emailPrefs.digest': 'daily' }).lean();

      let sentCount = 0;
      for (const user of users) {
        if (!user.interests || user.interests.length === 0) continue;

        // Find new published opps matching their interests from the last 24h
        const opps = await Opportunity.find({
          status: 'published',
          publishedAt: { $gte: yesterday },
          $or: [
            { type: { $in: user.interests } },
            { tags: { $in: user.interests } }
          ]
        } as any).limit(10).lean();

        if (opps.length > 0) {
          // 4. Send email
          const htmlList = opps.map(opp => `<li><a href="${env.CLIENT_URL}/opportunities/${opp._id}">${opp.title}</a> (${opp.type})</li>`).join('');
          await sendEmail(
            user.email,
            `Your Daily Digest: ${opps.length} new opportunities`,
            getDailyDigestEmail(user.name, opps.length, htmlList)
          );
          sentCount++;
        }
      }

      console.log(`✅ Daily digest job completed. Sent ${sentCount} digests.`);
    } catch (error) {
      console.error('❌ Daily digest job failed:', error);
    }
  });
};
