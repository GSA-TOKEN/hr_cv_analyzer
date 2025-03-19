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

    // Get the response
    const response = NextResponse.next()

    // Add CORS headers to the response
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

    return response
}

export const config = {
    matcher: [
        '/cv/:path*',
        '/_next/static/:path*',
        '/api/:path*'
    ],
} 