import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LifeBuoy, ListTree } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DocHeading } from '@/lib/docs/content'

/**
 * Anchors land below the 56px topbar; this is the band the observer uses to decide which
 * heading is "current", so the offset and the anchor clearance stay in step. Intersection
 * Observer accepts only px and percent — a rem value throws a DOMException.
 */
const BAND = '-80px 0px -70% 0px'

export function DocsToc({
  headings,
  onNavigate,
}: {
  headings: DocHeading[]
  onNavigate?: () => void
}) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null)

  useEffect(() => {
    const targets = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null)
    if (targets.length === 0) return

    // The band can straddle two headings; the earlier one in document order wins.
    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        const current = targets.find((target) => visible.has(target.id))
        if (current) setActiveId(current.id)
      },
      { rootMargin: BAND }
    )

    for (const target of targets) observer.observe(target)
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav aria-label="On this page" className="flex flex-col py-6">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        <ListTree className="size-3.5" aria-hidden="true" />
        On this page
      </p>
      <ul className="flex flex-col gap-0.5 border-l border-border">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={onNavigate}
              aria-current={activeId === heading.id ? 'location' : undefined}
              className={cn(
                '-ml-px block border-l py-1 pr-2 text-sm leading-snug transition-colors',
                heading.level === 2 ? 'pl-3' : 'pl-6 text-[13px]',
                activeId === heading.id
                  ? 'border-primary font-medium text-primary'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-4">
        <p className="flex items-center gap-2 text-sm font-medium">
          <LifeBuoy className="size-4 text-primary" aria-hidden="true" />
          Need a hand?
        </p>
        <p className="text-xs text-muted-foreground">
          Talk to our team about migrating an existing agent, a custom channel, or a plan that
          fits your volume.
        </p>
        <Link
          to="/contact"
          onClick={onNavigate}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'self-start')}
        >
          Talk to our team
        </Link>
      </div>
    </nav>
  )
}
