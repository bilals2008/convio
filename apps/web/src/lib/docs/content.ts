import { extractHeadings, type DocHeading } from './markdown'

export type { DocHeading }

export interface Doc {
  slug: string
  title: string
  description: string
  /** Raw markdown, including the leading `# Title`. */
  body: string
  headings: DocHeading[]
  updatedAt?: string
}

// One lazy chunk per markdown file, so the docs corpus never lands in the main bundle.
const modules = import.meta.glob('/src/content/docs/**/*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

const PREFIX = '/src/content/docs/'

function parse(slug: string, raw: string): Doc {
  const title = /^#\s+(.+)$/m.exec(raw)?.[1]?.trim() ?? 'Untitled'

  const description =
    raw
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith('#') && !line.startsWith('```') && !line.startsWith('>')) ?? ''

  const updatedAt = /<!--\s*updated:\s*(\d{4}-\d{2}-\d{2})\s*-->/i.exec(raw)?.[1]

  return { slug, title, description, body: raw, headings: extractHeadings(raw), updatedAt }
}

export async function getDoc(slug: string): Promise<Doc | null> {
  const path = `${PREFIX}${slug ? `${slug}.md` : 'index.md'}`
  const load = modules[path]
  if (!load) return null
  return parse(slug, await load())
}

/** Warm the chunk for a sidebar link before the user clicks it. */
export function prefetchDoc(slug: string): void {
  void modules[`${PREFIX}${slug ? `${slug}.md` : 'index.md'}`]?.()
}
