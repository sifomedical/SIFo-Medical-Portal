"use client";

import { useEffect, useState } from "react";
import { User } from "@/types/user";
import { Check, X, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
  const [rejectedUsers, setRejectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">(
    "pending"
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setPendingUsers(data.pending || []);
        setApprovedUsers(data.approved || []);
        setRejectedUsers(data.rejected || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }

  async function approveUser(email: string) {
    try {
      const response = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to approve user:", error);
    }
  }

  async function rejectUser(email: string) {
    try {
      const response = await fetch("/api/admin/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to reject user:", error);
    }
  }

  const tabData = {
    pending: { label: "Ausstehend", users: pendingUsers, icon: Clock },
    approved: { label: "Genehmigt", users: approvedUsers, icon: CheckCircle },
    rejected: { label: "Abgelehnt", users: rejectedUsers, icon: XCircle },
  };

  const currentTab = tabData[activeTab];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-[#0C2340]">
            Admin Dashboard
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-gray-600 hover:text-[#0C2340]"
          >
            ← Zurück zum Dashboard
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-gray-200 flex">
            {(["pending", "approved", "rejected"] as const).map((tab) => {
              const TabIcon = tabData[tab].icon;
              const count =
                tab === "pending"
                  ? pendingUsers.length
                  : tab === "approved"
                    ? approvedUsers.length
                    : rejectedUsers.length;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-6 py-4 flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-[#0C2340] text-[#0C2340]"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <TabIcon className="w-5 h-5" />
                  <span>
                    {tabData[tab].label} ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Users Table */}
          <div className="p-6">
            {loading ? (
              <div className="text-center text-gray-500">Laden...</div>
            ) : currentTab.users.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Keine Benutzer in dieser Kategorie
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        E-Mail
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Anmeldedatum
                      </th>
                      {activeTab === "pending" && (
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">
                          Aktionen
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {currentTab.users.map((user) => (
                      <tr
                        key={user.email}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">{user.name || "-"}</td>
                        <td className="py-3 px-4">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString("de-AT")
                            : "-"}
                        </td>
                        {activeTab === "pending" && (
                          <td className="py-3 px-4 text-right flex gap-2 justify-end">
                            <button
                              onClick={() => approveUser(user.email)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              Genehmigen
                            </button>
                            <button
                              onClick={() => rejectUser(user.email)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                              Ablehnen
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
