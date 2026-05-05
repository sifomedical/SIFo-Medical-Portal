import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = (await getServerSession()) as any;

  // Check if user is authenticated
  if (!session?.user?.email) {
    redirect("/login");
  }

  // In production: require admin status
  // In development: allow any authenticated user for testing
  const isDevelopment = process.env.NODE_ENV === "development";
  const isAdmin = session.isAdmin === true;

  if (!isDevelopment && !isAdmin) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
