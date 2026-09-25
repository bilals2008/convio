import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { DocsShell } from '@/components/docs/docs-shell'
import { docPages } from '@/lib/docs/nav'

const BLURBS: Record<string, string> = {
  'getting-started': 'Account, organization, team, dashboard, and the full vocabulary.',
  agents: 'Concepts, creating, model choice, tools, testing, and statuses.',
  'system-prompts': 'The highest-leverage field you own, with worked examples.',
  'knowledge-bases': 'Ground answers in your documents instead of the model’s memory.',
  channels: 'Deploy to the web widget, WhatsApp, Slack, Telegram, Discord, and SMS.',
  billing: 'How token usage is metered, plans, trials, and keeping costs predictable.',
}

const STEPS = [
  { n: '01', title: 'Create an account and an organization', body: 'An organization is the workspace boundary — agents, knowledge, keys, and billing all live inside one.' },
  { n: '02', title: 'Create your first agent', body: 'Name it, pick a model, write a system prompt. Start from a template or blank.' },
  { n: '03', title: 'Test it in the playground', body: 'It runs your real prompt, model, and knowledge — without touching production.' },
  { n: '04', title: 'Set it active and deploy', body: 'Draft agents accept nothing. Once it answers in production, you are live.' },
]

export function DocsIndex() {
  return (
    <DocsShell>
      <div className="max-w-[46rem]">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Convio Documentation
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Convio is an open-source platform for building, deploying, and scaling AI agents across
          every channel. One agent definition, many places to reach people.
        </p>

        <div className="mt-8 rounded-lg border border-border bg-muted/40 p-5">
          <p className="text-sm font-medium">New here? Four steps to a live agent.</p>
          <ol className="mt-4 space-y-4">
            {STEPS.map((step) => (
              <li key={step.n} className="flex gap-4">
                <span className="font-mono text-xs text-muted-foreground">{step.n}</span>
                <span>
                  <span className="text-sm font-medium">{step.title}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <h2 className="mt-14 font-heading text-lg font-semibold tracking-tight">Documentation</h2>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {docPages
            .filter((page) => page.slug !== '')
            .map((page) => (
              <li key={page.slug}>
                <Link
                  to={`/docs/${page.slug}`}
                  className="group flex items-baseline gap-4 py-4 transition-colors"
                >
                  <span className="font-medium group-hover:text-primary">{page.title}</span>
                  <span className="flex-1 text-sm text-muted-foreground">
                    {BLURBS[page.slug]}
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
        </ul>

        <p className="mt-8 text-sm text-muted-foreground">
          Convio is MIT licensed and{' '}
          <a
            href="https://github.com/bilals2008/convio-ai"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            open source on GitHub
          </a>
          . Found something wrong? Open an issue.
        </p>
      </div>
    </DocsShell>
  )
}
