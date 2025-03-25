import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { extractTextFromFile } from '@/utils/ocr';
import { fixCV } from '@/utils/openai-cv-fixer';
import { parseCV, convertParsedCVToTags } from '@/utils/openai-cv-parser';

export interface CV {
    id: string;
    filename: string;
    uploadDate: string;
    analyzed: boolean;
    path: string;
    tags?: string[];
    age?: number;
    // Additional fields for the API integration
    department?: string;
    email?: string;
    phone?: string;
    birthdate?: string;
    expectedSalary?: string;
    cv?: string; // Path to the fixed CV text file
    originalCvPath?: string; // Path to the original extracted CV text
    parsedData?: any; // Structured data from OpenAI parsing
}

class CVStore {
    private cvs: Map<string, CV> = new Map();
    private cvFolder: string = path.join(process.cwd(), 'cv_store');

    constructor() {
        this.loadExistingCVs();
    }

    private loadExistingCVs() {
        if (!fs.existsSync(this.cvFolder)) {
            fs.mkdirSync(this.cvFolder, { recursive: true });
            return;
        }

        const files = fs.readdirSync(this.cvFolder);

        files.forEach(filename => {
            // Only process main CV files (not the _original.txt and _fixed.txt files)
            if (filename.endsWith('.pdf') ||
                filename.endsWith('.jpg') ||
                filename.endsWith('.jpeg') ||
                filename.endsWith('.png') ||
                filename.endsWith('.tiff') ||
                filename.endsWith('.docx')) {

                const stats = fs.statSync(path.join(this.cvFolder, filename));
                const cv: CV = {
                    id: filename,
                    filename,
                    uploadDate: stats.mtime.toISOString(),
                    analyzed: false,
                    path: `/api/cv-store/${encodeURIComponent(filename)}`, // URL encode the filename
                    tags: []
                };
                this.cvs.set(cv.id, cv);
            }
        });
    }

    getCVs(): CV[] {
        return Array.from(this.cvs.values());
    }

    getCV(id: string): CV | undefined {
        return this.cvs.get(id);
    }

    addCV(file: File): Promise<CV> {
        return new Promise((resolve, reject) => {
            // Sanitize the filename to handle special characters
            const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const id = filename; // Use sanitized filename as ID

            // Create destination path
            const filePath = path.join(this.cvFolder, filename);

            // Create Buffer from file
            file.arrayBuffer()
                .then(buffer => {
                    // Write file to disk
                    fs.writeFile(filePath, Buffer.from(buffer), (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        const cv: CV = {
                            id,
                            filename,
                            uploadDate: new Date().toISOString(),
                            analyzed: false,
                            path: `/api/cv-store/${encodeURIComponent(filename)}`, // URL encode the filename
                            tags: []
                        };

                        this.cvs.set(id, cv);
                        resolve(cv);
                    });
                })
                .catch(err => reject(err));
        });
    }

    deleteCV(id: string): boolean {
        const cv = this.cvs.get(id);
        if (!cv) return false;

        try {
            // Get the actual file path from the cv_store folder
            const filePath = path.join(this.cvFolder, cv.filename);

            // Delete the main CV file
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            // Delete original extracted text file if exists
            const originalTextPath = path.join(this.cvFolder, `${id}_original.txt`);
            if (fs.existsSync(originalTextPath)) {
                fs.unlinkSync(originalTextPath);
            }

            // Delete fixed CV text file if exists
            const fixedTextPath = path.join(this.cvFolder, `${id}_fixed.txt`);
            if (fs.existsSync(fixedTextPath)) {
                fs.unlinkSync(fixedTextPath);
            }

            this.cvs.delete(id);
            return true;
        } catch (error) {
            console.error('Error deleting CV:', error);
            return false;
        }
    }

    async analyzeCV(id: string): Promise<CV> {
        const cv = this.cvs.get(id);
        if (!cv) {
            throw new Error('CV not found');
        }

        try {
            // Extract text using OCR
            const extractedText = await extractTextFromFile(cv.path);

            // Save the original text to a text file
            const originalTextPath = path.join(this.cvFolder, `${id}_original.txt`);
            fs.writeFileSync(originalTextPath, extractedText);

            // Fix CV with OpenAI
            const fixedCVText = await fixCV(extractedText);

            // Save the fixed text to a text file
            const fixedTextPath = path.join(this.cvFolder, `${id}_fixed.txt`);
            fs.writeFileSync(fixedTextPath, fixedCVText);

            // Parse the CV using OpenAI
            const parsedCV = await parseCV(fixedCVText);

            // Convert parsed CV to tags
            const tags = convertParsedCVToTags(parsedCV);

            // Update CV
            const updatedCV: CV = {
                ...cv,
                analyzed: true,
                originalCvPath: originalTextPath,
                cv: fixedTextPath,
                tags: [...(cv.tags || []), ...tags],
                parsedData: parsedCV
            };

            // If age is present in parsedCV, update it
            if (parsedCV.Age) {
                const ageMatch = parsedCV.Age.match(/(\d+)[-+]/);
                if (ageMatch) {
                    const age = parseInt(ageMatch[1]);
                    if (!isNaN(age)) {
                        updatedCV.age = age;
                    }
                }
            }

            this.cvs.set(id, updatedCV);
            return updatedCV;
        } catch (error) {
            console.error('Error analyzing CV:', error);
            throw error;
        }
    }

    updateCVTags(id: string, tags: string[]): CV | undefined {
        const cv = this.cvs.get(id);
        if (!cv) return undefined;

        const updatedCV = {
            ...cv,
            tags: [...(cv.tags || []), ...tags]
        };

        this.cvs.set(id, updatedCV);
        return updatedCV;
    }

    updateCVAge(id: string, age: number): CV | undefined {
        const cv = this.cvs.get(id);
        if (!cv) return undefined;

        // Determine age range tag
        let ageRangeTag = '';
        if (age < 18) {
            ageRangeTag = '18-under';
        } else if (age <= 22) {
            ageRangeTag = '18-22';
        } else if (age <= 28) {
            ageRangeTag = '23-28';
        } else if (age <= 35) {
            ageRangeTag = '28-35';
        } else if (age <= 45) {
            ageRangeTag = '36-45';
        } else {
            ageRangeTag = '46+';
        }

        const formattedAgeRangeTag = `age:${ageRangeTag.toLowerCase()}`;

        const updatedCV = {
            ...cv,
            age,
            tags: [...(cv.tags || []), `age:${age}`, formattedAgeRangeTag]
        };

        this.cvs.set(id, updatedCV);
        return updatedCV;
    }
}

// Singleton instance
export const cvStore = new CVStore(); 