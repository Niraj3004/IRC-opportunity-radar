import mongoose, { Schema, Document } from 'mongoose';

export interface IDiscoveryLog extends Document {
  runAt: Date;
  promptUsed: string;
  urlsDiscovered: string[];
  urlsAdded: string[];
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DiscoveryLogSchema = new Schema<IDiscoveryLog>(
  {
    runAt: { type: Date, required: true },
    promptUsed: { type: String, required: true },
    urlsDiscovered: [{ type: String }],
    urlsAdded: [{ type: String }],
    error: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IDiscoveryLog>('DiscoveryLog', DiscoveryLogSchema);
