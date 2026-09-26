import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FileText, Search } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
// Type-only: the index itself stays in its lazy chunk, the types are erased anyway.
import type { SearchItem } from '@/lib/docs/search-index'
import { cn } from '@/lib/utils'

/** The shortcut hint has to name the key the reader's keyboard actually has. */
const IS_APPLE = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)

const KBD =
  'flex h-5 min-w-5 items-center justify-center rounded border border-border bg-background px-1.5 font-mono text-[10px] leading-none whitespace-nowrap'

/**
 * One source for the platform check and the key styling, so the chip never disagrees
 * with the shortcut it advertises.
 */
export function DocsShortcut({ className }: { className?: string }) {
  return (
    <kbd className={cn(KBD, 'ml-auto shrink-0', className)} aria-hidden="true">
      {IS_APPLE ? '⌘K' : 'Ctrl K'}
    </kbd>
  )
}

/**
 * Open state is owned by the shell, not here: ⌘K has to work from anywhere on the page,
 * and two owners of one dialog can only fight.
 */
export function DocsSearch({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()

  // The corpus is a lazily imported module, not server state — but it is still an
  // async load, so it goes through the query cache rather than an effect.
  const { data: items = [] } = useQuery({
    queryKey: ['docs-search-index'],
    queryFn: async () => (await import('@/lib/docs/search-index')).buildSearchIndex(),
    enabled: open,
    staleTime: Infinity,
  })

  return (
    <>
      <button
        onClick={() => onOpenChange(true)}
        className="flex h-9 w-9 items-center justify-center gap-2 rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none md:w-full md:max-w-[26rem] md:justify-start md:px-3 md:text-sm"
        aria-label="Search documentation"
      >
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <span className="hidden truncate md:inline">Search documentation…</span>
        <DocsShortcut className="hidden md:flex" />
      </button>

      <CommandDialog open={open} onOpenChange={onOpenChange}>
        <CommandInput placeholder="Search documentation…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          {Object.entries(
            items.reduce<Map<string, SearchItem[]>>((map, item) => {
              return map.set(item.section, [...(map.get(item.section) ?? []), item])
            }, new Map()),
          ).map(([section, sectionItems]: [string, SearchItem[]]) => (
            <CommandGroup key={section} heading={section}>
              {sectionItems.map((item) => (
                <CommandItem
                  key={item.slug}
                  value={item.haystack}
                  onSelect={() => {
                    onOpenChange(false)
                    navigate(item.slug ? `/docs/${item.slug}` : '/docs')
                  }}
                >
                  <FileText />
                  <span className="flex flex-col gap-0.5">
                    <span>{item.title}</span>
                    {item.description && (
                      <span className="truncate text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
