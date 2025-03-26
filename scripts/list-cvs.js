import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        return { db: mongoose.connection.db };
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

// Define CV schema
const CVSchema = new mongoose.Schema({
    filename: String,
    uploadDate: Date,
    analyzed: Boolean,
    status: String,
    fileId: String,
    tags: [String],
    firstName: String,
    lastName: String,
    age: Number,
    department: String,
    email: String,
    phone: String,
    birthdate: String,
    expectedSalary: Number,
    analysis: mongoose.Schema.Types.Mixed
});

// Main function
async function listCVs() {
    try {
        await connectDB();

        // Create model
        const CV = mongoose.models.CV || mongoose.model('CV', CVSchema);

        // Find all CVs
        const cvs = await CV.find().sort({ uploadDate: -1 }).limit(10);

        console.log(`Found ${cvs.length} CVs in the database:\n`);

        // Display CV information
        cvs.forEach((cv, index) => {
            console.log(`CV #${index + 1}: ${cv.filename}`);
            console.log(`Name: ${cv.firstName || ''} ${cv.lastName || ''}`);
            console.log(`Email: ${cv.email || 'N/A'}`);
            console.log(`Department: ${cv.department || 'N/A'}`);
            console.log(`Age: ${cv.age || 'N/A'}`);
            console.log(`Tags: ${cv.tags ? cv.tags.join(', ') : 'No tags'}`);
            console.log(`Analyzed: ${cv.analyzed ? 'Yes' : 'No'}`);

            if (cv.analyzed && cv.analysis) {
                console.log('Analysis:');

                if (cv.analysis.languages && cv.analysis.languages.length > 0) {
                    console.log('  Languages:', cv.analysis.languages.map(l => `${l.name} (${l.level})`).join(', '));
                }

                if (cv.analysis.technicalSkills && cv.analysis.technicalSkills.length > 0) {
                    console.log('  Technical Skills:', cv.analysis.technicalSkills.join(', '));
                }

                if (cv.analysis.softSkills && cv.analysis.softSkills.length > 0) {
                    console.log('  Soft Skills:', cv.analysis.softSkills.join(', '));
                }
            }

            console.log('-'.repeat(80));
        });

        // Close connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the function
listCVs(); 