import { prisma, type Prisma } from '@convio/database'
import { PLANS } from '@convio/config'
import { createTtlCache } from './cache.js'

export interface PlanLimits {
  agents: number
  messagesPerMonth: number
  knowledgeBases: number
  organizations: number
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function formatUsd(value: number): string {
  return `$${Number.isInteger(value) ? value : value.toFixed(2)}`
}

// A plan has ONE price per period. The amounts are what the provider charges; the display
// strings the pricing page renders are derived from them here, so the two can never drift
// and an admin never has to type the same number twice. A plan with no amount is not
// self-serve, so it reads "Custom".
export function planDisplayPricing(amounts: {
  priceMonthly: number | null
  priceYearly: number | null
}): { price: string; yearlyPrice: string | null } {
  return {
    price: amounts.priceMonthly === null ? 'Custom' : formatUsd(amounts.priceMonthly),
    yearlyPrice: amounts.priceYearly === null ? null : formatUsd(round2(amounts.priceYearly / 12)),
  }
}

// Resolve the amounts a plan row will end up with. The yearly total is ALWAYS derived from
// the monthly amount and the discount, so there is no second figure to keep in step and a
// price edit can never leave a stale yearly amount behind.
export function planAmounts(
  before: { priceMonthly: number | null; priceYearly: number | null; yearlyDiscountPercent: number | null },
  patch: Record<string, unknown>,
): { monthly: number | null; discount: number | null; yearly: number | null } {
  type AmountKey = 'priceMonthly' | 'yearlyDiscountPercent'
  const pick = (key: AmountKey): number | null =>
    (key in patch ? (patch[key] as number | null) : before[key]) ?? null

  const monthly = pick('priceMonthly')
  const discount = pick('yearlyDiscountPercent')
  if (monthly === null) return { monthly, discount, yearly: null }
  return { monthly, discount, yearly: round2(monthly * 12 * (1 - (discount ?? 0) / 100)) }
}

// Write the derived display fields alongside whatever the caller sent.
export function withDerivedPricing(
  data: Record<string, unknown>,
  amounts: { monthly: number | null; discount: number | null; yearly: number | null },
): Record<string, unknown> {
  return {
    ...data,
    priceMonthly: amounts.monthly,
    yearlyDiscountPercent: amounts.discount,
    priceYearly: amounts.yearly,
    ...planDisplayPricing({ priceMonthly: amounts.monthly, priceYearly: amounts.yearly }),
  }
}

// Merge a limits patch onto the saved limits. `toPlanLimits` reads a MISSING key as
// unlimited, so replacing the object wholesale would silently turn every limit the caller
// did not mention into Infinity. Each limit has to be resolved individually.
export function mergeLimits(
  before: unknown,
  patch: unknown,
): { agents: number | null; messagesPerMonth: number | null; knowledgeBases: number | null; organizations: number | null } | undefined {
  if (patch === undefined) return undefined
  const prev = (before ?? {}) as Record<string, unknown>
  const next = (patch ?? {}) as Record<string, unknown>
  const pick = (key: string) => {
    if (key in next) return (next[key] ?? null) as number | null
    return (prev[key] ?? null) as number | null
  }
  return {
    agents: pick('agents'),
    messagesPerMonth: pick('messagesPerMonth'),
    knowledgeBases: pick('knowledgeBases'),
    organizations: pick('organizations'),
  }
}

export interface PlanDef {
  key: string
  label: string
  features: string[]
  limits: PlanLimits
  price: string
  priceMonthly: number
  comingSoon: boolean
  providerMonthlyProductId?: string
  providerYearlyProductId?: string
}

// The DB stores null for "unlimited"; the app uses Infinity internally.
export function toPlanLimits(raw: unknown): PlanLimits {
  const value = (raw ?? {}) as Partial<Record<keyof PlanLimits, number | null>>
  return {
    agents: value.agents ?? Infinity,
    messagesPerMonth: value.messagesPerMonth ?? Infinity,
    knowledgeBases: value.knowledgeBases ?? Infinity,
    organizations: value.organizations ?? Infinity,
  }
}

// Infinity does not survive JSON, so public responses send the string the UI expects.
export const UNLIMITED = 'unlimited' as const

export function toPublicLimits(raw: unknown): Record<keyof PlanLimits, number | typeof UNLIMITED> {
  const limits = toPlanLimits(raw)
  return {
    agents: limits.agents === Infinity ? UNLIMITED : limits.agents,
    messagesPerMonth: limits.messagesPerMonth === Infinity ? UNLIMITED : limits.messagesPerMonth,
    knowledgeBases: limits.knowledgeBases === Infinity ? UNLIMITED : limits.knowledgeBases,
    organizations: limits.organizations === Infinity ? UNLIMITED : limits.organizations,
  }
}

function toPlanDef(row: Prisma.PlanGetPayload<object>): PlanDef {
  const limits = toPlanLimits(row.limits)

  const features = (Array.isArray(row.features) ? row.features : [])
    .map((f: unknown) => {
      if (typeof f === 'string') return f
      if (f && typeof f === 'object' && 'text' in f) return (f as { text?: string }).text ?? ''
      return ''
    })
    .filter(Boolean)

  // The DB row is the admin-editable source of truth, but rows ship with null product
  // IDs, which made checkout reject every paid plan. Fall back to the env-configured
  // IDs so checkout works before an admin fills the table in.
  const staticPlan = PLANS[row.key] as
    | { providerMonthlyProductId?: string; providerYearlyProductId?: string }
    | undefined

  return {
    key: row.key,
    label: row.name,
    features,
    limits,
    price: planDisplayPricing({ priceMonthly: row.priceMonthly, priceYearly: row.priceYearly }).price,
    priceMonthly: row.priceMonthly ?? 0,
    comingSoon: row.comingSoon,
    providerMonthlyProductId: row.providerMonthlyProductId ?? staticPlan?.providerMonthlyProductId ?? undefined,
    providerYearlyProductId: row.providerYearlyProductId ?? staticPlan?.providerYearlyProductId ?? undefined,
  }
}

const plansCache = createTtlCache<PlanDef[]>(60_000)

export async function getAllPlans(): Promise<PlanDef[]> {
  const cached = plansCache.get('all')
  if (cached) return cached
  const rows = await prisma.plan.findMany({ orderBy: { sortOrder: 'asc' } })
  const plans = rows.map(toPlanDef)
  plansCache.set('all', plans)
  return plans
}

export async function getPlanDef(key: string): Promise<PlanDef | undefined> {
  const row = await prisma.plan.findUnique({ where: { key } })
  if (row) return toPlanDef(row)

  const staticPlan = PLANS[key]
  if (!staticPlan) return undefined
  return {
    key,
    label: staticPlan.label,
    features: [...staticPlan.features],
    limits: { ...staticPlan.limits },
    price: staticPlan.price,
    priceMonthly: staticPlan.priceMonthly,
    comingSoon: false,
    providerMonthlyProductId: (staticPlan as { providerMonthlyProductId?: string }).providerMonthlyProductId,
    providerYearlyProductId: (staticPlan as { providerYearlyProductId?: string }).providerYearlyProductId,
  }
}

// Tiers come from the plan rows alone, ordered by the admin-controlled sortOrder. Keys with
// no row are deliberately absent: fabricating a tier for them let a renamed or deleted plan
// key outrank every real plan.
export async function getPlanTierMap(): Promise<Record<string, number>> {
  const plans = await getAllPlans()
  const map: Record<string, number> = {}
  plans.forEach((p, i) => { map[p.key] = i })
  return map
}

export async function getPlanFromProductId(productId: string): Promise<string> {
  const plans = await getAllPlans()
  for (const p of plans) {
    if (p.providerMonthlyProductId === productId || p.providerYearlyProductId === productId) return p.key
  }
  for (const [key, plan] of Object.entries(PLANS)) {
    const p = plan as { providerMonthlyProductId?: string; providerYearlyProductId?: string }
    if (p.providerMonthlyProductId === productId || p.providerYearlyProductId === productId) return key
  }
  return 'free'
}
