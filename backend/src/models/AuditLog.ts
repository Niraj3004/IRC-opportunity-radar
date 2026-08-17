import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  actorId: mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: mongoose.Types.ObjectId;
  meta?: mongoose.Schema.Types.Mixed;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
