"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Search, X, ChevronRight } from "lucide-react";
import { Process, CategoryId, CATEGORIES } from "@/types/process";
import { searchProcesses, getMatchCountPerCategory } from "@/lib/searchProcesses";

interface SearchDropdownProps {
  processes: Process[];
  onClose?: () => void;
}

export default function SearchDropdown({ processes, onClose }: SearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "all">("all");
  const [results, setResults] = useState<Process[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [categoryCounts, setCategoryCounts] = useState<Record<CategoryId, number>>({
    marketing: 0,
    sales: 0,
    operations: 0,
    hr: 0,
    quality: 0,
    finance: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update results when query or category changes
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const searchResults = searchProcesses(query, processes, selectedCategory);
      setResults(searchResults);
      setCategoryCounts(getMatchCountPerCategory(query, processes));
      setSelectedResultIndex(-1);
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, selectedCategory, processes]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " ") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        setIsOpen(false);
        setQuery("");
        break;
      case "ArrowDown":
        e.preventDefault();
        setSelectedResultIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedResultIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedResultIndex >= 0) {
          // Navigation will happen via Link component
          setIsOpen(false);
          setQuery("");
        }
        break;
    }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleClearQuery = () => {
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleResultClick = () => {
    setQuery("");
    setIsOpen(false);
    onClose?.();
  };

  const handleCategoryChange = (category: CategoryId | "all") => {
    setSelectedCategory(category);
  };

  const truncateText = (text: string, maxLength: number = 60): string => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength).trim() + "...";
    }
    return text;
  };

  const getCategoryColor = (category: CategoryId) => {
    const cat = CATEGORIES.find((c) => c.id === category);
    return cat?.color || "text-gray-600";
  };

  const getCategoryBgColor = (category: CategoryId) => {
    const cat = CATEGORIES.find((c) => c.id === category);
    return cat?.bgColor || "bg-gray-50";
  };

  return (
    <div className="relative flex-1">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6A7A8B]">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder="Prozesse durchsuchen..."
          value={query}
          onChange={handleQueryChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          className="w-full pl-12 pr-10 py-2 border border-[#F5F6F7] rounded-lg text-sm text-[#0C2340] placeholder-[#9CA6B1] focus:outline-none focus:ring-2 focus:ring-[#00A68B] focus:border-transparent transition-all"
        />

        {query && (
          <button
            onClick={handleClearQuery}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#9CA6B1] hover:text-[#6A7A8B] transition-colors"
            title="Suche löschen"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 left-0 right-0 bg-white border border-[#F5F6F7] rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* Category Filter Buttons */}
          {query && (
            <div className="sticky top-0 bg-white border-b border-[#F5F6F7] px-4 py-3 flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange("all")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === "all"
                    ? "bg-[#00A68B] text-white"
                    : "bg-[#00A68B]/10 text-[#00A68B] border border-[#00A68B]/30 hover:border-[#00A68B]"
                }`}
              >
                Alle ({results.length})
              </button>

              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedCategory === cat.id
                      ? `${cat.bgColor} ${cat.color} border border-current`
                      : `${cat.bgColor} ${cat.color} border border-transparent hover:border-current`
                  }`}
                >
                  {cat.title} ({categoryCounts[cat.id]})
                </button>
              ))}
            </div>
          )}

          {/* Results List */}
          {results.length > 0 ? (
            <div className="py-2">
              {results.slice(0, 8).map((process, index) => (
                <Link
                  key={process.id}
                  href={`/${process.category}/${process.slug}`}
                  onClick={handleResultClick}
                  className={`block px-4 py-3 border-b border-[#F5F6F7] last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer ${
                    index === selectedResultIndex ? "bg-[#00A68B]/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[#0C2340] text-sm truncate">
                          {process.title}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${getCategoryBgColor(process.category)} ${getCategoryColor(process.category)}`}>
                          {CATEGORIES.find((c) => c.id === process.category)?.title}
                        </span>
                      </div>
                      <p className="text-xs text-[#6A7A8B] line-clamp-1">
                        {truncateText(process.description, 80)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#CDD3D8] flex-shrink-0 mt-0.5" />
                  </div>
                </Link>
              ))}

              {results.length > 8 && (
                <div className="px-4 py-2 text-xs text-[#9CA6B1] text-center">
                  +{results.length - 8} weitere Ergebnisse
                </div>
              )}
            </div>
          ) : query ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-[#6A7A8B] mb-1">Keine Prozesse gefunden</p>
              <p className="text-xs text-[#9CA6B1]">
                für "{query}"
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
