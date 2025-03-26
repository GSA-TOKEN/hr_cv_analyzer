import { NextRequest, NextResponse } from 'next/server';
import { cvAnalysisService } from '@/utils/cv-analysis-service';

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

        // Process CVs using the analysis service
        const results = await cvAnalysisService.analyzeCVs(ids);

        // Ensure consistent format for the results
        // Even if a Promise.allSettled-style interface was expected
        const formattedResults = results.map(result => ({
            status: 'fulfilled',
            value: result,
            // Add direct success property for backward compatibility
            success: result.success,
            id: result.id,
            message: result.message,
            error: result.error
        }));

        return NextResponse.json({ results: formattedResults });
    } catch (error: any) {
        console.error('Error in analyze-cvs endpoint:', error);
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