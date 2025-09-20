const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📍 Connection string:', process.env.DB_URI ? 'Found' : 'Missing');
    
    await mongoose.connect(process.env.DB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });
    
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('🔍 Full error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
