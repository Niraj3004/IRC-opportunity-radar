import mongoose, { Schema, Document } from 'mongoose';

export interface IFetchLog extends Document {
  sourceId: mongoose.Types.ObjectId;
  startedAt: Date;
  finishedAt?: Date;
  status: 'running' | 'success' | 'error';
  itemsFound: number;
  itemsNew: number;
  itemsChanged: number;
  llmCalls: number;
  error?: string;
}

const FetchLogSchema = new Schema<IFetchLog>(
  {
    sourceId: { type: Schema.Types.ObjectId, ref: 'Source', required: true },
    startedAt: { type: Date, required: true, default: Date.now },
    finishedAt: { type: Date },
    status: { type: String, enum: ['running', 'success', 'error'], required: true },
    itemsFound: { type: Number, default: 0 },
    itemsNew: { type: Number, default: 0 },
    itemsChanged: { type: Number, default: 0 },
    llmCalls: { type: Number, default: 0 },
    error: { type: String },
  },
  { timestamps: false }
);

export default mongoose.model<IFetchLog>('FetchLog', FetchLogSchema);
