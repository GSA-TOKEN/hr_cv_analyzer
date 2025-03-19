import { NextRequest, NextResponse } from 'next/server';
import { cvStore } from '@/lib/cv-store';

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
                    // For each ID, attempt to analyze the CV
                    const updatedCV = await cvStore.analyzeCV(id);
                    return { id, success: true, cv: updatedCV };
                } catch (error) {
                    console.error(`Error analyzing CV ${id}:`, error);
                    return { id, success: false, error: (error as Error).message };
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
    } catch (error) {
        console.error('Error in analyze-cvs API route:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
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