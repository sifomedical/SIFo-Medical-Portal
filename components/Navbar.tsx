"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ChevronRight, Home } from "lucide-react";
import Image from "next/image";
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
    <header className="sticky top-0 z-50 bg-white border-b border-[#F5F6F7] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-[#0C2340] flex items-center justify-center p-1">
              <Image
                src="/signet.png"
                alt="SIFo Medical"
                width={32}
                height={32}
                className="w-full h-full"
              />
            </div>
            <span className="font-semibold text-[#0C2340] group-hover:text-[#00A68B] transition-colors">
              SIFo Medical
            </span>
            <span className="hidden sm:block text-xs text-[#9CA6B1] font-normal ml-1">
              Process Portal
            </span>
          </Link>

          {/* Breadcrumbs (Desktop) */}
          {breadcrumbs.length > 0 && (
            <nav className="hidden md:flex items-center gap-1 text-sm text-[#6A7A8B]">
              <Link href="/" className="hover:text-[#00A68B] transition-colors">
                <Home className="w-4 h-4" />
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <span key={crumb.href} className="flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-[#CDD3D8]" />
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="text-[#0C2340] font-medium capitalize">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="hover:text-[#00A68B] capitalize transition-colors"
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
                  className="w-8 h-8 rounded-full border-2 border-[#F5F6F7]"
                />
              )}
              <span className="hidden sm:block text-sm text-[#6A7A8B]">
                {session.user.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-1.5 text-sm text-[#6A7A8B] hover:text-[#D81E5B] transition-colors px-2 py-1 rounded-md hover:bg-[#D81E5B]/5"
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
