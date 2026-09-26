import {
  BookOpen,
  Bot,
  CreditCard,
  Library,
  PenLine,
  RadioTower,
  Rocket,
  type LucideIcon,
} from 'lucide-react'

export interface DocPage {
  title: string
  /** Path under /docs, no extension. Empty string is the docs index. */
  slug: string
  icon: LucideIcon
}

export interface DocSection {
  title: string
  pages: DocPage[]
}

/**
 * Three labelled groups in reading order. Small enough that the sidebar never needs
 * collapsing, grouped enough that a reader can find a page by intent rather than by
 * scanning a flat list. The nav is the source of truth: the sidebar, the docs index
 * and prev/next pagination are all derived from it.
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
]

/** Flat, in reading order — the shape pagination and the docs index need. */
export const docPages: DocPage[] = docSections.flatMap((section) => section.pages)
