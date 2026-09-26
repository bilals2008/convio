import { describe, expect, it } from 'vitest'
import { mergeLimits, planAmounts, planDisplayPricing, toPlanLimits, withDerivedPricing } from './plans.js'

const SAVED = { priceMonthly: 39, priceYearly: 374.4, yearlyDiscountPercent: 20 }

describe('planDisplayPricing', () => {
  it('derives the display price from the charged amount', () => {
    expect(planDisplayPricing({ priceMonthly: 39, priceYearly: null })).toEqual({
      price: '$39',
      yearlyPrice: null,
    })
  })

  it('shows the per-month equivalent of the yearly amount', () => {
    expect(planDisplayPricing({ priceMonthly: 39, priceYearly: 374.4 }).yearlyPrice).toBe('$31.20')
  })

  it('keeps cents on a fractional amount', () => {
    expect(planDisplayPricing({ priceMonthly: 12.5, priceYearly: null }).price).toBe('$12.50')
  })

  it('treats a plan with no amount as custom priced', () => {
    expect(planDisplayPricing({ priceMonthly: null, priceYearly: null })).toEqual({
      price: 'Custom',
      yearlyPrice: null,
    })
  })

  it('prices a free plan at zero, not custom', () => {
    expect(planDisplayPricing({ priceMonthly: 0, priceYearly: null }).price).toBe('$0')
  })
})

describe('planAmounts', () => {
  it('always derives the yearly total from the monthly amount and the discount', () => {
    expect(planAmounts(SAVED, { priceMonthly: 50 })).toEqual({ monthly: 50, discount: 20, yearly: 480 })
  })

  it('charges the full year when the discount is cleared', () => {
    expect(planAmounts(SAVED, { yearlyDiscountPercent: 0 })).toEqual({ monthly: 39, discount: 0, yearly: 468 })
  })

  it('treats a plan that never set a discount as no discount', () => {
    const saved = { ...SAVED, yearlyDiscountPercent: null }
    expect(planAmounts(saved, { priceMonthly: 39 })).toEqual({ monthly: 39, discount: null, yearly: 468 })
  })

  it('recomputes yearly on a cosmetic patch instead of leaving it stale', () => {
    expect(planAmounts(SAVED, { active: true })).toEqual({ monthly: 39, discount: 20, yearly: 374.4 })
  })

  it('has no yearly total when there is no monthly amount', () => {
    expect(planAmounts(SAVED, { priceMonthly: null })).toEqual({ monthly: null, discount: 20, yearly: null })
  })
})

describe('withDerivedPricing', () => {
  it('overwrites any display price the caller sent so it cannot disagree with the charge', () => {
    const data = withDerivedPricing({ name: 'Pro', price: '$5', yearlyPrice: '$1', priceYearly: 1 }, {
      monthly: 39,
      discount: 20,
      yearly: 374.4,
    })
    expect(data).toMatchObject({ name: 'Pro', price: '$39', yearlyPrice: '$31.20', priceYearly: 374.4 })
  })

  it('leaves the rest of the payload untouched', () => {
    expect(withDerivedPricing({ active: false }, { monthly: 0, discount: 0, yearly: 0 })).toEqual({
      active: false,
      priceMonthly: 0,
      yearlyDiscountPercent: 0,
      priceYearly: 0,
      price: '$0',
      yearlyPrice: '$0',
    })
  })
})

describe('mergeLimits', () => {
  const SAVED_LIMITS = {
    agents: 10,
    messagesPerMonth: 25000,
    knowledgeBases: 10,
    organizations: 10,
  }

  it('leaves the limits untouched when the patch omits them', () => {
    expect(mergeLimits(SAVED_LIMITS, undefined)).toBeUndefined()
  })

  it('keeps every limit the patch does not mention', () => {
    expect(mergeLimits(SAVED_LIMITS, { agents: 25 })).toEqual({ ...SAVED_LIMITS, agents: 25 })
  })

  it('does not turn unmentioned limits into unlimited', () => {
    // The whole point: a partial patch must not wipe the other three limits.
    const merged = mergeLimits(SAVED_LIMITS, { knowledgeBases: 3 })
    expect(toPlanLimits(merged).messagesPerMonth).toBe(25000)
    expect(toPlanLimits(merged).organizations).toBe(10)
  })

  it('lets a limit be cleared to unlimited explicitly', () => {
    expect(mergeLimits(SAVED_LIMITS, { knowledgeBases: null })).toEqual({
      ...SAVED_LIMITS,
      knowledgeBases: null,
    })
    expect(toPlanLimits(mergeLimits(SAVED_LIMITS, { knowledgeBases: null })).knowledgeBases).toBe(Infinity)
  })
})
