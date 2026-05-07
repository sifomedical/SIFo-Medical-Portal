import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { getUserByEmail } from "@/lib/db";
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = (await getServerSession()) as any;

  // Check if user is authenticated
  if (!session?.user?.email) {
    console.log("❌ ADMIN: NO SESSION");
    redirect("/login");
  }

  const adminEmail = process.env.ADMIN_EMAIL || "";
  const isAdmin = session.user.email === adminEmail;

  console.log("🔐 ADMIN LAYOUT CHECK:", {
    email: session.user?.email,
    isAdmin,
    adminEmail,
  });

  // Check if user is admin - ALWAYS required
  if (!isAdmin) {
    console.log("🚫 ADMIN: NOT ADMIN USER");
    redirect("/dashboard");
  }

  // Admin users don't need approval check (they're always approved)
  console.log("✅ ADMIN ACCESS ALLOWED", {
    email: session.user?.email,
  });

  return <>{children}</>;
}
