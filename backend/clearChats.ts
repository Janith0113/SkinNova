import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'

async function clearChats() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skinnova'
    console.log('Connecting to MongoDB...')
    
    await mongoose.connect(uri)
    console.log('✅ Connected to MongoDB')
    
    // Delete all chats
    const result = await mongoose.connection.db?.collection('chats').deleteMany({})
    console.log(`✅ Deleted ${result?.deletedCount} chats`)
    
    // Count remaining
    const count = await mongoose.connection.db?.collection('chats').countDocuments()
    console.log(`✅ Total chats remaining: ${count}`)
    
    await mongoose.connection.close()
    console.log('✅ Connection closed')
  } catch (err) {
    console.error('❌ Error:', err)
    process.exit(1)
  }
}

clearChats()
