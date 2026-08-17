import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  opportunityId: mongoose.Types.ObjectId;
  status: 'interested' | 'applying' | 'applied' | 'submitted' | 'won' | 'rejected';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    opportunityId: { type: Schema.Types.ObjectId, ref: 'Opportunity', required: true },
    status: { 
      type: String, 
      enum: ['interested', 'applying', 'applied', 'submitted', 'won', 'rejected'], 
      default: 'interested' 
    },
    notes: { type: String },
  },
  { timestamps: true }
);

ApplicationSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });

export default mongoose.model<IApplication>('Application', ApplicationSchema);
