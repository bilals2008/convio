import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  CircleCheck,
  Info,
  Lightbulb,
  OctagonAlert,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CalloutVariant } from '@/lib/docs/markdown'

interface Variant {
  icon: LucideIcon
  label: string
  /** A faint even wash — no left rule, no glowing border. Literal so Tailwind can see it. */
  wash: string
  /** Same hue on the icon. Literal, not derived from `wash` — the scanner needs the name. */
  hue: string
}

const VARIANTS: Record<CalloutVariant, Variant> = {
  info: { icon: Info, label: 'Note', wash: 'border-info/15 bg-info/[0.06]', hue: 'text-info' },
  tip: { icon: Lightbulb, label: 'Tip', wash: 'border-tip/15 bg-tip/[0.06]', hue: 'text-tip' },
  success: {
    icon: CircleCheck,
    label: 'Done',
    wash: 'border-success/15 bg-success/[0.06]',
    hue: 'text-success',
  },
  warning: {
    icon: TriangleAlert,
    label: 'Warning',
    wash: 'border-warning/20 bg-warning/[0.07]',
    hue: 'text-warning',
  },
  danger: {
    icon: OctagonAlert,
    label: 'Careful',
    wash: 'border-destructive/20 bg-destructive/[0.07]',
    hue: 'text-destructive',
  },
}

const calloutVariants = cva(
  'not-typeset my-6 flex gap-2.5 rounded-md border px-3.5 py-3',
  {
    variants: {
      variant: Object.fromEntries(
        Object.entries(VARIANTS).map(([name, value]) => [name, value.wash])
      ) as Record<CalloutVariant, string>,
    },
    defaultVariants: { variant: 'info' },
  }
)

/**
 * Authored in markdown as a blockquote marker, so no page needs bespoke markup:
 *
 *     > [!WARNING]
 *     > **Set the allowlist first**
 *     >
 *     > A public key with no allowlist means anyone can embed your agent.
 *
 * The first paragraph after the marker becomes the title; everything after the blank
 * line is the body. A missing title falls back to the variant's label.
 */
export function DocsCallout({
  variant = 'info',
  title,
  children,
  className,
}: {
  variant?: CalloutVariant
  title?: string
  children?: ReactNode
  className?: string
} & VariantProps<typeof calloutVariants>) {
  const { icon: Icon, label, hue } = VARIANTS[variant]

  return (
    <aside className={cn(calloutVariants({ variant }), className)}>
      <Icon className={cn('mt-px size-4 shrink-0', hue)} aria-hidden="true" />
      <div className="min-w-0 flex-1 text-sm leading-relaxed">
        <p className={cn('font-medium', title ? 'text-foreground' : hue)}>
          {title ?? label}
          {title ? <span className="sr-only">, {label}</span> : null}
        </p>
        {/* typeset is off above, so the inner paragraphs need their own rhythm. */}
        <div className="text-muted-foreground [&>p+p]:mt-2 [&>p]:mt-0">{children}</div>
      </div>
    </aside>
  )
}
