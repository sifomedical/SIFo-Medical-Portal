"use client";

import { signOut, useSession } from "next-auth/react";
import { Suspense } from "react";
import { Clock } from "lucide-react";

function PendingApprovalContent() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C2340] via-[#394D64] to-[#00A68B] flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Top Brand Bar */}
          <div className="bg-[#0C2340] p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#FFA500]/20 mb-4">
              <Clock className="w-8 h-8 text-[#FFA500]" />
            </div>
            <h1 className="text-white text-2xl font-semibold">SIFo GmbH</h1>
            <p className="text-[#9CA6B1] text-sm mt-2">Process Portal</p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-[#0C2340] mb-3">
                Genehmigung ausstehend
              </h2>
              <div className="bg-[#FFA500]/10 border border-[#FFA500]/30 rounded-lg p-4 mb-6">
                <p className="text-gray-700 mb-4">
                  Dein Account wurde registriert, aber deine Anmeldung muss noch
                  von einem Administrator genehmigt werden.
                </p>
                {session?.user?.email && (
                  <p className="text-sm text-gray-600">
                    <strong>E-Mail:</strong> {session.user.email}
                  </p>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-8">
                Dies kann ein paar Minuten bis Stunden dauern. Bitte versuche es
                später erneut.
              </p>

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full px-6 py-3 bg-[#0C2340] text-white rounded-lg font-semibold hover:bg-[#0A1E2E] transition-colors"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/70 text-xs mt-8 font-light">
          © {new Date().getFullYear()} SIFo GmbH · Vertraulich
        </p>
      </div>
    </div>
  );
}

export default function PendingApprovalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0C2340]" />}>
      <PendingApprovalContent />
    </Suspense>
  );
}
