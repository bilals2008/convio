import { Children, isValidElement, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { DocsCallout } from '@/components/docs/docs-callout'
import { DocsImage } from '@/components/docs/docs-image'
import { CodeBlock } from '@/components/shared/code-block'
import { slugify, parseCallout, toText, unwrapImages } from '@/lib/docs/markdown'

/** Docs screenshots are 16:9 until a real capture says otherwise. */
const PLACEHOLDER_SIZE = { width: 1280, height: 720 } as const

const components: Components = {
  // Ids come from the shared slugify so they always match DocHeading[] in the TOC —
  // including headings whose children are a mix of text and inline markup.
  h2: ({ children }) => <h2 id={slugify(toText(children))}>{children}</h2>,
  h3: ({ children }) => <h3 id={slugify(toText(children))}>{children}</h3>,
  pre({ children }) {
    const child = Children.only(children)
    if (!isValidElement(child)) return null

    const { className, children: code } = child.props as { className?: string; children?: ReactNode }
    return <CodeBlock code={String(code).replace(/\n$/, '')} language={/language-(\w+)/.exec(className ?? '')?.[1]} />
  },
  blockquote({ children }) {
    const callout = parseCallout(children)
    if (!callout) return <blockquote>{children}</blockquote>
    return (
      <DocsCallout variant={callout.variant} title={callout.title}>
        {callout.body}
      </DocsCallout>
    )
  },
  img: ({ src, alt, title }) => (
    <DocsImage
      src={typeof src === 'string' ? src : ''}
      alt={alt ?? ''}
      width={PLACEHOLDER_SIZE.width}
      height={PLACEHOLDER_SIZE.height}
      caption={title}
    />
  ),
}

export function DocsContent({ body }: { body: string }) {
  return (
    <article className="typeset typeset-docs max-w-[44rem]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[unwrapImages]} components={components}>
        {body}
      </ReactMarkdown>
    </article>
  )
}
