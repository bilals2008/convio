import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DocsContent } from '@/components/docs/docs-content'
import { DocsShell } from '@/components/docs/docs-shell'
import { Button, buttonVariants } from '@/components/ui/button'
import { docPages } from '@/lib/docs/nav'
import type { Doc } from '@/lib/docs/content'
import { cn } from '@/lib/utils'

function LastUpdated({ date }: { date: string }) {
  return (
    <p className="text-xs text-muted-foreground">
      Last updated {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
    </p>
  )
}

export function DocsLayout({ doc }: { doc: Doc }) {
  const index = docPages.findIndex((page) => page.slug === doc.slug)
  const prev = index > 0 ? docPages[index - 1] : null
  const next = index >= 0 && index < docPages.length - 1 ? docPages[index + 1] : null

  return (
    <DocsShell toc={doc.headings}>
      <div>
        {doc.updatedAt && <LastUpdated date={doc.updatedAt} />}
        <div className="mt-2">
          <DocsContent body={doc.body} />
        </div>
      </div>

      {(prev || next) && (
        <nav className="mt-8 grid max-w-[42rem] gap-3 sm:grid-cols-2">
          {prev ? (
            <Link
              to={prev.slug ? `/docs/${prev.slug}` : '/docs'}
              className={cn(buttonVariants({ variant: 'outline' }), 'h-auto flex-col items-start gap-1 p-4')}
            >
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ChevronLeft className="size-3" />
                Previous
              </span>
              <span className="text-sm font-medium">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to={next.slug ? `/docs/${next.slug}` : '/docs'}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-auto flex-col items-end gap-1 p-4 text-right'
              )}
            >
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                Next
                <ChevronRight className="size-3" />
              </span>
              <span className="text-sm font-medium">{next.title}</span>
            </Link>
          )}
        </nav>
      )}
    </DocsShell>
  )
}
