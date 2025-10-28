import * as React from "react"
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"
import { Input } from "./input"

interface Suggestion {
  text: string
  type: 'product' | 'suggestion' | 'category' | 'farmer'
  id?: string
  category?: string
  location?: string
  count?: number
  score?: number
}

interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void
  debounceMs?: number
  showAutoComplete?: boolean
  onSuggestionSelect?: (suggestion: Suggestion) => void
  minCharsForSuggestions?: number
}

export const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  ({ 
    className, 
    onSearch, 
    debounceMs = 300, 
    showAutoComplete = false,
    onSuggestionSelect,
    minCharsForSuggestions = 2,
    ...props 
  }, ref) => {
    const [value, setValue] = React.useState(props.value || '')
    const [suggestions, setSuggestions] = React.useState<Suggestion[]>([])
    const [showSuggestions, setShowSuggestions] = React.useState(false)
    const [selectedIndex, setSelectedIndex] = React.useState(-1)
    const [isLoading, setIsLoading] = React.useState(false)
    const timeoutRef = React.useRef<NodeJS.Timeout>()
    const suggestionsTimeoutRef = React.useRef<NodeJS.Timeout>()
    const wrapperRef = React.useRef<HTMLDivElement>(null)

    // Handle search with debouncing
    React.useEffect(() => {
      if (onSearch && debounceMs > 0) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          onSearch(value as string)
        }, debounceMs)
      }
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [value, onSearch, debounceMs])

    // Fetch suggestions with debouncing
    React.useEffect(() => {
      if (!showAutoComplete || !value || (value as string).length < minCharsForSuggestions) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current)
      }

      suggestionsTimeoutRef.current = setTimeout(async () => {
        setIsLoading(true)
        try {
          const response = await fetch(
            `/api/search/suggestions?q=${encodeURIComponent(value as string)}&limit=8`
          )
          
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.suggestions) {
              setSuggestions(data.suggestions)
              setShowSuggestions(data.suggestions.length > 0)
            }
          }
        } catch (error) {
          console.error('Failed to fetch suggestions:', error)
        } finally {
          setIsLoading(false)
        }
      }, debounceMs)

      return () => {
        if (suggestionsTimeoutRef.current) {
          clearTimeout(suggestionsTimeoutRef.current)
        }
      }
    }, [value, showAutoComplete, minCharsForSuggestions, debounceMs])

    // Handle click outside to close suggestions
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
          setShowSuggestions(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [])

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions || suggestions.length === 0) {
        return
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            handleSuggestionClick(suggestions[selectedIndex])
          }
          break
        case 'Escape':
          setShowSuggestions(false)
          setSelectedIndex(-1)
          break
      }
    }

    const handleSuggestionClick = (suggestion: Suggestion) => {
      setValue(suggestion.text)
      setShowSuggestions(false)
      setSelectedIndex(-1)
      
      if (onSuggestionSelect) {
        onSuggestionSelect(suggestion)
      }
      
      if (onSearch) {
        onSearch(suggestion.text)
      }
    }

    const handleClear = () => {
      setValue('')
      setSuggestions([])
      setShowSuggestions(false)
      setSelectedIndex(-1)
      
      if (onSearch) {
        onSearch('')
      }
    }

    const getSuggestionIcon = (type: string) => {
      switch (type) {
        case 'product':
          return '🛒'
        case 'category':
          return '📁'
        case 'farmer':
          return '👨‍🌾'
        default:
          return '🔍'
      }
    }

    return (
      <div ref={wrapperRef} className="relative w-full">
        <MagnifyingGlassIcon 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" 
          aria-hidden="true"
        />
        <Input
          ref={ref}
          type="search"
          className={cn("pl-10 pr-10", className)}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          role="searchbox"
          aria-label="Search"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={showSuggestions}
          {...props}
        />
        
        {/* Clear button */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
            aria-label="Clear search"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2 z-10">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}

        {/* Suggestions dropdown */}
        {showAutoComplete && showSuggestions && suggestions.length > 0 && (
          <div
            id="search-suggestions"
            role="listbox"
            className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-80 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.text}-${index}`}
                type="button"
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  "w-full px-4 py-2 text-left hover:bg-accent transition-colors flex items-center gap-3",
                  index === selectedIndex && "bg-accent",
                  index !== suggestions.length - 1 && "border-b border-border"
                )}
              >
                <span className="text-lg" aria-hidden="true">
                  {getSuggestionIcon(suggestion.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{suggestion.text}</div>
                  {suggestion.type === 'product' && suggestion.category && (
                    <div className="text-xs text-muted-foreground">
                      in {suggestion.category}
                    </div>
                  )}
                  {suggestion.type === 'farmer' && suggestion.location && (
                    <div className="text-xs text-muted-foreground">
                      {suggestion.location}
                    </div>
                  )}
                  {suggestion.type === 'category' && suggestion.count && (
                    <div className="text-xs text-muted-foreground">
                      {suggestion.count} products
                    </div>
                  )}
                </div>
                {suggestion.type === 'suggestion' && (
                  <span className="text-xs text-muted-foreground">
                    Did you mean?
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)
Search.displayName = "Search"