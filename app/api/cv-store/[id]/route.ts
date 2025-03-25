import { NextRequest, NextResponse } from 'next/server'
import { cvStore } from '@/lib/cv-store'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const cv = await cvStore.getCV(params.id)
        if (!cv) {
            return NextResponse.json(
                { error: 'CV not found' },
                { status: 404 }
            )
        }

        const fileBuffer = await cvStore.getCVFile(params.id)
        const contentType = cv.filename.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${cv.filename}"`,
                'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
            },
        })
    } catch (error: any) {
        console.error('Error serving CV file:', error)
        return NextResponse.json(
            { error: 'Failed to serve CV file' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await cvStore.deleteCV(params.id)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error deleting CV:', error)
        return NextResponse.json(
            { error: 'Failed to delete CV' },
            { status: 500 }
        )
    }
} 