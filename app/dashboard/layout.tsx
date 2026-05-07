import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { getUserByEmail } from "@/lib/db";
import Navbar from "@/components/Navbar";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = (await getServerSession()) as any;

  if (!session?.user?.email) {
    console.log("❌ NO SESSION - REDIRECTING TO LOGIN");
    redirect("/login");
  }

  // Get fresh approval status from database
  const dbUser = await getUserByEmail(session.user.email);
  const adminEmail = process.env.ADMIN_EMAIL || "";
  const isAdmin = session.user.email === adminEmail;

  console.log("📱 DASHBOARD LAYOUT CHECK:", {
    email: session.user?.email,
    isAdmin,
    dbUserFound: !!dbUser,
    dbUserStatus: dbUser?.status,
  });

  // Check approval status from database
  if (!isAdmin && dbUser?.status === "pending") {
    console.log("⏳ USER PENDING - REDIRECTING TO PENDING-APPROVAL", {
      email: session.user?.email,
      status: dbUser.status,
    });
    redirect("/pending-approval");
  }

  if (!isAdmin && dbUser?.status === "rejected") {
    console.log("🚫 USER REJECTED - REDIRECTING TO LOGIN", {
      email: session.user?.email,
      status: dbUser.status,
    });
    redirect("/login?error=AccessDenied");
  }

  console.log("✅ DASHBOARD ACCESS ALLOWED", {
    email: session.user?.email,
    isAdmin,
    status: dbUser?.status,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
