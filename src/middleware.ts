import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request })
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname === '/'
    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')

    // Redirect authenticated users away from login page
    if (isAuthPage && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Protect dashboard routes
    if (isDashboard && !token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/login', '/dashboard/:path*'],
}
