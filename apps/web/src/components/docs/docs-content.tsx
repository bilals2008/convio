import { Children, isValidElement, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CodeBlock } from '@/components/shared/code-block'

const components: Components = {
  h1: ({ children }) => <h1 id={headingId(children)}>{children}</h1>,
  h2: ({ children }) => <h2 id={headingId(children)}>{children}</h2>,
  h3: ({ children }) => <h3 id={headingId(children)}>{children}</h3>,
  pre({ children }) {
    const child = Children.only(children)
    if (!isValidElement(child)) return null

    const { className, children: code } = child.props as { className?: string; children?: ReactNode }
    return <CodeBlock code={String(code).replace(/\n$/, '')} language={/language-(\w+)/.exec(className ?? '')?.[1]} />
  },
}

function headingId(children: ReactNode): string | undefined {
  if (typeof children === 'string') {
    return children
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  }
  return undefined
}

export function DocsContent({ body }: { body: string }) {
  return (
    <article className="typeset typeset-docs max-w-[42rem]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {body}
      </ReactMarkdown>
    </article>
  )
}
