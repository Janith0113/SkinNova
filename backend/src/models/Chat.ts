import { Schema, model, Document } from 'mongoose'

export interface IChatMessage {
        senderId: string 
        senderName?: string 
        senderRole?: 'doctor' | 'patient' 
        content: string 
        timestamp: Date
}

export interface IChat extends Document { patientId: string 
    doctorId: string 
    patientName?: string 
    doctorName?: string 
    messages: IChatMessage[] 
    createdAt: Date 
    updatedAt: Date 
} 

const ChatMessageSchema = new Schema<IChatMessage>({ 
    senderId: { type: String, required: true }, 
    senderName: { type: String }, 
    senderRole: { type: String, enum: ['doctor', 'patient'] }, 
    content: { type: String, required: true }, 
    timestamp: { type: Date, default: () => new Date() } }, { _id: false 
}) 
    
const ChatSchema = new Schema<IChat>({ 
    patientId: { type: String, required: true, index: true }, 
    doctorId: { type: String, required: true, index: true }, 
    patientName: { type: String }, doctorName: { type: String }, 
    messages: [ChatMessageSchema], createdAt: { type: Date, default: () => new Date() }, 
    updatedAt: { type: Date, default: () => new Date() } 
})

//Compound index to ensure one chat per patient-doctor pair

ChatSchema.index({ patientId: 1, doctorId: 1 }, { unique: true }) 

export default model<IChat>('Chat', ChatSchema)