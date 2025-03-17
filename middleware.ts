import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip processing Next.js static files
    if (pathname.startsWith('/_next/')) {
        return NextResponse.next()
    }

    // Only handle direct CV file requests starting with /cv/
    if (pathname.startsWith('/cv/')) {
        try {
            const filename = pathname.replace('/cv/', '')

            // Security check - prevent path traversal
            if (filename.includes('..')) {
                return new Response('Invalid filename', { status: 400 })
            }

            // Redirect to our API endpoint that correctly serves the file
            const url = request.nextUrl.clone()
            url.pathname = `/api/serve-cv/${encodeURIComponent(filename)}`

            return NextResponse.redirect(url)
        } catch (error) {
            console.error('Error in middleware:', error)
            return new Response('Internal server error', { status: 500 })
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/cv/:path*',
        '/_next/static/:path*'
    ],
} 