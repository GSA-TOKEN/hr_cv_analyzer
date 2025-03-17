import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface CV {
    id: string;
    filename: string;
    uploadDate: string;
    analyzed: boolean;
    path: string;
    tags?: string[];
}

class CVStore {
    private cvs: Map<string, CV> = new Map();
    private cvFolder: string = path.join(process.cwd(), 'cv');

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
            if (filename.endsWith('.pdf')) {
                const stats = fs.statSync(path.join(this.cvFolder, filename));
                const cv: CV = {
                    id: uuidv4(),
                    filename,
                    uploadDate: stats.mtime.toISOString(),
                    analyzed: false,
                    path: path.join(this.cvFolder, filename),
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
            const id = uuidv4();
            const filename = file.name;

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
                            path: filePath,
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
            fs.unlinkSync(cv.path);
            this.cvs.delete(id);
            return true;
        } catch (error) {
            console.error('Error deleting CV:', error);
            return false;
        }
    }

    analyzeCV(id: string): Promise<CV> {
        return new Promise((resolve, reject) => {
            const cv = this.cvs.get(id);
            if (!cv) {
                reject(new Error('CV not found'));
                return;
            }

            // In a real implementation, this would send the CV to an AI service for analysis
            // For now, we'll just mark it as analyzed with some example tags
            setTimeout(() => {
                const updatedCV = {
                    ...cv,
                    analyzed: true,
                    tags: ['JavaScript', 'React', 'Frontend', 'Experience: 3-5 years']
                };

                this.cvs.set(id, updatedCV);
                resolve(updatedCV);
            }, 1000); // Simulate analysis taking 1 second
        });
    }

    updateCVTags(id: string, tags: string[]): CV | undefined {
        const cv = this.cvs.get(id);
        if (!cv) return undefined;

        const updatedCV = {
            ...cv,
            tags
        };

        this.cvs.set(id, updatedCV);
        return updatedCV;
    }
}

// Singleton instance
export const cvStore = new CVStore(); 