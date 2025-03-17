import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
    request: NextRequest,
    { params }: { params: { filename: string[] } }
) {
    try {
        // Join and decode the filename segments
        const filenameArray = params.filename;
        const filename = decodeURIComponent(filenameArray.join('/'));

        console.log("Attempting to serve CV file:", filename);

        // Prevent path traversal attacks by checking each segment
        if (filename.includes('..') || filenameArray.some(segment => segment.includes('..'))) {
            console.error("Security issue: path traversal attempt:", filename);
            return new NextResponse('Invalid filename', { status: 400 });
        }

        const cvPath = path.join(process.cwd(), 'cv', filename);
        console.log("Full file path:", cvPath);

        // Check if file exists before trying to read it
        if (!fs.existsSync(cvPath)) {
            console.error("File not found:", cvPath);
            return new NextResponse('File not found', { status: 404 });
        }

        try {
            // Read file synchronously to handle errors better
            const fileBuffer = fs.readFileSync(cvPath);
            console.log(`Successfully read file: ${filename}, size: ${fileBuffer.length} bytes`);

            // Set correct content type header based on file extension
            let contentType = 'application/octet-stream'; // Default
            if (filename.toLowerCase().endsWith('.pdf')) {
                contentType = 'application/pdf';
            } else if (filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg')) {
                contentType = 'image/jpeg';
            } else if (filename.toLowerCase().endsWith('.png')) {
                contentType = 'image/png';
            }

            return new NextResponse(fileBuffer, {
                status: 200,
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': `inline; filename="${filename.split('/').pop()}"`,
                    'Cache-Control': 'public, max-age=3600',
                },
            });
        } catch (error) {
            console.error('Error reading CV file:', error);
            return new NextResponse(`Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
        }
    } catch (error) {
        console.error('Error serving CV file:', error);
        return new NextResponse(`Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
    }
} 