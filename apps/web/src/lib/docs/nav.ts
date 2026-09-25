export interface DocPage {
  title: string
  /** Path under /docs, no extension. Empty string is the docs index. */
  slug: string
}

/**
 * Flat and in reading order — one level, no sections. Every page is self-contained:
 * cross-links inside the prose, no "read this first" chains.
 */
export const docPages: DocPage[] = [
  { title: 'Introduction', slug: '' },
  { title: 'Getting started', slug: 'getting-started' },
  { title: 'AI agents', slug: 'agents' },
  { title: 'Writing system prompts', slug: 'system-prompts' },
  { title: 'Knowledge bases', slug: 'knowledge-bases' },
  { title: 'Channels & deployment', slug: 'channels' },
  { title: 'Billing & usage', slug: 'billing' },
]

/** Kept for anything that walks the nav as a group. One section, so the sidebar stays flat. */
export const docSections = [{ title: 'Documentation', pages: docPages }]
