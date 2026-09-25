export interface SearchItem {
  slug: string
  title: string
  description: string
  section: string
  /** What cmdk fuzzy-matches against. Body is truncated — full text is not worth scanning per keystroke. */
  haystack: string
}

const files = import.meta.glob('/src/content/docs/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const humanize = (value: string) =>
  value
    .replace(/[-/]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

/** Built on demand — this module is dynamically imported so the corpus stays out of the main bundle. */
export function buildSearchIndex(): SearchItem[] {
  return Object.entries(files).map(([path, raw]) => {
    const slug = path
      .replace(/^\/src\/content\/docs\//, '')
      .replace(/\.md$/, '')
      .replace(/\/index$/, '')

    const title = /^#\s+(.+)$/m.exec(raw)?.[1]?.trim() ?? slug
    const description =
      raw
        .split('\n')
        .map((line) => line.trim())
        .find((line) => line && !line.startsWith('#') && !line.startsWith('```')) ?? ''
    const headings = [...raw.matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) => m[2].trim()).join(' ')

    return {
      slug,
      title,
      description,
      section: humanize(slug.includes('/') ? slug.split('/')[0] : 'Overview'),
      haystack: `${title} ${description} ${headings} ${raw.slice(0, 600)}`,
    }
  })
}
