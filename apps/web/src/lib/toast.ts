import { toast as sonnerToast, type ExternalToast } from 'sonner'

type ToastMessage = string | (() => string)

function normalize(msg: ToastMessage): string {
  return typeof msg === 'function' ? msg() : msg
}

export const toast = {
  success: (msg: ToastMessage, options?: ExternalToast) => sonnerToast.success(normalize(msg), options),
  error: (msg: ToastMessage, options?: ExternalToast) => sonnerToast.error(normalize(msg), options),
  warning: (msg: ToastMessage, options?: ExternalToast) => sonnerToast.warning(normalize(msg), options),
  info: (msg: ToastMessage, options?: ExternalToast) => sonnerToast.info(normalize(msg), options),
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) => sonnerToast.promise(promise, messages),
}
