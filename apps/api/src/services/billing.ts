import { prisma } from '@convio/database'
import type { BillingPlan } from '@convio/types'
import { getPlanDef, getPlanTierMap } from './plans.js'

// ponytail: in-memory TTL cache; switch to Redis when the API runs multi-instance.
interface OrgUsage {
  month: number
  year: number
  conversations: number
  messages: number
  limit: number
  messagesPercent: number
}

const usageCache = new Map<string, { expiresAt: number; value: OrgUsage }>()
const USAGE_CACHE_TTL_MS = 60_000

async function computeOrgUsage(orgId: string, month: number, year: number) {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0, 23, 59, 59, 999)

  const [messages, conversations] = await Promise.all([
    prisma.message.count({
      where: {
        createdAt: { gte: firstDay, lte: lastDay },
        conversation: { agent: { organizationId: orgId } },
      },
    }),
    prisma.conversation.count({
      where: {
        createdAt: { gte: firstDay, lte: lastDay },
        agent: { organizationId: orgId },
      },
    }),
  ])

  return { conversations, messages }
}

export async function getOrgPlan(orgId: string): Promise<BillingPlan> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { plan: true },
  })

  if (!org) throw new Error('Organization not found')

  let planKey = org.plan as string
  let trialEndsAt: Date | null = null
  let isTrial = false

  if (planKey === 'pro') {
    const trialSub = await prisma.subscription.findFirst({
      where: {
        customer: { organizationId: orgId },
        status: 'on_trial',
      },
      orderBy: { createdAt: 'desc' },
    })

    if (trialSub) {
      if (trialSub.trialEndsAt && new Date() > trialSub.trialEndsAt) {
        planKey = 'free'
        await prisma.organization.update({
          where: { id: orgId },
          data: { plan: 'free' },
        })
        await prisma.subscription.update({
          where: { id: trialSub.id },
          data: { status: 'expired' },
        })
      } else {
        trialEndsAt = trialSub.trialEndsAt
        isTrial = true
      }
    }
  }

  const planDef = await getPlanDef(planKey)
  // A plan row that no longer exists (deleted, or renamed) must not report the dangling
  // key: the feature gates are deny-lists keyed on the name, so a paid-looking name with
  // free limits would grant paid features. Fall back to free for BOTH halves.
  const resolved = planDef ? planKey : 'free'
  const def = planDef ?? (await getPlanDef('free'))!

  return {
    name: resolved as BillingPlan['name'],
    label: def.label,
    features: def.features,
    limits: def.limits,
    price: def.price,
    priceMonthly: def.priceMonthly,
    trialEndsAt: trialEndsAt?.toISOString() ?? null,
    isTrial,
  }
}

export async function getOrgUsage(orgId: string, month?: number, year?: number): Promise<OrgUsage> {
  const now = new Date()
  const targetMonth = month ?? now.getMonth() + 1
  const targetYear = year ?? now.getFullYear()

  const cacheKey = `${orgId}:${targetYear}-${targetMonth}`
  const cached = usageCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }

  // Live count from Message/Conversation — the Analytics snapshot table was
  // never written, so reading it silently made plan limits decorative.
  const { conversations, messages } = await computeOrgUsage(orgId, targetMonth, targetYear)

  const plan = await getOrgPlan(orgId)

  const value = {
    month: targetMonth,
    year: targetYear,
    conversations,
    messages,
    limit: plan.limits.messagesPerMonth,
    // A 0 limit blocks everything, so dividing by it would yield Infinity — which
    // serialises to null and renders as "0% used" on an org that is fully blocked.
    messagesPercent: plan.limits.messagesPerMonth > 0
      ? Math.min(100, Math.round((messages / plan.limits.messagesPerMonth) * 100))
      : messages > 0 ? 100 : 0,
  }

  usageCache.set(cacheKey, { expiresAt: Date.now() + USAGE_CACHE_TTL_MS, value })
  return value
}

export async function checkAgentLimit(orgId: string) {
  const plan = await getOrgPlan(orgId)
  const limit = plan.limits.agents

  const count = await prisma.agent.count({
    where: { organizationId: orgId },
  })

  return {
    allowed: limit === Infinity || count < limit,
    current: count,
    limit,
  }
}

export async function checkMessageLimit(orgId: string) {
  const usage = await getOrgUsage(orgId)
  const limit = usage.limit

  return {
    allowed: limit === Infinity || usage.messages < limit,
    current: usage.messages,
    limit,
  }
}

export async function checkKnowledgeBaseLimit(orgId: string) {
  const plan = await getOrgPlan(orgId)
  const limit = plan.limits.knowledgeBases

  const count = await prisma.knowledgeBase.count({
    where: { organizationId: orgId },
  })

  return {
    allowed: limit === Infinity || count < limit,
    current: count,
    limit,
  }
}

export const MESSAGE_LIMIT_NOTICE = 'This conversation has reached its monthly message limit.'

// Channel handlers (WhatsApp, Slack, Discord, Telegram, SMS) have no HTTP response to
// reject with, so they meter before writing anything: over the limit means no rows stored
// and no model call, and the contact is told why.
export async function overMessageLimit(orgId: string): Promise<boolean> {
  const { allowed } = await checkMessageLimit(orgId)
  return !allowed
}

export async function checkOrgLimit(userId: string) {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: { organization: true },
  })

  const orgCount = memberships.length
  const tierMap = await getPlanTierMap()
  // A user gets the org allowance of their best plan. An org whose plan key has no row is
  // on no plan, so it must sit BELOW every real tier — defaulting it to 0 handed it
  // whichever plan the admin happened to put at sortOrder 0.
  const NO_PLAN = -1
  const maxTier = memberships.reduce(
    (highest, m) => Math.max(highest, tierMap[m.organization.plan as string] ?? NO_PLAN),
    NO_PLAN,
  )

  const planKey = Object.entries(tierMap).find(([, t]) => t === maxTier)?.[0] || 'free'
  const planDef = (await getPlanDef(planKey)) ?? (await getPlanDef('free'))!
  const limit = planDef.limits.organizations

  return {
    allowed: limit === Infinity || orgCount < limit,
    current: orgCount,
    limit,
  }
}

export async function getActiveSubscription(orgId: string) {
  const customer = await prisma.billingCustomer.findUnique({
    where: { organizationId: orgId },
    include: {
      subscriptions: {
        where: {
          status: { in: ['active', 'past_due', 'on_trial', 'cancelled'] },
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!customer || customer.subscriptions.length === 0) return null

  return customer.subscriptions[0]
}

export async function getBillingInvoices(orgId: string) {
  const customer = await prisma.billingCustomer.findUnique({
    where: { organizationId: orgId },
  })

  if (!customer) return []

  return prisma.invoice.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}
