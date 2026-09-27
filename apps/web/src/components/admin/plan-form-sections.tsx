import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  hint?: string
  className?: string
  children: ReactNode
}

export function FormField({ label, required, error, hint, className, children }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-xs font-medium">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

interface CardSectionProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  children: ReactNode
}

export function CardSection({ icon: Icon, title, description, children }: CardSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2.5 px-4 pt-4 pb-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-3.5" />
        </div>
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription className="mt-0.5">{description}</CardDescription>}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">{children}</CardContent>
    </Card>
  )
}
