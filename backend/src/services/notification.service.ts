import User from '../models/User';
import Notification from '../models/Notification';
import { IOpportunity } from '../models/Opportunity';

export const notifyMatches = async (opportunity: IOpportunity) => {
  // Find users whose interests intersect with the opportunity's tags or type
  try {
    const matchedUsers = await User.find({
      status: 'active',
      interests: { $in: [...opportunity.tags, opportunity.type] }
    });

    const notifications = matchedUsers.map(user => ({
      userId: user._id,
      title: 'New Matching Opportunity!',
      message: `A new ${opportunity.type} matching your interests was just published: ${opportunity.title}`,
      type: 'opportunity',
      relatedId: opportunity._id,
      isRead: false
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`[NOTIFY] Created ${notifications.length} notifications for ${opportunity.title}`);
    }
  } catch (err) {
    console.error('[NOTIFY] Failed to send notifications', err);
  }
};
