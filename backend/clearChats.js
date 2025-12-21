require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@skinnova.tlqbk.mongodb.net/skinnova';

console.log('Connecting to MongoDB with URI:', MONGODB_URI.replace(/:[^:]*@/, ':***@'));

mongoose
  .connect(MONGODB_URI, { 
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000 
  })
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Drop the Chat collection
    const result = await db.collection('chats').deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} chats`);
    
    // Show collection stats
    const count = await db.collection('chats').countDocuments();
    console.log(`✅ Total chats remaining: ${count}`);
    
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
