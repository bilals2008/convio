import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { docSections, type DocPage } from '@/lib/docs/nav'
import { prefetchDoc } from '@/lib/docs/content'

function isActive(pathname: string, slug: string): boolean {
  const href = slug ? `/docs/${slug}` : '/docs'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation()

  return (
    <nav aria-label="Documentation" className="px-4 py-6">
      <ul className="space-y-6">
        {docSections.map((section) => (
          <li key={section.title}>
            <p className="mb-2 px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.pages.map((page: DocPage) => (
                <li key={page.slug}>
                  <Link
                    to={page.slug ? `/docs/${page.slug}` : '/docs'}
                    onClick={onNavigate}
                    onMouseEnter={() => prefetchDoc(page.slug)}
                    onFocus={() => prefetchDoc(page.slug)}
                    aria-current={isActive(pathname, page.slug) ? 'page' : undefined}
                    className={cn(
                      'block rounded-md px-2 py-1.5 text-sm transition-colors',
                      isActive(pathname, page.slug)
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  )
}
