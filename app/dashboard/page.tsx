import { auth } from "@/auth";
import { CATEGORIES } from "@/types/process";
import { ALL_PROCESSES, getProcessesByCategory } from "@/data/processes";
import CategoryCard from "@/components/CategoryCard";
import ProcessCard from "@/components/ProcessCard";
import { BookOpen, Layers, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] || "Team";

  const totalProcesses = ALL_PROCESSES.filter((p) => p.status === "active").length;
  const recentProcesses = [...ALL_PROCESSES]
    .filter((p) => p.status === "active")
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-[#1B3A6B] to-[#2C4F8C] rounded-3xl p-8 sm:p-10 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 right-32 w-64 h-64 bg-white/5 rounded-full" />

        <div className="relative">
          <p className="text-blue-200 text-sm font-medium mb-1">
            Willkommen zurück, {firstName} 👋
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            SIFo Medical
            <br />
            <span className="text-blue-200">Process Portal</span>
          </h1>
          <p className="text-blue-100 max-w-xl text-sm sm:text-base leading-relaxed">
            Alle Unternehmens-Prozesse an einem Ort – übersichtlich dokumentiert,
            grafisch dargestellt und jederzeit abrufbar.
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalProcesses}</p>
                <p className="text-xs text-blue-200">Prozesse</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {CATEGORIES.filter((c) => getProcessesByCategory(c.id).length > 0).length}
                </p>
                <p className="text-xs text-blue-200">Bereiche</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">Live</p>
                <p className="text-xs text-blue-200">Status</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Bereiche</h2>
          <span className="text-sm text-gray-500">
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
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">
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
      <div className="text-center pb-4">
        <p className="text-xs text-gray-400">
          Prozesse fehlen oder sind veraltet?{" "}
          <a
            href="mailto:sifo.medical@gmail.com"
            className="text-[#1B3A6B] hover:underline"
          >
            Feedback senden
          </a>
        </p>
      </div>
    </div>
  );
}
