// Migration script to update gender field for existing CVs
import mongoose from 'mongoose';
import CV from '../models/CV.js';
import fs from 'fs';
import path from 'path';
import { connectDB } from '../lib/mongodb.js';
import { getFileFromGridFS } from '../lib/mongodb-storage.js';

// Extract gender information from text content
function extractGenderInfo(text) {
    const textLower = text.toLowerCase();

    // Initialize default value
    let gender = '';

    // Try to extract gender information
    const genderKeywords = ['gender:', 'gender', 'sex:', 'sex'];
    const genderRegex = /\b(male|female|other|non-binary|prefer not to say)\b/i;

    // First check if there's a gender keyword with a gender value nearby
    for (const keyword of genderKeywords) {
        if (textLower.includes(keyword)) {
            // Find the index of the keyword
            const keywordIndex = textLower.indexOf(keyword);
            // Check the text around the keyword for a gender indication
            const textAroundKeyword = text.substring(keywordIndex, keywordIndex + 30);
            const genderMatches = textAroundKeyword.match(genderRegex);
            if (genderMatches && genderMatches.length > 0) {
                gender = genderMatches[0].charAt(0).toUpperCase() + genderMatches[0].slice(1).toLowerCase();
                break;
            }
        }
    }

    // If we still don't have gender and there's a 'Mr.' or 'Ms.' or similar in the first few lines, use that
    if (!gender) {
        const topPortion = text.substring(0, Math.min(300, text.length));
        if (/\bMr\.?\b/i.test(topPortion)) {
            gender = 'Male';
        } else if (/\b(Ms\.?|Mrs\.?|Miss)\b/i.test(topPortion)) {
            gender = 'Female';
        }
    }

    return gender;
}

// Main migration function
async function migrateGenderField() {
    console.log('Starting gender field migration...');

    try {
        // Connect to the database
        await connectDB();

        // Get all CVs without gender field
        const cvs = await CV.find({
            $or: [
                { gender: { $exists: false } },
                { gender: null },
                { gender: '' }
            ]
        });

        console.log(`Found ${cvs.length} CVs without gender information`);

        // Process each CV
        let updatedCount = 0;

        for (const cv of cvs) {
            try {
                console.log(`Processing CV: ${cv._id} (${cv.filename})`);

                // Try to get gender from parsedData first (if it exists)
                let gender = '';

                if (cv.parsedData && cv.parsedData.demographics && cv.parsedData.demographics.gender) {
                    gender = cv.parsedData.demographics.gender;
                    console.log(`Found gender in parsedData: ${gender}`);
                }

                // If not found in parsedData, try to extract from original text
                if (!gender && cv.originalTextFileId) {
                    try {
                        const textBuffer = await getFileFromGridFS(cv.originalTextFileId);
                        const text = textBuffer.toString('utf-8');
                        gender = extractGenderInfo(text);
                        console.log(`Extracted gender from text: ${gender || 'Not found'}`);
                    } catch (textError) {
                        console.error(`Error getting text content: ${textError.message}`);
                    }
                }

                // Update the CV with gender information if found
                if (gender) {
                    await CV.findByIdAndUpdate(cv._id, {
                        gender,
                        'parsedData.demographics.gender': gender
                    });
                    updatedCount++;
                    console.log(`Updated gender for CV ${cv._id}: ${gender}`);
                } else {
                    console.log(`Could not determine gender for CV ${cv._id}`);
                }
            } catch (cvError) {
                console.error(`Error processing CV ${cv._id}: ${cvError.message}`);
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} out of ${cvs.length} CVs.`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        // Close the database connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the migration
migrateGenderField()
    .then(() => console.log('Gender migration script completed'))
    .catch(err => console.error('Error in gender migration script:', err)); 