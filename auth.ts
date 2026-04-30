import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Optional: Nur bestimmte E-Mail-Domains oder Adressen erlauben
// Trage hier eure erlaubten Domains oder E-Mails ein:
const ALLOWED_DOMAINS = (process.env.ALLOWED_EMAIL_DOMAINS || "").split(",").filter(Boolean);
const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || "").split(",").filter(Boolean);

function isEmailAllowed(email: string): boolean {
  // Wenn keine Einschränkungen konfiguriert → alle Google-Logins erlaubt
  if (ALLOWED_DOMAINS.length === 0 && ALLOWED_EMAILS.length === 0) return true;

  const domain = email.split("@")[1];
  if (ALLOWED_DOMAINS.includes(domain)) return true;
  if (ALLOWED_EMAILS.includes(email)) return true;
  return false;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      return isEmailAllowed(user.email);
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname === "/login";

      if (isLoginPage) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      if (!isLoggedIn) {
        return Response.redirect(
          new URL(`/login?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`, nextUrl)
        );
      }

      return true;
    },
  },
});
