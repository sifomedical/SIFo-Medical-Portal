import { getServerSession } from "next-auth/next";
import { CATEGORIES, CategoryId } from "@/types/process";
import { ALL_PROCESSES, getProcessesByCategory } from "@/data/processes";
import { getActiveProcessesFromSupabase } from "@/lib/db-processes";
import CategoryCard from "@/components/CategoryCard";
import ProcessCard from "@/components/ProcessCard";
import { BookOpen, Layers, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession();
  const firstName = session?.user?.name?.split(" ")[0] || "Team";
  const userEmail = session?.user?.email;
  const adminEmail = process.env.ADMIN_EMAIL;

  // JSON-Prozesse (statisch im Build)
  const jsonProcesses = ALL_PROCESSES.filter((p) => p.status === "active");

  // Supabase-Prozesse (alle aktiven, inkl. neu genehmigte)
  const supabaseProcesses = await getActiveProcessesFromSupabase();

  // Merge: Supabase hat Vorrang, JSON füllt den Rest
  const supabaseSlugs = new Set(supabaseProcesses.map((p) => p.slug));
  const allProcesses = [
    ...supabaseProcesses,
    ...jsonProcesses.filter((p) => !supabaseSlugs.has(p.slug)),
  ];

  const totalProcesses = allProcesses.length;

  const recentProcesses = [...allProcesses]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 3);

  // Prozessanzahl pro Kategorie (kombiniert)
  const countByCategory = (catId: CategoryId) => {
    const supabaseCount = supabaseProcesses.filter((p) => p.category === catId).length;
    const jsonOnly = getProcessesByCategory(catId).filter((p) => !supabaseSlugs.has(p.slug)).length;
    return supabaseCount + jsonOnly;
  };

  const activeCategoryCount = CATEGORIES.filter((c) => countByCategory(c.id) > 0).length;

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-[#0C2340] to-[#00A68B] rounded-2xl p-8 sm:p-12 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-[#D2EDE7] text-sm font-light mb-2">
                Willkommen zurück, {firstName} 👋
              </p>
              <h1 className="text-4xl sm:text-5xl font-semibold mb-4">
                SIFo Medical
                <br />
                <span className="text-[#D2EDE7] font-light">Process Portal</span>
              </h1>
            </div>
            <Link
              href="/create-process"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#0C2340] rounded-lg font-semibold hover:bg-[#D2EDE7] transition-colors whitespace-nowrap h-fit"
            >
              <Plus className="w-5 h-5" />
              Neuer Prozess
            </Link>
          </div>
          <p className="text-[#D2EDE7]/90 max-w-xl text-sm sm:text-base leading-relaxed">
            Alle Unternehmens-Prozesse an einem Ort – übersichtlich dokumentiert,
            grafisch dargestellt und jederzeit abrufbar.
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-8 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00A68B]/25 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold">{totalProcesses}</p>
                <p className="text-xs text-[#D2EDE7]">Prozesse</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00A68B]/25 flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold">{activeCategoryCount}</p>
                <p className="text-xs text-[#D2EDE7]">Bereiche</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00A68B]/25 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold">Live</p>
                <p className="text-xs text-[#D2EDE7]">Status</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[#0C2340]">Bereiche</h2>
          <span className="text-sm text-[#6A7A8B]">
            {CATEGORIES.length} Abteilungen
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              processCount={countByCategory(category.id)}
            />
          ))}
        </div>
      </section>

      {/* Recently Updated */}
      {recentProcesses.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-[#0C2340]">
              Zuletzt aktualisiert
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProcesses.map((process) => (
              <ProcessCard key={process.id} process={process} userEmail={userEmail} adminEmail={adminEmail} />
            ))}
          </div>
        </section>
      )}

      {/* Footer hint */}
      <div className="text-center pb-4 pt-8">
        <p className="text-xs text-[#9CA6B1]">
          Prozesse fehlen oder sind veraltet?{" "}
          <a
            href="mailto:sifo.medical@gmail.com"
            className="text-[#00A68B] hover:underline font-medium"
          >
            Feedback senden
          </a>
        </p>
      </div>
    </div>
  );
}
