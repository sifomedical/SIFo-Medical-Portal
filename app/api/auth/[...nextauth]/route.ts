import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getUserByEmail, createUser } from "@/lib/db-users";

const ALLOWED_DOMAINS = (process.env.ALLOWED_EMAIL_DOMAINS || "").split(",").filter(Boolean);
const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || "").split(",").filter(Boolean);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

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
      if (!isEmailAllowed(user.email)) return false;

      // Create or update user in database
      let dbUser = await getUserByEmail(user.email);
      if (!dbUser) {
        dbUser = await createUser({
          id: `user_${Date.now()}`,
          email: user.email,
          name: user.name || undefined,
          status: "pending",
        });
      }

      return true;
    },

    async session({ session, token }) {
      if (session.user?.email) {
        const dbUser = await getUserByEmail(session.user.email);
        
        // Always set isAdmin based on email, regardless of dbUser status
        const isAdmin = session.user.email === ADMIN_EMAIL;
        (session as any).isAdmin = isAdmin;
        
        // If user exists in DB, add approval status
        if (dbUser) {
          (session as any).approvalStatus = dbUser.status;
        } else {
          // If user doesn't exist in DB yet, check if they're admin
          (session as any).approvalStatus = isAdmin ? "approved" : "pending";
        }
      }
      return session;
    },
  },
});

export const GET = handler;
export const POST = handler;
