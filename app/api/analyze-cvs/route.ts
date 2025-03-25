import { NextRequest, NextResponse } from 'next/server';
import { cvStore } from '@/lib/cv-store';
import { extractTextFromFile } from '@/utils/ocr';
import { fixCV } from '@/utils/openai-cv-fixer';
import { parseCV, convertParsedCVToTags } from '@/utils/openai-cv-parser';
import { writeFile } from 'fs/promises';
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
        const { ids } = await request.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: 'No CV IDs provided' },
                { status: 400 }
            );
        }

        // Process each CV analysis in parallel
        const results = await Promise.allSettled(
            ids.map(async (id) => {
                try {
                    const analyzedCV = await cvStore.analyzeCV(id);
                    return {
                        id,
                        success: true,
                        cv: analyzedCV
                    };
                } catch (error: any) {
                    return {
                        id,
                        success: false,
                        error: error.message
                    };
                }
            })
        );

        return NextResponse.json({ results });
    } catch (error: any) {
        console.error('Error analyzing CVs:', error);
        return NextResponse.json(
            { error: 'Failed to analyze CVs' },
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