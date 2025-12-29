import { type NextRequest, NextResponse } from 'next/server'

// Middleware to protect routes
// Note: Real security checks happen on the client/API side.
// This middleware primarily handles UX (redirecting unauthenticated users).

import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check for auth token
    const token = request.cookies.get('auth_token')?.value
    const payload = token ? await verifyToken(token) : null

    const isAdmin = payload?.role === 'admin'
    const isStudent = payload?.role === 'student'

    // 1. Protect Admin Routes (Pages & APIs)
    // Exclude actual login APIs from protection if needed, but usually they are public.
    // The matcher handles exclusion of static files.

    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        // Allow public admin login API if it exists under /api/admin/login? No, it's /api/auth/admin-login

        // For API routes, return 401 instead of redirect
        if (!isAdmin && pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!isAdmin) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // 2. Protect Student Routes
    if (pathname.startsWith('/student')) {
        // Protect /api/students routes? 
        // Note: API routes might be shared or specific. 
        // If /api/students is for admin management, we might have an issue here.
        // Let's assume /student is the dashboard page.

        if (!isStudent && !isAdmin) { // Admins might access student views? Usually not, but for safety.    
            // Strict student check:
            if (!isStudent) {
                return NextResponse.redirect(new URL('/login', request.url))
            }
        }
    }

    // 3. Protect AI Chat Route (requires either admin or student session)
    if (pathname.startsWith('/ai-chat')) {
        if (!isAdmin && !isStudent) {
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
