import { Schema, model, Document } from 'mongoose' 

export interface IFollowRequest extends Document { 
    patientId: string 
    doctorId: string 
    patientName?: string 
    patientEmail?: string 
    doctorName?: string 
    doctorEmail?: string 
    status: 'pending' | 'accepted' | 'rejected' 
    createdAt: Date 
    updatedAt: Date 
} 

const FollowRequestSchema = new Schema<IFollowRequest>({ 
    patientId: { type: String, required: true, index: true }, 
    doctorId: { type: String, required: true, index: true }, 
    patientName: { type: String }, patientEmail: { type: String }, 
    doctorName: { type: String }, doctorEmail: { type: String }, 
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }, 
    createdAt: { type: Date, default: () => new Date() }, 
    updatedAt: { type: Date, default: () => new Date() } }) 
    // Compound index to ensure one follow request per patient-doctor pair 


FollowRequestSchema.index({ patientId: 1, doctorId: 1 }, { unique: true }) 

export default model<IFollowRequest>('FollowRequest', FollowRequestSchema)