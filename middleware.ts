import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    // Log the requested path for debugging
    console.log('Middleware requested path:', request.nextUrl.pathname);

    // Just a pass-through middleware to ensure Next.js generates the middleware-manifest.json
    return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
} 