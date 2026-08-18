import mongoose, { Schema, Document } from 'mongoose';
import { SourceTypes, SourceType } from '../constants/sourceType';

export interface ISource extends Document {
  name: string;
  url: string;
  type: SourceType;
  category?: string;
  tags: string[];
  fetchFrequency: string; // cron or minutes
  enabled: boolean;
  lastFetchedAt?: Date;
  lastHash?: string;
  lastStatus: 'ok' | 'error' | 'idle';
  config?: mongoose.Schema.Types.Mixed; // per-source mapping/selector hints
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SourceSchema = new Schema<ISource>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: SourceTypes, required: true },
    category: { type: String },
    tags: [{ type: String }],
    fetchFrequency: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    lastFetchedAt: { type: Date },
    lastHash: { type: String },
    lastStatus: { type: String, enum: ['ok', 'error', 'idle'], default: 'idle' },
    config: { type: Schema.Types.Mixed },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<ISource>('Source', SourceSchema);
