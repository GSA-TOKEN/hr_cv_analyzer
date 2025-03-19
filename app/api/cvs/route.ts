import { cvStore } from '@/lib/cv-store';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const analyzedParam = url.searchParams.get('analyzed');

        // Get all CVs
        const allCVs = cvStore.getCVs();

        // Filter based on the 'analyzed' query parameter if provided
        let filteredCVs = allCVs;
        if (analyzedParam !== null) {
            const analyzed = analyzedParam === 'true';
            filteredCVs = allCVs.filter(cv => cv.analyzed === analyzed);
        }

        return NextResponse.json({ cvs: filteredCVs });
    } catch (error) {
        console.error('Error fetching CVs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch CVs' },
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