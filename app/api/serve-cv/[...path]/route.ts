import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper function to create a safe filename for headers
function createSafeFilename(filename: string): string {
    // For Content-Disposition header, ASCII-only characters are safest
    // Replace spaces with underscores and remove special characters
    return encodeURIComponent(path.basename(filename))
        .replace(/%20/g, '_')
        .replace(/%[0-9A-F]{2}/g, '_');
}

// Helper function to check if a file exists and get its path
function getValidatedFilePath(params: { path: string[] }) {
    try {
        // Get filename from path param
        const filePath = params.path.join('/');
        const filename = decodeURIComponent(filePath);

        // Basic security check
        if (filename.includes('..')) {
            return { error: 'Invalid filename', status: 400 };
        }

        // Get full path to CV file
        const cvPath = path.join(process.cwd(), 'cv', filename);

        // Check if file exists
        if (!fs.existsSync(cvPath)) {
            return { error: 'File not found', status: 404 };
        }

        return { cvPath, filename };
    } catch (error) {
        console.error('Error validating file path:', error);
        return { error: 'Internal server error', status: 500 };
    }
}

// Handle HEAD requests - used to check if file exists without downloading it
export async function HEAD(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const result = getValidatedFilePath(params);

    if ('error' in result) {
        return new Response(null, { status: result.status });
    }

    const { filename } = result;

    // Determine content type
    let contentType = 'application/octet-stream';
    if (filename.toLowerCase().endsWith('.pdf')) {
        contentType = 'application/pdf';
    } else if (filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg')) {
        contentType = 'image/jpeg';
    } else if (filename.toLowerCase().endsWith('.png')) {
        contentType = 'image/png';
    }

    // Create a safe filename for headers
    const safeFilename = createSafeFilename(filename);

    return new Response(null, {
        status: 200,
        headers: {
            'Content-Type': contentType,
            // Use ASCII-only filename in Content-Disposition
            'Content-Disposition': `inline; filename="${safeFilename}"`,
        },
    });
}

// Handle GET requests - used to serve the actual file
export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const result = getValidatedFilePath(params);

    if ('error' in result) {
        return new Response(result.error, { status: result.status });
    }

    const { cvPath, filename } = result;

    try {
        // Read file
        const buffer = fs.readFileSync(cvPath);

        // Determine content type
        let contentType = 'application/octet-stream';
        if (filename.toLowerCase().endsWith('.pdf')) {
            contentType = 'application/pdf';
        } else if (filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg')) {
            contentType = 'image/jpeg';
        } else if (filename.toLowerCase().endsWith('.png')) {
            contentType = 'image/png';
        }

        // Create a safe filename for headers
        const safeFilename = createSafeFilename(filename);

        // Return file with proper headers
        return new Response(buffer, {
            headers: {
                'Content-Type': contentType,
                // Use ASCII-only filename in Content-Disposition
                'Content-Disposition': `inline; filename="${safeFilename}"`,
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Error serving CV:', error);
        return new Response('Error serving file', { status: 500 });
    }
} 