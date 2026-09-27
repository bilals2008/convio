import { Children, isValidElement, useState, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from 'lucide-react'
import { DocsCallout } from '@/components/docs/docs-callout'
import { DocsImage } from '@/components/docs/docs-image'
import { CodeBlock } from '@/components/shared/code-block'
import { slugify, parseCallout, toText, unwrapImages } from '@/lib/docs/markdown'

const PLACEHOLDER_SIZE = { width: 1280, height: 720 } as const

function HeadingLink({ id, children }: { id: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}${window.location.pathname}#${id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <a
      href={`#${id}`}
      onClick={handleCopy}
      className="group/link relative inline-flex items-center gap-1.5 no-underline"
      aria-label="Copy link to this section"
    >
      {children}
      <Link className="size-4 opacity-0 transition-opacity group-hover/link:opacity-60" aria-hidden="true" />
      {copied && <span className="sr-only">Link copied</span>}
    </a>
  )
}

const components: Components = {
  h2: ({ children }) => {
    const id = slugify(toText(children))
    return (
      <h2 id={id}>
        <HeadingLink id={id}>{children}</HeadingLink>
      </h2>
    )
  },
  h3: ({ children }) => {
    const id = slugify(toText(children))
    return (
      <h3 id={id}>
        <HeadingLink id={id}>{children}</HeadingLink>
      </h3>
    )
  },
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
