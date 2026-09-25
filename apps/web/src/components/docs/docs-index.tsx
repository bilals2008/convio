import { Link } from 'react-router-dom'
import { ArrowRight, Rocket } from 'lucide-react'
import { DocsShell } from '@/components/docs/docs-shell'
import { Badge } from '@/components/ui/badge'
import { docSections } from '@/lib/docs/nav'
import { cn } from '@/lib/utils'

const CARDS = [
  { title: 'What is Convio?', body: 'The platform, its core concepts, and where it fits.', section: 'Getting Started' },
  { title: 'Creating an organization', body: 'Workspaces, members, and roles.', section: 'Getting Started' },
  { title: 'Roles and permissions', body: 'What each role can and cannot touch.', section: 'Organizations' },
  { title: 'Managing members', body: 'Roles, removals, and what survives.', section: 'Organizations' },
  { title: 'Login activity & sessions', body: 'Where you have signed in, and how to cut access.', section: 'Organizations' },
  { title: 'AI agents', body: 'Prompts, model choice, and the playground.', section: 'AI Agents' },
  { title: 'Knowledge bases', body: 'Upload documents and connect external sources.', section: 'Knowledge Bases' },
  { title: 'Channels', body: 'Publish agents to the web and beyond.', section: 'Channels' },
  { title: 'Billing', body: 'Plans, usage limits, and invoices.', section: 'Billing' },
]

const firstPageOf = (section: string) => docSections.find((s) => s.title === section)?.pages[0]

export function DocsIndex() {
  return (
    <DocsShell>
      <div className="max-w-[42rem]">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Convio Documentation</h1>
        <p className="mt-3 text-muted-foreground">
          Everything you need to build, deploy, and scale AI agents across every channel.
        </p>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {CARDS.map(({ title, body, section }) => {
            const target = firstPageOf(section)
            const inner = (
              <>
                <span className="flex items-center gap-2 font-medium">
                  {title}
                  {target ? (
                    <ArrowRight className="ml-auto size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  ) : (
                    <Badge variant="soon" className="ml-auto">
                      Soon
                    </Badge>
                  )}
                </span>
                <span className="text-sm text-muted-foreground">{body}</span>
              </>
            )
            const className =
              'group flex h-full flex-col gap-2 rounded-lg border border-border p-4'

            return (
              <li key={title}>
                {target ? (
                  <Link
                    to={target.slug ? `/docs/${target.slug}` : '/docs'}
                    className={cn(className, 'transition-colors hover:border-primary/40 hover:bg-muted/50')}
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className={cn(className, 'opacity-60')}>{inner}</div>
                )}
              </li>
            )
          })}
        </ul>

        <p className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
          <Rocket className="size-4" />
          New here? Start with{' '}
          <Link to="/docs/getting-started/what-is-convio" className="text-primary underline-offset-4 hover:underline">
            What is Convio?
          </Link>
        </p>
      </div>
    </DocsShell>
  )
}
