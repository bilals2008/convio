import { useState, type ReactNode } from 'react'
import { DocsSidebar } from '@/components/docs/docs-sidebar'
import { DocsToc } from '@/components/docs/docs-toc'
import { DocsTopbar } from '@/components/docs/docs-topbar'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import type { DocHeading } from '@/lib/docs/content'

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

  return (
    <div className="min-h-screen bg-background">
      <DocsTopbar onOpenNav={() => setNavOpen(true)} />

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-72 gap-0 overflow-y-auto p-0">
          <SheetTitle className="sr-only">Documentation navigation</SheetTitle>
          <DocsSidebar onNavigate={() => setNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="mx-auto flex max-w-[1400px] gap-8 px-4">
        {sidebar && (
          <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 overflow-y-auto lg:block">
            <DocsSidebar />
          </aside>
        )}

        <main className="min-w-0 flex-1 py-10">{children}</main>

        {toc.length > 0 && (
          <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 overflow-y-auto xl:block">
            <DocsToc headings={toc} />
          </aside>
        )}
      </div>
    </div>
  )
}
