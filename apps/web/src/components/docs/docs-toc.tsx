import { cn } from '@/lib/utils'
import type { DocHeading } from '@/lib/docs/content'

export function DocsToc({ headings }: { headings: DocHeading[] }) {
  if (headings.length === 0) return null

  return (
    <nav aria-label="On this page" className="py-6">
      <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        On this page
      </p>
      <ul className="space-y-1.5 border-l border-border">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                '-ml-px block border-l border-transparent py-0.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground',
                heading.level === 2 ? 'pl-3' : 'pl-6'
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
