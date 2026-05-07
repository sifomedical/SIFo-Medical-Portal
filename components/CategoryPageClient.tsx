'use client'

import { useMemo, useState } from 'react'
import { Process } from '@/types/process'
import ProcessCard from '@/components/ProcessCard'
import ProcessFilter, { FilterState } from '@/components/ProcessFilter'

interface CategoryPageClientProps {
  processes: Process[]
  category: {
    id: string
    title: string
    icon: string
    color: string
    borderColor: string
    bgColor: string
  }
  userEmail?: string | null
  adminEmail?: string | null
}

export default function CategoryPageClient({
  processes,
  category,
  userEmail,
  adminEmail,
}: CategoryPageClientProps) {
  const [filters, setFilters] = useState<FilterState>({
    tags: [],
    owner: '',
    status: '',
  })

  // Extract available tags and owners
  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    processes.forEach((p) => {
      p.tags?.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [processes])

  const availableOwners = useMemo(() => {
    const owners = new Set<string>()
    processes.forEach((p) => {
      if (p.owner) owners.add(p.owner)
    })
    return Array.from(owners).sort()
  }, [processes])

  // Filter processes
  const filteredProcesses = useMemo(() => {
    return processes.filter((process) => {
      // Tag filter (OR - if any tag matches)
      if (filters.tags.length > 0) {
        const hasTag = filters.tags.some((tag) => process.tags?.includes(tag))
        if (!hasTag) return false
      }

      // Owner filter
      if (filters.owner && process.owner !== filters.owner) {
        return false
      }

      // Status filter
      if (filters.status && process.status !== filters.status) {
        return false
      }

      return true
    })
  }, [processes, filters])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex items-center justify-between">
        <ProcessFilter
          availableTags={availableTags}
          availableOwners={availableOwners}
          onFilterChange={handleFilterChange}
        />
        <div className="text-sm text-gray-600">
          {filteredProcesses.length} von {processes.length} Prozesse
        </div>
      </div>

      {/* Processes Grid */}
      {filteredProcesses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProcesses.map((process) => (
            <ProcessCard key={process.id} process={process} userEmail={userEmail} adminEmail={adminEmail} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <span className="text-5xl mb-4 block">🔍</span>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Keine Prozesse gefunden
          </h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Versuche unterschiedliche Filter, um Prozesse zu finden.
          </p>
        </div>
      )}
    </div>
  )
}
