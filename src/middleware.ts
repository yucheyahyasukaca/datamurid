import { type NextRequest, NextResponse } from 'next/server'

// Middleware to protect routes
// Note: Real security checks happen on the client/API side.
// This middleware primarily handles UX (redirecting unauthenticated users).

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 1. Protect Admin Routes
    if (pathname.startsWith('/admin')) {
        const adminSession = request.cookies.get('admin_session')
        if (!adminSession) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // 2. Protect Student Routes
    if (pathname.startsWith('/student')) {
        const studentSession = request.cookies.get('student_session')
        if (!studentSession) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // 3. Protect AI Chat Route (requires either admin or student session)
    if (pathname.startsWith('/ai-chat')) {
        const adminSession = request.cookies.get('admin_session')
        const studentSession = request.cookies.get('student_session')
        if (!adminSession && !studentSession) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
