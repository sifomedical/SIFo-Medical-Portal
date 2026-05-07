"use client";

import { useState, useEffect } from "react";
import { DraftProcess } from "@/types/process";
import { CATEGORIES } from "@/types/process";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type Tab = 'pending' | 'archived'

export default function AdminProcessesPage() {
  const [drafts, setDrafts] = useState<DraftProcess[]>([]);
  const [archived, setArchived] = useState<DraftProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('pending');

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/processes");
      console.log("📊 Fetch response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ API Error:", errorData);
        throw new Error(errorData.error || `Failed to fetch drafts (${response.status})`);
      }

      const data = await response.json();
      console.log("✅ Drafts loaded:", data);

      // Separate drafts and archived processes
      const pendingProcesses = (data.drafts || []).filter((p: DraftProcess) => p.status === 'draft');
      const archivedProcesses = (data.drafts || []).filter((p: DraftProcess) => p.status === 'archived');

      setDrafts(pendingProcesses);
      setArchived(archivedProcesses);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ Error in fetchDrafts:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (slug: string) => {
    setActionLoading(slug);
    try {
      const response = await fetch("/api/admin/processes/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!response.ok) throw new Error("Failed to approve");
      const data = await response.json();

      // Process is immediately available from Supabase - no deployment needed
      const message = "✅ Process approved and live!\n🎉 Your process is now visible in the dashboard.\nNo deployment needed - it's available immediately.";


      alert(message);
      await fetchDrafts();
    } catch (err) {
      alert("❌ " + (err instanceof Error ? err.message : "Error approving"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (slug: string) => {
    if (!confirm("❌ Are you sure you want to reject this draft?")) return;

    setActionLoading(slug);
    try {
      const response = await fetch("/api/admin/processes/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!response.ok) throw new Error("Failed to reject");
      await fetchDrafts();
      alert("✅ Process rejected");
    } catch (err) {
      alert("❌ " + (err instanceof Error ? err.message : "Error rejecting"));
    } finally {
      setActionLoading(null);
    }
  };

  const getCategoryColor = (categoryId: string) => {
    const cat = CATEGORIES.find((c) => c.id === categoryId);
    return cat?.bgColor || "bg-gray-50";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A68B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-[#0C2340]">Admin Dashboard</h1>
            <a
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-[#0C2340]"
            >
              ← Zurück zum Dashboard
            </a>
          </div>
          {/* Admin Tabs */}
          <div className="flex gap-4 border-t border-gray-200 pt-3">
            <a
              href="/admin"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0C2340] border-b-2 border-transparent hover:border-[#0C2340]"
            >
              👥 Benutzer-Genehmigung
            </a>
            <a
              href="/admin/processes"
              className="px-4 py-2 text-sm font-medium text-[#0C2340] border-b-2 border-[#0C2340]"
            >
              📋 Prozess-Genehmigung
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'pending'
                ? 'border-[#0C2340] text-[#0C2340]'
                : 'border-transparent text-gray-600 hover:text-[#0C2340]'
            }`}
          >
            📋 Pending ({drafts.length})
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'archived'
                ? 'border-[#0C2340] text-[#0C2340]'
                : 'border-transparent text-gray-600 hover:text-[#0C2340]'
            }`}
          >
            🗂️ Archived ({archived.length})
          </button>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-[#0C2340]">
            {activeTab === 'pending' ? 'Pending Processes' : 'Archived Processes'}
          </h2>
          <p className="text-[#6A7A8B] mt-1">
            {activeTab === 'pending'
              ? 'Review and approve new processes created by team members'
              : 'Restore or permanently delete archived processes'}
          </p>
        </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          ❌ {error}
        </div>
      )}

      {(activeTab === 'pending' ? drafts : archived).length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-[#F5F6F7]">
          <p className="text-[#9CA6B1]">
            {activeTab === 'pending' ? 'No pending processes' : 'No archived processes'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {(activeTab === 'pending' ? drafts : archived).map((draft) => (
            <div
              key={draft.slug}
              className="p-4 border border-[#F5F6F7] rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Title & Category */}
                <div className="col-span-2">
                  <h3 className="font-semibold text-[#0C2340]">{draft.title}</h3>
                  <p className="text-sm text-[#6A7A8B] line-clamp-1">
                    {draft.description}
                  </p>
                  <div className="mt-2">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${getCategoryColor(draft.category)} text-[#0C2340]`}
                    >
                      {CATEGORIES.find((c) => c.id === draft.category)?.title}
                    </span>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="text-sm text-[#6A7A8B]">
                  <p>
                    <strong>Created by:</strong> {draft.createdBy}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(draft.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  {activeTab === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleApprove(draft.slug)}
                        disabled={actionLoading !== null}
                        className="flex items-center gap-1 px-3 py-2 bg-[#00A68B] text-white rounded-lg hover:bg-[#008B72] transition-colors disabled:opacity-50"
                      >
                        {actionLoading === draft.slug ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(draft.slug)}
                        disabled={actionLoading !== null}
                        className="flex items-center gap-1 px-3 py-2 bg-[#D81E5B] text-white rounded-lg hover:bg-[#B0183F] transition-colors disabled:opacity-50"
                      >
                        {actionLoading === draft.slug ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        Reject
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        if (confirm(`Restore "${draft.title}"?`)) {
                          setActionLoading(draft.slug);
                          fetch('/api/processes/delete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ slug: draft.slug, action: 'restore' }),
                          })
                            .then(r => r.json())
                            .then(() => {
                              fetchDrafts();
                              setActionLoading(null);
                              alert('✅ Process restored');
                            })
                            .catch(e => {
                              alert('❌ ' + (e instanceof Error ? e.message : 'Error'));
                              setActionLoading(null);
                            });
                        }
                      }}
                      disabled={actionLoading !== null}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === draft.slug ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Restore
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {drafts.length > 0 && (
        <div className="p-4 bg-[#00A68B]/10 border border-[#00A68B]/30 rounded-lg text-sm text-[#0C2340]">
          📝 <strong>After approving:</strong> Run <code className="bg-white px-2 py-1 rounded">npm run build</code> then deploy to make processes live
        </div>
      )}
      </div>
    </div>
  );
}
