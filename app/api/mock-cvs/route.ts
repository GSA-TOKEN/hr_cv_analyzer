import { NextResponse } from 'next/server';
import { ICV } from '@/lib/cv-store';

// Empty array with no mock CVs
const mockCVs: ICV[] = [];

export async function GET() {
    return NextResponse.json({ cvs: mockCVs });
}

export const dynamic = 'force-dynamic'; 