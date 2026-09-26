import { useQuery } from '@tanstack/react-query'
import { publicApi } from '@/lib/api'
import { mergePlanLimits, pricingConfig, type PlanConfig } from './config'

function usePricingPlansQuery() {
  return useQuery<PlanConfig[]>({
    queryKey: ['pricing', 'plans'],
    queryFn: async () => {
      const res = await publicApi.get<{ data: PlanConfig[] }>('/plans')
      // The API returns the limits billing actually enforces; the local config only supplies the
      // capability flags it does not send. Merging here keeps every consumer honest.
      return res.data.data.map((plan) => ({
        ...plan,
        limits: mergePlanLimits(plan.limits, plan.key),
      }))
    },
    staleTime: 10 * 60 * 1000,
  })
}

// The plan rows are the ONLY source of truth for what a plan costs and which plans exist.
// `pricingConfig.plans` is deliberately not a fallback list: on an API failure it would
// re-advertise plans an admin has deleted, at prices that no longer match what checkout
// charges. It only seeds capability flags, through mergePlanLimits.
//
// It is still used as the placeholder while the first request is in flight (same as before,
// and it beats an empty pricing section), but a failure clears it — we would rather show no
// plans than wrong ones.
export function usePricingPlanList(): { plans: PlanConfig[]; isUnavailable: boolean } {
  const query = usePricingPlansQuery()
  return {
    plans: query.isError ? [] : (query.data ?? pricingConfig.plans),
    isUnavailable: query.isError,
  }
}
