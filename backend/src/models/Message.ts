import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderRole: 'doctor' | 'patient';
  content: string;
  timestamp: Date;
  isRead: boolean;
  attachmentUrl?: string;
}

const MessageSchema = new Schema<IMessage>({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: Schema.Types.ObjectId, required: true },
  senderRole: { type: String, enum: ['doctor', 'patient'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  attachmentUrl: String,
});

export default mongoose.model<IMessage>('Message', MessageSchema);