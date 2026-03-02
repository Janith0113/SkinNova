import { Schema, model, Document } from 'mongoose'

export interface IContactMessage extends Document {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: 'unread' | 'read' | 'replied'
  reply?: string
  repliedBy?: string
  repliedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
    reply: { type: String },
    repliedBy: { type: String },
    repliedAt: { type: Date },
  },
  { timestamps: true }
)

export const ContactMessage = model<IContactMessage>('ContactMessage', ContactMessageSchema)
