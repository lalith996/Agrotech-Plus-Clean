# Enhanced Search Component with Auto-Complete

The enhanced Search component now supports ML-powered auto-complete functionality with natural language processing, fuzzy matching, and typo tolerance.

## Features

- **Auto-complete suggestions**: Real-time suggestions as users type
- **ML-powered search**: NLP processing for better search results
- **Fuzzy matching**: Handles typos and misspellings
- **Keyboard navigation**: Arrow keys to navigate suggestions, Enter to select
- **Multiple suggestion types**: Products, categories, farmers, and smart suggestions
- **Debounced API calls**: Optimized performance with configurable debouncing
- **Accessible**: Full ARIA support for screen readers

## Basic Usage

```tsx
import { Search } from "@/components/ui/search"

function MyComponent() {
  const handleSearch = (query: string) => {
    console.log('Searching for:', query)
    // Perform search logic
  }

  return (
    <Search
      placeholder="Search products..."
      onSearch={handleSearch}
    />
  )
}
```

## With Auto-Complete

```tsx
import { Search } from "@/components/ui/search"

function ProductSearch() {
  const handleSearch = (query: string) => {
    // Perform search
    router.push(`/products?q=${encodeURIComponent(query)}`)
  }

  const handleSuggestionSelect = (suggestion) => {
    console.log('Selected:', suggestion)
    
    // Navigate based on suggestion type
    if (suggestion.type === 'product' && suggestion.id) {
      router.push(`/products/${suggestion.id}`)
    } else {
      handleSearch(suggestion.text)
    }
  }

  return (
    <Search
      placeholder="Search products, farmers, categories..."
      onSearch={handleSearch}
      showAutoComplete={true}
      onSuggestionSelect={handleSuggestionSelect}
      minCharsForSuggestions={2}
      debounceMs={300}
    />
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSearch` | `(value: string) => void` | - | Callback when search is triggered |
| `debounceMs` | `number` | `300` | Debounce delay in milliseconds |
| `showAutoComplete` | `boolean` | `false` | Enable auto-complete suggestions |
| `onSuggestionSelect` | `(suggestion: Suggestion) => void` | - | Callback when suggestion is selected |
| `minCharsForSuggestions` | `number` | `2` | Minimum characters before showing suggestions |

## Suggestion Object

```typescript
interface Suggestion {
  text: string                    // Display text
  type: 'product' | 'suggestion' | 'category' | 'farmer'
  id?: string                     // Product/Farmer ID (if applicable)
  category?: string               // Product category
  location?: string               // Farmer location
  count?: number                  // Number of items (for categories)
  score?: number                  // Relevance score
}
```

## Keyboard Navigation

- **Arrow Down**: Move to next suggestion
- **Arrow Up**: Move to previous suggestion
- **Enter**: Select highlighted suggestion
- **Escape**: Close suggestions dropdown

## API Integration

The component automatically fetches suggestions from `/api/search/suggestions` endpoint:

```
GET /api/search/suggestions?q={query}&limit={limit}
```

Response format:
```json
{
  "success": true,
  "query": "tomato",
  "suggestions": [
    {
      "text": "Fresh Tomatoes",
      "type": "product",
      "id": "prod-123",
      "category": "VEGETABLES",
      "score": 95
    },
    {
      "text": "tomatoes",
      "type": "suggestion",
      "score": 100
    }
  ]
}
```

## ML-Powered Features

When the ML service is available, the search provides:

1. **Natural Language Processing**: Understands queries like "organic tomatoes near me"
2. **Typo Correction**: Suggests corrections for misspelled words
3. **Synonym Matching**: Finds products using related terms
4. **Personalized Ranking**: Orders results based on user preferences
5. **Context-Aware**: Considers user location and history

## Fallback Behavior

If the ML service is unavailable, the component automatically falls back to:
- Database-based text search
- Basic fuzzy matching
- Simple relevance scoring

This ensures the search always works, even without the ML service running.

## Styling

The component uses Tailwind CSS and follows the shadcn/ui design system. Customize appearance using the `className` prop:

```tsx
<Search
  className="w-full max-w-md"
  showAutoComplete={true}
/>
```

## Accessibility

The component includes full ARIA support:
- `role="searchbox"` on input
- `role="listbox"` on suggestions
- `aria-autocomplete="list"`
- `aria-expanded` state
- `aria-selected` for highlighted items
- Keyboard navigation support

## Performance

- Debounced API calls prevent excessive requests
- Suggestions are cached for 5 minutes
- Minimal re-renders with React hooks
- Lazy loading of suggestion data
