import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { parseISO, parse, differenceInYears } from 'date-fns';

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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cv_analyzer';

// Function to calculate age from different birthdate formats
function calculateAgeFromBirthdate(birthdate) {
    if (!birthdate) return null;

    try {
        let birthDate = null;
        const birthdateStr = birthdate.trim();

        // Try different date formats
        // 1. Try ISO format (YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}$/.test(birthdateStr)) {
            birthDate = parseISO(birthdateStr);
        }
        // 2. Try MM/DD/YYYY or DD/MM/YYYY
        else if (/^\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4}$/.test(birthdateStr)) {
            try {
                // Try MM/DD/YYYY first
                birthDate = parse(birthdateStr, 'MM/dd/yyyy', new Date());
            } catch (e) {
                try {
                    // Then try DD/MM/YYYY
                    birthDate = parse(birthdateStr, 'dd/MM/yyyy', new Date());
                } catch (e2) {
                    // Try with different separators
                    try {
                        birthDate = parse(birthdateStr, 'MM-dd-yyyy', new Date());
                    } catch (e3) {
                        try {
                            birthDate = parse(birthdateStr, 'dd-MM-yyyy', new Date());
                        } catch (e4) {
                            return null;
                        }
                    }
                }
            }
        }
        // 3. Try month name formats like "January 1, 1990"
        else if (/[a-zA-Z]+\s+\d{1,2},?\s+\d{4}/.test(birthdateStr)) {
            try {
                birthDate = parse(birthdateStr, 'MMMM d, yyyy', new Date());
            } catch (e) {
                try {
                    birthDate = parse(birthdateStr, 'MMM d, yyyy', new Date());
                } catch (e2) {
                    // Try without comma
                    try {
                        birthDate = parse(birthdateStr, 'MMMM d yyyy', new Date());
                    } catch (e3) {
                        try {
                            birthDate = parse(birthdateStr, 'MMM d yyyy', new Date());
                        } catch (e4) {
                            return null;
                        }
                    }
                }
            }
        }

        // Calculate age if we have a valid birthdate
        if (birthDate && birthDate instanceof Date && !isNaN(birthDate.getTime())) {
            // Manual age calculation instead of using differenceInYears
            const today = new Date();
            const birthYear = birthDate.getFullYear();
            const currentYear = today.getFullYear();
            let age = currentYear - birthYear;

            // Adjust age if birthday hasn't occurred yet this year
            const birthMonth = birthDate.getMonth();
            const currentMonth = today.getMonth();
            const birthDay = birthDate.getDate();
            const currentDay = today.getDate();

            if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
                age--;
            }

            console.log(`Calculated age for ${birthdateStr}: ${age} (Birth year: ${birthYear}, Current year: ${currentYear})`);
            return age;
        }
    } catch (error) {
        console.error('Error calculating age:', error);
    }

    return null;
}

async function main() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Define a schema that matches our CV schema
    const CVSchema = new mongoose.Schema({
        age: Number,
        birthdate: String,
        parsedData: mongoose.Schema.Types.Mixed
    }, { strict: false });

    // Create a model based on the existing collection
    const CV = mongoose.model('CV', CVSchema, 'cvs');

    try {
        console.log('Finding CVs with birthdate but no age...');
        const cvs = await CV.find({
            birthdate: { $exists: true, $ne: '', $ne: null },
            $or: [
                { age: { $exists: false } },
                { age: null }
            ]
        });

        console.log(`Found ${cvs.length} CVs with birthdate but no age`);

        let updatedCount = 0;

        for (const cv of cvs) {
            console.log(`Processing CV: ${cv._id} (${cv.filename || 'Unknown filename'})`);
            console.log(`  Birthdate: ${cv.birthdate}`);

            const age = calculateAgeFromBirthdate(cv.birthdate);

            if (age) {
                console.log(`  Calculated age: ${age}`);

                // Update CV with calculated age
                await CV.updateOne(
                    { _id: cv._id },
                    {
                        $set: {
                            age,
                            'parsedData.Age': age
                        }
                    }
                );

                updatedCount++;
                console.log(`  Updated age for CV ${cv._id}: ${age}`);
            } else {
                console.log(`  Could not calculate age from birthdate: ${cv.birthdate}`);
            }
        }

        console.log(`Updated age for ${updatedCount} out of ${cvs.length} CVs`);

        // Also update CVs with age value in parsedData but not in top-level field
        console.log('Finding CVs with age value in parsedData but not in top-level field...');
        const cvsWithParsedAge = await CV.find({
            'parsedData.Age': { $exists: true, $ne: null },
            $or: [
                { age: { $exists: false } },
                { age: null }
            ]
        });

        console.log(`Found ${cvsWithParsedAge.length} CVs with Age in parsedData but no age field`);

        let syncedCount = 0;

        for (const cv of cvsWithParsedAge) {
            const parsedAge = cv.parsedData?.Age;

            // Try to convert age to number if it's a string
            let numericAge = null;
            if (typeof parsedAge === 'string') {
                // Try to extract just the numeric part if it contains text
                const matches = parsedAge.match(/\d+/);
                if (matches && matches.length > 0) {
                    numericAge = parseInt(matches[0], 10);
                }
            } else if (typeof parsedAge === 'number') {
                numericAge = parsedAge;
            }

            if (numericAge && !isNaN(numericAge) && numericAge > 0 && numericAge < 100) {
                console.log(`  Syncing parsed age: ${numericAge}`);

                // Update CV with the age from parsedData
                await CV.updateOne(
                    { _id: cv._id },
                    { $set: { age: numericAge } }
                );

                syncedCount++;
                console.log(`  Synced age for CV ${cv._id}: ${numericAge}`);
            }
        }

        console.log(`Synced age for ${syncedCount} out of ${cvsWithParsedAge.length} CVs`);
        console.log(`Total updates: ${updatedCount + syncedCount}`);

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