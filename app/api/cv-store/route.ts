import { NextResponse } from 'next/server'
import { cvStore } from '@/lib/cv-store'

export async function GET() {
    try {
        const cvs = cvStore.getCVs()
        return NextResponse.json(cvs)
    } catch (error) {
        console.error('Error fetching CVs from store:', error)
        return NextResponse.json(
            { error: 'Failed to fetch CVs from store' },
            { status: 500 }
        )
    }
} 