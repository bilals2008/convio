const STATUS_MESSAGES: Record<number, string> = {
  400: 'Please check your input and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: "You don't have permission to perform this action.",
  404: 'The requested resource could not be found.',
  409: 'This action conflicts with the current state. Please refresh and try again.',
  422: 'The request could not be processed. Please check your input.',
  429: 'Too many requests. Please try again shortly.',
}

const DEFAULT_ERROR = 'Something went wrong on our side. Please try again later.'
const NETWORK_ERROR = 'Connection issue detected. Check your internet connection and try again.'
const TIMEOUT_ERROR = 'The request took too long. Please try again.'

export function getFriendlyErrorMessage(error: unknown): string {
  if (!error) return DEFAULT_ERROR

  const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string; code?: string }

  if (err.response?.status) {
    const status = err.response.status
    if (status !== 401 && err.response.data?.message) return err.response.data.message
    return STATUS_MESSAGES[status] || err.response.data?.message || DEFAULT_ERROR
  }

  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return TIMEOUT_ERROR
  }

  if (err.message === 'Network Error') {
    return NETWORK_ERROR
  }

  return DEFAULT_ERROR
}

interface ApiError {
  response?: { status?: number; data?: { message?: string; code?: string; error?: { message?: string } } }
  friendlyMessage?: string
  message?: string
}

// The server sends { success: false, message } for every AppError, including the plan-limit
// 402s that tell the user their actual limit. Read it straight off the response so this
// works no matter which axios instance made the call.
function serverMessage(error: unknown): string | undefined {
  const data = (error as ApiError)?.response?.data
  const message = data?.message ?? data?.error?.message
  return typeof message === 'string' && message.trim() !== '' ? message : undefined
}

/**
 * The message to show a user for a failed request. Prefers what the server actually said,
 * so a 402 like "Knowledge base limit (1) reached" reaches the user instead of a generic
 * "Something went wrong". `fallback` is only used when there is nothing usable to show.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  return serverMessage(error) ?? (error as ApiError)?.friendlyMessage ?? fallback
}

/** True when the request was refused because the org is on the plan's limit. */
export function isPlanLimitError(error: unknown): boolean {
  const response = (error as ApiError)?.response
  if (response?.status !== 402) return false
  return response.data?.code === 'PLAN_LIMIT_EXCEEDED' || Boolean(serverMessage(error))
}
