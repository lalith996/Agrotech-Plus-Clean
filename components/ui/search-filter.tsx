'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { Popover as PopoverModule } from "@radix-ui/react-popover"
import { DayPicker } from "react-day-picker"
import {
  Search,
  Filter,
  X,
  Save,
  Bookmark,
  Calendar as CalendarIcon,
  SlidersHorizontal,
  RotateCcw,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
// Define interfaces locally to avoid import issues
interface SearchOptions {
  query?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface FilterConfig {
  field: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'boolean' | 'range' | 'date';
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
}

interface SearchFacets {
  categories?: Array<{ value: string; count: number }>;
  locations?: Array<{ value: string; count: number }>;
  priceRanges?: Array<{ range: string; min: number; max: number; count: number }>;
  farmers?: Array<{ id: string; name: string; count: number }>;
}

// Mock SavedSearchManager for now
class SavedSearchManager {
  static getSavedSearches(userId: string): Record<string, any> {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem(`savedSearches_${userId}`);
    return saved ? JSON.parse(saved) : {};
  }

  static saveSearch(name: string, options: SearchOptions, userId: string): void {
    if (typeof window === 'undefined') return;
    const saved = this.getSavedSearches(userId);
    saved[name] = options;
    localStorage.setItem(`savedSearches_${userId}`, JSON.stringify(saved));
  }

  static loadSavedSearch(name: string, userId: string): SearchOptions | null {
    const saved = this.getSavedSearches(userId);
    return saved[name] || null;
  }

  static deleteSavedSearch(name: string, userId: string): void {
    if (typeof window === 'undefined') return;
    const saved = this.getSavedSearches(userId);
    delete saved[name];
    localStorage.setItem(`savedSearches_${userId}`, JSON.stringify(saved));
  }
}
import { format } from 'date-fns'

// Inline component definitions to avoid import issues
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))

const Popover = PopoverModule
const PopoverTrigger = PopoverModule.Trigger
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverModule.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverModule.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverModule.Portal>
    <PopoverModule.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverModule.Portal>
))

const Calendar = ({ className, classNames, showOutsideDays = true, ...props }: React.ComponentProps<typeof DayPicker>) => {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative",
        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}

const Badge = ({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "destructive" | "outline" }) => {
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

interface SearchFilterProps {
  searchOptions: SearchOptions
  onSearchChange: (options: SearchOptions) => void
  filterConfigs: FilterConfig[]
  facets?: SearchFacets
  placeholder?: string
  showSaveSearch?: boolean
  showFacets?: boolean
  userId?: string
  className?: string
}

export function SearchFilter({
  searchOptions,
  onSearchChange,
  filterConfigs,
  facets,
  placeholder = "Search...",
  showSaveSearch = false,
  showFacets = false,
  userId,
  className
}: SearchFilterProps) {
  const [localQuery, setLocalQuery] = useState(searchOptions.query || '')
  const [localFilters, setLocalFilters] = useState(searchOptions.filters || {})
  const [showFilters, setShowFilters] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [savedSearchName, setSavedSearchName] = useState('')
  const [savedSearches, setSavedSearches] = useState<Record<string, any>>({})

  useEffect(() => {
    if (showSaveSearch && userId) {
      setSavedSearches(SavedSearchManager.getSavedSearches(userId))
    }
  }, [showSaveSearch, userId])

  const handleQueryChange = useCallback((query: string) => {
    setLocalQuery(query)
    onSearchChange({ ...searchOptions, query, page: 1 })
  }, [searchOptions, onSearchChange])

  const handleFilterChange = useCallback((field: string, value: any) => {
    const newFilters = { ...localFilters, [field]: value }
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[field]
    }
    setLocalFilters(newFilters)
    onSearchChange({ ...searchOptions, filters: newFilters, page: 1 })
  }, [localFilters, searchOptions, onSearchChange])

  const handleSortChange = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    onSearchChange({ ...searchOptions, sortBy, sortOrder, page: 1 })
  }, [searchOptions, onSearchChange])

  const clearAllFilters = useCallback(() => {
    setLocalQuery('')
    setLocalFilters({})
    onSearchChange({
      ...searchOptions,
      query: '',
      filters: {},
      sortBy: undefined,
      sortOrder: undefined,
      page: 1
    })
  }, [searchOptions, onSearchChange])

  const saveCurrentSearch = useCallback(() => {
    if (!userId || !savedSearchName.trim()) return

    SavedSearchManager.saveSearch(savedSearchName, searchOptions, userId)
    setSavedSearches(SavedSearchManager.getSavedSearches(userId))
    setSaveDialogOpen(false)
    setSavedSearchName('')
  }, [userId, savedSearchName, searchOptions])

  const loadSavedSearch = useCallback((name: string) => {
    if (!userId) return

    const savedSearch = SavedSearchManager.loadSavedSearch(name, userId)
    if (savedSearch) {
      setLocalQuery(savedSearch.query || '')
      setLocalFilters(savedSearch.filters || {})
      onSearchChange(savedSearch)
    }
  }, [userId, onSearchChange])

  const deleteSavedSearch = useCallback((name: string) => {
    if (!userId) return

    SavedSearchManager.deleteSavedSearch(name, userId)
    setSavedSearches(SavedSearchManager.getSavedSearches(userId))
  }, [userId])

  const getActiveFilterCount = () => {
    return Object.keys(localFilters).filter(key => {
      const value = localFilters[key]
      return value !== undefined && value !== null && value !== '' &&
        (!Array.isArray(value) || value.length > 0)
    }).length
  }

  const renderFilterInput = (config: FilterConfig) => {
    const value = localFilters[config.field]

    switch (config.type) {
      case 'text':
        return (
          <Input
            placeholder={`Filter by ${config.label.toLowerCase()}...`}
            value={value || ''}
            onChange={(e) => handleFilterChange(config.field, e.target.value)}
          />
        )

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(newValue) => handleFilterChange(config.field, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${config.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All {config.label}</SelectItem>
              {config.options?.map((option: { value: string; label: string }) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2">
            {config.options?.map((option: { value: string; label: string }) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${config.field}-${option.value}`}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={(checked: boolean) => {
                    const newValues = checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter(v => v !== option.value)
                    handleFilterChange(config.field, newValues)
                  }}
                />
                <Label htmlFor={`${config.field}-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={config.field}
              checked={Boolean(value)}
              onCheckedChange={(checked: boolean) => handleFilterChange(config.field, checked)}
            />
            <Label htmlFor={config.field} className="text-sm">
              {config.label}
            </Label>
          </div>
        )

      case 'range':
        const rangeValue = (value as { min: number; max: number }) || { min: config.min || 0, max: config.max || 100 }
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label className="text-sm">Min:</Label>
              <Input
                type="number"
                value={rangeValue.min}
                onChange={(e) => handleFilterChange(config.field, {
                  ...rangeValue,
                  min: Number(e.target.value)
                })}
                className="w-20"
              />
              <Label className="text-sm">Max:</Label>
              <Input
                type="number"
                value={rangeValue.max}
                onChange={(e) => handleFilterChange(config.field, {
                  ...rangeValue,
                  max: Number(e.target.value)
                })}
                className="w-20"
              />
            </div>
            <Slider
              value={[rangeValue.min, rangeValue.max]}
              onValueChange={([min, max]: number[]) => handleFilterChange(config.field, { min, max })}
              min={config.min || 0}
              max={config.max || 100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{config.min || 0}</span>
              <span>{config.max || 100}</span>
            </div>
          </div>
        )

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : `Select ${config.label.toLowerCase()}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date: Date | undefined) => handleFilterChange(config.field, date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )

      default:
        return null
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={placeholder}
            value={localQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="ml-1">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>

        {(localQuery || getActiveFilterCount() > 0) && (
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear</span>
          </Button>
        )}

        {showSaveSearch && userId && (
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Search</DialogTitle>
                <DialogDescription>
                  Save your current search and filters for quick access later
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="searchName">Search Name</Label>
                  <Input
                    id="searchName"
                    value={savedSearchName}
                    onChange={(e) => setSavedSearchName(e.target.value)}
                    placeholder="Enter a name for this search..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveCurrentSearch} disabled={!savedSearchName.trim()}>
                    Save Search
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Saved Searches */}
      {showSaveSearch && userId && Object.keys(savedSearches).length > 0 && (
        <div className="flex items-center space-x-2">
          <Bookmark className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">Saved:</span>
          <div className="flex flex-wrap gap-2">
            {Object.keys(savedSearches).map((name) => (
              <Badge
                key={name}
                variant="outline"
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => loadSavedSearch(name)}
              >
                {name}
                <X
                  className="w-3 h-3 ml-1 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteSavedSearch(name)
                  }}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(localFilters).map(([field, value]) => {
              if (value === undefined || value === null || value === '' ||
                (Array.isArray(value) && value.length === 0)) return null

              const config = filterConfigs.find(c => c.field === field)
              const label = config?.label || field

              let displayValue = String(value)
              if (Array.isArray(value)) {
                displayValue = value.join(', ')
              } else if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
                displayValue = `${value.min} - ${value.max}`
              }

              return (
                <Badge
                  key={field}
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-200"
                >
                  {label}: {displayValue}
                  <X
                    className="w-3 h-3 ml-1 hover:text-red-600"
                    onClick={() => handleFilterChange(field, undefined)}
                  />
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Refine your search results with advanced filters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Faceted Filters */}
              {showFacets && facets && (
                <>
                  {/* Categories Facet */}
                  {facets.categories && facets.categories.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Categories</Label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {facets.categories.map((category: { value: string; count: number }) => (
                          <div key={category.value} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`category-${category.value}`}
                                checked={localFilters.category === category.value}
                                onCheckedChange={(checked: boolean) => {
                                  handleFilterChange('category', checked ? category.value : undefined)
                                }}
                              />
                              <Label htmlFor={`category-${category.value}`} className="text-sm">
                                {category.value}
                              </Label>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {category.count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Locations Facet */}
                  {facets.locations && facets.locations.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Locations</Label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {facets.locations.map((location: { value: string; count: number }) => (
                          <div key={location.value} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`location-${location.value}`}
                                checked={localFilters.location === location.value}
                                onCheckedChange={(checked: boolean) => {
                                  handleFilterChange('location', checked ? location.value : undefined)
                                }}
                              />
                              <Label htmlFor={`location-${location.value}`} className="text-sm">
                                {location.value}
                              </Label>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {location.count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Ranges Facet */}
                  {facets.priceRanges && facets.priceRanges.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Price Ranges</Label>
                      <div className="space-y-2">
                        {facets.priceRanges.map((priceRange: { range: string; min: number; max: number; count: number }) => (
                          <div key={priceRange.range} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`price-${priceRange.range}`}
                                checked={
                                  localFilters.priceRange?.min === priceRange.min &&
                                  localFilters.priceRange?.max === priceRange.max
                                }
                                onCheckedChange={(checked: boolean) => {
                                  handleFilterChange('priceRange', checked ? {
                                    min: priceRange.min,
                                    max: priceRange.max
                                  } : undefined)
                                }}
                              />
                              <Label htmlFor={`price-${priceRange.range}`} className="text-sm">
                                ${priceRange.min} - ${priceRange.max}
                              </Label>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {priceRange.count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Farmers Facet */}
                  {facets.farmers && facets.farmers.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Farmers</Label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {facets.farmers.map((farmer: { id: string; name: string; count: number }) => (
                          <div key={farmer.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`farmer-${farmer.id}`}
                                checked={localFilters.farmerId === farmer.id}
                                onCheckedChange={(checked: boolean) => {
                                  handleFilterChange('farmerId', checked ? farmer.id : undefined)
                                }}
                              />
                              <Label htmlFor={`farmer-${farmer.id}`} className="text-sm">
                                {farmer.name}
                              </Label>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {farmer.count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Custom Filter Configs */}
              {filterConfigs.map((config) => (
                <div key={config.field} className="space-y-2">
                  <Label className="text-sm font-medium">{config.label}</Label>
                  {renderFilterInput(config)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sort Options */}
      <div className="flex items-center space-x-4">
        <Label className="text-sm">Sort by:</Label>
        <Select
          value={searchOptions.sortBy || ''}
          onValueChange={(value) => handleSortChange(value, searchOptions.sortOrder || 'asc')}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select sort field" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Default</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="createdAt">Date Created</SelectItem>
            <SelectItem value="updatedAt">Date Modified</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>

        {searchOptions.sortBy && (
          <Select
            value={searchOptions.sortOrder || 'asc'}
            onValueChange={(value: 'asc' | 'desc') => handleSortChange(searchOptions.sortBy!, value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}