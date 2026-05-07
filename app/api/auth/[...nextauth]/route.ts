import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
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

const providers: any[] = [
  GoogleProvider({
    clientId: process.env.AUTH_GOOGLE_ID || "",
    clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
  }),
];

// Development-only: Add credentials provider for testing
if (process.env.NODE_ENV === "development") {
  providers.push(
    CredentialsProvider({
      name: "Test Account",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Allow test user in development
        if (credentials?.email === "test@sifo-medical.de") {
          return {
            id: "dev-test-user",
            email: "test@sifo-medical.de",
            name: "Test User",
            image: null,
          };
        }
        // Allow admin user for testing
        if (credentials?.email === ADMIN_EMAIL) {
          return {
            id: "dev-admin-user",
            email: ADMIN_EMAIL,
            name: "Admin User",
            image: null,
          };
        }
        return null;
      },
    })
  );
}

const handler = NextAuth({
  providers,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Always update user status from database (on every token refresh)
      if (token.email || user?.email) {
        const email = token.email || user?.email;
        const isAdmin = email === ADMIN_EMAIL;
        const dbUser = await getUserByEmail(email as string);

        console.log("🔑 JWT CALLBACK - REFRESH:", {
          email,
          isAdmin,
          dbUserFound: !!dbUser,
          dbUserStatus: dbUser?.status,
        });

        token.email = email;
        token.isAdmin = isAdmin;
        token.approvalStatus = isAdmin ? "approved" : (dbUser?.status || "pending");

        console.log("🔑 JWT TOKEN UPDATED:", {
          email: token.email,
          isAdmin: token.isAdmin,
          approvalStatus: token.approvalStatus,
        });
      }

      return token;
    },

    async signIn({ user }) {
      if (!user.email) return false;
      if (!isEmailAllowed(user.email)) return false;

      console.log("🔐 SIGNIN CALLBACK:", {
        email: user.email,
        name: user.name,
        adminEmail: ADMIN_EMAIL,
        isAdmin: user.email === ADMIN_EMAIL,
      });

      // Create or update user in database
      let dbUser = await getUserByEmail(user.email);

      console.log("🔍 USER LOOKUP:", {
        email: user.email,
        userFound: !!dbUser,
        userStatus: dbUser?.status,
      });

      if (!dbUser) {
        console.log("👤 CREATING NEW USER:", {
          email: user.email,
          name: user.name,
        });

        dbUser = await createUser({
          email: user.email,
          name: user.name || undefined,
          status: "pending",
        });

        console.log("✅ USER CREATED:", {
          email: dbUser?.email,
          status: dbUser?.status,
          id: dbUser?.id,
        });
      }

      return true;
    },

    async session({ session, token }) {
      console.log("📊 SESSION CALLBACK - TOKEN DATA:", {
        tokenEmail: token.email,
        tokenIsAdmin: token.isAdmin,
        tokenApprovalStatus: token.approvalStatus,
      });

      // Get isAdmin and approvalStatus from JWT token
      if (token.email) {
        (session as any).isAdmin = token.isAdmin || false;
        (session as any).approvalStatus = token.approvalStatus || "pending";
      }

      console.log("📊 SESSION CALLBACK RESULT:", {
        email: session.user?.email,
        isAdmin: (session as any).isAdmin,
        approvalStatus: (session as any).approvalStatus,
      });

      return session;
    },
  },
});

export const GET = handler;
export const POST = handler;
