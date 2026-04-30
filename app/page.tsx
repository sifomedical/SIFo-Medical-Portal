// Root → leitet zum Dashboard
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

export default async function RootPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");
  redirect("/dashboard");
}
