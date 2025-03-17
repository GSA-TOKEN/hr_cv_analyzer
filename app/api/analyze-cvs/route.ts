import { NextRequest, NextResponse } from 'next/server';
import { cvStore } from '@/lib/cv-store';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: 'No valid CV IDs provided' },
                { status: 400 }
            );
        }

        const results = await Promise.all(
            ids.map(async (id: string) => {
                try {
                    const cv = await cvStore.analyzeCV(id);
                    return {
                        id,
                        success: true,
                        tags: cv.tags
                    };
                } catch (error) {
                    console.error(`Error analyzing CV ${id}:`, error);
                    return {
                        id,
                        success: false,
                        error: 'Failed to analyze CV'
                    };
                }
            })
        );

        return NextResponse.json(
            { results },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in CV analysis API:', error);
        return NextResponse.json(
            { error: 'Failed to process analysis request' },
            { status: 500 }
        );
    }
} 