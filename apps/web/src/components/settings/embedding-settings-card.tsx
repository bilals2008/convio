import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Cpu, TriangleAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { organizations as orgsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { toast } from '@/lib/toast'
import { toastMutationError } from '@/lib/api/mutation-error'

type EmbeddingProvider = 'local' | 'openai'

const LOCAL_MODELS = [
  { value: 'all-minilm', label: 'MiniLM (default)', hint: 'Fastest, English' },
  { value: 'bge-small', label: 'BGE Small', hint: 'Better quality, English, same speed' },
  { value: 'multilingual-e5', label: 'Multilingual E5', hint: 'Urdu, Hindi, Arabic, Chinese + English' },
] as const

interface EmbeddingOrg {
  embeddingProvider?: string | null
  embeddingModel?: string | null
}

export function EmbeddingSettingsCard() {
  const { orgId } = useOrg()
  const queryClient = useQueryClient()

  const { data: orgData } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: async () => {
      const res = await orgsApi.get(orgId!)
      return (res.data.data || {}) as EmbeddingOrg
    },
    enabled: !!orgId,
  })

  const [provider, setProvider] = useState<EmbeddingProvider>('local')
  const [model, setModel] = useState('')
  const [original, setOriginal] = useState<{ provider: string; model: string }>({ provider: '', model: '' })

  useEffect(() => {
    if (!orgData) return
    const p = orgData.embeddingProvider === 'openai' ? 'openai' : 'local'
    const m = orgData.embeddingModel ?? ''
    setProvider(p)
    setModel(m)
    setOriginal({ provider: p, model: m })
  }, [orgData])

  const mutation = useMutation({
    mutationFn: (value: { embeddingProvider: EmbeddingProvider; embeddingModel: string | null }) =>
      orgsApi.update(orgId!, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', orgId] })
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Embedding settings updated')
    },
    onError: (error) => toastMutationError(error, 'Failed to update embedding settings'),
  })

  // Changing the model (not the provider) swaps the vector space, so existing
  // documents must be re-indexed or search degrades silently.
  const modelChanged = original.provider === provider && original.model !== model

  function save(nextProvider: EmbeddingProvider, nextModel: string = model) {
    mutation.mutate({
      embeddingProvider: nextProvider,
      embeddingModel: nextModel.trim() ? nextModel.trim() : null,
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Cpu className="size-4" />
          </div>
          <div className="min-w-0 space-y-1">
            <CardTitle>Embeddings</CardTitle>
            <CardDescription>
              How knowledge bases are embedded for search. All models produce compatible 384-dim
              vectors.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="embedding-provider">Embedding provider</Label>
          <Select
            value={provider}
            onValueChange={(value) => {
              const next = value as EmbeddingProvider
              setProvider(next)
              save(next, next === 'local' ? '' : model)
            }}
          >
            <SelectTrigger id="embedding-provider">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="local">Local (built-in)</SelectItem>
              <SelectItem value="openai">OpenAI</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {provider === 'openai'
              ? 'Uses your OpenAI key from Provider Keys.'
              : 'Runs on your server — no API key, downloads once.'}
          </p>
        </div>

        {provider === 'local' && (
          <div className="space-y-2">
            <Label htmlFor="embedding-model">Model</Label>
            <Select
              value={model || 'all-minilm'}
              onValueChange={(value) => {
                setModel(value === 'all-minilm' ? '' : value)
                save('local', value === 'all-minilm' ? '' : value)
              }}
            >
              <SelectTrigger id="embedding-model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCAL_MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    <span className="flex items-center gap-2">
                      {m.label}
                      <span className="text-xs text-muted-foreground">{m.hint}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {modelChanged && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/5 p-3">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
            <p className="text-xs text-muted-foreground">
              Re-index your documents after changing the model — old embeddings won't match new
              search queries.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
