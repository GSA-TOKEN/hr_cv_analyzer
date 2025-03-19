import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';

export async function GET(
    request: NextRequest,
    { params }: { params: { filename: string } }
) {
    try {
        const filename = decodeURIComponent(params.filename);
        // Local file system path
        const cvFolder = path.join(process.cwd(), 'cv');
        const filePath = path.join(cvFolder, filename);

        // Check if the file exists locally
        if (fs.existsSync(filePath)) {
            // Read the file
            const fileBuffer = await fsPromises.readFile(filePath);

            // Determine content type based on file extension
            let contentType = 'application/octet-stream';
            if (filename.endsWith('.pdf')) {
                contentType = 'application/pdf';
            } else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
                contentType = 'image/jpeg';
            } else if (filename.endsWith('.png')) {
                contentType = 'image/png';
            }

            // Return the file with appropriate headers
            return new NextResponse(fileBuffer, {
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': `inline; filename="${filename}"`,
                },
            });
        }

        // If file doesn't exist, return 404
        return new NextResponse('File not found', { status: 404 });
    } catch (error) {
        console.error('Error serving CV file:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 