import { notFound } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, CategoryId } from "@/types/process";
import { getProcessBySlug, getAllSlugs } from "@/data/processes";
import StepAccordion from "@/components/StepAccordion";
import MermaidDiagram from "@/components/MermaidDiagram";
import ProcessExporter from "@/components/ProcessExporter";
import AttachmentSection from "@/components/AttachmentSection";
import { ArrowLeft, Clock, User, Tag, ExternalLink, Target } from "lucide-react";

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

export default async function ProcessDetailPage({ params }: Props) {
  const { category, slug } = await params;
  const proc = getProcessBySlug(category as CategoryId, slug);
  if (!proc) notFound();

  const cat = CATEGORIES.find((c) => c.id === category);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back Navigation */}
      <Link
        href={`/${category}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3A6B] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Zurück zu {cat?.title || category}
      </Link>

      {/* Process Header */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="h-2 bg-gradient-to-r from-[#1B3A6B] to-[#0EA5E9]" />
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="text-4xl">{cat?.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cat?.bgColor} ${cat?.color} ${cat?.borderColor} border`}
                >
                  {cat?.title}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold">
                  ✓ Aktiv
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {proc.title}
              </h1>
              <p className="text-gray-500">{proc.subtitle}</p>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed mt-4">{proc.description}</p>

          {/* Actions */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
            <ProcessExporter process={proc} />
            {proc.processVideoUrl && (
              <a
                href={proc.processVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00A68B] hover:bg-[#008B72] text-white rounded-lg font-medium transition-colors"
              >
                <span>🎬</span>
                Video-Anleitung
              </a>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-gray-100 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-gray-400" />
              <strong className="text-gray-700">Owner:</strong> {proc.owner}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <strong className="text-gray-700">Frequenz:</strong> {proc.frequency}
            </span>
            <span className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-gray-400" />
              <strong className="text-gray-700">Aktualisiert:</strong>{" "}
              {new Date(proc.lastUpdated).toLocaleDateString("de-AT", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Flowchart */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">📊 Prozess-Diagramm</h2>
            </div>
            <div className="p-6">
              <MermaidDiagram chart={proc.mermaidDiagram} />
            </div>
          </div>

          {/* Steps */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                📋 Schritte ({proc.steps.length})
              </h2>
            </div>
            <div className="p-6">
              <StepAccordion steps={proc.steps} />
            </div>
          </div>

          {/* Attachments */}
          <AttachmentSection processId={proc.id} isAdmin={false} />
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Goals */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#1B3A6B]" />
              Ziele
            </h3>
            <ul className="space-y-2">
              {proc.goals.map((goal, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                  {goal}
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3">🛠️ Tools & Software</h3>
            <div className="space-y-2">
              {proc.tools.map((tool) => (
                <div key={tool.name} className="flex items-center gap-2">
                  {tool.url ? (
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-[#1B3A6B] hover:underline font-medium"
                    >
                      {tool.name}
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  ) : (
                    <span className="text-sm text-gray-700">{tool.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          {proc.tags.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3">🏷️ Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {proc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Edit Hint */}
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
            <p className="text-xs text-amber-700 leading-relaxed">
              <strong>Prozess veraltet oder unvollständig?</strong>
              <br />
              Schreib Simon eine kurze Nachricht – er aktualisiert ihn.{" "}
              <a
                href="mailto:sifo.medical@gmail.com"
                className="underline hover:no-underline"
              >
                sifo.medical@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return getAllSlugs().map((s) => ({ category: s.category, slug: s.slug }));
}
