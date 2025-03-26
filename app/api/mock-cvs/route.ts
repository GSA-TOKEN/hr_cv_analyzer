import { NextResponse } from 'next/server';
import { ICV } from '@/lib/cv-store';

// Empty array with no mock CVs - no fake data
const mockCVs: ICV[] = [];

// Handle GET requests to this endpoint
export async function GET() {
    return NextResponse.json({ cvs: mockCVs });
}

// For Next.js to ensure this route is revalidated on each request
export const dynamic = 'force-dynamic'; 