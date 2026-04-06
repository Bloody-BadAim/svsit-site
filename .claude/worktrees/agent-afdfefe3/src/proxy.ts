import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { ADMIN_EMAILS } from '@/lib/constants'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const isLoggedIn = !!session?.user

  // Public routes — geen auth nodig
  if (
    pathname === '/' ||
    pathname === '/over-ons' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/opengraph')
  ) {
    return NextResponse.next()
  }

  // Login pagina — redirect naar dashboard als al ingelogd
  if (pathname === '/login') {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  // Lid worden — redirect naar dashboard als al actief lid
  if (pathname === '/lid-worden') {
    if (isLoggedIn && session.user.membershipActive) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  // Dashboard routes — vereist login
  if (pathname.startsWith('/dashboard')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return NextResponse.next()
  }

  // Admin routes — vereist login + admin rol
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
