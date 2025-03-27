import mongoose, { Document, Schema } from 'mongoose';

export interface ICV extends Document {
    filename: string;
    uploadDate: Date;
    analyzed: boolean;
    status: 'pending' | 'processing' | 'completed' | 'error';
    error?: string;
    fileId: string;
    tags: string[];

    // Demographic information
    firstName?: string;
    lastName?: string;
    age?: number;
    department?: string;
    email?: string;
    phone?: string;
    birthdate?: string;
    gender?: string;
    expectedSalary?: number;

    originalTextFileId?: string;
    enhancedTextFileId?: string;
    parsedData?: any;
    analysis?: {
        languages: Array<{ name: string; level: string }>;
        education: Array<{ school: string; degree: string; year: number }>;
        experience: Array<{ company: string; position: string; duration: string }>;
        technicalSkills: string[];
        softSkills: string[];
        certifications: string[];
    };
}

const CVSchema = new Schema<ICV>({
    filename: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    analyzed: { type: Boolean, default: false, index: true },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'error'],
        default: 'pending'
    },
    error: { type: String },
    fileId: { type: String, required: true, unique: true },
    tags: [{ type: String, index: true }],

    // Demographic information
    firstName: { type: String },
    lastName: { type: String },
    age: { type: Number },
    department: { type: String },
    email: { type: String, index: true },
    phone: { type: String },
    birthdate: { type: String },
    gender: { type: String },
    expectedSalary: { type: Number },

    originalTextFileId: { type: String },
    enhancedTextFileId: { type: String },
    parsedData: { type: Schema.Types.Mixed },
    analysis: {
        languages: [{
            name: String,
            level: String
        }],
        education: [{
            school: String,
            degree: String,
            year: Number
        }],
        experience: [{
            company: String,
            position: String,
            duration: String
        }],
        technicalSkills: [String],
        softSkills: [String],
        certifications: [String]
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Create text indexes for search
CVSchema.index({
    filename: 'text',
    firstName: 'text',
    lastName: 'text',
    'analysis.technicalSkills': 'text',
    'analysis.softSkills': 'text',
    'analysis.languages.name': 'text',
    'analysis.education.school': 'text',
    'analysis.education.degree': 'text',
    'analysis.experience.company': 'text',
    'analysis.experience.position': 'text',
    'tags': 'text',
    department: 'text',
    email: 'text'
}, {
    weights: {
        firstName: 10,
        lastName: 10,
        filename: 8,
        'tags': 7,
        'analysis.technicalSkills': 6,
        'analysis.softSkills': 5,
        'analysis.experience.position': 5,
        department: 5,
        'analysis.education.degree': 4,
        'analysis.languages.name': 3,
        email: 3
    },
    name: 'cv_search_index'
});

// Add indexes for demographic fields
CVSchema.index({ age: 1 });
CVSchema.index({ department: 1 });
CVSchema.index({ expectedSalary: 1 });
CVSchema.index({ firstName: 1 });
CVSchema.index({ lastName: 1 });

// Ensure model is not recompiled
const CV = mongoose.models.CV || mongoose.model<ICV>('CV', CVSchema);

export default CV; 