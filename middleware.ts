export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    // Alle Routen außer statische Assets, _next und API-Routen schützen
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};
