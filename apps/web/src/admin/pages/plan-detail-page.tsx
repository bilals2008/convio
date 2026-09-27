import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Check,
  CreditCard,
  Eye,
  Link2,
  ListChecks,
  Loader2,
  Palette,
  Plug,
  RefreshCw,
  Tag,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { FormField, CardSection } from '@/components/admin/plan-form-sections'
import { toast } from '@/lib/toast'
import {
  useAdminPlans,
  useCreateCreemProduct,
  useCreemStatus,
  useLinkCreemProduct,
  usePlanCreemStatus,
  useSyncCreemProduct,
} from '@/admin/hooks/use-admin'
import {
  adminApi,
  type AdminPlan,
  type CreemPeriod,
  type CreemSyncResult,
  type PlanCreemPeriodStatus,
} from '@/admin/services/admin-api'
import { cn } from '@/lib/utils'

// A blank limit means unlimited, so a typo must not become "unlimited" by accident: NaN
// serialises to null on the wire, which the API reads as no limit. Reject it here.
const limitValue = z.string().refine((v) => v.trim() === '' || (!Number.isNaN(Number(v)) && Number(v) >= 0), {
  message: 'Enter a number',
})

// The API caps these too. Mirroring the caps here turns a raw "Validation failed" toast
// into an inline field error; the server stays the authority.
const planFormSchema = z.object({
  key: z.string().trim().min(1, 'Plan key is required').max(50, 'Key must be 50 characters or less'),
  name: z.string().trim().min(1, 'Plan name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(300, 'Description must be 300 characters or less'),
  priceMonthly: z.string().refine((v) => v.trim() === '' || (!Number.isNaN(Number(v)) && Number(v) >= 0), { message: 'Enter a number' }),
  yearlyDiscountPercent: z.string().refine(
    (v) => v.trim() !== '' && !Number.isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 99,
    { message: 'Enter 0–99' },
  ),
  period: z.string().max(20, 'Must be 20 characters or less'),
  badge: z.string().max(50, 'Must be 50 characters or less'),
  cta: z.string().max(50, 'Must be 50 characters or less'),
  href: z.string().max(300, 'Must be 300 characters or less'),
  variant: z.string(),
  icon: z.string().max(30, 'Must be 30 characters or less'),
  iconColor: z.string().max(50, 'Must be 50 characters or less'),
  sortOrder: z.string().refine((v) => v.trim() === '' || (!Number.isNaN(Number(v)) && Number(v) >= 0), { message: 'Enter a number or higher' }),
  trialPeriodDays: z.string().refine((v) => v.trim() === '' || (Number(v) >= 1 && Number(v) <= 365), { message: 'Enter 1–365' }),
  highlighted: z.boolean(),
  comingSoon: z.boolean(),
  active: z.boolean(),
  featuresText: z.string().refine(
    (v) => v.split('\n').filter((l) => l.trim()).length <= 100 && v.split('\n').every((l) => l.trim().length <= 200),
    { message: 'Max 100 lines, 200 characters each' },
  ),
  agents: limitValue,
  messagesPerMonth: limitValue,
  knowledgeBases: limitValue,
  organizations: limitValue,
  providerMonthlyProductId: z.string().max(200, 'Must be 200 characters or less'),
  providerYearlyProductId: z.string().max(200, 'Must be 200 characters or less'),
})

type PlanFormValues = z.infer<typeof planFormSchema>

const CREATE_DEFAULTS: PlanFormValues = {
  key: '',
  name: '',
  description: '',
  priceMonthly: '',
  yearlyDiscountPercent: '0',
  period: '',
  badge: '',
  cta: '',
  href: '',
  variant: 'outline',
  icon: '',
  iconColor: '',
  sortOrder: '0',
  trialPeriodDays: '',
  highlighted: false,
  comingSoon: false,
  active: true,
  featuresText: '',
  agents: '',
  messagesPerMonth: '',
  knowledgeBases: '',
  organizations: '',
  providerMonthlyProductId: '',
  providerYearlyProductId: '',
}

const toPlanValues = (plan?: AdminPlan): PlanFormValues => ({
  key: plan?.key ?? '',
  name: plan?.name ?? '',
  description: plan?.description ?? '',
  priceMonthly: plan?.priceMonthly?.toString() ?? '',
  yearlyDiscountPercent: plan?.yearlyDiscountPercent?.toString() ?? '0',
  period: plan?.period ?? '',
  badge: plan?.badge ?? '',
  cta: plan?.cta ?? '',
  href: plan?.href ?? '',
  variant: plan?.variant ?? 'outline',
  icon: plan?.icon ?? '',
  iconColor: plan?.iconColor ?? '',
  sortOrder: plan?.sortOrder?.toString() ?? '0',
  trialPeriodDays: plan?.trialPeriodDays?.toString() ?? '',
  highlighted: plan?.highlighted ?? false,
  comingSoon: plan?.comingSoon ?? false,
  active: plan?.active ?? true,
  featuresText: (plan?.features ?? []).map((f) => f.text).join('\n'),
  agents: plan?.limits?.agents?.toString() ?? '',
  messagesPerMonth: plan?.limits?.messagesPerMonth?.toString() ?? '',
  knowledgeBases: plan?.limits?.knowledgeBases?.toString() ?? '',
  organizations: plan?.limits?.organizations?.toString() ?? '',
  providerMonthlyProductId: plan?.providerMonthlyProductId ?? '',
  providerYearlyProductId: plan?.providerYearlyProductId ?? '',
})

function formatCents(cents: number | null, currency = 'USD') {
  if (cents === null) return '—'
  return `${(cents / 100).toFixed(2)} ${currency}`
}

function formatMoney(value: number) {
  return `$${Number.isInteger(value) ? value : value.toFixed(2)}`
}

// Mirrors the API rule: the yearly total is always derived from the monthly amount.
function deriveYearly(monthly: number, discountPercent: number) {
  const total = Math.round(monthly * 12 * (1 - discountPercent / 100) * 100) / 100
  const perMonth = Math.round((total / 12) * 100) / 100
  return { total, label: formatMoney(perMonth) }
}

// A save pushes Creem-relevant changes to linked products. Sync trouble is loud on
// purpose: checkout would otherwise keep charging the old amount.
function reportCreemSync(results: CreemSyncResult[]) {
  const periodLabel = (period: CreemPeriod) => (period === 'yearly' ? 'yearly' : 'monthly')
  const failed = results.filter((r) => r.status === 'failed')
  const skipped = results.filter((r) => r.status === 'skipped')
  const synced = results.filter((r) => r.status === 'synced')

  if (failed.length > 0) {
    const detail = failed.map((r) => `${periodLabel(r.period)}: ${r.message ?? 'sync failed'}`).join('; ')
    toast.error(`Plan saved, but Creem sync failed — ${detail}`)
  } else if (skipped.length > 0) {
    const detail = skipped.map((r) => `${periodLabel(r.period)}: ${r.message ?? 'not updated'}`).join('; ')
    toast.warning(`Plan saved. Creem not updated — ${detail}`)
  } else if (synced.length > 0) {
    toast.success(`Plan updated and synced to Creem (${synced.map((r) => periodLabel(r.period)).join(' + ')})`)
  } else {
    toast.success('Plan updated')
  }
}

const CREEM_CHIP_VARIANT = {
  notLinked: 'inactive',
  notFound: 'failed',
  mismatch: 'pending',
  verified: 'active',
} as const

function CreemPeriodRow({
  label,
  status,
  busy,
  actionsDisabled,
  onCreate,
  onSync,
  onLink,
}: {
  label: string
  status: PlanCreemPeriodStatus
  busy: boolean
  actionsDisabled: boolean
  onCreate: () => void
  onSync: () => void
  onLink: () => void
}) {
  const hasId = !!status.productId
  const hasMismatch = status.found && status.mismatches.length > 0

  const chip = !hasId
    ? CREEM_CHIP_VARIANT.notLinked
    : !status.found
      ? CREEM_CHIP_VARIANT.notFound
      : hasMismatch
        ? CREEM_CHIP_VARIANT.mismatch
        : CREEM_CHIP_VARIANT.verified
  const chipText = !hasId ? 'Not linked' : !status.found ? 'Not found' : hasMismatch ? 'Mismatch' : 'Verified'

  return (
    <div className="rounded-lg border border-border/60 p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium">{label}</span>
            <Badge variant={chip} className="shrink-0">{chipText}</Badge>
            {status.source === 'env' && <span className="text-[11px] text-muted-foreground">from .env</span>}
          </div>
          <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
            {status.productId ?? 'No Creem product linked'}
          </p>
        </div>
        <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{formatCents(status.amountCents)}</span>
      </div>

      {status.product && (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-muted-foreground">
          <span className="truncate">{status.product.name}</span>
          <span className={cn(status.product.status !== 'active' && 'text-destructive')}>{status.product.status}</span>
          <span>{status.product.trialPeriodDays ? `${status.product.trialPeriodDays}d trial` : 'no trial'}</span>
        </div>
      )}

      {status.mismatches.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {status.mismatches.map((m) => (
            <li key={m} className="flex items-start gap-1.5 text-[11px] text-warning">
              <AlertTriangle className="mt-0.5 size-3 shrink-0" />
              <span>{m}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {!hasId ? (
          <Button type="button" variant="outline" size="xs" onClick={onCreate} disabled={busy || actionsDisabled}>
            {busy ? <Loader2 className="size-3 animate-spin" /> : <Plug className="size-3" />}
            Create in Creem
          </Button>
        ) : (
          <>
            <Button type="button" variant="outline" size="xs" onClick={onSync} disabled={busy || actionsDisabled || !status.found}>
              {busy ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
              Sync to Creem
            </Button>
            {status.source === 'env' && (
              <Button type="button" variant="outline" size="xs" onClick={onLink} disabled={busy || actionsDisabled || !status.found}>
                {busy ? <Loader2 className="size-3 animate-spin" /> : <Link2 className="size-3" />}
                Save to plan
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function AdminPlanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = id !== 'new'

  const { data: plans, isLoading } = useAdminPlans()
  const plan = useMemo(() => (isEdit ? plans?.find((p) => p.id === id) : undefined), [plans, id, isEdit])
  const formValues = useMemo(() => (plan ? toPlanValues(plan) : CREATE_DEFAULTS), [plan])

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [busyPeriod, setBusyPeriod] = useState<CreemPeriod | null>(null)

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    values: formValues,
  })

  const creemGlobal = useCreemStatus()
  const creemStatus = usePlanCreemStatus(plan?.id, isEdit && !!plan)
  const createCreem = useCreateCreemProduct(plan?.id ?? '')
  const syncCreem = useSyncCreemProduct(plan?.id ?? '')
  const linkCreem = useLinkCreemProduct(plan?.id ?? '')

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      isEdit && plan ? adminApi.updatePlan(plan.id, payload) : adminApi.createPlan(payload),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'creem'] })
      // The public pricing pages render these same plan rows.
      queryClient.invalidateQueries({ queryKey: ['pricing', 'plans'] })
      if (isEdit && 'creemSync' in result.data) reportCreemSync(result.data.creemSync as CreemSyncResult[])
      else toast.success('Plan created')
      navigate('/admin/pricing')
    },
    onError: (error: Error) => toast.error(error.message || 'Unable to save plan. Please try again.'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deletePlan(plan!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'creem'] })
      queryClient.invalidateQueries({ queryKey: ['pricing', 'plans'] })
      toast.success('Plan deleted')
      navigate('/admin/pricing')
    },
    onError: (error: Error) => toast.error(error.message || 'Unable to delete plan.'),
  })

  const saving = saveMutation.isPending
  const formDirty = form.formState.isDirty

  const isHighlighted = useWatch({ control: form.control, name: 'highlighted' })
  const isComingSoon = useWatch({ control: form.control, name: 'comingSoon' })
  const isActive = useWatch({ control: form.control, name: 'active' })
  const trialDays = useWatch({ control: form.control, name: 'trialPeriodDays' })
  const previewName = useWatch({ control: form.control, name: 'name' })
  const previewBadge = useWatch({ control: form.control, name: 'badge' })
  const discountInput = useWatch({ control: form.control, name: 'yearlyDiscountPercent' })
  const monthlyInput = useWatch({ control: form.control, name: 'priceMonthly' })
  // The yearly total is always derived, exactly as the API derives it, so the form and the
  // pricing card can never show different numbers.
  const derivedYearly = useMemo(() => {
    const monthly = Number(monthlyInput)
    const discount = Number(discountInput)
    if (monthlyInput.trim() === '' || Number.isNaN(monthly) || Number.isNaN(discount)) return null
    return deriveYearly(monthly, discount)
  }, [monthlyInput, discountInput])
  const previewPrice =
    monthlyInput.trim() === '' || Number.isNaN(Number(monthlyInput)) ? '—' : formatMoney(Number(monthlyInput))

  const handleSubmit = form.handleSubmit((data) => {
    const num = (s: string) => (s.trim() === '' ? null : Number(s))
    // Only the monthly amount and the discount are entered; the yearly total and the price
    // shown on the card come back derived from them.
    saveMutation.mutate({
      key: data.key.trim(),
      name: data.name.trim(),
      description: data.description || null,
      priceMonthly: num(data.priceMonthly),
      yearlyDiscountPercent: num(data.yearlyDiscountPercent),
      period: data.period || null,
      badge: data.badge || null,
      highlighted: data.highlighted,
      comingSoon: data.comingSoon,
      active: data.active,
      cta: data.cta || null,
      href: data.href || null,
      variant: (data.variant as 'default' | 'outline') || null,
      icon: data.icon || null,
      iconColor: data.iconColor || null,
      sortOrder: num(data.sortOrder) ?? 0,
      trialPeriodDays: num(data.trialPeriodDays),
      features: data.featuresText.split('\n').map((t) => t.trim()).filter(Boolean).map((text) => ({ text })),
      limits: {
        agents: num(data.agents),
        messagesPerMonth: num(data.messagesPerMonth),
        knowledgeBases: num(data.knowledgeBases),
        organizations: num(data.organizations),
      },
      providerMonthlyProductId: data.providerMonthlyProductId || null,
      providerYearlyProductId: data.providerYearlyProductId || null,
    })
  })

  // Cmd/Ctrl+S saves, matching the rest of the admin panel.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        if (!saving) void handleSubmit()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleSubmit, saving])

  // The Creem actions read the saved plan, so they must not run on unsaved edits.
  const runCreemAction = async (period: CreemPeriod, action: () => Promise<unknown>) => {
    setBusyPeriod(period)
    try {
      await action()
    } catch {
      // useCreemMutation already surfaces the error as a toast.
    } finally {
      setBusyPeriod(null)
    }
  }

  if (isEdit && isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
          </div>
          <div className="space-y-5 lg:col-span-2">
            {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
          </div>
        </div>
      </div>
    )
  }

  if (isEdit && !plan) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">Plan not found.</p>
        <Button variant="link" onClick={() => navigate('/admin/pricing')}>Back to plans</Button>
      </div>
    )
  }

  const mode = creemGlobal.data?.mode
  const periods = creemStatus.data?.periods ?? []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate('/admin/pricing')}
            disabled={saving}
            aria-label="Back to pricing"
          >
            <ArrowLeft className="size-3.5" />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight">{isEdit ? plan!.name : 'New plan'}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/pricing')} disabled={saving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving || (isEdit && !formDirty)}>
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <ListChecks data-icon="inline-start" />}
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create plan'}
          </Button>
        </div>
      </div>

      {mode && (
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-lg border px-3 py-2',
            mode === 'test' ? 'border-warning/30 bg-warning/5' : 'border-destructive/30 bg-destructive/5',
          )}
        >
          <Plug className={cn('size-3.5 shrink-0', mode === 'test' ? 'text-warning' : 'text-destructive')} />
          <p className="min-w-0 truncate text-xs">
            <span className="font-medium text-foreground">
              {mode === 'test' ? 'Creem is in TEST mode' : 'Creem is in LIVE mode'}.
            </span>{' '}
            <span className="text-muted-foreground">
              {mode === 'test'
                ? 'No real payments — product IDs only work in TEST.'
                : 'Changes affect real customers and payments.'}
            </span>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <CardSection icon={Tag} title="General">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <FormField label="Key" required error={form.formState.errors.key?.message} hint="Unique billing id, e.g. pro">
                <Input className="h-8 font-mono" placeholder="pro" disabled={!!plan} {...form.register('key')} />
              </FormField>
              <FormField label="Name" required error={form.formState.errors.name?.message}>
                <Input className="h-8" placeholder="Pro" {...form.register('name')} />
              </FormField>
            </div>
            <FormField label="Description" className="mt-3.5">
              <Input className="h-8" placeholder="For growing businesses" {...form.register('description')} />
            </FormField>
          </CardSection>

          <CardSection icon={CreditCard} title="Pricing" description="Yearly total is calculated from the monthly amount and discount.">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <FormField label="Monthly amount ($)" error={form.formState.errors.priceMonthly?.message} hint="Blank = custom-priced plan">
                <Input className="h-8" type="number" min="0" step="0.01" placeholder="39" {...form.register('priceMonthly')} />
              </FormField>
              <FormField label="Yearly discount %" error={form.formState.errors.yearlyDiscountPercent?.message} hint="0 = no discount">
                <Input className="h-8" type="number" min="0" max="99" step="1" {...form.register('yearlyDiscountPercent')} />
              </FormField>
              <FormField label="Period">
                <Input className="h-8" placeholder="/month" {...form.register('period')} />
              </FormField>
              <FormField
                label="Yearly amount ($)"
                hint={derivedYearly ? `${derivedYearly.label}/mo when billed yearly` : 'Set a monthly amount'}
              >
                <Input
                  className="h-8 bg-muted/40 tabular-nums"
                  readOnly
                  tabIndex={-1}
                  value={derivedYearly?.total ?? ''}
                  placeholder="—"
                />
              </FormField>
              <FormField
                label="Trial days"
                error={form.formState.errors.trialPeriodDays?.message}
                hint="Blank = no trial"
              >
                <Input className="h-8" type="number" min="1" max="365" placeholder="No trial" {...form.register('trialPeriodDays')} />
              </FormField>
            </div>
          </CardSection>

          <CardSection icon={Palette} title="Appearance">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <FormField label="Badge">
                <Input className="h-8" placeholder="Most Popular" {...form.register('badge')} />
              </FormField>
              <FormField label="Icon">
                <NativeSelect className="h-8 w-full" {...form.register('icon')}>
                  <option value="">None</option>
                  <option value="zap">Zap</option>
                  <option value="star">Star</option>
                  <option value="shield">Shield</option>
                  <option value="crown">Crown</option>
                </NativeSelect>
              </FormField>
              <FormField label="CTA button">
                <Input className="h-8" placeholder="Get started" {...form.register('cta')} />
              </FormField>
              <FormField label="Href">
                <Input className="h-8" placeholder="/signup" {...form.register('href')} />
              </FormField>
              <FormField label="Button variant">
                <NativeSelect className="h-8 w-full" {...form.register('variant')}>
                  <option value="outline">Outline</option>
                  <option value="default">Default</option>
                </NativeSelect>
              </FormField>
              <FormField label="Icon color (tailwind)">
                <Input className="h-8" placeholder="text-primary" {...form.register('iconColor')} />
              </FormField>
              <FormField label="Sort order" error={form.formState.errors.sortOrder?.message} className="sm:max-w-[140px]">
                <Input className="h-8" type="number" min="0" step="1" {...form.register('sortOrder')} />
              </FormField>
            </div>
          </CardSection>

          <CardSection icon={ListChecks} title="Features & limits" description="One feature per line. Blank limit = unlimited.">
            <FormField label="Features (one per line)">
              <Textarea rows={7} className="font-mono text-xs" placeholder={'10 AI agents\n25,000 messages/mo\nAll channels'} {...form.register('featuresText')} />
            </FormField>
            <div className="mt-3.5 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
              <FormField label="Agents" error={form.formState.errors.agents?.message}>
                <Input className="h-8" type="number" min="0" step="1" placeholder="∞" {...form.register('agents')} />
              </FormField>
              <FormField label="Messages / mo" error={form.formState.errors.messagesPerMonth?.message}>
                <Input className="h-8" type="number" min="0" step="1" placeholder="∞" {...form.register('messagesPerMonth')} />
              </FormField>
              <FormField label="Knowledge bases" error={form.formState.errors.knowledgeBases?.message}>
                <Input className="h-8" type="number" min="0" step="1" placeholder="∞" {...form.register('knowledgeBases')} />
              </FormField>
              <FormField label="Organizations" error={form.formState.errors.organizations?.message}>
                <Input className="h-8" type="number" min="0" step="1" placeholder="∞" {...form.register('organizations')} />
              </FormField>
            </div>
          </CardSection>

          {isEdit && (
            <Card className="border-destructive/30">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <CardTitle>Danger zone</CardTitle>
                  <CardDescription className="mt-0.5">Organizations already on this plan keep their access.</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDeleteOpen(true)}
                  disabled={saving || deleteMutation.isPending}
                  className="shrink-0 text-destructive hover:text-destructive"
                >
                  {deleteMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                  Delete plan
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-5 lg:col-span-2">
          <div className="lg:sticky lg:top-5 lg:space-y-5">
            <CardSection icon={Eye} title="Visibility">
              <div className="space-y-3">
                {([
                  { name: 'highlighted' as const, watched: isHighlighted, label: 'Highlighted', hint: 'Standout card on the pricing page.' },
                  { name: 'comingSoon' as const, watched: isComingSoon, label: 'Coming soon', hint: 'Shown but not purchasable yet.' },
                  { name: 'active' as const, watched: isActive, label: 'Active', hint: 'Visible on the public pricing page.' },
                ]).map(({ name, watched, label, hint }) => (
                  <div key={name} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <Label className="text-xs font-medium">{label}</Label>
                      <p className="text-[11px] text-muted-foreground">{hint}</p>
                    </div>
                    <Switch
                      checked={watched}
                      onCheckedChange={(c) => form.setValue(name, c, { shouldDirty: true })}
                      disabled={saving}
                    />
                  </div>
                ))}
              </div>
            </CardSection>

            <CardSection icon={Plug} title="Creem" description="Checkout products. Saving syncs linked products automatically.">
              {!isEdit || !plan ? (
                <p className="text-xs text-muted-foreground">
                  Save the plan first — Creem products are linked to a saved plan.
                </p>
              ) : formDirty ? (
                <p className="flex items-start gap-1.5 text-xs text-warning">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  Save your changes first, then create, sync, or link Creem products.
                </p>
              ) : creemStatus.isLoading ? (
                <div className="space-y-2.5">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <div className="space-y-2.5">
                  {periods.map((p) => (
                    <CreemPeriodRow
                      key={p.period}
                      label={p.period === 'yearly' ? 'Yearly' : 'Monthly'}
                      status={p}
                      busy={busyPeriod === p.period}
                      actionsDisabled={saving}
                      onCreate={() => runCreemAction(p.period, () => createCreem.mutateAsync({ period: p.period }))}
                      onSync={() => runCreemAction(p.period, () => syncCreem.mutateAsync({ period: p.period }))}
                      onLink={() => runCreemAction(p.period, () => linkCreem.mutateAsync({ period: p.period }))}
                    />
                  ))}
                  {creemGlobal.data && !creemGlobal.data.configured && (
                    <p className="text-xs text-destructive">Creem API key is not configured on the server.</p>
                  )}
                  <button
                    type="button"
                    onClick={() => creemStatus.refetch()}
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="size-3" />
                    Re-check
                  </button>
                </div>
              )}
            </CardSection>

            <CardSection icon={BadgeCheck} title="Preview">
              <div className={cn('rounded-xl border p-3.5', isHighlighted ? 'border-primary/40' : 'border-border/60')}>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{previewName || 'Plan name'}</p>
                  {previewBadge && <Badge variant="pro">{previewBadge}</Badge>}
                </div>
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="text-xl font-semibold tabular-nums">{previewPrice}</span>
                  {derivedYearly && (
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      / {formatMoney(derivedYearly.total)} yearly
                    </span>
                  )}
                </div>
                {trialDays && (
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] text-success">
                    <Check className="size-3" />
                    {trialDays}-day free trial
                  </p>
                )}
                {isComingSoon && <p className="mt-1.5 text-[11px] text-muted-foreground">Shown as coming soon</p>}
                {!isActive && <p className="mt-1.5 text-[11px] text-muted-foreground">Hidden from the pricing page</p>}
              </div>
            </CardSection>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title={`Delete the "${plan?.name}" plan?`}
        description="Organizations already on this plan keep their access, but the plan disappears from the pricing page and can no longer be purchased."
        confirmText="Delete plan"
        variant="destructive"
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  )
}
