import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight, Flame, LayoutTemplate, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { DocsCallout } from '@/components/docs/docs-callout'
import { DocsContent } from '@/components/docs/docs-content'
import { DocsShell } from '@/components/docs/docs-shell'
import { Button, buttonVariants } from '@/components/ui/button'
import { categoryColors, iconForTemplate } from '@/lib/template-style'
import { extractHeadings } from '@/lib/docs/markdown'
import { cn } from '@/lib/utils'
// ponytail: templates live in the API as pure data (no imports), so the docs read them
// from the source instead of keeping a second copy that drifts. If that file ever grows
// runtime imports, move it to packages/ and import it from both apps.
import { listTemplates, type AgentTemplate } from '../../../../api/src/modules/agents/templates'

/** Prompt templates only — the blank `custom` entry has nothing to show. */
const TEMPLATES = listTemplates()
  .filter((template) => template.category !== 'custom')
  .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))

// Resolved once at module scope: the compiler refuses to take a component out of a
// function call inside render, and a map lookup is the same answer every time.
const ICONS: Record<string, LucideIcon> = Object.fromEntries(
  TEMPLATES.map((template) => [template.id, iconForTemplate(template.id, template.category)])
)

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'support', label: 'Support' },
  { id: 'business', label: 'Business' },
  { id: 'education', label: 'Education' },
  { id: 'productivity', label: 'Productivity' },
] as const

type FilterId = (typeof FILTERS)[number]['id']

/** Cards are tall now that each one carries its prompt, so the fold shows this many. */
const PREVIEW = 8

const COUNTS: Record<string, number> = Object.fromEntries(
  FILTERS.map((filter) => [
    filter.id,
    filter.id === 'all'
      ? TEMPLATES.length
      : TEMPLATES.filter((template) => template.category === filter.id).length,
  ])
)

/**
 * The prose below the gallery. Markdown so it keeps the docs typography, heading
 * anchors, callouts, and links instead of growing a second set of text styles.
 */
const NOTES = `## What a template applies

Applying a template opens the create agent form already filled in:

- **Name and description** — a sensible label to rename if you want.
- **System prompt** — written for that job, yours to edit once applied.
- **Model and temperature** — a default chosen for that kind of work.
- **Suggested tools** — pre-enabled, so the agent can act instead of only answering.

> [!TIP]
> **The prompt is a draft, not an answer key**
>
> Templates use generic wording. Add your policies, your tone, and the edge cases that only you know, then run it in the [playground](/docs/agents) before you set the agent active.

## Customize and test

Start from the prompt, then ground it: put the facts that change into a [knowledge base](/docs/knowledge-bases), keep the rules that never change in the [system prompt](/docs/system-prompts), and test both before you [deploy](/docs/channels).`

const TOC = [
  { id: 'gallery', text: 'Browse the gallery', level: 2 as const },
  ...extractHeadings(NOTES),
]

function TemplateCard({ template }: { template: AgentTemplate }) {
  const Icon = ICONS[template.id]
  const popular = (template.popularity ?? 0) >= 70

  return (
    <article className="flex flex-col rounded-lg border border-border bg-card p-4 transition-colors duration-150 hover:border-foreground/20">
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-md',
            categoryColors[template.category]
          )}
        >
          <Icon aria-hidden="true" className="size-4" />
        </span>
        {popular && (
          <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-500">
            <Flame aria-hidden="true" className="size-3 fill-current" />
            {template.popularity}
          </span>
        )}
      </div>

      <h3 className="mt-3 text-sm font-semibold">{template.name}</h3>
      <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{template.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
        <span className="rounded bg-muted px-1.5 py-0.5">{template.suggestedModel}</span>
        <span className="rounded bg-muted px-1.5 py-0.5">temp {template.suggestedTemperature}</span>
        {template.suggestedTools.length > 0 && (
          <span className="flex items-center gap-1">
            <Wrench aria-hidden="true" className="size-3" />
            {template.suggestedTools.length} tool{template.suggestedTools.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="mt-auto pt-4">
        <Link
          to={`/agents/new?template=${template.id}`}
          className={cn(buttonVariants({ size: 'sm' }), 'w-full')}
        >
          Use
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>
    </article>
  )
}

export default function DocsTemplatesPage() {
  const [filter, setFilter] = useState<FilterId>('all')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    document.title = 'Agent templates — Convio Docs'
  }, [])

  const matches = useMemo(
    () => (filter === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.category === filter)),
    [filter]
  )
  const shown = showAll ? matches : matches.slice(0, PREVIEW)

  return (
    <DocsShell toc={TOC}>
      {/* Hero, in the docs index's voice: kicker, one promise, two ways forward. */}
      <p className="font-mono text-xs tracking-[0.08em] text-primary uppercase">Docs</p>
      <h1 className="mt-3 max-w-[34rem] font-heading text-4xl font-bold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.1]">
        Start from a proven prompt
      </h1>
      <p className="mt-4 max-w-[38rem] text-[15px] leading-6.5 text-muted-foreground">
        {TEMPLATES.length} ready-made agents, each one a full system prompt with the model,
        temperature, and tools it needs. Apply one in a click — the prompt lands in the create
        form, ready to edit.
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Link to="/agents/templates" className={cn(buttonVariants({ size: 'lg' }))}>
          <LayoutTemplate aria-hidden="true" className="size-4" />
          Open the gallery
        </Link>
        <Link
          to="/docs/system-prompts"
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
        >
          Writing system prompts
        </Link>
      </div>

      <h2
        id="gallery"
        className="mt-16 scroll-mt-20 font-heading text-lg font-semibold tracking-tight"
      >
        Browse the gallery
      </h2>

      <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Filter templates by category">
        {FILTERS.map((option) => {
          const active = filter === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setFilter(option.id)
                setShowAll(false)
              }}
              aria-pressed={active}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {option.label}
              <span className={cn('font-mono', active ? 'text-primary-foreground/70' : 'text-muted-foreground/70')}>
                {COUNTS[option.id]}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {shown.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {!showAll && matches.length > PREVIEW && (
        <div className="mt-5 flex justify-center">
          <Button variant="outline" onClick={() => setShowAll(true)}>
            <ArrowDown aria-hidden="true" className="size-4" />
            See all {matches.length} templates
          </Button>
        </div>
      )}

      {matches.length === 0 && (
        <p className="mt-4 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          No templates in this category yet.
        </p>
      )}

      <div className="mt-14">
        <DocsContent body={NOTES} />

        <DocsCallout variant="info" title="Templates are org-wide, not locked in">
          Applying a template copies its settings into a new agent. Editing that agent never
          changes the template, and new templates arrive without touching anything you built.
        </DocsCallout>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link to="/agents/new" className={cn(buttonVariants({ size: 'lg' }))}>
          Start from scratch
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
        <Link
          to="/docs/getting-started"
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
        >
          Getting started
        </Link>
      </div>
    </DocsShell>
  )
}
