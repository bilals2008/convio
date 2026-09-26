import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowUpRight, LifeBuoy, Search } from 'lucide-react'
import { DocsShortcut } from '@/components/docs/docs-search'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { docSections, type DocPage, type DocSection } from '@/lib/docs/nav'
import { prefetchDoc } from '@/lib/docs/content'

/**
 * Exact match on a trailing-slash-normalised pathname. A prefix match marked the
 * docs index active on every page, because everything lives under /docs/.
 */
function isActive(pathname: string, slug: string): boolean {
  const current = pathname.replace(/\/+$/, '')
  return current === (slug ? `/docs/${slug}` : '/docs')
}

/** Walks the subtree so a nested page still lights up its section header. */
function containsActive(pages: DocPage[], pathname: string): boolean {
  return pages.some(
    (page) =>
      isActive(pathname, page.slug) ||
      (page.children ? containsActive(page.children, pathname) : false),
  )
}

const BADGE_STYLES = {
  new: 'bg-primary/10 text-primary',
  popular: 'bg-secondary text-secondary-foreground',
} as const

const ITEM_BASE =
  'group relative flex items-center gap-2.5 rounded-md py-1.5 pl-3 pr-2.5 text-[13px] leading-5 outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/60'

const ITEM_IDLE = 'text-muted-foreground hover:bg-accent/70 hover:text-foreground'
const ITEM_ACTIVE = 'bg-primary/10 font-medium text-foreground'

function NavItem({
  page,
  depth,
  pathname,
  onNavigate,
}: {
  page: DocPage
  depth: number
  pathname: string
  onNavigate?: () => void
}) {
  const active = isActive(pathname, page.slug)
  const Icon = page.icon

  return (
    <li>
      <Link
        to={page.slug ? `/docs/${page.slug}` : '/docs'}
        onClick={onNavigate}
        onMouseEnter={() => prefetchDoc(page.slug)}
        onFocus={() => prefetchDoc(page.slug)}
        aria-current={active ? 'page' : undefined}
        className={cn(ITEM_BASE, active ? ITEM_ACTIVE : ITEM_IDLE)}
      >
        {active && (
          <span
            aria-hidden="true"
            className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary"
          />
        )}
        {/* Icons belong to the top level only — a nested rail that repeats one icon
            per row turns depth into noise. */}
        {depth === 0 && (
          <Icon
            aria-hidden="true"
            className={cn(
              'size-4 shrink-0 transition-colors duration-150',
              active ? 'text-primary' : 'text-muted-foreground/60 group-hover:text-foreground/80',
            )}
          />
        )}
        <span className="min-w-0 flex-1 truncate">{page.title}</span>
        {page.badge && (
          <span
            className={cn(
              'shrink-0 rounded-full px-1.5 text-[10px] leading-4 font-medium tracking-wide uppercase',
              BADGE_STYLES[page.badge],
            )}
          >
            {page.badge}
          </span>
        )}
      </Link>

      {page.children && page.children.length > 0 && (
        // The hairline is the depth cue; the nesting needs no extra per-level padding.
        <ul className="mt-0.5 ml-3.5 flex flex-col gap-0.5 border-l border-border/70">
          {page.children.map((child) => (
            <NavItem
              key={child.slug}
              page={child}
              depth={depth + 1}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function NavSection({
  section,
  pathname,
  onNavigate,
}: {
  section: DocSection
  pathname: string
  onNavigate?: () => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  // Collapsing is for the sections the reader is not in — hiding the open page would
  // strand them with no highlight in the rail.
  const open = !collapsed || containsActive(section.pages, pathname)
  const panelId = `docs-nav-${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

  return (
    <div>
      {/* No chevron: the label itself is the control, and a caret on every group is
          noise in a rail this narrow. aria-expanded still carries the state to AT. */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setCollapsed((value) => !value)}
        className="mb-2 flex w-full items-center rounded-sm py-1 pr-2 pl-3 text-left text-foreground/75 transition-colors outline-none hover:bg-accent/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <span className="text-[11px] font-bold tracking-[0.08em] uppercase">
          {section.title}
        </span>
      </button>

      {open && (
        <ul id={panelId} className="flex flex-col gap-0.5">
          {section.pages.map((page) => (
            <NavItem
              key={page.slug}
              page={page}
              depth={0}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * `min-h-full` + `mt-auto` pins the help card to the bottom of whatever box the nav
 * sits in — the sticky rail on desktop, the full-height sheet on mobile — from one
 * layout instead of a viewport-dependent duplicate.
 */
export function DocsSidebar({
  onNavigate,
  onOpenSearch,
}: {
  onNavigate?: () => void
  onOpenSearch: () => void
}) {
  const { pathname } = useLocation()

  return (
    <nav aria-label="Documentation" className="flex min-h-full flex-col px-3 pt-6 pb-8">
      <button
        type="button"
        onClick={onOpenSearch}
        className="flex w-full items-center gap-2 rounded-lg bg-muted/60 px-2.5 py-2 text-left text-[13px] text-muted-foreground transition-colors duration-150 outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <Search className="size-4 shrink-0 opacity-70" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">Search docs</span>
        <DocsShortcut />
      </button>

      <div className="mt-7 flex flex-col gap-6">
        {docSections.map((section) => (
          <NavSection
            key={section.title}
            section={section}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <div className="mt-auto rounded-lg bg-muted/50 p-3.5">
        <div className="flex items-center gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <LifeBuoy className="size-3.5" aria-hidden="true" />
          </span>
          <p className="text-[13px] leading-none font-medium">Need a hand?</p>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Migrating an existing agent, or need a plan that fits your volume?
        </p>
        <Link
          to="/contact"
          onClick={onNavigate}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'mt-3 w-full justify-between',
          )}
        >
          Talk to our team
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </nav>
  )
}
