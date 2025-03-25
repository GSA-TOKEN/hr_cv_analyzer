import { NextRequest, NextResponse } from 'next/server'
import { cvStore } from '@/lib/cv-store'

export async function GET() {
    try {
        console.log('GET /api/cv-store - Fetching CVs...');
        const cvs = await cvStore.getCVs()
        console.log(`GET /api/cv-store - Successfully fetched ${cvs.length} CVs`);
        return NextResponse.json(cvs)
    } catch (error) {
        console.error('Error fetching CVs:', error)
        return NextResponse.json(
            { error: 'Failed to fetch CVs' },
            { status: 500 }
        )
    }
}

// Helper function to validate file type
function isValidFileType(fileName: string) {
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.docx', '.doc', '.txt'];
    const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
    return allowedExtensions.includes(ext);
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const tags = formData.get('tags') as string

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        if (!isValidFileType(file.name)) {
            return NextResponse.json(
                { error: 'Invalid file type' },
                { status: 400 }
            )
        }

        // Convert File to Buffer
        const buffer = Buffer.from(await file.arrayBuffer())

        // Parse tags if provided
        const parsedTags = tags ? JSON.parse(tags) : []

        // Add CV to store
        const cv = await cvStore.addCV(
            buffer,
            file.name,
            file.type,
            parsedTags
        )

        return NextResponse.json(cv)
    } catch (error) {
        console.error('Error adding CV:', error)
        return NextResponse.json(
            { error: 'Failed to add CV' },
            { status: 500 }
        )
    }
}

// For file size validation in the API route config
export const config = {
    api: {
        bodyParser: false, // Disable the default body parser to handle file uploads
        responseLimit: '10mb',
    },
}; 