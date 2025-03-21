import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const filePath = url.searchParams.get('path');

        if (!filePath) {
            return NextResponse.json(
                { error: 'No file path provided' },
                { status: 400 }
            );
        }

        // Security check - only allow reading files from the CV directory
        const cvDir = path.join(process.cwd(), 'cv');
        const resolvedPath = path.resolve(filePath);

        if (!resolvedPath.startsWith(cvDir)) {
            return NextResponse.json(
                { error: 'Access denied - cannot access files outside the CV directory' },
                { status: 403 }
            );
        }

        if (!fs.existsSync(resolvedPath)) {
            return NextResponse.json(
                { error: 'File not found' },
                { status: 404 }
            );
        }

        const content = fs.readFileSync(resolvedPath, 'utf8');

        return new NextResponse(content, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
    } catch (error: any) {
        console.error('Error serving text file:', error);
        return NextResponse.json(
            { error: 'Failed to serve text file: ' + error.message },
            { status: 500 }
        );
    }
}

// Disable edge runtime for file system access
export const runtime = 'nodejs'; 