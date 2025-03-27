import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');

if (fs.existsSync(envPath)) {
    console.log('Loading environment variables from .env.local');
    dotenv.config({ path: envPath });
} else {
    console.log('No .env.local file found, using default environment');
    dotenv.config();
}

// Import connectDB from ../lib/mongodb.ts
// We need to dynamically import it since it's a TypeScript file
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cv_analyzer';

async function main() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Define a schema that matches our CV schema
    const CVSchema = new mongoose.Schema({
        gender: String,
        parsedData: mongoose.Schema.Types.Mixed
    }, { strict: false });

    // Create a model based on the existing collection
    const CV = mongoose.model('CV', CVSchema, 'cvs');

    try {
        console.log('Finding CVs without gender information...');
        const cvs = await CV.find({
            $or: [
                { gender: { $exists: false } },
                { gender: null },
                { gender: '' }
            ]
        });

        console.log(`Found ${cvs.length} CVs without gender information`);

        let updatedCount = 0;

        for (const cv of cvs) {
            // Try to get gender from parsedData.demographics if it exists
            let gender = '';
            if (cv.parsedData?.demographics?.gender) {
                gender = cv.parsedData.demographics.gender;
            }

            // If no gender info in parsedData, set a default value
            if (!gender) {
                gender = 'Unknown';
            }

            // Update the CV with gender information
            await CV.updateOne(
                { _id: cv._id },
                {
                    $set: {
                        gender,
                        'parsedData.demographics.gender': gender
                    }
                }
            );

            updatedCount++;
            console.log(`Updated gender for CV ${cv._id}: ${gender}`);
        }

        console.log(`Migration complete. Updated ${updatedCount} out of ${cvs.length} CVs.`);
    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
}); 