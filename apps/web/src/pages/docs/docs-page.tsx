import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { DocsIndex } from '@/components/docs/docs-index'
import { DocsLayout } from '@/components/docs/docs-layout'
import { EmptyState } from '@/components/shared/empty-state'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDoc } from '@/lib/hooks/use-doc'
import { cn } from '@/lib/utils'

export default function DocsPage() {
  const params = useParams()
  const slug = params['*'] ?? ''
  const { data: doc, isPending } = useDoc(slug)

  useEffect(() => {
    document.title = doc ? `${doc.title} — Convio Docs` : 'Docs — Convio'
  }, [doc])

  if (slug === '') return <DocsIndex />
  if (isPending || doc === undefined) return <DocSkeleton />

  if (doc === null) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
        <Link
          to="/docs"
          className={cn(buttonVariants({ variant: 'outline' }), 'absolute top-6 left-6')}
        >
          Back to docs
        </Link>
        <EmptyState
          icon={FileQuestion}
          title="Page not found"
          description="This documentation page has not been written yet."
        />
      </div>
    )
  }

  return <DocsLayout doc={doc} />
}

function DocSkeleton() {
  return (
    <div className="mx-auto max-w-[42rem] py-10">
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
      <Skeleton className="mt-10 h-5 w-1/3" />
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-11/12" />
    </div>
  )
}
