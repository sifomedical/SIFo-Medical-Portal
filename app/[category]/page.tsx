import { notFound } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, CategoryId } from "@/types/process";
import { getProcessesByCategory } from "@/data/processes";
import ProcessCard from "@/components/ProcessCard";
import CategoryPageClient from "@/components/CategoryPageClient";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = CATEGORIES.find((c) => c.id === category);
  if (!cat) notFound();

  const processes = getProcessesByCategory(category as CategoryId);

  return (
    <div className="space-y-8">
      {/* Back + Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3A6B] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zum Dashboard
        </Link>

        <div
          className={`p-6 rounded-2xl border-2 ${cat.bgColor} ${cat.borderColor} flex items-center gap-4`}
        >
          <span className="text-4xl">{cat.icon}</span>
          <div>
            <h1 className={`text-2xl font-bold ${cat.color}`}>{cat.title}</h1>
            <p className="text-gray-600 text-sm mt-0.5">{cat.description}</p>
          </div>
          <div className="ml-auto">
            <span
              className={`text-2xl font-bold ${cat.color}`}
            >
              {processes.length}
            </span>
            <p className="text-xs text-gray-500 text-right">Prozesse</p>
          </div>
        </div>
      </div>

      {/* Client-side filtering */}
      <CategoryPageClient processes={processes} category={cat} />
    </div>
  );
}

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }));
}
