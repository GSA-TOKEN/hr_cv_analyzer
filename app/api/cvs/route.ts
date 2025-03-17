import { cvStore } from '@/lib/cv-store';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const analyzedParam = searchParams.get('analyzed');

        let cvs = cvStore.getCVs();

        // Filter by analyzed status if parameter is provided
        if (analyzedParam !== null) {
            const isAnalyzed = analyzedParam.toLowerCase() === 'true';
            cvs = cvs.filter(cv => cv.analyzed === isAnalyzed);
        }

        // Sort by uploadDate, newest first
        cvs.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

        // Map to add UI-friendly properties
        const mappedCVs = cvs.map(cv => ({
            ...cv,
            originalFilename: cv.filename, // Use filename as originalFilename
            fileSize: 'PDF', // We don't have file size info, so just indicate it's a PDF
            mimeType: 'application/pdf' // Assume PDFs for now
        }));

        return NextResponse.json({ cvs: mappedCVs }, { status: 200 });
    } catch (error) {
        console.error('Error getting CVs:', error);
        return NextResponse.json(
            { error: 'Failed to get CVs' },
            { status: 500 }
        );
    }
} 