import { NextRequest, NextResponse } from 'next/server';
import { cvStore } from '@/lib/cv-store';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { extractTextFromFile } from '@/utils/ocr';
import { fixCV } from '@/utils/openai-cv-fixer';
import { parseCV, convertParsedCVToTags } from '@/utils/openai-cv-parser';

// Helper function to validate file type
function isValidFileType(fileName: string) {
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.docx', '.doc', '.txt'];
    const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
    return allowedExtensions.includes(ext);
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files');

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files were uploaded' },
                { status: 400 }
            );
        }

        // Ensure CV directory exists
        const cvDir = join(process.cwd(), 'cv');
        if (!existsSync(cvDir)) {
            await mkdir(cvDir, { recursive: true });
        }

        // Process each file
        const results = await Promise.all(
            Array.from(files).map(async (file: any) => {
                const fileName = file.name;

                // Validate file type
                if (!isValidFileType(fileName)) {
                    return {
                        name: fileName,
                        success: false,
                        error: 'Invalid file type. Only PDF, image, Word documents and text files are allowed.',
                    };
                }

                try {
                    const bytes = await file.arrayBuffer();
                    const buffer = Buffer.from(bytes);

                    // Save file to disk
                    const filePath = join(cvDir, fileName);
                    await writeFile(filePath, buffer);

                    // Add to CV store
                    const addedCV = await cvStore.addCV(new File([buffer], fileName));

                    // Extract text using OCR
                    const extractedText = await extractTextFromFile(filePath);

                    // Save the original text to a text file
                    const originalTextPath = join(cvDir, `${addedCV.id}_original.txt`);
                    await writeFile(originalTextPath, extractedText);

                    // Fix CV with OpenAI
                    const fixedCVText = await fixCV(extractedText);

                    // Save the fixed text to a text file
                    const fixedTextPath = join(cvDir, `${addedCV.id}_fixed.txt`);
                    await writeFile(fixedTextPath, fixedCVText);

                    // Parse the CV using OpenAI
                    const parsedCV = await parseCV(fixedCVText);

                    // Convert parsed CV to tags
                    const tags = convertParsedCVToTags(parsedCV);

                    // Update CV with tags
                    const updatedCV = cvStore.updateCVTags(addedCV.id, tags);

                    // Update CV with additional data
                    if (updatedCV) {
                        updatedCV.analyzed = true;
                        updatedCV.originalCvPath = originalTextPath;
                        updatedCV.cv = fixedTextPath;
                    }

                    return {
                        name: fileName,
                        success: true,
                        cv: updatedCV || addedCV,
                        tags
                    };
                } catch (error: any) {
                    console.error(`Error processing file ${fileName}:`, error);
                    return {
                        name: fileName,
                        success: false,
                        error: 'Failed to process file: ' + error.message
                    };
                }
            })
        );

        return NextResponse.json({
            files: results
        });
    } catch (error: any) {
        console.error('Error in CV upload:', error);
        return NextResponse.json(
            { error: 'Internal server error during upload: ' + error.message },
            { status: 500 }
        );
    }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
            'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
        },
    });
}

// For file size validation in the API route config
export const config = {
    api: {
        bodyParser: false, // Disable the default body parser to handle file uploads
        responseLimit: '10mb',
    },
}; 