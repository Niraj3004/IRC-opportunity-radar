import User from '../models/User';
import Notification from '../models/Notification';
import { IOpportunity } from '../models/Opportunity';

import { sendEmail } from './email.service';
import { getMatchNotificationEmail } from '../templates/emailTemplates';
import { env } from '../config/env.config';

export const notifyMatches = async (opportunity: IOpportunity) => {
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
      channel: 'both',
      linkUrl: `/opportunities/${opportunity._id}`,
      isRead: false
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`[NOTIFY] Created ${notifications.length} in-app notifications for ${opportunity.title}`);
      
      // Send real-time emails
      matchedUsers.forEach(user => {
        sendEmail(
          user.email,
          'New Matching Opportunity!',
          getMatchNotificationEmail(user.name, opportunity.title, `${env.CLIENT_URL}/opportunities/${opportunity._id}`)
        );
      });
    }
  } catch (err) {
    console.error('[NOTIFY] Failed to send notifications', err);
  }
};

export const getUserNotifications = async (userId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ userId })
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const markAsRead = async (userId: string, notificationId: string) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
  if (!notif) throw new Error('Notification not found');
  return notif;
};

export const markAllAsRead = async (userId: string) => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  return { success: true };
};
