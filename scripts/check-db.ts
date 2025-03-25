import { connectDB } from '../lib/mongodb.js';
import CV from '../models/CV.js';
import mongoose from 'mongoose';

async function checkDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await connectDB();
        console.log('Connected to MongoDB');

        console.log('Checking for CVs...');
        const cvs = await CV.find().sort({ uploadDate: -1 });
        console.log(`Found ${cvs.length} CVs in database:`);

        if (cvs.length === 0) {
            console.log('No CVs found in the database.');
        } else {
            cvs.forEach(cv => {
                console.log(`
- Filename: ${cv.filename}
  ID: ${cv._id}
  Analyzed: ${cv.analyzed}
  Upload Date: ${cv.uploadDate}
  Tags: ${cv.tags?.join(', ') || 'none'}
                `);
            });
        }
    } catch (error) {
        console.error('Error checking database:', error);
        process.exit(1);
    } finally {
        // Close the database connection
        await mongoose.connection.close();
        process.exit(0);
    }
}

checkDatabase(); 