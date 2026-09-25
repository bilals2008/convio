import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { DocsIndex } from '@/components/docs/docs-index'
import { DocsLayout } from '@/components/docs/docs-layout'
import { EmptyState } from '@/components/shared/empty-state'
import { buttonVariants } from '@/components/ui/button'
import { getDoc, type Doc } from '@/lib/docs/content'
import { cn } from '@/lib/utils'

export default function DocsPage() {
  const params = useParams()
  const slug = params['*'] ?? ''
  const [doc, setDoc] = useState<Doc | null | undefined>(undefined)

  useEffect(() => {
    if (slug === '') return
    let cancelled = false
    void getDoc(slug).then((result) => {
      if (!cancelled) setDoc(result)
    })
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    document.title = doc ? `${doc.title} — Convio Docs` : 'Docs — Convio'
  }, [doc])

  if (slug === '') return <DocsIndex />
  if (doc === undefined) return null

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
