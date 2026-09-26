import { Link, useLocation } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { docSections, type DocPage } from '@/lib/docs/nav'
import { prefetchDoc } from '@/lib/docs/content'

/**
 * Exact match on a trailing-slash-normalised pathname. A prefix match marked the
 * docs index active on every page, because everything lives under /docs/.
 */
function isActive(pathname: string, slug: string): boolean {
  const current = pathname.replace(/\/+$/, '')
  return current === (slug ? `/docs/${slug}` : '/docs')
}

export function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation()

  return (
    <nav aria-label="Documentation" className="flex flex-col gap-6 px-4 py-7">
      {docSections.map((section, index) => (
        <div key={section.title} className="flex flex-col gap-1">
          {index > 0 && <Separator className="mb-5" />}
          <p className="mb-1.5 px-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            {section.title}
          </p>
          {section.pages.map((page: DocPage) => {
            const active = isActive(pathname, page.slug)
            const Icon = page.icon
            return (
              <Link
                key={page.slug}
                to={page.slug ? `/docs/${page.slug}` : '/docs'}
                onClick={onNavigate}
                onMouseEnter={() => prefetchDoc(page.slug)}
                onFocus={() => prefetchDoc(page.slug)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors',
                  active
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {page.title}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
