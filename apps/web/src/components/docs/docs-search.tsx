import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Search } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import type { SearchItem } from '@/lib/docs/search-index'

export function DocsSearch() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<SearchItem[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!open || items.length > 0) return
    void import('@/lib/docs/search-index').then((m) => setItems(m.buildSearchIndex()))
  }, [open, items.length])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:w-56 sm:justify-start sm:gap-2 sm:border sm:border-border sm:bg-card/60 sm:px-3"
        aria-label="Search docs"
      >
        <Search className="size-4 shrink-0" />
        <span className="hidden text-sm sm:inline">Search docs</span>
        <kbd className="ml-auto hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search documentation…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          {Object.entries(
            items.reduce<Map<string, SearchItem[]>>((map, item) => {
              return map.set(item.section, [...(map.get(item.section) ?? []), item])
            }, new Map())
          ).map(([section, sectionItems]) => (
            <CommandGroup key={section} heading={section}>
              {sectionItems.map((item) => (
                <CommandItem
                  key={item.slug}
                  value={item.haystack}
                  onSelect={() => {
                    setOpen(false)
                    navigate(item.slug ? `/docs/${item.slug}` : '/docs')
                  }}
                >
                  <FileText />
                  <span className="flex flex-col gap-0.5">
                    <span>{item.title}</span>
                    {item.description && (
                      <span className="truncate text-xs text-muted-foreground">{item.description}</span>
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
