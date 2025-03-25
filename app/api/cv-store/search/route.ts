import { NextResponse } from 'next/server';
import { cvStore } from '@/lib/cv-store';

export async function POST(request: Request) {
    try {
        const { tags } = await request.json();

        if (!Array.isArray(tags)) {
            return NextResponse.json(
                { error: 'Invalid tags parameter' },
                { status: 400 }
            );
        }

        const cvs = await cvStore.getCVsByTags(tags);
        return NextResponse.json(cvs);
    } catch (error: any) {
        console.error('Error searching CVs:', error);
        return NextResponse.json(
            { error: 'Failed to search CVs' },
            { status: 500 }
        );
    }
} 