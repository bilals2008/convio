import { toast } from '@/lib/toast'
import { apiErrorMessage, isPlanLimitError } from './errors'

/**
 * Report a failed mutation to the user.
 *
 * The common bug this replaces is `onError: () => toast.error('Failed to create X')`: the
 * server had already said exactly what went wrong — including a plan-limit 402 that names
 * the limit, the current usage, and the fix — and the UI threw it away. A user who hits a
 * limit should never be told only that "something failed".
 *
 * A plan-limit error additionally gets an Upgrade action, because that is the one failure
 * the user can only resolve by changing their plan. Pass `onUpgrade` when the caller has a
 * router `navigate`, so the upgrade link stays a client-side navigation.
 */
export function toastMutationError(error: unknown, fallback: string, onUpgrade?: () => void): void {
  const message = apiErrorMessage(error, fallback)

  if (!isPlanLimitError(error)) {
    toast.error(message)
    return
  }

  toast.error(message, {
    duration: 8000,
    action: {
      label: 'Upgrade',
      onClick: onUpgrade ?? (() => { window.location.href = '/settings/billing' }),
    },
  })
}
