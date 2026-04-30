import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession() as any;
  const adminEmail = process.env.ADMIN_EMAIL || "";

  // Check if user is authenticated and is admin
  if (!session || !session.user?.email || session.user.email !== adminEmail) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
