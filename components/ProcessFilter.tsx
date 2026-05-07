'use client'

import { useState, useEffect } from 'react'
import { Filter, X } from 'lucide-react'

export interface FilterState {
  tags: string[]
  owner: string
  status: string
}

interface ProcessFilterProps {
  availableTags: string[]
  availableOwners: string[]
  onFilterChange: (filters: FilterState) => void
  initialFilters?: FilterState
}

export default function ProcessFilter({
  availableTags,
  availableOwners,
  onFilterChange,
  initialFilters = { tags: [], owner: '', status: '' },
}: ProcessFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [activeFilterCount, setActiveFilterCount] = useState(0)

  // Update active filter count
  useEffect(() => {
    const count = [
      filters.tags.length > 0,
      filters.owner !== '',
      filters.status !== '',
    ].filter(Boolean).length

    setActiveFilterCount(count)
  }, [filters])

  // Notify parent of filter changes
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag]

    handleFilterChange({ ...filters, tags: newTags })
  }

  const handleOwnerChange = (owner: string) => {
    handleFilterChange({ ...filters, owner: filters.owner === owner ? '' : owner })
  }

  const handleStatusChange = (status: string) => {
    handleFilterChange({ ...filters, status: filters.status === status ? '' : status })
  }

  const resetFilters = () => {
    handleFilterChange({ tags: [], owner: '', status: '' })
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium transition-colors ${
          activeFilterCount > 0
            ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Filter className="w-4 h-4" />
        Filter
        {activeFilterCount > 0 && (
          <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-12 left-0 z-50 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Filter</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Zurücksetzen
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="space-y-2">
              {['active', 'draft', 'archived'].map((status) => (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.status === status}
                    onChange={() => handleStatusChange(status)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {status === 'active'
                      ? 'Aktiv'
                      : status === 'draft'
                        ? 'Entwurf'
                        : 'Archiviert'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Owner Filter */}
          {availableOwners.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableOwners.map((owner) => (
                  <label key={owner} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.owner === owner}
                      onChange={() => handleOwnerChange(owner)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 truncate">{owner}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      filters.tags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Close */}
          <div className="border-t border-gray-100 pt-3 flex gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Fertig
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
