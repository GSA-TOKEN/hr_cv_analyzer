import { connectDB } from './mongodb';
import { uploadFile, getFileFromGridFS, deleteFileFromGridFS, getFileMetadata } from './mongodb-storage';
import CV from '@/models/CV';

export interface ICV {
    id: string;
    filename: string;
    uploadDate: Date;
    analyzed: boolean;
    status?: 'pending' | 'processing' | 'completed' | 'error';
    error?: string;
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

class CVStore {
    private static instance: CVStore;
    private initialized: boolean = false;

    private constructor() { }

    public static getInstance(): CVStore {
        if (!CVStore.instance) {
            CVStore.instance = new CVStore();
        }
        return CVStore.instance;
    }

    private async ensureInitialized() {
        if (!this.initialized) {
            await connectDB();
            this.initialized = true;
        }
    }

    async getCVs(): Promise<ICV[]> {
        await this.ensureInitialized();
        console.log('Fetching CVs from MongoDB...');
        const cvs = await CV.find().sort({ uploadDate: -1 });
        console.log(`Found ${cvs.length} CVs in database`);
        return cvs.map(cv => ({
            id: cv._id.toString(),
            filename: cv.filename,
            uploadDate: cv.uploadDate,
            analyzed: cv.analyzed,
            fileId: cv.fileId,
            tags: cv.tags,
            age: cv.age,
            department: cv.department,
            email: cv.email,
            phone: cv.phone,
            birthdate: cv.birthdate,
            expectedSalary: cv.expectedSalary,
            originalTextFileId: cv.originalTextFileId,
            enhancedTextFileId: cv.enhancedTextFileId,
            parsedData: cv.parsedData,
            analysis: cv.analysis
        }));
    }

    async getCV(id: string): Promise<ICV | null> {
        await this.ensureInitialized();
        const cv = await CV.findById(id);
        if (!cv) return null;

        return {
            id: cv._id.toString(),
            filename: cv.filename,
            uploadDate: cv.uploadDate,
            analyzed: cv.analyzed,
            fileId: cv.fileId,
            tags: cv.tags,
            age: cv.age,
            department: cv.department,
            email: cv.email,
            phone: cv.phone,
            birthdate: cv.birthdate,
            expectedSalary: cv.expectedSalary,
            originalTextFileId: cv.originalTextFileId,
            enhancedTextFileId: cv.enhancedTextFileId,
            parsedData: cv.parsedData,
            analysis: cv.analysis
        };
    }

    async addCV(file: Buffer, filename: string, contentType: string, tags: string[] = []): Promise<ICV> {
        await this.ensureInitialized();

        try {
            // Upload file to GridFS
            const fileId = await uploadFile(file, filename, contentType);

            // Create CV document with the GridFS file ID
            const cv = new CV({
                filename,
                uploadDate: new Date(),
                analyzed: false,
                fileId: fileId, // This is the GridFS file ID
                tags: tags || []
            });

            // Save the CV document
            const savedCV = await cv.save();

            return {
                id: savedCV._id.toString(),
                filename: savedCV.filename,
                uploadDate: savedCV.uploadDate,
                analyzed: savedCV.analyzed,
                fileId: savedCV.fileId,
                tags: savedCV.tags
            };
        } catch (error) {
            console.error('Error adding CV:', error);
            throw error;
        }
    }

    async deleteCV(id: string): Promise<void> {
        await this.ensureInitialized();
        const cv = await CV.findById(id);
        if (!cv) throw new Error('CV not found');

        // Delete file from GridFS
        await deleteFileFromGridFS(cv.fileId);
        if (cv.originalTextFileId) {
            await deleteFileFromGridFS(cv.originalTextFileId);
        }
        if (cv.enhancedTextFileId) {
            await deleteFileFromGridFS(cv.enhancedTextFileId);
        }

        // Delete CV document
        await CV.findByIdAndDelete(id);
    }

    async getCVFile(id: string): Promise<Buffer> {
        await this.ensureInitialized();
        const cv = await CV.findById(id);
        if (!cv) throw new Error('CV not found');
        return getFileFromGridFS(cv.fileId);
    }

    async getCVText(id: string, type: 'original' | 'enhanced'): Promise<Buffer> {
        await this.ensureInitialized();
        const cv = await CV.findById(id);
        if (!cv) throw new Error('CV not found');

        const fileId = type === 'original' ? cv.originalTextFileId : cv.enhancedTextFileId;
        if (!fileId) throw new Error(`${type} text not found`);

        return getFileFromGridFS(fileId);
    }

    async updateCV(id: string, updates: Partial<ICV>): Promise<ICV> {
        await this.ensureInitialized();
        const cv = await CV.findByIdAndUpdate(id, updates, { new: true });
        if (!cv) throw new Error('CV not found');

        return {
            id: cv._id.toString(),
            filename: cv.filename,
            uploadDate: cv.uploadDate,
            analyzed: cv.analyzed,
            fileId: cv.fileId,
            tags: cv.tags,
            age: cv.age,
            department: cv.department,
            email: cv.email,
            phone: cv.phone,
            birthdate: cv.birthdate,
            expectedSalary: cv.expectedSalary,
            originalTextFileId: cv.originalTextFileId,
            enhancedTextFileId: cv.enhancedTextFileId,
            parsedData: cv.parsedData,
            analysis: cv.analysis
        };
    }

    async searchCVs(query: string): Promise<ICV[]> {
        await this.ensureInitialized();
        const cvs = await CV.find({
            $text: { $search: query }
        }).sort({ uploadDate: -1 });

        return cvs.map(cv => ({
            id: cv._id.toString(),
            filename: cv.filename,
            uploadDate: cv.uploadDate,
            analyzed: cv.analyzed,
            fileId: cv.fileId,
            tags: cv.tags,
            age: cv.age,
            department: cv.department,
            email: cv.email,
            phone: cv.phone,
            birthdate: cv.birthdate,
            expectedSalary: cv.expectedSalary,
            originalTextFileId: cv.originalTextFileId,
            enhancedTextFileId: cv.enhancedTextFileId,
            parsedData: cv.parsedData,
            analysis: cv.analysis
        }));
    }

    async getCVsByTags(tags: string[]): Promise<ICV[]> {
        await this.ensureInitialized();
        const cvs = await CV.find({
            tags: { $in: tags }
        }).sort({ uploadDate: -1 });

        return cvs.map(cv => ({
            id: cv._id.toString(),
            filename: cv.filename,
            uploadDate: cv.uploadDate,
            analyzed: cv.analyzed,
            fileId: cv.fileId,
            tags: cv.tags,
            age: cv.age,
            department: cv.department,
            email: cv.email,
            phone: cv.phone,
            birthdate: cv.birthdate,
            expectedSalary: cv.expectedSalary,
            originalTextFileId: cv.originalTextFileId,
            enhancedTextFileId: cv.enhancedTextFileId,
            parsedData: cv.parsedData,
            analysis: cv.analysis
        }));
    }

    async saveTextContent(text: string): Promise<string> {
        await this.ensureInitialized();

        // Create a buffer from the text content
        const buffer = Buffer.from(text, 'utf-8');

        // Generate a filename for the text content
        const filename = `text_${Date.now()}.txt`;

        // Upload the text file to GridFS
        const fileId = await uploadFile(buffer, filename, 'text/plain');

        return fileId;
    }

    async getTextContent(fileId: string): Promise<string> {
        await this.ensureInitialized();

        // Get the file buffer from GridFS
        const buffer = await getFileFromGridFS(fileId);

        // Convert buffer to string
        return buffer.toString('utf-8');
    }
}

export const cvStore = CVStore.getInstance(); 