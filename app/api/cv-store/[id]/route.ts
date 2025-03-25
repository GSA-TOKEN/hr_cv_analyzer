import { NextResponse } from 'next/server'
import { cvStore } from '@/lib/cv-store'
import fs from 'fs'
import path from 'path'

export async function GET(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        // Await the params object
        const { id } = await context.params;

        // Decode the URL-encoded ID
        const decodedId = decodeURIComponent(id);
        const cv = cvStore.getCV(decodedId);

        if (!cv) {
            return NextResponse.json(
                { error: 'CV not found' },
                { status: 404 }
            )
        }

        // Get the actual file path from the cv_store folder
        const filePath = path.join(process.cwd(), 'cv_store', cv.filename)

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return NextResponse.json(
                { error: 'CV file not found' },
                { status: 404 }
            )
        }

        // Read the file
        const fileBuffer = fs.readFileSync(filePath)
        const fileType = path.extname(filePath).toLowerCase()

        // Set appropriate content type
        let contentType = 'application/octet-stream'
        switch (fileType) {
            case '.pdf':
                contentType = 'application/pdf'
                break
            case '.doc':
            case '.docx':
                contentType = 'application/msword'
                break
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg'
                break
            case '.png':
                contentType = 'image/png'
                break
            case '.tiff':
                contentType = 'image/tiff'
                break
        }

        // Encode the filename for Content-Disposition header
        const encodedFilename = encodeURIComponent(cv.filename)

        // Return the file with appropriate headers
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename*=UTF-8''${encodedFilename}`,
            },
        })
    } catch (error) {
        console.error('Error serving CV file:', error)
        return NextResponse.json(
            { error: 'Failed to serve CV file' },
            { status: 500 }
        )
    }
} 