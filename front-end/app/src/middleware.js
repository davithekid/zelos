export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth_token');

    if (!token) {
      return Response.redirect(new URL('/', request.url));
    }
  }

  return Response.next();
}