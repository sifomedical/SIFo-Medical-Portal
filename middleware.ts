import { withAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";

export default withAuth(function middleware(request: NextRequest) {
  return null;
});

export const config = {
  matcher: [
    // Alle Routen außer statische Assets, _next und API-Routen schützen
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};
