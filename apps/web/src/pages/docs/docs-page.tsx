import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { DocsIndex } from '@/components/docs/docs-index'
import { DocsLayout } from '@/components/docs/docs-layout'
import { DocsShell } from '@/components/docs/docs-shell'
import { EmptyState } from '@/components/shared/empty-state'
import { FileQuestion } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useDoc } from '@/lib/hooks/use-doc'

export default function DocsPage() {
  const params = useParams()
  const slug = params['*'] ?? ''
  const { data: doc, isPending } = useDoc(slug)

  useEffect(() => {
    document.title = doc ? `${doc.title} — Convio Docs` : 'Docs — Convio'
  }, [doc])

  if (slug === '') return <DocsIndex />
  // The shell stays mounted across a navigation: the sidebar, topbar and TOC rail are
  // the reader's frame, and swapping the whole page for a skeleton throws it away.
  if (isPending || doc === undefined) {
    return (
      <DocsShell>
        <DocSkeleton />
      </DocsShell>
    )
  }

  if (doc === null) {
    return (
      <DocsShell>
        <div className="py-16">
          <EmptyState
            icon={FileQuestion}
            title="Page not found"
            description="This documentation page has not been written yet."
          />
        </div>
      </DocsShell>
    )
  }

  return <DocsLayout doc={doc} />
}

function DocSkeleton() {
  return (
    <div className="max-w-[44rem]">
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
      <Skeleton className="mt-10 h-5 w-1/3" />
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-11/12" />
    </div>
  )
}
