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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
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
    ? { text: 'Not linked', className: 'bg-muted text-muted-foreground' }
    : !status.found
      ? { text: 'Not found', className: 'bg-destructive/10 text-destructive' }
      : hasMismatch
        ? { text: 'Mismatch', className: 'bg-amber-500/10 text-amber-600' }
        : { text: 'Verified', className: 'bg-emerald-500/10 text-emerald-600' }

  return (
    <div className="rounded-lg border border-border/60 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{label}</span>
            <Badge variant="secondary" className={cn('shrink-0', chip.className)}>{chip.text}</Badge>
            {status.source === 'env' && <span className="text-[11px] text-muted-foreground">from .env</span>}
          </div>
          <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
            {status.productId ?? 'No Creem product linked'}
          </p>
        </div>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{formatCents(status.amountCents)}</span>
      </div>

      {status.product && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span>Creem: {status.product.name}</span>
          <span className={cn(status.product.status !== 'active' && 'text-destructive')}>{status.product.status}</span>
          <span>{status.product.trialPeriodDays ? `${status.product.trialPeriodDays}d trial` : 'no trial'}</span>
        </div>
      )}

      {status.mismatches.length > 0 && (
        <ul className="mt-2 space-y-1">
          {status.mismatches.map((m) => (
            <li key={m} className="flex items-start gap-1.5 text-[11px] text-amber-600">
              <AlertTriangle className="mt-0.5 size-3 shrink-0" />
              <span>{m}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {!hasId ? (
          <Button type="button" variant="outline" size="sm" onClick={onCreate} disabled={busy || actionsDisabled}>
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Plug className="size-3.5" />}
            Create in Creem
          </Button>
        ) : (
          <>
            <Button type="button" variant="outline" size="sm" onClick={onSync} disabled={busy || actionsDisabled || !status.found}>
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
              Sync to Creem
            </Button>
            {status.source === 'env' && (
              <Button type="button" variant="outline" size="sm" onClick={onLink} disabled={busy || actionsDisabled || !status.found}>
                {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Link2 className="size-3.5" />}
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
      if (isEdit && 'creemSync' in result.data) reportCreemSync(result.data.creemSync)
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44 w-full" />)}
          </div>
          <div className="space-y-6 lg:col-span-2">
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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/admin/pricing')}
          disabled={saving}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <ArrowLeft className="size-3.5" />
          Pricing
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/pricing')} disabled={saving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving || (isEdit && !formDirty)}>
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <ListChecks className="size-3.5" />}
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create plan'}
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{isEdit ? plan!.name : 'New plan'}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEdit ? 'Edit pricing, features, limits, and visibility. Changes apply immediately.' : 'Add a new plan. Changes apply immediately after saving.'}
        </p>
      </div>

      {mode && (
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg border p-3',
            mode === 'test' ? 'border-amber-500/30 bg-amber-500/5' : 'border-destructive/30 bg-destructive/5',
          )}
        >
          <Plug className={cn('size-4 shrink-0', mode === 'test' ? 'text-amber-600' : 'text-destructive')} />
          <div className="min-w-0 text-xs">
            <p className="font-medium text-foreground">
              {mode === 'test' ? 'Creem is in TEST mode' : 'Creem is in LIVE mode'}
            </p>
            <p className="text-muted-foreground">
              {mode === 'test'
                ? 'No real payments. Product IDs here only work in TEST.'
                : 'Changes affect real customers and payments.'}
            </p>
          </div>
        </div>
      )}

      <Separator />

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <CardSection icon={Tag} title="General" description="Identity and short description.">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Key" required error={form.formState.errors.key?.message} hint="Unique id used by billing, e.g. pro">
                <Input className="h-9 font-mono" placeholder="pro" disabled={!!plan} {...form.register('key')} />
              </FormField>
              <FormField label="Name" required error={form.formState.errors.name?.message}>
                <Input className="h-9" placeholder="Pro" {...form.register('name')} />
              </FormField>
            </div>
            <FormField label="Description" className="mt-4">
              <Input className="h-9" placeholder="For growing businesses" {...form.register('description')} />
            </FormField>
          </CardSection>

          <CardSection icon={CreditCard} title="Pricing" description="The amount charged per period. The yearly total and the price on the card are calculated from these.">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Monthly amount ($)" error={form.formState.errors.priceMonthly?.message} hint="Charged each month. Leave blank for a custom-priced plan.">
                <Input className="h-9" type="number" min="0" step="0.01" placeholder="39" {...form.register('priceMonthly')} />
              </FormField>
              <FormField label="Yearly discount %" error={form.formState.errors.yearlyDiscountPercent?.message} hint="Off the yearly total. 0 = no discount.">
                <Input className="h-9" type="number" min="0" max="99" step="1" {...form.register('yearlyDiscountPercent')} />
              </FormField>
              <FormField label="Period">
                <Input className="h-9" placeholder="/month" {...form.register('period')} />
              </FormField>
              <FormField
                label="Yearly amount ($)"
                hint={derivedYearly ? `Calculated — ${derivedYearly.label}/month when billed yearly` : 'Set a monthly amount to calculate this'}
              >
                <Input
                  className="h-9 bg-muted/40 tabular-nums"
                  readOnly
                  tabIndex={-1}
                  value={derivedYearly?.total ?? ''}
                  placeholder="—"
                />
              </FormField>
              <FormField
                label="Trial days"
                error={form.formState.errors.trialPeriodDays?.message}
                hint="Free trial at checkout, handled by Creem. Blank = no trial."
              >
                <Input className="h-9" type="number" min="1" max="365" placeholder="No trial" {...form.register('trialPeriodDays')} />
              </FormField>
            </div>
          </CardSection>

          <CardSection icon={Palette} title="Appearance" description="Badge, icon, button, and ordering on the pricing page.">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Badge">
                <Input className="h-9" placeholder="Most Popular" {...form.register('badge')} />
              </FormField>
              <FormField label="Icon">
                <NativeSelect className="w-full" {...form.register('icon')}>
                  <option value="">None</option>
                  <option value="zap">Zap</option>
                  <option value="star">Star</option>
                  <option value="shield">Shield</option>
                  <option value="crown">Crown</option>
                </NativeSelect>
              </FormField>
              <FormField label="CTA button">
                <Input className="h-9" placeholder="Get started" {...form.register('cta')} />
              </FormField>
              <FormField label="Href">
                <Input className="h-9" placeholder="/signup" {...form.register('href')} />
              </FormField>
              <FormField label="Button variant">
                <NativeSelect className="w-full" {...form.register('variant')}>
                  <option value="outline">Outline</option>
                  <option value="default">Default</option>
                </NativeSelect>
              </FormField>
              <FormField label="Icon color (tailwind)">
                <Input className="h-9" placeholder="text-primary" {...form.register('iconColor')} />
              </FormField>
            </div>
            <FormField label="Sort order" error={form.formState.errors.sortOrder?.message} className="mt-4 sm:max-w-[140px]">
              <Input className="h-9" type="number" min="0" step="1" {...form.register('sortOrder')} />
            </FormField>
          </CardSection>

          <CardSection icon={ListChecks} title="Features & limits" description="Feature bullets (one per line). Blank limit means unlimited.">
            <FormField label="Features (one per line)">
              <Textarea rows={8} className="font-mono text-xs" placeholder={'10 AI agents\n25,000 messages/mo\nAll channels'} {...form.register('featuresText')} />
            </FormField>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <FormField label="Agents" error={form.formState.errors.agents?.message}>
                <Input className="h-9" type="number" min="0" step="1" placeholder="∞" {...form.register('agents')} />
              </FormField>
              <FormField label="Messages / mo" error={form.formState.errors.messagesPerMonth?.message}>
                <Input className="h-9" type="number" min="0" step="1" placeholder="∞" {...form.register('messagesPerMonth')} />
              </FormField>
              <FormField label="Knowledge bases" error={form.formState.errors.knowledgeBases?.message}>
                <Input className="h-9" type="number" min="0" step="1" placeholder="∞" {...form.register('knowledgeBases')} />
              </FormField>
              <FormField label="Organizations" error={form.formState.errors.organizations?.message}>
                <Input className="h-9" type="number" min="0" step="1" placeholder="∞" {...form.register('organizations')} />
              </FormField>
            </div>
          </CardSection>

          {isEdit && (
            <Card className="border-destructive/30">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <AlertTriangle className="size-4.5" />
                </div>
                <div>
                  <CardTitle>Danger zone</CardTitle>
                  <CardDescription>Deleting a plan does not change organizations already on it.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDeleteOpen(true)}
                  disabled={saving || deleteMutation.isPending}
                  className="text-destructive hover:text-destructive"
                >
                  {deleteMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                  Delete plan
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="lg:sticky lg:top-6 lg:space-y-6">
            <CardSection icon={Eye} title="Visibility" description="Where the plan shows up.">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label className="text-xs font-medium">Highlighted</Label>
                    <p className="text-xs text-muted-foreground">Standout card on the pricing page.</p>
                  </div>
                  <Switch checked={isHighlighted} onCheckedChange={(c) => form.setValue('highlighted', c, { shouldDirty: true })} disabled={saving} />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label className="text-xs font-medium">Coming soon</Label>
                    <p className="text-xs text-muted-foreground">Shown but not purchasable yet.</p>
                  </div>
                  <Switch checked={isComingSoon} onCheckedChange={(c) => form.setValue('comingSoon', c, { shouldDirty: true })} disabled={saving} />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label className="text-xs font-medium">Active</Label>
                    <p className="text-xs text-muted-foreground">Visible on the public pricing page.</p>
                  </div>
                  <Switch checked={isActive} onCheckedChange={(c) => form.setValue('active', c, { shouldDirty: true })} disabled={saving} />
                </div>
              </div>
            </CardSection>

            <CardSection icon={Plug} title="Creem" description="Products that power checkout and webhook mapping. Saving a plan syncs linked products automatically.">
              {!isEdit || !plan ? (
                <p className="text-xs text-muted-foreground">
                  Save the plan first — Creem products are linked to a saved plan.
                </p>
              ) : formDirty ? (
                <p className="flex items-start gap-2 text-xs text-amber-600">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  Save your changes first, then create, sync, or link Creem products.
                </p>
              ) : creemStatus.isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <div className="space-y-3">
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
                    className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="size-3" />
                    Re-check
                  </button>
                </div>
              )}
            </CardSection>

            <CardSection icon={BadgeCheck} title="Preview" description="How this plan appears on the pricing page.">
              <div className={cn('rounded-xl border p-4', isHighlighted ? 'border-primary/40' : 'border-border/60')}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{previewName || 'Plan name'}</p>
                  {previewBadge && (
                    <Badge variant="secondary" className="border border-primary/20 bg-primary/15 text-primary">{previewBadge}</Badge>
                  )}
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-semibold tabular-nums">{previewPrice}</span>
                </div>
                {derivedYearly && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Yearly: {formatMoney(derivedYearly.total)} ({derivedYearly.label}/mo)
                  </p>
                )}
                {trialDays && (
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600">
                    <Check className="size-3" />
                    {trialDays}-day free trial at checkout
                  </p>
                )}
                {isComingSoon && <p className="mt-2 text-[11px] text-muted-foreground">Shown as coming soon</p>}
                {!isActive && <p className="mt-2 text-[11px] text-muted-foreground">Hidden from the pricing page</p>}
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
