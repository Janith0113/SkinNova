import mongoose, { Schema, Document } from 'mongoose'

interface ILeprosyAssistantChat extends Document {
  userId: string
  messages: {
    _id?: mongoose.Types.ObjectId
    text: string
    sender: 'user' | 'assistant'
    timestamp: Date
  }[]
  createdAt: Date
  updatedAt: Date
}

const LeprosyAssistantChatSchema = new Schema<ILeprosyAssistantChat>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    messages: [
      {
        text: {
          type: String,
          required: true
        },
        sender: {
          type: String,
          enum: ['user', 'assistant'],
          required: true
        },
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
)

export default mongoose.model<ILeprosyAssistantChat>('LeprosyAssistantChat', LeprosyAssistantChatSchema)
