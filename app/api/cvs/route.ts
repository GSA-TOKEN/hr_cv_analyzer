import { cvStore } from '@/lib/cv-store';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const analyzedParam = url.searchParams.get('analyzed');
        const showOnlyAnalyzedParam = url.searchParams.get('onlyAnalyzed');

        // Get all CVs from the database
        const allCVs = await cvStore.getCVs();
        console.log(`Fetched ${allCVs.length} CVs from database`);

        // By default, prioritize analyzed CVs with demographic data
        let filteredCVs = allCVs;

        // If onlyAnalyzed=true is specified, only return analyzed CVs
        if (showOnlyAnalyzedParam === 'true') {
            filteredCVs = allCVs.filter(cv => cv.analyzed === true);
            console.log(`Filtered to ${filteredCVs.length} analyzed CVs`);
        }
        // Otherwise, check the analyzed parameter if provided
        else if (analyzedParam !== null) {
            const analyzed = analyzedParam === 'true';
            filteredCVs = allCVs.filter(cv => cv.analyzed === analyzed);
            console.log(`Filtered to ${filteredCVs.length} CVs with analyzed=${analyzed}`);
        }

        // Sort the results to show analyzed CVs first, then by upload date
        filteredCVs.sort((a, b) => {
            // First sort by analyzed status (true first)
            if (a.analyzed !== b.analyzed) {
                return a.analyzed ? -1 : 1;
            }

            // Then sort by upload date (newest first)
            return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        });

        return NextResponse.json({
            cvs: filteredCVs,
            total: filteredCVs.length,
            analyzedCount: filteredCVs.filter(cv => cv.analyzed).length
        });
    } catch (error) {
        console.error('Error fetching CVs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch CVs', message: error instanceof Error ? error.message : 'Unknown error' },
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