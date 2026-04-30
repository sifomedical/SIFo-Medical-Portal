import { getServerSession } from "next-auth/next";
import { CATEGORIES } from "@/types/process";
import { ALL_PROCESSES, getProcessesByCategory } from "@/data/processes";
import CategoryCard from "@/components/CategoryCard";
import ProcessCard from "@/components/ProcessCard";
import { BookOpen, Layers, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession();
  const firstName = session?.user?.name?.split(" ")[0] || "Team";

  const totalProcesses = ALL_PROCESSES.filter((p) => p.status === "active").length;
  const recentProcesses = [...ALL_PROCESSES]
    .filter((p) => p.status === "active")
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-[#0C2340] to-[#00A68B] rounded-2xl p-8 sm:p-12 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <p className="text-[#D2EDE7] text-sm font-light mb-2">
            Willkommen zurück, {firstName} 👋
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold mb-4">
            SIFo Medical
            <br />
            <span className="text-[#D2EDE7] font-light">Process Portal</span>
          </h1>
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
                <p className="text-3xl font-bold">
                  {CATEGORIES.filter((c) => getProcessesByCategory(c.id).length > 0).length}
                </p>
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
              processCount={getProcessesByCategory(category.id).length}
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
              <ProcessCard key={process.id} process={process} />
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
