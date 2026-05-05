import { Process, CategoryId } from "@/types/process";

interface SearchResult extends Process {
  _relevanceScore: number;
}

/**
 * Recursively searches through all text fields in a process for a query term
 * Returns a relevance score (higher = better match)
 */
function calculateRelevanceScore(
  process: Process,
  query: string
): number {
  let score = 0;
  const lowerQuery = query.toLowerCase();

  // Helper to check if text matches and assign points
  const checkAndScore = (text: string | undefined, points: number): boolean => {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    if (lowerText.includes(lowerQuery)) {
      score += points;
      // Bonus if it's at the beginning or exact match
      if (lowerText.startsWith(lowerQuery)) score += 5;
      if (lowerText === lowerQuery) score += 10;
      return true;
    }
    return false;
  };

  // Title (highest priority - 100 points)
  checkAndScore(process.title, 100);

  // Subtitle (80 points)
  checkAndScore(process.subtitle, 80);

  // Description (60 points)
  checkAndScore(process.description, 60);

  // Owner (50 points)
  checkAndScore(process.owner, 50);

  // Tags (40 points each)
  if (process.tags) {
    process.tags.forEach((tag) => {
      checkAndScore(tag, 40);
    });
  }

  // Goals (35 points each)
  if (process.goals) {
    process.goals.forEach((goal) => {
      checkAndScore(goal, 35);
    });
  }

  // Tools (30 points each)
  if (process.tools) {
    process.tools.forEach((tool) => {
      checkAndScore(tool.name, 30);
    });
  }

  // Steps and substeps (25 points for title, 20 for description)
  const searchSteps = (steps: typeof process.steps): void => {
    steps.forEach((step) => {
      checkAndScore(step.title, 25);
      checkAndScore(step.description, 20);

      // Recursively search substeps
      if (step.substeps && step.substeps.length > 0) {
        searchSteps(step.substeps);
      }
    });
  };

  if (process.steps) {
    searchSteps(process.steps);
  }

  return score;
}

/**
 * Searches through all processes based on query and optional category filter
 * Returns results sorted by relevance score
 */
export function searchProcesses(
  query: string,
  processes: Process[],
  category?: CategoryId | "all" | null
): Process[] {
  if (!query || query.trim() === "") {
    // If no query, return all processes (or filtered by category)
    if (category && category !== "all") {
      return processes.filter((p) => p.category === category);
    }
    return processes;
  }

  // Calculate relevance scores for all processes
  const resultsWithScores: SearchResult[] = processes
    .map((process) => ({
      ...process,
      _relevanceScore: calculateRelevanceScore(process, query),
    }))
    .filter((p) => p._relevanceScore > 0); // Only include matches

  // Filter by category if specified
  let filtered = resultsWithScores;
  if (category && category !== "all") {
    filtered = resultsWithScores.filter((p) => p.category === category);
  }

  // Sort by relevance score (descending), then alphabetically by title
  return filtered.sort((a, b) => {
    if (b._relevanceScore !== a._relevanceScore) {
      return b._relevanceScore - a._relevanceScore;
    }
    return a.title.localeCompare(b.title);
  });
}

/**
 * Get count of matching processes per category
 */
export function getMatchCountPerCategory(
  query: string,
  processes: Process[]
): Record<CategoryId, number> {
  const counts: Record<CategoryId, number> = {
    marketing: 0,
    sales: 0,
    operations: 0,
    hr: 0,
    quality: 0,
    finance: 0,
  };

  if (!query || query.trim() === "") {
    // Count all processes per category
    processes.forEach((p) => {
      counts[p.category]++;
    });
    return counts;
  }

  // Count matching processes per category
  processes.forEach((process) => {
    if (calculateRelevanceScore(process, query) > 0) {
      counts[process.category]++;
    }
  });

  return counts;
}
