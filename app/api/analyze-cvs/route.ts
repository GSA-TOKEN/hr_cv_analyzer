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
        const body = await request.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: 'Invalid request. Expected an array of CV IDs.' },
                { status: 400 }
            );
        }

        const results = await Promise.allSettled(
            ids.map(async (id) => {
                try {
                    // Get CV from store
                    const cv = cvStore.getCV(id);
                    if (!cv) {
                        throw new Error(`CV with ID ${id} not found`);
                    }

                    // Extract text using OCR
                    const extractedText = await extractTextFromFile(cv.path);

                    // Save the original text to a text file
                    const cvDir = join(process.cwd(), 'cv');
                    const originalTextPath = join(cvDir, `${id}_original.txt`);
                    await writeFile(originalTextPath, extractedText);

                    // Fix CV with OpenAI
                    const fixedCVText = await fixCV(extractedText);

                    // Save the fixed text to a text file
                    const fixedTextPath = join(cvDir, `${id}_fixed.txt`);
                    await writeFile(fixedTextPath, fixedCVText);

                    // Parse the CV using OpenAI
                    const parsedCV = await parseCV(fixedCVText);

                    // Convert parsed CV to tags
                    const tags = convertParsedCVToTags(parsedCV);

                    // Update CV with tags
                    let updatedCV = cvStore.updateCVTags(id, tags);

                    // Update CV with additional data
                    if (updatedCV) {
                        updatedCV.analyzed = true;
                        updatedCV.originalCvPath = originalTextPath;
                        updatedCV.cv = fixedTextPath;
                        // If age is present in parsedCV, update it
                        if (parsedCV.Age) {
                            const ageMatch = parsedCV.Age.match(/(\d+)[-+]/);
                            if (ageMatch) {
                                const age = parseInt(ageMatch[1]);
                                if (!isNaN(age)) {
                                    updatedCV = cvStore.updateCVAge(id, age);
                                }
                            }
                        }
                    }

                    return { id, success: true, cv: updatedCV, tags };
                } catch (error: any) {
                    console.error(`Error analyzing CV ${id}:`, error);
                    return { id, success: false, error: error.message };
                }
            })
        );

        // Count successful and failed analyses
        const successful = results.filter(
            (result) => result.status === 'fulfilled' && (result.value as any).success
        ).length;

        const failed = results.filter(
            (result) => result.status === 'rejected' || !(result.value as any).success
        ).length;

        return NextResponse.json({
            message: `Analysis complete. ${successful} successful, ${failed} failed.`,
            results
        });
    } catch (error: any) {
        console.error('Error in analyze-cvs API route:', error);
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