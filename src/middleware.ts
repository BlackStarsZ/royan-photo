import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? 'royan_photo_session';

// Routes that require a session (excludes /game/create which is public)
const PROTECTED_PREFIXES = ['/game/'] as const;
const PUBLIC_GAME_ROUTES = ['/game/create'];
// Routes that should redirect to the active game if the user already has a session
const AUTH_ROUTES = ['/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawCookie = request.cookies.get(COOKIE_NAME)?.value;

  // Parse session safely
  let session: { gameCode?: string } | null = null;
  if (rawCookie) {
    try {
      session = JSON.parse(rawCookie) as { gameCode?: string };
    } catch {
      session = null;
    }
  }

  const isPublicGameRoute = PUBLIC_GAME_ROUTES.some((route) => pathname.startsWith(route));
  const isProtected = !isPublicGameRoute && PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  // If already in a game and visiting the home/join page → redirect to the game
  if (isAuthRoute && session?.gameCode) {
    const url = request.nextUrl.clone();
    url.pathname = `/game/${session.gameCode}`;
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Redirect to home if trying to access a protected game route without a session
  if (isProtected && !session) {
    const code = pathname.split('/')[2];
    const url = request.nextUrl.clone();
    url.pathname = '/';
    if (code) url.searchParams.set('join', code);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static, _next/image
     * - favicon, manifest, icons
     */
    '/((?!api|_next/static|_next/image|favicon|icons|manifest).*)',
  ],
};
