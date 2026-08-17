import mongoose, { Schema, Document } from 'mongoose';

export interface IKpi extends Document {
  key: string;
  value: mongoose.Schema.Types.Mixed;
  computedAt: Date;
}

const KpiSchema = new Schema<IKpi>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    computedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: false }
);

export default mongoose.model<IKpi>('Kpi', KpiSchema);
