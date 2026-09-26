import { useEffect, useState, type ReactNode } from 'react'
import { ListTree } from 'lucide-react'
import { DocsSidebar } from '@/components/docs/docs-sidebar'
import { DocsToc } from '@/components/docs/docs-toc'
import { DocsTopbar } from '@/components/docs/docs-topbar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import type { DocHeading } from '@/lib/docs/content'
import { cn } from '@/lib/utils'

/** Both rails clear the 4rem topbar and own the rest of the viewport. */
const RAIL = 'sticky top-16 h-[calc(100dvh-4rem)] overflow-y-auto'

/**
 * No `justify-center`: the track count drops from three to two on TOC-less pages
 * (the index), and centring re-split the leftover slack per variant — sliding the
 * sidebar ~120px right on the index only. Anchored left, every page shares one
 * left edge and the slack lands on the right as ordinary margin. `81rem` is exactly
 * the three-track width, so the container is flush with no dead gutter.
 */
export function DocsShell({
  toc = [],
  sidebar = true,
  children,
}: {
  toc?: DocHeading[]
  sidebar?: boolean
  children: ReactNode
}) {
  const [navOpen, setNavOpen] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const hasToc = toc.length > 0

  // Owned here rather than in DocsSearch: the sidebar is a second trigger for the same
  // dialog, and the shortcut has to fire whichever rail is on screen.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setSearchOpen((value) => !value)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="docs-shell min-h-screen bg-background">
      <DocsTopbar
        onOpenNav={() => setNavOpen(true)}
        searchOpen={searchOpen}
        onSearchOpenChange={setSearchOpen}
      />

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-80 gap-0 overflow-y-auto p-0">
          <SheetTitle className="sr-only">Documentation navigation</SheetTitle>
          <DocsSidebar
            onNavigate={() => setNavOpen(false)}
            // The sheet is a second modal; leaving it open behind the search dialog
            // would stack two overlays on a phone.
            onOpenSearch={() => {
              setNavOpen(false)
              setSearchOpen(true)
            }}
          />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          // minmax(0,1fr), not 1fr: a bare `1fr` track takes its minimum from the
          // content, so one wide table would stretch the whole shell past the viewport.
          'mx-auto grid w-full max-w-[81rem] grid-cols-[minmax(0,1fr)] gap-x-10 px-4 sm:px-6',
          sidebar && 'lg:grid-cols-[15rem_minmax(0,44rem)]',
          hasToc && 'xl:grid-cols-[16rem_minmax(0,44rem)_14rem]',
        )}
      >
        {sidebar && (
          <aside className={cn(RAIL, 'hidden lg:block')}>
            <DocsSidebar onOpenSearch={() => setSearchOpen(true)} />
          </aside>
        )}

        <main className="min-w-0 py-8 sm:py-10">
          {hasToc && (
            <div className="mb-4 flex justify-end xl:hidden">
              <Popover open={tocOpen} onOpenChange={setTocOpen}>
                <PopoverTrigger render={<Button variant="outline" size="sm" />}>
                  <ListTree data-icon="inline-start" />
                  On this page
                </PopoverTrigger>
                <PopoverContent align="end" className="max-h-[70dvh] w-72 overflow-y-auto">
                  <PopoverTitle className="sr-only">On this page</PopoverTitle>
                  <DocsToc headings={toc} onNavigate={() => setTocOpen(false)} />
                </PopoverContent>
              </Popover>
            </div>
          )}
          {children}
        </main>

        {hasToc && (
          <aside className={cn(RAIL, 'hidden xl:block')}>
            <DocsToc headings={toc} />
          </aside>
        )}
      </div>
    </div>
  )
}
