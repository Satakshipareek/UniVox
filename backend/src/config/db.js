import mongoose from 'mongoose';

let connectionPromise;

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;
  if (mongoose.connection.readyState === 2) return mongoose.connection.asPromise();

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is missing. Configure backend/.env before starting the API.');

  connectionPromise = (async () => {
    if (mongoose.connection.readyState === 3) await mongoose.disconnect();
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

    console.log(`MongoDB connected: ${mongoose.connection.name}`);
    return mongoose.connection;
  })().finally(() => {
    connectionPromise = undefined;
  });

  return connectionPromise;
}
