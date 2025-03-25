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

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            );
        }

        const results = await Promise.all(
            files.map(async (file) => {
                try {
                    const cv = await cvStore.addCV(file);
                    return {
                        filename: file.name,
                        success: true,
                        id: cv.id
                    };
                } catch (error) {
                    console.error(`Error uploading file ${file.name}:`, error);
                    return {
                        filename: file.name,
                        success: false,
                        error: 'Failed to upload file'
                    };
                }
            })
        );

        return NextResponse.json({ files: results });
    } catch (error) {
        console.error('Error handling file upload:', error);
        return NextResponse.json(
            { error: 'Failed to handle file upload' },
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