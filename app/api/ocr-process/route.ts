import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/utils/ocr';
import { fixCV } from '@/utils/openai-cv-fixer';
import { parseCV } from '@/utils/openai-cv-parser';
import { promises as fs } from 'fs';
import { join } from 'path';

// Configure API endpoint to accept larger request bodies
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
        responseLimit: '10mb',
    },
};

// Disable edge runtime for file system access
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { filePath } = body;

        if (!filePath) {
            return NextResponse.json(
                { error: 'No file path provided' },
                { status: 400 }
            );
        }

        // Extract text using OCR
        const extractedText = await extractTextFromFile(filePath);

        // Fix CV with OpenAI
        const fixedCVText = await fixCV(extractedText);

        // Parse the CV using OpenAI
        const parsedCV = await parseCV(fixedCVText);

        return NextResponse.json({
            success: true,
            originalText: extractedText,
            fixedText: fixedCVText,
            parsedData: parsedCV
        });
    } catch (error: any) {
        console.error('Error in OCR processing:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + error.message },
            { status: 500 }
        );
    }
}

// Upload a file and process it with OCR
export async function PUT(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { error: 'No file was uploaded' },
                { status: 400 }
            );
        }

        // Ensure CV directory exists
        const cvDir = join(process.cwd(), 'cv');

        // Save file to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = Date.now() + '_' + file.name;
        const filePath = join(cvDir, fileName);
        await fs.writeFile(filePath, buffer);

        // Extract text using OCR
        const extractedText = await extractTextFromFile(filePath);

        // Fix CV with OpenAI
        const fixedCVText = await fixCV(extractedText);

        // Parse the CV using OpenAI
        const parsedCV = await parseCV(fixedCVText);

        return NextResponse.json({
            success: true,
            filePath,
            originalText: extractedText,
            fixedText: fixedCVText,
            parsedData: parsedCV
        });
    } catch (error: any) {
        console.error('Error in file upload and OCR processing:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + error.message },
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