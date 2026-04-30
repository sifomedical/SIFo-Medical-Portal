import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const ALLOWED_DOMAINS = (process.env.ALLOWED_EMAIL_DOMAINS || "").split(",").filter(Boolean);
const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || "").split(",").filter(Boolean);

function isEmailAllowed(email: string): boolean {
  if (ALLOWED_DOMAINS.length === 0 && ALLOWED_EMAILS.length === 0) return true;
  const domain = email.split("@")[1];
  if (ALLOWED_DOMAINS.includes(domain)) return true;
  if (ALLOWED_EMAILS.includes(email)) return true;
  return false;
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
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
  },
});

export const GET = handler;
export const POST = handler;
