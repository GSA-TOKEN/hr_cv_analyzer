import { NextRequest, NextResponse } from 'next/server';
import { getFileFromGridFS } from '@/lib/mongodb-storage';
import iconv from 'iconv-lite';
import chardet from 'chardet';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const buffer = await getFileFromGridFS(params.id);

        // Detect the encoding of the text
        const detectedEncoding = chardet.detect(buffer) || 'utf-8';

        // Convert the buffer to text using the detected encoding
        let text = iconv.decode(buffer, detectedEncoding);

        // Clean up the text
        text = text
            // Replace multiple newlines with a single one
            .replace(/\n{3,}/g, '\n\n')
            // Replace multiple spaces with a single one
            .replace(/ {2,}/g, ' ')
            // Remove null characters and other control characters
            .replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F]/g, '')
            // Normalize Unicode characters
            .normalize('NFKC')
            // Trim whitespace
            .trim();

        // Get format parameter from query string
        const format = request.nextUrl.searchParams.get('format');

        if (format === 'json') {
            // Return the text as JSON
            return NextResponse.json({ text });
        }

        // Return as plain text by default
        return new NextResponse(text, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
                'Content-Language': 'en',
            },
        });
    } catch (error: any) {
        console.error('Error serving text file:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json(
            { error: 'Failed to serve text file', details: errorMessage },
            { status: 500 }
        );
    }
} 