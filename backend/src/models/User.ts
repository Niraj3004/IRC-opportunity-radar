import mongoose, { Schema, Document } from 'mongoose';
import { Roles } from '../constants/role.constant';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  status: 'pending' | 'active' | 'suspended';
  interests: string[];
  photoUrl?: string;
  emailPrefs: {
    digest: 'off' | 'daily' | 'weekly';
    deadlineReminders: boolean;
  };
  emailVerified: boolean;
  verifyToken?: string;
  resetToken?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(Roles), default: Roles.MEMBER },
    status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' },
    interests: [{ type: String }],
    photoUrl: { type: String },
    emailPrefs: {
      digest: { type: String, enum: ['off', 'daily', 'weekly'], default: 'weekly' },
      deadlineReminders: { type: Boolean, default: true },
    },
    emailVerified: { type: Boolean, default: false },
    verifyToken: { type: String },
    resetToken: { type: String },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
