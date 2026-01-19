import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const session = request.cookies.get('session')
    const { pathname } = request.nextUrl

    // Protected Admin Routes
    if (pathname.startsWith('/admin')) {
        if (!session) {
            return NextResponse.redirect(new URL('/', request.url))
        }
        try {
            const { role } = JSON.parse(session.value)
            if (role !== 'admin') {
                // Redirect non-admins to their dashboard or home
                return NextResponse.redirect(new URL('/employee-dashboard', request.url))
            }
        } catch (e) {
            // Invalid session
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // Protected Employee Routes
    if (pathname.startsWith('/employee-dashboard')) {
        if (!session) {
            return NextResponse.redirect(new URL('/', request.url))
        }
        try {
            const { role } = JSON.parse(session.value)
            if (role !== 'employee') {
                // Redirect non-employees (e.g. admins) back to their dashboard?
                // User requested: "restrict admin users from directly accessing the employee dashboard"
                return NextResponse.redirect(new URL('/admin', request.url))
            }
        } catch (e) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/employee-dashboard/:path*'],
}
