import mongoose, { Schema, Document } from 'mongoose';
import { OpportunityTypes, OpportunityType } from '../constants/opportunityType';

export interface IOpportunity extends Document {
  title: string;
  description?: string;
  type: OpportunityType;
  organization?: string;
  url: string; // canonical
  applyUrl?: string;
  deadline?: Date;
  postedAt?: Date;
  location?: string;
  tags: string[];
  isPublished: boolean;
  embedding?: number[];
  eligibility?: string;
  amount?: string;
  sourceId: mongoose.Types.ObjectId;
  rawExtract?: mongoose.Schema.Types.Mixed;
  confidence: number; // 0-1
  status: 'pending' | 'approved' | 'published' | 'rejected' | 'archived';
  dedupeKey: string;
  reviewedBy?: mongoose.Types.ObjectId;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OpportunitySchema = new Schema<IOpportunity>(
  {
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: OpportunityTypes, required: true },
    organization: { type: String },
    url: { type: String, required: true },
    applyUrl: { type: String },
    deadline: { type: Date },
    postedAt: { type: Date },
    location: { type: String },
    tags: [{ type: String }],
    eligibility: { type: String },
    amount: { type: String },
    sourceId: { type: Schema.Types.ObjectId, ref: 'Source', required: true },
    rawExtract: { type: Schema.Types.Mixed },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    status: { type: String, enum: ['pending', 'approved', 'published', 'rejected', 'archived'], default: 'pending' },
    dedupeKey: { type: String, required: true, index: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    publishedAt: { type: Date },
    embedding: { type: [Number], default: [] },
  },
  { timestamps: true }
);

OpportunitySchema.index({ status: 1 });
OpportunitySchema.index({ deadline: 1 });

export default mongoose.model<IOpportunity>('Opportunity', OpportunitySchema);
