import * as React from "react"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"
import { Input } from "./input"

interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void
  debounceMs?: number
}

export const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  ({ className, onSearch, debounceMs = 300, ...props }, ref) => {
    const [value, setValue] = React.useState(props.value || '')
    const timeoutRef = React.useRef<NodeJS.Timeout>()

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

    return (
      <div className="relative">
        <MagnifyingGlassIcon 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" 
          aria-hidden="true"
        />
        <Input
          ref={ref}
          type="search"
          className={cn("pl-10", className)}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          role="searchbox"
          aria-label="Search"
          {...props}
        />
      </div>
    )
  }
)
Search.displayName = "Search"