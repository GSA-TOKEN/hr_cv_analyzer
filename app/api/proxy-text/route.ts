import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const targetUrl = url.searchParams.get('url');

        if (!targetUrl) {
            return NextResponse.json(
                { error: 'No URL provided' },
                { status: 400 }
            );
        }

        // Fetch the content from the provided URL
        const response = await fetch(targetUrl);

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch from URL: ${response.statusText}` },
                { status: response.status }
            );
        }

        const content = await response.text();

        return new NextResponse(content, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
    } catch (error: any) {
        console.error('Error proxying text content:', error);
        return NextResponse.json(
            { error: 'Failed to proxy text content: ' + error.message },
            { status: 500 }
        );
    }
} 