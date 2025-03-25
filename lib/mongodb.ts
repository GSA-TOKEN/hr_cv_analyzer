import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cv_analyzer';

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let client: MongoClient | null = null;
let isConnected = false;

export async function connectDB() {
    try {
        if (isConnected && client) {
            console.log('Using existing MongoDB connection');
            return { client, db: client.db() };
        }

        // Connect to MongoDB using mongoose
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);

        // Create a new MongoDB client for GridFS
        client = new MongoClient(MONGODB_URI);
        await client.connect();

        isConnected = true;
        console.log('Successfully connected to MongoDB');

        return { client, db: client.db() };
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

// Handle cleanup on application shutdown
process.on('SIGINT', async () => {
    try {
        if (client) {
            await client.close();
            client = null;
            isConnected = false;
            console.log('Closed MongoDB connection');
        }
        await mongoose.connection.close();
        console.log('Closed Mongoose connection');
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
    process.exit(0);
}); 