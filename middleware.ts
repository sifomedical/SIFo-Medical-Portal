import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Öffentliche Routen
  if (pathname.startsWith("/api/auth") || pathname === "/login" || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  // Überprüfe Session/Token
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  // Nicht angemeldet → zu Login
  if (!token && pathname !== "/login") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Angemeldet und auf /login → zu Home
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Schütze alle Routen außer statische Assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};
