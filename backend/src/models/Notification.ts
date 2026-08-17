import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  channel: 'in_app' | 'email' | 'both';
  linkUrl?: string;
  isRead: boolean;
  emailStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    channel: { type: String, enum: ['in_app', 'email', 'both'], default: 'in_app' },
    linkUrl: { type: String },
    isRead: { type: Boolean, default: false },
    emailStatus: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
