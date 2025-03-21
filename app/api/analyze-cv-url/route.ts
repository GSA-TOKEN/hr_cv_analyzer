import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromUrl } from '@/utils/ocr';
import { fixCV } from '@/utils/openai-cv-fixer';
import { parseCV, convertParsedCVToTags } from '@/utils/openai-cv-parser';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

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
        const { url, id, filename } = body;

        if (!url) {
            return NextResponse.json(
                { error: 'No URL provided' },
                { status: 400 }
            );
        }

        const cvId = id || uuidv4();
        const cvFilename = filename || path.basename(url);

        // Create directory for saving files
        const cvDir = join(process.cwd(), 'cv');

        // Extract text from the URL
        const extractedText = await extractTextFromUrl(url);

        // Save the original text to a file
        const originalTextPath = join(cvDir, `${cvId}_original.txt`);
        await writeFile(originalTextPath, extractedText);

        // Fix CV with OpenAI
        const fixedCVText = await fixCV(extractedText);

        // Save the fixed text to a file
        const fixedTextPath = join(cvDir, `${cvId}_fixed.txt`);
        await writeFile(fixedTextPath, fixedCVText);

        // Parse the CV using OpenAI
        const parsedCV = await parseCV(fixedCVText);

        // Convert parsed CV to tags
        const tags = convertParsedCVToTags(parsedCV);

        // Return the results
        return NextResponse.json({
            success: true,
            id: cvId,
            filename: cvFilename,
            originalTextPath,
            fixedTextPath,
            parsedCV,
            tags,
            originalText: extractedText,
            fixedText: fixedCVText
        });
    } catch (error: any) {
        console.error('Error analyzing CV from URL:', error);
        return NextResponse.json(
            { error: 'Failed to analyze CV from URL: ' + error.message },
            { status: 500 }
        );
    }
} 