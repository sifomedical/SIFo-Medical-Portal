import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Category } from "@/types/process";

interface Props {
  category: Category;
  processCount: number;
}

export default function CategoryCard({ category, processCount }: Props) {
  return (
    <Link
      href={`/${category.id}`}
      className={`group relative flex flex-col p-6 rounded-2xl border-2 ${category.bgColor} ${category.borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-3xl">{category.icon}</span>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${category.bgColor} ${category.color} border ${category.borderColor}`}
        >
          {processCount} {processCount === 1 ? "Prozess" : "Prozesse"}
        </span>
      </div>

      <h3 className={`text-lg font-semibold text-[#0C2340] mb-2 ${category.color}`}>
        {category.title}
      </h3>
      <p className="text-sm text-[#6A7A8B] leading-relaxed flex-1">
        {category.description}
      </p>

      <div
        className={`mt-4 flex items-center gap-1.5 text-sm font-semibold ${category.color} opacity-0 group-hover:opacity-100 transition-opacity`}
      >
        Prozesse ansehen
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>

      {/* Hover-Overlay */}
      <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-current transition-all duration-300 pointer-events-none" />
    </Link>
  );
}
