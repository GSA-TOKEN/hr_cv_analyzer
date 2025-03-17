import { NextRequest, NextResponse } from 'next/server';
import { cvStore } from '@/lib/cv-store';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files');

        if (files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            );
        }

        const results = await Promise.all(
            files.map(async (file: FormDataEntryValue) => {
                try {
                    if (!(file instanceof File)) {
                        return {
                            filename: 'unknown',
                            success: false,
                            error: 'Invalid file format'
                        };
                    }

                    const cv = await cvStore.addCV(file);

                    return {
                        filename: file.name,
                        success: true,
                        id: cv.id
                    };
                } catch (error) {
                    console.error(`Error uploading file ${file instanceof File ? file.name : 'unknown'}:`, error);
                    return {
                        filename: file instanceof File ? file.name : 'unknown',
                        success: false,
                        error: 'Failed to upload file'
                    };
                }
            })
        );

        return NextResponse.json(
            { files: results },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in CV upload API:', error);
        return NextResponse.json(
            { error: 'Failed to process file upload' },
            { status: 500 }
        );
    }
}

// For file size validation in the API route config
export const config = {
    api: {
        bodyParser: false, // Disable the default body parser to handle file uploads
        responseLimit: '10mb',
    },
}; 