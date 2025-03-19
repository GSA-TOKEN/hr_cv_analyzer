import { NextRequest, NextResponse } from 'next/server';
import { cvStore } from '@/lib/cv-store';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

// Helper function to validate file type
function isValidFileType(fileName: string) {
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff'];
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
                        error: 'Invalid file type. Only PDF, JPG, JPEG, PNG, and TIFF files are allowed.',
                    };
                }

                try {
                    const bytes = await file.arrayBuffer();
                    const buffer = Buffer.from(bytes);

                    // Save file to disk
                    const filePath = join(cvDir, fileName);
                    await writeFile(filePath, buffer);

                    // Add to CV store
                    const cv = {
                        id: Date.now().toString(),
                        filename: fileName,
                        uploadDate: new Date().toISOString(),
                        analyzed: false,
                        path: filePath,
                        tags: []
                    };

                    // Register the CV in the store
                    const addedCV = await cvStore.addCV(new File([buffer], fileName));

                    return {
                        name: fileName,
                        success: true,
                        cv: addedCV
                    };
                } catch (error) {
                    console.error(`Error processing file ${fileName}:`, error);
                    return {
                        name: fileName,
                        success: false,
                        error: 'Failed to process file'
                    };
                }
            })
        );

        return NextResponse.json({
            files: results
        });
    } catch (error) {
        console.error('Error in CV upload:', error);
        return NextResponse.json(
            { error: 'Internal server error during upload' },
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