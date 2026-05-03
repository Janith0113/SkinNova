import mongoose from 'mongoose'

export async function connectDb(uri: string) {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    })
    console.log('Connected to MongoDB')
  } catch (err) {
    console.error('MongoDB connection error:', err)
    console.log('Continuing without MongoDB connection...')
    // Don't throw - allow server to start anyway
  }
}

export default mongoose
