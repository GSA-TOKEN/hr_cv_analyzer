import mongoose, { Document, Schema } from 'mongoose';

export interface ICV extends Document {
    filename: string;
    uploadDate: Date;
    analyzed: boolean;
    fileId: string;
    tags: string[];
    age?: number;
    department?: string;
    email?: string;
    phone?: string;
    birthdate?: string;
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
    fileId: { type: String, required: true, unique: true },
    tags: [{ type: String, index: true }],
    age: { type: Number },
    department: { type: String, index: true },
    email: { type: String },
    phone: { type: String },
    birthdate: { type: String },
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
CVSchema.index({ filename: 'text', tags: 'text', department: 'text', email: 'text' });

// Ensure model is not recompiled
const CV = mongoose.models.CV || mongoose.model<ICV>('CV', CVSchema);

export default CV; 