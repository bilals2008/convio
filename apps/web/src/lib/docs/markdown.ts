import { Children, isValidElement, type ReactNode } from 'react'

/**
 * Everything about docs markdown that does not need the bundler: reading headings out
 * of raw source, and turning react-markdown's element tree into props for the docs
 * components. `content.ts` owns the Vite glob that loads the files and imports from here.
 *
 * No JSX and no `@/` imports on purpose: `test/docs-markdown.test.mjs` imports this
 * module directly under `node --test`, with no test framework installed.
 */

export interface DocHeading {
  id: string
  text: string
  level: 2 | 3
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

/**
 * The single place headings are read out of the markdown. `docs-content.tsx` renders
 * these same ids onto the real <h2>/<h3> nodes, so the TOC links and the DOM anchors
 * cannot drift apart. The search index and llms.txt read headings from here too.
 */
export function extractHeadings(raw: string): DocHeading[] {
  return [...raw.matchAll(/^(#{2,3})\s+(.+)$/gm)].map((m) => ({
    id: slugify(m[2]),
    text: m[2].trim(),
    level: m[1].length as 2 | 3,
  }))
}

/** Minimal hast shape. `@types/hast` is not installed, so the plugin below types its own. */
interface HastNode {
  type: string
  tagName?: string
  value?: string
  children?: HastNode[]
}

const isElement = (node: HastNode, tagName: string) =>
  node.type === 'element' && node.tagName === tagName

const isBlankText = (node: HastNode) => node.type === 'text' && (node.value ?? '').trim() === ''

/**
 * rehype plugin: markdown wraps images in a paragraph, and the docs renderer turns images
 * into a <figure> — which is not valid inside a <p> and breaks hydration. Lifting the
 * images out of the paragraph fixes it for every page instead of per image.
 */
export function unwrapImages() {
  return (tree: HastNode): HastNode => {
    if (!tree.children) return tree

    const walk = (node: HastNode): HastNode => {
      if (!node.children) return node
      const children = node.children.flatMap((child) => {
        if (!isElement(child, 'p') || !child.children) return [walk(child)]

        const meaningful = child.children.filter((node) => !isBlankText(node))
        const images = meaningful.filter((node) => isElement(node, 'img'))
        if (images.length === 0) return [walk(child)]
        if (meaningful.length === images.length) return images

        const rest = meaningful.filter((node) => !isElement(node, 'img'))
        return [...images, walk({ ...child, children: rest })]
      })
      return { ...node, children }
    }

    return walk(tree)
  }
}

export type CalloutVariant = 'info' | 'tip' | 'success' | 'warning' | 'danger'

/** `> [!NOTE]` at the start of a blockquote's first paragraph. */
const CALLOUT_MARKER = /^\[!(\w+)\]\s*/

/** GitHub alert names plus our own, all folded onto the five rendered variants. */
const CALLOUT_VARIANTS: Record<string, CalloutVariant> = {
  note: 'info',
  info: 'info',
  important: 'warning',
  warning: 'warning',
  warn: 'warning',
  tip: 'tip',
  success: 'success',
  check: 'success',
  caution: 'danger',
  danger: 'danger',
}

export interface ParsedCallout {
  variant: CalloutVariant
  title?: string
  body?: ReactNode
}

/** Flattens React children to their text, so a heading id survives inline markup. */
export function toText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(toText).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return toText(node.props.children)
  return ''
}

/**
 * Turns a blockquote into a callout when it opens with a `[!TYPE]` marker, and returns
 * null for every other blockquote so ordinary quotes still render as quotes.
 *
 *     > [!WARNING]
 *     > **Set the allowlist first**
 *     >
 *     > A public key with no allowlist means anyone can embed your agent.
 */
export function parseCallout(children: ReactNode): ParsedCallout | null {
  // react-markdown interleaves "\n" string nodes between block elements, so the first
  // child is whitespace, not the paragraph the marker lives in.
  const blocks = Children.toArray(children).filter(
    (node) => !(typeof node === 'string' && node.trim() === '')
  )
  const [first, ...body] = blocks
  if (!isValidElement<{ children?: ReactNode }>(first) || first.type !== 'p') return null

  const [lead, ...rest] = Children.toArray(first.props.children)
  if (typeof lead !== 'string') return null

  const marker = CALLOUT_MARKER.exec(lead)
  if (!marker) return null

  // `> [!NOTE] Something` keeps "Something" — the marker regex would otherwise eat it.
  const inline = lead.slice(marker[0].length).trim()
  const title = [inline, toText(rest)].filter(Boolean).join(' ')

  return {
    variant: CALLOUT_VARIANTS[marker[1].toLowerCase()] ?? 'info',
    title: title || undefined,
    body: body.length > 0 ? body : undefined,
  }
}
