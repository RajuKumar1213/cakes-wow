import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    // Check if connection is still alive
    if (cached.conn.connection.readyState === 1) {
      return cached.conn;
    } else {
      console.log('🔄 MongoDB connection lost, reconnecting...');
      cached.conn = null;
      cached.promise = null;
    }
  }
  
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 10000, // Increased timeout for better reliability
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      retryWrites: true, // Retry failed writes
      retryReads: true, // Retry failed reads
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      
      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
      });
      
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', e);
    
    // Add retry logic for critical operations like OTP
    if (e.name === 'MongoNetworkError' || e.name === 'MongoTimeoutError') {
      console.log('🔄 Retrying MongoDB connection...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      try {
        cached.promise = mongoose.connect(MONGODB_URI, {
          ...opts,
          serverSelectionTimeoutMS: 15000 // Longer timeout for retry
        }).then((mongoose) => {
          console.log('✅ MongoDB reconnected on retry');
          return mongoose;
        });
        
        cached.conn = await cached.promise;
      } catch (retryError) {
        cached.promise = null;
        console.error('❌ MongoDB retry failed:', retryError);
        throw retryError;
      }
    } else {
      throw e;
    }
  }

  return cached.conn;
}

export default dbConnect;
