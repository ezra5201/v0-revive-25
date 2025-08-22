"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Download,
  Utensils,
  ChevronDown,
  X,
  UserPlus,
  Calendar,
  CalendarDays,
  SlidersHorizontal,
  List,
  BarChart3,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface Client {
  name: string
}

interface ActionBarProps {
  activeTab: "today" | "all" | "client"
  selectedCount: number
  selectedContactIds?: number[]
  onExport?: () => void
  clients?: Client[]
  onClientSelect?: (clientName: string) => void
  onNewProspect?: (searchedName?: string) => void
  providers?: string[]
  categories?: string[]
  onFiltersChange?: (filters: { categories: string[]; providers: string[] }) => void
  onServiceCompleted?: () => void
  onDateChangeClick?: () => void
  currentView?: "list" | "visual"
  onViewChange?: (view: "list" | "visual") => void
}

// Helper function to properly capitalize names
function capitalizeFullName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (word.length === 0) return word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(" ")
}

export function ActionBar({
  activeTab,
  selectedCount,
  selectedContactIds = [],
  onExport,
  clients = [],
  onClientSelect,
  onNewProspect,
  providers = [],
  categories = [],
  onFiltersChange,
  onServiceCompleted,
  onDateChangeClick,
  currentView = "list",
  onViewChange,
}: ActionBarProps) {
  const [searchValue, setSearchValue] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showNewProspectButton, setShowNewProspectButton] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showProviderDropdown, setShowProviderDropdown] = useState(false)
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const categoryDropdownRef = useRef<HTMLDivElement>(null)
  const providerDropdownRef = useRef<HTMLDivElement>(null)
  const dateFilterRef = useRef<HTMLDivElement>(null)

  // Food service completion state
  const [isCompletingFood, setIsCompletingFood] = useState(false)

  // Update filtered clients when search value changes
  useEffect(() => {
    if (searchValue.trim()) {
      const filtered = clients.filter((client) => client.name.toLowerCase().includes(searchValue.toLowerCase()))
      setFilteredClients(filtered)
      setShowSuggestions(filtered.length > 0)
      setSelectedIndex(-1)

      // For Today's tab, show New Prospect button only if no matches found
      if (activeTab === "today") {
        setShowNewProspectButton(filtered.length === 0)
      }
    } else {
      setFilteredClients([])
      setShowSuggestions(false)
      setSelectedIndex(-1)
      setShowNewProspectButton(false)
    }
  }, [searchValue, clients, activeTab])

  // Notify parent of filter changes
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({ categories: selectedCategories, providers: selectedProviders })
    }
  }, [selectedCategories, selectedProviders])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }, [])

  const handleClientSelect = useCallback(
    (clientName: string) => {
      setSearchValue("")
      setShowSuggestions(false)
      setSelectedIndex(-1)
      setShowNewProspectButton(false)
      if (onClientSelect) {
        onClientSelect(clientName)
      }
    },
    [onClientSelect],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showSuggestions) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => (prev < filteredClients.length - 1 ? prev + 1 : prev))
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
          break
        case "Enter":
          e.preventDefault()
          if (selectedIndex >= 0 && filteredClients[selectedIndex]) {
            handleClientSelect(filteredClients[selectedIndex].name)
          }
          break
        case "Escape":
          setShowSuggestions(false)
          setSelectedIndex(-1)
          if (searchRef.current) {
            searchRef.current.blur()
          }
          break
      }
    },
    [showSuggestions, filteredClients, selectedIndex, handleClientSelect],
  )

  const handleInputFocus = useCallback(() => {
    if (searchValue.trim() && filteredClients.length > 0) {
      setShowSuggestions(true)
    }
  }, [searchValue, filteredClients])

  const handleInputBlur = useCallback((e: React.FocusEvent) => {
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }, 150)
  }, [])

  const handleCategoryChange = useCallback((category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, category])
    } else {
      setSelectedCategories((prev) => prev.filter((c) => c !== category))
    }
  }, [])

  const handleProviderChange = useCallback((provider: string, checked: boolean) => {
    if (checked) {
      setSelectedProviders((prev) => [...prev, provider])
    } else {
      setSelectedProviders((prev) => prev.filter((p) => p !== provider))
    }
  }, [])

  const clearAllFilters = useCallback(() => {
    setSelectedCategories([])
    setSelectedProviders([])
  }, [])

  const removeFilter = useCallback((type: "category" | "provider", value: string) => {
    if (type === "category") {
      setSelectedCategories((prev) => prev.filter((c) => c !== value))
    } else {
      setSelectedProviders((prev) => prev.filter((p) => p !== value))
    }
  }, [])

  const handleFoodCompletion = useCallback(async () => {
    if (selectedContactIds.length === 0) return

    setIsCompletingFood(true)

    try {
      const response = await fetch("/api/complete-service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactIds: selectedContactIds,
          serviceName: "Food",
          providerName: "Andrea Leflore", // TODO: Get from current user context
        }),
      })

      const result = await response.json()

      if (response.ok) {
        console.log("Food service completed:", result)
        onServiceCompleted?.()
      } else {
        console.error("Food service completion failed:", result.error)
      }
    } catch (error) {
      console.error("Food service completion failed:", error)
    } finally {
      setIsCompletingFood(false)
    }
  }, [selectedContactIds, onServiceCompleted])

  const handleNewProspectClick = useCallback(() => {
    const currentSearchValue = searchValue.trim()
    const capitalizedName = currentSearchValue ? capitalizeFullName(currentSearchValue) : ""
    setSearchValue("")
    setShowSuggestions(false)
    setShowNewProspectButton(false)
    onNewProspect?.(capitalizedName)
  }, [onNewProspect, searchValue])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false)
      }
      if (providerDropdownRef.current && !providerDropdownRef.current.contains(event.target as Node)) {
        setShowProviderDropdown(false)
      }
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
        setShowDateFilter(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const activeFiltersCount = selectedCategories.length + selectedProviders.length

  // Mobile Filter Sheet Content
  const MobileFiltersContent = () => (
    <div className="space-y-6">
      {/* Date Filter */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Date Range</h3>
        <div className="space-y-2">
          <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 rounded-lg border">Last 7 days</button>
          <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 rounded-lg border">
            Last 30 days
          </button>
          <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 rounded-lg border">
            Last 3 months
          </button>
          <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 rounded-lg border">Last year</button>
          <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 rounded-lg border">
            Custom range...
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Category</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-3 py-1">
              <Checkbox
                id={`mobile-category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                className="h-5 w-5"
              />
              <label htmlFor={`mobile-category-${category}`} className="text-sm cursor-pointer flex-1">
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Provider Filter */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Provider</h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {providers.map((provider) => (
            <div key={provider} className="flex items-center space-x-3 py-1">
              <Checkbox
                id={`mobile-provider-${provider}`}
                checked={selectedProviders.includes(provider)}
                onCheckedChange={(checked) => handleProviderChange(provider, checked as boolean)}
                className="h-5 w-5"
              />
              <label htmlFor={`mobile-provider-${provider}`} className="text-sm cursor-pointer flex-1">
                {provider}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button variant="outline" onClick={clearAllFilters} className="w-full bg-transparent">
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
      <div className="flex flex-col gap-4">
        {/* Main action bar */}
        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
          {/* Left side - Client Search */}
          <div className="flex items-center space-x-3 flex-1 lg:flex-none lg:w-auto">
            {/* Client Search with Type-ahead */}
            <div className="relative flex-1 lg:w-64">
              <Input
                ref={searchRef}
                type="text"
                placeholder={activeTab === "today" ? "Search to check in..." : "Client Search"}
                value={searchValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="w-full h-10 text-sm border-gray-300"
                autoComplete="off"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-50"
                >
                  {filteredClients.map((client, index) => (
                    <button
                      key={client.name}
                      className={`w-full px-3 py-3 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                        index === selectedIndex ? "bg-gray-100" : ""
                      }`}
                      onClick={() => handleClientSelect(client.name)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      {client.name}
                    </button>
                  ))}

                  {/* New Prospect option for Today's workflow - only when no matches */}
                  {activeTab === "today" && searchValue.trim() && filteredClients.length === 0 && (
                    <button
                      className="w-full px-3 py-3 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-t border-gray-100"
                      onClick={handleNewProspectClick}
                    >
                      <div className="flex items-center space-x-2 text-blue-600">
                        <UserPlus className="h-4 w-4" />
                        <span>Create new prospect: "{capitalizeFullName(searchValue)}"</span>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>

            {activeTab === "client" && onViewChange && (
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => onViewChange("list")}
                  className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    currentView === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <List className="h-4 w-4 mr-1.5" />
                  List View
                </button>
                <button
                  onClick={() => onViewChange("visual")}
                  className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    currentView === "visual" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <BarChart3 className="h-4 w-4 mr-1.5" />
                  Visual View
                </button>
              </div>
            )}

            {/* New Prospect Button - Only show when search has no matches for Today's workflow */}
            {activeTab === "today" && showNewProspectButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewProspectClick}
                className="hidden sm:flex bg-transparent"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                New Prospect
              </Button>
            )}

            {/* Context info - what this tab is for */}
            {selectedCount > 0 && (
              <span className="text-sm text-gray-700 hidden sm:block">{selectedCount} selected</span>
            )}
          </div>

          {/* Right side - Actions and filters */}
          <div className="flex items-center justify-between lg:justify-end space-x-2 lg:space-x-3">
            {/* Mobile selection count */}
            {selectedCount > 0 && <span className="text-sm text-gray-700 sm:hidden">{selectedCount} selected</span>}

            {/* Selection-based actions */}
            {selectedCount > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFoodCompletion}
                  disabled={isCompletingFood}
                  className="h-9 bg-transparent"
                >
                  {isCompletingFood ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                      <span className="hidden sm:inline">Completing...</span>
                    </>
                  ) : (
                    <>
                      <Utensils className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Food</span>
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={onDateChangeClick} className="h-9 bg-transparent">
                  <CalendarDays className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Change Date</span>
                </Button>
              </div>
            )}

            {/* Desktop Filters - Only for All Contacts workflow */}
            {activeTab === "all" && (
              <div className="hidden lg:flex items-center space-x-3">
                {/* Date Filter */}
                <div className="relative" ref={dateFilterRef}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDateFilter(!showDateFilter)}
                    className="h-9 text-sm"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Date Range
                    <ChevronDown className="ml-2 h-3 w-3" />
                  </Button>

                  {showDateFilter && (
                    <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[200px] z-50">
                      <div className="p-3 space-y-2">
                        <button className="w-full text-left px-2 py-2 text-sm hover:bg-gray-50 rounded">
                          Last 7 days
                        </button>
                        <button className="w-full text-left px-2 py-2 text-sm hover:bg-gray-50 rounded">
                          Last 30 days
                        </button>
                        <button className="w-full text-left px-2 py-2 text-sm hover:bg-gray-50 rounded">
                          Last 3 months
                        </button>
                        <button className="w-full text-left px-2 py-2 text-sm hover:bg-gray-50 rounded">
                          Last year
                        </button>
                        <hr className="my-2" />
                        <button className="w-full text-left px-2 py-2 text-sm hover:bg-gray-50 rounded">
                          Custom range...
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Category Filter */}
                <div className="relative" ref={categoryDropdownRef}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="h-9 text-sm"
                  >
                    Category
                    {selectedCategories.length > 0 && (
                      <span className="ml-1 bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-0.5">
                        {selectedCategories.length}
                      </span>
                    )}
                    <ChevronDown className="ml-2 h-3 w-3" />
                  </Button>

                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[150px] z-50">
                      <div className="p-2">
                        {categories.map((category) => (
                          <div key={category} className="flex items-center space-x-2 py-2">
                            <Checkbox
                              id={`category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                            />
                            <label htmlFor={`category-${category}`} className="text-sm cursor-pointer flex-1">
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Provider Filter */}
                <div className="relative" ref={providerDropdownRef}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                    className="h-9 text-sm"
                  >
                    Provider
                    {selectedProviders.length > 0 && (
                      <span className="ml-1 bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-0.5">
                        {selectedProviders.length}
                      </span>
                    )}
                    <ChevronDown className="ml-2 h-3 w-3" />
                  </Button>

                  {showProviderDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[200px] max-h-60 overflow-y-auto z-50">
                      <div className="p-2">
                        {providers.map((provider) => (
                          <div key={provider} className="flex items-center space-x-2 py-2">
                            <Checkbox
                              id={`provider-${provider}`}
                              checked={selectedProviders.includes(provider)}
                              onCheckedChange={(checked) => handleProviderChange(provider, checked as boolean)}
                            />
                            <label htmlFor={`provider-${provider}`} className="text-sm cursor-pointer flex-1">
                              {provider}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Filters Button - Only for All Contacts workflow */}
            {activeTab === "all" && (
              <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden h-9 bg-transparent">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="ml-1 bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-0.5">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 overflow-y-auto">
                    <MobileFiltersContent />
                  </div>
                </SheetContent>
              </Sheet>
            )}

            <Button variant="outline" size="sm" onClick={onExport} className="h-9 bg-transparent">
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Active Filters Row - Only for All Contacts workflow */}
        {activeTab === "all" && activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>

            {selectedCategories.map((category) => (
              <div
                key={`category-${category}`}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs rounded-full px-3 py-1"
              >
                <span>Category: {category}</span>
                <button
                  onClick={() => removeFilter("category", category)}
                  className="hover:bg-blue-200 rounded-full p-0.5 ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {selectedProviders.map((provider) => (
              <div
                key={`provider-${provider}`}
                className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs rounded-full px-3 py-1"
              >
                <span>Provider: {provider}</span>
                <button
                  onClick={() => removeFilter("provider", provider)}
                  className="hover:bg-green-200 rounded-full p-0.5 ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs h-7 px-2">
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
