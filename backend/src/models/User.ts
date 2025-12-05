import { Schema, model, Document } from 'mongoose'

export interface IUser extends Document {
  name?: string
  email: string
  password: string
  role: 'admin' | 'doctor' | 'patient'
  profile?: any
  profilePhoto?: string
  verified?: boolean
  verificationDocuments?: string
  resetToken?: string
  resetTokenExpires?: Date
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  name: { type: String },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'doctor', 'patient'], default: 'patient' },
  profile: { type: Schema.Types.Mixed },
  profilePhoto: { type: String },
  verified: { type: Boolean, default: false },
  verificationDocuments: { type: String },
  resetToken: { type: String },
  resetTokenExpires: { type: Date },
  createdAt: { type: Date, default: () => new Date() }
})

export default model<IUser>('User', UserSchema)
