import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    // Alle Routen außer statische Assets, _next, API und login schützen
    "/((?!api|_next/static|_next/image|favicon.ico|login|.*\\.png$|.*\\.svg$).*)",
  ],
};
