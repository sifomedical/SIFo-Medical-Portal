"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ChevronRight, Home } from "lucide-react";
import { CATEGORIES } from "@/types/process";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Breadcrumb aus Pfad ableiten
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const label =
      CATEGORIES.find((c) => c.id === seg)?.title ||
      seg.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    return { href, label };
  });

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-[#1B3A6B] flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <span className="font-semibold text-gray-900 group-hover:text-[#1B3A6B] transition-colors">
              SIFo Medical
            </span>
            <span className="hidden sm:block text-xs text-gray-400 font-normal ml-1">
              Process Portal
            </span>
          </Link>

          {/* Breadcrumbs (Desktop) */}
          {breadcrumbs.length > 0 && (
            <nav className="hidden md:flex items-center gap-1 text-sm text-gray-500">
              <Link href="/" className="hover:text-[#1B3A6B] transition-colors">
                <Home className="w-4 h-4" />
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <span key={crumb.href} className="flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-gray-300" />
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="text-gray-700 font-medium capitalize">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="hover:text-[#1B3A6B] capitalize transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          )}

          {/* User & Logout */}
          {session?.user && (
            <div className="flex items-center gap-3">
              {session.user.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-8 h-8 rounded-full border-2 border-gray-100"
                />
              )}
              <span className="hidden sm:block text-sm text-gray-600">
                {session.user.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors px-2 py-1 rounded-md hover:bg-red-50"
                title="Abmelden"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Abmelden</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
