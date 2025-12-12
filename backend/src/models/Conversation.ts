import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  createdAt: Date;
  lastMessageAt: Date;
  lastMessage?: string;
}

const ConversationSchema = new Schema<IConversation>({
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  lastMessageAt: { type: Date, default: Date.now },
  lastMessage: String,
});

export default mongoose.model<IConversation>('Conversation', ConversationSchema);