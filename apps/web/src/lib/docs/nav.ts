import {
  BookOpen,
  Bot,
  Calendar,
  CreditCard,
  Headphones,
  Library,
  MessageCircle,
  PenLine,
  RadioTower,
  Rocket,
  Target,
  type LucideIcon,
} from 'lucide-react'

export interface DocPage {
  title: string
  /** Path under /docs, no extension. Empty string is the docs index. */
  slug: string
  icon: LucideIcon
  /** Optional rail marker, e.g. to flag a freshly published page. */
  badge?: 'new' | 'popular'
  /** Deeper pages, rendered nested under this one. Optional — most pages are leaves. */
  children?: DocPage[]
}

export interface DocSection {
  title: string
  pages: DocPage[]
}

/**
 * Labelled groups in reading order, grouped by intent rather than left as a flat list.
 * The nav is the source of truth: the sidebar, the docs index and prev/next pagination
 * are all derived from it. Sections are collapsible in the sidebar, so a long corpus
 * stays scannable without hiding anything by default.
 */
export const docSections: DocSection[] = [
  {
    title: 'Start here',
    pages: [
      { title: 'Introduction', slug: '', icon: BookOpen },
      { title: 'Getting started', slug: 'getting-started', icon: Rocket },
    ],
  },
  {
    title: 'Build',
    pages: [
      { title: 'AI agents', slug: 'agents', icon: Bot },
      { title: 'Writing system prompts', slug: 'system-prompts', icon: PenLine },
      { title: 'Knowledge bases', slug: 'knowledge-bases', icon: Library },
    ],
  },
  {
    title: 'Ship and grow',
    pages: [
      { title: 'Channels & deployment', slug: 'channels', icon: RadioTower },
      { title: 'Billing & usage', slug: 'billing', icon: CreditCard },
    ],
  },
  {
    title: 'Use cases',
    pages: [
      { title: 'WhatsApp support', slug: 'use-cases/whatsapp-support', icon: MessageCircle },
      { title: 'Slack helpdesk', slug: 'use-cases/slack-helpdesk', icon: Headphones },
      { title: 'Lead qualification', slug: 'use-cases/lead-qualification', icon: Target },
      { title: 'Telegram community', slug: 'use-cases/telegram-community', icon: RadioTower },
      { title: 'SMS appointments', slug: 'use-cases/sms-appointments', icon: Calendar },
    ],
  },
]

/** Flat, in reading order — the shape pagination and the docs index need. */
const flatten = (pages: DocPage[]): DocPage[] =>
  pages.flatMap((page) => [page, ...(page.children ? flatten(page.children) : [])])

export const docPages: DocPage[] = docSections.flatMap((section) => flatten(section.pages))
