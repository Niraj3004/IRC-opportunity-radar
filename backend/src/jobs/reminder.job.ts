import cron from 'node-cron';
import Bookmark from '../models/Bookmark';
import Application from '../models/Application';
import Opportunity from '../models/Opportunity';
import Notification from '../models/Notification';
import User from '../models/User';
import { sendEmail } from '../services/email.service';
import { getDeadlineReminderEmail } from '../templates/emailTemplates';
import { env } from '../config/env.config';
export const startReminderJob = () => {
  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running deadline reminder job...');
    
    // Find deadlines exactly 3 days away
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    try {
      const upcomingOpps = await Opportunity.find({
        status: 'published',
        deadline: { $gte: startOfDay, $lte: endOfDay }
      }).lean();

      if (upcomingOpps.length === 0) return;

      const oppIds = upcomingOpps.map(o => o._id);

      // Find users who bookmarked or are tracking these
      const bookmarks = await Bookmark.find({ opportunityId: { $in: oppIds } }).lean();
      const applications = await Application.find({ 
        opportunityId: { $in: oppIds },
        status: { $in: ['interested', 'applying'] }
      }).lean();

      const notifyMap = new Map<string, Set<string>>(); // userId -> Set<oppId>

      bookmarks.forEach(b => {
        if (!notifyMap.has(b.userId.toString())) notifyMap.set(b.userId.toString(), new Set());
        notifyMap.get(b.userId.toString())!.add(b.opportunityId.toString());
      });

      applications.forEach(a => {
        if (!notifyMap.has(a.userId.toString())) notifyMap.set(a.userId.toString(), new Set());
        notifyMap.get(a.userId.toString())!.add(a.opportunityId.toString());
      });

      let sentCount = 0;
      for (const [userId, oppSet] of notifyMap.entries()) {
        const user = await User.findById(userId);
        if (!user || !user.emailPrefs.deadlineReminders) continue;

        for (const oppId of oppSet) {
          const opp = upcomingOpps.find(o => o._id.toString() === oppId);
          if (!opp) continue;

          await Notification.create({
            userId: user._id,
            title: 'Deadline Approaching!',
            message: `The deadline for ${opp.title} is coming up in 3 days!`,
            type: 'opportunity',
            channel: 'both',
            linkUrl: `/opportunities/${opp._id}`
          });

          await sendEmail(
            user.email,
            'Upcoming Deadline Reminder',
            getDeadlineReminderEmail(user.name, opp.title, 3, `${env.CLIENT_URL}/opportunities/${opp._id}`)
          );
          sentCount++;
        }
      }

      console.log(`✅ Deadline reminder job completed. Sent ${sentCount} reminders.`);
    } catch (error) {
      console.error('❌ Deadline reminder job failed:', error);
    }
  });
};
