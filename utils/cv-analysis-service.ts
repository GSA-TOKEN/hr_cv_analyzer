import { cvStore } from '@/lib/cv-store';
import { extractTextFromBuffer, getTesseractWorker } from './ocr';
import { fixCV } from './openai-cv-fixer';
import { parseCV, convertParsedCVToTags } from './openai-cv-parser';

/**
 * Service to handle the full CV analysis pipeline
 * - Extract text from CV file using OCR
 * - Enhance the text with OpenAI
 * - Parse the CV for structured data
 * - Generate tags from the parsed data
 * - Store all results in MongoDB
 */
export class CVAnalysisService {
    private static instance: CVAnalysisService;

    private constructor() { }

    /**
     * Get singleton instance of CVAnalysisService
     */
    public static getInstance(): CVAnalysisService {
        if (!CVAnalysisService.instance) {
            CVAnalysisService.instance = new CVAnalysisService();
        }
        return CVAnalysisService.instance;
    }

    /**
     * Process a single CV through the full analysis pipeline
     * @param cvId The MongoDB ID of the CV to analyze
     * @returns Result of the analysis
     */
    public async analyzeCV(cvId: string): Promise<{ success: boolean; message: string; error?: string }> {
        console.log(`Starting analysis pipeline for CV: ${cvId}`);

        try {
            // 1. Get the CV document from MongoDB
            const cv = await cvStore.getCV(cvId);
            if (!cv || !cv.fileId) {
                throw new Error('CV not found or no file attached');
            }
            console.log(`Processing CV: ${cv.filename}`);

            // 2. Update status to processing
            await cvStore.updateCV(cvId, { status: 'processing' });

            // 3. Get the file buffer from GridFS
            let fileBuffer;
            try {
                fileBuffer = await cvStore.getCVFile(cvId);
                if (!fileBuffer || fileBuffer.length === 0) {
                    throw new Error('Empty file buffer received');
                }
                console.log(`Retrieved file buffer, size: ${fileBuffer.length} bytes`);
            } catch (bufferError: any) {
                console.error('Error retrieving file buffer:', bufferError);
                throw new Error(`Could not retrieve CV file: ${bufferError.message}`);
            }

            // 4. Extract text using OCR with multiple fallbacks
            let extractedText = '';
            let extractionMethod = 'unknown';

            try {
                console.log(`Extracting text from CV ${cv.filename}...`);
                // Try the main extraction method first
                extractedText = await extractTextFromBuffer(fileBuffer);
                extractionMethod = 'auto';

                // If extraction is empty, try alternative methods
                if (!extractedText || extractedText.trim().length < 50) {
                    console.log('Initial text extraction returned insufficient text, trying fallbacks...');

                    // Try pdf-parse directly if available
                    try {
                        const pdfParse = require('pdf-parse');
                        const pdfData = await pdfParse(fileBuffer);
                        if (pdfData.text && pdfData.text.length > 100) {
                            console.log('Successful extraction using pdf-parse fallback');
                            extractedText = pdfData.text;
                            extractionMethod = 'pdf-parse';
                        }
                    } catch (pdfParseError) {
                        console.log('pdf-parse fallback failed:', pdfParseError);
                    }

                    // If still empty, try OCR focused approach
                    if (!extractedText || extractedText.trim().length < 50) {
                        console.log('Attempting OCR-only approach...');
                        const worker = await getTesseractWorker();
                        const ocrResult = await worker.recognize(fileBuffer);
                        if (ocrResult.data.text && ocrResult.data.text.length > 50) {
                            extractedText = ocrResult.data.text;
                            extractionMethod = 'ocr-only';
                            console.log('Successful extraction using OCR-only fallback');
                        }
                    }
                }

                // If still no text, fail gracefully
                if (!extractedText || extractedText.trim().length < 50) {
                    throw new Error('All extraction methods failed to get meaningful text from this document');
                }

                console.log(`Successfully extracted ${extractedText.length} characters using ${extractionMethod}`);
            } catch (extractionError: any) {
                console.error('Text extraction failed:', extractionError);
                throw new Error(`Failed to extract text from CV: ${extractionError.message}`);
            }

            // 5. Save original text
            console.log(`Saving original text...`);
            const originalTextFileId = await cvStore.saveTextContent(extractedText);

            // 6. Enhance the CV text using OpenAI
            console.log(`Enhancing CV text with OpenAI...`);
            let enhancedText;
            try {
                enhancedText = await fixCV(extractedText);
                if (!enhancedText) {
                    console.warn('OpenAI enhancement returned empty text, using original text');
                    enhancedText = extractedText;
                }
            } catch (enhanceError: any) {
                console.error('Error enhancing text with OpenAI:', enhanceError);
                console.warn('Using original text due to enhancement failure');
                enhancedText = extractedText;
            }
            const enhancedTextFileId = await cvStore.saveTextContent(enhancedText);

            // 7. Parse the enhanced CV text and get structured data
            console.log(`Parsing CV with OpenAI...`);
            let parsedCV;
            try {
                parsedCV = await parseCV(enhancedText);
                if (!parsedCV) {
                    throw new Error('Parsing returned null or undefined result');
                }
            } catch (parseError: any) {
                console.error('Error parsing CV:', parseError);
                throw new Error(`Failed to parse CV data: ${parseError.message}`);
            }

            // 8. Convert parsed data to tags
            console.log(`Generating tags from parsed data...`);
            let tags: string[] = [];
            try {
                tags = convertParsedCVToTags(parsedCV);
                console.log(`Generated ${tags.length} tags: ${tags.join(', ')}`);
            } catch (tagError: any) {
                console.error('Error generating tags:', tagError);
                console.warn('Continuing with empty tags array');
                tags = [];
            }

            // Extract age as numeric value if possible, otherwise store as string in parsedData
            let ageValue = undefined;
            if (parsedCV.Age) {
                // Try to parse it as a number
                const numericAge = Number(parsedCV.Age);
                if (!isNaN(numericAge)) {
                    ageValue = numericAge;
                }
                // If it's a range or non-numeric format, we'll keep it in parsedData but not set the age field
            }

            // Extract demographic information
            let firstName = '', lastName = '', email = '', phone = '', birthdate = '';

            // Attempt to extract first and last name from candidateName in parsedCV
            if (parsedCV.candidateName || parsedCV.name) {
                const fullName = (parsedCV.candidateName || parsedCV.name).trim();
                const nameParts = fullName.split(/\s+/);
                if (nameParts.length >= 2) {
                    firstName = nameParts[0];
                    lastName = nameParts[nameParts.length - 1];
                } else if (nameParts.length === 1) {
                    firstName = nameParts[0];
                }
            }

            // Extract email
            if (typeof parsedCV.email === 'string' && parsedCV.email.includes('@')) {
                email = parsedCV.email;
            }
            // Alternative: look for email in the parsedCV object
            else if (!email) {
                for (const key in parsedCV) {
                    const value = parsedCV[key];
                    if (typeof value === 'string' && value.includes('@') && value.includes('.')) {
                        email = value;
                        break;
                    }
                }
            }

            // Extract phone
            if (typeof parsedCV.phone === 'string' && parsedCV.phone.match(/\d/)) {
                phone = parsedCV.phone;
            }
            // Alternative: Look for common phone formats in parsedCV
            else if (!phone) {
                for (const key in parsedCV) {
                    const value = parsedCV[key];
                    if (typeof value === 'string' &&
                        (value.match(/\(\d{3}\)\s*\d{3}-\d{4}/) ||
                            value.match(/\d{3}[-.\s]\d{3}[-.\s]\d{4}/))) {
                        phone = value;
                        break;
                    }
                }
            }

            // Extract birthdate
            if (typeof parsedCV.birthdate === 'string' || typeof parsedCV.dob === 'string') {
                birthdate = parsedCV.birthdate || parsedCV.dob;
            }
            // Look for date of birth in the parsedCV
            else if (!birthdate) {
                for (const key in parsedCV) {
                    const keyLower = key.toLowerCase();
                    if (keyLower.includes('birth') || keyLower === 'dob') {
                        const value = parsedCV[key];
                        if (typeof value === 'string') {
                            birthdate = value;
                            break;
                        }
                    }
                }
            }

            // 9. Update the CV document with analysis results
            await cvStore.updateCV(cvId, {
                analyzed: true,
                status: 'completed',
                tags,
                originalTextFileId,
                enhancedTextFileId,
                // Include original parsedCV data and add demographic information
                parsedData: {
                    ...parsedCV,
                    demographics: {
                        firstName,
                        lastName,
                        email: email || parsedCV.email,
                        phone: phone || parsedCV.phone,
                        birthdate
                    }
                },
                analysis: {
                    languages: parsedCV.Languages ? Object.entries(parsedCV.Languages).map(([name, level]) => ({ name, level })) : [],
                    education: parsedCV.Education ? {
                        level: parsedCV.Education["Education Level"] || "",
                        fields: Array.isArray(parsedCV.Education["Field Relevance"])
                            ? parsedCV.Education["Field Relevance"]
                            : (parsedCV.Education["Field Relevance"] ? [parsedCV.Education["Field Relevance"]] : [])
                    } : {},
                    experience: parsedCV.Experience ? {
                        duration: parsedCV.Experience.Duration || "",
                        establishments: Array.isArray(parsedCV.Experience["Establishment Type"])
                            ? parsedCV.Experience["Establishment Type"]
                            : (parsedCV.Experience["Establishment Type"] ? [parsedCV.Experience["Establishment Type"]] : []),
                        position: Array.isArray(parsedCV.Experience["Position Level"])
                            ? parsedCV.Experience["Position Level"][0] || "" // Take first position if it's an array
                            : (parsedCV.Experience["Position Level"] || "")
                    } : {},
                    technicalSkills: parsedCV["Technical Skills"] ?
                        Object.entries(parsedCV["Technical Skills"]).flatMap(([category, skills]) => {
                            const skillArray = Array.isArray(skills) ? skills : [skills];
                            return skillArray.filter(s => s && typeof s === 'string');
                        }) : [],
                    softSkills: Array.isArray(parsedCV["Soft Skills"])
                        ? parsedCV["Soft Skills"].filter((skill: any) => skill && typeof skill === 'string')
                        : (parsedCV["Soft Skills"] && typeof parsedCV["Soft Skills"] === 'string' ? [parsedCV["Soft Skills"]] : []),
                    certifications: Array.isArray(parsedCV.Certifications)
                        ? parsedCV.Certifications.filter((cert: any) => cert && typeof cert === 'string')
                        : (parsedCV.Certifications && typeof parsedCV.Certifications === 'string' ? [parsedCV.Certifications] : [])
                },
                // Save extracted demographic information
                email: email || parsedCV.email,
                phone: phone || parsedCV.phone,
                ...(ageValue !== undefined && { age: ageValue }), // Only set age if we have a numeric value
                ...(parsedCV.department && { department: parsedCV.department }),
                ...(parsedCV.expectedSalary && { expectedSalary: parsedCV.expectedSalary }),
                // Add birthdate if available
                ...(birthdate && { birthdate })
            });

            console.log(`Successfully completed analysis for CV ${cvId}`);
            return {
                success: true,
                message: 'CV analysis completed successfully'
            };
        } catch (error: any) {
            console.error(`Error analyzing CV ${cvId}:`, error);

            // Update CV status to error
            try {
                await cvStore.updateCV(cvId, {
                    status: 'error',
                    error: error.message || 'Unknown error occurred'
                });
            } catch (updateError) {
                console.error(`Failed to update error status for CV ${cvId}:`, updateError);
            }

            return {
                success: false,
                message: 'Failed to analyze CV',
                error: error.message || 'Unknown error occurred'
            };
        }
    }

    /**
     * Process multiple CVs through the analysis pipeline
     * @param cvIds Array of MongoDB IDs for CVs to analyze
     * @returns Results of the analysis for each CV
     */
    public async analyzeCVs(cvIds: string[]): Promise<Array<{
        id: string;
        success: boolean;
        message?: string;
        error?: string;
    }>> {
        console.log(`Starting batch analysis for ${cvIds.length} CVs`);

        const results = [];

        for (const cvId of cvIds) {
            try {
                const result = await this.analyzeCV(cvId);
                results.push({
                    id: cvId,
                    success: result.success,
                    message: result.success ? 'CV analyzed successfully' : 'Failed to analyze CV',
                    error: result.error
                });
            } catch (error: any) {
                console.error(`Error in batch processing CV ${cvId}:`, error);
                results.push({
                    id: cvId,
                    success: false,
                    message: 'Failed to analyze CV',
                    error: error.message || 'Unknown error occurred'
                });
            }
        }

        console.log(`Completed batch analysis for ${cvIds.length} CVs`);
        return results;
    }
}

export const cvAnalysisService = CVAnalysisService.getInstance(); 