import mongoose from 'mongoose';

// Get MongoDB URI from environment variable
const MONGODB_URI = process.env.MONGODB_URI;

// More robust build detection - Vercel sets different variables in different phases
const isBuildTime = 
  // Common Vercel build phase environment flags
  process.env.VERCEL_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build' || 
  process.env.NEXT_PHASE === 'build' ||
  // Build-only indicator
  process.env.VERCEL_ENV === 'development' && process.env.CI === 'true' ||
  // Complete absence of API URL is a clear indicator we're in build
  !process.env.NEXT_PUBLIC_API_URL;

// Log environment state without sensitive details
console.log(`🔑 MongoDB connection context: Build=${isBuildTime}, HasURI=${!!MONGODB_URI}, Environment=${process.env.NODE_ENV || 'unknown'}`);

if (!MONGODB_URI && !isBuildTime) {
  console.warn('⚠️ MONGODB_URI environment variable is not defined. Database connections will fail.');
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
  // Skip DB connection during build time or if URI is missing
  if (!MONGODB_URI) {
    if (isBuildTime) {
      console.log('⏭️ Skipping MongoDB connection during build phase');
      return { connection: { readyState: 0 }, isConnectSkipped: true };
    } else {
      console.error('❌ Cannot connect to MongoDB: MONGODB_URI is missing');
      return { connection: { readyState: 0 }, error: 'MISSING_URI' };
    }
  }
  
  if (isBuildTime) {
    console.log('⏭️ Skipping MongoDB connection during detected build phase');
    return { connection: { readyState: 0 }, isConnectSkipped: true };
  }
  
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
      serverSelectionTimeoutMS: 30000, // Extended timeout for Vercel serverless functions
      socketTimeoutMS: 60000, // Close sockets after 60 seconds of inactivity
      maxIdleTimeMS: 45000, // Close connections after 45 seconds of inactivity
      retryWrites: true, // Retry failed writes
      retryReads: true, // Retry failed reads
      connectTimeoutMS: 30000, // Give it more time to connect initially
      family: 4, // Force IPv4 (sometimes helps with connection issues)
    };
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      
      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
      });
      
      // Handle process termination
      process.on('SIGINT', () => {
        mongoose.connection.close(() => {
          console.log('MongoDB connection closed due to app termination');
          process.exit(0);
        });
      });
      
      return mongoose;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', e);
    console.error('Connection error details:', {
      name: e.name,
      message: e.message,
      code: e.code,
      stack: e.stack?.substring(0, 200)
    });
    
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
        return { connection: { readyState: 0 }, error: retryError };
      }
    } else {
      return { connection: { readyState: 0 }, error: e };
    }
  }

  return cached.conn;
}

export default dbConnect;
